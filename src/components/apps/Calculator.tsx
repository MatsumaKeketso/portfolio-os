import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../ui/button';

interface HistoryEntry {
  expression: string;
  result: string;
}

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [memory, setMemory] = useState<number>(0);

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
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      const expression = `${previousValue} ${operation} ${current}`;

      setDisplay(String(result));
      setHistory([{ expression, result: String(result) }, ...history].slice(0, 20));
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

  // Scientific functions
  const handleScientificOp = (func: string) => {
    const current = parseFloat(display);
    let result: number;
    let expression: string;

    switch (func) {
      case 'sin':
        result = Math.sin(current * Math.PI / 180);
        expression = `sin(${current})`;
        break;
      case 'cos':
        result = Math.cos(current * Math.PI / 180);
        expression = `cos(${current})`;
        break;
      case 'tan':
        result = Math.tan(current * Math.PI / 180);
        expression = `tan(${current})`;
        break;
      case 'sqrt':
        result = Math.sqrt(current);
        expression = `√(${current})`;
        break;
      case 'square':
        result = current * current;
        expression = `${current}²`;
        break;
      case 'ln':
        result = Math.log(current);
        expression = `ln(${current})`;
        break;
      case 'log':
        result = Math.log10(current);
        expression = `log(${current})`;
        break;
      case '1/x':
        result = 1 / current;
        expression = `1/${current}`;
        break;
      default:
        result = current;
        expression = String(current);
    }

    setDisplay(String(result));
    setHistory([{ expression, result: String(result) }, ...history].slice(0, 20));
    setNewNumber(true);
  };

  // Memory functions
  const handleMemoryOp = (op: string) => {
    const current = parseFloat(display);
    switch (op) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(String(memory));
        setNewNumber(true);
        break;
      case 'M+':
        setMemory(memory + current);
        break;
      case 'M-':
        setMemory(memory - current);
        break;
    }
  };

  // Calculator button helper - maps calculator-specific variants to design system variants
  const CalcButton = ({ children, onClick, className = '', span = false, variant = 'default' }: any) => {
    const variantMap: Record<string, any> = {
      default: 'soft-system-secondary',
      operation: 'soft-system-primary',
      clear: 'soft-brand-secondary',
      equals: 'solid-brand-primary',
      scientific: 'soft-brand-tertiary',
      memory: 'soft-brand-tertiary',
    };

    return (
      <Button
        onClick={onClick}
        variant={variantMap[variant] || 'soft-system-secondary'}
        size="calculator"
        className={`${className} ${span ? 'col-span-2' : ''}`}
      >
        {children}
      </Button>
    );
  };

  return (
    <div className="w-full h-full bg-black/50 flex">
      {/* History Sidebar */}
      {showHistory && (
        <div className="w-64 border-r border-white/[0.08] bg-black/30 flex flex-col">
          <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Icons.History className="w-4 h-4" />
              History
            </h3>
            <Button
              onClick={() => setHistory([])}
              variant="ghost"
              size="sm"
              title="Clear history"
              className="text-xs text-secondary-400 hover:text-secondary-300"
            >
              Clear
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {history.length === 0 ? (
              <p className="text-white/30 text-sm text-center mt-4">No calculations yet</p>
            ) : (
              history.map((entry, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    setDisplay(entry.result);
                    setNewNumber(true);
                  }}
                  variant="ghost"
                  className="w-full text-left p-2 h-auto justify-start mb-1"
                >
                  <div className="w-full">
                    <div className="text-white/40 text-xs truncate">{entry.expression}</div>
                    <div className="text-white font-semibold truncate">= {entry.result}</div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Calculator */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Display */}
        <div className="bg-black/30 rounded p-4 text-right border border-white/[0.08] mb-3">
          <div className="text-white/40 text-sm mb-1 h-5">
            {previousValue !== null && operation && `${previousValue} ${operation}`}
          </div>
          <div className="text-white text-3xl font-bold truncate">{display}</div>
          {memory !== 0 && (
            <div className="text-purple-400 text-xs mt-1">M: {memory}</div>
          )}
        </div>

        {/* Mode toggles */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant={showHistory ? 'solid-brand-primary' : 'soft-system-primary'}
            size="sm"
            className="flex-1"
          >
            <Icons.History className="w-3 h-3 inline mr-1" />
            History
          </Button>
          <Button
            onClick={() => setIsScientific(!isScientific)}
            variant={isScientific ? 'solid-brand-tertiary' : 'soft-system-primary'}
            size="sm"
            className="flex-1"
          >
            <Icons.FlaskConical className="w-3 h-3 inline mr-1" />
            Scientific
          </Button>
        </div>

        {/* Calculator buttons */}
        <div className="flex-1 grid grid-cols-4 gap-2 content-start">
          {/* Memory row */}
          {isScientific && (
            <>
              <CalcButton onClick={() => handleMemoryOp('MC')} variant="memory">MC</CalcButton>
              <CalcButton onClick={() => handleMemoryOp('MR')} variant="memory">MR</CalcButton>
              <CalcButton onClick={() => handleMemoryOp('M+')} variant="memory">M+</CalcButton>
              <CalcButton onClick={() => handleMemoryOp('M-')} variant="memory">M-</CalcButton>
            </>
          )}

          {/* Scientific functions */}
          {isScientific && (
            <>
              <CalcButton onClick={() => handleScientificOp('sin')} variant="scientific">sin</CalcButton>
              <CalcButton onClick={() => handleScientificOp('cos')} variant="scientific">cos</CalcButton>
              <CalcButton onClick={() => handleScientificOp('tan')} variant="scientific">tan</CalcButton>
              <CalcButton onClick={() => handleOperation('^')} variant="scientific">x^y</CalcButton>

              <CalcButton onClick={() => handleScientificOp('sqrt')} variant="scientific">√</CalcButton>
              <CalcButton onClick={() => handleScientificOp('square')} variant="scientific">x²</CalcButton>
              <CalcButton onClick={() => handleScientificOp('1/x')} variant="scientific">1/x</CalcButton>
              <CalcButton onClick={() => handleScientificOp('log')} variant="scientific">log</CalcButton>
            </>
          )}

          {/* Standard calculator */}
          <CalcButton onClick={handleClear} variant="clear">C</CalcButton>
          <Button onClick={() => handleOperation('÷')} variant="primary">÷</Button>
          <Button onClick={() => handleOperation('×')} variant="primary">×</Button>
          <Button onClick={() => handleOperation('-')} variant="primary">−</Button>

          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button onClick={() => handleOperation('+')} variant="primary">+</Button>

          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button onClick={() => handleNumber('(')} variant="primary">(</Button>

          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button onClick={() => handleNumber(')')} variant="primary">)</Button>

          <CalcButton onClick={() => handleNumber('0')} span>0</CalcButton>
          <Button onClick={handleDecimal}>.</Button>
          <Button variant="solid-brand-primary" onClick={handleEquals} >=</Button>
        </div>
      </div>
    </div>
  );
}
