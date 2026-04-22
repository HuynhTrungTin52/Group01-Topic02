import { CalendarDays } from "lucide-react";
import { STORAGE_KEYS } from "../lib/constants";
import { buildICS, downloadICS } from "../lib/ics";

/**
 * Downloads all user activities (from localStorage) as a .ics file that can
 * be imported into Google Calendar, Apple Calendar, Outlook, etc.
 */
export const CalendarExportButton = () => {
  const handleClick = () => {
    let acts = [];
    try {
      acts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || "[]");
    } catch {
      acts = [];
    }
    const withTime = (acts || []).filter((a) => a && a.timeISO);
    if (withTime.length === 0) {
      alert("No user activities with a time set. Add one first.");
      return;
    }
    const content = buildICS(withTime);
    const filename = `today-activities-${new Date()
      .toISOString()
      .slice(0, 10)}.ics`;
    downloadICS(content, filename);
  };

  return (
    <button
      type="button"
      data-testid="export-ics-btn"
      onClick={handleClick}
      aria-label="Export activities as .ics (calendar)"
      title="Export activities as .ics (calendar)"
      className="glass h-10 w-10 rounded-full grid place-items-center text-foreground hover:bg-white/60 dark:hover:bg-white/15 transition"
    >
      <CalendarDays className="h-4 w-4" />
    </button>
  );
};

export default CalendarExportButton;
