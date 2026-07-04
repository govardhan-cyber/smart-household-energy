import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface ThreeBackgroundProps {
  className?: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  hue: number;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ className = "-z-10" }) => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const isVisibleRef = useRef(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for spring parallax effect & click surge
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scaleValue = useMotionValue(1.02);

  // Motion values for hardware-accelerated spotlight
  const spotlightX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const spotlightY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);

  // Springs for smooth hardware acceleration
  const springX = useSpring(mouseX, { stiffness: 45, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 20 });
  const springScale = useSpring(scaleValue, { stiffness: 120, damping: 14 });
  const springSpotlightX = useSpring(spotlightX, { stiffness: 80, damping: 26 });
  const springSpotlightY = useSpring(spotlightY, { stiffness: 80, damping: 26 });

  const mouseRaw = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Listen for theme transitions
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let ticking = false;

    // Track mouse coordinates normalized between -0.5 and 0.5
    const handleMouseMove = (e: MouseEvent) => {
      mouseRaw.current.x = e.clientX;
      mouseRaw.current.y = e.clientY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const x = (mouseRaw.current.x / window.innerWidth) - 0.5;
          const y = (mouseRaw.current.y / window.innerHeight) - 0.5;
          mouseX.set(x * -35); // Max travel in opposite direction
          mouseY.set(y * -35);

          spotlightX.set(mouseRaw.current.x);
          spotlightY.set(mouseRaw.current.y);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Trigger elastic background zoom-pulse on click
    const handleMouseDown = () => {
      scaleValue.set(1.06);
      setTimeout(() => {
        scaleValue.set(1.02);
      }, 70);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [mouseX, mouseY, scaleValue, spotlightX, spotlightY]);

  // Particle engine for floating sparks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use IntersectionObserver to pause loop when out of viewport
    const visObserver = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0.01 });

    if (containerRef.current) {
      visObserver.observe(containerRef.current);
    }

    const ctx = canvas.getContext("2d")!;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", handleResize);

    const sparks: Spark[] = [];
    const MAX_SPARKS = 14;

    // Generate static sparks initially
    for (let i = 0; i < MAX_SPARKS; i++) {
      sparks.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 0.8 + Math.random() * 1.4,
        alpha: 0.1 + Math.random() * 0.5,
        decay: 0.002 + Math.random() * 0.004,
        hue: Math.random() > 0.55 ? 160 : 190
      });
    }

    let animId = 0;
    const animateSparks = () => {
      animId = requestAnimationFrame(animateSparks);
      if (!isVisibleRef.current || document.hidden || window.matchMedia("print").matches) return;

      const dark = document.documentElement.classList.contains("dark");
      ctx.clearRect(0, 0, W, H);

      // Draw delicate connection lines between nearby sparks first (underneath particles)
      ctx.lineWidth = 0.55;
      for (let i = 0; i < sparks.length; i++) {
        const s1 = sparks[i];
        for (let j = i + 1; j < sparks.length; j++) {
          const s2 = sparks[j];
          const dx = s1.x - s2.x;
          const dy = s1.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 85) {
            const alphaFactor = (1 - dist / 85) * 0.14;
            const finalAlpha = Math.min(alphaFactor, (s1.alpha + s2.alpha) / 2 * alphaFactor * 2.2);
            ctx.strokeStyle = dark
              ? `rgba(52, 211, 153, ${finalAlpha})` // Emerald
              : `rgba(99, 102, 241, ${finalAlpha})`;  // Indigo/Blue
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }
      }

      // Update & render sparks
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];

        // Move
        s.x += s.vx;
        s.y += s.vy;

        // Bounce off edges
        if (s.x < 0 || s.x > W) s.vx *= -1;
        if (s.y < 0 || s.y > H) s.vy *= -1;

        // Mouse repelling force field
        const dx = s.x - mouseRaw.current.x;
        const dy = s.y - mouseRaw.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          s.x += (dx / dist) * force * 1.3;
          s.y += (dy / dist) * force * 1.3;
        }

        // Pulse alpha
        s.alpha -= s.decay;
        if (s.alpha <= 0.05) {
          s.x = Math.random() * W;
          s.y = Math.random() * H;
          s.alpha = 0.3 + Math.random() * 0.5;
          s.vx = (Math.random() - 0.5) * 0.3;
          s.vy = (Math.random() - 0.5) * 0.3;
        }

        // Draw glowing particle
        ctx.beginPath();
        const fillAlpha = dark ? s.alpha * 0.65 : s.alpha * 0.6;
        ctx.fillStyle = s.hue === 160 
          ? `rgba(52, 211, 153, ${fillAlpha})` // Emerald
          : `rgba(34, 211, 238, ${fillAlpha})`;  // Cyan/Teal
        
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Soft halo glow
        if (s.alpha > 0.45) {
          ctx.beginPath();
          ctx.fillStyle = s.hue === 160
            ? `rgba(52, 211, 153, ${fillAlpha * 0.2})`
            : `rgba(34, 211, 238, ${fillAlpha * 0.2})`;
          ctx.arc(s.x, s.y, s.radius * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    animateSparks();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}>
      {/* Animated Zooming/Panning/Surging Luxury Background Image Wrapper */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          scale: springScale,
          width: "112%",
          height: "112%",
          left: "-6%",
          top: "-6%",
        }}
        className="absolute inset-0 select-none pointer-events-none will-change-transform"
      >
        <img
          src={isDark ? "/luxury_energy_bg.png" : "/luxury_light_bg.png"}
          alt="Luxury Technology Background"
          className={`w-full h-full object-cover transition-all duration-700 ${
            isDark 
              ? "opacity-75 brightness-[0.88] contrast-[1.15]" 
              : "opacity-85 brightness-[0.98] contrast-[1.08]"
          }`}
        />
      </motion.div>

      {/* Floating Spark & Constellation Canvas Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Dynamic Cursor Spotlight Layer (Hardware Accelerated translate3d & will-change-transform) */}
      <motion.div
        style={{
          x: springSpotlightX,
          y: springSpotlightY,
          translateX: "-50%",
          translateY: "-50%"
        }}
        className={`absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none blur-[100px] transition-opacity duration-500 will-change-transform ${
          isDark 
            ? "bg-[radial-gradient(circle,rgba(34,211,238,0.12)_0%,transparent_70%)]" 
            : "bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_75%)]"
        }`}
      />

      {/* Ambient background mesh gradient blobs for light mode */}
      {/* Ambient background mesh gradient blobs */}
      {isDark ? (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top-Right Glowing Emerald Blob */}
          <div className="absolute -top-[15%] -right-[5%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
          {/* Center-Left Glowing Cyan Blob */}
          <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
          {/* Bottom-Right Glowing Indigo Blob */}
          <div className="absolute -bottom-[15%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/[0.08] blur-[120px] pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top-Right Soft Indigo Glow */}
          <div className="absolute -top-[10%] -right-[5%] w-[45vw] h-[45vw] rounded-full bg-indigo-300/[0.22] blur-[120px] pointer-events-none" />
          {/* Center-Left Soft Cyan Glow */}
          <div className="absolute top-[25%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-cyan-300/[0.22] blur-[140px] pointer-events-none" />
          {/* Bottom-Right Soft Emerald Glow */}
          <div className="absolute -bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-emerald-200/[0.28] blur-[110px] pointer-events-none" />
        </div>
      )}

      {/* Edge Vignette & Light Masking Layer */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-colors duration-700 ${
          isDark 
            ? "bg-[radial-gradient(circle_at_center,transparent_30%,rgba(11,15,25,0.6)_100%)] bg-gradient-to-tr from-emerald-500/[0.12] via-transparent to-cyan-500/[0.12]" 
            : "bg-[radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.55)_100%)] bg-gradient-to-tr from-blue-500/[0.12] via-transparent to-indigo-500/[0.12]"
        }`} 
      />

      {/* Tech Grid Mask */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(99,102,241,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.035)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_75%,transparent_100%)] opacity-80"
      />
    </div>
  );
};
