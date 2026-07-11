import { useCallback, useRef, useState } from 'react';
import { COUNTDOWN_SECONDS, MATCH_DURATION_MS, SPECTATE_DURATION_MS } from '../constants';
import { MatchPhase, MatchResult } from './types';

export function useMatchState() {
    const [phase, setPhase] = useState<MatchPhase>('waiting');
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [remainingMs, setRemainingMs] = useState(MATCH_DURATION_MS);
    const [result, setResult] = useState<MatchResult | null>(null);

    const phaseRef = useRef<MatchPhase>('waiting');
    const countdownMsRef = useRef(COUNTDOWN_SECONDS * 1000);
    const remainingMsRef = useRef(MATCH_DURATION_MS);
    const spectateMsRef = useRef(SPECTATE_DURATION_MS);
    const pendingResultRef = useRef<MatchResult | null>(null);

    const startCountdown = useCallback(() => {
        phaseRef.current = 'countdown';
        countdownMsRef.current = COUNTDOWN_SECONDS * 1000;
        setPhase('countdown');
        setCountdown(COUNTDOWN_SECONDS);
        setResult(null);
    }, []);

    const beginPlaying = useCallback(() => {
        phaseRef.current = 'playing';
        remainingMsRef.current = MATCH_DURATION_MS;
        setPhase('playing');
        setRemainingMs(MATCH_DURATION_MS);
    }, []);

    const endMatch = useCallback((matchResult: MatchResult) => {
        if (phaseRef.current === 'ended') return;
        phaseRef.current = 'ended';
        setPhase('ended');
        setResult(matchResult);
    }, []);

    const startSpectating = useCallback((pendingResult: MatchResult) => {
        if (phaseRef.current !== 'playing') return;
        phaseRef.current = 'spectating';
        spectateMsRef.current = SPECTATE_DURATION_MS;
        pendingResultRef.current = pendingResult;
        setPhase('spectating');
    }, []);

    const tick = useCallback(
        (deltaMs: number) => {
            if (phaseRef.current === 'countdown') {
                countdownMsRef.current -= deltaMs;
                setCountdown(Math.max(0, Math.ceil(countdownMsRef.current / 1000)));
                if (countdownMsRef.current <= 0) beginPlaying();
            } else if (phaseRef.current === 'playing') {
                remainingMsRef.current -= deltaMs;
                setRemainingMs(Math.max(0, remainingMsRef.current));
                if (remainingMsRef.current <= 0) {
                    endMatch({ winner: 'hider', reason: '제한 시간 종료 - 도망자 생존' });
                }
            } else if (phaseRef.current === 'spectating') {
                spectateMsRef.current -= deltaMs;
                if (spectateMsRef.current <= 0 && pendingResultRef.current) {
                    endMatch(pendingResultRef.current);
                }
            }
        },
        [beginPlaying, endMatch]
    );

    return {
        phase,
        countdown,
        remainingMs,
        result,
        startCountdown,
        endMatch,
        startSpectating,
        tick,
    };
}
