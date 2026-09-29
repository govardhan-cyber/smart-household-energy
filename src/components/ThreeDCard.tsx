import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt angle in degrees, default 10
  glareOpacity?: number; // max glare opacity, default 0.2
  translateZ?: number; // translateZ depth in pixels, default 0 to keep text crisp
}

export const ThreeDCard: React.FC<ThreeDCardProps> = ({
  children,
  className = "",
  maxTilt = 10,
  glareOpacity = 0.2,
  translateZ = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for relative mouse cursor position within the card (from 0 to 1)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Detect mobile and touch devices to bypass 3D calculations and prevent sticky/jittery transforms
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    const checkTouch = () => {
      const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches);
      setIsTouchDevice(isMobile);
    };
    checkTouch();
    window.addEventListener("resize", checkTouch);
    return () => window.removeEventListener("resize", checkTouch);
  }, []);

  // Smooth springs for 3D rotation
  const rotateXSpring = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), { damping: 25, stiffness: 200 });
  const rotateYSpring = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), { damping: 25, stiffness: 200 });

  // Glare position motion values
  const glareX = useSpring(useTransform(x, [0, 1], [0, 100]), { damping: 25, stiffness: 200 });
  const glareY = useSpring(useTransform(y, [0, 1], [0, 100]), { damping: 25, stiffness: 200 });
  const glareOpacityVal = useSpring(useMotionValue(0), { damping: 20, stiffness: 150 });
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 80%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize position to 0..1 range
    x.set(mouseX / width);
    y.set(mouseY / height);
    glareOpacityVal.set(glareOpacity);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    // Reset rotations to 0 when mouse leaves
    x.set(0.5);
    y.set(0.5);
    glareOpacityVal.set(0);
  };

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    glareOpacityVal.set(glareOpacity);
  };

  // Determine if a custom height (e.g. h-full, h-fit, h-[300px]) is requested
  const hasHeightClass = className.split(" ").some((c) => c.startsWith("h-"));
  const heightClass = hasHeightClass ? "h-full" : "h-fit";

  if (isTouchDevice) {
    return (
      <div className={`w-full relative overflow-hidden rounded-3xl ${heightClass} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      style={{ perspective: 1200 }}
      className={`w-full flex justify-center ${heightClass}`}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          z: 0.01, // Force translation layer for rendering stability
          transformStyle: translateZ > 0 ? "preserve-3d" : "flat",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          outline: "1px solid transparent", // Hack for sub-pixel anti-aliasing
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
        className={`w-full relative overflow-hidden rounded-3xl transition-shadow duration-300 ${heightClass} ${className}`}
      >
        {/* Children content rendered inside 3D space with customizable Z translation depth */}
        {/* Using flat rendering and avoiding translateZ when translateZ=0 preserves crisp subpixel text */}
        <div 
          style={translateZ > 0 ? { 
            transform: `translateZ(${translateZ}px)`, 
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale"
          } : {
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale"
          }} 
          className={`w-full relative z-10 ${heightClass}`}
        >
          {children}
        </div>

        {/* Dynamic glossy glare overlay */}
        <motion.div
          style={{
            background: glareBackground,
            opacity: glareOpacityVal,
          }}
          className="absolute inset-0 pointer-events-none z-20"
        />
      </motion.div>
    </div>
  );
};
