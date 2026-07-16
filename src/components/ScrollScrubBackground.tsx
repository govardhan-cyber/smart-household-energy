import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const ScrollScrubBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const frameCount = 60;
  const imagePrefix = "/home_animation/Smart_house_with_energy_flow_202607111633_";
  const imageExtension = ".jpg";

  // Framer Motion spring physics for mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  // 1. Detect theme updates
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // 2. Preload the 60 frames on mount
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, "0");
      img.src = `${imagePrefix}${paddedIndex}${imageExtension}`;

      img.onload = () => {
        loadedCount++;
        const progress = Math.round((loadedCount / frameCount) * 100);
        setLoadingProgress(progress);
        if (loadedCount === frameCount) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
      loadedImages.push(img);
    }
  }, []);

  // 3. Draw on scroll and handle canvas sizing
  useEffect(() => {
    if (images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle resizing & fitting image cover mode
    const fitImageToCanvas = (img: HTMLImageElement) => {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.width;
      const imgHeight = img.height;

      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = canvasHeight * imgRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
      } else {
        drawHeight = canvasWidth / imgRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * Math.min(window.devicePixelRatio, 2);
      canvas.height = height * Math.min(window.devicePixelRatio, 2);

      // Re-draw current frame after resizing
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      const frameIndex = Math.max(0, Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount)));
      
      if (images[frameIndex] && images[frameIndex].complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fitImageToCanvas(images[frameIndex]);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial setup

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      const frameIndex = Math.max(0, Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount)));

      requestAnimationFrame(() => {
        if (images[frameIndex] && images[frameIndex].complete) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          fitImageToCanvas(images[frameIndex]);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [images]);

  // 4. Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x * 12); // travel limit
      mouseY.set(y * 12);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* 1. Loading Overlay with progress bar */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-800 fill-none"
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-primary-green fill-none transition-all duration-300"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - loadingProgress / 100)}
              />
            </svg>
            <span className="absolute font-display text-sm font-bold">{loadingProgress}%</span>
          </div>
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase animate-pulse">
            Preloading 3D Animation...
          </span>
        </div>
      )}

      {/* 2. Interactive Canvas Container */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          scale: 1.01
        }}
        className="fixed inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none no-print"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover opacity-100 dark:opacity-90 transition-opacity duration-500"
        />
        
        {/* 3. Themed covers for maximum text contrast */}
        <div 
          className={`absolute inset-0 transition-colors duration-500 pointer-events-none ${
            isDark 
              ? "bg-slate-950/25" // Dark mode overlay vignette
              : "bg-slate-50/20"  // Light mode overlay wash
          }`} 
        />
      </motion.div>
    </>
  );
};
