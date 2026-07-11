import { useCallback, useState } from 'react';
import { SEEKER_MAX_HEALTH } from '../constants';

export function useCombatState() {
    const [seekerHealth, setSeekerHealth] = useState(SEEKER_MAX_HEALTH);
    const [hiderEliminated, setHiderEliminated] = useState(false);
    const [contributionScore, setContributionScore] = useState(0);

    const registerHiderHit = useCallback(() => {
        setHiderEliminated(true);
    }, []);

    const registerNpcMisattack = useCallback(() => {
        setSeekerHealth((prev) => Math.max(0, prev - 1));
    }, []);

    const addContribution = useCallback((amount: number) => {
        setContributionScore((prev) => prev + amount);
    }, []);

    const reset = useCallback(() => {
        setSeekerHealth(SEEKER_MAX_HEALTH);
        setHiderEliminated(false);
        setContributionScore(0);
    }, []);

    return {
        seekerHealth,
        hiderEliminated,
        contributionScore,
        registerHiderHit,
        registerNpcMisattack,
        addContribution,
        reset,
    };
}
