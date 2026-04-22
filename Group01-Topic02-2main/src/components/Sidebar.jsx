import { useState } from "react";
import {
  Home, CalendarDays, ClipboardList, CalendarCheck2, CalendarPlus, CalendarRange,
  Inbox, Plus, Briefcase, Feather, Dumbbell, BookOpen, BookMarked,
  Tag, CheckCircle2, Trash2, Sigma, Settings, LogOut,
} from "lucide-react";

const navItems = [
  { id: "all-day",    label: "All day",     icon: ClipboardList },
  { id: "today",      label: "Today",       icon: CalendarCheck2, active: true },
  { id: "tomorrow",   label: "Tomorrow",    icon: CalendarPlus },
  { id: "next-7",     label: "Next 7 days", icon: CalendarRange },
  { id: "inbox",      label: "Inbox",       icon: Inbox },
];

const lists = [
  { id: "work",      label: "Work",      icon: Briefcase },
  { id: "freelance", label: "Freelance", icon: Feather },
  { id: "workout",   label: "Workout",   icon: Dumbbell },
  { id: "learning",  label: "Learning",  icon: BookOpen },
  { id: "reading",   label: "Reading",   icon: BookMarked },
];

const tags = [
  { id: "work",      label: "work",      color: "bg-sky-300" },
  { id: "meeting",   label: "meeting",   color: "bg-indigo-300" },
  { id: "important", label: "important", color: "bg-violet-300" },
];

const footer = [
  { id: "completed", label: "Completed", icon: CheckCircle2 },
  { id: "trash",     label: "Trash",     icon: Trash2 },
  { id: "summary",   label: "Sumary",    icon: Sigma },
];

export const Sidebar = ({ activeFilter = null, onFilter }) => {
  const [activeNav, setActiveNav] = useState("today");

  const isListActive = (id) =>
    activeFilter && activeFilter.type === "list" && activeFilter.value === id;
  const isTagActive = (id) =>
    activeFilter && activeFilter.type === "tag" && activeFilter.value === id;

  const handleNav = (id) => {
    setActiveNav(id);
    if (onFilter) onFilter(null);
  };

  return (
    <aside
      className="hidden lg:flex shrink-0 h-full gap-3"
      data-testid="sidebar"
    >
      {/* Thin icon rail */}
      <div className="w-14 glass rounded-3xl flex flex-col items-center justify-between py-5">
        <div className="flex flex-col gap-4">
          <button
            aria-label="Home"
            data-testid="rail-home"
            onClick={() => onFilter && onFilter(null)}
            className="h-10 w-10 rounded-2xl grid place-items-center text-foreground/80 hover:bg-white/40 dark:hover:bg-white/10 transition"
          >
            <Home className="h-5 w-5" />
          </button>
          <button
            aria-label="Calendar"
            data-testid="rail-calendar"
            className="h-10 w-10 rounded-2xl grid place-items-center bg-white/60 text-sky-600 ring-2 ring-sky-400/60"
          >
            <CalendarDays className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <button
            aria-label="Settings"
            data-testid="rail-settings"
            className="h-10 w-10 rounded-2xl grid place-items-center text-foreground/80 hover:bg-white/40 dark:hover:bg-white/10 transition"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            aria-label="Log out"
            data-testid="rail-logout"
            className="h-10 w-10 rounded-2xl grid place-items-center text-foreground/80 hover:bg-white/40 dark:hover:bg-white/10 transition"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main nav panel */}
      <nav
        className="w-64 glass rounded-3xl p-5 overflow-y-auto thin-scroll"
        data-testid="sidebar-nav"
      >
        <ul className="flex flex-col gap-1">
          {navItems.map((it) => {
            const Icon = it.icon;
            const isActive = activeNav === it.id && !activeFilter;
            return (
              <li key={it.id}>
                <button
                  onClick={() => handleNav(it.id)}
                  data-testid={`nav-${it.id}`}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
                    ${isActive
                      ? "bg-white/70 dark:bg-white/15 text-foreground shadow-sm"
                      : "text-foreground/75 hover:bg-white/40 dark:hover:bg-white/10 hover:text-foreground"}`}
                >
                  <Icon className="h-4 w-4 opacity-80" />
                  <span className="font-medium">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 mb-2 flex items-center gap-2 text-foreground/70">
          <span className="text-sm font-semibold tracking-wide">Lists</span>
          <button
            aria-label="Add list"
            data-testid="add-list-btn"
            className="h-6 w-6 rounded-full grid place-items-center hover:bg-white/50 dark:hover:bg-white/15"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {lists.map((it) => {
            const Icon = it.icon;
            const active = isListActive(it.id);
            return (
              <li key={it.id}>
                <button
                  data-testid={`list-${it.id}`}
                  onClick={() => onFilter && onFilter({ type: "list", value: it.id })}
                  aria-pressed={active}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
                    ${active
                      ? "bg-sky-400/25 text-foreground ring-1 ring-sky-400/60"
                      : "text-foreground/75 hover:bg-white/40 dark:hover:bg-white/10 hover:text-foreground"}`}
                >
                  <Icon className="h-4 w-4 opacity-80" />
                  <span className="font-medium">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 mb-2 text-sm font-semibold tracking-wide text-foreground/70">
          Tags
        </div>
        <ul className="flex flex-col gap-1">
          {tags.map((t) => {
            const active = isTagActive(t.id);
            return (
              <li key={t.id}>
                <button
                  data-testid={`tag-${t.id}`}
                  onClick={() => onFilter && onFilter({ type: "tag", value: t.id })}
                  aria-pressed={active}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
                    ${active
                      ? "bg-violet-400/25 text-foreground ring-1 ring-violet-400/60"
                      : "text-foreground/75 hover:bg-white/40 dark:hover:bg-white/10 hover:text-foreground"}`}
                >
                  <Tag className="h-4 w-4 opacity-80" />
                  <span className="font-medium">{t.label}</span>
                  <span className={`ml-auto h-2.5 w-2.5 rounded-full ${t.color}`} />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-4 border-t border-white/40 dark:border-white/10">
          <ul className="flex flex-col gap-1">
            {footer.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.id}>
                  <button
                    data-testid={`footer-${f.id}`}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground/75 hover:bg-white/40 dark:hover:bg-white/10 hover:text-foreground transition"
                  >
                    <Icon className="h-4 w-4 opacity-80" />
                    <span className="font-medium">{f.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
