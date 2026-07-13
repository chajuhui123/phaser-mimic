import { Role } from "./types";

export const ROLE_SPEED: Record<Role, number> = {
  player: 4.5,
  seeker: 4.2,
  npc: 1.6,
};

export const MAP_BOUNDS = {
  minX: -20,
  maxX: 20,
  minZ: -20,
  maxZ: 20,
};

const NPC_DIRECTION_CHANGE_INTERVAL_MS: [number, number] = [1200, 2600];

export function randomNpcDirection(): number {
  return Math.random() * Math.PI * 2;
}

export function randomNpcDirectionChangeInterval(): number {
  const [min, max] = NPC_DIRECTION_CHANGE_INTERVAL_MS;
  return min + Math.random() * (max - min);
}

// 완전한 1인칭이 아니라, 자신 캐릭터의 뒷통수가 "살짝" 보이는 카메라를 쓴다.
// 화면을 꽉 채우지 않도록 머리에서 충분히 멀리 떨어뜨려 작게 보이게 한다.
export const CAMERA_HEIGHT_ABOVE_GROUND = 5.5;
export const CAMERA_BEHIND_OFFSET = 2.0;

export const SEEKER_MAX_HEALTH = 5;
export const ATTACK_RANGE = 2.5;
export const WARNING_RANGE = 6;
export const CONTRIBUTION_RATE_PER_SEC = 10;

export const MISSION_INTERVAL_MS = 20000;
export const MISSION_TIME_LIMIT_MS = 8000;
export const FORCED_TRANSFORM_DURATION_MS = 5000;
export const MISSION_ZONE_RADIUS = 2;
export const HOLD_STILL_REQUIRED_MS = 3000;
export const JUMP_HEIGHT = 1.2;
export const JUMP_DURATION_MS = 500;

export const TICKET_MAX = 50;
export const TICKET_COST_PER_MATCH = 5;
// 실제로는 1시간당 1개지만, 로컬 개발/테스트에서 확인 가능하도록 짧게 잡는다.
export const TICKET_REFILL_INTERVAL_MS = 30000;

export const COUNTDOWN_SECONDS = 3;
export const MATCH_DURATION_MS = 5 * 60 * 1000;
export const SPECTATE_DURATION_MS = 2000;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
