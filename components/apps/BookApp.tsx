
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, MousePointer2 } from 'lucide-react';

const STORY_PAGES = [
  {
    type: 'cover',
    title: 'SILVIA',
    subtitle: 'Entre Sombras y Traiciones',
    author: 'La Saga Completa'
  },
  {
    type: 'chapter',
    title: 'ENTREGA I',
    subtitle: 'El pasillo',
    content: [
      "Era una mañana gris cuando sus miradas se cruzaron por primera vez. Silvia, una chica tranquila con una sonrisa que iluminaba cualquier rincón, caminaba por el pasillo hacia su aula. Cesc, un joven extrovertido y lleno de energía, bajó la mirada de su celular justo cuando ella pasó cerca de él.",
      "Fue un instante, solo un segundo, pero algo dentro de él se despertó, una chispa, una conexión inexplicable. Y cuando Silvia lo miró, también supo que algo había cambiado.",
      "Desde ese día, comenzaron a hablar en secreto. En los pasillos, entre clases, sin que nadie los viera. Había algo mágico en esos pequeños momentos compartidos: risas furtivas, miradas cómplices, palabras que nacían de un sentimiento tan profundo que a veces les resultaba difícil comprenderlo.",
      "Las semanas pasaron como un sueño. Pero el destino tenía sus propios planes. Silvia recibió una oferta de trabajo en Italia. El día que debía irse, Cesc corrió al aeropuerto, pero en el camino, cayó sobre las vías del tren. Un tren llegó sin detenerse y Cesc perdió la vida en el acto.",
      "Años más tarde, Silvia regresó al pasillo de la escuela. Allí, sintió una paz que nunca había experimentado antes. Sabía que Cesc siempre estaría con ella."
    ]
  },
  {
    type: 'chapter',
    title: 'ENTREGA II',
    subtitle: 'Crisis en Somalia',
    content: [
      "Silvia decidió dejar atrás su vida en España y comenzar de nuevo en Italia. Allí conoció a Lucia, una persona fascinante y misteriosa. Sin embargo, lo que comenzó como una amistad se convirtió en una pesadilla cuando Silvia fue secuestrada por un grupo armado.",
      "Descubrió que todo era parte de un plan de Lucia, quien en realidad era un espía infiltrado en una red clandestina. Silvia se vio envuelta en una peligrosa misión que la llevó hasta las costas desérticas de Somalia.",
      "En su lucha por escapar, Silvia se alió con un grupo de rebeldes. La conexión con Lucia se convirtió en una batalla psicológica entre el amor, la traición y el poder. Al final, Silvia logró escapar, decidida a tomar las riendas de su propio destino y destruir la red que había manipulado su vida."
    ]
  },
  {
    type: 'chapter',
    title: 'ENTREGA III',
    subtitle: 'El rescate',
    content: [
      "Silvia fundó 'El Rescate' junto a Mario, un hombre que también había perdido a su familia a manos de bandas criminales. Juntos, reclutaron expertos para desmantelar redes de tráfico y corrupción. El amor entre ellos floreció en medio de la lucha.",
      "Una noche, cayeron en una trampa en una fortaleza en el desierto. Mario, en un acto heroico, decidió sacrificarse para que el equipo pudiera escapar. Activó una serie de explosivos que destruyeron la base enemiga y su propia vida.",
      "Silvia logró escapar con el corazón roto. La victoria fue amarga, pero se comprometió a continuar la lucha. En cada misión, sentía la presencia de Mario guiándola."
    ]
  },
  {
    type: 'chapter',
    title: 'ENTREGA IV',
    subtitle: 'Sombras del pasado',
    content: [
      "Silvia se retiró a una casa en las montañas para sanar. Los recuerdos de Cesc, Mario y Lucia la acosaban. Fue entonces cuando Manel, su amigo de toda la vida y confidente, apareció para apoyarla.",
      "Durante semanas, Manel la acompañó en su proceso de curación, ayudándola a enfrentar las emociones que tanto temía. Silvia comprendió que el dolor no desaparecía, pero que podía aprender a vivir con él.",
      "Manel le recordó que no estaba sola. Tras meses de reflexión, Silvia se sintió lista para regresar al mundo con una nueva perspectiva, habiendo hecho las paces con su pasado."
    ]
  },
  {
    type: 'chapter',
    title: 'ENTREGA V',
    subtitle: 'Una nueva amenaza',
    content: [
      "Silvia había quedado con Manel para tomar un café, pero al llegar a su apartamento, lo encontró oscuro y vacío. De repente, escuchó un disparo. Al entrar en la habitación, vio a Manel tendido sin vida sobre la cama.",
      "En la pared, un mensaje escrito con sangre: 'Voy a por ti, Silvia. L.' Lucia había vuelto. La traidora, la sombra que creía haber enterrado, estaba de caza.",
      "Silvia contactó a su viejo equipo de 'El Rescate'. Luca, Camila y Gerson se unieron a ella. Las pistas los llevaron a Viktor Solovov, un traficante que les reveló el paradero de Lucia: un antiguo búnker de la Guerra Fría en los Balcanes."
    ]
  },
  {
    type: 'chapter',
    title: 'ENTREGA VI',
    subtitle: 'La Fortaleza Olvidada',
    content: [
      "El equipo aterrizó en los Balcanes. Mientras se infiltraban en el complejo masivo, Silvia escuchó a Lucia revelar su verdadero plan: activar un pulso electromagnético (PEM) para desestabilizar a los gobiernos de la región y tomar el control total.",
      "No era solo una cacería personal; era un golpe de estado a gran escala. El recuerdo de Manel le dio a Silvia la fuerza necesaria. Esta vez, la batalla final no terminaría hasta que Lucia fuera detenida para siempre."
    ]
  },
  {
    type: 'chapter',
    title: 'ENTREGA VII',
    subtitle: 'El Pulso',
    content: [
      "Silvia se infiltró en el centro de control mientras Gerson y Luca iban a por el generador del PEM. Silvia se enfrentó cara a cara con Lucia. 'El único orden que verás es tu final', sentenció Silvia apuntando con su arma.",
      "Lucia se defendió con una daga curva y comenzó una lucha feroz. Mientras tanto, en el nivel inferior, el generador comenzó a sobrecargarse a pesar de los códigos de anulación de Camila.",
      "Silvia logró inmovilizar a Lucia. 'Se acabó', dijo. Pero Lucia se burló: 'Siempre subestimas mi Plan B'. En ese instante, el temporizador llegó a cero y una luz cegadora llenó la sala..."
    ]
  }
];

