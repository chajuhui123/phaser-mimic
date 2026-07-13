import { useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

const MOVE_EPSILON = 0.0009;
const ROTATE_LERP_RATE = 10;

// BlockCharacter와 변신 크리처가 공통으로 쓰는 "이동 방향을 자동으로 바라보기" 로직.
// trackRef가 실제로 움직일 때만 heading을 갱신하고, 멈추면 마지막 방향을 유지한다.
// facing이 주어지면(예: 정지된 장식용 캐릭터) 이동이 없을 때 그 방향을 대신 사용한다.
export function useMovementFacing(trackRef: RefObject<Group>, facing?: number) {
    const lastPos = useRef(new Vector3());
    const initialized = useRef(false);
    const headingRef = useRef(0);
    const isMovingRef = useRef(false);

    useFrame((_, delta) => {
        const group = trackRef.current;
        if (!group) return;

        if (!initialized.current) {
            lastPos.current.copy(group.position);
            initialized.current = true;
        }

        const dx = group.position.x - lastPos.current.x;
        const dz = group.position.z - lastPos.current.z;
        const moveLen = Math.hypot(dx, dz);
        lastPos.current.copy(group.position);

        isMovingRef.current = moveLen > MOVE_EPSILON;
        if (isMovingRef.current) {
            headingRef.current = Math.atan2(dx, dz);
        } else if (facing !== undefined) {
            headingRef.current = facing;
        }

        let diff = (headingRef.current - group.rotation.y) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        group.rotation.y += diff * Math.min(1, ROTATE_LERP_RATE * delta);
    });

    return isMovingRef;
}
