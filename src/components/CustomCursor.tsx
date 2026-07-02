import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const CustomCursor: React.FC = () => {
  const [isMobile, setIsMobile] = useState(true);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Refs for tracking target changes to avoid redundant state updates
  const lastTargetRef = useRef<EventTarget | null>(null);
  const hoverRef = useRef(false);

  // Motion values for the cursor positions
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics for trailing follower ring (smooth spring settings)
  const springConfig = { damping: 30, stiffness: 300, mass: 0.4 };
  const trailX = useSpring(mouseX, springConfig);
  const trailY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if it's a mobile/tablet touch-only device (using User Agent)
    const checkDevice = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileUA);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    if (isMobile) return;

    // Add active class to document for cursor hiding CSS
    document.documentElement.classList.add("custom-cursor-active");

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    // Optimized hover detection: runs exactly once per element boundary crossing
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target === lastTargetRef.current) return;
      lastTargetRef.current = target;
      
      const tagName = target.tagName;
      let clickable = false;
      
      if (tagName === "A" || tagName === "BUTTON" || tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA") {
        clickable = true;
      } else {
        clickable = !!(
          target.closest("a") ||
          target.closest("button") ||
          target.closest('[role="button"]') ||
          target.classList.contains("clickable") ||
          target.style.cursor === "pointer"
        );
      }

      if (clickable !== hoverRef.current) {
        hoverRef.current = clickable;
        setIsHovered(clickable);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      // Spawn a ripple wave at the exact click coordinate
      const rippleId = Date.now() + Math.random();
      const newRipple = {
        id: rippleId,
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev, newRipple]);

      // Automatically clean up the ripple after animation completes
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== rippleId));
      }, 700);
    };
    
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isMobile, isVisible, mouseX, mouseY]);

  if (isMobile || !isVisible) return null;

  return (
    <>
      {/* 1. Inner Cursor Dot (GPU-accelerated, high contrast solid color) */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{ 
          x: mouseX, 
          y: mouseY,
          backgroundColor: "rgba(var(--cursor-color), 1)"
        }}
        animate={{
          scale: isClicked ? 0.8 : isHovered ? 0.4 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* 2. Outer Trailing Ring (GPU-accelerated) */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border-2 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center will-change-transform"
        style={{ 
          x: trailX, 
          y: trailY,
          borderColor: "rgba(var(--cursor-color), 0.3)"
        }}
        animate={{
          scale: isClicked ? 0.75 : isHovered ? 1.5 : 1,
          backgroundColor: isHovered ? "rgba(var(--cursor-color), 0.08)" : "rgba(var(--cursor-color), 0)"
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      />

      {/* 3. Independent Click Ripples (GPU-accelerated, Pinned to Click Location) */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="fixed w-12 h-12 border-2 rounded-full pointer-events-none z-[9997] -translate-x-1/2 -translate-y-1/2 will-change-transform"
            style={{
              left: ripple.x,
              top: ripple.y,
              borderColor: "rgba(var(--cursor-color), 0.8)",
              boxShadow: "0 0 10px rgba(var(--cursor-color), 0.25)"
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );
};
