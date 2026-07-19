import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Sparkles, Trophy, HelpCircle, ArrowLeft, 
  Send, RefreshCw, Sliders, CheckCircle, RotateCcw, 
  Gamepad2, User, Users, Compass, Eye, ShieldAlert, Check
} from 'lucide-react';

interface FairgroundsProps {
  onBack: () => void;
  player1Name: string;
  player2Name: string;
}

// Wordle Curated Word List
const CELESTIAL_WORDS = [
  'LUSTY', 'SPICY', 'KISSY', 'LOVER', 'SWEET', 'PEACH', 'TRUST', 'UNDER', 
  'TEASE', 'TOUCH', 'HEART', 'DREAM', 'FLAME', 'BOUND', 'BLISS', 'LIGHT', 
  'ORBIT', 'MAGIC', 'HONEY', 'FEVER', 'CLIMAX', 'QUEEN', 'BEAST', 'ANGEL'
];

// Wavelength Prompt List
const WAVELENGTH_SPECTRUMS = [
  { left: 'Extremely Vanilla', right: 'Fiercely Kinky & Wild' },
  { left: 'Slightly Intimate', right: 'Primal & Animalistic' },
  { left: 'Silly & Playful', right: 'Serious & Intense' },
  { left: 'Soft Cuddle Session', right: 'Ravishing & Dominant' },
  { left: 'Pure Romance', right: 'Playful Teasing & Agony' },
  { left: 'Safe & Warm Cocoon', right: 'Thrilling & Public Danger' },
  { left: "{p1}'s Favorite Fantasy", right: "{p2}'s Ultimate Obsession" },
  { left: 'Submissive & Surrendered', right: 'Dominant & Commanding' },
  { left: 'Sober & Grounded', right: 'Eerily Mystical & Dreamy' },
  { left: 'Whispered Compliment', right: 'Dirty Talk at the Climax' }
];

// Trivia Questions List
const NEWLYWED_QUESTIONS = [
  {
    question: "Where is {target}'s absolute favorite spot to be kissed or teased?",
    options: ["Behind the ears & neck", "Inner thighs & hips", "Their back & spine"],
    targetPlayer: "p1"
  },
  {
    question: "What is {target}'s absolute quickest physical turn-on?",
    options: ["Intense, uninterrupted eye contact", "Naughty whispers in public", "{partner} wearing beautiful or striking attire"],
    targetPlayer: "p2"
  },
  {
    question: "Who is the bossier one when deciding on dinner or spontaneous plans?",
    options: ["{p2}", "{p1}", "Both are equally stubborn"],
    targetPlayer: "Both"
  },
  {
    question: "What is {target}'s favorite sensory aftercare?",
    options: ["Being held tight in cozy silence", "Tender massages with warm oil", "A warm shared bath and soft whispers"],
    targetPlayer: "p1"
  },
  {
    question: "If {target} could only do one kinky play tonight, what would they choose?",
    options: ["Aggressive restraint & pinning down", "Sensory deprivation (blindfold & headphones)", "Playful punishment / spanking"],
    targetPlayer: "p2"
  },
  {
    question: "Which of us is more likely to initiate intimacy in an unconventional place?",
    options: ["{p2}", "{p1}", "We both get wild at the exact same rate"],
    targetPlayer: "Both"
  },
  {
    question: "What is our absolute favorite shared memory of travel or getaway?",
    options: ["A cozy cabin in the woods / winter getaway", "A sun-kissed beach / tropical hotel stay", "A chaotic road trip filled with laughter"],
    targetPlayer: "Both"
  },
  {
    question: "How long can {target} go holding eye contact during intense intimacy?",
    options: ["A few seconds before getting shy", "The entire time, they love the deep connection", "They prefer a blindfold to over-activate other senses"],
    targetPlayer: "p1"
  },
  {
    question: "What is {target}'s favorite verbal praise from their partner?",
    options: ["Being told how incredibly skilled they are", "Being told how safe and protected they make them feel", "Hearing their partner beg for pleasure"],
    targetPlayer: "p2"
  }
];

