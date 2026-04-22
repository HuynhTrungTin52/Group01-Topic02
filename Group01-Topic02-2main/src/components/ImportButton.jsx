import { useRef, useState } from "react";
import { Upload, Check } from "lucide-react";
import { STORAGE_KEYS } from "../lib/constants";

/**
 * Imports a JSON file exported by ExportButton back into localStorage.
 * Validates shape minimally, writes keys, then reloads the page so state
 * is re-read cleanly. Pairs with ExportButton for a round-trip.
 */
export const ImportButton = () => {
  const fileRef = useRef(null);
  const [done, setDone] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    // Reset so selecting the same file again re-fires change.
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== "object") {
        throw new Error("Invalid JSON shape");
      }
      if (data.tasks && typeof data.tasks === "object") {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
      }
      if (Array.isArray(data.activities)) {
        localStorage.setItem(
          STORAGE_KEYS.ACTIVITIES,
          JSON.stringify(data.activities)
        );
      }
      if (typeof data.currentActivityId === "string") {
        localStorage.setItem(
          STORAGE_KEYS.CURRENT_ACTIVITY_ID,
          data.currentActivityId
        );
      }
      if (data.theme === "light" || data.theme === "dark") {
        localStorage.setItem(STORAGE_KEYS.THEME, data.theme);
      }
      setDone(true);
      // Reload so every component picks up the imported state.
      setTimeout(() => window.location.reload(), 350);
    } catch (err) {
      alert("Import failed: " + (err.message || "Unable to parse file"));
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={handleChange}
        className="hidden"
        data-testid="import-json-input"
      />
      <button
        type="button"
        data-testid="import-json-btn"
        onClick={() => fileRef.current && fileRef.current.click()}
        aria-label="Import data from JSON"
        title="Import data from JSON"
        className="glass h-10 w-10 rounded-full grid place-items-center text-foreground hover:bg-white/60 dark:hover:bg-white/15 transition"
      >
        {done ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </button>
    </>
  );
};

export default ImportButton;
