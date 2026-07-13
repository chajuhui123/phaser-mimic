import type { RefObject } from 'react';
import type { Group } from 'three';
import { pickTransformCreature } from './transformCreatures/creatureAppearance';
import { RabbitCreature } from './transformCreatures/RabbitCreature';
import { CatCreature } from './transformCreatures/CatCreature';
import { FrogCreature } from './transformCreatures/FrogCreature';

interface TransformedCreatureProps {
    seed: number;
    trackRef: RefObject<Group>;
}

// 미션 실패 시 "랜덤한 다른 생명체"를 animal.jsx(공유 에셋) 기반 블록 크리처로 표현한다.
// seed 하나로 생명체 종류와 색을 함께 무작위로 고른다.
export function TransformedCreature({ seed, trackRef }: TransformedCreatureProps) {
    const { id, color } = pickTransformCreature(seed);

    if (id === 'cat') return <CatCreature trackRef={trackRef} color={color} />;
    if (id === 'frog') return <FrogCreature trackRef={trackRef} color={color} />;
    return <RabbitCreature trackRef={trackRef} color={color} />;
}

export default TransformedCreature;
