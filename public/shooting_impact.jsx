import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCcw } from "lucide-react";

const TARGET_DEFS = [
  { x: -1.5, z: -0.7, color: "#e63946" },
  { x: 0, z: -1.05, color: "#457b9d" },
  { x: 1.5, z: -0.7, color: "#2a9d8f" },
];

const SKIN = "#f2c9a1";
const PANTS = "#2b2d3a";
const CAMERA_POS = new THREE.Vector3(0, 1.9, 4.8);
const MUZZLE_POS = new THREE.Vector3(0.85, 1.28, 4.0);

const FALL_DUR = 0.22;
const DOWN_DUR = 0.85;
const RISE_DUR = 0.32;

function easeOutBack(p) {
  const c = 1.7;
  return 1 + c * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
}

function disposeObject(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else o.material.dispose();
    }
  });
}

function createDummyTarget(x, z, accentColor) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const skinMat = new THREE.MeshStandardMaterial({
    color: SKIN,
    roughness: 0.7,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.6,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: PANTS,
    roughness: 0.6,
  });

  const LEG_H = 1.1,
    TORSO_H = 1.15,
    TORSO_W = 0.95,
    HEAD = 0.82,
    LIMB_W = 0.36;
  const hipY = LEG_H;
  const torsoY = hipY + TORSO_H / 2;
  const headY = torsoY + TORSO_H / 2 + HEAD / 2;
  const shoulderY = torsoY + TORSO_H / 2 - 0.08;

  const legL = new THREE.Mesh(
    new THREE.BoxGeometry(LIMB_W, LEG_H, LIMB_W),
    pantsMat,
  );
  legL.position.set(-0.24, hipY / 2, 0);
  legL.castShadow = true;
  const legR = legL.clone();
  legR.position.x = 0.24;
  group.add(legL, legR);

  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(TORSO_W, TORSO_H, 0.5),
    shirtMat,
  );
  torso.position.y = torsoY;
  torso.castShadow = true;
  group.add(torso);

  const armL = new THREE.Mesh(
    new THREE.BoxGeometry(LIMB_W, 1.05, LIMB_W),
    skinMat,
  );
  armL.position.set(-(TORSO_W / 2 + LIMB_W / 2), shoulderY - 0.52, 0);
  armL.castShadow = true;
  const armR = armL.clone();
  armR.position.x = TORSO_W / 2 + LIMB_W / 2;
  group.add(armL, armR);

  const head = new THREE.Mesh(new THREE.BoxGeometry(HEAD, HEAD, HEAD), skinMat);
  head.position.y = headY;
  head.castShadow = true;
  group.add(head);

  const eyeMat = new THREE.MeshStandardMaterial({ color: "#1a1a1a" });
  const eyeGeo = new THREE.BoxGeometry(0.07, 0.1, 0.02);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.17, headY + 0.03, HEAD / 2 + 0.005);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.17;
  group.add(eyeL, eyeR);

  group.userData = {
    isTarget: true,
    accentColor,
    state: "idle",
    timer: 0,
    fallDir: Math.random() < 0.5 ? -1 : 1,
    flashAmount: 0,
    flashMats: [skinMat, shirtMat, pantsMat],
  };

  return group;
}

function spawnBurst(scene, particles, position, colorHex, opts = {}) {
  const count = opts.count ?? 12;
  const speed = opts.speed ?? 3.2;
  const upBias = opts.upBias ?? 2.2;
  const size = opts.size ?? 0.09;
  const sparkRatio = opts.sparkRatio ?? 0.3;

  for (let i = 0; i < count; i++) {
    const isSpark = Math.random() < sparkRatio;
    const mat = new THREE.MeshStandardMaterial({
      color: isSpark ? "#fff3b0" : colorHex,
      roughness: 0.5,
      transparent: true,
      opacity: 1,
    });
    const s = size * (0.6 + Math.random() * 0.8);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
    mesh.position.copy(position);

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5;
    const v = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    ).multiplyScalar(speed * (0.5 + Math.random() * 0.7));
    v.y += upBias * (0.5 + Math.random() * 0.6);

    mesh.userData = {
      velocity: v,
      angVel: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
      ),
      life: 0,
      maxLife: 0.55 + Math.random() * 0.35,
    };
    scene.add(mesh);
    particles.push(mesh);
  }
}

function createMuzzleFlash(scene, position) {
  const group = new THREE.Group();
  group.position.copy(position);
  const mat = new THREE.MeshBasicMaterial({
    color: "#fff7c2",
    transparent: true,
    opacity: 1,
  });
  for (let i = 0; i < 4; i++) {
    const spike = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.05), mat);
    spike.rotation.z = (Math.PI / 4) * i;
    group.add(spike);
  }
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), mat);
  group.add(core);
  scene.add(group);
  return { mesh: group, mat, life: 0, maxLife: 0.09 };
}

