/**
 * Video metadata extraction utility
 * Extracts full date-time from Tesla dashcam filename
 * Format: YYYY-MM-DD_HH-MM-SS-camera.mp4
 */

import { DateTime } from "./time-utils";

export interface TimestampExtractionResult {
    startDateTime: DateTime | null;
    source: "filename" | "none";
    rawValue?: string;
}

/**
 * Extract start date-time from video file
 * @param file - Video file to extract metadata from
 * @returns Extraction result with start date-time and source
 */
export async function extractStartTimestamp(
    file: File
): Promise<TimestampExtractionResult> {
    // Attempt 1: Parse from filename (Tesla dashcam format)
    const filenameResult = parseFilename(file.name);
    if (filenameResult !== null) {
        return {
            startDateTime: filenameResult.dateTime,
            source: "filename",
            rawValue: filenameResult.dateTimeString,
        };
    }

    // Attempt 2: No automatic extraction possible
    return {
        startDateTime: null,
        source: "none",
    };
}

/**
 * Parse Tesla dashcam filename format: YYYY-MM-DD_HH-MM-SS-camera.mp4
 * @param filename - File name to parse
 * @returns DateTime and formatted string, or null if pattern doesn't match
 */
function parseFilename(
    filename: string
): { dateTimeString: string; dateTime: DateTime } | null {
    // Tesla dashcam pattern: 2025-12-08_20-11-05-right_repeater.mp4
    const teslaPattern =
        /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})-[a-z_]+\.mp4$/i;
    const match = filename.match(teslaPattern);

    if (match) {
        const [, year, month, day, hours, minutes, seconds] = match.map((val) =>
            parseInt(val, 10)
        );

        // Validate values
        if (
            isNaN(year) ||
            isNaN(month) ||
            isNaN(day) ||
            isNaN(hours) ||
            isNaN(minutes) ||
            isNaN(seconds) ||
            month < 1 ||
            month > 12 ||
            day < 1 ||
            day > 31 ||
            hours >= 24 ||
            minutes >= 60 ||
            seconds >= 60
        ) {
            return null;
        }

        const dateTime: DateTime = {
            year,
            month,
            day,
            hour: hours,
            minute: minutes,
            second: seconds,
        };

        const dateTimeString = `${String(year).padStart(4, "0")}-${String(
            month
        ).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(
            hours
        ).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
            seconds
        ).padStart(2, "0")}`;

        return {
            dateTimeString,
            dateTime,
        };
    }

    return null;
}
