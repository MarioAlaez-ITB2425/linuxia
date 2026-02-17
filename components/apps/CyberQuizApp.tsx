
import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Cpu, Wifi, Zap, Award, RefreshCcw, Play, Timer, CheckCircle2, XCircle } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const CYBER_QUESTIONS: Question[] = [
  {
    question: "¿Qué es una vulnerabilidad de 'Zero-Day'?",
    options: [
      "Un fallo de seguridad que existe desde hace 0 días",
      "Una vulnerabilidad desconocida por el fabricante que es explotada",
      "Un virus que se borra a sí mismo en 24 horas",
      "Un parche de seguridad lanzado el mismo día de la infección"
    ],
    correctAnswer: 1
  },
  {
    question: "¿Cuál es la principal diferencia entre HTTP y HTTPS?",
    options: [
      "HTTPS es más rápido que HTTP",
      "HTTPS utiliza cifrado SSL/TLS para proteger la comunicación",
      "HTTP solo funciona en ordenadores portátiles",
      "No hay diferencia, son el mismo protocolo"
    ],
    correctAnswer: 1
  },
  {
    question: "En ciberseguridad, ¿qué significa el término 'Phishing'?",
    options: [
      "Una técnica para pescar cables de red en el océano",
      "El acto de sobrecargar un servidor con tráfico falso",
      "Engañar a alguien para que revele información confidencial",
      "La instalación de hardware malicioso en un servidor físico"
    ],
    correctAnswer: 2
  },
  {
    question: "¿Qué es un ataque de 'Man-in-the-Middle'?",
    options: [
      "Un atacante que se sitúa físicamente en medio de una oficina",
      "Un virus que se propaga a través de cables USB",
      "Un atacante que intercepta y altera la comunicación entre dos partes",
      "Cuando tres hackers atacan un servidor al mismo tiempo"
    ],
    correctAnswer: 2
  },
  {
    question: "¿Cuál de estos algoritmos es de cifrado asimétrico?",
    options: [
      "AES-256",
      "Blowfish",
      "DES",
      "RSA"
    ],
    correctAnswer: 3
  },
  {
    question: "¿Qué hace un ataque DDoS?",
    options: [
      "Descifra todas las contraseñas de un servidor",
      "Sobrecarga un servicio mediante múltiples fuentes para dejarlo inoperativo",
      "Roba los datos de las tarjetas de crédito de los usuarios",
      "Instala un ransomware en la red local"
    ],
    correctAnswer: 1
  },
  {
    question: "¿Qué es la 'Ingeniería Social'?",
    options: [
      "Construir redes sociales seguras",
      "Manipulación psicológica de personas para obtener información",
      "Programar algoritmos para redes neuronales",
      "Arreglar ordenadores en una comunidad"
    ],
    correctAnswer: 1
  }
];

type GameState = 'intro' | 'playing' | 'feedback' | 'results';

