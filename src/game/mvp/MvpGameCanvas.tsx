import { useLayoutEffect, useRef } from 'react';
import StartMvpGame from './main';

export function MvpGameCanvas() {
    const gameRef = useRef<Phaser.Game | null>(null);

    useLayoutEffect(() => {
        if (gameRef.current === null) {
            gameRef.current = StartMvpGame('mvp-game-container');
        }

        return () => {
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, []);

    return <div id="mvp-game-container" />;
}
