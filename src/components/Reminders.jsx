import { Clock3 } from "lucide-react";
import { reminders } from "../lib/mockData";

export const Reminders = () => {
  return (
    <section data-testid="reminders-section">
      <h2 className="text-xl font-semibold mb-4 text-foreground/90 flex items-center gap-2">
        Reminders <Clock3 className="h-4 w-4 opacity-70" />
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {reminders.map((r, i) => (
          <article
            key={r.id}
            data-testid={`reminder-card-${r.id}`}
            className="glass-strong lift rounded-2xl p-4 fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <p className="font-semibold text-foreground text-sm">{r.title}</p>
            <div className="mt-6 h-px bg-foreground/20" />
            <p className="text-xs text-foreground/60 mt-2">{r.due}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Reminders;
