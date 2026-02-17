
import React, { useState } from 'react';

const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleClick = (val: string) => {
    if (val === 'AC') {
      setDisplay('0');
      setEquation('');
      return;
    }
    if (val === '=') {
      try {
        const result = eval(equation.replace('×', '*').replace('÷', '/'));
        setDisplay(String(result));
        setEquation(String(result));
      } catch {
        setDisplay('Error');
        setEquation('');
      }
      return;
    }
    
    if (display === '0' || display === 'Error') {
      setDisplay(val);
      setEquation(val);
    } else {
      setDisplay(prev => prev + val);
      setEquation(prev => prev + val);
    }
  };

  const buttons = [
    'AC', '+/-', '%', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '='
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900 p-4">
      <div className="flex-shrink-0 flex flex-col justify-end items-end p-6 mb-4 bg-black/40 rounded-2xl min-h-[120px]">
        <div className="text-zinc-500 text-sm sm:text-lg overflow-hidden whitespace-nowrap mb-1">
          {equation || ' '}
        </div>
        <div className="text-white text-4xl sm:text-6xl font-light tracking-tight truncate w-full text-right">
          {display}
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-4 grid-rows-5 gap-2">
        {buttons.map(btn => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`flex items-center justify-center rounded-2xl text-xl sm:text-2xl font-medium transition-all active:scale-95 ${
              btn === '=' ? 'col-span-1 bg-blue-600 hover:bg-blue-500 text-white shadow-lg' :
              ['÷', '×', '-', '+'].includes(btn) ? 'bg-zinc-800 hover:bg-zinc-700 text-blue-400' :
              ['AC', '+/-', '%'].includes(btn) ? 'bg-zinc-800 hover:bg-zinc-700 text-rose-400' :
              'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorApp;
