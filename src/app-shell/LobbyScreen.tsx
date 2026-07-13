import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { screenContentStyle, screenShellStyle, primaryButtonStyle, secondaryButtonStyle } from './layout/screenStyle';
import { APP_ACCENT_COLOR, APP_SUBTEXT_COLOR, APP_TEXT_COLOR } from './layout/theme';
import { FADE_TRANSITION_MS } from './constants';
import { MOCK_LOBBY_PLAYERS, MOCK_MAX_PLAYERS, MOCK_ROOM_CODE, MockLobbyPlayer } from './lobbyMockData';

const SceneBackground = dynamic(() => import('./background/SceneBackground').then((mod) => mod.SceneBackground), {
    ssr: false,
});

function PlayerCard({ player }: { player: MockLobbyPlayer | null }) {
    if (!player) {
        return (
            <div
                style={{
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 6,
                    padding: '10px 12px',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.5)',
                }}
            >
                빈 자리
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: player.isYou ? `1px solid ${APP_ACCENT_COLOR}` : '1px solid rgba(255,255,255,0.18)',
                background: player.isYou ? 'rgba(242,184,128,0.14)' : 'rgba(0,0,0,0.2)',
                borderRadius: 6,
                padding: '10px 12px',
            }}
        >
            <div
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: player.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#2b1a0d',
                    flexShrink: 0,
                }}
            >
                {player.name.slice(0, 1)}
            </div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>{player.name}</span>
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: player.ready ? APP_ACCENT_COLOR : 'rgba(255,255,255,0.5)',
                }}
            >
                {player.ready ? '준비완료' : '대기중'}
            </span>
        </div>
    );
}

export function LobbyScreen() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [players, setPlayers] = useState(MOCK_LOBBY_PLAYERS);

    useEffect(() => {
        const rafId = requestAnimationFrame(() => setIsVisible(true));
        return () => cancelAnimationFrame(rafId);
    }, []);

    const you = players.find((player) => player.isYou);
    const allReady = players.length >= 2 && players.every((player) => player.ready);
    const emptySlotCount = Math.max(0, MOCK_MAX_PLAYERS - players.length);
    const slots: (MockLobbyPlayer | null)[] = [...players, ...Array<null>(emptySlotCount).fill(null)];

    const toggleReady = () => {
        setPlayers((prev) => prev.map((player) => (player.isYou ? { ...player, ready: !player.ready } : player)));
    };

    const handleStart = () => {
        if (allReady) router.push('/game');
    };

    return (
        <div
            style={{
                ...screenShellStyle,
                opacity: isVisible ? 1 : 0,
                transition: `opacity ${FADE_TRANSITION_MS}ms ease`,
            }}
        >
            <SceneBackground dim />
            <div style={{ ...screenContentStyle, justifyContent: 'flex-start', paddingTop: 40 }}>
                <h1 style={{ margin: 0, fontSize: 28 }}>로비</h1>

            <div style={{ fontSize: 11, letterSpacing: '0.1em', color: APP_SUBTEXT_COLOR }}>ROOM CODE</div>
            <div
                style={{
                    fontFamily: 'monospace',
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: APP_ACCENT_COLOR,
                    border: `1px solid ${APP_ACCENT_COLOR}`,
                    borderRadius: 6,
                    padding: '8px 20px',
                }}
            >
                {MOCK_ROOM_CODE}
            </div>

            <div
                style={{
                    width: '100%',
                    maxWidth: 340,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 8,
                }}
            >
                {slots.map((player, index) => (
                    <PlayerCard key={player ? player.id : `empty-${index}`} player={player} />
                ))}
            </div>

            <div style={{ fontSize: 12, color: APP_SUBTEXT_COLOR }}>
                {players.length} / {MOCK_MAX_PLAYERS} · 역할은 게임 시작 시 무작위로 배정됩니다
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 340 }}>
                <button
                    onClick={toggleReady}
                    style={{
                        ...secondaryButtonStyle,
                        flex: 1,
                        borderColor: you?.ready ? APP_ACCENT_COLOR : 'rgba(255,255,255,0.3)',
                        color: you?.ready ? APP_ACCENT_COLOR : APP_TEXT_COLOR,
                    }}
                >
                    {you?.ready ? '준비 취소' : '준비하기'}
                </button>
                <button
                    onClick={handleStart}
                    disabled={!allReady}
                    style={{ ...primaryButtonStyle, flex: 1, opacity: allReady ? 1 : 0.5, cursor: allReady ? 'pointer' : 'not-allowed' }}
                >
                    게임 시작
                </button>
            </div>
            </div>
        </div>
    );
}

export default LobbyScreen;
