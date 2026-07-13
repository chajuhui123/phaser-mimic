import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RefreshCw, Shuffle, Play, Pause } from "lucide-react";

const PALETTE = {
  skin: ["#f2c9a1", "#e0ac69", "#a5694f", "#c68642", "#8d5524", "#ffdbac"],
  shirt: ["#2b6fd1", "#e0483e", "#3ea35b", "#f2b134", "#7b4fd1", "#1a1c24"],
  pants: ["#3a3a3a", "#5b4636", "#2c3e50", "#4a4a68", "#1f1f1f", "#6b6b6b"],
};

function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function RobloxCharacterViewer() {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const [skinColor, setSkinColor] = useState(PALETTE.skin[0]);
  const [shirtColor, setShirtColor] = useState(PALETTE.shirt[0]);
  const [pantsColor, setPantsColor] = useState(PALETTE.pants[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [walking, setWalking] = useState(true);

  // ---- one-time scene setup ----
  useEffect(() => {
    const mount = mountRef.current;
    const getSize = () => ({
      w: mount.clientWidth || 600,
      h: mount.clientHeight || 480,
    });
    let { w, h } = getSize();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#12141a");
    scene.fog = new THREE.Fog("#12141a", 7, 18);

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(3.1, 2.15, 4.1);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "grab";

    // lights
    scene.add(new THREE.AmbientLight("#ffffff", 0.55));
    const key = new THREE.DirectionalLight("#ffffff", 1.15);
    key.position.set(4, 6, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 20;
    scene.add(key);
    const rim = new THREE.DirectionalLight("#5ec8f0", 0.35);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    // ground
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

    // ---- materials (updated live via refs) ----
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.75,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.65,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: pantsColor,
      roughness: 0.65,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: "#17181d",
      roughness: 0.4,
    });

    // ---- character build (Roblox R6-style block rig) ----
    const character = new THREE.Group();

    const LEG_H = 1.2,
      LEG_W = 0.4,
      LEG_D = 0.4;
    const TORSO_W = 1.0,
      TORSO_H = 1.2,
      TORSO_D = 0.5;
    const ARM_H = 1.2,
      ARM_W = 0.4,
      ARM_D = 0.4;
    const HEAD = 0.9;

    const hipY = LEG_H;
    const torsoCenterY = hipY + TORSO_H / 2;
    const shoulderY = torsoCenterY + TORSO_H / 2 - 0.04;
    const headCenterY = torsoCenterY + TORSO_H / 2 + HEAD / 2;

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(TORSO_W, TORSO_H, TORSO_D),
      shirtMat,
    );
    torso.position.y = torsoCenterY;
    torso.castShadow = true;
    character.add(torso);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(HEAD, HEAD, HEAD),
      skinMat,
    );
    head.position.y = headCenterY;
    head.castShadow = true;
    character.add(head);

    const eyeGeo = new THREE.BoxGeometry(0.09, 0.13, 0.02);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.19, headCenterY + 0.04, HEAD / 2 + 0.006);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.19;
    character.add(eyeL, eyeR);

    function makeLimb(mat, x, pivotY, len, w, d) {
      const pivot = new THREE.Group();
      pivot.position.set(x, pivotY, 0);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, len, d), mat);
      mesh.position.y = -len / 2;
      mesh.castShadow = true;
      pivot.add(mesh);
      character.add(pivot);
      return pivot;
    }

    const armL = makeLimb(
      skinMat,
      -(TORSO_W / 2 + ARM_W / 2),
      shoulderY,
      ARM_H,
      ARM_W,
      ARM_D,
    );
    const armR = makeLimb(
      skinMat,
      TORSO_W / 2 + ARM_W / 2,
      shoulderY,
      ARM_H,
      ARM_W,
      ARM_D,
    );
    const legL = makeLimb(pantsMat, -0.3, hipY, LEG_H, LEG_W, LEG_D);
    const legR = makeLimb(pantsMat, 0.3, hipY, LEG_H, LEG_W, LEG_D);

    scene.add(character);

    // ---- drag to rotate ----
    let dragging = false;
    let lastX = 0;
    let manualYaw = 0;
    const onDown = (e) => {
      dragging = true;
      lastX = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = e.clientX ?? (e.touches && e.touches[0].clientX) ?? lastX;
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

    // ---- resize handling ----
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

    // ---- animation loop ----
    let raf;
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      const s = stateRef.current;

      if (s.autoRotate && !dragging) manualYaw += 0.006;
      character.rotation.y = manualYaw;

      if (s.walking) {
        const swing = Math.sin(t * 5) * 0.6;
        armL.rotation.x = swing;
        armR.rotation.x = -swing;
        legL.rotation.x = -swing;
        legR.rotation.x = swing;
        character.position.y = Math.abs(Math.sin(t * 10)) * 0.02;
      } else {
        armL.rotation.x += (0 - armL.rotation.x) * 0.1;
        armR.rotation.x += (0 - armR.rotation.x) * 0.1;
        legL.rotation.x += (0 - legL.rotation.x) * 0.1;
        legR.rotation.x += (0 - legR.rotation.x) * 0.1;
        character.position.y += (0 - character.position.y) * 0.1;
        head.position.y = headCenterY + Math.sin(t * 1.4) * 0.015;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    stateRef.current = { autoRotate, walking, skinMat, shirtMat, pantsMat };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the running loop aware of latest toggle state
  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
    stateRef.current.walking = walking;
  }, [autoRotate, walking]);

  // live color updates
  useEffect(() => {
    if (stateRef.current.skinMat) stateRef.current.skinMat.color.set(skinColor);
  }, [skinColor]);
  useEffect(() => {
    if (stateRef.current.shirtMat)
      stateRef.current.shirtMat.color.set(shirtColor);
  }, [shirtColor]);
  useEffect(() => {
    if (stateRef.current.pantsMat)
      stateRef.current.pantsMat.color.set(pantsColor);
  }, [pantsColor]);

  const shuffle = () => {
    setSkinColor(randomOf(PALETTE.skin));
    setShirtColor(randomOf(PALETTE.shirt));
    setPantsColor(randomOf(PALETTE.pants));
  };

  const reset = () => {
    setSkinColor(PALETTE.skin[0]);
    setShirtColor(PALETTE.shirt[0]);
    setPantsColor(PALETTE.pants[0]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        minHeight: 520,
        background: "#0c0d12",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid #21232d",
        fontFamily:
          "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      }}
    >
      <div
        ref={mountRef}
        style={{
          flex: "1 1 340px",
          minWidth: 280,
          minHeight: 380,
          position: "relative",
        }}
      />

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
            RIG · BLOCK STYLE
          </div>
          <div style={{ fontSize: 13, color: "#e8e9ee", fontWeight: 600 }}>
            Character Viewer
          </div>
        </div>

        <ColorRow
          label="Skin"
          options={PALETTE.skin}
          value={skinColor}
          onChange={setSkinColor}
        />
        <ColorRow
          label="Shirt"
          options={PALETTE.shirt}
          value={shirtColor}
          onChange={setShirtColor}
        />
        <ColorRow
          label="Pants"
          options={PALETTE.pants}
          value={pantsColor}
          onChange={setPantsColor}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <ToggleButton
            active={autoRotate}
            onClick={() => setAutoRotate((v) => !v)}
          >
            Rotate
          </ToggleButton>
          <IconButton
            onClick={() => setWalking((v) => !v)}
            title={walking ? "Pause" : "Walk"}
          >
            {walking ? <Pause size={14} /> : <Play size={14} />}
          </IconButton>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <IconButton onClick={shuffle} title="Shuffle colors">
            <Shuffle size={14} /> Shuffle
          </IconButton>
          <IconButton onClick={reset} title="Reset colors">
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
          Drag the viewport to rotate manually.
          <br />
          Built from 6 boxes — no external model needed.
        </div>
      </div>
    </div>
  );
}

function ColorRow({ label, options, value, onChange }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: "#8b8fa3",
          marginBottom: 6,
          letterSpacing: "0.04em",
        }}
      >
        {label.toUpperCase()}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={c}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: c,
              border:
                value === c
                  ? "2px solid #5ec8f0"
                  : "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
              padding: 0,
              boxShadow:
                value === c ? "0 0 0 2px rgba(94,200,240,0.25)" : "none",
            }}
          />
        ))}
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
