import { useRef, useState, useEffect, useCallback } from 'react';

export function useSignaturePad({ strokeColor = '#0f172a', strokeWidth = 2.5 } = {}) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const [strokeCount, setStrokeCount] = useState(0);
  const [color, setColor] = useState(strokeColor);

  const getCanvasCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
  }, [color, strokeWidth]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  const startDrawing = (e) => {
    if (e.type === 'touchstart') e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    isDrawing.current = true;
    const coords = getCanvasCoordinates(e, canvas);
    lastPoint.current = coords;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    if (e.type === 'touchmove') e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(e, canvas);

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPoint.current = coords;
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      setStrokeCount((prev) => prev + 1);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeCount(0);
  };

  const toDataURL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  // Helper to generate signature from typed text
  const generateTypedSignature = (text, fontStyle = 'Caveat') => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 600;
    tempCanvas.height = 180;
    const ctx = tempCanvas.getContext('2d');

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 600, 180);

    ctx.font = `italic 54px "${fontStyle}", cursive`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 300, 90);

    return tempCanvas.toDataURL('image/png');
  };

  return {
    canvasRef,
    color,
    setColor,
    clear,
    toDataURL,
    isEmpty: strokeCount === 0,
    strokeCount,
    startDrawing,
    draw,
    stopDrawing,
    generateTypedSignature,
  };
}
