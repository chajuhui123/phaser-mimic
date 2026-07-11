import type { CSSProperties } from 'react';

interface MatchHudProps {
    remainingMs: number;
}

const containerStyle: CSSProperties = {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 14px',
    background: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
    borderRadius: 4,
    zIndex: 10,
    pointerEvents: 'none',
};

function formatTime(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function MatchHud({ remainingMs }: MatchHudProps) {
    return (
        <div style={containerStyle}>
            술래 &nbsp;|&nbsp; {formatTime(remainingMs)} &nbsp;|&nbsp; 도망자
        </div>
    );
}

export default MatchHud;
