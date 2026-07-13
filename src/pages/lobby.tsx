import Head from "next/head";
import { LobbyScreen } from "@/app-shell/LobbyScreen";

export default function Lobby() {
  return (
    <>
      <Head>
        <title>HIDER · SEEKER</title>
      </Head>
      <LobbyScreen />
    </>
  );
}
