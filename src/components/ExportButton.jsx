import { FileJson } from "lucide-react";
import { STORAGE_KEYS } from "../lib/constants";

/**
 * Exports all user data (kanban tasks + activities + current selection + theme)
 * as a downloadable JSON file.
 */
export const ExportButton = () => {
  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      tasks: JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || "null"),
      activities: JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || "[]"),
      currentActivityId:
        localStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY_ID) || "default",
      theme: localStorage.getItem(STORAGE_KEYS.THEME) || "light",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `today-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      data-testid="export-json-btn"
      onClick={handleExport}
      aria-label="Export data as JSON"
      title="Export data as JSON"
      className="glass h-10 w-10 rounded-full grid place-items-center text-foreground hover:bg-white/60 dark:hover:bg-white/15 transition"
    >
      <FileJson className="h-4 w-4" />
    </button>
  );
};

export default ExportButton;
