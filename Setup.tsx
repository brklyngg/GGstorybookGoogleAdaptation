/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { GENRES, LANGUAGES, Persona, TONES } from './types';

interface SetupProps {
    show: boolean;
    isTransitioning: boolean;
    hero: Persona | null;
    friend: Persona | null;
    selectedGenre: string;
    selectedLanguage: string;
    customPremise: string;
    richMode: boolean; // Reused as "Rhyming Mode" or generally richer text
    onHeroUpload: (file: File) => void;
    onFriendUpload: (file: File) => void;
    onGenreChange: (val: string) => void;
    onLanguageChange: (val: string) => void;
    onPremiseChange: (val: string) => void;
    onRichModeChange: (val: boolean) => void;
    onLaunch: () => void;
}

const Footer = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center z-[300] pointer-events-none">
        <div className="bg-white/90 backdrop-blur rounded-full px-6 py-2 shadow-lg flex items-center gap-4 border border-stone-200 pointer-events-auto">
             <span className="text-stone-500 text-sm font-title">Made with Gemini</span>
             <a href="https://x.com/ammaar" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-700 font-title text-sm">by @ammaar</a>
        </div>
    </div>
  );
};

export const Setup: React.FC<SetupProps> = (props) => {
    // Local state for Tone selection since it was moved out of App state in previous version, 
    // but useful to show here visually or just pick randomly. 
    // For simplicity, we stick to the props provided.
    
    if (!props.show && !props.isTransitioning) return null;

    return (
        <>
        <style>{`
             @keyframes page-turn-exit {
                0% { transform: translateX(0) rotateY(0); }
                100% { transform: translateX(-150%) rotateY(-180deg); opacity: 0; }
             }
          `}</style>
        
        <div className={`fixed inset-0 z-[200] overflow-y-auto bg-[#f0f4f8]`}
             style={{
                 animation: props.isTransitioning ? 'page-turn-exit 1.2s forwards cubic-bezier(.6,-0.28,.74,.05)' : 'none',
                 transformOrigin: 'left center',
                 pointerEvents: props.isTransitioning ? 'none' : 'auto'
             }}>
          
          {/* Background decoration */}
          <div className="fixed top-0 left-0 w-64 h-64 bg-yellow-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"></div>
          <div className="fixed bottom-0 right-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 opacity-50 pointer-events-none"></div>

          <div className="min-h-full flex flex-col items-center justify-center p-4 pb-24">
            
            <div className="text-center mb-8 relative">
                 <div className="inline-block relative">
                    <h1 className="font-title text-5xl md:text-7xl text-purple-600 mb-2 drop-shadow-sm">Magic Storybook</h1>
                    <span className="absolute -top-6 -right-8 text-4xl animate-bounce">✨</span>
                 </div>
                 <p className="font-story text-xl md:text-2xl text-stone-600">Create a personalized tale for your little one!</p>
            </div>

            <div className="max-w-[1000px] w-full bg-white rounded-[2rem] shadow-xl p-6 md:p-8 border-4 border-white ring-1 ring-stone-100 flex flex-col md:flex-row gap-8">
                
                {/* Left: The Star */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold font-title">1</span>
                        <h2 className="font-title text-2xl text-stone-800">Who is the Hero?</h2>
                    </div>
                    
                    {/* HERO UPLOAD */}
                    <div className={`aspect-[4/3] rounded-2xl border-4 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all ${props.hero ? 'border-green-400 bg-green-50' : 'border-blue-200 bg-blue-50 hover:bg-blue-100'}`}>
                        {props.hero ? (
                            <>
                                <img src={`data:image/jpeg;base64,${props.hero.base64}`} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                <div className="z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm mb-2">
                                    <span className="text-green-600 font-bold font-title">✓ Ready to adventure!</span>
                                </div>
                                <label className="z-10 cursor-pointer bg-white text-stone-800 px-4 py-2 rounded-full font-title text-sm hover:scale-105 transition-transform shadow-sm">
                                    Change Hero
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onHeroUpload(e.target.files[0])} />
                                </label>
                            </>
                        ) : (
                            <label className="cursor-pointer flex flex-col items-center p-6 w-full h-full justify-center">
                                <span className="text-4xl mb-2">📸</span>
                                <span className="font-title text-lg text-blue-600">Upload Child's Photo</span>
                                <span className="font-story text-sm text-stone-500 text-center mt-2">Best results with a clear face!</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onHeroUpload(e.target.files[0])} />
                            </label>
                        )}
                    </div>

                    {/* CO-STAR */}
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                         <div className="flex justify-between items-center mb-2">
                            <span className="font-title text-purple-800">Add a Friend? (Optional)</span>
                            {props.friend && <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-bold">ADDED</span>}
                         </div>
                         <label className="cursor-pointer flex items-center gap-3 hover:opacity-80 transition-opacity">
                             <div className="w-12 h-12 bg-white rounded-full border-2 border-purple-200 flex items-center justify-center overflow-hidden shrink-0">
                                 {props.friend ? (
                                     <img src={`data:image/jpeg;base64,${props.friend.base64}`} className="w-full h-full object-cover" />
                                 ) : (
                                     <span className="text-xl">🐾</span>
                                 )}
                             </div>
                             <div className="flex-1">
                                 <span className="font-story text-sm text-purple-700 block">Upload a pet, sibling, or toy</span>
                             </div>
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onFriendUpload(e.target.files[0])} />
                         </label>
                    </div>
                </div>

                {/* Right: The Adventure */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold font-title">2</span>
                        <h2 className="font-title text-2xl text-stone-800">Choose the Story</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block font-title text-stone-600 mb-2 ml-1">Theme</label>
                            <div className="grid grid-cols-2 gap-2">
                                {GENRES.slice(0, 4).map(g => (
                                    <button key={g} onClick={() => props.onGenreChange(g)}
                                        className={`p-3 rounded-xl text-left text-sm font-bold transition-all border-2 ${props.selectedGenre === g ? 'border-pink-400 bg-pink-50 text-pink-700' : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-pink-200'}`}>
                                        {g}
                                    </button>
                                ))}
                            </div>
                            <select value={props.selectedGenre} onChange={(e) => props.onGenreChange(e.target.value)} 
                                className="w-full mt-2 p-3 rounded-xl border-2 border-stone-100 bg-white font-story text-lg focus:border-pink-400 focus:outline-none">
                                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        {props.selectedGenre === 'Custom' && (
                            <textarea 
                                value={props.customPremise} 
                                onChange={(e) => props.onPremiseChange(e.target.value)} 
                                placeholder="E.g. A magical unicorn who loves to bake cookies..." 
                                className="w-full p-3 rounded-xl border-2 border-stone-200 font-story text-lg h-24 focus:border-pink-400 focus:outline-none resize-none" 
                            />
                        )}

                        <div className="flex gap-4">
                             <div className="flex-1">
                                <label className="block font-title text-stone-600 mb-2 ml-1">Language</label>
                                <select value={props.selectedLanguage} onChange={(e) => props.onLanguageChange(e.target.value)} className="w-full p-3 rounded-xl border-2 border-stone-100 bg-white font-story text-lg">
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                </select>
                             </div>
                        </div>

                        {/* Replacing Rich Mode with "Rhyming Mode" visual toggle for kids app context (even if mapped to same boolean) */}
                         <div onClick={() => props.onRichModeChange(!props.richMode)} 
                              className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${props.richMode ? 'border-yellow-400 bg-yellow-50' : 'border-stone-100'}`}>
                              <span className="text-2xl">{props.richMode ? '📝' : '🗣️'}</span>
                              <div className="flex-1">
                                  <p className={`font-title ${props.richMode ? 'text-yellow-700' : 'text-stone-500'}`}>Longer Story</p>
                                  <p className="text-xs text-stone-400">More details and descriptions</p>
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 ${props.richMode ? 'bg-yellow-400 border-yellow-400' : 'border-stone-300'}`}></div>
                         </div>
                    </div>

                    <button onClick={props.onLaunch} disabled={!props.hero || props.isTransitioning} 
                        className="mt-auto comic-btn bg-gradient-to-r from-pink-500 to-purple-600 text-white text-2xl py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {props.isTransitioning ? 'Opening Book...' : 'Make My Story!'}
                    </button>
                </div>
            </div>
            
            <p className="mt-6 text-stone-400 text-xs text-center max-w-md mx-auto">
                AI can make mistakes. Please review the story as you read it to your child. 
                Images are generated creatively and may vary.
            </p>

          </div>
        </div>

        <Footer />
        </>
    );
}