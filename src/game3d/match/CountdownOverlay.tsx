import { fullScreenOverlayStyle } from './overlayStyle';

interface CountdownOverlayProps {
    countdown: number;
}

export function CountdownOverlay({ countdown }: CountdownOverlayProps) {
    return (
        <div style={fullScreenOverlayStyle}>
            <div style={{ fontSize: 64 }}>{countdown > 0 ? countdown : 'GO'}</div>
        </div>
    );
}

export default CountdownOverlay;
