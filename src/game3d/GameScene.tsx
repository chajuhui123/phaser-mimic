import { Canvas } from '@react-three/fiber';
import { RoleMesh } from './entities/RoleMesh';
import { mockEntities, mockPlayer, PLAYER_EYE_HEIGHT } from './mockData';

const FLOOR_SIZE = 50;

const FIXED_CAMERA_POSITION: [number, number, number] = [
    mockPlayer.position.x,
    PLAYER_EYE_HEIGHT,
    mockPlayer.position.z,
];

const visibleEntities = mockEntities.filter((entity) => entity.role !== 'player');

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

            {visibleEntities.map((entity) => (
                <RoleMesh key={entity.id} entity={entity} />
            ))}
        </Canvas>
    );
}

export default GameScene;
