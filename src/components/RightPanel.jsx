import { useCallback, useEffect, useState } from "react";
import {
  Clock, CloudSun, CalendarCheck, Trash2, RotateCcw, Loader2, Pencil, RefreshCw,
} from "lucide-react";
import { schedule as scheduleData } from "../lib/mockData";
import { fetchWeather } from "../lib/weatherService";

/**
 * Right panel — Current Activity, Weather (live Open-Meteo), Schedule, Mark as Done.
 *
 * Props:
 *  - currentActivity: { id, title, location?, time?, tag?, source }
 *  - onRevertActivity(): revert to default activity
 *  - onDeleteActivity(): remove a user-added activity (only for source === "user")
 *  - onEditActivity(): open the edit modal for the current user activity
 *  - onPickSchedule(scheduleItem): set schedule item as current activity
 */
export const RightPanel = ({
  currentActivity,
  onRevertActivity,
  onDeleteActivity,
  onEditActivity,
  onPickSchedule,
}) => {
  const [weather, setWeather] = useState(null);
  const [wLoading, setWLoading] = useState(true);
  const [wError, setWError] = useState(null);

  const loadWeather = useCallback(async () => {
    try {
      setWLoading(true);
      setWError(null);
      const w = await fetchWeather();
      setWeather(w);
    } catch (e) {
      setWError(e.message || "Failed to fetch weather");
    } finally {
      setWLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    const iv = setInterval(loadWeather, 1 * 60 * 1000);
    return () => clearInterval(iv);
  }, [loadWeather]);

  const a = currentActivity;
  const canDelete = a && a.source === "user";
  const canEdit = a && a.source === "user";
  const canRevert = a && a.source && a.source !== "default";

  return (
    <aside
      className="flex flex-col gap-4 w-full lg:w-[280px] shrink-0"
      data-testid="right-panel"
    >
      {/* Current Activity */}
      <div
        className="glass-strong rounded-3xl p-5 fade-up"
        data-testid="current-activity-widget"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground/80">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-semibold">Current Activity</span>
          </div>
          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                data-testid="current-activity-edit"
                onClick={onEditActivity}
                aria-label="Edit activity"
                className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/50 dark:hover:bg-white/15 text-foreground/70 transition"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {canRevert && (
              <button
                data-testid="current-activity-revert"
                onClick={onRevertActivity}
                aria-label="Revert to default activity"
                className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/50 dark:hover:bg-white/15 text-foreground/70 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
            {canDelete && (
              <button
                data-testid="current-activity-delete"
                onClick={onDeleteActivity}
                aria-label="Delete activity"
                className="h-7 w-7 grid place-items-center rounded-md hover:bg-red-200/60 text-red-600 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <p
          className="font-display text-xl mt-3 font-semibold text-foreground"
          data-testid="current-activity-title"
        >
          {a?.title || "No activity"}
        </p>
        <dl className="mt-3 space-y-1 text-xs text-foreground/70">
          {a?.location && (
            <div>
              <span className="font-medium">Location:</span> {a.location}
            </div>
          )}
          {a?.time && (
            <div>
              <span className="font-medium">Time:</span> {a.time}
            </div>
          )}
          {a?.tag && (
            <div>
              <span className="font-medium">Tags:</span>{" "}
              <span
                data-testid="current-activity-tag"
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-semibold"
              >
                {a.tag}
              </span>
            </div>
          )}
        </dl>
      </div>

      {/* Weather (live) */}
      <div
        className="glass-strong rounded-3xl p-5 fade-up"
        data-testid="weather-widget"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-center gap-2 text-foreground/80">
          <CloudSun className="h-4 w-4" />
          <span className="text-sm font-semibold">Weather</span>
        </div>

        {wLoading && !weather && (
          <div
            className="mt-3 flex items-center gap-2 text-sm text-foreground/70"
            data-testid="weather-loading"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        )}

        {wError && !weather && (
          <div className="mt-3" data-testid="weather-error-block">
            <p
              className="text-xs text-red-600"
              data-testid="weather-error"
            >
              Unable to fetch weather. Check your connection.
            </p>
            <button
              type="button"
              data-testid="weather-retry-btn"
              onClick={loadWeather}
              className="mt-2 glass rounded-full px-3 py-1 text-xs font-semibold text-foreground flex items-center gap-1 hover:bg-white/60 dark:hover:bg-white/15 transition"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        )}

        {weather && (
          <>
            <p
              className="font-display text-2xl mt-3 font-semibold text-foreground"
              data-testid="weather-time"
            >
              {weather.time}
            </p>
            <p
              className="text-sm font-medium text-foreground/90 mt-1"
              data-testid="weather-temp"
            >
              {weather.tempC != null ? `${Math.round(weather.tempC)}°C` : "--"}
              {" – "}
              <span data-testid="weather-description">{weather.description}</span>
            </p>
            <p className="text-sm text-foreground/70 mt-0.5">{weather.city}</p>
            <p className="text-xs text-sky-600 dark:text-sky-300 mt-1">
              Forecast: {weather.description}
            </p>
          </>
        )}
      </div>

      {/* Schedule (clickable) */}
      <div
        className="glass-strong rounded-3xl p-5 fade-up flex-1"
        data-testid="schedule-widget"
        style={{ animationDelay: "160ms" }}
      >
        <div className="flex items-center gap-2 text-foreground/80">
          <CalendarCheck className="h-4 w-4" />
          <span className="text-sm font-semibold">Schedule</span>
        </div>
        <ul className="mt-3 space-y-1">
          {scheduleData.map((s) => {
            const active = a?.id === s.id;
            return (
              <li key={s.id}>
                <button
                  data-testid={`schedule-${s.id}`}
                  onClick={() => onPickSchedule && onPickSchedule(s)}
                  aria-pressed={active}
                  className={`w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg transition text-left ${
                    active
                      ? "bg-sky-400/25 ring-1 ring-sky-400/60 text-foreground"
                      : "hover:bg-white/40 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shrink-0" />
                  <span className="font-medium text-foreground/90">{s.time}</span>
                  <span className="text-foreground/65 truncate">— {s.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        data-testid="mark-as-done-btn"
        className="glass-strong rounded-2xl py-4 font-display text-lg font-semibold text-foreground hover:bg-white/70 dark:hover:bg-white/20 transition"
        onClick={() => alert("Activity marked as done!")}
      >
        Mark as Done
      </button>
    </aside>
  );
};

export default RightPanel;
