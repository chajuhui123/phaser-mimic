import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 14px',
    background: 'rgba(229, 72, 77, 0.85)',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
    borderRadius: 4,
    zIndex: 10,
    pointerEvents: 'none',
};

export function SpectatorOverlay() {
    return <div style={containerStyle}>도망자가 탈락했습니다 - 관전 중</div>;
}

export default SpectatorOverlay;
