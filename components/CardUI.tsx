
import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType } from '../types';

interface CardUIProps {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onSpark: () => void;
  sparkLoading: boolean;
  sparkText: string | null;
}

const CardUI: React.FC<CardUIProps> = ({ card, isFlipped, onFlip, onNext, onSpark, sparkLoading, sparkText }) => {
  return (
    <div className="w-full max-w-sm aspect-[3/4] mx-auto perspective-1000">
      <motion.div 
        className="relative w-full h-full cursor-pointer preserve-3d shadow-2xl"
        onClick={() => !isFlipped && onFlip()}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        
        {/* Front Face (Before Flip) */}
        <div className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center victorian-border bg-[url('/src/assets/images/light_quirky_card_back_1782337809792.jpg')] bg-cover bg-center text-[#1A231C]`}>
          <div className="absolute inset-0 bg-[#FDFBF7]/30 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7]/90 to-transparent"></div>
          
          <div className="relative z-10 text-center px-6">
            <div className="text-4xl mb-6 text-[#6B7F62] drop-shadow-sm">✧</div>
            <h2 className="text-3xl font-decorative text-center uppercase tracking-[0.2em] mb-4 text-[#1A231C] drop-shadow-sm leading-tight">
              {card.category}
            </h2>
            <div className="w-12 h-[1px] bg-[#1A231C]/30 mx-auto mb-6"></div>
            <p className="text-sm tracking-widest opacity-80 font-serif italic uppercase text-[#3A453C]">Tap to unveil</p>
          </div>
        </div>

        {/* Back Face (The Question) */}
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-between victorian-border p-4 md:p-6 bg-[#FDFBF7] text-[#1A231C] overflow-y-auto" style={{ transform: 'rotateY(180deg)' }}>
          {/* Subtle floral watermark */}
          <div className="absolute inset-0 bg-[url('/src/assets/images/light_quirky_card_back_1782337809792.jpg')] bg-cover bg-center opacity-10 pointer-events-none mix-blend-multiply"></div>
          
          <div className="w-full relative z-10 flex flex-col items-center">
             <div className={`inline-block px-4 py-1 text-[10px] font-bold uppercase tracking-[0.3em] mb-8 victorian-border text-[#1A231C] bg-[#F5F0E6]/80 backdrop-blur-sm`}>
                {card.category}
             </div>
             
             <div className="text-center relative">
                 <span className="text-4xl text-[#6B7F62]/40 font-serif absolute -top-6 -left-4">"</span>
                 <p className="text-xl md:text-2xl font-serif text-center leading-relaxed mt-2 text-[#1A231C] drop-shadow-sm px-2">
                   {card.text}
                 </p>
                 <span className="text-4xl text-[#6B7F62]/40 font-serif absolute -bottom-8 -right-4">"</span>
             </div>
          </div>

          <div className="w-full space-y-4 mt-8 relative z-10">
            {sparkText && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="p-5 victorian-border bg-[#F5F0E6]/90 backdrop-blur-md"
               >
                  <p className="text-[10px] font-bold text-[#6B7F62] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <span className="text-sm">✧</span> Scry Deeper
                  </p>
                  <p className="text-sm font-serif italic leading-relaxed text-[#3A453C]">{sparkText}</p>
               </motion.div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onSpark(); }}
                disabled={sparkLoading}
                className="flex-1 py-3 px-4 bg-[#F5F0E6] hover:bg-[#E8E1CD] victorian-border text-[#1A231C] transition-all flex items-center justify-center gap-2 disabled:opacity-50 tracking-[0.2em] uppercase text-[10px] font-bold"
              >
                {sparkLoading ? (
                  <div className="w-4 h-4 border-2 border-[#6B7F62] border-t-transparent rounded-full animate-spin" />
                ) : 'Scry ✧'}
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="flex-1 py-3 px-4 bg-[#6B7F62] hover:bg-[#56684F] text-[#FDFBF7] victorian-border transition-all text-[10px] uppercase font-bold tracking-[0.2em] shadow-md"
              >
                Continue →
              </button>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default CardUI;
