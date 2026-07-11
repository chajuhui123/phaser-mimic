import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PITCH_LIMIT, POINTER_LOOK_SENSITIVITY, clamp } from '../constants';

export function usePointerLookControls() {
    const { camera, gl } = useThree();

    useEffect(() => {
        camera.rotation.order = 'YXZ';

        const canvas = gl.domElement;
        let yaw = camera.rotation.y;
        let pitch = camera.rotation.x;

        const requestLock = () => {
            void canvas.requestPointerLock()?.catch(() => {
                // 헤드리스 환경/권한 정책 등으로 포인터 락이 거부될 수 있다. 조작 없이 무시한다.
            });
        };
        const handleMouseMove = (event: MouseEvent) => {
            if (document.pointerLockElement !== canvas) return;
            yaw -= event.movementX * POINTER_LOOK_SENSITIVITY;
            pitch = clamp(pitch - event.movementY * POINTER_LOOK_SENSITIVITY, -PITCH_LIMIT, PITCH_LIMIT);
            camera.rotation.set(pitch, yaw, 0, 'YXZ');
        };

        canvas.addEventListener('click', requestLock);
        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            canvas.removeEventListener('click', requestLock);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [camera, gl]);
}
