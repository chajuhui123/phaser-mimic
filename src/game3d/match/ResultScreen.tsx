import { TICKET_COST_PER_MATCH } from '../constants';
import { fullScreenOverlayStyle, primaryButtonStyle } from './overlayStyle';
import { MatchResult } from './types';

interface ResultScreenProps {
    result: MatchResult;
    seekerHealth: number;
    contributionScore: number;
    tickets: number;
    onRestart: () => void;
}

export function ResultScreen({ result, seekerHealth, contributionScore, tickets, onRestart }: ResultScreenProps) {
    const canRestart = tickets >= TICKET_COST_PER_MATCH;
    const winnerLabel = result.winner === 'seeker' ? '술래 팀 승리' : '도망자 팀 승리';

    return (
        <div style={fullScreenOverlayStyle}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{winnerLabel}</div>
            <div style={{ marginBottom: 12 }}>{result.reason}</div>
            <div>남은 술래 체력: {seekerHealth}</div>
            <div style={{ marginBottom: 12 }}>도망자 기여도: {Math.floor(contributionScore)}</div>
            <button style={{ ...primaryButtonStyle, opacity: canRestart ? 1 : 0.5 }} onClick={onRestart} disabled={!canRestart}>
                다시 시작 (티켓 {TICKET_COST_PER_MATCH}개 소모)
            </button>
            {!canRestart && <div style={{ marginTop: 8, color: '#e5484d' }}>티켓이 부족합니다</div>}
        </div>
    );
}

export default ResultScreen;
