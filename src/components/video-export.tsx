"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    exportVideoWithTimestamp,
    downloadBlob,
    ExportProgress,
} from "@/lib/ffmpeg";
import { DateTime } from "@/lib/time-utils";

interface VideoExportProps {
    videoFile: File;
    startDateTime: DateTime;
}

export function VideoExport({ videoFile, startDateTime }: VideoExportProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState<ExportProgress | null>(null);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            setProgress({ ratio: 0, message: "Initializing..." });

            // Convert DateTime to startTimeSeconds for FFmpeg
            const date = new Date(
                startDateTime.year,
                startDateTime.month - 1,
                startDateTime.day,
                startDateTime.hour,
                startDateTime.minute,
                startDateTime.second
            );
            const startTimeSeconds =
                startDateTime.hour * 3600 +
                startDateTime.minute * 60 +
                startDateTime.second;

            // Format date as YYYY/MM/DD
            const dateText = `${startDateTime.year}/${String(startDateTime.month).padStart(
                2,
                "0"
            )}/${String(startDateTime.day).padStart(2, "0")}`;

            const exportedBlob = await exportVideoWithTimestamp(
                videoFile,
                startTimeSeconds,
                dateText,
                (progress) => {
                    setProgress(progress);
                }
            );

            // Generate output filename
            const originalName = videoFile.name.replace(/\.[^/.]+$/, "");
            const outputFilename = `${originalName}_with_timestamp.mp4`;

            downloadBlob(exportedBlob, outputFilename);

            setProgress({ ratio: 1, message: "Export complete!" });
        } catch (error) {
            console.error("Export failed:", error);
            setProgress({
                ratio: 0,
                message: "Export failed. Please try again.",
            });
        } finally {
            setTimeout(() => {
                setIsExporting(false);
                setProgress(null);
            }, 2000);
        }
    };

    return (
        <div className="space-y-4">
            <Button
                onClick={handleExport}
                disabled={isExporting}
                size="lg"
                className="w-full text-base font-medium rounded-xl h-12 shadow-sm"
            >
                {isExporting ? "Exporting..." : "Export Video with Timestamp"}
            </Button>

            {progress && (
                <div className="space-y-2">
                    <Progress value={progress.ratio * 100} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground font-medium">
                        {progress.message}
                    </p>
                </div>
            )}
        </div>
    );
}
