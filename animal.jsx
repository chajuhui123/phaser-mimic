import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RefreshCw, Shuffle, Play, Pause } from "lucide-react";

const CREATURES = [
  {
    id: "rabbit",
    label: "토끼",
    note: "네모 블록으로 만든 토끼 · 원을 그리며 뛰어다녀요",
    palette: ["#ffffff", "#d7a86e", "#9e9e9e", "#f7b2bd", "#3d3d3d", "#f5f0e6"],
  },
  {
    id: "cat",
    label: "고양이",
    note: "몸을 낮추고 살금살금 기어다녀요",
    palette: ["#4a4a4a", "#e8935a", "#f5f0e6", "#3d3d3d", "#9e9e9e", "#d9a13f"],
  },
  {
    id: "frog",
    label: "개구리",
    note: "크게 웅크렸다가 높이 폴짝 뛰어요",
    palette: ["#7cb85c", "#5a9b4a", "#8fbf6a", "#4a8a3a", "#a3cc7a", "#6fae52"],
  },
];

function setMatColor(mat, color) {
  mat.color.set(color);
}

function disposeGroup(group) {
  group.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
  });
}

function makeLeg(parent, mat, x, z, w, h, d) {
  const pivot = new THREE.Group();
  pivot.position.set(x, h, z);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.y = -h / 2;
  mesh.castShadow = true;
  pivot.add(mesh);
  parent.add(pivot);
  return pivot;
}

// ---------------------------------------------------------------- builders

function buildRabbit(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const innerEarMat = new THREE.MeshStandardMaterial({
    color: "#ffb6c1",
    roughness: 0.6,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: "#20202a",
    roughness: 0.4,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.72), mat);
  body.position.y = 0.32;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.34), mat);
  head.position.set(0, 0.5, 0.42);
  head.castShadow = true;
  group.add(head);

  function makeEar(x) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.66, 0.36);
    const outer = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.07), mat);
    outer.position.y = 0.2;
    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.3, 0.03),
      innerEarMat,
    );
    inner.position.set(0, 0.2, 0.02);
    pivot.add(outer, inner);
    group.add(pivot);
    return pivot;
  }
  const earL = makeEar(-0.11);
  const earR = makeEar(0.11);

  const eyeGeo = new THREE.BoxGeometry(0.05, 0.06, 0.02);
  const eyeL = new THREE.Mesh(eyeGeo, darkMat);
  eyeL.position.set(-0.11, 0.52, 0.59);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.11;
  group.add(eyeL, eyeR);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.14), mat);
  tail.position.set(0, 0.38, -0.4);
  group.add(tail);

  const legFL = makeLeg(group, mat, -0.16, 0.28, 0.11, 0.2, 0.11);
  const legFR = makeLeg(group, mat, 0.16, 0.28, 0.11, 0.2, 0.11);
  const legBL = makeLeg(group, mat, -0.18, -0.2, 0.15, 0.24, 0.15);
  const legBR = makeLeg(group, mat, 0.18, -0.2, 0.15, 0.24, 0.15);

  function update(t, moving) {
    if (moving) {
      const R = 1.05,
        SPD = 0.9;
      const angle = t * SPD;
      group.position.x = Math.cos(angle) * R;
      group.position.z = Math.sin(angle) * R;
      group.rotation.y = -angle + Math.PI / 2;
      const hop = Math.abs(Math.sin(t * 8));
      group.position.y = hop * 0.22;
      earL.rotation.x = -hop * 0.5;
      earR.rotation.x = -hop * 0.5;
      legBL.rotation.x = -hop * 0.7;
      legBR.rotation.x = -hop * 0.7;
      legFL.rotation.x = hop * 0.5;
      legFR.rotation.x = hop * 0.5;
      body.scale.y = 1 - hop * 0.1;
    } else {
      earL.rotation.x += (0 - earL.rotation.x) * 0.1;
      earR.rotation.x += (0 - earR.rotation.x) * 0.1;
      [legFL, legFR, legBL, legBR].forEach((p) => {
        p.rotation.x += (0 - p.rotation.x) * 0.1;
      });
      body.scale.y += (1 - body.scale.y) * 0.1;
      body.scale.x = 1 + Math.sin(t * 1.6) * 0.01;
    }
  }

  return { group, primaryMat: mat, update, focusY: 0.55 };
}

