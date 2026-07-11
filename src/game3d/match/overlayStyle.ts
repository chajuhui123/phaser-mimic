import type { CSSProperties } from 'react';

export const fullScreenOverlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(11, 15, 26, 0.85)',
    color: '#fff',
    fontFamily: 'monospace',
    zIndex: 20,
    textAlign: 'center',
};

export const primaryButtonStyle: CSSProperties = {
    marginTop: 12,
    padding: '10px 20px',
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#0b0f1a',
    background: '#facc15',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
};