export const Fairgrounds: React.FC<FairgroundsProps> = ({ onBack, player1Name, player2Name }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'wordle' | 'wavelength' | 'trivia'>('home');
  
  // Persistent Scores in Local Storage
  const [scores, setScores] = useState<{ p1: number; p2: number; synergy: number }>({ p1: 0, p2: 0, synergy: 0 });

  useEffect(() => {
    const savedScores = localStorage.getItem('fairgrounds_scores_v1');
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        // use default
      }
    }
  }, []);

  const updateScores = (p1Add: number, p2Add: number, synergyAdd: number) => {
    const newScores = {
      p1: scores.p1 + p1Add,
      p2: scores.p2 + p2Add,
      synergy: scores.synergy + synergyAdd
    };
    setScores(newScores);
    localStorage.setItem('fairgrounds_scores_v1', JSON.stringify(newScores));
  };

  const resetScores = () => {
    if (window.confirm("Are you sure you want to restore the Oracle's ledger to zero?")) {
      const reset = { p1: 0, p2: 0, synergy: 0 };
      setScores(reset);
      localStorage.setItem('fairgrounds_scores_v1', JSON.stringify(reset));
    }
  };

  // ==========================================
  // WORDLE STATE
  // ==========================================
  const [wordleTarget, setWordleTarget] = useState<string>('');
  const [wordlePhase, setWordlePhase] = useState<'setup' | 'play' | 'result'>('setup');
  const [wordleGuesses, setWordleGuesses] = useState<string[]>([]);
  const [wordleCurrentGuess, setWordleCurrentGuess] = useState<string>('');
  const [wordleCreator, setWordleCreator] = useState<string>(player2Name);
  const [wordleGuesser, setWordleGuesser] = useState<string>(player1Name);
  const [customWordInput, setCustomWordInput] = useState<string>('');
  const [customWordError, setCustomWordError] = useState<string>('');
  const [wordleStatus, setWordleStatus] = useState<'won' | 'lost' | 'playing'>('playing');

  useEffect(() => {
    setWordleCreator(player2Name);
    setWordleGuesser(player1Name);
    setWavelengthPsychic(player2Name);
    setWavelengthGuesser(player1Name);
    setTriviaTarget(player1Name);
    setTriviaGuesser(player2Name);
  }, [player1Name, player2Name]);

  const startWordleGame = (creator: string) => {
    setWordleCreator(creator);
    setWordleGuesser(creator === player1Name ? player2Name : player1Name);
    setWordleTarget('');
    setWordlePhase('setup');
    setWordleGuesses([]);
    setWordleCurrentGuess('');
    setWordleStatus('playing');
    setCustomWordInput('');
    setCustomWordError('');
  };

  const handleSetCuratedWord = (word: string) => {
    setWordleTarget(word.toUpperCase());
    setWordlePhase('play');
    setWordleGuesses([]);
    setWordleCurrentGuess('');
  };

  const handleSetCustomWord = () => {
    const word = customWordInput.trim().toUpperCase();
    if (word.length !== 5) {
      setCustomWordError('Must be exactly 5 letters long.');
      return;
    }
    if (!/^[A-Z]+$/.test(word)) {
      setCustomWordError('Only alphabet letters are permitted.');
      return;
    }
    setWordleTarget(word);
    setWordlePhase('play');
    setWordleGuesses([]);
    setWordleCurrentGuess('');
  };

  const handleWordleInput = (char: string) => {
    if (wordleStatus !== 'playing') return;
    if (char === 'ENTER') {
      if (wordleCurrentGuess.length !== 5) return;
      const guess = wordleCurrentGuess.toUpperCase();
      const updatedGuesses = [...wordleGuesses, guess];
      setWordleGuesses(updatedGuesses);
      setWordleCurrentGuess('');

      if (guess === wordleTarget) {
        setWordleStatus('won');
        setWordlePhase('result');
        // Grant points
        const points = 10;
        if (wordleGuesser === player1Name) {
          updateScores(points, 0, points);
        } else {
          updateScores(0, points, points);
        }
      } else if (updatedGuesses.length >= 6) {
        setWordleStatus('lost');
        setWordlePhase('result');
        // Consolation points
        if (wordleGuesser === player1Name) {
          updateScores(2, 0, 2);
        } else {
          updateScores(0, 2, 2);
        }
      }
    } else if (char === 'BACKSPACE' || char === 'BACK') {
      setWordleCurrentGuess(prev => prev.slice(0, -1));
    } else if (wordleCurrentGuess.length < 5 && /^[A-Z]$/i.test(char)) {
      setWordleCurrentGuess(prev => prev + char.toUpperCase());
    }
  };

  // Keyboard layout
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
  ];

  const getLetterState = (char: string): 'correct' | 'present' | 'absent' | 'none' => {
    let bestState: 'correct' | 'present' | 'absent' | 'none' = 'none';
    for (const guess of wordleGuesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === char) {
          if (wordleTarget[i] === char) {
            return 'correct';
          } else if (wordleTarget.includes(char)) {
            bestState = 'present';
          } else if (bestState === 'none') {
            bestState = 'absent';
          }
        }
      }
    }
    return bestState;
  };

  // ==========================================
  // WAVELENGTH STATE
  // ==========================================
  const [wavelengthPhase, setWavelengthPhase] = useState<'setup' | 'clue' | 'guess' | 'result'>('setup');
  const [wavelengthSpectrum, setWavelengthSpectrum] = useState(WAVELENGTH_SPECTRUMS[0]);
  const [wavelengthTarget, setWavelengthTarget] = useState<number>(5);
  const [wavelengthClue, setWavelengthClue] = useState<string>('');
  const [wavelengthGuess, setWavelengthGuess] = useState<number>(5);
  const [wavelengthPsychic, setWavelengthPsychic] = useState<string>(player2Name);
  const [wavelengthGuesser, setWavelengthGuesser] = useState<string>(player1Name);

  const startWavelength = (psychic: string) => {
    setWavelengthPsychic(psychic);
    setWavelengthGuesser(psychic === player1Name ? player2Name : player1Name);
    const randomSpectrum = WAVELENGTH_SPECTRUMS[Math.floor(Math.random() * WAVELENGTH_SPECTRUMS.length)];
    setWavelengthSpectrum(randomSpectrum);
    setWavelengthTarget(Math.floor(Math.random() * 10) + 1); // 1 to 10
    setWavelengthClue('');
    setWavelengthGuess(5);
    setWavelengthPhase('clue');
  };

  const handleWavelengthClueSubmit = () => {
    if (!wavelengthClue.trim()) return;
    setWavelengthPhase('guess');
  };

  const handleWavelengthGuessSubmit = () => {
    setWavelengthPhase('result');
    const diff = Math.abs(wavelengthGuess - wavelengthTarget);
    let points = 0;
    if (diff === 0) points = 10;
    else if (diff === 1) points = 6;
    else if (diff === 2) points = 3;

    if (wavelengthGuesser === player1Name) {
      updateScores(points, 0, points);
    } else {
      updateScores(0, points, points);
    }
  };

  // ==========================================
  // TRIVIA STATE
  // ==========================================
  const [triviaPhase, setTriviaPhase] = useState<'setup' | 'secret_answer' | 'partner_guess' | 'result'>('setup');
  const [triviaQuestion, setTriviaQuestion] = useState(NEWLYWED_QUESTIONS[0]);
  const [triviaTarget, setTriviaTarget] = useState<string>(player1Name);
  const [triviaGuesser, setTriviaGuesser] = useState<string>(player2Name);
  const [triviaSecretAnswer, setTriviaSecretAnswer] = useState<number>(-1);
  const [triviaPartnerGuess, setTriviaPartnerGuess] = useState<number>(-1);

  const startTrivia = () => {
    const randomQ = NEWLYWED_QUESTIONS[Math.floor(Math.random() * NEWLYWED_QUESTIONS.length)];
    
    // Choose who the question is about
    let target = player1Name;
    if (randomQ.targetPlayer === 'p2') target = player2Name;
    else if (randomQ.targetPlayer === 'Both') target = Math.random() > 0.5 ? player1Name : player2Name;

    const guesser = target === player1Name ? player2Name : player1Name;

    // Format the question immediately
    const formatted = {
      question: randomQ.question
        .replace(/{target}/g, target)
        .replace(/{partner}/g, guesser)
        .replace(/{p1}/g, player1Name)
        .replace(/{p2}/g, player2Name),
      options: randomQ.options.map(o => 
        o.replace(/{target}/g, target)
         .replace(/{partner}/g, guesser)
         .replace(/{p1}/g, player1Name)
         .replace(/{p2}/g, player2Name)
      ),
      targetPlayer: randomQ.targetPlayer
    };

    setTriviaQuestion(formatted);
    setTriviaTarget(target);
    setTriviaGuesser(guesser);
    setTriviaSecretAnswer(-1);
    setTriviaPartnerGuess(-1);
    setTriviaPhase('secret_answer');
  };

  const handleTriviaSecretAnswer = (index: number) => {
    setTriviaSecretAnswer(index);
    setTriviaPhase('partner_guess');
  };

  const handleTriviaPartnerGuess = (index: number) => {
    setTriviaPartnerGuess(index);
    setTriviaPhase('result');

    const matched = index === triviaSecretAnswer;
    const points = matched ? 10 : 2; // +10 for match, +2 consolation

    // Synergy bonus
    if (triviaGuesser === player1Name) {
      updateScores(matched ? 10 : 2, 0, points);
    } else {
      updateScores(0, matched ? 10 : 2, points);
    }
  };


  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-12 select-none">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#1A231C]/20 pb-6 mb-8">
        <button 
          onClick={onBack} 
          className="text-[#3A453C] hover:text-[#1A231C] transition-colors uppercase tracking-[0.2em] text-xs font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Whispering Oracle
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-decorative text-[#1A231C] uppercase tracking-widest">
            The Whimsical Fairgrounds
          </h2>
          <span className="text-xs font-serif italic text-[#3A453C] opacity-70">
            Co-operative couples games and divine attunement
          </span>
        </div>
        <div className="w-24 hidden md:block" />
      </div>

      {/* Persistent Scores Board */}
      <div className="victorian-border bg-[#FDFBF7]/90 backdrop-blur-md p-4 mb-8 flex flex-col sm:flex-row justify-around items-center gap-4 text-center rounded-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#AD5D5D] bg-[#FDFBF7] flex items-center justify-center shadow-inner shrink-0 font-serif font-bold text-[#AD5D5D] text-lg select-none">
            {player1Name ? player1Name[0].toUpperCase() : 'I'}
          </div>
          <div className="text-left">
            <span className="text-xs uppercase font-bold tracking-widest text-[#1A231C]">{player1Name}</span>
            <div className="text-xl font-serif text-[#AD5D5D] leading-none">{scores.p1} <span className="text-xs text-[#3A453C]/60">pts</span></div>
          </div>
        </div>

        <div className="px-6 py-2 bg-[#F5F0E6] rounded-sm border border-[#1A231C]/10 flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-[0.2em] text-[#6B7F62]">
            <Heart className="w-3.5 h-3.5 fill-[#AD5D5D] text-[#AD5D5D] animate-pulse" />
            <span>Synergy Level</span>
          </div>
          <div className="text-2xl font-serif text-[#1A231C]">{scores.synergy} <span className="text-xs text-[#3A453C]/60">Sync</span></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs uppercase font-bold tracking-widest text-[#1A231C]">{player2Name}</span>
            <div className="text-xl font-serif text-[#6B7F62] leading-none">{scores.p2} <span className="text-xs text-[#3A453C]/60">pts</span></div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#6B7F62] bg-[#FDFBF7] flex items-center justify-center shadow-inner shrink-0 font-serif font-bold text-[#6B7F62] text-lg select-none">
            {player2Name ? player2Name[0].toUpperCase() : 'II'}
          </div>
        </div>

        <button 
          onClick={resetScores}
          className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#3A453C]/50 hover:text-[#AD5D5D] flex items-center gap-1.5 transition-colors pt-2 sm:pt-0"
        >
          <RotateCcw className="w-3 h-3" /> Reset Ledger
        </button>
      </div>

      {/* Main Container / Tab navigation */}
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* WORDLE SELECT */}
            <button 
              onClick={() => { setActiveTab('wordle'); startWordleGame(player2Name); }}
              className="victorian-border bg-[#FDFBF7]/95 p-8 text-center flex flex-col items-center justify-between min-h-[340px] hover:bg-[#FDFBF7]/80 hover:scale-[1.01] transition-all group shadow-lg"
            >
              <div className="w-16 h-16 rounded-full bg-[#AD5D5D]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Compass className="w-8 h-8 text-[#AD5D5D]" />
              </div>
              <div>
                <h3 className="text-2xl font-serif italic mb-2 text-[#1A231C]">Celestial Wordle</h3>
                <div className="w-12 h-[1px] bg-[#1A231C]/20 mx-auto mb-4"></div>
                <p className="text-xs text-[#3A453C] font-serif italic leading-relaxed max-w-[240px]">
                  Take turns weaving 5-letter puzzles. Set custom words for your partner or guess our curated, sensual list.
                </p>
              </div>
              <span className="mt-6 text-xs uppercase font-bold tracking-widest text-[#AD5D5D] flex items-center gap-2">
                Enter Fair <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>

            {/* WAVELENGTH SELECT */}
            <button 
              onClick={() => { setActiveTab('wavelength'); startWavelength(player2Name); }}
              className="victorian-border bg-[#FDFBF7]/95 p-8 text-center flex flex-col items-center justify-between min-h-[340px] hover:bg-[#FDFBF7]/80 hover:scale-[1.01] transition-all group shadow-lg"
            >
              <div className="w-16 h-16 rounded-full bg-[#6B7F62]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sliders className="w-8 h-8 text-[#6B7F62]" />
              </div>
              <div>
                <h3 className="text-2xl font-serif italic mb-2 text-[#1A231C]">Oracle Wavelength</h3>
                <div className="w-12 h-[1px] bg-[#1A231C]/20 mx-auto mb-4"></div>
                <p className="text-xs text-[#3A453C] font-serif italic leading-relaxed max-w-[240px]">
                  Can you read your partner's mind? Guess the exact dial location on a custom sensory spectrum based on a single clue.
                </p>
              </div>
              <span className="mt-6 text-xs uppercase font-bold tracking-widest text-[#6B7F62] flex items-center gap-2">
                Enter Fair <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>

            {/* TRIVIA SELECT */}
            <button 
              onClick={() => { setActiveTab('trivia'); startTrivia(); }}
              className="victorian-border bg-[#FDFBF7]/95 p-8 text-center flex flex-col items-center justify-between min-h-[340px] hover:bg-[#FDFBF7]/80 hover:scale-[1.01] transition-all group shadow-lg"
            >
              <div className="w-16 h-16 rounded-full bg-[#1A231C]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-8 h-8 text-[#1A231C]" />
              </div>
              <div>
                <h3 className="text-2xl font-serif italic mb-2 text-[#1A231C]">Matchmaker's Challenge</h3>
                <div className="w-12 h-[1px] bg-[#1A231C]/20 mx-auto mb-4"></div>
                <p className="text-xs text-[#3A453C] font-serif italic leading-relaxed max-w-[240px]">
                  A high-stakes Newlywed game. Predict how your partner answers intimate, fun, and slightly playful inquiries.
                </p>
              </div>
              <span className="mt-6 text-xs uppercase font-bold tracking-widest text-[#1A231C] flex items-center gap-2">
                Enter Fair <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </motion.div>
        )}

        {/* ========================================================
            WORDLE SCREEN
            ======================================================== */}
        {activeTab === 'wordle' && (
          <motion.div 
            key="wordle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-xl mx-auto bg-[#FDFBF7]/90 p-6 md:p-8 victorian-border shadow-2xl relative"
          >
            <button 
              onClick={() => setActiveTab('home')} 
              className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-[#3A453C]/70 hover:text-[#1A231C]"
            >
              ← Leave Game
            </button>
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#AD5D5D]">Co-op Puzzle</span>
              <h3 className="text-2xl font-serif italic text-[#1A231C]">Celestial Wordle</h3>
            </div>

            {/* Wordle setup phase: Creator chooses word */}
            {wordlePhase === 'setup' && (
              <div className="text-center py-6">
                <p className="text-sm font-serif italic text-[#3A453C] mb-6">
                  {wordleCreator}, you are the Word Weaver. Choose a word for {wordleGuesser} to unlock.
                </p>

                {/* Setup buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                  <div className="victorian-border bg-[#F5F0E6] p-4 flex flex-col justify-between h-44">
                    <span className="text-[10px] font-bold tracking-widest text-[#1A231C] uppercase mb-2">Curated Romance</span>
                    <p className="text-xs font-serif text-[#3A453C] opacity-80 leading-relaxed mb-4">Draw a random sensual, cozy, or cheeky 5-letter word.</p>
                    <button 
                      onClick={() => {
                        const randomW = CELESTIAL_WORDS[Math.floor(Math.random() * CELESTIAL_WORDS.length)];
                        handleSetCuratedWord(randomW);
                      }}
                      className="bg-[#6B7F62] hover:bg-[#56684F] text-[#FDFBF7] py-2 px-4 text-xs uppercase font-bold tracking-widest"
                    >
                      Draw Curated Word
                    </button>
                  </div>

                  <div className="victorian-border bg-[#F5F0E6] p-4 flex flex-col justify-between h-44">
                    <span className="text-[10px] font-bold tracking-widest text-[#1A231C] uppercase mb-1">Weave Custom Word</span>
                    <input 
                      type="text"
                      maxLength={5}
                      value={customWordInput}
                      onChange={(e) => setCustomWordInput(e.target.value)}
                      placeholder="ENTER 5 LETTERS"
                      className="border-b border-[#1A231C]/30 bg-transparent text-center focus:outline-none uppercase tracking-widest text-lg font-serif mb-2"
                    />
                    {customWordError && <span className="text-[9px] text-[#AD5D5D] font-bold uppercase mb-1">{customWordError}</span>}
                    <button 
                      onClick={handleSetCustomWord}
                      className="bg-[#1A231C] hover:bg-[#3A453C] text-[#FDFBF7] py-2 px-4 text-xs uppercase font-bold tracking-widest"
                    >
                      Set Custom Word
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={() => setWordleCreator(wordleCreator === player1Name ? player2Name : player1Name)}
                    className="text-xs uppercase font-bold tracking-widest text-[#3A453C] flex items-center gap-1 border-b border-[#3A453C]/30 hover:text-[#1A231C]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Swap Roles
                  </button>
                </div>
              </div>
            )}

            {/* Wordle playing phase */}
            {wordlePhase === 'play' && (
              <div className="flex flex-col items-center">
                <div className="mb-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6B7F62]">
                    {wordleGuesser} is guessing!
                  </p>
                  <p className="text-[10px] text-[#3A453C]/60 italic mt-0.5">
                    Weaved in secret by {wordleCreator}
                  </p>
                </div>

                {/* Wordle Grid */}
                <div className="grid grid-rows-6 gap-2 mb-8">
                  {Array.from({ length: 6 }).map((_, rowIndex) => {
                    const guess = wordleGuesses[rowIndex] || (rowIndex === wordleGuesses.length ? wordleCurrentGuess : '');
                    const isSubmitted = rowIndex < wordleGuesses.length;

                    return (
                      <div key={rowIndex} className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 5 }).map((_, colIndex) => {
                          const letter = guess[colIndex] || '';
                          let bgClass = 'bg-[#FDFBF7] border-[#1A231C]/20 text-[#1A231C]';

                          if (isSubmitted) {
                            if (wordleTarget[colIndex] === letter) {
                              bgClass = 'bg-[#6B7F62] text-[#FDFBF7] border-[#6B7F62]';
                            } else if (wordleTarget.includes(letter)) {
                              bgClass = 'bg-[#D0A96C] text-[#FDFBF7] border-[#D0A96C]';
                            } else {
                              bgClass = 'bg-slate-500 text-slate-100 border-slate-500';
                            }
                          } else if (letter) {
                            bgClass = 'bg-[#F5F0E6] border-[#1A231C]/60 text-[#1A231C] scale-105';
                          }

                          return (
                            <motion.div 
                              key={colIndex}
                              initial={letter ? { scale: 0.95 } : {}}
                              animate={letter ? { scale: 1 } : {}}
                              className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-bold font-serif text-lg md:text-xl border victorian-border rounded-sm shadow-sm select-none transition-all duration-300 ${bgClass}`}
                            >
                              {letter}
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Virtual Keyboard */}
                <div className="w-full flex flex-col gap-1.5 max-w-md">
                  {keyboardRows.map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-center gap-1">
                      {row.map((char) => {
                        const state = getLetterState(char);
                        let btnClass = 'bg-[#F5F0E6] text-[#1A231C] hover:bg-[#E8E1CD]';

                        if (state === 'correct') btnClass = 'bg-[#6B7F62] text-[#FDFBF7]';
                        else if (state === 'present') btnClass = 'bg-[#D0A96C] text-[#FDFBF7]';
                        else if (state === 'absent') btnClass = 'bg-[#1A231C]/15 text-[#1A231C]/40';

                        const isSpecial = char === 'ENTER' || char === 'BACK';

                        return (
                          <button 
                            key={char}
                            onClick={() => handleWordleInput(char)}
                            className={`h-11 flex-1 font-bold rounded-sm text-xs md:text-sm uppercase tracking-wider flex items-center justify-center transition-all border border-[#1A231C]/10 ${btnClass} ${isSpecial ? 'px-2 flex-[1.5] text-[10px]' : ''}`}
                          >
                            {char}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wordle Result / Reveal Phase */}
            {wordlePhase === 'result' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-[#6B7F62]/10">
                  {wordleStatus === 'won' ? (
                    <Sparkles className="w-8 h-8 text-[#6B7F62] animate-bounce" />
                  ) : (
                    <ShieldAlert className="w-8 h-8 text-[#AD5D5D]" />
                  )}
                </div>

                <h4 className="text-3xl font-serif italic text-[#1A231C] mb-2">
                  {wordleStatus === 'won' ? 'Telepathic Triumph!' : 'Divine Eclipse'}
                </h4>
                <p className="text-sm font-serif text-[#3A453C] max-w-sm mx-auto mb-6">
                  {wordleStatus === 'won' 
                    ? `${wordleGuesser} cracked the secret code perfectly! Intuition aligned seamlessly.` 
                    : `The stars did not align this time. The secret key eluded the seeker.`}
                </p>

                <div className="victorian-border bg-[#F5F0E6] p-4 max-w-xs mx-auto mb-8 rounded-sm">
                  <span className="text-[10px] font-bold tracking-widest text-[#3A453C] uppercase block mb-1">The Secret Word</span>
                  <span className="text-3xl font-serif uppercase tracking-[0.2em] font-extrabold text-[#1A231C] block">{wordleTarget}</span>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => startWordleGame(wordleCreator === player1Name ? player2Name : player1Name)}
                    className="bg-[#6B7F62] hover:bg-[#56684F] text-[#FDFBF7] py-3.5 px-8 text-xs uppercase font-bold tracking-widest transition-all"
                  >
                    Play Again (Swap Roles)
                  </button>
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="border border-[#1A231C]/30 text-[#1A231C] hover:bg-[#1A231C]/5 py-3.5 px-8 text-xs uppercase font-bold tracking-widest transition-all"
                  >
                    Back to Fairgrounds
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================
            WAVELENGTH SCREEN
            ======================================================== */}
        {activeTab === 'wavelength' && (
          <motion.div 
            key="wavelength"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-xl mx-auto bg-[#FDFBF7]/90 p-6 md:p-8 victorian-border shadow-2xl relative"
          >
            <button 
              onClick={() => setActiveTab('home')} 
              className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-[#3A453C]/70 hover:text-[#1A231C]"
            >
              ← Leave Game
            </button>
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#6B7F62]">Intuitive Spectrum</span>
              <h3 className="text-2xl font-serif italic text-[#1A231C]">Oracle Wavelength</h3>
            </div>

            {/* Wavelength Clue setup phase */}
            {wavelengthPhase === 'clue' && (
              <div className="text-center py-4">
                <p className="text-sm font-serif italic text-[#3A453C] mb-4">
                  {wavelengthPsychic}, you are the Psychic. You must formulate a clue for {wavelengthGuesser}.
                </p>

                {/* Secret target dial and spectrum */}
                <div className="victorian-border bg-[#F5F0E6] p-6 mb-6 rounded-sm text-center">
                  <span className="text-[10px] font-bold tracking-widest text-[#AD5D5D] uppercase block mb-1">Your Secret Spectrum</span>
                  <div className="flex justify-between items-center px-4 font-serif italic text-sm text-[#1A231C] font-semibold my-3">
                    <span>{wavelengthSpectrum.left}</span>
                    <span className="text-[#3A453C]/40 mx-2">──</span>
                    <span>{wavelengthSpectrum.right}</span>
                  </div>

                  {/* Dial representation */}
                  <div className="my-6">
                    <span className="text-[10px] font-bold tracking-widest text-[#3A453C] uppercase block mb-2">Secret Target Location</span>
                    <div className="flex justify-center items-center gap-1.5 max-w-xs mx-auto">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const pos = i + 1;
                        const isTarget = pos === wavelengthTarget;
                        return (
                          <div 
                            key={pos} 
                            className={`h-8 flex-1 rounded-sm flex items-center justify-center font-serif text-xs font-bold transition-all
                              ${isTarget ? 'bg-[#AD5D5D] text-[#FDFBF7] scale-110 shadow-md ring-2 ring-[#AD5D5D]/40' : 'bg-[#1A231C]/10 text-[#1A231C]/50'}
                            `}
                          >
                            {pos}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Form clue input */}
                <div className="max-w-md mx-auto">
                  <label className="text-[10px] font-bold tracking-widest text-[#1A231C] uppercase block mb-2">Type your telepathic clue:</label>
                  <input 
                    type="text"
                    value={wavelengthClue}
                    onChange={(e) => setWavelengthClue(e.target.value)}
                    placeholder="Enter a single word or phrase..."
                    className="w-full text-center p-3 font-serif border-b border-[#1A231C]/20 bg-transparent focus:outline-none focus:border-[#6B7F62] text-lg text-[#1A231C]"
                  />
                  <p className="text-[10px] text-[#3A453C]/60 italic mt-2">
                    E.g. if the spectrum is Sweet ── Spicy and the target is 9, your clue might be "Hot Cinnamon Kiss"
                  </p>
                  <button 
                    disabled={!wavelengthClue.trim()}
                    onClick={handleWavelengthClueSubmit}
                    className="mt-6 bg-[#6B7F62] hover:bg-[#56684F] text-[#FDFBF7] w-full py-3 px-6 text-xs uppercase font-bold tracking-widest transition-all disabled:opacity-45"
                  >
                    Pass Device to {wavelengthGuesser}
                  </button>
                </div>
              </div>
            )}

            {/* Wavelength Guessing phase */}
            {wavelengthPhase === 'guess' && (
              <div className="text-center py-4">
                <p className="text-sm font-serif italic text-[#3A453C] mb-6">
                  {wavelengthGuesser}, read the clue. Place the slider at the exact position on the spectrum.
                </p>

                {/* The Telepathic Clue Panel */}
                <div className="victorian-border bg-[#F5F0E6] p-6 mb-8 rounded-sm text-center relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-xl opacity-30">✨</div>
                  <span className="text-[10px] font-bold tracking-widest text-[#AD5D5D] uppercase block mb-1">
                    {wavelengthPsychic}'s Telepathic Clue
                  </span>
                  <h4 className="text-3xl font-serif italic text-[#1A231C] my-3 leading-tight font-extrabold px-4">
                    "{wavelengthClue}"
                  </h4>
                </div>

                {/* Spectrum labels */}
                <div className="flex justify-between items-center font-serif italic text-sm text-[#1A231C] font-semibold mb-4 px-2">
                  <span className="max-w-[140px] text-left leading-tight">{wavelengthSpectrum.left}</span>
                  <span className="max-w-[140px] text-right leading-tight">{wavelengthSpectrum.right}</span>
                </div>

                {/* Guess Slider */}
                <div className="mb-10 px-2">
                  <input 
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={wavelengthGuess}
                    onChange={(e) => setWavelengthGuess(parseInt(e.target.value))}
                    className="w-full accent-[#6B7F62] cursor-pointer h-2 bg-[#1A231C]/15 rounded-lg appearance-none"
                  />
                  
                  {/* Digital read out */}
                  <div className="flex justify-between text-[11px] font-bold text-[#3A453C]/50 px-1.5 mt-2 font-mono">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span 
                        key={i}
                        className={wavelengthGuess === (i + 1) ? 'text-[#6B7F62] scale-125 font-bold' : ''}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <span className="text-xs uppercase font-bold tracking-widest text-[#3A453C]">Your Current Guess</span>
                    <span className="text-3xl font-serif text-[#1A231C] font-extrabold block mt-1">{wavelengthGuess}</span>
                  </div>
                </div>

                <button 
                  onClick={handleWavelengthGuessSubmit}
                  className="bg-[#1A231C] hover:bg-[#3A453C] text-[#FDFBF7] w-full py-4 px-6 text-xs uppercase font-bold tracking-widest transition-all"
                >
                  Submit Guess & Lock Destiny
                </button>
              </div>
            )}

            {/* Wavelength Result reveal phase */}
            {wavelengthPhase === 'result' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-[#6B7F62]/10">
                  <Trophy className="w-8 h-8 text-[#6B7F62]" />
                </div>

                <h4 className="text-3xl font-serif italic text-[#1A231C] mb-2">
                  {Math.abs(wavelengthGuess - wavelengthTarget) === 0 ? 'Divine Synchronicity!' : 'Oracular Alignment'}
                </h4>
                <p className="text-xs font-serif text-[#3A453C] max-w-sm mx-auto mb-6">
                  Guessed <strong>{wavelengthGuess}</strong> • Target was <strong>{wavelengthTarget}</strong>
                </p>

                {/* Compare view */}
                <div className="victorian-border bg-[#F5F0E6] p-6 mb-8 rounded-sm max-w-md mx-auto">
                  <div className="flex justify-between items-center font-serif italic text-xs text-[#1A231C] mb-4">
                    <span>{wavelengthSpectrum.left}</span>
                    <span>{wavelengthSpectrum.right}</span>
                  </div>

                  <div className="flex justify-center items-center gap-1.5">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const pos = i + 1;
                      const isTarget = pos === wavelengthTarget;
                      const isGuess = pos === wavelengthGuess;

                      let cellBg = 'bg-[#1A231C]/10 text-[#1A231C]/40';
                      let label = `${pos}`;

                      if (isTarget && isGuess) {
                        cellBg = 'bg-[#6B7F62] text-[#FDFBF7] ring-2 ring-[#6B7F62]/50 scale-110';
                        label = '🎯';
                      } else if (isTarget) {
                        cellBg = 'bg-[#AD5D5D] text-[#FDFBF7] scale-105';
                        label = '⭐';
                      } else if (isGuess) {
                        cellBg = 'bg-slate-700 text-slate-100 scale-105';
                        label = '👁️';
                      }

                      return (
                        <div 
                          key={pos} 
                          className={`h-10 flex-1 rounded-sm flex flex-col items-center justify-center font-serif text-xs font-bold transition-all ${cellBg}`}
                        >
                          <span className="text-[10px] leading-tight">{label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center gap-6 mt-4 text-[10px] uppercase font-bold tracking-widest text-[#3A453C]/70">
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 bg-[#AD5D5D] rounded-full"></span> Target</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 bg-slate-700 rounded-full"></span> Guess</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 bg-[#6B7F62] rounded-full"></span> Perfect Match</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => startWavelength(wavelengthPsychic === player1Name ? player2Name : player1Name)}
                    className="bg-[#6B7F62] hover:bg-[#56684F] text-[#FDFBF7] py-3.5 px-8 text-xs uppercase font-bold tracking-widest transition-all"
                  >
                    Play Again (Swap Roles)
                  </button>
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="border border-[#1A231C]/30 text-[#1A231C] hover:bg-[#1A231C]/5 py-3.5 px-8 text-xs uppercase font-bold tracking-widest transition-all"
                  >
                    Back to Fairgrounds
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================
            TRIVIA SCREEN
            ======================================================== */}
        {activeTab === 'trivia' && (
          <motion.div 
            key="trivia"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-xl mx-auto bg-[#FDFBF7]/90 p-6 md:p-8 victorian-border shadow-2xl relative"
          >
            <button 
              onClick={() => setActiveTab('home')} 
              className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-[#3A453C]/70 hover:text-[#1A231C]"
            >
              ← Leave Game
            </button>
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#AD5D5D]">Matchmaking Oracle</span>
              <h3 className="text-2xl font-serif italic text-[#1A231C]">Matchmaker's Challenge</h3>
            </div>

            {/* Secret answer phase */}
            {triviaPhase === 'secret_answer' && (
              <div className="text-center">
                <p className="text-sm font-serif italic text-[#3A453C] mb-6">
                  This question is about <strong>{triviaTarget}</strong>. {triviaTarget}, select your secret choice in absolute confidence.
                </p>

                <div className="victorian-border bg-[#F5F0E6] p-6 mb-6 rounded-sm text-center">
                  <h4 className="text-xl font-serif italic text-[#1A231C] mb-6 leading-relaxed">
                    "{triviaQuestion.question}"
                  </h4>

                  <div className="flex flex-col gap-3">
                    {triviaQuestion.options.map((option, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleTriviaSecretAnswer(idx)}
                        className="p-4 bg-[#FDFBF7] hover:bg-[#FDFBF7]/60 border border-[#1A231C]/10 hover:border-[#1A231C]/40 text-sm font-serif italic text-left text-[#1A231C] transition-all rounded-sm flex items-center justify-between"
                      >
                        <span>{option}</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-35">Select</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Partner guess phase */}
            {triviaPhase === 'partner_guess' && (
              <div className="text-center">
                <p className="text-sm font-serif italic text-[#3A453C] mb-6">
                  {triviaGuesser}, try to guess exactly how {triviaTarget} answered this inquiry!
                </p>

                <div className="victorian-border bg-[#F5F0E6] p-6 mb-6 rounded-sm text-center">
                  <h4 className="text-xl font-serif italic text-[#1A231C] mb-6 leading-relaxed">
                    "{triviaQuestion.question}"
                  </h4>

                  <div className="flex flex-col gap-3">
                    {triviaQuestion.options.map((option, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleTriviaPartnerGuess(idx)}
                        className="p-4 bg-[#FDFBF7] hover:bg-[#FDFBF7]/60 border border-[#1A231C]/10 hover:border-[#1A231C]/40 text-sm font-serif italic text-left text-[#1A231C] transition-all rounded-sm flex items-center justify-between"
                      >
                        <span>{option}</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-35">Guess</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Result phase */}
            {triviaPhase === 'result' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-[#6B7F62]/10">
                  {triviaSecretAnswer === triviaPartnerGuess ? (
                    <CheckCircle className="w-8 h-8 text-[#6B7F62]" />
                  ) : (
                    <Users className="w-8 h-8 text-[#AD5D5D]" />
                  )}
                </div>

                <h4 className="text-3xl font-serif italic text-[#1A231C] mb-2">
                  {triviaSecretAnswer === triviaPartnerGuess ? 'A Perfect Match!' : 'Close Connections'}
                </h4>
                <p className="text-xs font-serif text-[#3A453C] max-w-sm mx-auto mb-6">
                  {triviaSecretAnswer === triviaPartnerGuess 
                    ? "Incredible! Your minds are perfectly tuned. A divine match made in heaven." 
                    : "Not quite, but every exploration brings us closer together."}
                </p>

                <div className="victorian-border bg-[#F5F0E6] p-6 mb-8 rounded-sm max-w-md mx-auto text-left">
                  <span className="text-[10px] font-bold tracking-widest text-[#3A453C]/60 uppercase block mb-3">The Inquiry Results</span>
                  
                  <div className="flex flex-col gap-3">
                    {triviaQuestion.options.map((option, idx) => {
                      const isCorrect = idx === triviaSecretAnswer;
                      const isGuessed = idx === triviaPartnerGuess;

                      let cellBg = 'bg-[#FDFBF7] opacity-60';
                      let suffix = '';

                      if (isCorrect && isGuessed) {
                        cellBg = 'bg-[#6B7F62]/10 border-[#6B7F62] border-2';
                        suffix = '🎯 Match';
                      } else if (isCorrect) {
                        cellBg = 'bg-[#6B7F62]/5 border-[#6B7F62]/40 border';
                        suffix = '⭐ Choice';
                      } else if (isGuessed) {
                        cellBg = 'bg-[#AD5D5D]/5 border-[#AD5D5D]/40 border';
                        suffix = '❌ Guess';
                      }

                      return (
                        <div 
                          key={idx}
                          className={`p-4 rounded-sm flex items-center justify-between text-sm font-serif italic text-[#1A231C] ${cellBg}`}
                        >
                          <span>{option}</span>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#3A453C]">{suffix}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={startTrivia}
                    className="bg-[#6B7F62] hover:bg-[#56684F] text-[#FDFBF7] py-3.5 px-8 text-xs uppercase font-bold tracking-widest transition-all"
                  >
                    Draw Next Question
                  </button>
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="border border-[#1A231C]/30 text-[#1A231C] hover:bg-[#1A231C]/5 py-3.5 px-8 text-xs uppercase font-bold tracking-widest transition-all"
                  >
                    Back to Fairgrounds
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
