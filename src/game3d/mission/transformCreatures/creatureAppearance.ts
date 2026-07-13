// animal.jsx(공유 에셋)의 블록 크리처 3종(토끼/고양이/개구리) 팔레트.
export type TransformCreatureId = 'rabbit' | 'cat' | 'frog';

interface TransformCreatureDef {
    id: TransformCreatureId;
    palette: string[];
}

export const TRANSFORM_CREATURES: TransformCreatureDef[] = [
    { id: 'rabbit', palette: ['#ffffff', '#d7a86e', '#9e9e9e', '#f7b2bd', '#3d3d3d', '#f5f0e6'] },
    { id: 'cat', palette: ['#4a4a4a', '#e8935a', '#f5f0e6', '#3d3d3d', '#9e9e9e', '#d9a13f'] },
    { id: 'frog', palette: ['#7cb85c', '#5a9b4a', '#8fbf6a', '#4a8a3a', '#a3cc7a', '#6fae52'] },
];

export const DARK_ACCENT_COLOR = '#20202a';

interface PickedCreature {
    id: TransformCreatureId;
    color: string;
}

// 하나의 seed로 "어떤 생명체인지"와 "어떤 색인지"를 독립적으로 고른다.
export function pickTransformCreature(seed: number): PickedCreature {
    const creature = TRANSFORM_CREATURES[Math.floor(seed * TRANSFORM_CREATURES.length) % TRANSFORM_CREATURES.length];
    const colorSeed = (seed * 997) % 1;
    const color = creature.palette[Math.floor(colorSeed * creature.palette.length) % creature.palette.length];
    return { id: creature.id, color };
}