function buildCat(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.65 });
  const darkMat = new THREE.MeshStandardMaterial({
    color: "#20202a",
    roughness: 0.4,
  });
  const pinkMat = new THREE.MeshStandardMaterial({
    color: "#ffb6c1",
    roughness: 0.6,
  });

  const bodyPivot = new THREE.Group();
  bodyPivot.position.y = 0.26;
  group.add(bodyPivot);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.68), mat);
  body.castShadow = true;
  bodyPivot.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.28), mat);
  head.position.set(0, 0.06, 0.42);
  bodyPivot.add(head);

  function makeEar(x) {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.03), mat);
    ear.position.set(x, 0.24, 0.36);
    ear.rotation.z = x < 0 ? 0.2 : -0.2;
    bodyPivot.add(ear);
  }
  makeEar(-0.1);
  makeEar(0.1);

  const eyeGeo = new THREE.BoxGeometry(0.045, 0.05, 0.02);
  const eyeL = new THREE.Mesh(eyeGeo, darkMat);
  eyeL.position.set(-0.09, 0.08, 0.56);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.09;
  bodyPivot.add(eyeL, eyeR);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.02), pinkMat);
  nose.position.set(0, 0, 0.57);
  bodyPivot.add(nose);

  const legFL = makeLeg(group, mat, -0.12, 0.24, 0.1, 0.26, 0.1);
  const legFR = makeLeg(group, mat, 0.12, 0.24, 0.1, 0.26, 0.1);
  const legBL = makeLeg(group, mat, -0.12, -0.22, 0.11, 0.26, 0.11);
  const legBR = makeLeg(group, mat, 0.12, -0.22, 0.11, 0.26, 0.11);

  const tailPivot1 = new THREE.Group();
  tailPivot1.position.set(0, 0.3, -0.34);
  const tailSeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.22), mat);
  tailSeg1.position.z = -0.11;
  tailPivot1.add(tailSeg1);
  bodyPivot.add(tailPivot1);

  const tailPivot2 = new THREE.Group();
  tailPivot2.position.set(0, 0, -0.22);
  const tailSeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.2), mat);
  tailSeg2.position.z = -0.1;
  tailPivot2.add(tailSeg2);
  tailPivot1.add(tailPivot2);

  function update(t, moving) {
    if (moving) {
      const R = 0.75,
        SPD = 0.4;
      const angle = t * SPD;
      group.position.x = Math.cos(angle) * R;
      group.position.z = Math.sin(angle) * R;
      group.rotation.y = -angle + Math.PI / 2;
      const gait = t * 7;
      legFL.rotation.x = Math.sin(gait) * 0.45;
      legBR.rotation.x = Math.sin(gait) * 0.45;
      legFR.rotation.x = Math.sin(gait + Math.PI) * 0.45;
      legBL.rotation.x = Math.sin(gait + Math.PI) * 0.45;
      bodyPivot.rotation.x = -0.12;
      bodyPivot.position.y = 0.22 + Math.abs(Math.sin(gait * 2)) * 0.01;
      tailPivot1.rotation.y = Math.sin(t * 2) * 0.35;
      tailPivot2.rotation.y = Math.sin(t * 2 + 0.6) * 0.4;
    } else {
      bodyPivot.rotation.x += (0 - bodyPivot.rotation.x) * 0.1;
      bodyPivot.position.y += (0.26 - bodyPivot.position.y) * 0.1;
      [legFL, legFR, legBL, legBR].forEach((p) => {
        p.rotation.x += (0 - p.rotation.x) * 0.1;
      });
      tailPivot1.rotation.y = Math.sin(t * 1) * 0.15;
      tailPivot2.rotation.y = Math.sin(t * 1 + 0.6) * 0.2;
    }
  }

  return { group, primaryMat: mat, update, focusY: 0.4 };
}

