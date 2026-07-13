import { useCallback, useEffect, useRef, useState } from 'react';
import type { Group } from 'three';
import { Canvas } from '@react-three/fiber';
import { NpcActor } from './entities/NpcActor';
import { Simulation } from './Simulation';
import { GrasslandBackground } from './environment/GrasslandBackground';
import { DebugHud } from './debug/DebugHud';
import { useControlledRole } from './debug/useControlledRole';
import { useCombatState } from './combat/useCombatState';
import { CombatHud } from './combat/CombatHud';
import { ProximityWarningOverlay } from './combat/ProximityWarningOverlay';
import { useMissionState } from './mission/useMissionState';
import { MissionHud } from './mission/MissionHud';
import { useTicketState } from './match/useTicketState';
import { useMatchState } from './match/useMatchState';
import { WaitingScreen } from './match/WaitingScreen';
import { CountdownOverlay } from './match/CountdownOverlay';
import { MatchHud } from './match/MatchHud';
import { SpectatorOverlay } from './match/SpectatorOverlay';
import { ResultScreen } from './match/ResultScreen';
import { CAMERA_HEIGHT_ABOVE_GROUND, TICKET_COST_PER_MATCH } from './constants';
import { mockNpcs, mockPlayer } from './mockData';

const INITIAL_CAMERA_POSITION: [number, number, number] = [
    mockPlayer.position.x,
    CAMERA_HEIGHT_ABOVE_GROUND,
    mockPlayer.position.z,
];

export function GameScene() {
    const controlledRole = useControlledRole('player');
    const combat = useCombatState();
    const mission = useMissionState();
    const ticketState = useTicketState();
    const matchState = useMatchState();
    const warningOverlayRef = useRef<HTMLDivElement>(null);
    const npcGroupsRef = useRef<Map<string, Group>>(new Map());
    const [matchRunId, setMatchRunId] = useState(0);

    const handleNpcRef = useCallback((id: string, group: Group | null) => {
        if (group) npcGroupsRef.current.set(id, group);
        else npcGroupsRef.current.delete(id);
    }, []);

    const handleStart = useCallback(() => {
        if (!ticketState.spend(TICKET_COST_PER_MATCH)) return;
        combat.reset();
        mission.reset();
        setMatchRunId((n) => n + 1);
        matchState.startCountdown();
    }, [ticketState, combat, mission, matchState]);

    useEffect(() => {
        if (matchState.phase !== 'playing') return;
        if (combat.hiderEliminated) {
            matchState.startSpectating({ winner: 'seeker', reason: '도망자가 모두 탈락했습니다' });
        } else if (combat.seekerHealth <= 0) {
            matchState.endMatch({ winner: 'hider', reason: '술래 체력이 모두 소진되었습니다' });
        }
    }, [combat.hiderEliminated, combat.seekerHealth, matchState.phase]);

    const showInGameHud = matchState.phase === 'playing' || matchState.phase === 'spectating';

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <DebugHud controlledRole={controlledRole} />
            {showInGameHud && (
                <CombatHud
                    controlledRole={controlledRole}
                    seekerHealth={combat.seekerHealth}
                    hiderEliminated={combat.hiderEliminated}
                    contributionScore={combat.contributionScore}
                />
            )}
            {matchState.phase === 'playing' && controlledRole === 'player' && (
                <MissionHud phase={mission.phase} activeMission={mission.activeMission} remainingMs={mission.remainingMs} />
            )}
            {matchState.phase === 'playing' && <MatchHud remainingMs={matchState.remainingMs} />}
            {matchState.phase === 'spectating' && <SpectatorOverlay />}
            <ProximityWarningOverlay ref={warningOverlayRef} />

            {matchState.phase === 'waiting' && <WaitingScreen tickets={ticketState.tickets} onStart={handleStart} />}
            {matchState.phase === 'countdown' && <CountdownOverlay countdown={matchState.countdown} />}
            {matchState.phase === 'ended' && matchState.result && (
                <ResultScreen
                    result={matchState.result}
                    seekerHealth={combat.seekerHealth}
                    contributionScore={combat.contributionScore}
                    tickets={ticketState.tickets}
                    onRestart={handleStart}
                />
            )}

            <Canvas
                camera={{ position: INITIAL_CAMERA_POSITION, fov: 75 }}
                style={{ width: '100%', height: '100%' }}
                shadows
            >
                <GrasslandBackground />

                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />

                <Simulation
                    key={matchRunId}
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
                    matchPhase={matchState.phase}
                    onMatchTick={matchState.tick}
                />

                {mockNpcs.map((entity) => (
                    <NpcActor key={`${entity.id}-${matchRunId}`} entity={entity} onRef={handleNpcRef} />
                ))}
            </Canvas>
        </div>
    );
}

export default GameScene;
