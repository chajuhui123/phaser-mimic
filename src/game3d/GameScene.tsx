import { Canvas } from '@react-three/fiber';

const FIXED_CAMERA_POSITION: [number, number, number] = [0, 1.6, 6];
const FLOOR_SIZE = 50;

export function GameScene() {
    return (
        <Canvas
            camera={{ position: FIXED_CAMERA_POSITION, fov: 75 }}
            style={{ width: '100%', height: '100%' }}
        >
            <color attach="background" args={['#0b0f1a']} />

            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} />

            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
                <meshStandardMaterial color="#2a3b4d" />
            </mesh>
        </Canvas>
    );
}

export default GameScene;