function buildFrog(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({
    color: "#20202a",
    roughness: 0.4,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: "#e8e0c0",
    roughness: 0.7,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.26, 0.56), mat);
  body.position.y = 0.22;
  body.castShadow = true;
  group.add(body);

  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.4), bellyMat);
  belly.position.set(0, 0.09, 0.02);
  group.add(belly);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.24), mat);
  head.position.set(0, 0.28, 0.34);
  group.add(head);

  function makeEye(x) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), mat);
    eye.position.set(x, 0.4, 0.34);
    group.add(eye);
    const pupil = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.02),
      darkMat,
    );
    pupil.position.set(x, 0.4, 0.4);
    group.add(pupil);
  }
  makeEye(-0.14);
  makeEye(0.14);

  const legFL = makeLeg(group, mat, -0.22, 0.2, 0.1, 0.16, 0.1);
  const legFR = makeLeg(group, mat, 0.22, 0.2, 0.1, 0.16, 0.1);
  const legBL = makeLeg(group, mat, -0.26, -0.18, 0.16, 0.24, 0.16);
  const legBR = makeLeg(group, mat, 0.26, -0.18, 0.16, 0.24, 0.16);

  const CYCLE = 1.4,
    STEP = 0.55,
    R = 0.9;

  function update(t, moving) {
    if (!moving) {
      body.scale.set(1, 1, 1);
      [legFL, legFR, legBL, legBR].forEach((p) => {
        p.rotation.x += (0 - p.rotation.x) * 0.1;
      });
      return;
    }
    const n = Math.floor(t / CYCLE);
    const localP = (t - n * CYCLE) / CYCLE;
    const angleStart = n * STEP;
    const angleEnd = (n + 1) * STEP;
    let angle = angleStart,
      height = 0,
      squashY = 1,
      squashXZ = 1,
      legExtend = 0;

    if (localP < 0.15) {
      const p = localP / 0.15;
      squashY = 1 - 0.35 * p;
      squashXZ = 1 + 0.2 * p;
    } else if (localP < 0.7) {
      const p = (localP - 0.15) / 0.55;
      angle = angleStart + (angleEnd - angleStart) * p;
      height = Math.sin(p * Math.PI) * 1.15;
      squashY = 1 + 0.15 * Math.sin(p * Math.PI);
      squashXZ = 1 - 0.08 * Math.sin(p * Math.PI);
      legExtend = Math.sin(p * Math.PI);
    } else if (localP < 0.85) {
      angle = angleEnd;
      const p = (localP - 0.7) / 0.15;
      squashY = 0.65 + 0.35 * p;
      squashXZ = 1.2 - 0.2 * p;
    } else {
      angle = angleEnd;
    }

    group.position.x = Math.cos(angle) * R;
    group.position.z = Math.sin(angle) * R;
    group.position.y = height;
    group.rotation.y = -angle + Math.PI / 2 - STEP / 2;
    body.scale.set(squashXZ, squashY, squashXZ);
    legBL.rotation.x = -legExtend * 0.9;
    legBR.rotation.x = -legExtend * 0.9;
    legFL.rotation.x = legExtend * 0.3;
    legFR.rotation.x = legExtend * 0.3;
  }

  return { group, primaryMat: mat, update, focusY: 0.5 };
}

const BUILDERS = { rabbit: buildRabbit, cat: buildCat, frog: buildFrog };

// ---------------------------------------------------------------- component

