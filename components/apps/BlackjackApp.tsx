
import React, { useState, useEffect, useCallback } from 'react';
import { Spade, Club, Heart, Diamond, RefreshCcw, Hand, Plus } from 'lucide-react';

type Card = { suit: string; value: string; weight: number };

const BlackjackApp: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'playerTurn' | 'dealerTurn' | 'gameOver'>('idle');
  const [message, setMessage] = useState('Welcome to Cyber Jack');
  const [credits, setCredits] = useState(1000);

  const createDeck = () => {
    const suits = ['spades', 'clubs', 'hearts', 'diamonds'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck: Card[] = [];
    for (let s of suits) {
      for (let v of values) {
        let w = parseInt(v);
        if (v === 'J' || v === 'Q' || v === 'K') w = 10;
        if (v === 'A') w = 11;
        newDeck.push({ suit: s, value: v, weight: w });
      }
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const calculateScore = (hand: Card[]) => {
    let score = hand.reduce((acc, card) => acc + card.weight, 0);
    let aces = hand.filter(c => c.value === 'A').length;
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  };

  const startNewGame = () => {
    if (credits < 100) return;
    setCredits(c => c - 100);
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('playerTurn');
    setMessage('Your turn');
  };

  const hit = () => {
    if (gameState !== 'playerTurn') return;
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(newDeck);
    if (calculateScore(newHand) > 21) {
      setGameState('gameOver');
      setMessage('BUST! Dealer Wins');
    }
  };

  const stand = useCallback(() => {
    if (gameState !== 'playerTurn') return;
    setGameState('dealerTurn');
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'dealerTurn') {
      const timer = setTimeout(() => {
        const dScore = calculateScore(dealerHand);
        if (dScore < 17) {
          const newDeck = [...deck];
          const card = newDeck.pop()!;
          setDealerHand(prev => [...prev, card]);
          setDeck(newDeck);
        } else {
          const pScore = calculateScore(playerHand);
          if (dScore > 21 || pScore > dScore) {
            setMessage('YOU WIN! +200 Credits');
            setCredits(c => c + 200);
          } else if (pScore === dScore) {
            setMessage('PUSH! Return 100');
            setCredits(c => c + 100);
          } else {
            setMessage('DEALER WINS');
          }
          setGameState('gameOver');
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [dealerHand, gameState, deck, playerHand]);

  const renderCard = (card: Card, hidden = false) => {
    if (hidden) return <div className="w-16 h-24 bg-zinc-800 border-2 border-blue-500/30 rounded-lg flex items-center justify-center"><div className="w-8 h-12 bg-blue-500/20 rounded blur-sm"></div></div>;
    const color = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'text-rose-500' : 'text-zinc-200';
    return (
      <div className={`w-16 h-24 bg-zinc-900 border-2 border-white/10 rounded-lg flex flex-col items-center justify-around shadow-lg p-2 ${color}`}>
        <span className="text-sm font-bold self-start">{card.value}</span>
        {card.suit === 'spades' && <Spade className="w-6 h-6" />}
        {card.suit === 'clubs' && <Club className="w-6 h-6" />}
        {card.suit === 'hearts' && <Heart className="w-6 h-6" />}
        {card.suit === 'diamonds' && <Diamond className="w-6 h-6" />}
        <span className="text-sm font-bold self-end rotate-180">{card.value}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white font-mono">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <Spade className="text-rose-500" />
          <span className="font-black italic tracking-tighter">CYBER_JACK 1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-500 font-bold tracking-widest text-sm">CREDITS: ${credits}</span>
          <div className="px-2 py-1 bg-rose-500/20 text-rose-400 text-[10px] rounded">BET: 100</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-around p-8 relative">
        {/* Dealer Area */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Dealer CPU</div>
          <div className="flex gap-2 min-h-[96px]">
            {dealerHand.map((c, i) => renderCard(c, i === 1 && gameState === 'playerTurn'))}
          </div>
          <div className="text-xl font-bold text-zinc-600">
            {gameState === 'playerTurn' ? '??' : calculateScore(dealerHand)}
          </div>
        </div>

        {/* Info Board */}
        <div className="text-center">
           <h2 className={`text-2xl font-black italic tracking-tighter mb-2 ${gameState === 'gameOver' ? 'animate-pulse text-rose-500' : 'text-blue-400'}`}>
            {message.toUpperCase()}
           </h2>
        </div>

        {/* Player Area */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-xl font-bold text-blue-500">{calculateScore(playerHand)}</div>
          <div className="flex gap-2 min-h-[96px]">
            {playerHand.map((c, i) => renderCard(c))}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Local Player</div>
        </div>

        {/* Background Decor */}
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-[40px] border-white/5 rounded-full"></div>
        </div>
      </div>

      <div className="h-24 bg-zinc-900 border-t border-white/5 flex items-center justify-center gap-8 px-8">
        {gameState === 'idle' || gameState === 'gameOver' ? (
          <button 
            onClick={startNewGame}
            disabled={credits < 100}
            className="flex items-center gap-3 px-12 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-full font-black text-xl transition-all shadow-xl active:scale-95"
          >
            <RefreshCcw className="w-6 h-6" /> NEW ROUND
          </button>
        ) : (
          <>
            <button 
              onClick={hit}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> HIT
            </button>
            <button 
              onClick={stand}
              className="flex items-center gap-2 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-black transition-all active:scale-95"
            >
              <Hand className="w-5 h-5" /> STAND
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BlackjackApp;
