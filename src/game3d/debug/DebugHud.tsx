import { ControllableRole } from './useControlledRole';

interface DebugHudProps {
    controlledRole: ControllableRole;
}

export function DebugHud({ controlledRole }: DebugHudProps) {
    return (
        <div
            style={{
                position: 'absolute',
                top: 12,
                left: 12,
                padding: '6px 10px',
                background: 'rgba(0, 0, 0, 0.6)',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: 13,
                borderRadius: 4,
                zIndex: 10,
                pointerEvents: 'none',
            }}
        >
            DEBUG: controlling {controlledRole} (R to switch)
        </div>
    );
}

export default DebugHud;
