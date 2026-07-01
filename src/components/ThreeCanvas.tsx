import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const ThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // --- SETUP SCENE, CAMERA, RENDERER ---
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Groups for layout
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- MATERIALS ---
    const coreMat = new THREE.MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });

    const orbitMat = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.15
    });

    const particleMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.95
    });

    // Theme update function
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      coreMat.color.setHex(isDark ? 0x10b981 : 0x3b82f6); // emerald vs blue
      coreMat.opacity = isDark ? 0.22 : 0.18;

      orbitMat.color.setHex(isDark ? 0x047857 : 0x1d4ed8); // dark green vs royal blue
      orbitMat.opacity = isDark ? 0.25 : 0.2;

      particleMat.color.setHex(isDark ? 0x34d399 : 0x60a5fa); // light emerald vs light blue
    };
    updateColors();

    const themeObs = new MutationObserver(updateColors);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // --- 1. ROTATING REACTOR CORE ---
    // Beautiful wireframe Icosahedron Core
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Second inner core geometry (nested core for complex glow look)
    const innerCoreGeo = new THREE.OctahedronGeometry(0.85, 1);
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, coreMat);
    mainGroup.add(innerCoreMesh);

    // --- 2. ELLIPTICAL ORBITS ---
    const orbits: { group: THREE.Group; speedX: number; speedY: number; speedZ: number }[] = [];
    const orbitCount = 3;

    for (let i = 0; i < orbitCount; i++) {
      const orbitGroup = new THREE.Group();
      
      // Draw orbit path
      const points: THREE.Vector3[] = [];
      const segments = 64;
      const radiusX = 2.4 + i * 0.45;
      const radiusY = 1.3 + i * 0.25;

      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, 0));
      }

      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitGroup.add(orbitLine);

      // Rotate orbit plane differently
      orbitGroup.rotation.x = Math.random() * Math.PI;
      orbitGroup.rotation.y = Math.random() * Math.PI;

      mainGroup.add(orbitGroup);

      // Add floating energy particles on this orbit
      const pGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 8, 8);
      const pMesh = new THREE.Mesh(pGeo, particleMat);
      orbitGroup.add(pMesh);

      orbits.push({
        group: orbitGroup,
        speedX: 0.005 * (i + 1),
        speedY: 0.003 * (i + 1),
        speedZ: 0.008 * (i + 1)
      });
    }

    // --- MOUSE MOVEMENT INTERACTIVE PARALLAX ---
    const onMM = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseRef.current.tx = (e.clientX - cx) / (rect.width / 2);
      mouseRef.current.ty = (e.clientY - cy) / (rect.height / 2);
    };

    window.addEventListener("mousemove", onMM);

    // --- ANIMATION LOOP ---
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (document.hidden || window.matchMedia("print").matches) return;

      const elapsed = clock.getElapsedTime();

      // Core rotation
      coreMesh.rotation.y = elapsed * 0.12;
      coreMesh.rotation.x = elapsed * 0.07;

      innerCoreMesh.rotation.y = -elapsed * 0.18;
      innerCoreMesh.rotation.z = elapsed * 0.09;

      // Orbit particles moving along path
      orbits.forEach((orbit, index) => {
        // Pulse particles slightly
        const pMesh = orbit.group.children[1] as THREE.Mesh;
        if (pMesh) {
          const t = elapsed * (0.45 - index * 0.08);
          // Parametric coordinates matching orbit radiusX and radiusY
          const radiusX = 2.4 + index * 0.45;
          const radiusY = 1.3 + index * 0.25;
          pMesh.position.x = Math.cos(t) * radiusX;
          pMesh.position.y = Math.sin(t) * radiusY;
          
          // Subtle scale pulse
          const scale = 1 + Math.sin(elapsed * 4 + index) * 0.2;
          pMesh.scale.setScalar(scale);
        }

        // Slow rotate the orbit axes themselves
        orbit.group.rotation.x += orbit.speedX * 0.1;
        orbit.group.rotation.y += orbit.speedY * 0.1;
      });

      // Smooth camera interpolation based on mouse
      const mouse = mouseRef.current;
      mouse.x += (mouse.tx - mouse.x) * 0.07;
      mouse.y += (mouse.ty - mouse.y) * 0.07;

      mainGroup.rotation.y = mouse.x * 0.45;
      mainGroup.rotation.x = -mouse.y * 0.45;

      renderer.render(scene, camera);
    };
    animate();

    // --- RESIZE ---
    const resize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const W = containerRef.current.clientWidth;
      const H = containerRef.current.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      themeObs.disconnect();
      window.removeEventListener("mousemove", onMM);
      
      // Clean up geometries/materials
      renderer.dispose();
      coreGeo.dispose();
      innerCoreGeo.dispose();
      coreMat.dispose();
      orbitMat.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
