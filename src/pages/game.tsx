import Head from 'next/head';
import dynamic from 'next/dynamic';

const MvpGameCanvas = dynamic(
    () => import('@/game/mvp/MvpGameCanvas').then((mod) => mod.MvpGameCanvas),
    { ssr: false }
);

export default function GamePage() {
    return (
        <>
            <Head>
                <title>Game - MVP 1</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main style={{ display: 'flex', justifyContent: 'center', padding: '24px', background: '#0b0f1a', minHeight: '100vh' }}>
                <MvpGameCanvas />
            </main>
        </>
    );
}
