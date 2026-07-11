import { forwardRef } from 'react';

export const ProximityWarningOverlay = forwardRef<HTMLDivElement>(function ProximityWarningOverlay(_, ref) {
    return (
        <div
            ref={ref}
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                opacity: 0,
                background: 'radial-gradient(ellipse at center, rgba(229, 72, 77, 0) 55%, rgba(229, 72, 77, 0.65) 100%)',
                transition: 'opacity 80ms linear',
                zIndex: 5,
            }}
        />
    );
});

export default ProximityWarningOverlay;
