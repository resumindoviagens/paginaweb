export const BRASILIA_TIME_ZONE = "America/Sao_Paulo";
export const BRASILIA_UTC_OFFSET = "-03:00";

function pad(value) {
  return String(value).padStart(2, "0");
}

function validParts(parts) {
  if (!parts) return false;
  const { year, month, day, hour, minute, second } = parts;
  const check = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return check.getUTCFullYear() === year &&
    check.getUTCMonth() + 1 === month &&
    check.getUTCDate() === day &&
    check.getUTCHours() === hour &&
    check.getUTCMinutes() === minute &&
    check.getUTCSeconds() === second;
}

function partsFromInstant(date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRASILIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const values = {};
  for (const item of formatter.formatToParts(date)) {
    if (item.type !== "literal") values[item.type] = item.value;
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    hasTime: true
  };
}

/**
 * O banco atual usa timestamptz, mas os campos datetime-local foram historicamente
 * salvos sem offset. Portanto, o relógio visível no início da string é a fonte de
 * verdade operacional. Ex.: 2026-09-22T08:00:00+00:00 significa 08:00 em Brasília
 * neste sistema — não 05:00.
 */
export function brasiliaWallClockParts(value) {
  if (value === null || typeof value === "undefined" || value === "") return null;

  if (typeof value === "string") {
    const raw = value.trim();
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
      const parts = {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
        hour: Number(match[4] || 0),
        minute: Number(match[5] || 0),
        second: Number(match[6] || 0),
        hasTime: Boolean(match[4])
      };
      return validParts(parts) ? parts : null;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = partsFromInstant(date);
  return validParts(parts) ? parts : null;
}

export function isValidBrasiliaDateTime(value) {
  return Boolean(brasiliaWallClockParts(value));
}

export function formatBrasiliaDateTime(value) {
  const parts = brasiliaWallClockParts(value);
  if (!parts) return value ? String(value) : "";
  const date = `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`;
  return parts.hasTime ? `${date}, ${pad(parts.hour)}:${pad(parts.minute)}` : date;
}

export function toICSLocalDateTime(value) {
  const parts = brasiliaWallClockParts(value);
  if (!parts) return "";
  return `${parts.year}${pad(parts.month)}${pad(parts.day)}T${pad(parts.hour)}${pad(parts.minute)}${pad(parts.second)}`;
}

export function addHoursBrasilia(value, hours = 1) {
  const parts = brasiliaWallClockParts(value);
  if (!parts) return value;
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
  date.setUTCHours(date.getUTCHours() + Number(hours || 0));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

export function brasiliaWallClockToInstant(value) {
  const parts = brasiliaWallClockParts(value);
  if (!parts) return null;
  const local = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}${BRASILIA_UTC_OFFSET}`;
  const date = new Date(local);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function brasiliaWallClockNowISO() {
  const parts = partsFromInstant(new Date());
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}.000Z`;
}

export function toICSUtcStamp(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

export function brasiliaVTimezoneLines() {
  return [
    "BEGIN:VTIMEZONE",
    `TZID:${BRASILIA_TIME_ZONE}`,
    `X-LIC-LOCATION:${BRASILIA_TIME_ZONE}`,
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0300",
    "TZOFFSETTO:-0300",
    "TZNAME:BRT",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE"
  ];
}
