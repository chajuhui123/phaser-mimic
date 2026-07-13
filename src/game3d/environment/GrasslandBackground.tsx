const FLOOR_SIZE = 64;
const SKY_COLOR = '#bfe3f5';

// hider_seeker_screen.jsx(공유 에셋)의 저폴리 초원(언덕/나무/바위) 구성을 참고해 만든 배경.
// MAP_BOUNDS(±20)보다 바깥쪽에만 배치해 실제 이동 범위에는 영향을 주지 않는다.
const HILLS = [
    { x: -14, z: 24, rx: 5, ry: 2.2, color: '#a8c968' },
    { x: 6, z: 25, rx: 6, ry: 2.6, color: '#9fc45f' },
    { x: 20, z: 23, rx: 4.5, ry: 2.0, color: '#8fae6a' },
    { x: -24, z: 10, rx: 5.5, ry: 2.4, color: '#9fc45f' },
    { x: -23, z: -8, rx: 5, ry: 2.2, color: '#a8c968' },
    { x: 24, z: -4, rx: 5.5, ry: 2.3, color: '#8fae6a' },
    { x: 15, z: -24, rx: 5, ry: 2.1, color: '#a8c968' },
    { x: -8, z: -25, rx: 6, ry: 2.5, color: '#9fc45f' },
    { x: -20, z: -22, rx: 4.5, ry: 2.0, color: '#8f9bc4' },
    { x: 22, z: 20, rx: 4.5, ry: 2.0, color: '#8f9bc4' },
] as const;

const TREES = [
    { x: -19, z: 21, scale: 1.3, foliage: '#4f8f52' },
    { x: 3, z: 22, scale: 1.1, foliage: '#5aa35b' },
    { x: 21, z: 18, scale: 1.4, foliage: '#4f8f52' },
    { x: -22, z: 2, scale: 1.2, foliage: '#5aa35b' },
    { x: -21, z: -15, scale: 1.3, foliage: '#4f8f52' },
    { x: 18, z: -21, scale: 1.1, foliage: '#5aa35b' },
] as const;

const ROCKS = [
    { x: 24, z: 24, scale: 2.0, rotationY: 0.4, color: '#9aa3b0' },
    { x: -24, z: 24, scale: 1.6, rotationY: 1.1, color: '#8a97ad' },
    { x: -24, z: -24, scale: 2.2, rotationY: 2.0, color: '#9aa3b0' },
    { x: 24, z: -24, scale: 1.8, rotationY: 2.6, color: '#8a97ad' },
] as const;

export function GrasslandBackground() {
    return (
        <>
            <color attach="background" args={[SKY_COLOR]} />
            <fog attach="fog" args={[SKY_COLOR, 20, 48]} />

            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
                <meshStandardMaterial color="#6fae4a" roughness={1} flatShading />
            </mesh>

            {HILLS.map((hill, index) => (
                <mesh key={`hill-${index}`} position={[hill.x, 0, hill.z]} scale={[hill.rx, hill.ry, hill.rx]}>
                    <sphereGeometry args={[1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color={hill.color} roughness={0.95} flatShading />
                </mesh>
            ))}

            {TREES.map((tree, index) => (
                <group key={`tree-${index}`} position={[tree.x, 0, tree.z]} scale={tree.scale}>
                    <mesh position={[0, 0.2, 0]}>
                        <cylinderGeometry args={[0.05, 0.07, 0.4, 6]} />
                        <meshStandardMaterial color="#6b4a3a" roughness={0.9} flatShading />
                    </mesh>
                    <mesh position={[0, 0.55, 0]}>
                        <icosahedronGeometry args={[0.32, 0]} />
                        <meshStandardMaterial color={tree.foliage} roughness={0.85} flatShading />
                    </mesh>
                </group>
            ))}

            {ROCKS.map((rock, index) => (
                <mesh
                    key={`rock-${index}`}
                    position={[rock.x, 0.3, rock.z]}
                    rotation={[0, rock.rotationY, 0]}
                    scale={rock.scale}
                >
                    <coneGeometry args={[1, 1.7, 5]} />
                    <meshStandardMaterial color={rock.color} roughness={0.95} flatShading />
                </mesh>
            ))}
        </>
    );
}

export default GrasslandBackground;
