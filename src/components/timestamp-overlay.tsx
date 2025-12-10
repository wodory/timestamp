"use client";

/**
 * Timestamp overlay component - Apple Style
 * Displays current date-time timestamp at the center-bottom of the video
 */

interface TimestampOverlayProps {
    timestamp: string;
}

export function TimestampOverlay({ timestamp }: TimestampOverlayProps) {
    if (!timestamp) return null;

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="bg-black/70 px-4 py-2">
                <span className="text-white font-sans text-3xl font-normal leading-none whitespace-nowrap">
                    {timestamp}
                </span>
            </div>
        </div>
    );
}
