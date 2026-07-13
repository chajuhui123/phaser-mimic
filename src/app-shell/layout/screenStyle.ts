import type { CSSProperties } from 'react';
import { APP_ACCENT_COLOR, APP_BACKGROUND_GRADIENT, APP_TEXT_COLOR } from './theme';

// SceneBackground(3D)가 이 뒤를 채우기 전(SSR/로딩 중) 잠깐 보이는 배경.
export const screenShellStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: APP_BACKGROUND_GRADIENT,
};

// SceneBackground보다 위에 그려져야 하므로 position:relative로 별도 스택 컨텍스트를 만든다.
export const screenContentStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    color: APP_TEXT_COLOR,
    fontFamily: 'sans-serif',
    textAlign: 'center',
    boxSizing: 'border-box',
    overflowY: 'auto',
};

export const primaryButtonStyle: CSSProperties = {
    display: 'inline-block',
    minWidth: 200,
    padding: '14px 28px',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: '#2b1a0d',
    background: APP_ACCENT_COLOR,
    border: 'none',
    borderRadius: 8,
    textDecoration: 'none',
    cursor: 'pointer',
};

export const secondaryButtonStyle: CSSProperties = {
    display: 'inline-block',
    minWidth: 140,
    padding: '14px 20px',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: APP_TEXT_COLOR,
    background: 'rgba(0,0,0,0.2)',
    border: `1.5px solid rgba(255,255,255,0.3)`,
    borderRadius: 8,
    cursor: 'pointer',
};
