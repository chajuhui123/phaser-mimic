import { useCallback, useRef } from 'react';
import type { Group } from 'three';
import { Canvas } from '@react-three/fiber';
import { NpcActor } from './entities/NpcActor';
import { Simulation } from './Simulation';
import { DebugHud } from './debug/DebugHud';
import { useControlledRole } from './debug/useControlledRole';
import { useCombatState } from './combat/useCombatState';
import { CombatHud } from './combat/CombatHud';
import { ProximityWarningOverlay } from './combat/ProximityWarningOverlay';
import { useMissionState } from './mission/useMissionState';
import { MissionHud } from './mission/MissionHud';
import { mockNpcs, mockPlayer, PLAYER_EYE_HEIGHT } from './mockData';

const FLOOR_SIZE = 50;

const INITIAL_CAMERA_POSITION: [number, number, number] = [
    mockPlayer.position.x,
    PLAYER_EYE_HEIGHT,
    mockPlayer.position.z,
];

export function GameScene() {
    const controlledRole = useControlledRole('player');
    const combat = useCombatState();
    const mission = useMissionState();
    const warningOverlayRef = useRef<HTMLDivElement>(null);
    const npcGroupsRef = useRef<Map<string, Group>>(new Map());

    const handleNpcRef = useCallback((id: string, group: Group | null) => {
        if (group) npcGroupsRef.current.set(id, group);
        else npcGroupsRef.current.delete(id);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <DebugHud controlledRole={controlledRole} />
            <CombatHud
                controlledRole={controlledRole}
                seekerHealth={combat.seekerHealth}
                hiderEliminated={combat.hiderEliminated}
                contributionScore={combat.contributionScore}
            />
            {controlledRole === 'player' && (
                <MissionHud phase={mission.phase} activeMission={mission.activeMission} remainingMs={mission.remainingMs} />
            )}
            <ProximityWarningOverlay ref={warningOverlayRef} />
            <Canvas
                camera={{ position: INITIAL_CAMERA_POSITION, fov: 75 }}
                style={{ width: '100%', height: '100%' }}
            >
                <color attach="background" args={['#0b0f1a']} />

                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1.2} />

                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
                    <meshStandardMaterial color="#2a3b4d" />
                </mesh>

                <Simulation
                    controlledRole={controlledRole}
                    hiderEliminated={combat.hiderEliminated}
                    npcGroupsRef={npcGroupsRef}
                    warningOverlayRef={warningOverlayRef}
                    onHiderHit={combat.registerHiderHit}
                    onNpcMisattack={combat.registerNpcMisattack}
                    onContribution={combat.addContribution}
                    activeMission={mission.activeMission}
                    isTransformed={mission.isTransformed}
                    transformSeed={mission.transformSeed}
                    onMissionTick={mission.tick}
                    onMissionComplete={mission.completeMission}
                />

                {mockNpcs.map((entity) => (
                    <NpcActor key={entity.id} entity={entity} onRef={handleNpcRef} />
                ))}
            </Canvas>
        </div>
    );
}

export default GameScene;
