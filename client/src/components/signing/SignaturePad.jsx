import React, { useState } from 'react';
import { Eraser, PenTool, Type, Check, RotateCcw } from 'lucide-react';
import { useSignaturePad } from '../../hooks/useSignaturePad';

export default function SignaturePad({ defaultName = '', onSignatureCapture }) {
  const [tab, setTab] = useState('draw'); // 'draw' | 'type'
  const [typedName, setTypedName] = useState(defaultName);
  const [fontChoice, setFontChoice] = useState('Caveat');

  const {
    canvasRef,
    color,
    setColor,
    clear,
    toDataURL,
    isEmpty,
    startDrawing,
    draw,
    stopDrawing,
    generateTypedSignature,
  } = useSignaturePad({ strokeColor: '#0f172a' });

  const colors = [
    { label: 'Black', value: '#0f172a', bg: 'bg-slate-900' },
    { label: 'Classic Blue', value: '#0d74ce', bg: 'bg-sky-600' },
    { label: 'Midnight Navy', value: '#1e3a8a', bg: 'bg-blue-900' },
  ];

  const handleCapture = () => {
    let signatureUrl = null;
    if (tab === 'draw') {
      if (isEmpty) return;
      signatureUrl = toDataURL();
    } else {
      if (!typedName.trim()) return;
      signatureUrl = generateTypedSignature(typedName.trim(), fontChoice);
    }

    if (signatureUrl && onSignatureCapture) {
      onSignatureCapture(signatureUrl);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Mode Tabs & Color Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setTab('draw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'draw'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Draw Signature
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('type');
              if (!typedName && defaultName) setTypedName(defaultName);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'type'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Type Signature
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">Ink:</span>
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-5 h-5 rounded-full ${c.bg} transition-transform ${
                color === c.value ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110' : 'opacity-80 hover:opacity-100'
              }`}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Main Drawing / Typing Canvas area */}
      {tab === 'draw' ? (
        <div className="space-y-2">
          <div className="relative w-full h-44 bg-neutral-50 border border-neutral-300 border-dashed rounded-xl overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              className="w-full h-full touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-400 text-sm select-none">
                Draw your signature here with mouse or finger
              </div>
            )}

            {/* Signature baseline guide */}
            <div className="absolute bottom-10 left-8 right-8 border-b border-neutral-300/60 pointer-events-none flex justify-between text-[10px] text-neutral-400 font-mono pb-1">
              <span>Sign above this line</span>
              <span>✖</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Draw your legal signature with mouse, stylus, or touch</span>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-red-600 hover:bg-neutral-100 px-2.5 py-1 rounded-md transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="e.g. Johnathan Doe"
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Font Picker */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-medium">Style:</span>
            <button
              type="button"
              onClick={() => setFontChoice('Caveat')}
              className={`text-xs px-3 py-1 rounded-lg border transition ${
                fontChoice === 'Caveat'
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Cursive Script
            </button>
            <button
              type="button"
              onClick={() => setFontChoice('Dancing Script')}
              className={`text-xs px-3 py-1 rounded-lg border transition ${
                fontChoice === 'Dancing Script'
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Calligraphy
            </button>
          </div>

          {/* Preview Box */}
          <div className="w-full h-32 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-center p-4">
            {typedName.trim() ? (
              <span
                style={{
                  fontFamily: fontChoice === 'Caveat' ? 'Caveat, cursive' : "'Dancing Script', cursive",
                  color: color,
                  fontSize: '2.5rem',
                }}
                className="select-none italic"
              >
                {typedName}
              </span>
            ) : (
              <span className="text-neutral-400 text-sm italic">Type your name above to see signature preview</span>
            )}
          </div>
        </div>
      )}

      {/* Accept & Adopt Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCapture}
          disabled={tab === 'draw' ? isEmpty : !typedName.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold py-2.5 rounded-xl shadow-sm transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          Apply Signature
        </button>
      </div>
    </div>
  );
}
