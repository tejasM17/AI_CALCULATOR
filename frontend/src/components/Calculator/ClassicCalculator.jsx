import { useState, useRef, useEffect } from 'react';
import { Trash2, ArrowLeft, RotateCcw } from 'lucide-react';

const ClassicCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevResult, setPrevResult] = useState('');
  const [memory, setMemory] = useState(0);
  const displayRef = useRef(null);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [display]);

  const handleNumber = (num) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op) => {
    if (display === 'Error') return;

    if (['+', '-', '*', '/', '^'].includes(display.slice(-1)) && ['+', '-', '*', '/', '^'].includes(op)) {
      setDisplay(display.slice(0, -1) + op);
      return;
    }

    setDisplay(display + op);
  };

  const handleDecimal = () => {
    if (display === 'Error') return;
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setPrevResult('');
  };

  const handleAllClear = () => {
    setDisplay('0');
    setExpression('');
    setPrevResult('');
    setMemory(0);
  };

  const handleBackspace = () => {
    if (display === 'Error' || display.length <= 1) {
      setDisplay('0');
      return;
    }
    setDisplay(display.slice(0, -1));
  };

  const calculate = () => {
    try {
      let evalExpression = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');

      if (/[^\d\s+\-*/().^%√sincos tanloglnπe]/.test(evalExpression)) {
        throw new Error('Invalid characters');
      }

      evalExpression = evalExpression
        .replace(/√/g, 'Math.sqrt')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      const result = eval(evalExpression);

      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid calculation');
      }

      const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '');

      setPrevResult(display + ' =');
      setDisplay(formatted);
      setExpression(formatted);
    } catch (err) {
      setDisplay('Error');
      setPrevResult('');
    }
  };

  const handleMemory = (action) => {
    const current = parseFloat(display) || 0;
    switch (action) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(memory.toString());
        break;
      case 'M+':
        setMemory(memory + current);
        setDisplay('0');
        break;
      case 'M-':
        setMemory(memory - current);
        setDisplay('0');
        break;
      default:
        break;
    }
  };

  const buttons = [
    ['AC', 'MC', 'MR', 'M+'],
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
    ['C', '←', '%', '^'],
    ['(', ')', '√', 'sin'],
    ['cos', 'tan', 'log', 'ln'],
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Display */}
      <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="text-right text-sm text-gray-500 dark:text-gray-400 min-h-[1.5rem] mb-1 overflow-hidden">
          {prevResult}
        </div>
        <div
          ref={displayRef}
          className="text-right text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white overflow-x-auto whitespace-nowrap"
        >
          {display}
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-1.5 p-4 bg-gray-100 dark:bg-gray-800">
        {buttons.flat().map((btn, index) => {
          const isOperator = ['+', '-', '×', '÷', '^', '%', '√', 'sin', 'cos', 'tan', 'log', 'ln'].includes(btn);
          const isFunction = ['MC', 'MR', 'M+', 'M-', 'C', '←', 'AC'].includes(btn);
          const isEqual = btn === '=';

          return (
            <button
              key={index}
              onClick={() => {
                if (btn === '=') calculate();
                else if (btn === 'C') handleClear();
                else if (btn === 'AC') handleAllClear();
                else if (btn === '←') handleBackspace();
                else if (['MC', 'MR', 'M+', 'M-'].includes(btn)) handleMemory(btn);
                else if (['+', '-', '×', '÷', '^', '%'].includes(btn)) handleOperator(btn);
                else if (btn === '.') handleDecimal();
                else handleNumber(btn);
              }}
              className={`
                aspect-square rounded-2xl text-lg font-medium transition-all duration-150 active:scale-95
                ${
                  isEqual
                    ? 'bg-blue-600 hover:bg-blue-700 text-white col-span-1 row-span-2'
                    : isOperator
                    ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:text-orange-400'
                    : isFunction
                    ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    : 'bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }
              `}
            >
              {btn === '←' ? <ArrowLeft size={20} className="mx-auto" /> :
               btn === 'C' ? <RotateCcw size={20} className="mx-auto" /> :
               btn === 'AC' ? <Trash2 size={20} className="mx-auto" /> : btn}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClassicCalculator;