import type { CSSProperties } from 'react';
import { ControllableRole } from '../debug/useControlledRole';
import { SEEKER_MAX_HEALTH } from '../constants';

interface CombatHudProps {
    controlledRole: ControllableRole;
    seekerHealth: number;
    hiderEliminated: boolean;
    contributionScore: number;
}

const containerStyle: CSSProperties = {
    position: 'absolute',
    top: 12,
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

export function CombatHud({ controlledRole, seekerHealth, hiderEliminated, contributionScore }: CombatHudProps) {
    if (controlledRole === 'seeker') {
        return <div style={containerStyle}>Seeker HP: {seekerHealth} / {SEEKER_MAX_HEALTH}</div>;
    }

    return (
        <div style={containerStyle}>
            {hiderEliminated ? (
                <div style={{ color: '#e5484d' }}>ELIMINATED</div>
            ) : (
                <div>기여도: {Math.floor(contributionScore)}</div>
            )}
        </div>
    );
}

export default CombatHud;
