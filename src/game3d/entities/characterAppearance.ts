import { Role } from '../types';

// character.jsx(공유 에셋)의 블록 리그 구조를 게임 월드 스케일(카메라 높이 ~1.85 기준)에 맞게 축소한 치수.
export const CHARACTER_PROPORTIONS = {
    LEG_H: 0.78,
    LEG_W: 0.3,
    LEG_D: 0.3,
    TORSO_W: 0.58,
    TORSO_H: 0.58,
    TORSO_D: 0.32,
    ARM_W: 0.22,
    ARM_D: 0.22,
    ARM_H: 0.58,
    HEAD: 0.34,
} as const;

const { LEG_H, TORSO_H, HEAD } = CHARACTER_PROPORTIONS;

export const HIP_Y = LEG_H;
export const TORSO_CENTER_Y = HIP_Y + TORSO_H / 2;
export const SHOULDER_Y = TORSO_CENTER_Y + TORSO_H / 2 - 0.02;
export const HEAD_CENTER_Y = TORSO_CENTER_Y + TORSO_H / 2 + HEAD / 2;
export const HEAD_TOP_Y = HEAD_CENTER_Y + HEAD / 2;

interface RolePalette {
    skin: string;
    shirt: string;
    pants: string;
}

export const ROLE_PALETTE: Record<Role, RolePalette> = {
    player: { skin: '#e0ac69', shirt: '#4ade80', pants: '#33415c' },
    seeker: { skin: '#e0ac69', shirt: '#e5484d', pants: '#2c2c2c' },
    npc: { skin: '#c68642', shirt: '#8f9bb3', pants: '#3a3a3a' },
};

export const EYE_COLOR = '#1a1a1a';

// 술래(seeker)만 드는 총. 팔 pivot(어깨) 기준 로컬 좌표 — 팔 끝(손) 근처에 오도록 y를 낮게 잡는다.
export const GUN_GEOMETRY = { width: 0.05, height: 0.05, length: 0.22 } as const;
export const GUN_LOCAL_POSITION: [number, number, number] = [0, -0.5, 0.14];
