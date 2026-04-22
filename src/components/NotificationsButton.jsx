import { useState } from "react";
import { Bell, BellRing, BellOff } from "lucide-react";

/**
 * Shows a bell icon. Clicking it requests Notification permission.
 *   - Unsupported → hidden entirely
 *   - 'default'   → Bell (click to request)
 *   - 'granted'   → BellRing (filled, amber)
 *   - 'denied'    → BellOff (disabled, tooltip explains to enable in browser)
 */
export const NotificationsButton = () => {
  const initialPerm =
    typeof Notification === "undefined" ? "unsupported" : Notification.permission;
  const [perm, setPerm] = useState(initialPerm);

  if (perm === "unsupported") return null;

  const handleClick = async () => {
    if (perm === "granted" || perm === "denied") return;
    try {
      const result = await Notification.requestPermission();
      setPerm(result);
      if (result === "granted") {
        try {
          new Notification("Notifications enabled", {
            body: "You'll be alerted 5 minutes before any upcoming activity.",
            icon: "/icon.svg",
            tag: "setup",
          });
        } catch {
          /* noop */
        }
      }
    } catch {
      /* noop */
    }
  };

  if (perm === "denied") {
    return (
      <button
        type="button"
        data-testid="notifications-denied"
        disabled
        aria-label="Notifications blocked — enable in browser settings"
        title="Notifications blocked — enable them in your browser site settings"
        className="glass h-10 w-10 rounded-full grid place-items-center text-foreground/40 cursor-not-allowed relative"
      >
        <BellOff className="h-4 w-4" />
      </button>
    );
  }

  const granted = perm === "granted";
  const Icon = granted ? BellRing : Bell;
  return (
    <button
      type="button"
      data-testid={granted ? "notifications-enabled" : "notifications-enable-btn"}
      onClick={handleClick}
      aria-label={granted ? "Notifications enabled" : "Enable notifications"}
      title={granted ? "Notifications enabled" : "Enable activity notifications"}
      className={`h-10 w-10 rounded-full grid place-items-center transition ${
        granted
          ? "bg-amber-200/70 text-amber-700 ring-1 ring-amber-400/50"
          : "glass text-foreground hover:bg-white/60 dark:hover:bg-white/15"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};

export default NotificationsButton;
