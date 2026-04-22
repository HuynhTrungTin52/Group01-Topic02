import { habits } from "../lib/mockData";
import { Sparkles } from "lucide-react";

export const Habits = () => {
  return (
    <section data-testid="habits-section">
      <h2 className="text-xl font-semibold mb-4 text-foreground/90">
        Your Habits
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {habits.map((h, i) => (
          <article
            key={h.id}
            data-testid={`habit-card-${h.id}`}
            className="glass-strong lift rounded-3xl p-3 fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className={`aspect-[4/5] rounded-2xl bg-gradient-to-br ${h.accent} relative overflow-hidden`}
            >
              <Sparkles className="absolute top-2 right-2 h-4 w-4 text-white/80" />
            </div>
            <div className="mt-3 px-1">
              <p className="font-semibold text-foreground">{h.title}</p>
              <p className="text-xs text-foreground/60 mt-0.5">{h.time}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Habits;
