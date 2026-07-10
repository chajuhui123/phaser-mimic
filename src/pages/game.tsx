import Head from 'next/head';
import dynamic from 'next/dynamic';

const GameScene = dynamic(
    () => import('@/game3d/GameScene').then((mod) => mod.GameScene),
    { ssr: false }
);

export default function GamePage() {
    return (
        <>
            <Head>
                <title>Game - MVP 1</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main style={{ width: '100vw', height: '100vh', background: '#0b0f1a' }}>
                <GameScene />
            </main>
        </>
    );
}
