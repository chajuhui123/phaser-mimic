import Head from "next/head";
import { SplashScreen } from "@/app-shell/SplashScreen";

export default function Home() {
  return (
    <>
      <Head>
        <title>HIDER · SEEKER</title>
        <meta
          name="description"
          content="1인칭 시점 3D 멀티플레이 심리 추리 액션 게임"
        />
      </Head>
      <SplashScreen />
    </>
  );
}
