import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  className?: string;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ className = "-z-10" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  // Listen to global theme transitions
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // --- 1. SETUP SCENE, CAMERA, RENDERER ---
    const scene = new THREE.Scene();
    const clock = new THREE.Clock();

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // --- 2. THEME-DRIVEN COLORS & MATERIALS ---
    const colors = {
      globe: 0x2563eb,
      connections: 0x06b6d4,
      hubs: 0x10b981,
      packets: 0x22d3ee,
      waves1: 0x06b6d4,
      waves2: 0x10b981,
      nodes: 0x2563eb,
      constellation: 0x06b6d4
    };

    const globeMaterial = new THREE.LineBasicMaterial({
      color: colors.globe,
      transparent: true,
      opacity: 0.12,
    });

    const hubMaterial = new THREE.MeshBasicMaterial({
      color: colors.hubs,
      transparent: true,
      opacity: 0.8,
    });

    const arcMaterial = new THREE.LineBasicMaterial({
      color: colors.connections,
      transparent: true,
      opacity: 0.18,
    });

    const packetMaterial = new THREE.MeshBasicMaterial({
      color: colors.packets,
    });

    const waveMaterial1 = new THREE.LineBasicMaterial({
      color: colors.waves1,
      transparent: true,
      opacity: 0.18,
    });

    const waveMaterial2 = new THREE.LineBasicMaterial({
      color: colors.waves2,
      transparent: true,
      opacity: 0.15,
    });

    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: colors.nodes,
      transparent: true,
      opacity: 0.25,
    });

    const constellationMaterial = new THREE.LineBasicMaterial({
      color: colors.constellation,
      transparent: true,
      opacity: 0.08,
    });

    const updateThemeColors = () => {
      const isDarkTheme = document.documentElement.classList.contains("dark");
      
      if (isDarkTheme) {
        colors.globe = 0x10b981;
        colors.connections = 0x22d3ee;
        colors.hubs = 0x10b981;
        colors.packets = 0x22d3ee;
        colors.waves1 = 0x22d3ee;
        colors.waves2 = 0x10b981;
        colors.nodes = 0x06b6d4;
        colors.constellation = 0x22d3ee;
        
        globeMaterial.color.setHex(0x10b981);
        globeMaterial.opacity = 0.08;
        hubMaterial.color.setHex(0x10b981);
        hubMaterial.opacity = 0.7;
        arcMaterial.color.setHex(0x22d3ee);
        arcMaterial.opacity = 0.16;
        packetMaterial.color.setHex(0x22d3ee);
        waveMaterial1.color.setHex(0x22d3ee);
        waveMaterial1.opacity = 0.15;
        waveMaterial2.color.setHex(0x10b981);
        waveMaterial2.opacity = 0.12;
        nodeMaterial.color.setHex(0x06b6d4);
        nodeMaterial.opacity = 0.25;
        constellationMaterial.color.setHex(0x22d3ee);
        constellationMaterial.opacity = 0.08;
      } else {
        colors.globe = 0x3b82f6;
        colors.connections = 0x2563eb;
        colors.hubs = 0x2563eb;
        colors.packets = 0x1d4ed8;
        colors.waves1 = 0x3b82f6;
        colors.waves2 = 0x10b981;
        colors.nodes = 0x475569;
        colors.constellation = 0x3b82f6;

        globeMaterial.color.setHex(0x3b82f6);
        globeMaterial.opacity = 0.07;
        hubMaterial.color.setHex(0x2563eb);
        hubMaterial.opacity = 0.5;
        arcMaterial.color.setHex(0x2563eb);
        arcMaterial.opacity = 0.1;
        packetMaterial.color.setHex(0x1d4ed8);
        waveMaterial1.color.setHex(0x3b82f6);
        waveMaterial1.opacity = 0.1;
        waveMaterial2.color.setHex(0x10b981);
        waveMaterial2.opacity = 0.08;
        nodeMaterial.color.setHex(0x475569);
        nodeMaterial.opacity = 0.15;
        constellationMaterial.color.setHex(0x3b82f6);
        constellationMaterial.opacity = 0.06;
      }
    };

    // --- 3. GLOBAL CITY-GRID GLOBE LAYOUT ---
    const globeMeshGroup = new THREE.Group();
    // Default position is updated dynamically in handleResize for responsiveness
    globeMeshGroup.position.set(-3.5, 1.8, 0);
    scene.add(globeMeshGroup);

    const globeGeometry = new THREE.SphereGeometry(3.5, 18, 18);
    const globeEdges = new THREE.EdgesGeometry(globeGeometry);
    const globeWireframe = new THREE.LineSegments(globeEdges, globeMaterial);
    globeMeshGroup.add(globeWireframe);

    const getSphericalPos = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.cos(theta)
      );
    };

    const cities = [
      { name: "New York", lat: 40.7128, lon: -74.0060 },
      { name: "London", lat: 51.5074, lon: -0.1278 },
      { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
      { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
      { name: "Sydney", lat: -33.8688, lon: 151.2093 },
      { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
      { name: "Johannesburg", lat: -26.2041, lon: 28.0473 },
      { name: "Dubai", lat: 25.2048, lon: 55.2708 },
    ];

    const hubGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const hubPoints: THREE.Vector3[] = [];
    const hubsGroup = new THREE.Group();

    cities.forEach((c) => {
      const pos = getSphericalPos(c.lat, c.lon, 3.5);
      const mesh = new THREE.Mesh(hubGeometry, hubMaterial);
      mesh.position.copy(pos);
      hubsGroup.add(mesh);
      hubPoints.push(pos);
    });
    globeMeshGroup.add(hubsGroup);

    const links = [
      [0, 1],
      [1, 7],
      [7, 3],
      [3, 2],
      [2, 4],
      [4, 5],
      [5, 0],
      [1, 6],
      [6, 7],
    ];

    const arcGroup = new THREE.Group();
    const arcCurves: THREE.QuadraticBezierCurve3[] = [];

    links.forEach(([i, j]) => {
      const p1 = hubPoints[i];
      const p2 = hubPoints[j];
      const dist = p1.distanceTo(p2);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(3.5 + dist * 0.22);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      arcCurves.push(curve);

      const points = curve.getPoints(20);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, arcMaterial);
      arcGroup.add(line);
    });
    globeMeshGroup.add(arcGroup);

    const packetGeometry = new THREE.SphereGeometry(0.04, 6, 6);
    const packetsGroup = new THREE.Group();
    globeMeshGroup.add(packetsGroup);

    interface Packet {
      mesh: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3;
      progress: number;
      speed: number;
    }

    const packets: Packet[] = [];
    arcCurves.forEach((curve) => {
      const mesh = new THREE.Mesh(packetGeometry, packetMaterial);
      packetsGroup.add(mesh);
      packets.push({
        mesh,
        curve,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
      });
    });

    // --- 4. FLOATING CONSTELLATION NETWORK ---
    const constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    const numNodes = 35;
    const boundaryX = 14;
    const boundaryY = 8;

    const nodesData: Array<{
      mesh: THREE.Mesh;
      pos: THREE.Vector3;
      vel: THREE.Vector3;
      speed: number;
    }> = [];

    const nodeGeom = new THREE.SphereGeometry(0.06, 6, 6);

    for (let i = 0; i < numNodes; i++) {
      const mesh = new THREE.Mesh(nodeGeom, nodeMaterial);
      
      const posX = (Math.random() - 0.5) * boundaryX * 2;
      const posY = (Math.random() - 0.5) * boundaryY * 2;
      const posZ = (Math.random() - 0.5) * 4;
      mesh.position.set(posX, posY, posZ);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.003
      );

      const scale = 0.6 + Math.random() * 0.8;
      mesh.scale.set(scale, scale, scale);

      constellationGroup.add(mesh);
      nodesData.push({
        mesh,
        pos: mesh.position,
        vel,
        speed: scale,
      });
    }

    const maxConstellationLines = 80;
    const linePositions = new Float32Array(maxConstellationLines * 2 * 3);
    const constellationGeometry = new THREE.BufferGeometry();
    constellationGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const constellationMesh = new THREE.LineSegments(constellationGeometry, constellationMaterial);
    scene.add(constellationMesh);

    // --- 5. FLOWING ENERGY SINE WAVES ---
    const wavePointsCount = 50;
    
    const wavePosArray1 = new Float32Array(wavePointsCount * 3);
    const waveGeom1 = new THREE.BufferGeometry();
    waveGeom1.setAttribute("position", new THREE.BufferAttribute(wavePosArray1, 3));
    const waveLine1 = new THREE.Line(waveGeom1, waveMaterial1);
    scene.add(waveLine1);

    const wavePosArray2 = new Float32Array(wavePointsCount * 3);
    const waveGeom2 = new THREE.BufferGeometry();
    waveGeom2.setAttribute("position", new THREE.BufferAttribute(wavePosArray2, 3));
    const waveLine2 = new THREE.Line(waveGeom2, waveMaterial2);
    scene.add(waveLine2);

    // --- 6. CURSOR INTERACTIONS ---
    let mouse3D = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      raycaster.ray.intersectPlane(planeZ, mouse3D);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // --- 7. THEME & INITIALIZATION ---
    updateThemeColors();

    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateThemeColors();
        }
      });
    });
    themeObserver.observe(document.documentElement, { attributes: true });

    // --- 8. ANIMATION LOOP ---
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // A. Rotate Globe
      globeMeshGroup.rotation.y = time * 0.03;
      globeMeshGroup.rotation.x = Math.sin(time * 0.008) * 0.04 - 0.15;

      // B. Animate Globe Packets
      packets.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.speed = 0.003 + Math.random() * 0.004;
        }
        const pos = p.curve.getPointAt(p.progress);
        p.mesh.position.copy(pos);
      });

      // C. Update Constellation Nodes
      nodesData.forEach((node) => {
        node.pos.add(node.vel);

        const dist = node.pos.distanceTo(mouse3D);
        if (dist < 3.2) {
          const pushForce = (3.2 - dist) * 0.004;
          const pushDir = new THREE.Vector3().subVectors(node.pos, mouse3D).normalize();
          node.pos.addScaledVector(pushDir, pushForce);
        }

        if (Math.abs(node.pos.x) > boundaryX + 1) {
          node.vel.x = -node.vel.x;
          node.pos.x = Math.sign(node.pos.x) * (boundaryX + 0.9);
        }
        if (Math.abs(node.pos.y) > boundaryY + 1) {
          node.vel.y = -node.vel.y;
          node.pos.y = Math.sign(node.pos.y) * (boundaryY + 0.9);
        }
        if (Math.abs(node.pos.z) > 4) {
          node.vel.z = -node.vel.z;
        }
      });

      // D. Draw Constellation lines
      let lineIndex = 0;
      const positions = constellationGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < nodesData.length; i++) {
        const n1 = nodesData[i];
        for (let j = i + 1; j < nodesData.length; j++) {
          const n2 = nodesData[j];
          const dist = n1.pos.distanceTo(n2.pos);

          if (dist < 4.0 && lineIndex < maxConstellationLines) {
            const idx = lineIndex * 6;
            positions[idx] = n1.pos.x;
            positions[idx + 1] = n1.pos.y;
            positions[idx + 2] = n1.pos.z;

            positions[idx + 3] = n2.pos.x;
            positions[idx + 4] = n2.pos.y;
            positions[idx + 5] = n2.pos.z;

            lineIndex++;
          }
        }
      }

      const startIdx = lineIndex * 6;
      for (let k = startIdx; k < positions.length; k++) {
        positions[k] = 0;
      }
      constellationGeometry.attributes.position.needsUpdate = true;

      // E. Animate Bottom Energy Waves
      const waveArray1 = waveGeom1.attributes.position.array as Float32Array;
      const waveArray2 = waveGeom2.attributes.position.array as Float32Array;

      for (let i = 0; i < wavePointsCount; i++) {
        const xVal = -16 + (i / wavePointsCount) * 32;
        
        const yVal1 = Math.sin(xVal * 0.28 + time * 1.0) * 0.3 - 5.3;
        const zVal1 = Math.cos(xVal * 0.15 + time * 0.5) * 0.5 - 3.5;
        const idx1 = i * 3;
        waveArray1[idx1] = xVal;
        waveArray1[idx1 + 1] = yVal1;
        waveArray1[idx1 + 2] = zVal1;

        const yVal2 = Math.cos(xVal * 0.22 - time * 0.7) * 0.22 - 5.6;
        const zVal2 = Math.sin(xVal * 0.25 - time * 0.35) * 0.35 - 4.5;
        const idx2 = i * 3;
        waveArray2[idx2] = xVal;
        waveArray2[idx2 + 1] = yVal2;
        waveArray2[idx2 + 2] = zVal2;
      }
      waveGeom1.attributes.position.needsUpdate = true;
      waveGeom2.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // --- 9. RESIZE OBSERVER HANDLER (RESPONSIVE POSITIONING) ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // Reposition Globe responsively based on viewport width
      if (w >= 1024) {
        // Desktop: place on the left, top-middle area behind hero text
        globeMeshGroup.position.set(-3.6, 1.8, 0);
      } else {
        // Mobile/Tablet: center it near the top
        globeMeshGroup.position.set(0, 2.4, -2);
      }

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerRef.current);

    // Run initial size check
    handleResize();

    // --- 10. CLEANUP ON UNMOUNT ---
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      
      renderer.dispose();
      globeGeometry.dispose();
      globeEdges.dispose();
      hubGeometry.dispose();
      packetGeometry.dispose();
      nodeGeom.dispose();
      constellationGeometry.dispose();
      waveGeom1.dispose();
      waveGeom2.dispose();

      globeMaterial.dispose();
      hubMaterial.dispose();
      arcMaterial.dispose();
      packetMaterial.dispose();
      nodeMaterial.dispose();
      constellationMaterial.dispose();
      waveMaterial1.dispose();
      waveMaterial2.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none transition-colors duration-500 ${className}`}
      style={{
        backgroundImage: `url(${isDark ? "/dark_energy_bg.png" : "/light_energy_bg.png"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay to dim or blend background images nicely */}
      <div className="absolute inset-0 bg-slate-50/10 dark:bg-slate-950/20 backdrop-blur-[0.5px] pointer-events-none z-0" />

      {/* Ambient CSS Glass Light Orbs for depth */}
      <div className="absolute top-10 left-[10%] w-[45vw] h-[45vw] rounded-full bg-blue-500/5 dark:bg-blue-600/7 blur-[140px] pointer-events-none animate-float-orb-1" />
      <div className="absolute bottom-10 right-[5%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/5 dark:bg-emerald-600/5 blur-[140px] pointer-events-none animate-float-orb-2" />

      {/* Layer 2: WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block opacity-60 dark:opacity-40 z-0" />

      {/* Layer 3: Animated SVGs for Windmills & Smart House */}
      
      {/* Bottom Left Wind Turbines (Animated Blades) */}
      <div className="absolute bottom-[2%] left-[4%] w-[220px] h-[160px] z-20 pointer-events-none hidden md:block">
        {/* Large Turbine */}
        <svg viewBox="0 0 100 150" className="absolute bottom-0 left-[60px] w-20 h-32 origin-bottom">
          <path d="M 48 150 L 49.2 40 L 50.8 40 L 52 150 Z" fill={isDark ? "#1e293b" : "#cbd5e1"} stroke={isDark ? "#334155" : "#94a3b8"} strokeWidth="0.8" />
          <g className="wind-turbine-blades" style={{ transformOrigin: "50px 40px" }}>
            <circle cx="50" cy="40" r="3.5" fill="#06b6d4" />
            <path d="M 50 40 Q 48.5 20 50 2 Q 51.5 20 50 40 Z" fill={isDark ? "#06b6d4" : "#2563eb"} opacity="0.85" />
            <path d="M 50 40 Q 67.3 30 82.9 21 C 82.9 21 67.3 30 50 40 Z" fill={isDark ? "#06b6d4" : "#2563eb"} opacity="0.85" style={{ transform: "rotate(120deg)", transformOrigin: "50px 40px" }} />
            <path d="M 50 40 Q 32.7 50 17.1 59 C 17.1 59 32.7 50 50 40 Z" fill={isDark ? "#06b6d4" : "#2563eb"} opacity="0.85" style={{ transform: "rotate(240deg)", transformOrigin: "50px 40px" }} />
          </g>
        </svg>

        {/* Medium Turbine (Fast) */}
        <svg viewBox="0 0 100 150" className="absolute bottom-0 left-[10px] w-14 h-24 origin-bottom opacity-75">
          <path d="M 48 150 L 49.3 40 L 50.7 40 L 52 150 Z" fill={isDark ? "#1e293b" : "#cbd5e1"} stroke={isDark ? "#334155" : "#94a3b8"} strokeWidth="0.8" />
          <g className="wind-turbine-blades-fast" style={{ transformOrigin: "50px 40px" }}>
            <circle cx="50" cy="40" r="3" fill="#10b981" />
            <path d="M 50 40 Q 48.6 20 50 3 Q 51.4 20 50 40 Z" fill={isDark ? "#10b981" : "#10b981"} opacity="0.85" />
            <path d="M 50 40 Q 67.3 30 82.9 21 C 82.9 21 67.3 30 50 40 Z" fill={isDark ? "#10b981" : "#10b981"} opacity="0.85" style={{ transform: "rotate(120deg)", transformOrigin: "50px 40px" }} />
            <path d="M 50 40 Q 32.7 50 17.1 59 C 17.1 59 32.7 50 50 40 Z" fill={isDark ? "#10b981" : "#10b981"} opacity="0.85" style={{ transform: "rotate(240deg)", transformOrigin: "50px 40px" }} />
          </g>
        </svg>

        {/* Small Turbine (Slow) */}
        <svg viewBox="0 0 100 150" className="absolute bottom-0 left-[130px] w-11 h-18 origin-bottom opacity-60">
          <path d="M 48 150 L 49.4 40 L 50.6 40 L 52 150 Z" fill={isDark ? "#1e293b" : "#cbd5e1"} stroke={isDark ? "#334155" : "#94a3b8"} strokeWidth="0.8" />
          <g className="wind-turbine-blades-slow" style={{ transformOrigin: "50px 40px" }}>
            <circle cx="50" cy="40" r="2.5" fill="#06b6d4" />
            <path d="M 50 40 Q 48.7 20 50 4 Q 51.3 20 50 40 Z" fill={isDark ? "#06b6d4" : "#2563eb"} opacity="0.85" />
            <path d="M 50 40 Q 67.3 30 82.9 21 C 82.9 21 67.3 30 50 40 Z" fill={isDark ? "#06b6d4" : "#2563eb"} opacity="0.85" style={{ transform: "rotate(120deg)", transformOrigin: "50px 40px" }} />
            <path d="M 50 40 Q 32.7 50 17.1 59 C 17.1 59 32.7 50 50 40 Z" fill={isDark ? "#06b6d4" : "#2563eb"} opacity="0.85" style={{ transform: "rotate(240deg)", transformOrigin: "50px 40px" }} />
          </g>
        </svg>
      </div>

      {/* Bottom Right Smart House (Glowing Details) */}
      <div className="absolute bottom-[2.5%] right-[5%] w-[160px] h-[120px] z-20 pointer-events-none hidden md:block">
        <svg viewBox="0 0 160 120" className="w-full h-full overflow-visible">
          <defs>
            <filter id="svg-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="svg-glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* House Blueprint Outline */}
          <path
            d="M 20 100 L 20 50 L 90 20 L 140 20 L 140 100 Z"
            fill={isDark ? "rgba(11, 15, 25, 0.45)" : "rgba(255, 255, 255, 0.45)"}
            stroke={isDark ? "rgba(34, 211, 238, 0.4)" : "rgba(37, 99, 235, 0.4)"}
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />

          {/* Roof Line & Solar Panel Glow */}
          <line
            x1="20"
            y1="50"
            x2="90"
            y2="20"
            stroke={isDark ? "#22d3ee" : "#2563eb"}
            strokeWidth="2.5"
            filter="url(#svg-glow-cyan)"
          />
          
          {/* Windows with pulsing warm light */}
          <rect x="35" y="60" width="16" height="14" rx="1.5" fill="#facc15" className="glowing-window text-yellow-400" style={{ animationDelay: "0s", filter: "drop-shadow(0 0 4px rgba(250, 204, 21, 0.6))" }} />
          <rect x="60" y="60" width="16" height="14" rx="1.5" fill="#facc15" className="glowing-window text-yellow-400" style={{ animationDelay: "1.2s", filter: "drop-shadow(0 0 4px rgba(250, 204, 21, 0.6))" }} />
          <rect x="85" y="60" width="16" height="14" rx="1.5" fill="#facc15" className="glowing-window text-yellow-400" style={{ animationDelay: "0.6s", filter: "drop-shadow(0 0 4px rgba(250, 204, 21, 0.6))" }} />
          <rect x="110" y="55" width="18" height="35" rx="1" fill="#facc15" className="glowing-window text-yellow-400" style={{ animationDelay: "1.8s", filter: "drop-shadow(0 0 4px rgba(250, 204, 21, 0.6))" }} />

          {/* Connecting digital twin grid lines */}
          <line x1="90" y1="20" x2="110" y2="55" stroke={isDark ? "#22d3ee" : "#2563eb"} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <line x1="55" y1="35" x2="68" y2="60" stroke={isDark ? "#10b981" : "#10b981"} strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />

          {/* EV Charger block */}
          <rect x="146" y="70" width="8" height="30" rx="1" fill={isDark ? "#1e293b" : "#cbd5e1"} stroke={isDark ? "#334155" : "#94a3b8"} strokeWidth="0.8" />
          <circle cx="150" cy="76" r="2.2" fill="#10b981" filter="url(#svg-glow-green)" className="glowing-window" style={{ animationDelay: "0.2s" }} />
        </svg>
      </div>

      {/* Layer 4: Tactical Paper/Grain Noise overlay */}
      <div className="absolute inset-0 w-full h-full opacity-[0.015] dark:opacity-[0.022] pointer-events-none z-10 grain-noise-overlay" />
    </div>
  );
};
