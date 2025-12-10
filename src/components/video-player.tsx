"use client";

import { useEffect, useRef, useState } from "react";
import { TimestampOverlay } from "./timestamp-overlay";
import { calculateTimestamp, DateTime } from "@/lib/time-utils";

interface VideoPlayerProps {
    videoUrl: string | null;
    startDateTime: DateTime;
    formatPattern?: string;
}

export function VideoPlayer({ videoUrl, startDateTime, formatPattern = "yyyy-MM-dd HH:mm:ss" }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState<string>("");

    // Calculate timestamp logic extracted for reuse
    const updateTimestamp = (currentTime: number) => {
        const offsetSeconds = Math.floor(currentTime);
        const timestamp = calculateTimestamp(startDateTime, offsetSeconds, formatPattern);
        setCurrentTimestamp(timestamp);
    };

    useEffect(() => {
        const video = videoRef.current;

        // Initial set
        updateTimestamp(video ? video.currentTime : 0);

        if (!video) return;

        const handleTimeUpdate = () => {
            updateTimestamp(video.currentTime);
        };

        // Update timestamp on time updates
        video.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, [startDateTime, formatPattern, videoUrl]); // Re-run if these change

    return (
        <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-sm bg-white aspect-video flex items-center justify-center">
            {videoUrl ? (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain bg-black"
                />
            ) : (
                <div className="text-gray-300 text-sm">
                    {/* Placeholder content if needed, otherwise clean white/empty */}
                </div>
            )}
            <TimestampOverlay timestamp={currentTimestamp} />
        </div>
    );
}
