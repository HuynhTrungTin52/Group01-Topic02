import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, ArrowLeft, ArrowRight, Trash2, Pencil, Check, X, Tag as TagIcon,
} from "lucide-react";
import { initialTasks } from "../lib/mockData";

const STORAGE_KEY = "today-dashboard-tasks";
const ORDER = ["todo", "inProgress", "completed"];
const LABELS = { todo: "To Do", inProgress: "In Progress", completed: "Completed" };

const LISTS = [
  { id: "inbox",     label: "Inbox" },
  { id: "work",      label: "Work" },
  { id: "freelance", label: "Freelance" },
  { id: "workout",   label: "Workout" },
  { id: "learning",  label: "Learning" },
  { id: "reading",   label: "Reading" },
];
const TAG_DEFS = [
  { id: "work",      label: "work",      color: "bg-sky-300 text-sky-900" },
  { id: "meeting",   label: "meeting",   color: "bg-indigo-300 text-indigo-900" },
  { id: "important", label: "important", color: "bg-violet-300 text-violet-900" },
];

const normalize = (arr) =>
  (arr || []).map((t) => ({ list: "inbox", tags: [], ...t }));

const loadTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialTasks;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.todo && parsed.inProgress && parsed.completed) {
      return {
        todo: normalize(parsed.todo),
        inProgress: normalize(parsed.inProgress),
        completed: normalize(parsed.completed),
      };
    }
    return initialTasks;
  } catch {
    return initialTasks;
  }
};

