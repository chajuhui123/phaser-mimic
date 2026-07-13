import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, Quaternion, Vector3 } from 'three';
import type { Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import type { FireShotInput, ShootingEffectsHandle } from './types';

const FLASH_LIFE_S = 0.09;
const TRACER_LIFE_S = 0.1;
const POP_LIFE_S = 0.4;
const BURST_LIFE_S = 0.75;
const BURST_COUNT = 18;
const BURST_GRAVITY = 9;
const DEFAULT_BURST_COLOR = '#8f9bb3';

interface FlashData {
    id: number;
    kind: 'flash';
    position: Vector3;
}

interface TracerData {
    id: number;
    kind: 'tracer';
    position: Vector3;
    quaternion: Quaternion;
    length: number;
}

// 명중 지점에서 크게 부풀어 오르며 사라지는, 눈에 잘 띄는 "팡!" 효과.
interface PopData {
    id: number;
    kind: 'pop';
    position: Vector3;
    color: string;
}

interface BurstData {
    id: number;
    kind: 'burst';
    position: Vector3;
    color: string;
    size: number;
}

type EffectData = FlashData | TracerData | PopData | BurstData;

interface PhysicsEntry {
    kind: EffectData['kind'];
    life: number;
    maxLife: number;
    velocity?: Vector3;
}

// 카메라 방향과 무관하게 항상 카메라 쪽을 바라보는 평면(빌보드) 재질에는 depthWrite를 끈다.
export const ShootingEffects = forwardRef<ShootingEffectsHandle>(function ShootingEffects(_, ref) {
    const [effects, setEffects] = useState<EffectData[]>([]);
    const physicsRef = useRef(new Map<number, PhysicsEntry>());
    const meshRefs = useRef(new Map<number, Mesh>());
    const nextIdRef = useRef(0);

    const registerMesh = useCallback((id: number, mesh: Mesh | null) => {
        if (mesh) meshRefs.current.set(id, mesh);
        else meshRefs.current.delete(id);
    }, []);

    const fireShot = useCallback(({ from, to, hit, color }: FireShotInput) => {
        const spawned: EffectData[] = [];

        const flashId = nextIdRef.current++;
        spawned.push({ id: flashId, kind: 'flash', position: from.clone() });
        physicsRef.current.set(flashId, { kind: 'flash', life: 0, maxLife: FLASH_LIFE_S });

        const direction = new Vector3().subVectors(to, from);
        const length = Math.max(direction.length(), 0.01);
        const midpoint = from.clone().addScaledVector(direction, 0.5);
        const scratch = new Object3D();
        scratch.position.copy(midpoint);
        scratch.lookAt(to);

        const tracerId = nextIdRef.current++;
        spawned.push({ id: tracerId, kind: 'tracer', position: midpoint, quaternion: scratch.quaternion.clone(), length });
        physicsRef.current.set(tracerId, { kind: 'tracer', life: 0, maxLife: TRACER_LIFE_S });

        if (hit) {
            const burstColor = color ?? DEFAULT_BURST_COLOR;

            const popId = nextIdRef.current++;
            spawned.push({ id: popId, kind: 'pop', position: to.clone(), color: burstColor });
            physicsRef.current.set(popId, { kind: 'pop', life: 0, maxLife: POP_LIFE_S });

            for (let i = 0; i < BURST_COUNT; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI * 0.5;
                const speed = 3.2 + Math.random() * 2.2;
                const velocity = new Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta))
                    .multiplyScalar(speed)
                    .add(new Vector3(0, 2.4, 0));

                const burstId = nextIdRef.current++;
                spawned.push({
                    id: burstId,
                    kind: 'burst',
                    position: to.clone(),
                    color: burstColor,
                    size: 0.08 + Math.random() * 0.08,
                });
                physicsRef.current.set(burstId, { kind: 'burst', life: 0, maxLife: BURST_LIFE_S, velocity });
            }
        }

        setEffects((prev) => [...prev, ...spawned]);
    }, []);

    useImperativeHandle(ref, () => ({ fireShot }), [fireShot]);

    useFrame((_, delta) => {
        const expired: number[] = [];

        physicsRef.current.forEach((phys, id) => {
            phys.life += delta;
            const t = Math.min(1, phys.life / phys.maxLife);
            const mesh = meshRefs.current.get(id);

            if (mesh) {
                const material = mesh.material as MeshBasicMaterial | MeshStandardMaterial;
                material.opacity = Math.max(0, 1 - t);

                if (phys.kind === 'burst' && phys.velocity) {
                    phys.velocity.y -= BURST_GRAVITY * delta;
                    mesh.position.addScaledVector(phys.velocity, delta);
                    mesh.scale.setScalar(Math.max(0.001, 1 - t * 0.5));
                } else if (phys.kind === 'flash') {
                    mesh.scale.setScalar(0.6 + t * 1.8);
                } else if (phys.kind === 'pop') {
                    mesh.scale.setScalar(0.3 + t * 3.2);
                    material.opacity = Math.max(0, 1 - t * t);
                }
            }

            if (phys.life >= phys.maxLife) expired.push(id);
        });

        if (expired.length > 0) {
            expired.forEach((id) => {
                physicsRef.current.delete(id);
                meshRefs.current.delete(id);
            });
            setEffects((prev) => prev.filter((effect) => !expired.includes(effect.id)));
        }
    });

    return (
        <>
            {effects.map((effect) => {
                if (effect.kind === 'flash') {
                    return (
                        <mesh key={effect.id} position={effect.position} ref={(mesh) => registerMesh(effect.id, mesh)}>
                            <icosahedronGeometry args={[0.06, 0]} />
                            <meshBasicMaterial color="#fff7c2" transparent opacity={1} depthWrite={false} />
                        </mesh>
                    );
                }
                if (effect.kind === 'pop') {
                    return (
                        <mesh key={effect.id} position={effect.position} ref={(mesh) => registerMesh(effect.id, mesh)}>
                            <icosahedronGeometry args={[0.16, 1]} />
                            <meshBasicMaterial color={effect.color} transparent opacity={1} depthWrite={false} />
                        </mesh>
                    );
                }
                if (effect.kind === 'tracer') {
                    return (
                        <mesh
                            key={effect.id}
                            position={effect.position}
                            quaternion={effect.quaternion}
                            ref={(mesh) => registerMesh(effect.id, mesh)}
                        >
                            <boxGeometry args={[0.025, 0.025, effect.length]} />
                            <meshBasicMaterial color="#fff59a" transparent opacity={0.95} depthWrite={false} />
                        </mesh>
                    );
                }
                return (
                    <mesh key={effect.id} position={effect.position} ref={(mesh) => registerMesh(effect.id, mesh)}>
                        <boxGeometry args={[effect.size, effect.size, effect.size]} />
                        <meshStandardMaterial color={effect.color} transparent opacity={1} />
                    </mesh>
                );
            })}
        </>
    );
});

export default ShootingEffects;
