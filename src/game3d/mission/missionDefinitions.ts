import { MissionDefinition } from './types';

// 새 미션을 추가하려면 이 목록에 정의만 더하면 된다 (로직 변경 불필요).
export const MISSION_DEFINITIONS: MissionDefinition[] = [
    { kind: 'moveToZone', label: '표시된 구역으로 이동하세요' },
    { kind: 'holdStill', label: '제자리에 멈춰 있으세요' },
    { kind: 'jump', label: '점프하세요 (Space)' },
];

export function pickRandomMissionDefinition(): MissionDefinition {
    const index = Math.floor(Math.random() * MISSION_DEFINITIONS.length);
    return MISSION_DEFINITIONS[index];
}
