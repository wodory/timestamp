"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video-player";
import { extractStartTimestamp } from "@/lib/metadata-extractor";
import {
  parseDateTime,
  formatDateTime,
  isValidDateTimeFormat,
  DateTime,
} from "@/lib/time-utils";
import { useVideoExport } from "@/hooks/use-video-export";

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dateTimeInput, setDateTimeInput] = useState<string>("");
  const [startDateTime, setStartDateTime] = useState<DateTime | null>(null);

  // Inspector state
  const [subtitleFormat, setSubtitleFormat] = useState<string>("yyyy-MM-dd HH:mm:ss");
  const [outputPath, setOutputPath] = useState<string>("");

  const { isExporting, progress, lastExportedFilename, exportVideo, resetState } = useVideoExport();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous states when new file selected
    setVideoFile(file);
    resetState();

    // Set default output filename
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setOutputPath(`${nameWithoutExt}_timestamp.mp4`);

    // Create object URL (revoke previous if existed ideally, but for now simple replacement)
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Try to extract timestamp
    const result = await extractStartTimestamp(file);

    if (result.startDateTime !== null) {
      setStartDateTime(result.startDateTime);
      // Format as expected in subtitles? logic suggests input is for subtitle format?
      // User Req 2: "Input subtitle format... Preview"
      // User Req 2 example: "[ yy-mm-dd hh:mm:ss ]" -> Preview content
      // We'll keep the actual start time in `startDateTime` state.
      // `dateTimeInput` was used for Manual Input in previous version.
      // We might still need it if extraction fails.
      // Let's assume for now we use the extracted time.
    }
  };

  const handleExportClick = async () => {
    if (!videoFile || !startDateTime) return;

    // Pass format pattern to export logic if supported (Task for later: update export logic to support custom format)
    // For now, existing logic uses "YYYY/MM/DD".
    // We will update exportVideo signature eventually or assume standard for now.
    // The user didn't explicitly ask for the *exported* video to match the custom format yet (only "preview on player"),
    // but it is implied "Input subtitle format...".
    // I should probably pass this to exportVideo eventually.

    await exportVideo(videoFile, startDateTime, outputPath);
  };

  // If no startDateTime is set yet (app just loaded), show current time for demo/preview
  // or a placeholder time. User Req 0: "Initial screen white + subtitle format display"
  const displayDateTime = startDateTime || {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    second: new Date().getSeconds()
  };


  return (
    <div className="flex h-screen w-full flex-col bg-[#f5f5f7] dark:bg-[#000000] overflow-hidden">
      {/* 0. Title */}
      <div className="flex-none px-4 py-3 border-b border-[#d2d2d7]">
        <h1 className="text-[20px] font-bold text-[#1d1d1f] dark:text-white">
          Video Timestamp
        </h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 1. Left: Video (Main Content) */}
        <div className="flex-1 bg-black flex items-center justify-center p-4 relative">
          <div className="w-full h-full flex items-center justify-center">
            <VideoPlayer
              videoUrl={videoUrl}
              startDateTime={displayDateTime}
              formatPattern={subtitleFormat}
            />
          </div>
        </div>

        {/* 1. Right: Inspector (150px) */}
        <div className="w-[250px] flex-none bg-white dark:bg-[#1d1d1f] border-l border-[#d2d2d7] dark:border-[#424245] flex flex-col overflow-y-auto">
          <div className="p-4 space-y-6">

            {/* 1. Select Video */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                1. Select Video
              </Label>
              <div className="space-y-2">
                <Label
                  htmlFor="video-upload-inspector"
                  className={`
                                block w-full py-2 px-3 text-center text-sm font-medium rounded-md cursor-pointer transition-colors
                                ${isExporting
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#0071e3] text-white hover:bg-[#0077ed]"
                    }
                            `}
                >
                  Select File
                </Label>
                <Input
                  id="video-upload-inspector"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={isExporting}
                  className="hidden"
                />
                {videoFile && (
                  <p className="text-xs text-gray-900 dark:text-gray-100 break-all border border-gray-200 rounded p-2 bg-gray-50">
                    {videoFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Subtitle Format */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                2. Subtitle Format
              </Label>
              <Input
                value={subtitleFormat}
                onChange={(e) => setSubtitleFormat(e.target.value)}
                disabled={isExporting}
                className="text-xs font-mono h-8"
              />
            </div>

            {/* 3. Output Path */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                3. Output Path/Name
              </Label>
              <Input
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                placeholder="path/filename.mp4"
                disabled={isExporting}
                className="text-xs h-8"
              />
            </div>

            {/* 4. Action */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                4. Export
              </Label>
              <Button
                onClick={handleExportClick}
                disabled={isExporting || !videoFile}
                variant={isExporting ? "secondary" : "default"}
                className="w-full h-8 text-xs"
              >
                {isExporting ? `Making... ${(progress?.ratio ? Math.round(progress.ratio * 100) : 0)}%` : "Create Video"}
              </Button>

              {lastExportedFilename && !isExporting && (
                <div className="text-xs text-green-600 mt-2 font-medium animate-in fade-in slide-in-from-top-1">
                  {lastExportedFilename} created.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
