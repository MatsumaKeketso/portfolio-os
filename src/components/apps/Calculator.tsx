import { useState } from 'react';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return a / b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewNumber(false);
    }
  };

  const Button = ({ children, onClick, className = '', span = false }: any) => (
    <button
      onClick={onClick}
      className={`h-14 rounded-lg font-semibold text-lg transition-all active:scale-95 ${className} ${
        span ? 'col-span-2' : ''
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full h-full bg-gray-900 p-4 flex flex-col">
      <div className="bg-gray-800 rounded-lg p-6 mb-4 text-right">
        <div className="text-gray-400 text-sm mb-1 h-6">
          {previousValue !== null && operation && `${previousValue} ${operation}`}
        </div>
        <div className="text-white text-4xl font-bold truncate">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-1">
        <Button onClick={handleClear} className="bg-red-600 hover:bg-red-700 text-white">
          C
        </Button>
        <Button onClick={() => handleOperation('÷')} className="bg-gray-700 hover:bg-gray-600 text-white">
          ÷
        </Button>
        <Button onClick={() => handleOperation('×')} className="bg-gray-700 hover:bg-gray-600 text-white">
          ×
        </Button>
        <Button onClick={() => handleOperation('-')} className="bg-gray-700 hover:bg-gray-600 text-white">
          −
        </Button>

        <Button onClick={() => handleNumber('7')} className="bg-gray-800 hover:bg-gray-700 text-white">
          7
        </Button>
        <Button onClick={() => handleNumber('8')} className="bg-gray-800 hover:bg-gray-700 text-white">
          8
        </Button>
        <Button onClick={() => handleNumber('9')} className="bg-gray-800 hover:bg-gray-700 text-white">
          9
        </Button>
        <Button onClick={() => handleOperation('+')} className="bg-gray-700 hover:bg-gray-600 text-white row-span-2">
          +
        </Button>

        <Button onClick={() => handleNumber('4')} className="bg-gray-800 hover:bg-gray-700 text-white">
          4
        </Button>
        <Button onClick={() => handleNumber('5')} className="bg-gray-800 hover:bg-gray-700 text-white">
          5
        </Button>
        <Button onClick={() => handleNumber('6')} className="bg-gray-800 hover:bg-gray-700 text-white">
          6
        </Button>

        <Button onClick={() => handleNumber('1')} className="bg-gray-800 hover:bg-gray-700 text-white">
          1
        </Button>
        <Button onClick={() => handleNumber('2')} className="bg-gray-800 hover:bg-gray-700 text-white">
          2
        </Button>
        <Button onClick={() => handleNumber('3')} className="bg-gray-800 hover:bg-gray-700 text-white">
          3
        </Button>
        <Button onClick={handleEquals} className="bg-blue-600 hover:bg-blue-700 text-white row-span-2">
          =
        </Button>

        <Button onClick={() => handleNumber('0')} span className="bg-gray-800 hover:bg-gray-700 text-white">
          0
        </Button>
        <Button onClick={handleDecimal} className="bg-gray-800 hover:bg-gray-700 text-white">
          .
        </Button>
      </div>
    </div>
  );
}
