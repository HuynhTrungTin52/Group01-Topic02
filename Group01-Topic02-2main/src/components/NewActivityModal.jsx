import { useEffect, useState } from "react";
import { X, Calendar, MapPin, Type, Plus, Save } from "lucide-react";

/**
 * New / Edit Activity modal — glassmorphic overlay form.
 * Controlled from App.js. Calls onSave({ title, location, time, id? }) on submit.
 * `time` is a datetime-local string (e.g. "2026-02-12T14:30").
 * When `editing` is provided, the modal is in edit mode (prefilled, Save label).
 */
export const NewActivityModal = ({ open, onClose, onSave, editing = null }) => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [dt, setDt] = useState("");

  const isEdit = !!editing;

  // Seed fields every time the modal opens (or the editing target changes).
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title || "");
      setLocation(
        editing.location && editing.location !== "—" ? editing.location : ""
      );
      setDt(editing.timeISO || "");
    } else {
      setTitle("");
      setLocation("");
      setDt("");
    }
  }, [open, editing]);

  if (!open) return null;

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onSave({
      id: editing?.id,
      title: t,
      location: location.trim(),
      time: dt,
    });
    onClose();
  };

  return (
    <div
      data-testid="new-activity-modal"
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/30 backdrop-blur-sm fade-up"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-activity-title-label"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="glass-strong rounded-3xl p-6 w-full max-w-md flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <h2
            id="new-activity-title-label"
            className="font-display text-2xl font-bold text-foreground"
          >
            {isEdit ? "Edit Activity" : "New Activity"}
          </h2>
          <button
            type="button"
            data-testid="new-activity-modal-close"
            onClick={handleClose}
            aria-label="Close"
            className="h-8 w-8 rounded-full grid place-items-center hover:bg-white/50 dark:hover:bg-white/15 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="flex items-center gap-1.5 text-foreground/75 font-medium">
            <Type className="h-3.5 w-3.5" /> Title
          </span>
          <input
            autoFocus
            required
            data-testid="new-activity-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Review session"
            className="glass rounded-xl px-3 py-2 outline-none text-foreground placeholder:text-foreground/50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="flex items-center gap-1.5 text-foreground/75 font-medium">
            <MapPin className="h-3.5 w-3.5" /> Location
          </span>
          <input
            data-testid="new-activity-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Room 204"
            className="glass rounded-xl px-3 py-2 outline-none text-foreground placeholder:text-foreground/50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="flex items-center gap-1.5 text-foreground/75 font-medium">
            <Calendar className="h-3.5 w-3.5" /> Time
          </span>
          <input
            required
            data-testid="new-activity-time"
            type="datetime-local"
            value={dt}
            onChange={(e) => setDt(e.target.value)}
            className="glass rounded-xl px-3 py-2 outline-none text-foreground"
          />
        </label>

        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={handleClose}
            data-testid="new-activity-cancel"
            className="px-4 py-2 rounded-full text-sm font-semibold text-foreground/70 hover:bg-white/30 dark:hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="new-activity-submit"
            className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
          >
            {isEdit ? (
              <>
                <Save className="h-4 w-4" /> Save
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add Activity
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewActivityModal;
