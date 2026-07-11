import { Canvas } from '@react-three/fiber';
import { NpcActor } from './entities/NpcActor';
import { Simulation } from './Simulation';
import { DebugHud } from './debug/DebugHud';
import { useControlledRole } from './debug/useControlledRole';
import { mockNpcs, mockPlayer, PLAYER_EYE_HEIGHT } from './mockData';

const FLOOR_SIZE = 50;

const INITIAL_CAMERA_POSITION: [number, number, number] = [
    mockPlayer.position.x,
    PLAYER_EYE_HEIGHT,
    mockPlayer.position.z,
];

export function GameScene() {
    const controlledRole = useControlledRole('player');

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <DebugHud controlledRole={controlledRole} />
            <Canvas
                camera={{ position: INITIAL_CAMERA_POSITION, fov: 75 }}
                style={{ width: '100%', height: '100%' }}
            >
                <color attach="background" args={['#0b0f1a']} />

                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1.2} />

                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
                    <meshStandardMaterial color="#2a3b4d" />
                </mesh>

                <Simulation controlledRole={controlledRole} />

                {mockNpcs.map((entity) => (
                    <NpcActor key={entity.id} entity={entity} />
                ))}
            </Canvas>
        </div>
    );
}

export default GameScene;
