import { useCallback, useRef, useState } from 'react';
import { FORCED_TRANSFORM_DURATION_MS, MISSION_INTERVAL_MS, MISSION_TIME_LIMIT_MS } from '../constants';
import { pickRandomMissionDefinition } from './missionDefinitions';
import { randomZonePosition } from './zone';
import { ActiveMission, MissionPhase, ZonePosition } from './types';

export function useMissionState() {
    const [phase, setPhase] = useState<MissionPhase>('waiting');
    const [activeMission, setActiveMission] = useState<ActiveMission | null>(null);
    const [remainingMs, setRemainingMs] = useState(MISSION_INTERVAL_MS);
    const [transformSeed, setTransformSeed] = useState(0);

    const phaseRef = useRef<MissionPhase>('waiting');
    const remainingMsRef = useRef(MISSION_INTERVAL_MS);

    const startNextWaiting = useCallback(() => {
        phaseRef.current = 'waiting';
        remainingMsRef.current = MISSION_INTERVAL_MS;
        setPhase('waiting');
        setActiveMission(null);
        setRemainingMs(MISSION_INTERVAL_MS);
    }, []);

    const startMission = useCallback((hiderPosition: ZonePosition) => {
        const definition = pickRandomMissionDefinition();
        const mission: ActiveMission = {
            ...definition,
            zonePosition: definition.kind === 'moveToZone' ? randomZonePosition(hiderPosition) : undefined,
        };

        phaseRef.current = 'mission';
        remainingMsRef.current = MISSION_TIME_LIMIT_MS;
        setPhase('mission');
        setActiveMission(mission);
        setRemainingMs(MISSION_TIME_LIMIT_MS);
    }, []);

    const startTransform = useCallback(() => {
        phaseRef.current = 'transformed';
        remainingMsRef.current = FORCED_TRANSFORM_DURATION_MS;
        setPhase('transformed');
        setActiveMission(null);
        setRemainingMs(FORCED_TRANSFORM_DURATION_MS);
        setTransformSeed(Math.random());
    }, []);

    const completeMission = useCallback(() => {
        if (phaseRef.current !== 'mission') return;
        startNextWaiting();
    }, [startNextWaiting]);

    const tick = useCallback(
        (deltaMs: number, hiderPosition: ZonePosition) => {
            remainingMsRef.current -= deltaMs;
            if (remainingMsRef.current > 0) {
                setRemainingMs(Math.max(0, remainingMsRef.current));
                return;
            }

            if (phaseRef.current === 'waiting') {
                startMission(hiderPosition);
            } else if (phaseRef.current === 'mission') {
                startTransform();
            } else {
                startNextWaiting();
            }
        },
        [startMission, startTransform, startNextWaiting]
    );

    return {
        phase,
        activeMission,
        remainingMs,
        isTransformed: phase === 'transformed',
        transformSeed,
        tick,
        completeMission,
        reset: startNextWaiting,
    };
}
