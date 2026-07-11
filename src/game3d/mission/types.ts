export type MissionKind = 'moveToZone' | 'holdStill' | 'jump';

export type MissionPhase = 'waiting' | 'mission' | 'transformed';

export interface MissionDefinition {
    kind: MissionKind;
    label: string;
}

export interface ZonePosition {
    x: number;
    z: number;
}

export interface ActiveMission extends MissionDefinition {
    zonePosition?: ZonePosition;
}
