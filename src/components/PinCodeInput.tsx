'use client';

import React, { useRef } from 'react';

interface PinCodeInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function PinCodeInput({ value, onChange, disabled }: PinCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal) {
      const newValue = [...value];
      newValue[index] = '';
      onChange(newValue);
      return;
    }

    const newValue = [...value];
    newValue[index] = cleanVal.slice(-1);
    onChange(newValue);

    // Auto-focus next input
    if (index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const newValue = [...value];
        newValue[index - 1] = '';
        onChange(newValue);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newValue = [...value];
        newValue[index] = '';
        onChange(newValue);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData) {
      const newValue = [...value];
      for (let i = 0; i < 4; i++) {
        newValue[i] = pastedData[i] || '';
      }
      onChange(newValue);
      const focusIndex = Math.min(pastedData.length, 3);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center space-x-3 my-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          pattern="[0-9]*"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white disabled:bg-gray-100 text-gray-900"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
