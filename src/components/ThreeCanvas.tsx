import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const ThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    camera.position.set(4, 3.5, 6.5);
    camera.lookAt(0, 0.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Root group for mouse-move rotation
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // --- MATERIALS DEFINITION ---
    // Materials that update dynamically based on dark/light mode
    const materials = {
      houseWire: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 }),
      houseSolid: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.05 }),
      roofWire: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 }),
      roofSolid: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.08 }),
      gridWire: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.25 }),
      solarPanel: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.25 }),
      solarGrid: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 }),
      poleWire: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5 }),
      poleSolid: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.08 }),
      wireLine: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 }),
      particleSolar: new THREE.MeshBasicMaterial({ color: 0x10b981 }), // green particle
      particleGrid: new THREE.MeshBasicMaterial({ color: 0x22d3ee }), // cyan particle
    };

    // --- 1. FLOOR GRID (Custom Glowing Grid) ---
    const gridGroup = new THREE.Group();
    const gridExtent = 4;
    const gridDivisions = 8;
    const gridStep = (gridExtent * 2) / gridDivisions;

    for (let i = 0; i <= gridDivisions; i++) {
      const coord = -gridExtent + i * gridStep;
      
      // Lines parallel to Z
      const pointsZ = [
        new THREE.Vector3(coord, 0, -gridExtent),
        new THREE.Vector3(coord, 0, gridExtent),
      ];
      const geomZ = new THREE.BufferGeometry().setFromPoints(pointsZ);
      const lineZ = new THREE.Line(geomZ, materials.gridWire);
      gridGroup.add(lineZ);

      // Lines parallel to X
      const pointsX = [
        new THREE.Vector3(-gridExtent, 0, coord),
        new THREE.Vector3(gridExtent, 0, coord),
      ];
      const geomX = new THREE.BufferGeometry().setFromPoints(pointsX);
      const lineX = new THREE.Line(geomX, materials.gridWire);
      gridGroup.add(lineX);
    }
    worldGroup.add(gridGroup);

    // --- 2. THE HOUSE ---
    const houseGroup = new THREE.Group();
    houseGroup.position.set(0, 0, 0);

    // House Body (Box)
    const bodyWidth = 1.6;
    const bodyHeight = 1.2;
    const bodyDepth = 1.6;
    
    const bodyGeom = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    const bodyEdges = new THREE.EdgesGeometry(bodyGeom);
    
    const houseBodySolid = new THREE.Mesh(bodyGeom, materials.houseSolid);
    const houseBodyWire = new THREE.LineSegments(bodyEdges, materials.houseWire);
    houseBodySolid.position.y = bodyHeight / 2;
    houseBodyWire.position.y = bodyHeight / 2;
    
    houseGroup.add(houseBodySolid);
    houseGroup.add(houseBodyWire);

    // Roof (Triangular Prism using a custom geometry)
    const roofGeom = new THREE.BufferGeometry();
    const w = bodyWidth + 0.15;
    const d = bodyDepth + 0.15;
    const h = 0.8;
    const yBase = bodyHeight;

    const vertices = new Float32Array([
      // Front Triangle
      -w/2, yBase, d/2,
      w/2, yBase, d/2,
      0, yBase + h, d/2,

      // Back Triangle
      -w/2, yBase, -d/2,
      w/2, yBase, -d/2,
      0, yBase + h, -d/2,

      // Left Slope
      -w/2, yBase, d/2,
      0, yBase + h, d/2,
      -w/2, yBase, -d/2,

      0, yBase + h, d/2,
      0, yBase + h, -d/2,
      -w/2, yBase, -d/2,

      // Right Slope
      w/2, yBase, d/2,
      0, yBase + h, d/2,
      w/2, yBase, -d/2,

      0, yBase + h, d/2,
      0, yBase + h, -d/2,
      w/2, yBase, -d/2,

      // Bottom rectangular base
      -w/2, yBase, d/2,
      w/2, yBase, d/2,
      -w/2, yBase, -d/2,

      w/2, yBase, d/2,
      w/2, yBase, -d/2,
      -w/2, yBase, -d/2,
    ]);

    roofGeom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    roofGeom.computeVertexNormals();

    const roofSolid = new THREE.Mesh(roofGeom, materials.roofSolid);
    const roofWireGeom = new THREE.EdgesGeometry(roofGeom);
    const roofWire = new THREE.LineSegments(roofWireGeom, materials.roofWire);

    houseGroup.add(roofSolid);
    houseGroup.add(roofWire);

    // Windows (Glowing Rectangles)
    const winGeom = new THREE.PlaneGeometry(0.3, 0.3);
    const windowMaterials = [
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, side: THREE.DoubleSide }), // blue glow window
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide }), // green glow window
    ];
    
    // Front window 1
    const win1 = new THREE.Mesh(winGeom, windowMaterials[0]);
    win1.position.set(-0.35, 0.6, d/2 + 0.005);
    // Front window 2
    const win2 = new THREE.Mesh(winGeom, windowMaterials[1]);
    win2.position.set(0.35, 0.6, d/2 + 0.005);
    
    houseGroup.add(win1, win2);
    worldGroup.add(houseGroup);

    // --- 3. SOLAR PANEL (on roof right slope) ---
    const solarGroup = new THREE.Group();
    const panelW = 0.8;
    const panelH = 1.0;
    
    const panelGeom = new THREE.PlaneGeometry(panelW, panelH);
    const panelSolid = new THREE.Mesh(panelGeom, materials.solarPanel);
    const panelEdges = new THREE.EdgesGeometry(panelGeom);
    const panelGrid = new THREE.LineSegments(panelEdges, materials.solarGrid);
    
    solarGroup.add(panelSolid);
    solarGroup.add(panelGrid);
    
    // Rotate and position solar panel on the right roof slope
    // Angle of slope is atan(h / (w/2)) = atan(0.8 / 0.875) ~ 42.5 deg
    solarGroup.rotation.x = -Math.PI / 2;
    solarGroup.rotation.y = -0.74; // match roof angle around Z/Y axes
    solarGroup.rotation.z = Math.PI / 2;
    
    solarGroup.position.set(w/4 + 0.05, yBase + h/2 - 0.05, 0);
    houseGroup.add(solarGroup);

    // --- 4. POWER POLE / GRID CONNECTOR ---
    const poleGroup = new THREE.Group();
    poleGroup.position.set(-2.6, 0, -1.8);

    // Vertical pole shaft
    const shaftGeom = new THREE.CylinderGeometry(0.04, 0.06, 1.8, 6);
    const shaftSolid = new THREE.Mesh(shaftGeom, materials.poleSolid);
    const shaftEdges = new THREE.EdgesGeometry(shaftGeom);
    const shaftWire = new THREE.LineSegments(shaftEdges, materials.poleWire);
    shaftSolid.position.y = 0.9;
    shaftWire.position.y = 0.9;
    poleGroup.add(shaftSolid, shaftWire);

    // Horizontal T-Bar
    const barGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5);
    const barSolid = new THREE.Mesh(barGeom, materials.poleSolid);
    const barEdges = new THREE.EdgesGeometry(barGeom);
    const barWire = new THREE.LineSegments(barEdges, materials.poleWire);
    barSolid.rotation.z = Math.PI / 2;
    barSolid.position.y = 1.7;
    barWire.rotation.z = Math.PI / 2;
    barWire.position.y = 1.7;
    poleGroup.add(barSolid, barWire);

    worldGroup.add(poleGroup);

    // --- 5. POWER LINES (Grid to House) ---
    // Connect Power Pole top to House Side
    const powerLinePoints = [
      new THREE.Vector3(-2.6, 1.7, -1.8), // Pole top
      new THREE.Vector3(-1.2, 1.4, -0.9), // Curve control pt
      new THREE.Vector3(-bodyWidth/2, bodyHeight + 0.1, 0), // House attachment
    ];
    
    const powerLineCurve = new THREE.CatmullRomCurve3(powerLinePoints);
    const powerLinePointsSpline = powerLineCurve.getPoints(50);
    const powerLineGeom = new THREE.BufferGeometry().setFromPoints(powerLinePointsSpline);
    const powerLine = new THREE.Line(powerLineGeom, materials.wireLine);
    worldGroup.add(powerLine);

    // --- 6. PARTICLES (Energy Flow System) ---
    const particlesData: Array<{
      mesh: THREE.Mesh;
      curve: THREE.CatmullRomCurve3 | THREE.LineCurve3;
      progress: number;
      speed: number;
    }> = [];

    const particleGeom = new THREE.SphereGeometry(0.06, 5, 5);

    // Path 1: Grid pole to House body (Grid supply) - cyan
    const gridToHouseCurve = powerLineCurve; // Reuse power line curve!
    const numGridParticles = 4;
    for (let i = 0; i < numGridParticles; i++) {
      const pMesh = new THREE.Mesh(particleGeom, materials.particleGrid);
      worldGroup.add(pMesh);
      particlesData.push({
        mesh: pMesh,
        curve: gridToHouseCurve,
        progress: i / numGridParticles, // stagger start positions
        speed: 0.007 + Math.random() * 0.003,
      });
    }

    // Path 2: Solar panel to House interior - green
    // We define a line path from solar center to house base
    const solarCenter = new THREE.Vector3(w/4 + 0.05, yBase + h/2 - 0.05, 0);
    const houseInterior = new THREE.Vector3(0, 0.4, 0);
    const solarToHouseCurve = new THREE.LineCurve3(solarCenter, houseInterior);
    
    const numSolarParticles = 3;
    for (let i = 0; i < numSolarParticles; i++) {
      const pMesh = new THREE.Mesh(particleGeom, materials.particleSolar);
      worldGroup.add(pMesh);
      particlesData.push({
        mesh: pMesh,
        curve: solarToHouseCurve,
        progress: i / numSolarParticles, // stagger
        speed: 0.012 + Math.random() * 0.004,
      });
    }

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    // Warm house center light
    const houseLight = new THREE.PointLight(0xf59e0b, 1.2, 3);
    houseLight.position.set(0, 0.6, 0);
    scene.add(houseLight);

    // --- MOUSE TRACKING & INTERACTION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.15; // slight starting tilt
    let targetRotationY = -0.4; // starting angle

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Update target rotations based on mouse position (with constraints)
      targetRotationY = -0.4 + mouseX * 0.35;
      targetRotationX = 0.15 - mouseY * 0.25;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // --- THEME COLOR UPDATER ---
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      
      if (isDark) {
        // Neon green/cyan theme for dark mode
        materials.houseWire.color.setHex(0x10b981); // Emerald Green
        materials.houseSolid.color.setHex(0x064e3b);
        materials.roofWire.color.setHex(0x22d3ee); // Cyan Accent
        materials.roofSolid.color.setHex(0x0e7490);
        materials.gridWire.color.setHex(0x1e293b);
        materials.solarPanel.color.setHex(0x1e3a8a);
        materials.solarGrid.color.setHex(0x3b82f6);
        materials.poleWire.color.setHex(0x64748b);
        materials.poleSolid.color.setHex(0x334155);
        materials.wireLine.color.setHex(0x22d3ee);
        materials.particleSolar.color.setHex(0x10b981);
        materials.particleGrid.color.setHex(0x22d3ee);
        windowMaterials[0].color.setHex(0x22d3ee);
        windowMaterials[1].color.setHex(0x10b981);
        houseLight.color.setHex(0x22d3ee);
        houseLight.intensity = 1.5;
      } else {
        // Primary Blue/Green theme for light mode
        materials.houseWire.color.setHex(0x2563eb); // Royal Blue
        materials.houseSolid.color.setHex(0xdbeafe);
        materials.roofWire.color.setHex(0x10b981); // Green Roof
        materials.roofSolid.color.setHex(0xd1fae5);
        materials.gridWire.color.setHex(0xe2e8f0);
        materials.solarPanel.color.setHex(0x1e40af);
        materials.solarGrid.color.setHex(0x60a5fa);
        materials.poleWire.color.setHex(0x94a3b8);
        materials.poleSolid.color.setHex(0xf1f5f9);
        materials.wireLine.color.setHex(0x94a3b8);
        materials.particleSolar.color.setHex(0x10b981);
        materials.particleGrid.color.setHex(0x3b82f6);
        windowMaterials[0].color.setHex(0x60a5fa);
        windowMaterials[1].color.setHex(0x34d399);
        houseLight.color.setHex(0xf59e0b);
        houseLight.intensity = 1.0;
      }
    };

    // Run once at start
    updateColors();

    // Observe theme class changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateColors();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    // --- ANIMATION LOOP ---
    let animationFrameId: number;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // 1. Smoothly interpolate (lerp) scene rotation to target rotations
      worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.06;
      worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.06;

      // Add a subtle idling float to the pole and house
      const time = Date.now() * 0.001;
      houseGroup.position.y = Math.sin(time * 1.5) * 0.04;
      poleGroup.position.y = Math.sin(time * 1.5 + 1.0) * 0.03;

      // 2. Update flowing energy particles
      particlesData.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1.0) {
          p.progress = 0.0;
        }
        
        // Get 3D coordinate along the spline curve
        const pos = p.curve.getPointAt(p.progress);
        p.mesh.position.copy(pos);
        
        // Pulse size slightly
        const scale = 1.0 + Math.sin(time * 8.0 + p.progress * 10) * 0.15;
        p.mesh.scale.set(scale, scale, scale);
      });

      // 3. Slowly rotate the glowing windows
      win1.scale.x = 1.0 + Math.sin(time * 4) * 0.05;
      win2.scale.x = 1.0 + Math.cos(time * 4) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    // Resize observer for parent container resizing
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerRef.current);

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
      resizeObserver.disconnect();
      
      // Dispose WebGL resources
      if (renderer) {
        renderer.dispose();
      }
      
      // Traverse and dispose geometries and materials
      scene.traverse((object) => {
        if (!(object instanceof THREE.Object3D)) return;
        
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        } else if (object instanceof THREE.Line) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative min-h-[350px] sm:min-h-[400px] lg:min-h-[480px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};
