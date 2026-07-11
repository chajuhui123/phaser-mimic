import { TICKET_COST_PER_MATCH, TICKET_MAX } from '../constants';
import { fullScreenOverlayStyle, primaryButtonStyle } from './overlayStyle';

interface WaitingScreenProps {
    tickets: number;
    onStart: () => void;
}

export function WaitingScreen({ tickets, onStart }: WaitingScreenProps) {
    const canStart = tickets >= TICKET_COST_PER_MATCH;

    return (
        <div style={fullScreenOverlayStyle}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>대기 중</div>
            <div>
                티켓: {tickets} / {TICKET_MAX}
            </div>
            <button style={{ ...primaryButtonStyle, opacity: canStart ? 1 : 0.5 }} onClick={onStart} disabled={!canStart}>
                게임 시작 (티켓 {TICKET_COST_PER_MATCH}개 소모)
            </button>
            {!canStart && <div style={{ marginTop: 8, color: '#e5484d' }}>티켓이 부족합니다</div>}
        </div>
    );
}

export default WaitingScreen;
