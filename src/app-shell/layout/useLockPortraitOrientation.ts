import { useEffect, useState } from 'react';

interface OrientationLock {
    isLandscape: boolean;
    rotateDeg: number;
}

const DEFAULT_LOCK: OrientationLock = { isLandscape: false, rotateDeg: -90 };

// screen.orientation.angle: 90 → 오른쪽으로 90도 회전한 landscape, 270 → 왼쪽으로 회전.
// 화면을 반대 방향으로 되돌려 회전시켜야 콘텐츠가 항상 정방향 세로로 보인다.
//
// (orientation: landscape)는 데스크톱처럼 창이 그냥 옆으로 넓기만 해도 매칭되므로,
// 실제 터치 기기(coarse pointer)가 물리적으로 가로가 됐을 때만 회전 로직을 적용한다.
function readOrientationLock(): OrientationLock {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const isLandscape = isTouchDevice && window.matchMedia('(orientation: landscape)').matches;
    const angle = window.screen.orientation?.angle ?? 0;
    const rotateDeg = angle === 270 ? 90 : -90;
    return { isLandscape, rotateDeg };
}

export function useLockPortraitOrientation(): OrientationLock {
    const [lock, setLock] = useState<OrientationLock>(DEFAULT_LOCK);

    useEffect(() => {
        const update = () => setLock(readOrientationLock());
        update();

        const mediaQuery = window.matchMedia('(orientation: landscape)');
        mediaQuery.addEventListener('change', update);
        window.screen.orientation?.addEventListener('change', update);

        return () => {
            mediaQuery.removeEventListener('change', update);
            window.screen.orientation?.removeEventListener('change', update);
        };
    }, []);

    return lock;
}
