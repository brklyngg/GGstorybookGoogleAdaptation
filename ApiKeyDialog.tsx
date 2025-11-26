/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 animate-in fade-in zoom-in duration-300 border-4 border-yellow-200">
        
        {/* Floating Icon Badge */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-300 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
           <span className="text-4xl">✨</span>
        </div>

        <div className="mt-8 text-center">
            <h2 className="font-title text-3xl text-purple-600 mb-2">
              Unlock the Magic!
            </h2>
            <p className="font-story text-xl text-stone-600 mb-6">
              To create these magical stories, we need a special key for the story engine.
            </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-5 mb-6 text-left border border-blue-100">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👨‍👩‍👧‍👦</span>
                <span className="font-title text-sm uppercase text-blue-800 tracking-wider">For Parents & Guardians</span>
             </div>
             <p className="font-sans text-sm text-stone-600 leading-relaxed">
                This app uses <strong>Gemini 3 Pro</strong> to generate high-quality children's book illustrations. This model requires a billing-enabled Google Cloud project.
                <br/><br/>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-800 font-bold">Read the Billing Documentation &rarr;</a>
             </p>
        </div>

        <button 
          onClick={onContinue}
          className="comic-btn bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl px-8 py-4 w-full hover:brightness-110 transition-transform active:scale-95 shadow-lg"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
};