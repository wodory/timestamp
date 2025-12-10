import { useState, useCallback } from "react";
import {
    exportVideoWithTimestamp,
    downloadBlob,
    ExportProgress,
} from "@/lib/ffmpeg";
import { DateTime } from "@/lib/time-utils";

export interface UseVideoExportProps {
    videoFile: File | null;
    startDateTime: DateTime | null;
    outputPath?: string; // Not used in logic yet per requirements, but maybe useful later
}

export function useVideoExport() {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState<ExportProgress | null>(null);
    const [lastExportedFilename, setLastExportedFilename] = useState<string | null>(null);

    const exportVideo = useCallback(async (
        videoFile: File,
        startDateTime: DateTime,
        outputPath: string,
    ) => {
        let fileHandle: any = null;
        let outputFilename = outputPath.split(/[/\\]/).pop(); // simple split for filename

        // 1. Prepare Filename
        if (!outputFilename || outputFilename.trim() === "") {
            const originalName = videoFile.name.replace(/\.[^/.]+$/, "");
            outputFilename = `${originalName}_timestamp.mp4`;
        }
        if (!outputFilename.endsWith('.mp4')) {
            outputFilename += '.mp4';
        }

        // 2. Try to show Save Picker immediately (User Gesture context)
        try {
            if ('showSaveFilePicker' in window) {
                fileHandle = await (window as any).showSaveFilePicker({
                    suggestedName: outputFilename,
                    types: [{
                        description: 'MP4 Video',
                        accept: { 'video/mp4': ['.mp4'] },
                    }],
                });
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                return; // User cancelled picker, stop everything.
            }
            console.error("Picker failed, falling back to download:", err);
            // Fallthrough to standard processing + download
        }

        try {
            // 3. Start Processing
            setIsExporting(true);
            setProgress({ ratio: 0, message: "Initializing..." });
            setLastExportedFilename(null);

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

            // 4. Save Result
            if (fileHandle) {
                // Write to picked handle
                const writable = await fileHandle.createWritable();
                await writable.write(exportedBlob);
                await writable.close();
            } else {
                // Fallback download
                downloadBlob(exportedBlob, outputFilename);
            }

            setLastExportedFilename(outputFilename);
            setProgress({ ratio: 1, message: "Export complete!" });
        } catch (error) {
            console.error("Export failed:", error);
            setProgress({
                ratio: 0,
                message: "Export failed. Please try again.",
            });
            // throw error; // Don't throw to UI, just show error state
        } finally {
            setIsExporting(false);
        }
    }, []);

    const resetState = useCallback(() => {
        setIsExporting(false);
        setProgress(null);
        setLastExportedFilename(null);
    }, []);

    return {
        isExporting,
        progress,
        lastExportedFilename,
        exportVideo,
        resetState
    };
}