export default function BlockyAnimalViewer() {
  const mountRef = useRef(null);
  const engineRef = useRef({});
  const creatureObjRef = useRef(null);
  const uiStateRef = useRef({ autoRotate: true, moving: true });

  const [creatureId, setCreatureId] = useState("rabbit");
  const [colors, setColors] = useState(() =>
    Object.fromEntries(CREATURES.map((c) => [c.id, c.palette[0]])),
  );
  const [autoRotate, setAutoRotate] = useState(true);
  const [moving, setMoving] = useState(true);

  const currentCreature = CREATURES.find((c) => c.id === creatureId);

  useEffect(() => {
    const mount = mountRef.current;
    const getSize = () => ({
      w: mount.clientWidth || 600,
      h: mount.clientHeight || 480,
    });
    let { w, h } = getSize();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#12141a");
    scene.fog = new THREE.Fog("#12141a", 6, 16);

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(2.6, 2.0, 3.4);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "grab";

    scene.add(new THREE.AmbientLight("#ffffff", 0.55));
    const key = new THREE.DirectionalLight("#ffffff", 1.15);
    key.position.set(4, 6, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#5ec8f0", 0.35);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const grid = new THREE.GridHelper(20, 20, "#2a2d3a", "#1c1e27");
    scene.add(grid);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: "#171922", roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.005;
    scene.add(ground);

    let dragging = false;
    let lastX = 0;
    let manualYaw = 0;
    const onDown = (e) => {
      dragging = true;
      lastX = e.clientX ?? 0;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = e.clientX ?? lastX;
      manualYaw += (x - lastX) * 0.008;
      lastX = x;
    };
    const onUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

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
      const t = clock.getElapsedTime();
      const ui = uiStateRef.current;
      if (ui.autoRotate && !dragging) manualYaw += 0.005;
      const cur = creatureObjRef.current;
      if (cur) {
        cur.group.parent.rotation.y = manualYaw;
        cur.update(t, ui.moving);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    const orbitRig = new THREE.Group();
    scene.add(orbitRig);
    engineRef.current = { scene, camera, renderer, orbitRig };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (creatureObjRef.current) disposeGroup(creatureObjRef.current.group);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine.scene) return;
    if (creatureObjRef.current) {
      engine.orbitRig.remove(creatureObjRef.current.group);
      disposeGroup(creatureObjRef.current.group);
    }
    const build = BUILDERS[creatureId];
    const obj = build(colors[creatureId]);
    engine.orbitRig.add(obj.group);
    creatureObjRef.current = obj;
    engine.camera.lookAt(0, obj.focusY ?? 0.5, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatureId]);

  useEffect(() => {
    if (creatureObjRef.current)
      setMatColor(creatureObjRef.current.primaryMat, colors[creatureId]);
  }, [colors, creatureId]);

  useEffect(() => {
    uiStateRef.current.autoRotate = autoRotate;
    uiStateRef.current.moving = moving;
  }, [autoRotate, moving]);

  const setColor = (c) => setColors((prev) => ({ ...prev, [creatureId]: c }));
  const shuffle = () =>
    setColor(
      currentCreature.palette[
        Math.floor(Math.random() * currentCreature.palette.length)
      ],
    );
  const reset = () => setColor(currentCreature.palette[0]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        minHeight: 560,
        background: "#0c0d12",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid #21232d",
        fontFamily:
          "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      }}
    >
      <div
        style={{
          flex: "1 1 340px",
          minWidth: 280,
          minHeight: 420,
          position: "relative",
        }}
      >
        <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {CREATURES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCreatureId(c.id)}
              style={{
                fontSize: 11,
                padding: "6px 12px",
                borderRadius: 20,
                border:
                  creatureId === c.id
                    ? "1px solid #5ec8f0"
                    : "1px solid rgba(255,255,255,0.12)",
                background:
                  creatureId === c.id
                    ? "rgba(94,200,240,0.16)"
                    : "rgba(20,22,30,0.6)",
                color: creatureId === c.id ? "#5ec8f0" : "#c7cad6",
                cursor: "pointer",
                fontFamily: "inherit",
                backdropFilter: "blur(4px)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: "0 0 220px",
          minWidth: 200,
          background: "#14161f",
          padding: "18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          borderLeft: "1px solid #21232d",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "#5ec8f0",
              marginBottom: 2,
            }}
          >
            VOXEL PACK · BLOCK STYLE
          </div>
          <div style={{ fontSize: 13, color: "#e8e9ee", fontWeight: 600 }}>
            {currentCreature.label}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 10,
              color: "#8b8fa3",
              marginBottom: 6,
              letterSpacing: "0.04em",
            }}
          >
            COLOR
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {currentCreature.palette.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                title={c}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: c,
                  border:
                    colors[creatureId] === c
                      ? "2px solid #5ec8f0"
                      : "1px solid rgba(255,255,255,0.15)",
                  cursor: "pointer",
                  padding: 0,
                  boxShadow:
                    colors[creatureId] === c
                      ? "0 0 0 2px rgba(94,200,240,0.25)"
                      : "none",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <ToggleButton
            active={autoRotate}
            onClick={() => setAutoRotate((v) => !v)}
          >
            Rotate
          </ToggleButton>
          <IconButton
            onClick={() => setMoving((v) => !v)}
            title={moving ? "Pause" : "Move"}
          >
            {moving ? <Pause size={14} /> : <Play size={14} />}
          </IconButton>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <IconButton onClick={shuffle} title="Shuffle color">
            <Shuffle size={14} /> Shuffle
          </IconButton>
          <IconButton onClick={reset} title="Reset color">
            <RefreshCw size={14} />
          </IconButton>
        </div>

        <div
          style={{
            fontSize: 10,
            color: "#565a6b",
            lineHeight: 1.5,
            marginTop: "auto",
          }}
        >
          {currentCreature.note}
          <br />
          드래그로 회전 · 탭으로 캐릭터 전환
        </div>
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        fontSize: 11,
        padding: "7px 10px",
        borderRadius: 8,
        border: active ? "1px solid #5ec8f0" : "1px solid #2a2d3a",
        background: active ? "rgba(94,200,240,0.12)" : "transparent",
        color: active ? "#5ec8f0" : "#9a9eb0",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function IconButton({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        flex: 1,
        fontSize: 11,
        padding: "7px 10px",
        borderRadius: 8,
        border: "1px solid #2a2d3a",
        background: "transparent",
        color: "#9a9eb0",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}
