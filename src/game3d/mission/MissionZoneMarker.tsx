import { DoubleSide } from 'three';
import { MISSION_ZONE_RADIUS } from '../constants';
import { ZonePosition } from './types';

interface MissionZoneMarkerProps {
    position: ZonePosition;
}

export function MissionZoneMarker({ position }: MissionZoneMarkerProps) {
    return (
        <mesh position={[position.x, 0.02, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[MISSION_ZONE_RADIUS - 0.3, MISSION_ZONE_RADIUS, 32]} />
            <meshBasicMaterial color="#facc15" transparent opacity={0.8} side={DoubleSide} />
        </mesh>
    );
}

export default MissionZoneMarker;
