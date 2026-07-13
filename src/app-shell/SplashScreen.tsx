import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import {
  screenContentStyle,
  screenShellStyle,
  primaryButtonStyle,
} from "./layout/screenStyle";
import { APP_ACCENT_COLOR, APP_SUBTEXT_COLOR } from "./layout/theme";
import { FADE_TRANSITION_MS } from "./constants";
import { PlayIcon } from "./icons";

const SceneBackground = dynamic(
  () =>
    import("./background/SceneBackground").then((mod) => mod.SceneBackground),
  {
    ssr: false,
  },
);

export function SplashScreen() {
  const router = useRouter();
  const [isFadingOut, setIsFadingOut] = useState(false);
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (navigateTimer.current) clearTimeout(navigateTimer.current);
    },
    [],
  );

  const handleStart = () => {
    setIsFadingOut(true);
    navigateTimer.current = setTimeout(
      () => router.push("/lobby"),
      FADE_TRANSITION_MS,
    );
  };

  return (
    <div
      style={{
        ...screenShellStyle,
        opacity: isFadingOut ? 0 : 1,
        transition: `opacity ${FADE_TRANSITION_MS}ms ease`,
      }}
    >
      <SceneBackground />
      {/* 위쪾 절반은 3D 비네트가 보이도록, 문구/버튼은 화면 아래쪽에만 배치한다. */}
      <div
        style={{
          ...screenContentStyle,
          justifyContent: "flex-end",
          paddingBottom: 48,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "#f2e3d1",
            textTransform: "uppercase",
            border: `1px solid ${APP_ACCENT_COLOR}80`,
            borderRadius: 3,
            padding: "5px 14px",
          }}
        >
          1인칭 심리 추리 액션
        </div>
        <h1
          style={{
            margin: 0,
            lineHeight: 1.1,
            fontSize: "clamp(32px, 9vw, 52px)",
            letterSpacing: "0.01em",
            textShadow: "0 2px 20px rgba(0,0,0,0.35)",
          }}
        >
          HIDER · SEEKER
        </h1>
        {/* <p style={{ margin: 0, color: APP_SUBTEXT_COLOR, fontSize: 14 }}>
          1인칭 시점 3D 멀티플레이 심리 추리 액션 게임
        </p> */}
        <button
          onClick={handleStart}
          disabled={isFadingOut}
          style={{
            ...primaryButtonStyle,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <PlayIcon size={15} /> 시작하기
        </button>
      </div>
    </div>
  );
}

export default SplashScreen;
