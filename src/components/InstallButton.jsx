import { useEffect, useState } from "react";
import { Download } from "lucide-react";

// beforeinstallprompt UI — shows an "Install" button when the browser
// signals the PWA is installable. Hides after install or when not eligible.
export const InstallButton = () => {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforePrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforePrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforePrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !deferred) return null;

  const handleClick = async () => {
    try {
      deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice && choice.outcome === "accepted") setInstalled(true);
    } catch {
      /* noop */
    } finally {
      setDeferred(null);
    }
  };

  return (
    <button
      type="button"
      data-testid="install-pwa-btn"
      onClick={handleClick}
      className="glass rounded-full px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-foreground hover:-translate-y-0.5 transition"
      aria-label="Install app"
    >
      <Download className="h-3.5 w-3.5" />
      Install
    </button>
  );
};

export default InstallButton;
