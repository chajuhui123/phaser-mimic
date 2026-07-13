import Head from "next/head";
import dynamic from "next/dynamic";

const GameScene = dynamic(
  () => import("@/game3d/GameScene").then((mod) => mod.GameScene),
  { ssr: false },
);

export default function GamePage() {
  return (
    <>
      <Head>
        <title>HIDER · SEEKER</title>
      </Head>
      <main style={{ width: "100%", height: "100%", background: "#0b0f1a" }}>
        <GameScene />
      </main>
    </>
  );
}
