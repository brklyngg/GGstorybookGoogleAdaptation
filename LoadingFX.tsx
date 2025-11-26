/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

const LOADING_FX = ["Sparkle!", "Magic!", "Twinkle!", "Poof!", "Dream!", "Imagine...", "Drawing...", "Painting..."];

export const LoadingFX: React.FC = () => {
    const [particles, setParticles] = useState<{id: number, text: string, x: string, y: string, scale: number, color: string}[]>([]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            const id = Date.now();
            const text = LOADING_FX[Math.floor(Math.random() * LOADING_FX.length)];
            const x = `${15 + Math.random() * 70}%`;
            const y = `${15 + Math.random() * 70}%`;
            const scale = 0.8 + Math.random() * 0.5;
            const colors = ['text-pink-400', 'text-yellow-400', 'text-blue-400', 'text-purple-400', 'text-green-400'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            setParticles(prev => [...prev, { id, text, x, y, scale, color }].slice(-5));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-[#fffaf0] overflow-hidden relative border-r border-stone-200">
            <style>{`
              @keyframes float-up {
                  0% { transform: translate(-50%, -50%) scale(0.5) translateY(20px); opacity: 0; }
                  30% { transform: translate(-50%, -50%) scale(var(--scale)) translateY(0px); opacity: 1; }
                  100% { transform: translate(-50%, -50%) scale(calc(var(--scale) * 1.2)) translateY(-40px); opacity: 0; }
              }
            `}</style>
            
            {/* Soft decorative circles */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-100 rounded-full blur-3xl opacity-60"></div>
            
            {particles.map(p => (
                <div key={p.id} 
                     className={`absolute font-title text-3xl md:text-5xl font-bold ${p.color} select-none whitespace-nowrap z-10`}
                     style={{ left: p.x, top: p.y, '--scale': p.scale, animation: 'float-up 2.5s forwards ease-out', textShadow: '2px 2px 0px white' } as React.CSSProperties}>
                    {p.text}
                </div>
            ))}
            <div className="absolute bottom-1/3 inset-x-0 text-center">
                <p className="font-story text-2xl text-stone-500 animate-pulse tracking-widest">Painting the story...</p>
            </div>
        </div>
    );
};