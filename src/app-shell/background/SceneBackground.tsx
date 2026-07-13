import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { GrasslandBackground } from '@/game3d/environment/GrasslandBackground';
import { BlockCharacter, BlockCharacterHandle } from '@/game3d/entities/BlockCharacter';
import { TORSO_CENTER_Y } from '@/game3d/entities/characterAppearance';
import { ShootingEffects } from '@/game3d/combat/effects/ShootingEffects';
import { ShootingEffectsHandle } from '@/game3d/combat/effects/types';

const SHOOT_LOOP_MS = 3000;
const HIDER_RESPAWN_DELAY_MS = 1400;
const CAMERA_POSITION: [number, number, number] = [0, 2.2, 8.5];
const LOOK_AT_TARGET: [number, number, number] = [0, 0.85, 1.2];

const SEEKER_POSITION: [number, number, number] = [0.5, 0, 1.2];
const HIDER_POSITION: [number, number, number] = [-0.5, 0, 1.2];
// 고정된 자세 대신 실제 위치로부터 서로를 바라보는 각도를 계산한다.
const SEEKER_FACING = Math.atan2(HIDER_POSITION[0] - SEEKER_POSITION[0], HIDER_POSITION[2] - SEEKER_POSITION[2]);
const HIDER_FACING = Math.atan2(SEEKER_POSITION[0] - HIDER_POSITION[0], SEEKER_POSITION[2] - HIDER_POSITION[2]);

// <Canvas camera={{position,fov}}>는 방향까지 정확히 잡아주지 않으므로, 마운트 시 한 번 lookAt으로 고정한다.
function FixedCamera() {
    const { camera } = useThree();
    useEffect(() => {
        camera.position.set(...CAMERA_POSITION);
        camera.lookAt(...LOOK_AT_TARGET);
    }, [camera]);
    return null;
}

// hider_seeker_screen.jsx(공유 에셋)의 "seeker가 hider를 쏘면 팡 하고 사라지는" 스플래시 비네트를,
// 실제 게임에서 쓰는 BlockCharacter/ShootingEffects를 그대로 재사용해 구현한다.
function ShootoutVignette() {
    const seekerRef = useRef<Group>(null!);
    const hiderRef = useRef<Group>(null!);
    const seekerCharacterRef = useRef<BlockCharacterHandle | null>(null);
    const effectsRef = useRef<ShootingEffectsHandle | null>(null);

    useEffect(() => {
        const target = new Vector3();
        let hideTimer: ReturnType<typeof setTimeout> | null = null;
        let respawnTimer: ReturnType<typeof setTimeout> | null = null;

        const fire = () => {
            const hider = hiderRef.current;
            if (!hider || !hider.visible) return;

            hider.getWorldPosition(target);
            // 발밑이 아니라 몸통 높이를 조준한다.
            target.y += TORSO_CENTER_Y;
            seekerCharacterRef.current?.triggerShoot({ to: target, hit: true, color: '#4ade80' });
            // 팡 이펙트가 눈에 보인 다음 캐릭터가 사라지도록 살짝 늦춘다.
            hideTimer = setTimeout(() => {
                hider.visible = false;
                respawnTimer = setTimeout(() => {
                    hider.visible = true;
                }, HIDER_RESPAWN_DELAY_MS);
            }, 120);
        };

        const loopId = setInterval(fire, SHOOT_LOOP_MS);
        return () => {
            clearInterval(loopId);
            if (hideTimer) clearTimeout(hideTimer);
            if (respawnTimer) clearTimeout(respawnTimer);
        };
    }, []);

    return (
        <>
            <group ref={seekerRef} position={SEEKER_POSITION}>
                <BlockCharacter
                    ref={seekerCharacterRef}
                    role="seeker"
                    trackRef={seekerRef}
                    effectsRef={effectsRef}
                    facing={SEEKER_FACING}
                />
            </group>
            <group ref={hiderRef} position={HIDER_POSITION}>
                <BlockCharacter role="player" trackRef={hiderRef} facing={HIDER_FACING} />
            </group>
            <ShootingEffects ref={effectsRef} />
        </>
    );
}

interface SceneBackgroundProps {
    dim?: boolean;
}

export function SceneBackground({ dim = false }: SceneBackgroundProps) {
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <Canvas camera={{ position: CAMERA_POSITION, fov: 45 }} style={{ width: '100%', height: '100%' }}>
                <FixedCamera />
                <ambientLight intensity={0.85} color="#fff2e0" />
                <directionalLight position={[-4, 6, 3]} intensity={0.95} color="#ffe8c2" />
                <directionalLight position={[4, 3, -3]} intensity={0.3} color="#c9b8e0" />
                <GrasslandBackground />
                <ShootoutVignette />
            </Canvas>
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background:
                        'linear-gradient(180deg, transparent 0%, transparent 55%, rgba(24,14,18,0.55) 82%, rgba(20,11,15,0.88) 100%)',
                }}
            />
            {dim && <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,9,13,0.55)' }} />}
        </div>
    );
}

export default SceneBackground;
