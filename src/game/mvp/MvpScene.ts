import { Scene } from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT, mockPlayer, visibleEntities } from './mockData';
import { GameEntity } from './types';

const ROLE_COLOR: Record<GameEntity['role'], number> = {
    player: 0x4ade80,
    seeker: 0xff3b30,
    npc: 0x9aa5b1,
};

const ROLE_RADIUS: Record<GameEntity['role'], number> = {
    player: 18,
    seeker: 22,
    npc: 16,
};

const GRID_SIZE = 64;

export class MvpScene extends Scene {
    constructor() {
        super('MvpScene');
    }

    create() {
        this.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH, MAP_HEIGHT, 0x1b2838);
        this.drawGrid();

        visibleEntities.forEach((entity) => this.drawEntity(entity));

        // 1인칭 시점: 카메라를 player 위치에 고정하되, player 자신은 그리지 않는다.
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.centerOn(mockPlayer.x, mockPlayer.y);
    }

    private drawGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x2a3b4d, 0.6);

        for (let x = 0; x <= MAP_WIDTH; x += GRID_SIZE) {
            graphics.lineBetween(x, 0, x, MAP_HEIGHT);
        }

        for (let y = 0; y <= MAP_HEIGHT; y += GRID_SIZE) {
            graphics.lineBetween(0, y, MAP_WIDTH, y);
        }
    }

    private drawEntity(entity: GameEntity) {
        const color = ROLE_COLOR[entity.role];
        const radius = ROLE_RADIUS[entity.role];

        this.add.circle(entity.x, entity.y, radius, color).setStrokeStyle(2, 0xffffff, 0.9);

        this.add
            .text(entity.x, entity.y - radius - 14, entity.role.toUpperCase(), {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#ffffff',
            })
            .setOrigin(0.5);
    }
}
