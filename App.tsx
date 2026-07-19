
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryType, Card, GameState } from './types';
import { CATEGORIES, RAW_CARDS } from './constants';
import CardUI from './components/CardUI';
import { getSpicyFollowUp } from './services/geminiService';
import { Fairgrounds } from './src/components/Fairgrounds';

const App: React.FC = () => {
  const [view, setView] = useState<'lobby' | 'setup' | 'game' | 'fairgrounds'>('lobby');
  const [gameState, setGameState] = useState<GameState>({
    currentCategory: null,
    history: [],
    points: 0,
    turn: 1,
    player1Name: 'Seeker',
    player2Name: 'Keeper'
  });
  
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [sparkLoading, setSparkLoading] = useState(false);
  const [sparkText, setSparkText] = useState<string | null>(null);

  const allCards: Card[] = useMemo(() => {
    return Object.entries(RAW_CARDS).flatMap(([cat, questions]) => {
      const categoryInfo = CATEGORIES.find(c => c.type === cat);
      return questions.map((q, i) => ({
        id: `${cat}-${i}`,
        category: cat as CategoryType,
        text: q,
        color: categoryInfo?.color || 'bg-slate-700'
      }));
    });
  }, []);

  const activeDeck = useMemo(() => {
    if (gameState.currentCategory === 'All') return allCards;
    return allCards.filter(c => c.category === gameState.currentCategory);
  }, [allCards, gameState.currentCategory]);

  const remainingCards = useMemo(() => {
    return activeDeck.filter(c => !gameState.history.includes(c.id));
  }, [activeDeck, gameState.history]);

  const shuffleDeck = useCallback(() => {
    setIsShuffling(true);
    setGameState(prev => ({ ...prev, history: [] }));
    setCurrentCard(null);
    setIsFlipped(false);
    setTimeout(() => {
      setIsShuffling(false);
    }, 1500);
  }, []);

  const drawCard = useCallback(() => {
    if (remainingCards.length === 0) {
      return; // Deck empty, must shuffle
    }
    
    setIsShuffling(true);
    setCurrentCard(null);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * remainingCards.length);
      const selectedCard = remainingCards[randomIndex];

      setCurrentCard(selectedCard);
      setIsFlipped(false);
      setSparkText(null);
      setIsShuffling(false);
      setGameState(prev => ({
        ...prev,
        history: [...prev.history, selectedCard.id]
      }));
    }, 600);
  }, [remainingCards]);

  const handleNextTurn = () => {
    setGameState(prev => ({
      ...prev,
      turn: prev.turn === 1 ? 2 : 1,
      points: prev.points + 1
    }));
    drawCard();
  };

  const handleSpark = async () => {
    if (!currentCard) return;
    setSparkLoading(true);
    try {
        const followUp = await getSpicyFollowUp(currentCard.text, currentCard.category);
        setSparkText(followUp);
    } catch (e) {
        setSparkText("Tell me more about that... why do you feel that way?");
    } finally {
        setSparkLoading(false);
    }
  };

  const startGame = (category: CategoryType | 'All') => {
    setGameState(prev => ({ ...prev, currentCategory: category, history: [], turn: 1, points: 0 }));
    setView('game');
    setIsShuffling(true);
    setTimeout(() => {
       setIsShuffling(false);
       // Auto draw first card
       const deck = category === 'All' ? allCards : allCards.filter(c => c.category === category);
       const randomIndex = Math.floor(Math.random() * deck.length);
       const firstCard = deck[randomIndex];
       setCurrentCard(firstCard);
       setGameState(prev => ({ ...prev, history: [firstCard.id] }));
    }, 1000);
  };

  if (view === 'lobby') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Decorative corner elements could go here */}
        <div className="absolute top-8 left-8 text-4xl opacity-20 transform -scale-x-100">✨</div>
        <div className="absolute top-8 right-8 text-4xl opacity-20">✨</div>
        <div className="absolute bottom-8 left-8 text-4xl opacity-20 transform -scale-x-100 -scale-y-100">✨</div>
        <div className="absolute bottom-8 right-8 text-4xl opacity-20 transform -scale-y-100">✨</div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="victorian-border bg-[#FDFBF7]/90 backdrop-blur-md p-8 md:p-20 rounded-sm shadow-xl relative max-w-3xl w-full mx-4"
        >
          <h1 className="text-5xl md:text-8xl font-decorative mb-6 text-[#1A231C] drop-shadow-md tracking-widest uppercase">
            Ask <span className="text-[#AD5D5D] italic font-serif lowercase block mt-2 text-4xl md:text-7xl">Away</span>
          </h1>
          <div className="w-24 h-[1px] bg-[#1A231C]/30 mx-auto mb-8"></div>
          <p className="text-lg md:text-xl text-[#3A453C] font-light max-w-lg mx-auto mb-8 tracking-widest leading-relaxed">
            The Whimsical Oracle.<br/>
            <span className="text-sm opacity-70 italic font-serif">Draw your fate, discover your partner.</span>
          </p>

          {/* Player Profiles Section */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 mb-12 max-w-xl mx-auto">
            {/* Seeker 1 Profile */}
            <div className="flex flex-col items-center w-full sm:w-1/2">
              <div className="w-20 h-20 rounded-full border-2 border-[#AD5D5D] bg-[#FDFBF7] flex items-center justify-center shadow-lg mb-3 relative group overflow-hidden">
                <span className="text-2xl font-serif font-bold text-[#AD5D5D] tracking-widest uppercase select-none transition-transform duration-500 group-hover:scale-110">
                  {gameState.player1Name ? gameState.player1Name[0].toUpperCase() : 'I'}
                </span>
                <div className="absolute bottom-1 text-[10px] opacity-75">☀️</div>
              </div>
              
              <div className="w-full max-w-[180px] text-center">
                <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#AD5D5D] block mb-1">Seeker I</label>
                <input 
                  type="text" 
                  maxLength={12}
                  value={gameState.player1Name}
                  onChange={(e) => setGameState(prev => ({ ...prev, player1Name: e.target.value }))}
                  className="w-full text-center bg-transparent border-b border-[#1A231C]/15 focus:border-[#AD5D5D] focus:outline-none text-sm font-semibold uppercase tracking-[0.15em] text-[#1A231C] py-1 transition-colors"
                  placeholder="NAME"
                />
                <span className="text-[9px] font-serif italic text-[#3A453C]/60 block mt-1">The Seeker of Wisdom</span>
              </div>
            </div>

            {/* Seeker 2 Profile */}
            <div className="flex flex-col items-center w-full sm:w-1/2">
              <div className="w-20 h-20 rounded-full border-2 border-[#6B7F62] bg-[#FDFBF7] flex items-center justify-center shadow-lg mb-3 relative group overflow-hidden">
                <span className="text-2xl font-serif font-bold text-[#6B7F62] tracking-widest uppercase select-none transition-transform duration-500 group-hover:scale-110">
                  {gameState.player2Name ? gameState.player2Name[0].toUpperCase() : 'II'}
                </span>
                <div className="absolute bottom-1 text-[10px] opacity-75">🌙</div>
              </div>
              
              <div className="w-full max-w-[180px] text-center">
                <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#6B7F62] block mb-1">Seeker II</label>
                <input 
                  type="text" 
                  maxLength={12}
                  value={gameState.player2Name}
                  onChange={(e) => setGameState(prev => ({ ...prev, player2Name: e.target.value }))}
                  className="w-full text-center bg-transparent border-b border-[#1A231C]/15 focus:border-[#6B7F62] focus:outline-none text-sm font-semibold uppercase tracking-[0.15em] text-[#1A231C] py-1 transition-colors"
                  placeholder="NAME"
                />
                <span className="text-[9px] font-serif italic text-[#3A453C]/60 block mt-1">The Keeper of Secrets</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('setup')}
              className="bg-[#6B7F62] hover:bg-[#56684F] text-[#FDFBF7] text-sm md:text-base font-bold py-4 px-8 border border-[#3A453C]/20 shadow-lg transition-all flex items-center justify-center gap-3 w-full uppercase tracking-[0.15em] relative overflow-hidden group"
            >
              <span className="relative z-10">Consult the Oracle</span>
              <div className="absolute inset-0 bg-[#FDFBF7] opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('fairgrounds')}
              className="bg-[#AD5D5D] hover:bg-[#924C4C] text-[#FDFBF7] text-sm md:text-base font-bold py-4 px-8 border border-[#3A453C]/20 shadow-lg transition-all flex items-center justify-center gap-3 w-full uppercase tracking-[0.15em] relative overflow-hidden group animate-pulse"
            >
              <span className="relative z-10">The Fairgrounds</span>
              <div className="absolute inset-0 bg-[#FDFBF7] opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'fairgrounds') {
    return (
      <Fairgrounds 
        onBack={() => setView('lobby')} 
        player1Name={gameState.player1Name} 
        player2Name={gameState.player2Name} 
      />
    );
  }

  if (view === 'setup') {
    return (
      <div className="min-h-screen p-6 max-w-6xl mx-auto pt-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center justify-between mb-10 md:mb-16 pb-4 border-b border-[#1A231C]/20 gap-4">
           <button onClick={() => setView('lobby')} className="text-[#3A453C] hover:text-[#1A231C] transition-colors uppercase tracking-[0.2em] text-xs font-bold flex items-center gap-2 md:w-24 justify-start">
             <span className="text-lg">←</span> Return
           </button>
           <h2 className="text-2xl md:text-3xl font-decorative text-[#1A231C] drop-shadow-md tracking-widest uppercase text-center">Select a Suite</h2>
           <button 
             onClick={() => setView('fairgrounds')} 
             className="bg-[#AD5D5D] hover:bg-[#924C4C] text-[#FDFBF7] transition-all px-4 py-2 text-xs uppercase font-bold tracking-widest flex items-center gap-1.5 victorian-border shadow-sm shrink-0"
           >
             🎪 The Fairgrounds
           </button>
        </motion.div>

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20"
        >
          <motion.button 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startGame('All')}
            className="col-span-full victorian-border bg-[#FDFBF7]/90 backdrop-blur-sm hover:bg-[#F5F0E6]/90 p-8 md:p-10 transition-all flex flex-col items-center group mb-4 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-15 bg-[url('/src/assets/images/light_quirky_spread_1782337821317.jpg')] bg-cover bg-center mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent"></div>
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-700 opacity-90 drop-shadow-sm relative z-10">👁️‍🗨️</div>
            <h3 className="text-3xl font-serif italic tracking-widest text-[#1A231C] mb-3 relative z-10">The Grand Spread</h3>
            <p className="text-[#3A453C] text-sm max-w-md text-center font-light leading-relaxed relative z-10">A chaotic assortment of all inquiries. For those who court serendipity.</p>
          </motion.button>

          {CATEGORIES.map((cat) => (
            <motion.button
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              key={cat.type}
              onClick={() => startGame(cat.type)}
              className={`victorian-border shadow-xl transition-all text-left flex flex-col h-56 relative overflow-hidden backdrop-blur-sm group`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-700 mix-blend-multiply" 
                style={{ backgroundImage: `url(${cat.image})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/80 to-transparent"></div>
              
              <div className="text-4xl mb-auto drop-shadow-sm z-10 p-6 opacity-80 group-hover:opacity-100 transition-opacity">{cat.icon}</div>
              <div className="mt-4 z-10 p-6 pt-0">
                <div className="w-8 h-[1px] bg-[#1A231C]/30 mb-3 group-hover:w-16 transition-all duration-500"></div>
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase mb-2 text-[#1A231C] drop-shadow-sm">{cat.type}</h3>
                <p className="text-xs text-[#3A453C] leading-relaxed font-serif italic">{cat.description}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-5 bg-[#FDFBF7]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-[#1A231C]/20 victorian-border border-t-0 border-l-0 border-r-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm shrink-0 font-serif font-bold text-sm select-none transition-all duration-300
              ${gameState.turn === 1 ? 'border-[#AD5D5D] bg-[#FDFBF7] text-[#AD5D5D]' : 'border-[#6B7F62] bg-[#FDFBF7] text-[#6B7F62]'}
            `}>
              {gameState.turn === 1 
                ? (gameState.player1Name ? gameState.player1Name[0].toUpperCase() : 'I') 
                : (gameState.player2Name ? gameState.player2Name[0].toUpperCase() : 'II')
              }
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#6B7F62] mb-0.5">Turn</span>
              <span className="text-sm font-serif italic tracking-widest text-[#1A231C] text-base leading-none">
                {gameState.turn === 1 ? gameState.player1Name : gameState.player2Name}
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-center">
             <div className="text-[10px] uppercase font-bold tracking-widest text-[#3A453C] px-3 py-1.5 victorian-border bg-[#F5F0E6] whitespace-nowrap">
                <span className="hidden md:inline">Cards Remaining:</span>
                <span className="md:hidden">Cards:</span>
                <span className="text-[#AD5D5D] text-xs ml-1 font-serif italic">{remainingCards.length} / {activeDeck.length}</span>
             </div>
             <button onClick={() => setView('setup')} className="bg-[#F5F0E6] hover:bg-[#E8E1CD] p-2.5 transition-all victorian-border text-[#1A231C]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-32 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isShuffling ? (
            <motion.div 
               key="shuffling"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.1 }}
               className="relative w-full max-w-sm aspect-[3/4] flex items-center justify-center"
            >
               <motion.div animate={{ x: [-100, 0, 100, 0], rotate: [-10, 0, 10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute w-40 md:w-48 h-56 md:h-64 bg-[url('/src/assets/images/light_quirky_card_back_1782337809792.jpg')] bg-cover bg-center victorian-border shadow-[0_0_20px_rgba(0,0,0,0.1)]"></motion.div>
               <motion.div animate={{ x: [100, 0, -100, 0], rotate: [10, 0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="absolute w-40 md:w-48 h-56 md:h-64 bg-[url('/src/assets/images/light_quirky_card_back_1782337809792.jpg')] bg-cover bg-center victorian-border shadow-[0_0_20px_rgba(0,0,0,0.1)]"></motion.div>
               <div className="absolute w-40 md:w-48 h-56 md:h-64 bg-[#FDFBF7]/90 victorian-border shadow-[0_0_20px_rgba(0,0,0,0.1)] flex items-center justify-center z-10 backdrop-blur-sm">
                  <span className="text-4xl animate-pulse text-[#6B7F62]">✧</span>
               </div>
            </motion.div>
          ) : currentCard ? (
            <motion.div 
               key="card"
               initial={{ opacity: 0, y: 50, rotateX: -20 }}
               animate={{ opacity: 1, y: 0, rotateX: 0 }}
               exit={{ opacity: 0, x: -100, rotateZ: -10 }}
               transition={{ type: "spring", stiffness: 200, damping: 20 }}
               className="w-full flex flex-col items-center"
            >
               <CardUI 
                  card={currentCard} 
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped(true)}
                  onNext={handleNextTurn}
                  onSpark={handleSpark}
                  sparkLoading={sparkLoading}
                  sparkText={sparkText}
               />
               {!isFlipped && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center text-[#3A453C]">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Unveil the inquiry</p>
                 </motion.div>
               )}
            </motion.div>
          ) : remainingCards.length === 0 ? (
            <motion.div 
               key="empty"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center victorian-border p-12 bg-[#FDFBF7]/90 backdrop-blur-md"
            >
               <div className="text-4xl mb-6 opacity-80 text-[#6B7F62]">✧</div>
               <h3 className="text-3xl font-serif text-[#1A231C] mb-4">The Well is Dry</h3>
               <p className="text-[#3A453C] mb-8 max-w-sm mx-auto leading-relaxed">You have explored every fragment of this particular mystery. Shall we gather them again?</p>
               <button onClick={shuffleDeck} className="bg-[#F5F0E6] hover:bg-[#E8E1CD] text-[#1A231C] victorian-border font-bold py-4 px-10 transition-all mx-auto flex items-center gap-3 tracking-[0.2em] uppercase text-sm">
                 <span className="text-xl">⟲</span> Reshuffle
               </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Mobile-ish Nav */}
      <nav className="fixed bottom-0 left-0 right-0 p-5 bg-[#FDFBF7]/90 backdrop-blur-2xl border-t border-[#1A231C]/20 victorian-border border-b-0 border-l-0 border-r-0 md:hidden pb-safe">
        <div className="flex justify-around items-center">
          <button onClick={() => setView('setup')} className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-all text-[#3A453C]">
             <span className="text-2xl font-serif">☰</span>
             <span className="text-[10px] uppercase font-bold tracking-[0.2em] mt-1 text-[#1A231C]">Index</span>
          </button>
          
          <div className="relative -top-8">
            <button 
               onClick={drawCard} 
               disabled={isShuffling || remainingCards.length === 0} 
               className={`flex flex-col items-center justify-center w-20 h-20 shadow-[0_0_20px_rgba(107,127,98,0.3)] victorian-border bg-[#F5F0E6] transition-all
                 ${(isShuffling || remainingCards.length === 0) ? 'opacity-50 scale-95 grayscale' : 'hover:scale-105 active:scale-95'}
               `}
            >
               <span className="text-2xl text-[#6B7F62]">✧</span>
            </button>
            <div className="text-center mt-3">
               <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#3A453C]">Draw</span>
            </div>
          </div>

          <button onClick={shuffleDeck} disabled={isShuffling} className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-all disabled:opacity-30 text-[#3A453C]">
             <span className="text-2xl font-serif">⟲</span>
             <span className="text-[10px] uppercase font-bold tracking-[0.2em] mt-1 text-[#1A231C]">Shuffle</span>
          </button>
        </div>
      </nav>
      
      {/* Desktop shuffle button floating */}
      <div className="hidden md:flex fixed bottom-8 right-8 gap-4 z-50">
        <button onClick={shuffleDeck} disabled={isShuffling} className="bg-[#FDFBF7]/90 hover:bg-[#F5F0E6]/90 text-[#1A231C] p-4 victorian-border shadow-lg backdrop-blur-md transition-all flex items-center gap-3 group disabled:opacity-50">
           <span className="text-xl group-hover:-rotate-180 transition-transform duration-700 text-[#6B7F62]">⟲</span>
           <span className="text-xs uppercase font-bold tracking-[0.2em] pr-2">Shuffle</span>
        </button>
      </div>
    </div>
  );
};

export default App;
