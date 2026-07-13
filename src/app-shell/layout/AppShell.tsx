import type { CSSProperties, PropsWithChildren } from 'react';
import { PORTRAIT_VIEWPORT_MAX_WIDTH_PX } from '../constants';
import { useLockPortraitOrientation } from './useLockPortraitOrientation';

export function AppShell({ children }: PropsWithChildren) {
    const { isLandscape, rotateDeg } = useLockPortraitOrientation();

    const style = {
        '--portrait-viewport-max-width': `${PORTRAIT_VIEWPORT_MAX_WIDTH_PX}px`,
        '--lock-rotate': `${rotateDeg}deg`,
    } as CSSProperties;

    return (
        <div className={`app-viewport${isLandscape ? ' app-viewport--landscape-locked' : ''}`} style={style}>
            {children}
        </div>
    );
}

export default AppShell;