export const TodoKanban = ({ filter = null, onClearFilter }) => {
  const [tasks, setTasks] = useState(loadTasks);
  const [input, setInput] = useState("");
  const [newList, setNewList] = useState("inbox");
  const [newTags, setNewTags] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const draggingRef = useRef(null); // { fromKey, id } — synchronous
  const [draggingId, setDraggingId] = useState(null); // visual dim only
  const [dragOver, setDragOver] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null); // within-column reorder target
  const editInputRef = useRef(null);

  // Persist on every change — PWA offline requirement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const matches = (t) => {
    if (!filter || !filter.type) return true;
    if (filter.type === "list") return (t.list || "inbox") === filter.value;
    if (filter.type === "tag")  return (t.tags || []).includes(filter.value);
    return true;
  };

  const addTask = (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text) return;
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setTasks((p) => ({
      ...p,
      todo: [...p.todo, { id, text, list: newList, tags: [...newTags] }],
    }));
    setInput("");
    setNewTags([]);
  };

  // Move (and optionally reorder). If `targetId` is passed, insert BEFORE that
  // task in the destination column. Supports both cross-column moves and
  // within-column reordering.
  const moveTaskTo = (fromKey, id, toKey, targetId = null) => {
    if (fromKey === toKey && targetId === id) return;
    setTasks((prev) => {
      const src = prev[fromKey].find((t) => t.id === id);
      if (!src) return prev;

      if (fromKey === toKey) {
        const list = prev[fromKey].filter((t) => t.id !== id);
        const idx = targetId ? list.findIndex((t) => t.id === targetId) : list.length;
        const insert = idx >= 0 ? idx : list.length;
        list.splice(insert, 0, src);
        return { ...prev, [fromKey]: list };
      }

      const fromList = prev[fromKey].filter((t) => t.id !== id);
      const toList = [...prev[toKey]];
      const idx = targetId ? toList.findIndex((t) => t.id === targetId) : toList.length;
      const insert = idx >= 0 ? idx : toList.length;
      toList.splice(insert, 0, src);
      return { ...prev, [fromKey]: fromList, [toKey]: toList };
    });
  };

  const moveTask = (fromKey, id, direction) => {
    const toIdx = ORDER.indexOf(fromKey) + direction;
    if (toIdx < 0 || toIdx >= ORDER.length) return;
    moveTaskTo(fromKey, id, ORDER[toIdx]);
  };

  const deleteTask = (fromKey, id) => {
    setTasks((p) => ({ ...p, [fromKey]: p[fromKey].filter((t) => t.id !== id) }));
  };

  const startEdit = (t) => { setEditingId(t.id); setEditingText(t.text); };
  const cancelEdit = () => { setEditingId(null); setEditingText(""); };
  const saveEdit = (fromKey, id) => {
    const text = editingText.trim();
    if (!text) { cancelEdit(); return; }
    setTasks((p) => ({
      ...p,
      [fromKey]: p[fromKey].map((t) => (t.id === id ? { ...t, text } : t)),
    }));
    cancelEdit();
  };

  const toggleNewTag = (tagId) =>
    setNewTags((prev) =>
      prev.includes(tagId) ? prev.filter((x) => x !== tagId) : [...prev, tagId]
    );

  // --- drag-and-drop (HTML5 native) ---
  // Using a ref + dataTransfer fallback because React state updates from
  // onDragStart are not guaranteed to be committed by the time onDrop fires.
  const onDragStart = (fromKey, id) => (e) => {
    draggingRef.current = { fromKey, id };
    setDraggingId(id);
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify({ fromKey, id }));
    } catch { /* noop */ }
  };
  const onDragEnd = () => {
    draggingRef.current = null;
    setDraggingId(null);
    setDragOver(null);
    setDragOverTaskId(null);
  };
  const onColDragOver = (key) => (e) => {
    // Always allow drop when a drag is in progress (ref OR dataTransfer set).
    e.preventDefault();
    try { e.dataTransfer.dropEffect = "move"; } catch { /* noop */ }
    if (dragOver !== key) setDragOver(key);
  };
  const onColDrop = (key) => (e) => {
    e.preventDefault();
    let payload = draggingRef.current;
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData("text/plain");
        if (raw) payload = JSON.parse(raw);
      } catch { /* noop */ }
    }
    if (payload && payload.fromKey && payload.id) {
      // Dropped on column (not on a task) — append to end.
      moveTaskTo(payload.fromKey, payload.id, key);
    }
    onDragEnd();
  };

  // Task-level drag handlers — enables within-column reorder + "insert before"
  // when dropping on top of another task.
  const onTaskDragOver = (key, taskId) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { e.dataTransfer.dropEffect = "move"; } catch { /* noop */ }
    if (dragOver !== key) setDragOver(key);
    if (dragOverTaskId !== taskId) setDragOverTaskId(taskId);
  };
  const onTaskDrop = (key, taskId) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    let payload = draggingRef.current;
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData("text/plain");
        if (raw) payload = JSON.parse(raw);
      } catch { /* noop */ }
    }
    if (payload && payload.id && payload.id !== taskId) {
      moveTaskTo(payload.fromKey, payload.id, key, taskId);
    }
    onDragEnd();
  };

  const columnTint = useMemo(
    () => ({
      todo:       "from-sky-200/70 to-blue-300/70",
      inProgress: "from-indigo-200/70 to-sky-300/70",
      completed:  "from-blue-300/70 to-violet-300/70",
    }),
    []
  );

  const tagColor = (id) =>
    TAG_DEFS.find((x) => x.id === id)?.color || "bg-sky-300 text-sky-900";

  return (
    <section data-testid="todo-kanban">
      {/* Header row */}
      <div className="flex items-end justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-foreground/90">To Do List</h2>
          {filter && filter.type && (
            <span
              data-testid="active-filter-chip"
              className="glass rounded-full pl-3 pr-1 py-1 text-xs flex items-center gap-2"
            >
              <TagIcon className="h-3 w-3 opacity-70" />
              <span className="font-medium text-foreground">
                {filter.type === "list" ? "List" : "Tag"}:&nbsp;{filter.value}
              </span>
              <button
                data-testid="clear-filter-btn"
                aria-label="Clear filter"
                onClick={onClearFilter}
                className="h-5 w-5 grid place-items-center rounded-full hover:bg-white/60 dark:hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>

        <form
          onSubmit={addTask}
          className="glass rounded-2xl sm:rounded-full p-2 sm:pl-4 sm:pr-1 sm:py-1 flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto sm:min-w-[460px]"
        >
          <input
            data-testid="todo-add-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            className="bg-transparent outline-none text-sm flex-1 min-w-[140px] placeholder:text-foreground/50 text-foreground"
          />
          <select
            data-testid="todo-add-list"
            value={newList}
            onChange={(e) => setNewList(e.target.value)}
            className="bg-white/70 dark:bg-white/10 rounded-full text-xs px-2 py-1 outline-none text-foreground cursor-pointer"
          >
            {LISTS.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            {TAG_DEFS.map((t) => {
              const on = newTags.includes(t.id);
              return (
                <button
                  type="button"
                  key={t.id}
                  data-testid={`todo-add-tag-${t.id}`}
                  onClick={() => toggleNewTag(t.id)}
                  aria-pressed={on}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full transition ${
                    on ? t.color : "bg-white/50 dark:bg-white/10 text-foreground/60 hover:bg-white/70"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <button
            type="submit"
            data-testid="todo-add-submit"
            className="h-8 px-3 rounded-full bg-foreground text-background text-xs font-semibold flex items-center gap-1 hover:opacity-90 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </form>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ORDER.map((key, colIdx) => {
          const visible = tasks[key].filter(matches);
          const hiddenCount = tasks[key].length - visible.length;
          const isDropTarget = dragOver === key && draggingId;
          return (
            <div
              key={key}
              data-testid={`todo-column-${key}`}
              onDragOver={onColDragOver(key)}
              onDragLeave={() => dragOver === key && setDragOver(null)}
              onDrop={onColDrop(key)}
              className={`glass-strong rounded-3xl p-4 min-h-[220px] bg-gradient-to-b ${columnTint[key]} transition ${
                isDropTarget ? "ring-2 ring-sky-400/80 scale-[1.01]" : ""
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-foreground/20">
                <h3 className="font-semibold text-foreground">{LABELS[key]}</h3>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/85 dark:bg-white/15 text-foreground"
                  data-testid={`todo-count-${key}`}
                >
                  {visible.length}
                </span>
              </div>

              <ul className="flex flex-col gap-2">
                {visible.length === 0 && (
                  <li className="text-xs text-foreground/65 py-6 text-center italic">
                    {hiddenCount > 0
                      ? `No matching tasks (${hiddenCount} filtered out)`
                      : "No tasks here yet"}
                  </li>
                )}
                {visible.map((t) => {
                  const isEditing = editingId === t.id;
                  const isDragged = draggingId === t.id;
                  const isReorderTarget =
                    dragOverTaskId === t.id && draggingId && draggingId !== t.id;
                  return (
                    <li
                      key={t.id}
                      data-testid={`task-card-${t.id}`}
                      draggable={!isEditing}
                      onDragStart={onDragStart(key, t.id)}
                      onDragEnd={onDragEnd}
                      onDragOver={onTaskDragOver(key, t.id)}
                      onDrop={onTaskDrop(key, t.id)}
                      className={`group glass rounded-xl px-3 py-2.5 flex items-start gap-2 ${
                        isEditing ? "cursor-text" : "cursor-grab active:cursor-grabbing"
                      } ${isDragged ? "opacity-40" : ""} ${
                        isReorderTarget ? "border-t-2 border-sky-500" : ""
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <input
                            ref={editInputRef}
                            data-testid={`task-edit-input-${t.id}`}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(key, t.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="flex-1 bg-white/70 dark:bg-white/10 rounded-md px-2 py-1 text-sm outline-none text-foreground"
                          />
                          <button
                            aria-label="Save edit"
                            data-testid={`task-edit-save-${t.id}`}
                            onClick={() => saveEdit(key, t.id)}
                            className="h-6 w-6 grid place-items-center rounded-md hover:bg-white/60 dark:hover:bg-white/20 text-emerald-600"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            aria-label="Cancel edit"
                            data-testid={`task-edit-cancel-${t.id}`}
                            onClick={cancelEdit}
                            className="h-6 w-6 grid place-items-center rounded-md hover:bg-white/60 dark:hover:bg-white/20"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm text-foreground break-words ${
                                key === "completed" ? "line-through opacity-70" : ""
                              }`}
                              onDoubleClick={() => startEdit(t)}
                            >
                              {t.text}
                            </p>
                            {((t.tags && t.tags.length > 0) || (t.list && t.list !== "inbox")) && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {t.list && t.list !== "inbox" && (
                                  <span
                                    data-testid={`task-list-${t.id}`}
                                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/75 dark:bg-white/15 text-foreground/80"
                                  >
                                    {t.list}
                                  </span>
                                )}
                                {(t.tags || []).map((tg) => (
                                  <span
                                    key={tg}
                                    data-testid={`task-tag-${t.id}-${tg}`}
                                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tagColor(tg)}`}
                                  >
                                    #{tg}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition">
                            <button
                              aria-label="Edit task"
                              data-testid={`task-edit-${t.id}`}
                              onClick={() => startEdit(t)}
                              className="h-6 w-6 grid place-items-center rounded-md hover:bg-white/60 dark:hover:bg-white/20"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {colIdx > 0 && (
                              <button
                                aria-label="Move back"
                                data-testid={`task-move-back-${t.id}`}
                                onClick={() => moveTask(key, t.id, -1)}
                                className="h-6 w-6 grid place-items-center rounded-md hover:bg-white/60 dark:hover:bg-white/20"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {colIdx < ORDER.length - 1 && (
                              <button
                                aria-label="Move forward"
                                data-testid={`task-move-forward-${t.id}`}
                                onClick={() => moveTask(key, t.id, +1)}
                                className="h-6 w-6 grid place-items-center rounded-md hover:bg-white/60 dark:hover:bg-white/20"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              aria-label="Delete task"
                              data-testid={`task-delete-${t.id}`}
                              onClick={() => deleteTask(key, t.id)}
                              className="h-6 w-6 grid place-items-center rounded-md hover:bg-red-200/60 text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TodoKanban;
