import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as THREE from "three";
import { updateSurveyStatusByWardChairman } from "../../redux/slices/Cponboardingslice.js";
import ImageLightbox from "./ImageLightbox.jsx";

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_META = {
  verified: { bg: "#d1fae5", color: "#065f46", dot: "#10b981", label: "Verified" },
  approved: { bg: "#d1fae5", color: "#065f46", dot: "#10b981", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Rejected" },
  pending:  { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Pending"  },
  submitted:{ bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Submitted"},
};
const getStatusMeta = (s) => STATUS_META[s?.toLowerCase()] ?? { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af", label: s ?? "—" };

export default function BuildingExplorerView({ form, cp, onBack }) {
  const dispatch = useDispatch();
  const canvasContainerRef = useRef(null);

  const { user } = useSelector((s) => s.auth || {});
  const wardChairmanId = user?._id || user?.userId;

  const [verifying, setVerifying]       = useState(false);
  const [rejectOpen, setRejectOpen]     = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isLoading, setIsLoading]       = useState(true);

  // HUD Floor State
  const [selectedFloorData, setSelectedFloorData] = useState(null);
  const [isInsideFloor, setIsInsideFloor]         = useState(false);

  const exitFloorRef = useRef(null);

  const surveyId    = form.surveyId ?? form._id ?? form.formId ?? form.submissionId;
  const status      = form.status ?? "SUBMITTED";
  const isVerified  = status?.toUpperCase() === "VERIFIED";
  const isRejected  = status?.toUpperCase() === "REJECTED";
  const surveyTitle = form.surveyNumber
    ? `Survey #${String(form.surveyNumber).startsWith("D") ? form.surveyNumber : "D-" + String(form.surveyNumber).padStart(2, "0")}`
    : form.formType ?? form.formName ?? "Survey";

  const images = Array.isArray(form.images) ? form.images : [];

  const handleAction = async (newStatus, reason = "VERIFIED.") => {
    if (!wardChairmanId) { alert("Ward Chairman ID not found. Please re-login."); return; }
    setVerifying(true);
    try {
      await dispatch(updateSurveyStatusByWardChairman({ surveyId, wardChairmanId, status: newStatus, rejectionReason: reason })).unwrap();
      setRejectOpen(false);
    } catch (e) {
      alert(e || "Status update failed");
    } finally {
      setVerifying(false);
    }
  };

  // ─── THREE.JS 3D CANVAS IMPLEMENTATION ────────────────────────────────────
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    // 1. Prepare Floors Data from form
    const rawFloors = Array.isArray(form.floors) && form.floors.length > 0
      ? form.floors
      : Array.from({ length: form.numberOfFloors || 3 }, (_, i) => ({
          floorNumber: i,
          floorType: i === 0 ? "GROUND" : "UPPER",
          usageType: "COMMERCIAL",
          occupancyType: "OFFICE",
        }));

    const sortedFloors = [...rawFloors].sort((a, b) => (a.floorNumber ?? 0) - (b.floorNumber ?? 0));

    const THEME_COLORS = [
      { carpet: 0x1c2333, glow: 0x4fd1ff },
      { carpet: 0x202a3d, glow: 0x7ee8fa },
      { carpet: 0x232a3a, glow: 0xffb454 },
      { carpet: 0x1a1620, glow: 0xff8a5c },
      { carpet: 0x18241c, glow: 0x43e6a0 },
      { carpet: 0x221a2e, glow: 0x9d8cff },
    ];

    const FLOORS = sortedFloors.map((fl, i) => {
      const num = fl.floorNumber ?? i;
      const isGround = num === 0 || (fl.floorType && fl.floorType.toUpperCase() === "GROUND");
      const tag = fl.floorType || (isGround ? "GROUND" : "UPPER");
      const usage = fl.usageType || "COMMERCIAL";
      const occupancy = fl.occupancyType || fl.residentialOccupancy || (usage === "RESIDENTIAL" ? "SELF OCCUPIED" : "OFFICE");
      const theme = THEME_COLORS[i % THEME_COLORS.length];

      return {
        key: i,
        label: `Floor #${num}`,
        tag: tag,
        name: `${usage} — ${occupancy}`,
        occupancy: occupancy,
        usageType: usage,
        desks: usage === "RESIDENTIAL" ? 4 : (isGround ? 8 : 12),
        meetingRooms: usage === "RESIDENTIAL" ? 0 : 1,
        reception: isGround && usage !== "RESIDENTIAL",
        executive: !isGround && i === sortedFloors.length - 1 && usage !== "RESIDENTIAL",
        lounge: usage === "RESIDENTIAL" || (!isGround && i === 2),
        carpet: theme.carpet,
        glow: theme.glow,
        staff: usage === "RESIDENTIAL" ? 3 : (isGround ? 6 : 9),
        raw: fl,
      };
    });

    const FLOOR_H = 3.5, W = 9.4, D = 6.8;

    // 2. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060911, 0.016);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Lighting
    scene.add(new THREE.AmbientLight(0x8fa8ff, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(14, 26, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -20; sun.shadow.camera.right = 20; sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x4fd1ff, 0.4);
    rim.position.set(-12, 10, -14);
    scene.add(rim);

    // 4. Ground & Grid
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1a, roughness: 1 });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 64), groundMat);
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.position.y = -0.02;
    scene.add(ground);

    const grid = new THREE.GridHelper(120, 60, 0x1c3350, 0x121a2a);
    grid.position.y = -0.01;
    scene.add(grid);

    // Helper: Canvas texture label sprite
    function makeLabelSprite(text, sub, color) {
      const c = document.createElement("canvas"); c.width = 512; c.height = 170;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = "rgba(6,9,17,0.82)";
      roundRect(ctx, 4, 4, c.width - 8, c.height - 8, 22); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 3;
      roundRect(ctx, 4, 4, c.width - 8, c.height - 8, 22); ctx.stroke();
      ctx.fillStyle = color; ctx.font = "600 46px Space Grotesk, sans-serif";
      ctx.fillText(text, 34, 78);
      ctx.fillStyle = "#9fb0cc"; ctx.font = "500 30px IBM Plex Mono, monospace";
      ctx.fillText(sub, 34, 122);
      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      const spr = new THREE.Sprite(mat);
      spr.scale.set(2.6, 0.88, 1);
      spr.renderOrder = 999;
      return spr;
    }

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }

    // 5. Building Mesh Construction
    const building = new THREE.Group();
    scene.add(building);

    const floorMeshes = [];
    const floorGroups = [];
    const interiors = [];
    const facadeGroups = [];

    FLOORS.forEach((fd, i) => {
      const fg = new THREE.Group();
      fg.position.y = i * FLOOR_H;
      fg.userData.targetY = fg.position.y;

      // Slab
      const slabMat = new THREE.MeshStandardMaterial({ color: 0x151b28, roughness: 0.75, metalness: 0.15 });
      const slab = new THREE.Mesh(new THREE.BoxGeometry(W, FLOOR_H - 0.18, D), slabMat);
      slab.position.y = (FLOOR_H - 0.18) / 2;
      slab.castShadow = true; slab.receiveShadow = true;
      slab.userData.floorIndex = i;
      fg.add(slab);
      floorMeshes.push(slab);

      // Edge lines
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(slab.geometry),
        new THREE.LineBasicMaterial({ color: fd.glow, transparent: true, opacity: 0.55 })
      );
      edges.position.copy(slab.position);
      fg.add(edges);

      // Facade window bands
      const facade = new THREE.Group();
      const winMat = new THREE.MeshStandardMaterial({
        color: 0x0c1220, emissive: fd.glow, emissiveIntensity: 0.55,
        roughness: 0.3, metalness: 0.4, transparent: true, opacity: 0.92
      });
      const cols = 6;
      for (let c = 0; c < cols; c++) {
        const wgeo = new THREE.BoxGeometry((W / cols) * 0.72, (FLOOR_H - 0.18) * 0.6, 0.08);
        const wf = new THREE.Mesh(wgeo, winMat);
        wf.position.set(-W / 2 + (c + 0.5) * (W / cols), (FLOOR_H - 0.18) / 2, D / 2 + 0.06);
        facade.add(wf);
        const wb = wf.clone(); wb.position.z = -D / 2 - 0.06; facade.add(wb);
      }
      const sideCols = 4;
      for (let c = 0; c < sideCols; c++) {
        const wgeo = new THREE.BoxGeometry(0.08, (FLOOR_H - 0.18) * 0.6, (D / sideCols) * 0.72);
        const wl = new THREE.Mesh(wgeo, winMat);
        wl.position.set(-W / 2 - 0.06, (FLOOR_H - 0.18) / 2, -D / 2 + (c + 0.5) * (D / sideCols));
        facade.add(wl);
        const wr = wl.clone(); wr.position.x = W / 2 + 0.06; facade.add(wr);
      }
      fg.add(facade);
      facadeGroups.push(facade);

      // Label sprite
      const hexColor = "#" + fd.glow.toString(16).padStart(6, "0");
      const label = makeLabelSprite(fd.label, `${fd.tag} · ${fd.occupancy}`, hexColor);
      label.position.set(-W / 2 - 1.7, (FLOOR_H - 0.18) / 2, D / 2 + 0.5);
      label.userData.floorIndex = i;
      fg.add(label);
      floorMeshes.push(label);

      // Load-in initial scale
      fg.position.y = -6;
      fg.scale.set(1, 0.001, 1);

      building.add(fg);
      floorGroups.push(fg);
      interiors.push(null);
    });

    // Roof
    const roof = new THREE.Group();
    const roofSlab = new THREE.Mesh(
      new THREE.BoxGeometry(W * 0.98, 0.22, D * 0.98),
      new THREE.MeshStandardMaterial({ color: 0x1a2233, roughness: 0.8 })
    );
    roof.add(roofSlab);
    for (let i = 0; i < 2; i++) {
      const ac = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.5, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x2a3448, roughness: 0.6, metalness: 0.3 })
      );
      ac.position.set(-2.4 + i * 3.2, 0.36, -1.6);
      roof.add(ac);
    }
    roof.position.y = FLOORS.length * FLOOR_H + 0.11;
    building.add(roof);

    // 6. Tween engine
    const activeTweens = [];
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeOutBack(t) { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
    function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function animateTween(obj, targetProps, duration, ease = easeInOutCubic, onComplete) {
      const start = {}; const t0 = performance.now();
      for (const k in targetProps) start[k] = obj[k];
      const tw = { obj, start, targetProps, duration, ease, t0, onComplete };
      activeTweens.push(tw);
      return tw;
    }
    function updateTweens(now) {
      for (let i = activeTweens.length - 1; i >= 0; i--) {
        const tw = activeTweens[i];
        let t = (now - tw.t0) / tw.duration; if (t > 1) t = 1;
        const e = tw.ease(t);
        for (const k in tw.targetProps) {
          tw.obj[k] = tw.start[k] + (tw.targetProps[k] - tw.start[k]) * e;
        }
        if (t >= 1) {
          activeTweens.splice(i, 1);
          if (tw.onComplete) tw.onComplete();
        }
      }
    }

    // Load-in stagger
    FLOORS.forEach((fgData, i) => {
      const fg = floorGroups[i];
      const delay = i * 180;
      const dur = 700;
      const targetY = fg.userData.targetY;
      setTimeout(() => {
        animateTween(fg.position, { y: targetY }, dur, easeOutBack);
        animateTween(fg.scale, { y: 1 }, dur, easeOutCubic);
      }, delay);
    });
    setTimeout(() => {
      setIsLoading(false);
    }, FLOORS.length * 180 + 400);

    // 7. Interior Builder
    const SHIRTS = [0x4fd1ff, 0xffb454, 0x43e6a0, 0xff8a5c, 0x9d8cff, 0xe0e6f0, 0x6ba8ff];

    function personFigure(shirtColor) {
      const g = new THREE.Group();
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.46, 10), new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 }));
      torso.position.y = 0.62; torso.castShadow = true; g.add(torso);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), new THREE.MeshStandardMaterial({ color: 0xe4b48a, roughness: 0.7 }));
      head.position.y = 0.95; head.castShadow = true; g.add(head);
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.7), new THREE.MeshStandardMaterial({ color: 0x1b1712, roughness: 0.9 }));
      hair.position.y = 0.99; g.add(hair);
      return g;
    }

    function laptop() {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.24), new THREE.MeshStandardMaterial({ color: 0xc7cdd8, roughness: 0.4, metalness: 0.5 }));
      base.position.y = 0.01; g.add(base);
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.015), new THREE.MeshStandardMaterial({ color: 0xc7cdd8, roughness: 0.4, metalness: 0.5 }));
      screen.position.set(0, 0.11, -0.115); screen.rotation.x = -0.28; g.add(screen);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.17), new THREE.MeshStandardMaterial({ color: 0x4fd1ff, emissive: 0x4fd1ff, emissiveIntensity: 1.1, roughness: 0.3 }));
      glow.position.set(0, 0.11, -0.107); glow.rotation.x = -0.28; g.add(glow);
      g.userData.glow = glow;
      return g;
    }

    function deskChairUnit(seated, shirtColor) {
      const g = new THREE.Group();
      const topMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.55 });
      const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2f3a, roughness: 0.6, metalness: 0.3 });
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 0.62), topMat);
      top.position.y = 0.72; top.castShadow = true; top.receiveShadow = true; g.add(top);
      [[-0.46, -0.26], [0.46, -0.26], [-0.46, 0.26], [0.46, 0.26]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6), legMat);
        leg.position.set(x, 0.36, z); leg.castShadow = true; g.add(leg);
      });
      const lt = laptop(); lt.position.set(0, 0.735, 0); lt.rotation.y = Math.PI * 0.02;
      g.add(lt); g.userData.laptopGlow = lt.userData.glow;

      const chair = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 14), new THREE.MeshStandardMaterial({ color: 0x333c4d, roughness: 0.7 }));
      seat.position.y = 0.46; seat.castShadow = true; chair.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.05), new THREE.MeshStandardMaterial({ color: 0x333c4d, roughness: 0.7 }));
      back.position.set(0, 0.68, -0.19); chair.add(back);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 8), new THREE.MeshStandardMaterial({ color: 0x1c2029 }));
      pole.position.y = 0.24; chair.add(pole);
      const base5 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 5), new THREE.MeshStandardMaterial({ color: 0x1c2029 }));
      base5.position.y = 0.02; chair.add(base5);
      chair.position.set(0, 0, 0.52); g.add(chair);

      if (seated) {
        const p = personFigure(shirtColor); p.position.set(0, 0, 0.42);
        g.add(p); g.userData.person = p;
      }
      return g;
    }

    function plant() {
      const g = new THREE.Group();
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.22, 10), new THREE.MeshStandardMaterial({ color: 0x3a2f28, roughness: 0.9 }));
      pot.position.y = 0.11; g.add(pot);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f6b45, roughness: 0.8 });
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.5, 6), leafMat);
        leaf.position.set(Math.sin(i * 1.3) * 0.08, 0.5, Math.cos(i * 1.3) * 0.08);
        leaf.rotation.z = Math.sin(i) * 0.35; leaf.rotation.x = Math.cos(i) * 0.3;
        g.add(leaf);
      }
      return g;
    }

    function buildInterior(idx) {
      const fd = FLOORS[idx];
      const room = new THREE.Group();
      const innerW = W - 0.9, innerD = D - 0.9;

      const carpet = new THREE.Mesh(new THREE.PlaneGeometry(innerW, innerD), new THREE.MeshStandardMaterial({ color: fd.carpet, roughness: 0.95 }));
      carpet.rotation.x = -Math.PI / 2; carpet.position.y = 0.02; carpet.receiveShadow = true;
      room.add(carpet);
      const gridHelp = new THREE.GridHelper(Math.max(innerW, innerD), 10, 0x2a3450, 0x1a2233);
      gridHelp.position.y = 0.021; room.add(gridHelp);

      const lights = [];
      const deskUnits = [];

      function addCeilingLight(x, z) {
        const pl = new THREE.PointLight(0xfff3da, 0, 3.6, 2);
        pl.position.set(x, FLOOR_H - 0.6, z);
        room.add(pl);
        const fix = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0xdfe6f2, emissive: 0xfff3da, emissiveIntensity: 0 }));
        fix.position.set(x, FLOOR_H - 0.62, z);
        room.add(fix);
        lights.push({ light: pl, target: 1.1, fixture: fix });
      }

      if (fd.executive) {
        const bigDesk = deskChairUnit(true, SHIRTS[0]);
        bigDesk.scale.set(1.25, 1, 1.25); bigDesk.position.set(0, 0, -innerD / 2 + 1.7); bigDesk.rotation.y = Math.PI;
        room.add(bigDesk); deskUnits.push(bigDesk);
        addCeilingLight(0, -innerD / 2 + 1.7);
        let n = 1;
        const sidePositions = [[-2.6, 1.4], [2.6, 1.4], [-2.6, -0.6], [2.6, -0.6], [0, 1.9]];
        for (let i = 0; i < fd.desks - 1 && i < sidePositions.length; i++) {
          const seated = n < fd.staff;
          const du = deskChairUnit(seated, SHIRTS[n % SHIRTS.length]);
          du.position.set(sidePositions[i][0], 0, sidePositions[i][1]);
          du.rotation.y = sidePositions[i][1] < 0 ? Math.PI : 0;
          room.add(du); deskUnits.push(du); n++;
          if (i % 2 === 0) addCeilingLight(sidePositions[i][0], sidePositions[i][1]);
        }
        const p1 = plant(); p1.position.set(-innerW / 2 + 0.7, 0, innerD / 2 - 0.7); room.add(p1);
      } else {
        const pairs = Math.ceil(fd.desks / 2);
        const cols = Math.min(pairs, fd.reception ? 3 : 4);
        const rows = Math.ceil(pairs / cols);
        const spanX = innerW - 1.6, spanZ = innerD - (fd.reception ? 2.8 : 1.8);
        const stepX = spanX / Math.max(cols - 1, 1);
        const stepZ = spanZ / Math.max(rows - 1, 1);
        let deskCount = 0, staffCount = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (deskCount >= fd.desks) break;
            const cx = -spanX / 2 + c * stepX;
            const cz = -spanZ / 2 + r * stepZ + (fd.reception ? 0.6 : 0);
            for (let s = 0; s < 2 && deskCount < fd.desks; s++) {
              const seated = staffCount < fd.staff;
              const du = deskChairUnit(seated, SHIRTS[deskCount % SHIRTS.length]);
              du.position.set(cx, 0, cz + (s === 0 ? -0.42 : 0.42));
              du.rotation.y = s === 0 ? Math.PI : 0;
              room.add(du); deskUnits.push(du);
              if (seated) staffCount++;
              deskCount++;
            }
            if ((r + c) % 2 === 0) addCeilingLight(cx, cz);
          }
        }
      }

      for (let m = 0; m < fd.meetingRooms; m++) {
        const mr = new THREE.Group();
        const mw = 2.3, md = 2.0;
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x4fd1ff, transparent: true, opacity: 0.14, roughness: 0.1, metalness: 0.2, side: THREE.DoubleSide });
        const wallFront = new THREE.Mesh(new THREE.BoxGeometry(mw, 1.7, 0.04), glassMat); wallFront.position.set(0, 0.85, md / 2); mr.add(wallFront);
        const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.7, md), glassMat); wallLeft.position.set(-mw / 2, 0.85, 0); mr.add(wallLeft);
        const wallRight = wallLeft.clone(); wallRight.position.x = mw / 2; mr.add(wallRight);
        const table = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0x7a5c3e, roughness: 0.5 }));
        table.position.y = 0.62; mr.add(table);
        const corner = m === 0 ? [innerW / 2 - mw / 2 - 0.3, innerD / 2 - md / 2 - 0.3] : [-(innerW / 2 - mw / 2 - 0.3), innerD / 2 - md / 2 - 0.3];
        mr.position.set(corner[0], 0, corner[1]);
        room.add(mr);
        addCeilingLight(corner[0], corner[1]);
      }

      if (fd.reception) {
        const desk = new THREE.Group();
        const counter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.55), new THREE.MeshStandardMaterial({ color: 0x1c2233, roughness: 0.4, metalness: 0.3 }));
        counter.position.y = 0.45; counter.castShadow = true; desk.add(counter);
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.06, 0.02), new THREE.MeshStandardMaterial({ color: fd.glow, emissive: fd.glow, emissiveIntensity: 0.9 }));
        stripe.position.set(0, 0.5, 0.28); desk.add(stripe);
        desk.position.set(0, 0, -innerD / 2 + 0.6); room.add(desk);
        addCeilingLight(0, -innerD / 2 + 0.6);
      }

      const gp = plant(); gp.position.set(-innerW / 2 + 0.5, 0, innerD / 2 - 0.5); room.add(gp);
      room.visible = false;
      room.userData.lights = lights;
      room.userData.deskUnits = deskUnits;
      room.position.set(0, 0.02, 0);
      return room;
    }

    // 8. Orbit & Camera Controls
    const orbit = { theta: 0.78, phi: 1.05, radius: 26, target: new THREE.Vector3(0, FLOORS.length * FLOOR_H * 0.45, 0) };
    let savedOverviewOrbit = null;
    let mode = "overview";

    function applyOrbitCamera() {
      const { theta, phi, radius, target } = orbit;
      const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      const y = target.y + radius * Math.cos(phi);
      const z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.position.set(x, y, z);
      camera.lookAt(target);
    }
    applyOrbitCamera();

    let isDragging = false, lastX = 0, lastY = 0, dragMoved = false;

    const onPointerDown = (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; dragMoved = false; };
    const onPointerUp = (e) => { isDragging = false; if (!dragMoved) handleClick(e); };
    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
      orbit.theta -= dx * 0.0055;
      orbit.phi = Math.min(Math.max(orbit.phi - dy * 0.0045, 0.35), 1.5);
      lastX = e.clientX; lastY = e.clientY;
    };
    const onWheel = (e) => {
      if (mode === "interior") {
        if (e.deltaY > 0) {
          // Zooming out while inside a floor
          orbit.radius += e.deltaY * 0.015;
          if (orbit.radius >= 8.0) {
            exitFloor();
          }
        } else {
          // Zooming in
          orbit.radius = Math.min(Math.max(orbit.radius + e.deltaY * 0.015, 3.2), 8.5);
        }
      } else if (mode === "overview") {
        orbit.radius = Math.min(Math.max(orbit.radius + e.deltaY * 0.02, 9), 42);
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("wheel", onWheel, { passive: true });

    // 9. Raycasting Floor Click
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();

    function handleClick(e) {
      if (mode !== "overview") return;
      const rect = domEl.getBoundingClientRect();
      pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(floorMeshes, false);
      if (hits.length) {
        const idx = hits[0].object.userData.floorIndex;
        if (idx !== undefined) enterFloor(idx);
      }
    }

    let orbitProxyActive = false;
    let orbitProxy = null;

    function enterFloor(idx) {
      if (mode === "transitioning") return;
      mode = "transitioning";
      savedOverviewOrbit = { theta: orbit.theta, phi: orbit.phi, radius: orbit.radius, target: orbit.target.clone() };

      const fd = FLOORS[idx];
      const fg = floorGroups[idx];

      if (!interiors[idx]) {
        const room = buildInterior(idx);
        fg.add(room);
        interiors[idx] = room;
      }

      floorGroups.forEach((g, i) => { if (i !== idx) fadeGroup(g, 0.06); });
      roof.visible = false;
      facadeGroups[idx].visible = false;

      const room = interiors[idx];
      room.visible = true;
      room.userData.deskUnits.forEach((du, i) => {
        du.scale.set(0.001, 0.001, 0.001);
        setTimeout(() => { animateTween(du.scale, { x: 1, y: 1, z: 1 }, 420, easeOutBack); }, 260 + i * 45);
      });

      const worldY = fg.position.y;
      const newTarget = new THREE.Vector3(0, worldY + 1.2, 0);
      const newOrbit = { theta: 0.9, phi: 1.15, radius: 6.4, target: newTarget };

      setSelectedFloorData(fd);

      orbitProxy = { theta: orbit.theta, phi: orbit.phi, radius: orbit.radius, tx: orbit.target.x, ty: orbit.target.y, tz: orbit.target.z };
      orbitProxyActive = true;

      animateTween(
        orbitProxy,
        { theta: newOrbit.theta, phi: newOrbit.phi, radius: newOrbit.radius, tx: newOrbit.target.x, ty:newOrbit.target.y, tz: newOrbit.target.z },
        1100,
        easeInOutCubic,
        () => {
          mode = "interior";
          setIsInsideFloor(true);
          orbitProxyActive = false;
          room.userData.lights.forEach((L, i) => {
            setTimeout(() => {
              animateTween(L.light, { intensity: L.target }, 500, easeOutCubic);
              if (L.fixture) L.fixture.material.emissiveIntensity = 0.9;
            }, i * 120);
          });
        }
      );
    }

    function exitFloor() {
      if (mode !== "interior") return;
      mode = "transitioning";
      setIsInsideFloor(false);

      let idx = 0;
      for (let i = 0; i < facadeGroups.length; i++) {
        if (!facadeGroups[i].visible) { idx = i; break; }
      }

      const room = interiors[idx];
      if (room) {
        room.userData.lights.forEach((L) => {
          animateTween(L.light, { intensity: 0 }, 350, easeOutCubic);
          if (L.fixture) L.fixture.material.emissiveIntensity = 0;
        });
      }

      const ov = savedOverviewOrbit;
      orbitProxy = { theta: orbit.theta, phi: orbit.phi, radius: orbit.radius, tx: orbit.target.x, ty: orbit.target.y, tz: orbit.target.z };
      orbitProxyActive = true;

      animateTween(
        orbitProxy,
        { theta: ov.theta, phi: ov.phi, radius: ov.radius, tx: ov.target.x, ty: ov.target.y, tz: ov.target.z },
        950,
        easeInOutCubic,
        () => {
          mode = "overview";
          orbitProxyActive = false;
          if (room) room.visible = false;
          facadeGroups[idx].visible = true;
          roof.visible = true;
          floorGroups.forEach((g) => fadeGroup(g, 1));
        }
      );
    }

    exitFloorRef.current = exitFloor;

    function fadeGroup(g, opacity) {
      g.traverse((obj) => {
        if (obj.isMesh || obj.isSprite) {
          if (!obj.userData._origOpacity && obj.userData._origOpacity !== 0) {
            obj.userData._origOpacity = obj.material && obj.material.opacity !== undefined ? obj.material.opacity : 1;
            obj.userData._origTransparent = obj.material ? obj.material.transparent : false;
          }
          if (obj.material) {
            obj.material.transparent = true;
            animateTween(obj.material, { opacity: opacity * obj.userData._origOpacity }, 500, easeOutCubic, () => {
              if (opacity >= 1) obj.material.transparent = obj.userData._origTransparent;
            });
          }
        }
      });
    }

    // 10. Animation Frame Loop
    let animFrameId = null;
    let t = 0;

    function renderLoop(now) {
      animFrameId = requestAnimationFrame(renderLoop);
      updateTweens(now);

      if (orbitProxyActive && orbitProxy) {
        orbit.theta = orbitProxy.theta; orbit.phi = orbitProxy.phi; orbit.radius = orbitProxy.radius;
        orbit.target.set(orbitProxy.tx, orbitProxy.ty, orbitProxy.tz);
      }
      applyOrbitCamera();

      t += 0.016;
      interiors.forEach((room) => {
        if (!room || !room.visible) return;
        room.userData.deskUnits.forEach((du, i) => {
          if (du.userData.laptopGlow) {
            du.userData.laptopGlow.material.emissiveIntensity = 0.9 + Math.sin(t * 2 + i) * 0.25;
          }
          if (du.userData.person) {
            du.userData.person.position.y = Math.sin(t * 1.4 + i) * 0.01;
          }
        });
      });

      renderer.render(scene, camera);
    }

    animFrameId = requestAnimationFrame(renderLoop);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver = null;
    if (typeof window !== "undefined" && window.ResizeObserver && container) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }

    // Clean up
    return () => {
      cancelAnimationFrame(animFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("wheel", onWheel);
      if (domEl.parentNode) domEl.parentNode.removeChild(domEl);
      renderer.dispose();
    };
  }, [form]);

  const rawFloorsCount = Array.isArray(form.floors) ? form.floors.length : form.numberOfFloors || 0;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 48px)",
        minHeight: "650px",
        borderRadius: 16,
        overflow: "hidden",
        background: "#060911",
        fontFamily: "'Inter', sans-serif",
        color: "#e9edf6",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      }}
    >
      {/* ── Lightbox for Photos ── */}
      {lightboxIndex !== null && (
        <ImageLightbox images={images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      {/* ── TOP HEADER / ACTION BAR ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(14, 19, 32, 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(120, 170, 255, 0.16)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(79, 209, 255, 0.1)",
              border: "1px solid rgba(79, 209, 255, 0.25)",
              color: "#4fd1ff",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            ← Back to Submitted Forms
          </button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
              {surveyTitle}
              <span
                style={{
                  background: getStatusMeta(status).bg,
                  color: getStatusMeta(status).color,
                  padding: "2px 10px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {getStatusMeta(status).label}
              </span>
            </div>
            {cp?.name && (
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                Channel Partner: <b style={{ color: "#e2e8f0" }}>{cp.name}</b>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {images.length > 0 && (
            <button
              onClick={() => setLightboxIndex(0)}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              📷 View Images ({images.length})
            </button>
          )}
        </div>
      </div>

      {/* ── LOAD OVERLAY ── */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#060911",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#4fd1ff", fontSize: 12, letterSpacing: "0.18em" }}>
            ASSEMBLING STRUCTURE
          </div>
          <div style={{ width: 200, height: 2, background: "rgba(255,255,255,0.08)", marginTop: 16, overflow: "hidden", borderRadius: 2 }}>
            <div style={{ width: "30%", height: "100%", background: "#4fd1ff", animation: "load 1.1s ease-in-out infinite" }} />
          </div>
          <style>{`@keyframes load{0%{transform:translateX(-100%);}100%{transform:translateX(340%);}}`}</style>
        </div>
      )}

      {/* ── 3D CANVAS CONTAINER ── */}
      <div ref={canvasContainerRef} style={{ width: "100%", height: "100%", display: "block" }} />

      {/* ── HUD PANEL: TOP-LEFT SURVEY CARD ── */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 20,
          width: 290,
          zIndex: 10,
          pointerEvents: "auto",
          background: "rgba(14,19,32,0.72)",
          border: "1px solid rgba(120,170,255,0.16)",
          backdropFilter: "blur(14px)",
          borderRadius: 14,
          padding: "16px 18px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 10.5,
            letterSpacing: ".14em",
            color: "#4fd1ff",
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 6,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#43e6a0", boxShadow: "0 0 8px #43e6a0" }} />
          {status}
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, margin: "0 0 2px", color: "#fff" }}>
          {surveyTitle}
        </h1>
        <div style={{ fontSize: 11.5, color: "#7c879e", fontFamily: "'IBM Plex Mono',monospace" }}>
          {form.locationType || "BUILDING"} · ID …{String(surveyId).slice(-6)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(120,170,255,0.16)" }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace" }}>
            <div style={{ fontSize: 9.5, color: "#7c879e", letterSpacing: ".08em", textTransform: "uppercase" }}>Submitted</div>
            <div style={{ fontSize: 12.5, marginTop: 2, color: "#e9edf6" }}>{formatDate(form.createdAt)}</div>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace" }}>
            <div style={{ fontSize: 9.5, color: "#7c879e", letterSpacing: ".08em", textTransform: "uppercase" }}>Floors</div>
            <div style={{ fontSize: 12.5, marginTop: 2, color: "#e9edf6" }}>{rawFloorsCount}</div>
          </div>
        </div>
      </div>

      {/* ── HUD PANEL: TOP-RIGHT LOCATION CARD ── */}
      <div
        style={{
          position: "absolute",
          top: 64,
          right: 20,
          width: 240,
          zIndex: 10,
          pointerEvents: "auto",
          background: "rgba(14,19,32,0.72)",
          border: "1px solid rgba(120,170,255,0.16)",
          backdropFilter: "blur(14px)",
          borderRadius: 14,
          padding: "16px 18px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: ".14em", color: "#ffb454", marginBottom: 10 }}>
          LOCATION INFO
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
          <span style={{ color: "#7c879e" }}>Address</span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#e9edf6", textAlign: "right" }}>
            {form.locationAddress || "Bank Office"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
          <span style={{ color: "#7c879e" }}>Type</span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#e9edf6", textAlign: "right" }}>
            {form.locationType || "Building"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0" }}>
          <span style={{ color: "#7c879e" }}>GPS</span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#e9edf6", textAlign: "right" }}>
            {form.latitude ? `${Number(form.latitude).toFixed(4)}, ${Number(form.longitude).toFixed(4)}` : "13.0146, 77.5511"}
          </span>
        </div>
      </div>

      {/* ── HUD BUTTON: BACK TO BUILDING (when inside floor) ── */}
      {isInsideFloor && (
        <button
          onClick={() => exitFloorRef.current && exitFloorRef.current()}
          style={{
            position: "absolute",
            top: 64,
            left: 20,
            zIndex: 20,
            background: "rgba(14,19,32,0.85)",
            border: "1px solid rgba(79,209,255,0.4)",
            backdropFilter: "blur(14px)",
            borderRadius: 10,
            padding: "10px 16px",
            color: "#e9edf6",
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 9,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Building
        </button>
      )}

      {/* ── HUD HINT: BOTTOM CENTER ── */}
      {!isInsideFloor && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(14,19,32,0.72)",
            border: "1px solid rgba(120,170,255,0.16)",
            backdropFilter: "blur(14px)",
            borderRadius: 999,
            padding: "9px 18px",
            fontSize: 12,
            color: "#7c879e",
            fontFamily: "'IBM Plex Mono',monospace",
            letterSpacing: ".02em",
            pointerEvents: "none",
            zIndex: 10,
            opacity: 0.9,
          }}
        >
          <span style={{ color: "#4fd1ff" }}>drag</span> to orbit &nbsp;·&nbsp;{" "}
          <span style={{ color: "#4fd1ff" }}>scroll</span> to zoom &nbsp;·&nbsp;{" "}
          <span style={{ color: "#4fd1ff" }}>click a floor</span> to step inside
        </div>
      )}

      {/* ── HUD FLOOR PANEL: BOTTOM INTERIOR DETAIL ── */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: isInsideFloor ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(160%)",
          width: "min(680px, 92vw)",
          padding: "18px 22px",
          borderRadius: 14,
          background: "rgba(14,19,32,0.85)",
          border: "1px solid rgba(120,170,255,0.25)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          transition: "transform 0.55s cubic-bezier(.2,.8,.2,1)",
          zIndex: 20,
          pointerEvents: "auto",
        }}
      >
        {selectedFloorData && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
              <div>
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9.5,
                    letterSpacing: ".1em",
                    padding: "3px 8px",
                    borderRadius: 5,
                    marginBottom: 6,
                    background: "rgba(79,209,255,0.12)",
                    color: "#4fd1ff",
                    border: "1px solid rgba(79,209,255,0.25)",
                  }}
                >
                  {selectedFloorData.tag}
                </span>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 19, margin: 0, color: "#fff" }}>
                  {selectedFloorData.name}
                </h2>
                <div style={{ fontSize: 12.5, color: "#7c879e", marginTop: 4 }}>
                  {selectedFloorData.label} · {selectedFloorData.usageType} · Occupancy: {selectedFloorData.occupancy}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(120,170,255,0.16)", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 110 }}>
                <div style={{ fontSize: 10, color: "#7c879e", letterSpacing: ".06em", textTransform: "uppercase" }}>Floor Type</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: "#4fd1ff", marginTop: 4 }}>
                  {selectedFloorData.raw?.floorType || selectedFloorData.tag}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 110 }}>
                <div style={{ fontSize: 10, color: "#7c879e", letterSpacing: ".06em", textTransform: "uppercase" }}>Usage Type</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: "#43e6a0", marginTop: 4 }}>
                  {selectedFloorData.raw?.usageType || "—"}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 10, color: "#7c879e", letterSpacing: ".06em", textTransform: "uppercase" }}>Occupancy Type</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: "#ffb454", marginTop: 4 }}>
                  {selectedFloorData.raw?.occupancyType || selectedFloorData.raw?.residentialOccupancy || "—"}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
