/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import jsPDF from 'jspdf';
import { MAX_STORY_PAGES, BACK_COVER_PAGE, TOTAL_PAGES, INITIAL_PAGES, BATCH_SIZE, DECISION_PAGES, GENRES, TONES, LANGUAGES, ComicFace, Beat, Persona } from './types';
import { Setup } from './Setup';
import { Book } from './Book';
import { useApiKey } from './useApiKey';
import { ApiKeyDialog } from './ApiKeyDialog';

// --- Constants ---
const MODEL_V3 = "gemini-3-pro-image-preview";
const MODEL_IMAGE_GEN_NAME = MODEL_V3;
const MODEL_TEXT_NAME = MODEL_V3;

const App: React.FC = () => {
  // --- API Key Hook ---
  const { validateApiKey, setShowApiKeyDialog, showApiKeyDialog, handleApiKeyDialogContinue } = useApiKey();

  const [hero, setHeroState] = useState<Persona | null>(null);
  const [friend, setFriendState] = useState<Persona | null>(null);
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].code);
  const [customPremise, setCustomPremise] = useState("");
  const [storyTone, setStoryTone] = useState(TONES[0]);
  const [richMode, setRichMode] = useState(false); // Used as "Longer/Richer" toggle
  
  const heroRef = useRef<Persona | null>(null);
  const friendRef = useRef<Persona | null>(null);

  const setHero = (p: Persona | null) => { setHeroState(p); heroRef.current = p; };
  const setFriend = (p: Persona | null) => { setFriendState(p); friendRef.current = p; };
  
  const [comicFaces, setComicFaces] = useState<ComicFace[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  
  // --- Transition States ---
  const [showSetup, setShowSetup] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const generatingPages = useRef(new Set<number>());
  const historyRef = useRef<ComicFace[]>([]);

  // --- AI Helpers ---
  const getAI = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  };

  const handleAPIError = (e: any) => {
    const msg = String(e);
    console.error("API Error:", msg);
    if (
      msg.includes('Requested entity was not found') || 
      msg.includes('API_KEY_INVALID') || 
      msg.toLowerCase().includes('permission denied')
    ) {
      setShowApiKeyDialog(true);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateBeat = async (history: ComicFace[], isRightPage: boolean, pageNum: number, isDecisionPage: boolean): Promise<Beat> => {
    if (!heroRef.current) throw new Error("No Hero");

    const isFinalPage = pageNum === MAX_STORY_PAGES;
    const langName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || "English";

    // Get relevant history
    const relevantHistory = history
        .filter(p => p.type === 'story' && p.narrative && (p.pageIndex || 0) < pageNum)
        .sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));

    const historyText = relevantHistory.map(p => 
      `[Page ${p.pageIndex}] (Text: "${p.narrative?.caption || ''}") (Scene: ${p.narrative?.scene}) ${p.resolvedChoice ? `-> CHILD CHOSE: "${p.resolvedChoice}"` : ''}`
    ).join('\n');

    // Friends logic
    let friendInstruction = "No secondary character.";
    if (friendRef.current) {
        friendInstruction = "Sidekick/Friend is ACTIVE. Include them in the scene and story.";
    }

    // Story Driver
    let coreDriver = `THEME: ${selectedGenre}. TONE: ${storyTone}.`;
    if (selectedGenre === 'Custom') {
        coreDriver = `STORY PREMISE: ${customPremise}.`;
    }
    
    // Tone adjustments
    let toneInstruction = "Simple, clear sentences suitable for a 5-year-old.";
    if (storyTone.includes("RHYMING")) {
        toneInstruction = "MUST BE A RHYMING POEM (AABB or ABCB structure). whimsical and melodic.";
    } else if (storyTone.includes("SILLY")) {
        toneInstruction = "Funny, goofy, use silly words and situations.";
    }

    // Length control
    const lenLimit = richMode ? "3-4 sentences, descriptive" : "1-2 simple sentences";

    const prompt = `
You are a world-class children's book author writing a story for kids (age 3-8).
PAGE ${pageNum} of ${MAX_STORY_PAGES}.
TARGET LANGUAGE: ${langName}.
${coreDriver}

CHARACTERS:
- HERO: Main child.
- FRIEND: ${friendInstruction}

PREVIOUS STORY:
${historyText.length > 0 ? historyText : "Start of the story."}

INSTRUCTIONS:
1. Write the story text for THIS page. ${toneInstruction} Length: ${lenLimit}.
2. Describe the visual scene for the illustrator.
3. ${isDecisionPage ? "Provide 2 simple, distinct options for what happens next." : "No choices needed."}
4. ${isFinalPage ? "Wrap up the story with a warm, happy ending." : "Move the story forward."}

OUTPUT JSON ONLY:
{
  "caption": "The story text for this page in ${langName}",
  "scene": "Visual description of the scene. Mention 'HERO' and 'FRIEND' if present. Colorful, soft lighting, detailed.",
  "choices": ["Option A", "Option B"] (Only if decision page),
  "focus_char": "hero" 
}
`;
    try {
        const ai = getAI();
        const res = await ai.models.generateContent({ model: MODEL_TEXT_NAME, contents: prompt, config: { responseMimeType: 'application/json' } });
        let rawText = res.text || "{}";
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const parsed = JSON.parse(rawText);
        
        if (!isDecisionPage) parsed.choices = [];
        if (isDecisionPage && !isFinalPage && (!parsed.choices || parsed.choices.length < 2)) parsed.choices = ["Go Left", "Go Right"];
        parsed.focus_char = 'hero'; // Default focus for image gen

        return parsed as Beat;
    } catch (e) {
        console.error("Beat generation failed", e);
        handleAPIError(e);
        return { 
            caption: "Once upon a time...", 
            scene: `A beautiful scene for page ${pageNum}.`, 
            focus_char: 'hero', 
            choices: [] 
        };
    }
  };

  const generateImage = async (beat: Beat, type: ComicFace['type']): Promise<string> => {
    const contents = [];
    if (heroRef.current?.base64) {
        contents.push({ text: "REFERENCE 1 [HERO] (Keep character consistent):" });
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: heroRef.current.base64 } });
    }
    if (friendRef.current?.base64) {
        contents.push({ text: "REFERENCE 2 [FRIEND] (Keep character consistent):" });
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: friendRef.current.base64 } });
    }

    // Children's Book Art Style Prompting
    let artStyle = "Children's Book Illustration. High quality, soft lighting, vibrant colors, painterly or 3D render style (Pixar-esque). detailed background.";
    if (selectedGenre.includes("Fairy Tale")) artStyle += " Watercolor style, magical sparkles, whimsical.";
    if (selectedGenre.includes("Space")) artStyle += " Digital art, bright neons, soft glow.";
    
    let promptText = `STYLE: ${artStyle} `;
    
    if (type === 'cover') {
        const langName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || "English";
        promptText += `TYPE: Storybook Cover. NO TEXT. Main visual: Magical portrait of [HERO] (Reference 1) starting an adventure.`;
    } else if (type === 'back_cover') {
        promptText += `TYPE: Storybook Back Cover. A cozy closing scene. Perhaps the hero sleeping or walking into sunset.`;
    } else {
        promptText += `SCENE: ${beat.scene}. `;
        promptText += `INSTRUCTIONS: Maintain strict character likeness. [HERO] must look like Reference 1. [FRIEND] must look like Reference 2. NO TEXT IN IMAGE. Full page illustration.`;
    }

    contents.push({ text: promptText });

    try {
        const ai = getAI();
        const res = await ai.models.generateContent({
          model: MODEL_IMAGE_GEN_NAME,
          contents: contents,
          config: { imageConfig: { aspectRatio: '3:4' } } // 3:4 is better for storybook pages
        });
        const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return part?.inlineData?.data ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : '';
    } catch (e) { 
        handleAPIError(e);
        return ''; 
    }
  };

  const updateFaceState = (id: string, updates: Partial<ComicFace>) => {
      setComicFaces(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
      const idx = historyRef.current.findIndex(f => f.id === id);
      if (idx !== -1) historyRef.current[idx] = { ...historyRef.current[idx], ...updates };
  };

  const generateSinglePage = async (faceId: string, pageNum: number, type: ComicFace['type']) => {
      const isDecision = DECISION_PAGES.includes(pageNum);
      let beat: Beat = { scene: "", choices: [], focus_char: 'hero' };

      if (type === 'cover') {
           // Cover
      } else if (type === 'back_cover') {
           beat = { scene: "The End.", choices: [], focus_char: 'hero' };
      } else {
           beat = await generateBeat(historyRef.current, pageNum % 2 === 0, pageNum, isDecision);
      }

      updateFaceState(faceId, { narrative: beat, choices: beat.choices, isDecisionPage: isDecision });
      const url = await generateImage(beat, type);
      updateFaceState(faceId, { imageUrl: url, isLoading: false });
  };

  const generateBatch = async (startPage: number, count: number) => {
      const pagesToGen: number[] = [];
      for (let i = 0; i < count; i++) {
          const p = startPage + i;
          if (p <= TOTAL_PAGES && !generatingPages.current.has(p)) {
              pagesToGen.push(p);
          }
      }
      
      if (pagesToGen.length === 0) return;
      pagesToGen.forEach(p => generatingPages.current.add(p));

      const newFaces: ComicFace[] = [];
      pagesToGen.forEach(pageNum => {
          const type = pageNum === BACK_COVER_PAGE ? 'back_cover' : 'story';
          newFaces.push({ id: `page-${pageNum}`, type, choices: [], isLoading: true, pageIndex: pageNum });
      });

      setComicFaces(prev => {
          const existing = new Set(prev.map(f => f.id));
          return [...prev, ...newFaces.filter(f => !existing.has(f.id))];
      });
      newFaces.forEach(f => { if (!historyRef.current.find(h => h.id === f.id)) historyRef.current.push(f); });

      try {
          // Parallel generation for speed, but story beats must be sequential?
          // Actually, beats need to be sequential for context, images can be parallel.
          // We will generate beats sequentially, then kick off images.
          
          for (const pageNum of pagesToGen) {
               // We need the beat first
               const isDecision = DECISION_PAGES.includes(pageNum);
               const type = pageNum === BACK_COVER_PAGE ? 'back_cover' : 'story';
               
               // Generate Beat
               let beat: Beat;
               if (type === 'story') {
                 beat = await generateBeat(historyRef.current, pageNum % 2 === 0, pageNum, isDecision);
               } else {
                 beat = { scene: "End of book", choices: [], focus_char: 'hero' };
               }
               
               // Update state with beat
               updateFaceState(`page-${pageNum}`, { narrative: beat, choices: beat.choices, isDecisionPage: isDecision });
               
               // Trigger Image Gen in background (don't await strictly if we want to pipeline, but simpler to await for now to avoid consistency issues)
               const url = await generateImage(beat, type);
               updateFaceState(`page-${pageNum}`, { imageUrl: url, isLoading: false });
               generatingPages.current.delete(pageNum);
          }
      } catch (e) {
          console.error("Batch generation error", e);
      }
  }

  const launchStory = async () => {
    // --- API KEY VALIDATION ---
    const hasKey = await validateApiKey();
    if (!hasKey) return; 
    
    if (!heroRef.current) return;
    if (selectedGenre === 'Custom' && !customPremise.trim()) {
        alert("Please describe your story idea.");
        return;
    }
    setIsTransitioning(true);
    
    // Pick random tone if default? No, user didn't select tone explicitly in UI, 
    // we can randomize or infer from Genre.
    if (selectedGenre.includes("Bedtime")) setStoryTone("GENTLE & CALMING");
    else if (selectedGenre.includes("Animals")) setStoryTone("RHYMING");
    else setStoryTone(TONES[Math.floor(Math.random() * TONES.length)]);

    const coverFace: ComicFace = { id: 'cover', type: 'cover', choices: [], isLoading: true, pageIndex: 0 };
    setComicFaces([coverFace]);
    historyRef.current = [coverFace];
    generatingPages.current.add(0);

    generateSinglePage('cover', 0, 'cover').finally(() => generatingPages.current.delete(0));
    
    setTimeout(async () => {
        setIsStarted(true);
        setShowSetup(false);
        setIsTransitioning(false);
        // Start generating pages 1 & 2
        await generateBatch(1, 2);
    }, 1500);
  };

  const handleChoice = async (pageIndex: number, choice: string) => {
      updateFaceState(`page-${pageIndex}`, { resolvedChoice: choice });
      const maxPage = Math.max(...historyRef.current.map(f => f.pageIndex || 0));
      if (maxPage + 1 <= TOTAL_PAGES) {
          generateBatch(maxPage + 1, BATCH_SIZE);
      }
  }

  const resetApp = () => {
      setIsStarted(false);
      setShowSetup(true);
      setComicFaces([]);
      setCurrentSheetIndex(0);
      historyRef.current = [];
      generatingPages.current.clear();
      setHero(null);
      setFriend(null);
  };

  const downloadPDF = () => {
    const PAGE_WIDTH = 600;
    const PAGE_HEIGHT = 800;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [PAGE_WIDTH, PAGE_HEIGHT] });
    const pagesToPrint = comicFaces.filter(face => face.imageUrl && !face.isLoading).sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));

    pagesToPrint.forEach((face, index) => {
        if (index > 0) doc.addPage([PAGE_WIDTH, PAGE_HEIGHT], 'portrait');
        
        // Add Image
        if (face.imageUrl) doc.addImage(face.imageUrl, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
        
        // Add Text Overlay for PDF
        if (face.narrative?.caption && face.type === 'story') {
            doc.setFillColor(255, 255, 255);
            doc.setGState(new (doc as any).GState({ opacity: 0.9 }));
            doc.roundedRect(40, PAGE_HEIGHT - 160, PAGE_WIDTH - 80, 120, 10, 10, 'F');
            doc.setGState(new (doc as any).GState({ opacity: 1 }));
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            
            const splitText = doc.splitTextToSize(face.narrative.caption, PAGE_WIDTH - 100);
            doc.text(splitText, PAGE_WIDTH / 2, PAGE_HEIGHT - 100, { align: "center" });
        }
    });
    doc.save('My-Magic-Storybook.pdf');
  };

  const handleHeroUpload = async (file: File) => {
       try { const base64 = await fileToBase64(file); setHero({ base64, desc: "The Hero" }); } catch (e) { alert("Hero upload failed"); }
  };
  const handleFriendUpload = async (file: File) => {
       try { const base64 = await fileToBase64(file); setFriend({ base64, desc: "The Friend" }); } catch (e) { alert("Friend upload failed"); }
  };

  const handleSheetClick = (index: number) => {
      if (!isStarted) return;
      if (index === 0 && currentSheetIndex === 0) return;
      
      // Allow flipping back and forth
      if (index < currentSheetIndex) setCurrentSheetIndex(index);
      else if (index === currentSheetIndex && comicFaces.find(f => f.pageIndex === index)?.imageUrl) setCurrentSheetIndex(prev => prev + 1);
  };

  return (
    <div className="comic-scene">
      {showApiKeyDialog && <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />}
      
      <Setup 
          show={showSetup}
          isTransitioning={isTransitioning}
          hero={hero}
          friend={friend}
          selectedGenre={selectedGenre}
          selectedLanguage={selectedLanguage}
          customPremise={customPremise}
          richMode={richMode}
          onHeroUpload={handleHeroUpload}
          onFriendUpload={handleFriendUpload}
          onGenreChange={setSelectedGenre}
          onLanguageChange={setSelectedLanguage}
          onPremiseChange={setCustomPremise}
          onRichModeChange={setRichMode}
          onLaunch={launchStory}
      />
      
      <Book 
          comicFaces={comicFaces}
          currentSheetIndex={currentSheetIndex}
          isStarted={isStarted}
          isSetupVisible={showSetup && !isTransitioning}
          onSheetClick={handleSheetClick}
          onChoice={handleChoice}
          onOpenBook={() => setCurrentSheetIndex(1)}
          onDownload={downloadPDF}
          onReset={resetApp}
      />
    </div>
  );
};

export default App;