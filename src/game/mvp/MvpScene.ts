import { Scene } from 'phaser';
import {
    MAP_WIDTH,
    MAP_HEIGHT,
    ROLE_SPEED,
    createPlayerState,
    createAutoMovingEntities,
    randomDirectionChangeInterval,
} from './mockData';
import { GameEntity, MovingEntity } from './types';

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

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

interface EntityView {
    entity: MovingEntity;
    circle: Phaser.GameObjects.Arc;
    label: Phaser.GameObjects.Text;
}

export class MvpScene extends Scene {
    private player!: GameEntity;
    private views: EntityView[] = [];
    private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

    constructor() {
        super('MvpScene');
    }

    create() {
        this.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH, MAP_HEIGHT, 0x1b2838);
        this.drawGrid();

        this.player = createPlayerState();
        this.views = createAutoMovingEntities().map((entity) => this.createEntityView(entity));

        // 1인칭 시점: 카메라를 player 위치에 고정하되, player 자신은 그리지 않는다.
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.centerOn(this.player.x, this.player.y);

        this.cursorKeys = this.input.keyboard!.createCursorKeys();
        this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D') as Record<
            'W' | 'A' | 'S' | 'D',
            Phaser.Input.Keyboard.Key
        >;
    }

    update(_time: number, delta: number) {
        const deltaSeconds = delta / 1000;

        this.updatePlayer(deltaSeconds);
        this.updateAutoMovingEntities(deltaSeconds, delta);

        this.cameras.main.centerOn(this.player.x, this.player.y);
    }

    private updatePlayer(deltaSeconds: number) {
        const left = this.cursorKeys.left.isDown || this.wasdKeys.A.isDown;
        const right = this.cursorKeys.right.isDown || this.wasdKeys.D.isDown;
        const up = this.cursorKeys.up.isDown || this.wasdKeys.W.isDown;
        const down = this.cursorKeys.down.isDown || this.wasdKeys.S.isDown;

        let dx = (right ? 1 : 0) - (left ? 1 : 0);
        let dy = (down ? 1 : 0) - (up ? 1 : 0);

        if (dx !== 0 && dy !== 0) {
            const norm = Math.SQRT1_2;
            dx *= norm;
            dy *= norm;
        }

        const speed = ROLE_SPEED.player;
        const radius = ROLE_RADIUS.player;

        this.player.x = clamp(
            this.player.x + dx * speed * deltaSeconds,
            radius,
            MAP_WIDTH - radius
        );
        this.player.y = clamp(
            this.player.y + dy * speed * deltaSeconds,
            radius,
            MAP_HEIGHT - radius
        );
    }

    private updateAutoMovingEntities(deltaSeconds: number, deltaMs: number) {
        this.views.forEach(({ entity, circle, label }) => {
            entity.directionChangeInMs -= deltaMs;
            if (entity.directionChangeInMs <= 0) {
                entity.direction = Math.random() * Math.PI * 2;
                entity.directionChangeInMs = randomDirectionChangeInterval();
            }

            const speed = ROLE_SPEED[entity.role];
            const radius = ROLE_RADIUS[entity.role];

            let nextX = entity.x + Math.cos(entity.direction) * speed * deltaSeconds;
            let nextY = entity.y + Math.sin(entity.direction) * speed * deltaSeconds;

            if (nextX < radius || nextX > MAP_WIDTH - radius) {
                entity.direction = Math.PI - entity.direction;
                nextX = clamp(nextX, radius, MAP_WIDTH - radius);
            }

            if (nextY < radius || nextY > MAP_HEIGHT - radius) {
                entity.direction = -entity.direction;
                nextY = clamp(nextY, radius, MAP_HEIGHT - radius);
            }

            entity.x = nextX;
            entity.y = nextY;

            circle.setPosition(entity.x, entity.y);
            label.setPosition(entity.x, entity.y - radius - 14);
        });
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

    private createEntityView(entity: MovingEntity): EntityView {
        const color = ROLE_COLOR[entity.role];
        const radius = ROLE_RADIUS[entity.role];

        const circle = this.add
            .circle(entity.x, entity.y, radius, color)
            .setStrokeStyle(2, 0xffffff, 0.9);

        const label = this.add
            .text(entity.x, entity.y - radius - 14, entity.role.toUpperCase(), {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#ffffff',
            })
            .setOrigin(0.5);

        return { entity, circle, label };
    }
}
