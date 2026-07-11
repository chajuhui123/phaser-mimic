import { useEffect, useRef } from 'react';

// 스페이스바/좌클릭은 역할에 따라 의미가 다르다: seeker는 공격, hider는 점프.
export function useActionInput() {
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
