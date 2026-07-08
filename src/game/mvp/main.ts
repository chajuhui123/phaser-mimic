import { AUTO, Game, Types } from 'phaser';
import { MvpScene } from './MvpScene';

const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'mvp-game-container',
    backgroundColor: '#0b0f1a',
    scene: [MvpScene],
};

const StartMvpGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartMvpGame;