const BookApp: React.FC = () => {
  // leftPageIndex representa el índice de la página que se ve a la izquierda.
  // -1 significa que el libro está cerrado (la portada es la página 0 a la derecha).
  const [leftPageIndex, setLeftPageIndex] = useState(-1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward' | null>(null);

  const nextPage = () => {
    if (isFlipping || leftPageIndex >= STORY_PAGES.length - 1) return;
    setFlipDirection('forward');
    setIsFlipping(true);
    // Cambiamos el índice justo al final de la animación para que coincida perfectamente
    setTimeout(() => {
      setLeftPageIndex(prev => prev + 2);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 800); // Sincronizado con la duración del CSS
  };

  const prevPage = () => {
    if (isFlipping || leftPageIndex < 0) return;
    setFlipDirection('backward');
    setIsFlipping(true);
    setTimeout(() => {
      setLeftPageIndex(prev => prev - 2);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 800);
  };

  const renderPageContent = (index: number) => {
    const page = STORY_PAGES[index];
    if (!page) return <div className="w-full h-full bg-[#e5e1d5] opacity-20" />;

    if (page.type === 'cover') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-[#1a1c2c] text-[#94b0c2] shadow-inner relative overflow-hidden border-l border-black/20">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")' }}></div>
          <div className="mb-8 border-2 border-[#94b0c2] p-4 flex items-center justify-center rounded-full">
            <BookOpen className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-serif font-black mb-4 tracking-widest text-white leading-tight">{page.title}</h1>
          <div className="h-px w-24 bg-[#94b0c2] my-4 opacity-40"></div>
          <p className="text-lg italic font-serif opacity-80 max-w-[80%]">{page.subtitle}</p>
          <div className="mt-16 font-serif text-xs uppercase tracking-widest opacity-40">{page.author}</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-[#fdfaf1] p-8 text-[#2c1b10] font-serif shadow-inner border-x border-black/5 overflow-hidden">
        <div className="text-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold tracking-widest text-[#1a1c2c]">{page.title}</h2>
          <p className="text-[10px] italic opacity-60 mt-1 uppercase text-rose-800">{page.subtitle}</p>
          <div className="h-px w-12 bg-[#2c1b10] mx-auto mt-2 opacity-20"></div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 text-base text-justify leading-relaxed custom-scrollbar pr-2 font-medium">
          {page.content?.map((p: string, i: number) => (
            <p key={i}>
              {i === 0 ? (
                <>
                  <span className="float-left text-5xl font-bold mr-2 mt-1 leading-[0.8] text-[#1a1c2c]">{p[0]}</span>
                  {p.substring(1)}
                </>
              ) : p}
            </p>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-black/5 text-center text-[10px] opacity-40 italic flex-shrink-0">
          — {index + 1} —
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#050508] items-center justify-center p-4 sm:p-12 overflow-hidden select-none">
      
      {/* Contenedor del Libro 3D */}
      <div className="relative flex w-full max-w-5xl aspect-[1.4/1] perspective-3000">
        
        {/* PÁGINA IZQUIERDA BASE (Lo que está debajo cuando giras) */}
        <div className="flex-1 h-full relative preserve-3d z-10">
          <div className="absolute inset-0 rounded-l-lg overflow-hidden shadow-2xl bg-[#fdfaf1]">
            {/* Si estamos girando hacia atrás, mostramos la página destino ya cargada abajo */}
            {isFlipping && flipDirection === 'backward' 
              ? renderPageContent(leftPageIndex - 2) 
              : (leftPageIndex === -1 ? <div className="w-full h-full bg-black/60" /> : renderPageContent(leftPageIndex))
            }
          </div>
        </div>

        {/* PÁGINA DERECHA BASE (Lo que está debajo cuando giras) */}
        <div className="flex-1 h-full relative preserve-3d z-10">
          <div className="absolute inset-0 rounded-r-lg overflow-hidden shadow-2xl bg-[#fdfaf1]">
             {/* Si estamos girando hacia adelante, mostramos la página destino ya cargada abajo */}
             {isFlipping && flipDirection === 'forward'
              ? renderPageContent(leftPageIndex + 3)
              : (leftPageIndex + 1 >= STORY_PAGES.length ? (
                <div className="w-full h-full bg-[#1a1c2c] shadow-inner flex items-center justify-center border-l border-black/40">
                  <span className="text-[#94b0c2] text-xs uppercase tracking-widest opacity-20 font-serif">Fin de la saga</span>
                </div>
              ) : renderPageContent(leftPageIndex + 1))
             }
          </div>
        </div>

        {/* HOJA EN MOVIMIENTO (Precarga dinámica para evitar 'pop') */}
        {isFlipping && (
          <div className={`absolute top-0 bottom-0 w-1/2 h-full z-50 preserve-3d transition-transform ${flipDirection === 'forward' ? 'right-0 origin-left animate-flip-forward' : 'left-0 origin-right animate-flip-backward'}`}>
            {/* Cara visible inicial del giro */}
            <div className="absolute inset-0 backface-hidden rounded-r-lg overflow-hidden shadow-2xl z-20">
              {flipDirection === 'forward' 
                ? renderPageContent(leftPageIndex + 1) // Derecha actual que sube
                : renderPageContent(leftPageIndex)   // Izquierda actual que sube
              }
            </div>
            {/* Cara posterior que aparece al girar (precargada) */}
            <div className="absolute inset-0 backface-hidden rounded-l-lg overflow-hidden shadow-2xl z-10 rotate-y-180 bg-[#fdfaf1]">
              {flipDirection === 'forward' 
                ? renderPageContent(leftPageIndex + 2) // Nueva izquierda
                : renderPageContent(leftPageIndex - 1) // Nueva derecha
              }
            </div>
          </div>
        )}

        {/* Lomo y sombreado central */}
        <div className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-black/50 via-black/10 to-black/50 z-40 pointer-events-none"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-white/5 z-40 pointer-events-none"></div>
      </div>

      {/* CONTROLES DE NAVEGACIÓN REDISEÑADOS */}
      <div className="flex items-center gap-12 mt-12 z-[100]">
        <button 
          onClick={prevPage}
          disabled={leftPageIndex < 0 || isFlipping}
          className="group relative flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold tracking-widest text-xs uppercase">Anterior</span>
        </button>

        <div className="flex flex-col items-center min-w-[150px]">
           <div className="text-zinc-500 font-serif text-[10px] tracking-[0.3em] uppercase mb-1 opacity-60">Saga de Silvia</div>
           <div className="text-white font-serif text-sm tracking-widest italic">
            {leftPageIndex < 0 ? 'Índice & Portada' : `Capítulo ${Math.floor(leftPageIndex/2) + 1}`}
           </div>
        </div>

        <button 
          onClick={nextPage}
          disabled={leftPageIndex >= STORY_PAGES.length - 2 || isFlipping}
          className="group relative flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="font-bold tracking-widest text-xs uppercase">Siguiente</span>
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="mt-8 text-zinc-600 text-[9px] uppercase tracking-[0.4em] font-black pointer-events-none opacity-40">
        Engine: PaperSim v3.0 // 3D Book Layout
      </div>

      <style>{`
        .perspective-3000 { perspective: 3500px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }

        @keyframes flipForward {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-180deg); }
        }

        @keyframes flipBackward {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }

        .animate-flip-forward {
          animation: flipForward 0.8s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
        }

        .animate-flip-backward {
          animation: flipBackward 0.8s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
        }

        .shadow-inner {
          background-image: url('https://www.transparenttextures.com/patterns/paper.png');
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.08);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default BookApp;