const CyberQuizApp: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const startGame = () => {
    setGameState('playing');
    setCurrentQIdx(0);
    setScore(0);
    setTimeLeft(20);
    setSelectedAns(null);
    setIsCorrect(null);
  };

  const handleAnswer = (idx: number) => {
    if (selectedAns !== null) return;
    setSelectedAns(idx);
    const correct = idx === CYBER_QUESTIONS[currentQIdx].correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + Math.max(10, timeLeft * 5));
    }
    setTimeout(() => {
      setGameState('feedback');
    }, 500);
  };

  const nextQuestion = () => {
    if (currentQIdx < CYBER_QUESTIONS.length - 1) {
      setCurrentQIdx(prev => prev + 1);
      setSelectedAns(null);
      setIsCorrect(null);
      setTimeLeft(20);
      setGameState('playing');
    } else {
      setGameState('results');
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setIsCorrect(false);
      setGameState('feedback');
    }
  }, [gameState, timeLeft]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white font-mono overflow-hidden select-none relative">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {gameState === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-rose-500/20 rounded-3xl flex items-center justify-center border border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.3)] mb-8">
            <ShieldCheck className="w-14 h-14 text-rose-500" />
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-rose-500 mb-2 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">CYBER_KAHOOT</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold mb-10">Neural Security Training v4.0</p>
          
          <button 
            onClick={startGame}
            className="group relative flex items-center gap-4 px-12 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-black text-xl transition-all shadow-xl active:scale-95"
          >
            <Play className="w-6 h-6 fill-white" />
            START SEQUENCE
            <div className="absolute -inset-1 bg-rose-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex-1 flex flex-col z-10 p-6 sm:p-10 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Question</span>
              <span className="text-2xl font-black text-rose-500 italic">{currentQIdx + 1}/{CYBER_QUESTIONS.length}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 ${timeLeft < 5 ? 'border-rose-500 text-rose-500 animate-pulse' : 'border-zinc-800 text-zinc-300'} transition-colors relative`}>
                <Timer className="absolute w-12 h-12 opacity-10" />
                <span className="text-2xl font-black italic tracking-tighter">{timeLeft}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Points</span>
              <span className="text-2xl font-black text-emerald-400 italic">{score.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
            <h2 className="text-xl sm:text-3xl font-bold text-center mb-12 leading-tight">
              {CYBER_QUESTIONS[currentQIdx].question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {CYBER_QUESTIONS[currentQIdx].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedAns !== null}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all group overflow-hidden ${
                    selectedAns === i 
                      ? 'bg-rose-600/20 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]' 
                      : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`absolute top-0 left-0 bottom-0 w-2 ${
                    i === 0 ? 'bg-blue-500' : 
                    i === 1 ? 'bg-emerald-500' : 
                    i === 2 ? 'bg-amber-500' : 'bg-purple-500'
                  }`} />
                  <span className="text-sm sm:text-lg font-bold pl-4 block">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === 'feedback' && (
        <div className={`flex-1 flex flex-col items-center justify-center z-10 p-10 animate-in fade-in zoom-in duration-300 ${isCorrect ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}>
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 border-4 ${isCorrect ? 'border-emerald-500 bg-emerald-500/10' : 'border-rose-500 bg-rose-500/10'}`}>
            {isCorrect ? <CheckCircle2 className="w-20 h-20 text-emerald-500" /> : <XCircle className="w-20 h-20 text-rose-500" />}
          </div>
          
          <h2 className={`text-5xl font-black italic tracking-tighter mb-4 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isCorrect ? 'ACCESS GRANTED' : (timeLeft === 0 ? 'TIME EXPIRED' : 'SECURITY BREACH')}
          </h2>
          
          <p className="text-zinc-400 text-lg mb-12 text-center max-w-md">
            {isCorrect 
              ? `Increíble. Has descifrado la pregunta correctamente. +${Math.max(10, timeLeft * 5)} puntos.` 
              : `Fallo crítico. La respuesta correcta era: "${CYBER_QUESTIONS[currentQIdx].options[CYBER_QUESTIONS[currentQIdx].correctAnswer]}"`}
          </p>

          <button 
            onClick={nextQuestion}
            className="flex items-center gap-3 px-10 py-4 bg-white text-black font-black rounded-full transition-all active:scale-95 shadow-xl"
          >
            CONTINUE SCAN
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      )}

      {gameState === 'results' && (
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-10 animate-in fade-in zoom-in duration-500">
          <Award className="w-24 h-24 text-amber-500 mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
          <h2 className="text-4xl font-black italic tracking-tighter text-amber-500 mb-2 uppercase">Training Complete</h2>
          <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold mb-10 italic">Evaluation Rank: {score > 300 ? 'ELITE HACKER' : score > 150 ? 'SEC SPECIALIST' : 'SCRIPT KIDDIE'}</p>

          <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl mb-12 flex flex-col items-center min-w-[300px]">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">Final Neural Score</span>
            <span className="text-6xl font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{score.toLocaleString()}</span>
          </div>

          <button 
            onClick={startGame}
            className="flex items-center gap-4 px-12 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-black text-xl transition-all shadow-xl active:scale-95"
          >
            <RefreshCcw className="w-6 h-6" />
            REBOOT SYSTEM
          </button>
        </div>
      )}

      <div className="h-10 bg-black/50 border-t border-white/5 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-bold text-zinc-600">
          <div className="flex items-center gap-1"><Cpu className="w-3 h-3" /> System: Stable</div>
          <div className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Connection: Encrypted</div>
        </div>
        <div className="text-[9px] font-mono text-rose-900 uppercase">QuizEngine_V4_Build_322</div>
      </div>
    </div>
  );
};

export default CyberQuizApp;
