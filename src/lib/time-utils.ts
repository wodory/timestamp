/**
 * Time utility functions for timestamp formatting and parsing
 * Supports date-time format (YYYY-MM-DD HH:MM:SS)
 */

export interface DateTime {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

/**
 * Format DateTime to YYYY-MM-DD HH:MM:SS string
 * @param dateTime - DateTime object
 * @returns Formatted date-time string
 */
/**
 * Format DateTime with specific pattern
 * Supported tokens: yyyy, yy, MM, dd, HH, mm, ss
 * @param dateTime - DateTime object
 * @param pattern - Format pattern (default: yyyy-MM-dd HH:mm:ss)
 * @returns Formatted date-time string
 */
export function formatDateTimePattern(dateTime: DateTime, pattern: string = "yyyy-MM-dd HH:mm:ss"): string {
    const values: Record<string, string> = {
        yyyy: String(dateTime.year).padStart(4, "0"),
        yy: String(dateTime.year).slice(-2),
        MM: String(dateTime.month).padStart(2, "0"),
        dd: String(dateTime.day).padStart(2, "0"),
        HH: String(dateTime.hour).padStart(2, "0"),
        mm: String(dateTime.minute).padStart(2, "0"),
        ss: String(dateTime.second).padStart(2, "0"),
    };

    return pattern.replace(/yyyy|yy|MM|dd|HH|mm|ss/g, (match) => values[match]);
}

/**
 * Format DateTime to yyyy-MM-dd HH:mm:ss string
 * @param dateTime - DateTime object
 * @returns Formatted date-time string
 */
export function formatDateTime(dateTime: DateTime): string {
    return formatDateTimePattern(dateTime, "yyyy-MM-dd HH:mm:ss");
}

/**
 * Parse YYYY-MM-DD HH:MM:SS string to DateTime object
 * @param dateTimeString - Date-time string
 * @returns DateTime object or null if invalid
 */
export function parseDateTime(dateTimeString: string): DateTime | null {
    const match = dateTimeString.match(
        /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/
    );

    if (!match) return null;

    const [, year, month, day, hour, minute, second] = match.map((val) =>
        parseInt(val, 10)
    );

    if (
        isNaN(year) ||
        isNaN(month) ||
        isNaN(day) ||
        isNaN(hour) ||
        isNaN(minute) ||
        isNaN(second) ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31 ||
        hour >= 24 ||
        minute >= 60 ||
        second >= 60
    ) {
        return null;
    }

    return { year, month, day, hour, minute, second };
}

/**
 * Add seconds to DateTime object
 * @param dateTime - Starting date-time
 * @param offsetSeconds - Seconds to add
 * @returns New DateTime object
 */
export function addSeconds(dateTime: DateTime, offsetSeconds: number): DateTime {
    // Create a Date object for easier calculation
    const date = new Date(
        dateTime.year,
        dateTime.month - 1, // JS months are 0-indexed
        dateTime.day,
        dateTime.hour,
        dateTime.minute,
        dateTime.second
    );

    // Add offset
    date.setSeconds(date.getSeconds() + offsetSeconds);

    // Return as DateTime
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1, // Convert back to 1-indexed
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
    };
}

/**
 * Calculate current timestamp by adding offset to start time
 * @param startDateTime - Starting date-time
 * @param offsetSeconds - Offset in seconds
 * @param pattern - Optional format pattern
 * @returns Formatted timestamp (YYYY-MM-DD HH:MM:SS)
 */
export function calculateTimestamp(
    startDateTime: DateTime,
    offsetSeconds: number,
    pattern: string = "yyyy-MM-dd HH:mm:ss"
): string {
    const currentDateTime = addSeconds(startDateTime, offsetSeconds);
    return formatDateTimePattern(currentDateTime, pattern);
}

/**
 * Validate YYYY-MM-DD HH:MM:SS format
 * @param dateTimeString - Date-time string to validate
 * @returns true if valid format
 */
export function isValidDateTimeFormat(dateTimeString: string): boolean {
    return parseDateTime(dateTimeString) !== null;
}

// Legacy support for HH:MM:SS format
export function hhmmssToSeconds(timeString: string): number | null {
    const parts = timeString.split(":");
    if (parts.length !== 3) return null;

    const [hours, minutes, seconds] = parts.map((part) => parseInt(part, 10));

    if (
        isNaN(hours) ||
        isNaN(minutes) ||
        isNaN(seconds) ||
        minutes >= 60 ||
        seconds >= 60
    ) {
        return null;
    }

    return hours * 3600 + minutes * 60 + seconds;
}
