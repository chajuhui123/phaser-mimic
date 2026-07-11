import { useEffect, useState } from 'react';

export type ControllableRole = 'player' | 'seeker';

export function useControlledRole(initialRole: ControllableRole) {
    const [controlledRole, setControlledRole] = useState<ControllableRole>(initialRole);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code !== 'KeyR') return;
            setControlledRole((prev) => (prev === 'player' ? 'seeker' : 'player'));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return controlledRole;
}
