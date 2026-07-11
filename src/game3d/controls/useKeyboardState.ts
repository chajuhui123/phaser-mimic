import { useEffect, useRef } from 'react';

export type KeyboardState = Record<string, boolean>;

const MOVEMENT_KEYS = new Set([
    'KeyW', 'KeyA', 'KeyS', 'KeyD',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
]);

export function useKeyboardState() {
    const keysRef = useRef<KeyboardState>({});

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!MOVEMENT_KEYS.has(event.code)) return;
            keysRef.current[event.code] = true;
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            if (!MOVEMENT_KEYS.has(event.code)) return;
            keysRef.current[event.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return keysRef;
}
