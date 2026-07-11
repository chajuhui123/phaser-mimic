import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type Group } from 'three';
import { RoleGeometry } from './entities/RoleGeometry';
import { useKeyboardState } from './controls/useKeyboardState';
import { usePointerLookControls } from './controls/usePointerLookControls';
import { mockPlayer, mockSeeker, PLAYER_EYE_HEIGHT } from './mockData';
import { MAP_BOUNDS, ROLE_SPEED, clamp } from './constants';
import { ControllableRole } from './debug/useControlledRole';

const tmpForward = new Vector3();
const tmpRight = new Vector3();

interface SimulationProps {
    controlledRole: ControllableRole;
}

export function Simulation({ controlledRole }: SimulationProps) {
    const { camera } = useThree();
    const keysRef = useKeyboardState();
    usePointerLookControls();

    const playerRef = useRef<Group>(null!);
    const seekerRef = useRef<Group>(null!);

    useFrame((_, delta) => {
        const activeGroup = controlledRole === 'player' ? playerRef.current : seekerRef.current;
        if (!activeGroup) return;

        camera.getWorldDirection(tmpForward);
        tmpForward.y = 0;
        tmpForward.normalize();
        tmpRight.crossVectors(tmpForward, camera.up).normalize();

        const keys = keysRef.current;
        let moveX = 0;
        let moveZ = 0;
        if (keys.KeyW || keys.ArrowUp) {
            moveX += tmpForward.x;
            moveZ += tmpForward.z;
        }
        if (keys.KeyS || keys.ArrowDown) {
            moveX -= tmpForward.x;
            moveZ -= tmpForward.z;
        }
        if (keys.KeyD || keys.ArrowRight) {
            moveX += tmpRight.x;
            moveZ += tmpRight.z;
        }
        if (keys.KeyA || keys.ArrowLeft) {
            moveX -= tmpRight.x;
            moveZ -= tmpRight.z;
        }

        const length = Math.hypot(moveX, moveZ);
        if (length > 0) {
            const speed = ROLE_SPEED[controlledRole];
            const scale = (speed * delta) / length;
            activeGroup.position.x = clamp(activeGroup.position.x + moveX * scale, MAP_BOUNDS.minX, MAP_BOUNDS.maxX);
            activeGroup.position.z = clamp(activeGroup.position.z + moveZ * scale, MAP_BOUNDS.minZ, MAP_BOUNDS.maxZ);
        }

        camera.position.set(activeGroup.position.x, PLAYER_EYE_HEIGHT, activeGroup.position.z);
    });

    return (
        <>
            <group ref={playerRef} position={[mockPlayer.position.x, mockPlayer.position.y, mockPlayer.position.z]}>
                {controlledRole !== 'player' && <RoleGeometry role="player" />}
            </group>
            <group ref={seekerRef} position={[mockSeeker.position.x, mockSeeker.position.y, mockSeeker.position.z]}>
                {controlledRole !== 'seeker' && <RoleGeometry role="seeker" />}
            </group>
        </>
    );
}

export default Simulation;
