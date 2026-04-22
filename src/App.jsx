import { useEffect, useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import "@/App.css";

import Sidebar from "@/components/Sidebar";
import Habits from "@/components/Habits";
import Reminders from "@/components/Reminders";
import TodoKanban from "@/components/TodoKanban";
import RightPanel from "@/components/RightPanel";
import ThemeToggle from "@/components/ThemeToggle";
import InstallButton from "@/components/InstallButton";
import NewActivityModal from "@/components/NewActivityModal";
import ExportButton from "@/components/ExportButton";
import ImportButton from "@/components/ImportButton";
import CalendarExportButton from "@/components/CalendarExportButton";
import NotificationsButton from "@/components/NotificationsButton";
import { currentActivity as defaultActivity, schedule } from "@/lib/mockData";
import { ACTIVITY_TAGS, STORAGE_KEYS } from "@/lib/constants";

const ACTIVITIES_KEY = STORAGE_KEYS.ACTIVITIES;
const CURRENT_KEY = STORAGE_KEYS.CURRENT_ACTIVITY_ID;

const loadActivities = () => {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const loadCurrentId = () => {
  try {
    return localStorage.getItem(CURRENT_KEY) || "default";
  } catch {
    return "default";
  }
};

function App() {
  const [filter, setFilter] = useState(null); // { type: "list"|"tag", value } | null
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null); // activity object or null
  const [userActivities, setUserActivities] = useState(loadActivities);
  const [currentId, setCurrentId] = useState(loadCurrentId);

  // Persist user activities + current selection — PWA offline requirement
  useEffect(() => {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(userActivities));
  }, [userActivities]);
  useEffect(() => {
    localStorage.setItem(CURRENT_KEY, currentId);
  }, [currentId]);

  const activity = useMemo(() => {
    const def = { ...defaultActivity, id: "default", source: "default" };
    if (!currentId || currentId === "default") return def;

    const fromUser = userActivities.find((a) => a.id === currentId);
    if (fromUser) return { ...fromUser, source: "user" };

    const fromSched = schedule.find((s) => s.id === currentId);
    if (fromSched) {
      return {
        id: fromSched.id,
        title: fromSched.label,
        time: fromSched.time,
        location: "On campus",
        tag: ACTIVITY_TAGS.SCHEDULED,
        source: "schedule",
      };
    }
    return def;
  }, [currentId, userActivities]);

  // Formatters
  const formatDt = (dt) => {
    if (!dt || !dt.includes("T")) return dt || "";
    const [d, t] = dt.split("T");
    return `${t} · ${d}`;
  };

  const handleSaveActivity = ({ id, title, location, time }) => {
    if (id) {
      setUserActivities((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          if (a.timeISO && a.timeISO !== time) {
            try {
              const raw = localStorage.getItem(STORAGE_KEYS.NOTIFIED_ACTIVITIES);
              const set = new Set(raw ? JSON.parse(raw) : []);
              set.delete(`${id}:${a.timeISO}`);
              localStorage.setItem(
                STORAGE_KEYS.NOTIFIED_ACTIVITIES,
                JSON.stringify([...set])
              );
            } catch {
              /* noop */
            }
          }
          return {
            ...a,
            title,
            location: location || "—",
            timeISO: time,
            time: formatDt(time),
          };
        })
      );
      setCurrentId(id);
    } else {
      // Add new
      const newId = `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const act = {
        id: newId,
        title,
        location: location || "—",
        timeISO: time,
        time: formatDt(time),
        tag: ACTIVITY_TAGS.UPCOMING,
      };
      setUserActivities((prev) => [...prev, act]);
      setCurrentId(newId);
    }
  };

  const openNewActivity = () => {
    setEditingActivity(null);
    setModalOpen(true);
  };
  const openEditActivity = () => {
    if (!activity || activity.source !== "user") return;
    setEditingActivity(activity);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingActivity(null);
  };

  const handlePickSchedule = (s) => setCurrentId(s.id);
  const handleRevertActivity = () => setCurrentId("default");
  const handleDeleteActivity = () => {
    if (activity.source !== "user") return;
    const id = activity.id;
    setUserActivities((prev) => prev.filter((a) => a.id !== id));
    setCurrentId("default");
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIFIED_ACTIVITIES);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          const pruned = arr.filter((k) => !k.startsWith(`${id}:`));
          localStorage.setItem(
            STORAGE_KEYS.NOTIFIED_ACTIVITIES,
            JSON.stringify(pruned)
          );
        }
      }
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      const tag = (target && target.tagName ? target.tagName : "").toLowerCase();
      const isEditable =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (target && target.isContentEditable);
      if (isEditable) return;
      if (e.shiftKey && (e.key === "N" || e.key === "n")) {
        e.preventDefault();
        openNewActivity();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const loadNotified = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.NOTIFIED_ACTIVITIES);
        return new Set(raw ? JSON.parse(raw) : []);
      } catch {
        return new Set();
      }
    };
    const saveNotified = (s) => {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFIED_ACTIVITIES,
        JSON.stringify([...s])
      );
    };

    const notified = loadNotified();
    const check = () => {
      if (typeof Notification === "undefined") return;
      if (Notification.permission !== "granted") return;
      const now = Date.now();
      userActivities.forEach((a) => {
        if (!a.timeISO) return;
        const t = new Date(a.timeISO).getTime();
        if (Number.isNaN(t)) return;
        const delta = t - now;
        if (delta > 0 && delta <= 5 * 60 * 1000) {
          const key = `${a.id}:${a.timeISO}`;
          if (notified.has(key)) return;
          try {
            new Notification("Upcoming activity", {
              body: `${a.title} in ${Math.max(1, Math.round(delta / 60000))} min${
                a.location && a.location !== "—" ? ` • ${a.location}` : ""
              }`,
              icon: "/icon.svg",
              tag: a.id,
            });
          } catch {
            /* noop */
          }
          notified.add(key);
          saveNotified(notified);
        }
      });
    };
    check();
    const iv = setInterval(check, 30 * 1000);
    return () => clearInterval(iv);
  }, [userActivities]);

  return (
    <div className="App app-backdrop">
      <NewActivityModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSaveActivity}
        editing={editingActivity}
      />

      <div className="max-w-[1500px] mx-auto p-4 lg:p-6 h-screen flex gap-4 lg:gap-5">
        <Sidebar activeFilter={filter} onFilter={setFilter} />

        {/* Main column */}
        <main
          className="flex-1 min-w-0 flex gap-4 lg:gap-5"
          data-testid="main-dashboard"
        >
          {/* Center */}
          <section className="flex-1 min-w-0 glass-strong rounded-[28px] p-5 lg:p-7 overflow-y-auto thin-scroll">
            {/* Search */}
            <div className="glass rounded-full px-4 py-2.5 flex items-center gap-2 mb-6">
              <Search className="h-4 w-4 text-foreground/60" />
              <input
                data-testid="search-input"
                type="text"
                placeholder="Search.."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-foreground/50 text-foreground"
              />
            </div>

            {/* Title + action */}
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[0.95]">
                  Today Activities
                </h1>
                <p className="text-sm text-foreground/60 mt-2">
                  Manage your reminders, events &amp; habits.
                </p>
              </div>
              <button
                data-testid="new-activity-btn"
                className="glass-strong rounded-2xl px-5 py-3 flex items-center gap-2 font-semibold text-foreground hover:-translate-y-0.5 transition"
                onClick={openNewActivity}
                title="Shortcut: Shift+N"
              >
                <Plus className="h-5 w-5" />
                New Activity
              </button>
            </div>

            <div className="flex flex-col gap-8">
              <Habits />
              <Reminders />
              <TodoKanban filter={filter} onClearFilter={() => setFilter(null)} />
            </div>
          </section>

          {/* Right */}
          <div className="hidden xl:flex">
            <div className="w-[280px] flex flex-col">
              {/* Top-right bar */}
              <div className="flex items-center justify-end gap-2 mb-4">
                <ImportButton />
                <ExportButton />
                <CalendarExportButton />
                <NotificationsButton />
                <InstallButton />
                <ThemeToggle />
                <div
                  data-testid="user-avatar"
                  className="h-11 w-11 rounded-full glass-strong overflow-hidden grid place-items-center"
                  aria-label="User avatar"
                >
                  <span className="text-xl" role="img" aria-label="bear">🐻</span>
                </div>
              </div>
              <RightPanel
                currentActivity={activity}
                onRevertActivity={handleRevertActivity}
                onDeleteActivity={handleDeleteActivity}
                onEditActivity={openEditActivity}
                onPickSchedule={handlePickSchedule}
              />
            </div>
          </div>
        </main>

        {/* Mobile/tablet fallback: action chips */}
        <div className="xl:hidden fixed bottom-3 right-3 z-20 flex items-center gap-2">
          <ImportButton />
          <ExportButton />
          <CalendarExportButton />
          <NotificationsButton />
          <InstallButton />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default App;
