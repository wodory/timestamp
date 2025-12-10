"use client";

/**
 * FFmpeg.wasm wrapper for video encoding with timestamp overlay
 */

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

export interface ExportProgress {
    ratio: number;
    message: string;
}

/**
 * Initialize FFmpeg instance
 * @param onProgress - Progress callback
 * @returns FFmpeg instance
 */
export async function initFFmpeg(
    onProgress?: (progress: ExportProgress) => void
): Promise<FFmpeg> {
    if (ffmpegInstance) {
        return ffmpegInstance;
    }

    const ffmpeg = new FFmpeg();

    // Set up progress logging
    ffmpeg.on("log", ({ message }) => {
        console.log(message);
    });

    if (onProgress) {
        ffmpeg.on("progress", ({ progress, time }) => {
            onProgress({
                ratio: progress,
                message: `Processing... ${Math.round(progress * 100)}%`,
            });
        });
    }

    // Load FFmpeg WASM files from CDN
    const baseURL = "/ffmpeg";
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
}

/**
 * Export video with burned-in timestamp overlay
 * @param videoFile - Source video file
 * @param startTimeSeconds - Starting timestamp in seconds
 * @param onProgress - Progress callback
 * @returns Exported video blob
 */
export async function exportVideoWithTimestamp(
    videoFile: File,
    startTimeSeconds: number,
    dateText: string, // New parameter for date string
    onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
    const ffmpeg = await initFFmpeg(onProgress);

    onProgress?.({ ratio: 0, message: "Loading video file..." });

    // Write input file to FFmpeg virtual filesystem
    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";

    const arrayBuffer = await videoFile.arrayBuffer();
    await ffmpeg.writeFile(inputFileName, new Uint8Array(arrayBuffer));

    onProgress?.({ ratio: 0.1, message: "Preparing timestamp overlay..." });

    // Load font
    // Ensure the font file exists at public/fonts/arial.ttf
    await ffmpeg.writeFile("arial.ttf", await fetchFile("/fonts/arial.ttf"));

    // Create drawtext filter for timestamp overlay
    // Position: center-bottom with padding
    // Style: white text with black background
    // Update: text value wrapped in single quotes, using seconds for offset to avoid log warnings
    // prepend dateText if provided
    const displayText = dateText
        ? `${dateText} %{pts\\:hms\\:${Math.floor(startTimeSeconds)}}`
        : `%{pts\\:hms\\:${Math.floor(startTimeSeconds)}}`;

    const drawTextFilter = [
        `drawtext=fontfile=arial.ttf`,
        `text='${displayText}'`,
        `fontcolor=white`,
        `fontsize=48`,
        `box=1`,
        `boxcolor=black@0.7`,
        `boxborderw=10`,
        `x=(w-text_w)/2`,
        `y=h-th-40`,
    ].join(":");

    onProgress?.({ ratio: 0.2, message: "Encoding video..." });

    // Run FFmpeg with drawtext filter
    await ffmpeg.exec([
        "-i",
        inputFileName,
        "-preset",
        "ultrafast",
        "-vf",
        drawTextFilter,
        "-codec:a",
        "copy",
        "-y",
        outputFileName,
    ]);

    onProgress?.({ ratio: 0.9, message: "Finalizing..." });

    // Read output file
    const data = await ffmpeg.readFile(outputFileName);

    // Clean up
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    onProgress?.({ ratio: 1.0, message: "Complete!" });

    // Return as Blob
    // @ts-ignore - FFmpeg's FileData type (Uint8Array | string) is compatible with Blob at runtime
    return new Blob([data], { type: "video/mp4" });
}

/**
 * Download blob as file
 * @param blob - Blob to download
 * @param filename - Output filename
 */
export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
