export function formatLocalDateTime(value) {
  if (!value) return "-";
  const raw = String(value);
  const [datePart, timePartRaw = ""] = raw.replace(" ", "T").split("T");
  const [y, m, d] = datePart.split("-");
  const timePart = timePartRaw.slice(0, 5);
  if (!y || !m || !d) return raw;
  return `${d}/${m}/${y}${timePart ? `, ${timePart}` : ""}`;
}

export function formatLocalDate(value) {
  if (!value) return "-";
  const raw = String(value).slice(0, 10);
  const [y, m, d] = raw.split("-");
  if (!y || !m || !d) return String(value);
  return `${d}/${m}/${y}`;
}

export function localDateTimeForInput(value) {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
}

export function localDateForInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function localDateTimeForDb(value) {
  if (!value) return null;
  return String(value).replace(" ", "T").slice(0, 16);
}

export function localDateForDb(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

export function addHoursLocal(value, hours = 2) {
  if (!value) return "";
  const raw = String(value).replace(" ", "T").slice(0, 16);
  const [datePart, timePart = "00:00"] = raw.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
  date.setHours(date.getHours() + hours);
  const yy = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const da = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yy}-${mo}-${da}T${h}:${mi}`;
}


export function localDateTimeToDate(value) {
  if (!value) return null;
  const raw = String(value).replace(" ", "T").slice(0, 16);
  const [datePart, timePart = "00:00"] = raw.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
}

export function diffHoursFromNowLocal(value) {
  const date = localDateTimeToDate(value);
  if (!date) return null;
  return (date.getTime() - Date.now()) / (1000 * 60 * 60);
}

export function isBetweenHours(value, minHours, maxHours) {
  const diff = diffHoursFromNowLocal(value);
  if (diff === null) return false;
  return diff >= minHours && diff <= maxHours;
}
