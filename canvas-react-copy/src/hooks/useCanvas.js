import { useRef, useEffect, useCallback } from "react";

export const useCanvas = ({ onInit, onDraw, onResize, dependencies = [] }) => {
  const canvasRef = useRef();
  const animationRef = useRef();
  const systemRef = useRef();

  const startAnimation = useCallback(() => {
    const animate = () => {
      if (canvasRef.current && onDraw) {
        const ctx = canvasRef.current.getContext("2d");
        onDraw(ctx, canvasRef.current, systemRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, [onDraw]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      if (onResize && systemRef.current) {
        onResize(canvas, systemRef.current);
      }
    }
  }, [onResize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (onInit) {
      systemRef.current = onInit(canvas, canvas.getContext("2d"));
    }

    if (onResize && systemRef.current) {
      onResize(canvas, systemRef.current);
    }

    startAnimation();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      stopAnimation();
      window.removeEventListener("resize", resizeCanvas);
      if (
        systemRef.current &&
        typeof systemRef.current.destroy === "function"
      ) {
        systemRef.current.destroy();
      }
    };
  }, dependencies);

  return {
    canvasRef,
    canvas: canvasRef.current,
    system: systemRef.current,
    startAnimation,
    stopAnimation,
    resizeCanvas,
  };
};
