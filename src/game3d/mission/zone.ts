import { MAP_BOUNDS, clamp } from '../constants';
import { ZonePosition } from './types';

const MIN_ZONE_DISTANCE = 5;
const MAX_ZONE_DISTANCE = 12;

// 미션 제한 시간 안에 도달 가능하도록, hider 현재 위치를 중심으로 적당히 가까운 지점을 고른다.
export function randomZonePosition(center: ZonePosition): ZonePosition {
    const angle = Math.random() * Math.PI * 2;
    const distance = MIN_ZONE_DISTANCE + Math.random() * (MAX_ZONE_DISTANCE - MIN_ZONE_DISTANCE);

    return {
        x: clamp(center.x + Math.cos(angle) * distance, MAP_BOUNDS.minX, MAP_BOUNDS.maxX),
        z: clamp(center.z + Math.sin(angle) * distance, MAP_BOUNDS.minZ, MAP_BOUNDS.maxZ),
    };
}
