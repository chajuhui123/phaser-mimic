import type { CSSProperties } from 'react';
import { ActiveMission, MissionPhase } from './types';

interface MissionHudProps {
    phase: MissionPhase;
    activeMission: ActiveMission | null;
    remainingMs: number;
}

const containerStyle: CSSProperties = {
    position: 'absolute',
    top: 48,
    right: 12,
    padding: '6px 10px',
    background: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 13,
    borderRadius: 4,
    zIndex: 10,
    pointerEvents: 'none',
    textAlign: 'right',
};

export function MissionHud({ phase, activeMission, remainingMs }: MissionHudProps) {
    const seconds = Math.ceil(remainingMs / 1000);

    if (phase === 'mission' && activeMission) {
        return (
            <div style={containerStyle}>
                미션: {activeMission.label} ({seconds}s)
            </div>
        );
    }

    if (phase === 'transformed') {
        return (
            <div style={{ ...containerStyle, color: '#f97316' }}>
                강제 변신 중! ({seconds}s)
            </div>
        );
    }

    return <div style={containerStyle}>다음 미션까지 {seconds}s</div>;
}

export default MissionHud;
