import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Play, ArrowLeft, Copy, Check, Users } from "lucide-react";

const ROOM_CODE = "7F3K9Q";
const MAX_PLAYERS = 8;
const ACCENT = "#f2b880";
const REAL_PLAYERS = [
  { id: 1, name: "주주 (나)", color: "#f2b880", ready: true, isYou: true },
  { id: 2, name: "노바", color: "#a8c968", ready: true },
  { id: 3, name: "카이", color: "#c98fae", ready: false },
];

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;600;700&family=Space+Mono:wght@700&family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
      .hs-display { font-family: 'Bebas Neue', 'Rajdhani', sans-serif; }
      .hs-tech { font-family: 'Rajdhani', sans-serif; }
      .hs-mono { font-family: 'Space Mono', monospace; }
      .hs-kr { font-family: 'Noto Sans KR', system-ui, sans-serif; }
      @keyframes hsFadeUp { 0% { opacity:0; transform: translateY(14px); } 100% { opacity:1; transform: translateY(0); } }
      .hs-fade { opacity:0; animation: hsFadeUp 0.6s ease-out forwards; }
      .hs-cta-outline:hover { background: ${ACCENT} !important; color: #2b1a0d !important; }
    `}</style>
  );
}

function BracketFrame({ children, color = ACCENT, size = 12, style }) {
  const base = {
    position: "absolute",
    width: size,
    height: size,
    borderColor: color,
  };
  return (
    <div style={{ position: "relative", ...style }}>
      <div
        style={{
          ...base,
          top: -1,
          left: -1,
          borderTop: "2px solid",
          borderLeft: "2px solid",
          borderColor: color,
        }}
      />
      <div
        style={{
          ...base,
          top: -1,
          right: -1,
          borderTop: "2px solid",
          borderRight: "2px solid",
          borderColor: color,
        }}
      />
      <div
        style={{
          ...base,
          bottom: -1,
          left: -1,
          borderBottom: "2px solid",
          borderLeft: "2px solid",
          borderColor: color,
        }}
      />
      <div
        style={{
          ...base,
          bottom: -1,
          right: -1,
          borderBottom: "2px solid",
          borderRight: "2px solid",
          borderColor: color,
        }}
      />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- low-poly landscape

function makeHillMound(x, z, rx, ry, color) {
  const geo = new THREE.SphereGeometry(1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.95,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(rx, ry, rx);
  mesh.position.set(x, 0, z);
  return mesh;
}

function makeTree(x, z, scale, foliageColor) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.07, 0.4, 6),
    new THREE.MeshStandardMaterial({
      color: "#6b4a3a",
      flatShading: true,
      roughness: 0.9,
    }),
  );
  trunk.position.y = 0.2;
  g.add(trunk);
  const foliage = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.32, 0),
    new THREE.MeshStandardMaterial({
      color: foliageColor,
      flatShading: true,
      roughness: 0.85,
    }),
  );
  foliage.position.y = 0.55;
  g.add(foliage);
  g.position.set(x, 0, z);
  g.scale.setScalar(scale);
  return g;
}

function makeRock(x, z, scale, color) {
  const geo = new THREE.ConeGeometry(1, 1.7, 5);
  const mat = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.95,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, 0.3, z);
  mesh.rotation.y = Math.random() * Math.PI;
  mesh.scale.setScalar(scale);
  return mesh;
}

function buildFigure(accentColor) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: "#463a34",
    roughness: 0.85,
    flatShading: true,
  });
  const headMat = new THREE.MeshStandardMaterial({
    color: "#574539",
    roughness: 0.8,
    flatShading: true,
  });

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), bodyMat);
  legL.position.set(-0.11, 0.25, 0);
  const legR = legL.clone();
  legR.position.x = 0.11;
  g.add(legL, legR);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.22), bodyMat);
  torso.position.y = 0.75;
  g.add(torso);

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.46, 0.14), bodyMat);
  armL.position.set(-0.26, 0.69, 0);
  g.add(armL);

  const armPivot = new THREE.Group();
  armPivot.position.set(0.26, 0.92, 0);
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.46, 0.14), bodyMat);
  armR.position.y = -0.23;
  armPivot.add(armR);
  g.add(armPivot);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), headMat);
  head.position.y = 1.18;
  g.add(head);

  if (accentColor) {
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.06, 0.06),
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.5,
      }),
    );
    visor.position.set(0, 1.2, 0.19);
    g.add(visor);

    const gun = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.34),
      bodyMat,
    );
    gun.position.set(0, -0.42, 0.2);
    armPivot.add(gun);
  }

  return { group: g, armPivot };
}

function disposeScene(scene) {
  scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else o.material.dispose();
    }
  });
}

function LowPolyLandscape() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const getSize = () => ({
      w: mount.clientWidth || 800,
      h: mount.clientHeight || 640,
    });
    let { w, h } = getSize();

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#f0bd8e", 5, 15);

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 40);
    camera.position.set(0, 1.7, 5.2);
    camera.lookAt(0, 0.9, -3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight("#fff2e0", 0.8));
    const sun = new THREE.DirectionalLight("#ffe8c2", 0.95);
    sun.position.set(-4, 6, 3);
    scene.add(sun);
    const fill = new THREE.DirectionalLight("#c9b8e0", 0.3);
    fill.position.set(4, 3, -3);
    scene.add(fill);

    const world = new THREE.Group();
    scene.add(world);

    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshStandardMaterial({
        color: "#a8c968",
        flatShading: true,
        roughness: 1,
      }),
    );
    field.rotation.x = -Math.PI / 2;
    field.position.y = -0.03;
    world.add(field);

    const pathGeo = new THREE.BufferGeometry();
    pathGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [-0.55, 0.005, 3, 0.55, 0.005, 3, 0, 0.005, -6.5],
        3,
      ),
    );
    pathGeo.setIndex([0, 1, 2]);
    pathGeo.computeVertexNormals();
    const path = new THREE.Mesh(
      pathGeo,
      new THREE.MeshStandardMaterial({
        color: "#e8d9b8",
        flatShading: true,
        roughness: 1,
      }),
    );
    world.add(path);

    world.add(makeHillMound(-2.2, 0.0, 2.2, 1.1, "#a8c968"));
    world.add(makeHillMound(2.6, 0.2, 2.0, 0.9, "#9fc45f"));
    world.add(makeHillMound(0.2, -3.2, 3.4, 1.7, "#8fae6a"));
    world.add(makeHillMound(-1.2, -5.5, 5.2, 2.1, "#8f9bc4"));
    world.add(makeHillMound(1.8, -8.5, 6, 2.5, "#a3aed6"));

    world.add(makeTree(-2.7, -0.1, 1, "#e0975a"));
    world.add(makeTree(-1.7, 0.4, 0.8, "#d4a63f"));
    world.add(makeTree(2.3, 0.7, 0.7, "#e0975a"));

    world.add(makeRock(3.1, -3, 1.7, "#b8a8c4"));
    world.add(makeRock(3.9, -3.5, 1.1, "#a897b3"));

    // ---- shootout vignette: the two figures stand side by side, clearly in view ----
    const FIGURE_SCALE = 0.9;
    const seeker = buildFigure(ACCENT);
    seeker.group.position.set(0.55, 0, 1.3);
    seeker.group.rotation.y = -0.5;
    seeker.group.scale.setScalar(FIGURE_SCALE);
    world.add(seeker.group);

    const hider = buildFigure(null);
    hider.group.position.set(-0.55, 0, 1.3);
    hider.group.rotation.y = 0.5;
    hider.group.scale.setScalar(FIGURE_SCALE);
    world.add(hider.group);

    const particles = [];
    const flashes = [];

    function spawnBurst(position) {
      for (let i = 0; i < 10; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: i % 3 === 0 ? ACCENT : "#463a34",
          roughness: 0.7,
          transparent: true,
          opacity: 1,
          flatShading: true,
        });
        const s = 0.07 + Math.random() * 0.06;
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
        mesh.position.copy(position);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.5;
        const v = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta),
        ).multiplyScalar(0.9 + Math.random() * 0.9);
        v.y += 0.95;
        mesh.userData = {
          velocity: v,
          life: 0,
          maxLife: 0.6 + Math.random() * 0.3,
        };
        scene.add(mesh);
        particles.push(mesh);
      }
    }

    function spawnFlash(position, color) {
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), mat);
      mesh.position.copy(position);
      scene.add(mesh);
      flashes.push({ mesh, mat, life: 0, maxLife: 0.16 });
    }

    const LOOP = 4.0,
      FIRE_T = 0.9,
      RESPAWN_T = 2.6;
    let lastPhase = 0;
    let recoil = 0;
    let respawnStart = -10;

    const ro = new ResizeObserver(() => {
      const size = getSize();
      if (size.w === w && size.h === h) return;
      w = size.w;
      h = size.h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    let raf;
    const clock = new THREE.Clock();
    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      const phase = t % LOOP;

      world.rotation.y = Math.sin(t * 0.05) * 0.03;

      if (lastPhase < FIRE_T && phase >= FIRE_T) {
        recoil = 1;
        const muzzlePos = new THREE.Vector3();
        seeker.armPivot.getWorldPosition(muzzlePos);
        spawnFlash(muzzlePos, "#fff7c2");
        const hiderHeadPos = hider.group.position
          .clone()
          .add(new THREE.Vector3(0, 1.18 * FIGURE_SCALE, 0));
        spawnBurst(hiderHeadPos);
        hider.group.visible = false;
      }
      if (lastPhase < RESPAWN_T && phase >= RESPAWN_T) {
        hider.group.visible = true;
        respawnStart = t;
      }
      lastPhase = phase;

      if (recoil > 0) {
        recoil = Math.max(0, recoil - dt * 5);
        seeker.armPivot.rotation.x = -recoil * 0.6;
      }

      if (hider.group.visible) {
        const p = Math.min(1, Math.max(0, (t - respawnStart) / 0.3));
        hider.group.scale.setScalar(FIGURE_SCALE * (0.3 + 0.7 * p));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const u = p.userData;
        u.life += dt;
        u.velocity.y -= 2.1 * dt;
        p.position.addScaledVector(u.velocity, dt);
        const lp = u.life / u.maxLife;
        p.material.opacity = Math.max(0, 1 - lp);
        p.scale.setScalar(Math.max(0.001, 1 - lp * 0.4));
        if (lp >= 1) {
          scene.remove(p);
          p.geometry.dispose();
          p.material.dispose();
          particles.splice(i, 1);
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life += dt;
        const lp = f.life / f.maxLife;
        f.mesh.scale.setScalar(0.5 + lp * 2.4);
        f.mat.opacity = Math.max(0, 1 - lp);
        if (lp >= 1) {
          scene.remove(f.mesh);
          f.mesh.geometry.dispose();
          f.mesh.material.dispose();
          flashes.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      disposeScene(scene);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />;
}

function SceneBackground({ dim }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 74%, rgba(255,238,205,0.9) 0%, rgba(255,205,155,0.35) 16%, transparent 45%), " +
            "linear-gradient(180deg, #7c6fa8 0%, #c98fae 45%, #f2b880 75%, #f7cfa0 100%)",
        }}
      />
      <LowPolyLandscape />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, transparent 0%, transparent 45%, rgba(24,14,18,0.55) 78%, rgba(20,11,15,0.86) 100%)",
        }}
      />
      {dim && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15,9,13,0.6)",
          }}
        />
      )}
    </div>
  );
}

function SplashScreen({ onPlay }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        textAlign: "center",
        padding: "24px 24px 40px",
      }}
    >
      <div
        className="hs-tech hs-fade"
        style={{
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "#f2e3d1",
          textTransform: "uppercase",
          border: "1px solid rgba(242,184,128,0.5)",
          padding: "5px 14px",
          borderRadius: 3,
          marginBottom: 18,
        }}
      >
        <Users size={11} style={{ verticalAlign: -1, marginRight: 6 }} />
        MAX 8 · LIVE MULTIPLAYER
      </div>

      <h1
        className="hs-display hs-fade"
        style={{
          margin: 0,
          lineHeight: 0.9,
          fontSize: "clamp(44px, 9vw, 78px)",
          color: "#fbf3ea",
          letterSpacing: "0.02em",
          textShadow: "0 2px 24px rgba(0,0,0,0.35)",
          animationDelay: "0.1s",
        }}
      >
        HIDER <span style={{ color: ACCENT }}>SEEKER</span>
      </h1>

      <p
        className="hs-kr hs-fade"
        style={{
          color: "#e3d2c2",
          fontSize: 14,
          marginTop: 12,
          marginBottom: 28,
          fontWeight: 500,
          letterSpacing: "0.02em",
          animationDelay: "0.2s",
        }}
      >
        해질녘, 숨을 곳을 찾아라.
      </p>

      <button
        onClick={onPlay}
        className="hs-tech hs-cta-outline hs-fade"
        style={{
          background: "transparent",
          color: ACCENT,
          border: `1.5px solid ${ACCENT}`,
          borderRadius: 4,
          padding: "13px 36px",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.08em",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 9,
          textTransform: "uppercase",
          transition: "background 0.15s, color 0.15s",
          animationDelay: "0.3s",
        }}
      >
        <Play size={15} /> 플레이 시작
      </button>
    </div>
  );
}

function PlayerCard({ player }) {
  if (!player) {
    return (
      <BracketFrame
        color="rgba(255,255,255,0.28)"
        size={9}
        style={{ padding: "10px 12px" }}
      >
        <div
          className="hs-tech"
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.45)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              background: "rgba(0,0,0,0.25)",
              transform: "rotate(45deg)",
              flexShrink: 0,
            }}
          />
          EMPTY
        </div>
      </BracketFrame>
    );
  }
  return (
    <div
      style={{
        background: player.isYou
          ? "rgba(242,184,128,0.12)"
          : "rgba(20,12,16,0.55)",
        border: player.isYou
          ? `1px solid ${ACCENT}`
          : "1px solid rgba(255,255,255,0.14)",
        borderRadius: 3,
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          background: player.color,
          transform: "rotate(45deg)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="hs-tech"
          style={{
            transform: "rotate(-45deg)",
            fontSize: 11,
            fontWeight: 700,
            color: "#2b1a0d",
          }}
        >
          {player.name.slice(0, 1)}
        </span>
      </div>
      <span
        className="hs-kr"
        style={{ fontSize: 13, color: "#fbf3ea", fontWeight: 500, flex: 1 }}
      >
        {player.name}
      </span>
      <span
        className="hs-tech"
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: player.ready ? ACCENT : "rgba(255,255,255,0.5)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: player.ready ? ACCENT : "rgba(255,255,255,0.35)",
          }}
        />
        {player.ready ? "READY" : "WAITING"}
      </span>
    </div>
  );
}

function LobbyScreen({ onBack }) {
  const [players, setPlayers] = useState(REAL_PLAYERS);
  const [copied, setCopied] = useState(false);

  const you = players.find((p) => p.isYou);
  const allReady = players.length >= 2 && players.every((p) => p.ready);
  const slots = [
    ...players,
    ...Array(Math.max(0, MAX_PLAYERS - players.length)).fill(null),
  ];

  const toggleReady = () =>
    setPlayers((prev) =>
      prev.map((p) => (p.isYou ? { ...p, ready: !p.ready } : p)),
    );
  const copyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(ROOM_CODE)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        })
        .catch(() => {});
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <button
          onClick={onBack}
          className="hs-tech"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#f2e3d1",
            borderRadius: 3,
            padding: "7px 12px",
            fontSize: 11,
            letterSpacing: "0.06em",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          <ArrowLeft size={13} /> EXIT
        </button>
        <div
          className="hs-tech"
          style={{ fontSize: 11, letterSpacing: "0.14em", color: "#e3d2c2" }}
        >
          LOBBY · {players.length}/{MAX_PLAYERS}
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div
          className="hs-tech"
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "#e3d2c2",
            marginBottom: 8,
          }}
        >
          ROOM CODE
        </div>
        <BracketFrame
          color={ACCENT}
          size={11}
          style={{ display: "inline-block" }}
        >
          <button
            onClick={copyCode}
            className="hs-mono"
            style={{
              background: "rgba(242,184,128,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: ACCENT,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.1em",
              padding: "10px 24px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {ROOM_CODE}
            {copied ? <Check size={16} /> : <Copy size={14} />}
          </button>
        </BracketFrame>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          alignContent: "start",
        }}
      >
        {slots.map((p, i) => (
          <PlayerCard key={p ? p.id : `empty-${i}`} player={p} />
        ))}
      </div>

      <div
        className="hs-kr"
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "#e3d2c2",
          margin: "16px 0",
        }}
      >
        역할은 게임 시작 시 무작위로 배정됩니다.
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={toggleReady}
          className="hs-tech"
          style={{
            flex: 1,
            padding: "13px 0",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            border: you?.ready
              ? `1.5px solid ${ACCENT}`
              : "1.5px solid rgba(255,255,255,0.25)",
            background: you?.ready
              ? "rgba(242,184,128,0.14)"
              : "rgba(0,0,0,0.2)",
            color: you?.ready ? ACCENT : "#f2e3d1",
          }}
        >
          {you?.ready ? "CANCEL READY" : "READY UP"}
        </button>
        <button
          disabled={!allReady}
          className="hs-tech"
          style={{
            flex: 1,
            padding: "13px 0",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: "none",
            cursor: allReady ? "pointer" : "not-allowed",
            background: allReady ? ACCENT : "rgba(0,0,0,0.3)",
            color: allReady ? "#2b1a0d" : "rgba(255,255,255,0.35)",
          }}
        >
          START GAME
        </button>
      </div>
    </div>
  );
}

export default function HiderSeekerScreens() {
  const [view, setView] = useState("splash");
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: 640,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #2a2028",
      }}
    >
      <GlobalStyle />
      <SceneBackground dim={view === "lobby"} />
      {view === "splash" ? (
        <SplashScreen onPlay={() => setView("lobby")} />
      ) : (
        <LobbyScreen onBack={() => setView("splash")} />
      )}
    </div>
  );
}
