import Head from "next/head";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <Head>
                <title>NPC 사이의 숨바꼭질</title>
                <meta name="description" content="1인칭 시점 3D 멀티플레이 심리 추리 액션 게임" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    gap: "16px",
                    background: "#0b0f1a",
                    color: "#ffffff",
                    fontFamily: "sans-serif",
                }}
            >
                <h1>NPC 사이의 숨바꼭질</h1>
                <Link href="/game" style={{ color: "#4ade80" }}>
                    게임 시작 →
                </Link>
            </main>
        </>
    );
}
