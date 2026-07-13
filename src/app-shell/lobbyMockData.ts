// 실제 방/로비 서버가 붙기 전까지 쓰는 목업 데이터. 서버 연동 시 이 파일만 교체하면 된다.
export interface MockLobbyPlayer {
    id: number;
    name: string;
    color: string;
    ready: boolean;
    isYou?: boolean;
}

export const MOCK_ROOM_CODE = '7F3K9Q';
export const MOCK_MAX_PLAYERS = 8;

export const MOCK_LOBBY_PLAYERS: MockLobbyPlayer[] = [
    { id: 1, name: '나', color: '#f2b880', ready: false, isYou: true },
    { id: 2, name: '노바', color: '#a8c968', ready: true },
    { id: 3, name: '카이', color: '#c98fae', ready: true },
];
