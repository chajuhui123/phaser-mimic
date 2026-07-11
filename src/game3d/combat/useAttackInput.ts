import { useEffect, useRef } from 'react';

export function useAttackInput() {
    const pendingRef = useRef(false);

    useEffect(() => {
        const trigger = () => {
            pendingRef.current = true;
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === 'Space') trigger();
        };
        const handleMouseDown = (event: MouseEvent) => {
            if (event.button === 0) trigger();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleMouseDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    return pendingRef;
}
