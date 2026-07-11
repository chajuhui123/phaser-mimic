export type MatchPhase = 'waiting' | 'countdown' | 'playing' | 'spectating' | 'ended';

export type MatchWinner = 'seeker' | 'hider';

export interface MatchResult {
    winner: MatchWinner;
    reason: string;
}
