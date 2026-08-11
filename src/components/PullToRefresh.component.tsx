import React, { useCallback, useEffect, useRef, useState } from "react";

interface PullToRefreshProps {
    onRefresh: () => Promise<void> | void;
    children: React.ReactNode;
}

const PULL_THRESHOLD = 70;
const MAX_PULL = 110;

// Gesto de "deslizar hacia abajo" (como Instagram/Gmail) para forzar refresco manual de datos.
// Solo se activa si el usuario está scrolleado hasta arriba de la página.
export function PullToRefresh({ onRefresh, children }: PullToRefreshProps): React.ReactElement {
    const containerRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef<number | null>(null);
    const refreshingRef = useRef(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const handleTouchStart = useCallback((event: TouchEvent) => {
        if (refreshingRef.current || window.scrollY > 0) {
            startYRef.current = null;
            return;
        }
        startYRef.current = event.touches[0].clientY;
    }, []);

    const handleTouchMove = useCallback((event: TouchEvent) => {
        if (startYRef.current === null || refreshingRef.current) return;

        const diff = event.touches[0].clientY - startYRef.current;
        if (diff <= 0) {
            setPullDistance(0);
            return;
        }

        // Evita el rebote nativo del navegador/webview mientras se tira hacia abajo
        if (event.cancelable) event.preventDefault();
        setPullDistance(Math.min(diff, MAX_PULL));
    }, []);

    const handleTouchEnd = useCallback(async () => {
        if (startYRef.current === null) return;
        startYRef.current = null;

        if (pullDistance >= PULL_THRESHOLD && !refreshingRef.current) {
            refreshingRef.current = true;
            setRefreshing(true);
            try {
                await onRefresh();
            } finally {
                refreshingRef.current = false;
                setRefreshing(false);
            }
        }
        setPullDistance(0);
    }, [pullDistance, onRefresh]);

    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        node.addEventListener('touchstart', handleTouchStart, { passive: true });
        node.addEventListener('touchmove', handleTouchMove, { passive: false });
        node.addEventListener('touchend', handleTouchEnd);

        return () => {
            node.removeEventListener('touchstart', handleTouchStart);
            node.removeEventListener('touchmove', handleTouchMove);
            node.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    const indicatorVisible = refreshing || pullDistance > 0;
    const indicatorHeight = refreshing ? 50 : pullDistance;
    const rotationDeg = Math.min(pullDistance / PULL_THRESHOLD, 1) * 360;

    return (
        <div ref={containerRef}>
            {indicatorVisible && (
                <div className="pull-to-refresh__indicator" style={{ height: indicatorHeight }}>
                    <i
                        className={`bi bi-arrow-clockwise pull-to-refresh__icon ${refreshing ? 'pull-to-refresh__icon--spinning' : ''}`}
                        style={refreshing ? undefined : { transform: `rotate(${rotationDeg}deg)` }}
                    />
                </div>
            )}
            {children}
        </div>
    );
}
