import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  className?: string;
}

// ─── Particle types ──────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number; vx: number; vy: number;
  radius: number; alpha: number; hue: number;
  trail: { x: number; y: number }[]; trailLen: number;
  pulse: number; pulseSpeed: number;
}
interface EnergyRing {
  x: number; y: number; radius: number; maxRadius: number;
  alpha: number; hue: number; width: number; speed: number;
}
interface HexNode {
  x: number; y: number; glow: number; glowDir: number;
  glowSpeed: number; active: boolean; activateTimer: number;
}
interface CircuitLine {
  x1: number; y1: number; x2: number; y2: number;
  alpha: number; hue: number; dashOffset: number; dashSpeed: number;
  life: number; maxLife: number;
}
interface AuroraBlob {
  cx: number; cy: number; rx: number; ry: number;
  hue: number; hue2: number; phase: number; phaseSpeed: number;
  driftX: number; driftY: number; driftPhase: number;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ className = "-z-10" }) => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvas2DRef   = useRef<HTMLCanvasElement>(null);
  const canvasGlobeRef = useRef<HTMLCanvasElement>(null);
  const mouseRef      = useRef({ x: 0.5, y: 0.5 });
  const animId2DRef   = useRef<number>(0);
  const animIdGlobeRef = useRef<number>(0);

  // ══════════════════════════════════════════════════════════════════════════
  //  LAYER A – Three.js Globe
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const canvas = canvasGlobeRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const scene    = new THREE.Scene();
    const clock    = new THREE.Clock();
    const camera   = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // ── materials (theme-aware) ──────────────────────────────────────────────
    const globeMat  = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.13 });
    const hubMat    = new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.85 });
    const arcMat    = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.22 });
    const packetMat = new THREE.MeshBasicMaterial({ color: 0x1d4ed8 });
    const outerRingMat = new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.07 });

    const updateColors = () => {
      const dark = document.documentElement.classList.contains("dark");
      globeMat.color.setHex(dark ? 0x10b981 : 0x3b82f6);
      globeMat.opacity = dark ? 0.10 : 0.13;
      hubMat.color.setHex(dark ? 0x10b981 : 0x2563eb);
      hubMat.opacity   = dark ? 0.75 : 0.85;
      arcMat.color.setHex(dark ? 0x22d3ee : 0x06b6d4);
      arcMat.opacity   = dark ? 0.20 : 0.22;
      packetMat.color.setHex(dark ? 0x22d3ee : 0x1d4ed8);
      outerRingMat.color.setHex(dark ? 0x22d3ee : 0x2563eb);
      outerRingMat.opacity = dark ? 0.06 : 0.07;
    };
    updateColors();

    const themeObs = new MutationObserver(() => updateColors());
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // ── Globe wireframe ──────────────────────────────────────────────────────
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeGeo  = new THREE.SphereGeometry(3.5, 20, 20);
    const globeEdge = new THREE.EdgesGeometry(globeGeo);
    globeGroup.add(new THREE.LineSegments(globeEdge, globeMat));

    // Two outer decorative rings
    for (let i = 0; i < 2; i++) {
      const ringGeo = new THREE.TorusGeometry(3.9 + i * 0.35, 0.01, 6, 80);
      const ringMesh = new THREE.Mesh(ringGeo, outerRingMat);
      ringMesh.rotation.x = (Math.PI / 2) * (i === 0 ? 0.3 : -0.5);
      ringMesh.rotation.y = i * 0.6;
      globeGroup.add(ringMesh);
    }

    // ── City hubs ────────────────────────────────────────────────────────────
    const toSphere = (lat: number, lon: number, r: number) => {
      const phi   = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.sin(theta),
        r  * Math.cos(phi),
        r  * Math.sin(phi) * Math.cos(theta)
      );
    };

    const cities = [
      { lat: 40.71, lon: -74.01 },  // NY
      { lat: 51.51, lon: -0.13  },  // London
      { lat: 35.68, lon: 139.65 },  // Tokyo
      { lat: 19.08, lon: 72.88  },  // Mumbai
      { lat: -33.87, lon: 151.21 }, // Sydney
      { lat: -23.55, lon: -46.63 }, // São Paulo
      { lat: -26.20, lon: 28.05 },  // Johannesburg
      { lat: 25.20, lon: 55.27  },  // Dubai
      { lat: 55.75, lon: 37.62  },  // Moscow
      { lat: 1.35,  lon: 103.82 },  // Singapore
    ];

    const hubGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const hubPts: THREE.Vector3[] = [];
    const hubsGroup = new THREE.Group();

    cities.forEach((c) => {
      const pos  = toSphere(c.lat, c.lon, 3.5);
      const mesh = new THREE.Mesh(hubGeo, hubMat);
      mesh.position.copy(pos);
      hubsGroup.add(mesh);
      hubPts.push(pos);

      // Pulse ring around each hub
      const pRingGeo = new THREE.TorusGeometry(0.18, 0.015, 6, 24);
      const pRingMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 });
      const pRing    = new THREE.Mesh(pRingGeo, pRingMat);
      pRing.position.copy(pos);
      pRing.lookAt(new THREE.Vector3(0, 0, 0));
      hubsGroup.add(pRing);
    });
    globeGroup.add(hubsGroup);

    // ── Arcs ─────────────────────────────────────────────────────────────────
    const links = [[0,1],[1,7],[7,3],[3,2],[2,4],[4,5],[5,0],[1,6],[6,7],[0,8],[8,1],[2,9],[9,3]];
    const arcGroup = new THREE.Group();
    const arcCurves: THREE.QuadraticBezierCurve3[] = [];

    links.forEach(([i, j]) => {
      const p1   = hubPts[i];
      const p2   = hubPts[j];
      const dist = p1.distanceTo(p2);
      const mid  = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(3.5 + dist * 0.26);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      arcCurves.push(curve);
      const pts  = curve.getPoints(24);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      arcGroup.add(new THREE.Line(geom, arcMat));
    });
    globeGroup.add(arcGroup);

    // ── Data packets ─────────────────────────────────────────────────────────
    const pktGeo = new THREE.SphereGeometry(0.045, 6, 6);
    const packets: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; t: number; spd: number }[] = [];
    const pktsGroup = new THREE.Group();
    globeGroup.add(pktsGroup);

    arcCurves.forEach((curve) => {
      const mesh = new THREE.Mesh(pktGeo, packetMat);
      pktsGroup.add(mesh);
      packets.push({ mesh, curve, t: Math.random(), spd: 0.003 + Math.random() * 0.004 });
    });

    // ── Positioning ──────────────────────────────────────────────────────────
    const positionGlobe = (w: number, h: number) => {
      const aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      if (w >= 1024) {
        globeGroup.position.set(-3.8, 1.6, 0);
      } else {
        globeGroup.position.set(0, 2.2, -2);
      }
    };

    const ro = new ResizeObserver(() => {
      positionGlobe(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);
    positionGlobe(container.clientWidth, container.clientHeight);

    // ── Animation ────────────────────────────────────────────────────────────
    let lastRender = 0;
    const animateGlobe = (ts: number) => {
      animIdGlobeRef.current = requestAnimationFrame(animateGlobe);
      if (document.hidden || window.matchMedia("print").matches) return;
      if (ts - lastRender < 22) return;
      lastRender = ts;

      const t = clock.getElapsedTime();

      // Slow rotation + gentle wobble
      globeGroup.rotation.y = t * 0.035;
      globeGroup.rotation.x = Math.sin(t * 0.009) * 0.05 - 0.12;

      // Packets
      packets.forEach((p) => {
        p.t += p.spd;
        if (p.t >= 1) { p.t = 0; p.spd = 0.003 + Math.random() * 0.004; }
        p.mesh.position.copy(p.curve.getPointAt(p.t));
      });

      // Hub pulse rings scale
      hubsGroup.children.forEach((child, idx) => {
        if (idx % 2 === 1) { // every second child is a pulse ring
          const s = 1 + 0.3 * Math.sin(t * 1.5 + idx);
          child.scale.setScalar(s);
          if ((child as THREE.Mesh).material instanceof THREE.MeshBasicMaterial) {
            const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
            const dark = document.documentElement.classList.contains("dark");
            mat.color.setHex(dark ? 0x22d3ee : 0x06b6d4);
          }
        }
      });

      renderer.render(scene, camera);
    };

    animIdGlobeRef.current = requestAnimationFrame(animateGlobe);

    return () => {
      cancelAnimationFrame(animIdGlobeRef.current);
      ro.disconnect();
      themeObs.disconnect();
      renderer.dispose();
      globeGeo.dispose(); globeEdge.dispose(); hubGeo.dispose(); pktGeo.dispose();
      globeMat.dispose(); hubMat.dispose(); arcMat.dispose(); packetMat.dispose();
    };
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  //  LAYER B – Canvas 2D: Aurora / Hex / Particles / Rings / Circuit
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const canvas = canvas2DRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d")!;
    let W = container.clientWidth;
    let H = container.clientHeight;

    const resize = () => {
      W = container.clientWidth;
      H = container.clientHeight;
      canvas.width  = W;
      canvas.height = H;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMM = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / (window.innerWidth || 1);
      mouseRef.current.y = e.clientY / (window.innerHeight || 1);
    };
    window.addEventListener("mousemove", onMM);

    // ── Hue palettes ─────────────────────────────────────────────────────────
    const darkHues  = [175, 160, 195, 145, 210];
    const lightHues = [215, 200, 230, 185, 245];
    const getHues = () => document.documentElement.classList.contains("dark") ? darkHues : lightHues;

    // ── Particles ─────────────────────────────────────────────────────────────
    const NUM_P = 70;
    const particles: Particle[] = [];

    const mkP = (): Particle => {
      const hues = getHues();
      const hue  = hues[Math.floor(Math.random() * hues.length)];
      const tl   = 6 + Math.floor(Math.random() * 10);
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: 1.2 + Math.random() * 2.6, alpha: 0.3 + Math.random() * 0.6,
        hue, trail: [], trailLen: tl,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.03,
      };
    };
    for (let i = 0; i < NUM_P; i++) particles.push(mkP());

    // ── Energy rings ──────────────────────────────────────────────────────────
    const rings: EnergyRing[] = [];
    let ringTimer = 0;
    const spawnRing = () => {
      const hue = getHues()[Math.floor(Math.random() * getHues().length)];
      rings.push({
        x: 0.1*W + Math.random()*0.8*W, y: 0.1*H + Math.random()*0.8*H,
        radius: 0, maxRadius: 100 + Math.random() * 160,
        alpha: 0.5, hue, width: 1.5 + Math.random() * 2, speed: 1.4 + Math.random() * 1.4,
      });
    };
    spawnRing(); spawnRing();

    // ── Hex grid ──────────────────────────────────────────────────────────────
    const HEX_R = 54;
    const hexNodes: HexNode[] = [];
    const buildHex = () => {
      hexNodes.length = 0;
      const cols = Math.ceil(W / (HEX_R * 1.732)) + 2;
      const rows = Math.ceil(H / (HEX_R * 1.5))   + 2;
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * HEX_R * 1.732 + (row % 2 === 0 ? 0 : HEX_R * 0.866);
          const y = row * HEX_R * 1.5;
          hexNodes.push({
            x, y, glow: Math.random(), glowDir: Math.random() > 0.5 ? 1 : -1,
            glowSpeed: 0.002 + Math.random() * 0.006,
            active: Math.random() < 0.07, activateTimer: Math.random() * 200,
          });
        }
      }
    };
    buildHex();

    // ── Aurora blobs ──────────────────────────────────────────────────────────
    const blobs: AuroraBlob[] = [
      { cx: 0.15, cy: 0.22, rx: 0.40, ry: 0.36, hue: 200, hue2: 170, phase: 0,    phaseSpeed: 0.0008, driftX: 0.06, driftY: 0.04, driftPhase: 0   },
      { cx: 0.80, cy: 0.70, rx: 0.44, ry: 0.39, hue: 250, hue2: 210, phase: 1.5,  phaseSpeed: 0.0006, driftX: 0.05, driftY: 0.06, driftPhase: 1.1 },
      { cx: 0.55, cy: 0.45, rx: 0.31, ry: 0.29, hue: 160, hue2: 190, phase: 3.0,  phaseSpeed: 0.0010, driftX: 0.04, driftY: 0.03, driftPhase: 2.4 },
      { cx: 0.10, cy: 0.80, rx: 0.29, ry: 0.26, hue: 270, hue2: 230, phase: 4.2,  phaseSpeed: 0.0007, driftX: 0.03, driftY: 0.05, driftPhase: 3.7 },
      { cx: 0.90, cy: 0.15, rx: 0.33, ry: 0.29, hue: 185, hue2: 155, phase: 0.8,  phaseSpeed: 0.0009, driftX: 0.07, driftY: 0.03, driftPhase: 5.1 },
    ];

    // ── Circuit lines ─────────────────────────────────────────────────────────
    const circuits: CircuitLine[] = [];
    let circuitTimer = 0;
    const spawnCircuit = () => {
      const hue  = getHues()[Math.floor(Math.random() * getHues().length)];
      const x1   = Math.random() * W;
      const y1   = Math.random() * H;
      const ang  = Math.floor(Math.random() * 4) * (Math.PI / 2) + (Math.random() - 0.5) * 0.35;
      const len  = 40 + Math.random() * 110;
      const maxL = 80  + Math.random() * 120;
      circuits.push({ x1, y1, x2: x1 + Math.cos(ang)*len, y2: y1 + Math.sin(ang)*len,
        alpha: 0, hue, dashOffset: 0, dashSpeed: 0.4 + Math.random()*0.8, life: 0, maxLife: maxL });
    };
    for (let i = 0; i < 10; i++) spawnCircuit();

    // ── Main draw loop ────────────────────────────────────────────────────────
    let frame = 0, lastT = 0;

    const draw = (ts: number) => {
      animId2DRef.current = requestAnimationFrame(draw);
      if (document.hidden || window.matchMedia("print").matches || ts - lastT < 22) return;
      lastT = ts;
      frame++;

      const dark = document.documentElement.classList.contains("dark");

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = dark ? "#070c12" : "#eef2ff";
      ctx.fillRect(0, 0, W, H);

      // ── Aurora blobs ──────────────────────────────────────────────────────
      blobs.forEach((b) => {
        b.phase += b.phaseSpeed;
        const cx = (b.cx + Math.sin(b.phase)            * b.driftX) * W;
        const cy = (b.cy + Math.cos(b.phase*0.7 + b.driftPhase) * b.driftY) * H;
        const rx = b.rx * W * (0.85 + 0.15 * Math.abs(Math.sin(b.phase * 1.3)));
        const ry = b.ry * H * (0.85 + 0.15 * Math.abs(Math.cos(b.phase * 0.9)));
        const pf = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(b.phase + b.driftPhase));
        const pa = dark ? 0.042 : 0.050;
        const ma = dark ? 0.018 : 0.022;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        grad.addColorStop(0,   `hsla(${b.hue},  80%, 65%, ${pa*pf})`);
        grad.addColorStop(0.4, `hsla(${b.hue2}, 75%, 60%, ${ma*pf})`);
        grad.addColorStop(1,   `hsla(${b.hue2}, 70%, 55%, 0)`);

        ctx.save();
        ctx.scale(1, ry / Math.max(rx, ry));
        ctx.beginPath();
        ctx.arc(cx, cy * (Math.max(rx,ry)/ry), rx, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // ── Hex grid ──────────────────────────────────────────────────────────
      const hexHue  = dark ? 175 : 215;
      const hexBase = dark ? 0.038 : 0.048;
      const hexAct  = dark ? 0.20  : 0.18;
      const hexLightness = dark ? 65 : 55;

      hexNodes.forEach((n) => {
        n.glow += n.glowDir * n.glowSpeed;
        if (n.glow >= 1 || n.glow <= 0) { n.glowDir *= -1; n.glow = Math.max(0, Math.min(1, n.glow)); }
        n.activateTimer--;
        if (n.activateTimer <= 0) { n.active = Math.random() < 0.08; n.activateTimer = 120 + Math.random()*300; }

        const a = n.active ? hexAct * (0.5 + 0.5*n.glow) : hexBase * n.glow;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const ang = (Math.PI/3)*k - Math.PI/6;
          const px = n.x + HEX_R*0.47*Math.cos(ang);
          const py = n.y + HEX_R*0.47*Math.sin(ang);
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `hsla(${hexHue}, 80%, ${hexLightness}%, ${a})`;
        ctx.lineWidth = n.active ? 1.3 : 0.6;
        ctx.stroke();

        if (n.active) {
          const dg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 9);
          dg.addColorStop(0, `hsla(${hexHue}, 90%, 72%, ${0.85*n.glow})`);
          dg.addColorStop(1, `hsla(${hexHue}, 90%, 72%, 0)`);
          ctx.beginPath(); ctx.arc(n.x, n.y, 9, 0, Math.PI*2);
          ctx.fillStyle = dg; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, 2.2, 0, Math.PI*2);
          ctx.fillStyle = `hsla(${hexHue}, 95%, 82%, ${n.glow})`; ctx.fill();
        }
      });
      if (frame % 120 === 0) buildHex();

      // ── Circuit lines ─────────────────────────────────────────────────────
      circuitTimer++;
      if (circuitTimer >= 40 && circuits.length < 28) { circuitTimer = 0; spawnCircuit(); }

      const circuitLightness = dark ? 70 : 55;

      for (let i = circuits.length - 1; i >= 0; i--) {
        const cl = circuits[i];
        cl.life++; cl.dashOffset -= cl.dashSpeed;
        const hl = cl.maxLife / 2;
        cl.alpha = cl.life < hl ? (cl.life/hl)*0.6 : ((cl.maxLife - cl.life)/hl)*0.6;
        if (cl.life >= cl.maxLife) { circuits.splice(i, 1); continue; }

        ctx.save();
        ctx.setLineDash([6, 4]); ctx.lineDashOffset = cl.dashOffset;
        ctx.beginPath(); ctx.moveTo(cl.x1, cl.y1); ctx.lineTo(cl.x2, cl.y2);
        ctx.strokeStyle = `hsla(${cl.hue}, 90%, ${circuitLightness}%, ${cl.alpha})`;
        ctx.lineWidth = 1; ctx.stroke();
        ctx.setLineDash([]); ctx.restore();

        [{ x: cl.x1, y: cl.y1 }, { x: cl.x2, y: cl.y2 }].forEach(p => {
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
          ctx.fillStyle = `hsla(${cl.hue}, 90%, 72%, ${cl.alpha*1.4})`; ctx.fill();
        });
      }

      // ── Energy rings ──────────────────────────────────────────────────────
      ringTimer++;
      if (ringTimer >= 90 && rings.length < 8) { ringTimer = 0; spawnRing(); }

      const ringLightness = dark ? 70 : 55;

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.radius += r.speed;
        r.alpha = 0.5 * (1 - r.radius / r.maxRadius);
        if (r.radius >= r.maxRadius) { rings.splice(i, 1); continue; }

        ctx.beginPath(); ctx.arc(r.x, r.y, r.radius, 0, Math.PI*2);
        ctx.strokeStyle = `hsla(${r.hue}, 90%, ${ringLightness}%, ${r.alpha*0.65})`;
        ctx.lineWidth = r.width; ctx.stroke();
        ctx.beginPath(); ctx.arc(r.x, r.y, r.radius*0.84, 0, Math.PI*2);
        ctx.strokeStyle = `hsla(${r.hue}, 100%, 82%, ${r.alpha*0.22})`;
        ctx.lineWidth = r.width*0.45; ctx.stroke();
      }

      // ── Particles ─────────────────────────────────────────────────────────
      const mx = mouseRef.current.x * W;
      const my = mouseRef.current.y * H;

      const particleLightness = dark ? 70 : 55;

      particles.forEach((p) => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.trailLen) p.trail.shift();

        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        if (dist < 140) { const f = (140-dist)/140*0.012; p.vx += (dx/dist)*f; p.vy += (dy/dist)*f; }
        p.vx *= 0.992; p.vy *= 0.992;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W+20; if (p.x > W+20) p.x = -20;
        if (p.y < -20) p.y = H+20; if (p.y > H+20) p.y = -20;

        p.pulse += p.pulseSpeed;
        const pa = p.alpha * (0.5 + 0.5*Math.sin(p.pulse));

        if (p.trail.length > 1) {
          for (let t = 1; t < p.trail.length; t++) {
            const ta = (t/p.trail.length) * pa * 0.42;
            ctx.beginPath();
            ctx.moveTo(p.trail[t-1].x, p.trail[t-1].y);
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
            ctx.strokeStyle = `hsla(${p.hue}, 90%, ${particleLightness}%, ${ta})`;
            ctx.lineWidth = (t/p.trail.length) * p.radius * 0.75;
            ctx.stroke();
          }
        }

        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius*3.2);
        pg.addColorStop(0,   `hsla(${p.hue}, 95%, 82%, ${pa})`);
        pg.addColorStop(0.5, `hsla(${p.hue}, 90%, 70%, ${pa*0.38})`);
        pg.addColorStop(1,   "transparent");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius*3.2, 0, Math.PI*2);
        ctx.fillStyle = pg; ctx.fill();

        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius*0.55, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 92%, ${pa})`; ctx.fill();
      });

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < 88) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${particles[i].hue}, 80%, ${particleLightness}%, ${(1-d/88)*0.11})`;
            ctx.lineWidth = 0.55; ctx.stroke();
          }
        }
      }
    };

    animId2DRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId2DRef.current);
      window.removeEventListener("mousemove", onMM);
      ro.disconnect();
    };
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none no-print ${className}`}
    >
      {/* Layer 1: Canvas 2D aurora + particles */}
      <canvas
        ref={canvas2DRef}
        className="absolute inset-0 w-full h-full"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      />

      {/* Layer 2: Three.js Globe (transparent WebGL on top) */}
      <canvas
        ref={canvasGlobeRef}
        className="absolute inset-0 w-full h-full opacity-65 dark:opacity-75 transition-opacity duration-300"
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10 vignette-overlay" />

      {/* Aurora streaks (CSS) */}
      <div className="absolute top-0 left-0 right-0 h-[55vh] pointer-events-none z-0 aurora-streak-top" />
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] pointer-events-none z-0 aurora-streak-bottom" />

      {/* ── Enhanced Wind Turbines ── */}
      <div className="absolute bottom-[2%] left-[3%] w-[240px] h-[170px] z-20 pointer-events-none hidden md:block">
        {/* Energy glow base */}
        <div className="absolute bottom-0 left-[50px] w-[140px] h-[8px] rounded-full bg-primary-blue/14 dark:bg-accent-neon/18 blur-[4px] shadow-[0_0_20px_6px_rgba(37,99,235,0.08)] dark:shadow-[0_0_20px_6px_rgba(6,182,212,0.1)]" />

        {/* Energy flow line from turbines to house (hidden on small) */}
        <svg className="absolute bottom-2 left-[170px] w-[20vw] h-[5px]" style={{ overflow: "visible" }}>
          <line x1="0" y1="2" x2="100%" y2="2"
            strokeWidth="1.5"
            strokeDasharray="6 4" className="turbine-flow-line stroke-primary-blue dark:stroke-accent-neon opacity-40" />
        </svg>

        {/* Large Turbine */}
        <svg viewBox="0 0 100 150" className="absolute bottom-0 left-[65px] w-20 h-32 origin-bottom">
          <path d="M 48 150 L 49.2 40 L 50.8 40 L 52 150 Z"
            className="fill-slate-350 dark:fill-slate-850 stroke-slate-450 dark:stroke-slate-750" strokeWidth="0.8" />
          <circle cx="50" cy="150" r="4"
            className="fill-slate-250 dark:fill-slate-905 stroke-primary-blue dark:stroke-accent-neon" strokeWidth="1" />
          <g className="wind-turbine-blades" style={{ transformOrigin: "50px 40px" }}>
            <circle cx="50" cy="40" r="4" className="fill-primary-blue dark:fill-accent-neon drop-shadow-[0_0_4px_#2563eb] dark:drop-shadow-[0_0_4px_#22d3ee]" />
            <path d="M 50 40 Q 48.5 20 50 2 Q 51.5 20 50 40 Z"
              className="fill-primary-blue dark:fill-accent-neon opacity-90" />
            <path d="M 50 40 Q 67.3 30 82.9 21 C 82.9 21 67.3 30 50 40 Z"
              className="fill-primary-blue dark:fill-accent-neon opacity-90"
              style={{ transform: "rotate(120deg)", transformOrigin: "50px 40px" }} />
            <path d="M 50 40 Q 32.7 50 17.1 59 C 17.1 59 32.7 50 50 40 Z"
              className="fill-primary-blue dark:fill-accent-neon opacity-90"
              style={{ transform: "rotate(240deg)", transformOrigin: "50px 40px" }} />
          </g>
        </svg>

        {/* Medium Turbine */}
        <svg viewBox="0 0 100 150" className="absolute bottom-0 left-[8px] w-14 h-24 origin-bottom opacity-80">
          <path d="M 48 150 L 49.3 40 L 50.7 40 L 52 150 Z"
            className="fill-slate-350 dark:fill-slate-850 stroke-slate-450 dark:stroke-slate-750" strokeWidth="0.8" />
          <g className="wind-turbine-blades-fast" style={{ transformOrigin: "50px 40px" }}>
            <circle cx="50" cy="40" r="3.2" className="fill-primary-green" />
            <path d="M 50 40 Q 48.6 20 50 3 Q 51.4 20 50 40 Z" className="fill-primary-green opacity-90" />
            <path d="M 50 40 Q 67.3 30 82.9 21 C 82.9 21 67.3 30 50 40 Z" className="fill-primary-green opacity-90"
              style={{ transform: "rotate(120deg)", transformOrigin: "50px 40px" }} />
            <path d="M 50 40 Q 32.7 50 17.1 59 C 17.1 59 32.7 50 50 40 Z" className="fill-primary-green opacity-90"
              style={{ transform: "rotate(240deg)", transformOrigin: "50px 40px" }} />
          </g>
        </svg>

        {/* Small Turbine */}
        <svg viewBox="0 0 100 150" className="absolute bottom-0 left-[140px] w-11 h-20 origin-bottom opacity-65">
          <path d="M 48 150 L 49.4 40 L 50.6 40 L 52 150 Z"
            className="fill-slate-350 dark:fill-slate-850 stroke-slate-450 dark:stroke-slate-750" strokeWidth="0.8" />
          <g className="wind-turbine-blades-slow" style={{ transformOrigin: "50px 40px" }}>
            <circle cx="50" cy="40" r="2.6" className="fill-primary-blue dark:fill-accent-neon" />
            <path d="M 50 40 Q 48.7 20 50 4 Q 51.3 20 50 40 Z" className="fill-primary-blue dark:fill-cyan-500 opacity-90" />
            <path d="M 50 40 Q 67.3 30 82.9 21 C 82.9 21 67.3 30 50 40 Z" className="fill-primary-blue dark:fill-cyan-500 opacity-90"
              style={{ transform: "rotate(120deg)", transformOrigin: "50px 40px" }} />
            <path d="M 50 40 Q 32.7 50 17.1 59 C 17.1 59 32.7 50 50 40 Z" className="fill-primary-blue dark:fill-cyan-500 opacity-90"
              style={{ transform: "rotate(240deg)", transformOrigin: "50px 40px" }} />
          </g>
        </svg>
      </div>

      {/* ── Enhanced Smart Home ── */}
      <div className="absolute bottom-[2%] right-[4%] w-[210px] h-[165px] z-20 pointer-events-none hidden md:block">
        {/* Home glow base */}
        <div className="absolute bottom-0 left-[20px] right-[20px] h-[10px] rounded-full bg-primary-blue/12 dark:bg-primary-green/15 blur-[6px]" />
        <svg viewBox="0 0 210 165" className="w-full h-full overflow-visible">
          <defs>
            <filter id="glow-c" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feComposite in="SourceGraphic" in2="b" operator="over" />
            </filter>
            <filter id="glow-g" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feComposite in="SourceGraphic" in2="b" operator="over" />
            </filter>
            <filter id="glow-y" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feComposite in="SourceGraphic" in2="b" operator="over" />
            </filter>
            <linearGradient id="roof-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  className="roof-stop-0" stopOpacity="0.8" />
              <stop offset="50%" className="roof-stop-1" stopOpacity="1" />
              <stop offset="100%" className="roof-stop-2" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="panel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   className="panel-stop-0" stopOpacity="0.9" />
              <stop offset="100%" className="panel-stop-1" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="105" cy="158" rx="70" ry="5"
            className="fill-black/12 dark:fill-black/30" />

          {/* House body */}
          <path d="M 28 148 L 28 68 L 115 28 L 182 28 L 182 148 Z"
            className="fill-white/55 dark:fill-slate-950/60 stroke-primary-blue/40 dark:stroke-accent-neon/45"
            strokeWidth="1.4" strokeDasharray="5 2.5" />

          {/* Roof line – glowing gradient */}
          <polyline points="28,68 115,28 182,28"
            fill="none" stroke="url(#roof-grad)" strokeWidth="3"
            filter="url(#glow-c)" />

          {/* ── Solar panels on roof ── */}
          {/* Panel 1 */}
          <rect x="118" y="32" width="22" height="13" rx="2"
            fill="url(#panel-grad)"
            className="stroke-primary-blue/50 dark:stroke-accent-neon/60" strokeWidth="0.8" />
          <line x1="118" y1="38.5" x2="140" y2="38.5" className="stroke-blue-400 dark:stroke-accent-neon opacity-60" strokeWidth="0.5" />
          <line x1="129" y1="32"   x2="129" y2="45"   className="stroke-blue-400 dark:stroke-accent-neon opacity-60" strokeWidth="0.5" />
          {/* Panel 2 */}
          <rect x="143" y="32" width="22" height="13" rx="2"
            fill="url(#panel-grad)"
            className="stroke-primary-blue/50 dark:stroke-accent-neon/60" strokeWidth="0.8" />
          <line x1="143" y1="38.5" x2="165" y2="38.5" className="stroke-blue-400 dark:stroke-accent-neon opacity-60" strokeWidth="0.5" />
          <line x1="154" y1="32"   x2="154" y2="45"   className="stroke-blue-400 dark:stroke-accent-neon opacity-60" strokeWidth="0.5" />

          {/* Solar rays from panels */}
          <line x1="151" y1="24" x2="151" y2="16" stroke="#facc15" strokeWidth="1.5"
            className="solar-ray" style={{ animationDelay: "0s" }} opacity="0.7" />
          <line x1="161" y1="21" x2="166" y2="14" stroke="#facc15" strokeWidth="1.2"
            className="solar-ray" style={{ animationDelay: "0.3s" }} opacity="0.6" />
          <line x1="142" y1="21" x2="137" y2="14" stroke="#facc15" strokeWidth="1.2"
            className="solar-ray" style={{ animationDelay: "0.6s" }} opacity="0.6" />
          {/* Sun dot */}
          <circle cx="151" cy="11" r="4.5" fill="#facc15"
            filter="url(#glow-y)" className="solar-sun-pulse" opacity="0.85" />

          {/* Windows */}
          <rect x="42"  y="82" width="20" height="17" rx="2" fill="#facc15"
            className="glowing-window" style={{ animationDelay: "0s",   filter: "drop-shadow(0 0 4px rgba(250,204,21,0.65))" }} />
          <rect x="72"  y="82" width="20" height="17" rx="2" fill="#facc15"
            className="glowing-window" style={{ animationDelay: "1.1s", filter: "drop-shadow(0 0 4px rgba(250,204,21,0.65))" }} />
          <rect x="102" y="82" width="20" height="17" rx="2" fill="#facc15"
            className="glowing-window" style={{ animationDelay: "0.55s", filter: "drop-shadow(0 0 4px rgba(250,204,21,0.65))" }} />
          {/* Tall side window */}
          <rect x="138" y="76" width="22" height="45" rx="2" fill="#facc15"
            className="glowing-window" style={{ animationDelay: "1.7s", filter: "drop-shadow(0 0 4px rgba(250,204,21,0.65))" }} />

          {/* Front door */}
          <rect x="90" y="110" width="18" height="38" rx="2"
            className="fill-indigo-50 dark:fill-slate-905 stroke-primary-blue/35 dark:stroke-accent-neon/35" strokeWidth="1" />
          <circle cx="105" cy="129" r="2" className="fill-primary-blue dark:fill-accent-neon" />

          {/* Digital twin grid lines */}
          <line x1="115" y1="28" x2="138" y2="76" className="stroke-primary-blue/45 dark:stroke-accent-neon/45"
            strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="69"  y1="50" x2="82"  y2="82" stroke="#10b981"
            strokeWidth="1" strokeDasharray="2.5 2.5" opacity="0.5" />

          {/* EV Charger */}
          <rect x="188" y="102" width="12" height="42" rx="2"
            className="fill-slate-350 dark:fill-slate-850 stroke-slate-450 dark:stroke-slate-750" strokeWidth="0.8" />
          <rect x="190" y="104" width="8" height="5" rx="1" className="fill-slate-100 dark:fill-slate-905" />
          <circle cx="194" cy="112" r="3" fill="#10b981" filter="url(#glow-g)"
            className="glowing-window" style={{ animationDelay: "0.2s" }} />
          {/* EV charger cable */}
          <path d="M 194 115 Q 194 130 185 135 Q 176 140 176 148"
            fill="none" className="stroke-slate-400 dark:stroke-slate-750" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="176" cy="148" r="3" className="fill-primary-blue dark:fill-accent-neon glowing-window" style={{ animationDelay: "0.8s" }} />

          {/* Smart meter */}
          <rect x="24" y="98" width="11" height="22" rx="1.5"
            className="fill-slate-250 dark:fill-slate-850 stroke-slate-450 dark:stroke-slate-750" strokeWidth="0.7" />
          <rect x="26" y="100" width="7" height="10" rx="1"
            className="fill-blue-200 dark:fill-slate-905" opacity="0.8" />
          <circle cx="29.5" cy="115" r="2.2" fill="#10b981"
            className="glowing-window" style={{ animationDelay: "1.4s" }} />

          {/* Antenna on roof */}
          <line x1="164" y1="28" x2="164" y2="18" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />
          <line x1="160" y1="20" x2="168" y2="20" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="0.8" />
          <circle cx="164" cy="18" r="2" className="fill-primary-blue dark:fill-accent-neon glowing-window" style={{ animationDelay: "2.2s" }} />
        </svg>
      </div>
    </div>
  );
};
