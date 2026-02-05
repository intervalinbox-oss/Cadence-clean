/**
 * Calendar export utilities
 * Generates .ics files and Google Calendar URLs for meeting scheduling
 */

/**
 * Format date for .ics file (RFC 5545 format)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape text for .ics format (escape commas, semicolons, backslashes, newlines)
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generate .ics file content for a meeting
 */
export function generateICSFile(meetingData: {
  title: string;
  description: string;
  duration: number; // minutes
  startDate?: Date; // optional, defaults to now + 1 hour
}): string {
  // Default to 1 hour from now if no start date provided
  const start = meetingData.startDate || new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + meetingData.duration * 60000);

  const startFormatted = formatICSDate(start);
  const endFormatted = formatICSDate(end);
  const titleEscaped = escapeICSText(meetingData.title);
  const descriptionEscaped = escapeICSText(meetingData.description);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cadence//Communication Decision Engine//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${startFormatted}
DTEND:${endFormatted}
SUMMARY:${titleEscaped}
DESCRIPTION:${descriptionEscaped}
UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@cadence.app
DTSTAMP:${formatICSDate(new Date())}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}

/**
 * Download .ics file
 */
export function downloadICS(icsContent: string, filename: string = "meeting.ics"): void {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for Google Calendar URL (YYYYMMDDTHHmmssZ format)
 */
function formatGoogleCalendarDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate Google Calendar URL with pre-filled meeting details
 */
export function generateGoogleCalendarURL(meetingData: {
  title: string;
  description: string;
  duration: number; // minutes
  startDate?: Date; // optional, defaults to now + 1 hour
}): string {
  // Default to 1 hour from now if no start date provided
  const start = meetingData.startDate || new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + meetingData.duration * 60000);

  const startFormatted = formatGoogleCalendarDate(start);
  const endFormatted = formatGoogleCalendarDate(end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: meetingData.title,
    details: meetingData.description,
    dates: `${startFormatted}/${endFormatted}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Open Google Calendar in new tab with pre-filled details
 */
export function openGoogleCalendar(meetingData: {
  title: string;
  description: string;
  duration: number;
  startDate?: Date;
}): void {
  const url = generateGoogleCalendarURL(meetingData);
  window.open(url, "_blank", "noopener,noreferrer");
}
