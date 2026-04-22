
const pad = (n) => String(n).padStart(2, "0");

const toICSStamp = (date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(
    date.getHours()
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

const escapeICS = (s) =>
  String(s || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");


export const buildICS = (activities, durationMinutes = 60) => {
  const now = new Date();
  const stamp = toICSStamp(now);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Today Activities Dashboard//EN",
    "CALSCALE:GREGORIAN",
  ];

  (activities || []).forEach((a) => {
    if (!a || !a.timeISO) return;
    const start = new Date(a.timeISO);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeICS(a.id)}@today-dashboard`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toICSStamp(start)}`,
      `DTEND:${toICSStamp(end)}`,
      `SUMMARY:${escapeICS(a.title)}`
    );
    if (a.location && a.location !== "—") {
      lines.push(`LOCATION:${escapeICS(a.location)}`);
    }
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
};

export const downloadICS = (content, filename = "activities.ics") => {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
