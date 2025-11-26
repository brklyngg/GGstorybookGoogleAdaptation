/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ComicFace, INITIAL_PAGES, GATE_PAGE } from './types';
import { LoadingFX } from './LoadingFX';

interface PanelProps {
    face?: ComicFace;
    allFaces: ComicFace[];
    onChoice: (pageIndex: number, choice: string) => void;
    onOpenBook: () => void;
    onDownload: () => void;
    onReset: () => void;
}

export const Panel: React.FC<PanelProps> = ({ face, allFaces, onChoice, onOpenBook, onDownload, onReset }) => {
    if (!face) return <div className="w-full h-full bg-[#fdfdfd]" />;
    if (face.isLoading && !face.imageUrl) return <LoadingFX />;
    
    // For storybooks, we treat everything as full bleed or nice border.
    // Cover is distinct.
    const isCover = face.type === 'cover';
    const isBackCover = face.type === 'back_cover';

    return (
        <div className={`panel-container relative group h-full w-full overflow-hidden ${isCover ? 'bg-[#2a2a2a]' : 'bg-white'}`}>
            
            {/* Gloss Overlay */}
            <div className="gloss absolute inset-0 z-30 pointer-events-none opacity-40 mix-blend-soft-light bg-gradient-to-tr from-transparent via-white to-transparent"></div>

            {/* Main Image */}
            {face.imageUrl && (
                <img src={face.imageUrl} alt="Story illustration" className="w-full h-full object-cover" />
            )}
            
            {/* Story Text Overlay - Bottom Card Style */}
            {face.type === 'story' && face.narrative?.caption && (
                <div className="absolute bottom-6 inset-x-6 z-20">
                    <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50">
                        <p className="font-story text-xl md:text-2xl text-stone-800 leading-relaxed text-center">
                            {face.narrative.caption}
                        </p>
                    </div>
                </div>
            )}

            {/* Back Cover - The End Overlay */}
            {isBackCover && (
                <div className="absolute top-[20%] inset-x-0 z-20 flex justify-center pointer-events-none">
                     <div className="bg-white/80 backdrop-blur-md px-12 py-6 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] border-4 border-white transform -rotate-2">
                        <h1 className="font-story text-6xl text-purple-600 font-bold tracking-wider drop-shadow-sm">
                            The End!
                        </h1>
                     </div>
                </div>
            )}

            {/* Decision Buttons - Integrated nicely */}
            {face.isDecisionPage && face.choices.length > 0 && (
                <div className={`absolute top-0 inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${face.resolvedChoice ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
                         <span className="text-4xl mb-4 block">🤔</span>
                         <h3 className="font-title text-2xl text-purple-600 mb-6">What happens next?</h3>
                         <div className="flex flex-col gap-3">
                            {face.choices.map((choice, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); if(face.pageIndex) onChoice(face.pageIndex, choice); }}
                                className={`font-title text-lg py-4 px-6 rounded-xl border-b-4 active:border-b-0 active:translate-y-1 transition-all
                                    ${i===0 ? 'bg-yellow-400 border-yellow-600 text-yellow-900 hover:bg-yellow-300' : 'bg-pink-400 border-pink-600 text-white hover:bg-pink-300'}`}>
                                    {choice}
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
            )}

            {/* Cover Action */}
            {isCover && (
                 <div className="absolute bottom-12 inset-x-0 flex justify-center z-40">
                     <button onClick={(e) => { e.stopPropagation(); onOpenBook(); }}
                      disabled={!allFaces.find(f => f.pageIndex === GATE_PAGE)?.imageUrl}
                      className="comic-btn bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-10 py-4 text-2xl md:text-3xl font-title rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:scale-105 animate-bounce disabled:animate-none disabled:opacity-80 disabled:cursor-wait border-4 border-white">
                         {(!allFaces.find(f => f.pageIndex === GATE_PAGE)?.imageUrl) ? `Drawing...` : 'Read Story!'}
                     </button>
                 </div>
            )}

            {/* Back Cover Actions */}
            {isBackCover && (
                <div className="absolute bottom-12 inset-x-6 flex flex-col gap-3 z-40">
                    <button onClick={(e) => { e.stopPropagation(); onDownload(); }} 
                        className="comic-btn bg-white text-blue-600 px-6 py-4 text-xl font-title rounded-2xl shadow-lg hover:scale-105">
                        📥 Download PDF
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onReset(); }} 
                        className="comic-btn bg-purple-600 text-white px-6 py-4 text-xl font-title rounded-2xl shadow-lg hover:scale-105">
                        🔄 Make Another Story
                    </button>
                </div>
            )}
        </div>
    );
}