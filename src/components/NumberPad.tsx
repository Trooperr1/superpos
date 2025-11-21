import { BackspaceIcon } from '@heroicons/react/24/outline';

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm?: () => void;
  maxValue?: number;
  showDecimal?: boolean;
}

const NumberPad = ({ value, onChange, onConfirm, maxValue, showDecimal = true }: NumberPadProps) => {
  const handleNumber = (num: string) => {
    let newValue = value + num;
    // Prevent multiple decimals
    if (num === '.' && value.includes('.')) return;
    // Limit decimal places to 2
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1]?.length >= 2) return;
    }
    // Check max value
    if (maxValue && parseFloat(newValue) > maxValue) return;
    onChange(newValue);
  };

  const handleClear = () => {
    onChange('');
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const buttonBase = "flex items-center justify-center rounded-lg font-bold text-xl transition-all touch-button py-4";

  return (
    <div className="flex flex-col gap-2">
      {/* Display */}
      <div className="rounded-lg bg-gray-100 p-4 text-left">
        <p className="text-3xl font-bold text-gray-800 min-h-[40px]">
          {value || '0'}
        </p>
      </div>

      {/* Number Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Row 1: 7, 8, 9 */}
        {['7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className={`${buttonBase} bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-100`}
          >
            {num}
          </button>
        ))}

        {/* Row 2: 4, 5, 6 */}
        {['4', '5', '6'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className={`${buttonBase} bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-100`}
          >
            {num}
          </button>
        ))}

        {/* Row 3: 1, 2, 3 */}
        {['1', '2', '3'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className={`${buttonBase} bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-100`}
          >
            {num}
          </button>
        ))}

        {/* Row 4: Clear, 0, Backspace */}
        <button
          onClick={handleClear}
          className={`${buttonBase} bg-red-500 text-white hover:bg-red-600 kurdish-text text-base`}
        >
          سڕینەوە
        </button>
        <button
          onClick={() => handleNumber('0')}
          className={`${buttonBase} bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-100`}
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className={`${buttonBase} bg-orange-500 text-white hover:bg-orange-600`}
        >
          <BackspaceIcon className="h-6 w-6" />
        </button>

        {/* Row 5: 00, Decimal */}
        <button
          onClick={() => handleNumber('00')}
          className={`${buttonBase} bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-100`}
        >
          00
        </button>
        {showDecimal ? (
          <button
            onClick={() => handleNumber('.')}
            className={`${buttonBase} bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-100`}
          >
            .
          </button>
        ) : (
          <div />
        )}
        {onConfirm && (
          <button
            onClick={onConfirm}
            className={`${buttonBase} bg-emerald-600 text-white hover:bg-emerald-700 kurdish-text text-base`}
          >
            تەواو
          </button>
        )}
      </div>
    </div>
  );
};

export default NumberPad;