function createTracer(scene, start, end) {
  const dir = new THREE.Vector3().subVectors(end, start);
  const len = dir.length();
  const mat = new THREE.MeshBasicMaterial({
    color: "#fff59a",
    transparent: true,
    opacity: 0.95,
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, len), mat);
  mesh.position.copy(start).add(dir.clone().multiplyScalar(0.5));
  mesh.lookAt(end);
  scene.add(mesh);
  return { mesh, mat, life: 0, maxLife: 0.1 };
}

export default function ShootingImpactDemo() {
  const mountRef = useRef(null);
  const [shots, setShots] = useState(0);
  const [hits, setHits] = useState(0);
  const resetFnRef = useRef(() => {});

  useEffect(() => {
    const mount = mountRef.current;
    const getSize = () => ({
      w: mount.clientWidth || 600,
      h: mount.clientHeight || 480,
    });
    let { w, h } = getSize();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#10121a");
    scene.fog = new THREE.Fog("#10121a", 6, 16);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.copy(CAMERA_POS);
    camera.lookAt(0, 1.0, -0.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "crosshair";

    scene.add(new THREE.AmbientLight("#ffffff", 0.55));
    const key = new THREE.DirectionalLight("#ffffff", 1.1);
    key.position.set(3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#5ec8f0", 0.3);
    rim.position.set(-4, 2, -2);
    scene.add(rim);

    const world = new THREE.Group();
    scene.add(world);

    const grid = new THREE.GridHelper(20, 20, "#2a2d3a", "#1c1e27");
    world.add(grid);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: "#171922", roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.005;
    ground.userData.isGround = true;
    world.add(ground);

    const targets = TARGET_DEFS.map((d) => {
      const t = createDummyTarget(d.x, 0, d.color);
      world.add(t);
      return t;
    });

    const particles = [];
    const flashes = [];
    const tracers = [];
    let shake = { time: 0, mag: 0 };

    function resetAll() {
      targets.forEach((t) => {
        t.userData.state = "idle";
        t.userData.timer = 0;
        t.userData.flashAmount = 0;
        t.rotation.z = 0;
      });
    }
    resetFnRef.current = resetAll;

    // -------- drag-to-orbit vs click-to-shoot --------
    let downX = 0,
      downY = 0,
      downT = 0,
      dragging = false,
      lastX = 0;
    let manualYaw = 0;

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    function doShoot(clientX, clientY) {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);

      const hittable = [];
      targets.forEach((t) =>
        t.traverse((o) => {
          if (o.isMesh) hittable.push(o);
        }),
      );
      hittable.push(ground);

      const intersects = raycaster.intersectObjects(hittable, false);
      setShots((s) => s + 1);

      let impactPoint = null;
      let hitTarget = null;

      if (intersects.length > 0) {
        const hit = intersects[0];
        impactPoint = hit.point;
        let obj = hit.object;
        while (obj && !obj.userData.isTarget) obj = obj.parent;
        if (obj && obj.userData.isTarget && obj.userData.state === "idle")
          hitTarget = obj;
      } else {
        impactPoint = raycaster.ray.origin
          .clone()
          .add(raycaster.ray.direction.clone().multiplyScalar(14));
      }

      flashes.push(createMuzzleFlash(scene, MUZZLE_POS));
      tracers.push(createTracer(scene, MUZZLE_POS, impactPoint));

      if (hitTarget) {
        setHits((hVal) => hVal + 1);
        hitTarget.userData.state = "falling";
        hitTarget.userData.timer = 0;
        hitTarget.userData.flashAmount = 1;
        spawnBurst(
          scene,
          particles,
          impactPoint,
          hitTarget.userData.accentColor,
          {
            count: 14,
            speed: 3.4,
            upBias: 2.4,
            size: 0.09,
            sparkRatio: 0.35,
          },
        );
        shake = { time: 0.18, mag: 0.09 };
      } else if (intersects.length > 0) {
        spawnBurst(scene, particles, impactPoint, "#6b6b6b", {
          count: 6,
          speed: 1.6,
          upBias: 0.6,
          size: 0.05,
          sparkRatio: 0,
        });
      }
    }

    const onDown = (e) => {
      downX = e.clientX;
      downY = e.clientY;
      downT = performance.now();
      lastX = e.clientX;
      dragging = false;
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => {
      const dx = e.clientX - downX,
        dy = e.clientY - downY;
      if (!dragging && Math.hypot(dx, dy) > 6) dragging = true;
      if (dragging) {
        manualYaw += (e.clientX - lastX) * 0.007;
        lastX = e.clientX;
      }
    };
    const onUp = (e) => {
      const dt = performance.now() - downT;
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (!dragging && dist < 6 && dt < 500) doShoot(e.clientX, e.clientY);
      dragging = false;
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);

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

      world.rotation.y = manualYaw;

      // target fall / down / rise state machine
      targets.forEach((t) => {
        const d = t.userData;
        if (d.state === "falling") {
          d.timer += dt;
          const p = Math.min(d.timer / FALL_DUR, 1);
          t.rotation.z = d.fallDir * (Math.PI / 2.05) * easeOutBack(p);
          if (p >= 1) {
            d.state = "down";
            d.timer = 0;
          }
        } else if (d.state === "down") {
          d.timer += dt;
          if (d.timer > DOWN_DUR) {
            d.state = "rising";
            d.timer = 0;
          }
        } else if (d.state === "rising") {
          d.timer += dt;
          const p = Math.min(d.timer / RISE_DUR, 1);
          t.rotation.z = d.fallDir * (Math.PI / 2.05) * (1 - p);
          if (p >= 1) {
            d.state = "idle";
            d.timer = 0;
            t.rotation.z = 0;
          }
        }
        if (d.flashAmount > 0) {
          d.flashAmount = Math.max(0, d.flashAmount - dt * 4.5);
          d.flashMats.forEach((m) => {
            m.emissive = m.emissive || new THREE.Color(0, 0, 0);
            m.emissive.setScalar(d.flashAmount * 0.8);
          });
        }
      });

      // particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const u = p.userData;
        u.life += dt;
        u.velocity.y -= 9 * dt;
        p.position.addScaledVector(u.velocity, dt);
        p.rotation.x += u.angVel.x * dt;
        p.rotation.y += u.angVel.y * dt;
        p.rotation.z += u.angVel.z * dt;
        const lp = u.life / u.maxLife;
        p.material.opacity = Math.max(0, 1 - lp);
        const sc = Math.max(0.001, 1 - lp * 0.4);
        p.scale.setScalar(sc);
        if (p.position.y < -0.5 || lp >= 1) {
          scene.remove(p);
          disposeObject(p);
          particles.splice(i, 1);
        }
      }

      // muzzle flashes
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life += dt;
        const lp = f.life / f.maxLife;
        f.mesh.scale.setScalar(0.4 + lp * 1.6);
        f.mat.opacity = Math.max(0, 1 - lp);
        if (lp >= 1) {
          scene.remove(f.mesh);
          disposeObject(f.mesh);
          flashes.splice(i, 1);
        }
      }

      // tracers
      for (let i = tracers.length - 1; i >= 0; i--) {
        const tr = tracers[i];
        tr.life += dt;
        const lp = tr.life / tr.maxLife;
        tr.mat.opacity = Math.max(0, 0.95 * (1 - lp));
        if (lp >= 1) {
          scene.remove(tr.mesh);
          disposeObject(tr.mesh);
          tracers.splice(i, 1);
        }
      }

      // camera shake
      if (shake.time > 0) {
        shake.time -= dt;
        const m = shake.mag * Math.max(0, shake.time / 0.18);
        camera.position.set(
          CAMERA_POS.x + (Math.random() - 0.5) * m,
          CAMERA_POS.y + (Math.random() - 0.5) * m,
          CAMERA_POS.z,
        );
      } else if (!camera.position.equals(CAMERA_POS)) {
        camera.position.copy(CAMERA_POS);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      [
        ...particles,
        ...flashes.map((f) => f.mesh),
        ...tracers.map((t) => t.mesh),
      ].forEach((o) => {
        scene.remove(o);
        disposeObject(o);
      });
      targets.forEach((t) => disposeObject(t));
      disposeObject(ground);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
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
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      <div
        style={{
          position: "absolute",
          top: 12,
          left: 14,
          display: "flex",
          gap: 14,
          fontSize: 11,
          color: "#c7cad6",
          background: "rgba(20,22,30,0.6)",
          padding: "6px 12px",
          borderRadius: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <span>
          SHOTS <b style={{ color: "#e8e9ee" }}>{shots}</b>
        </span>
        <span>
          HITS <b style={{ color: "#5ec8f0" }}>{hits}</b>
        </span>
      </div>

      <button
        onClick={() => {
          resetFnRef.current();
          setShots(0);
          setHits(0);
        }}
        title="Reset"
        style={{
          position: "absolute",
          top: 10,
          right: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          padding: "6px 12px",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(20,22,30,0.6)",
          color: "#c7cad6",
          cursor: "pointer",
          fontFamily: "inherit",
          backdropFilter: "blur(4px)",
        }}
      >
        <RotateCcw size={12} /> Reset
      </button>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 14,
          fontSize: 10,
          color: "#565a6b",
          lineHeight: 1.5,
        }}
      >
        타겟을 클릭하면 명중 · 빈 곳을 드래그하면 시점 회전
      </div>
    </div>
  );
}
