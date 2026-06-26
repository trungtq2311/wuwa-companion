import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Waves } from "lucide-react";
import { NAV_ITEMS } from "@/routes/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  return (
    <aside className="flex w-[248px] shrink-0 flex-col gap-1 border-r border-[var(--color-border-soft)] bg-[var(--color-surface)]/70 px-3.5 py-6 backdrop-blur-xl">
      {/* Brand */}
      <div className="mb-7 flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-glacio)] text-[var(--color-bg)] shadow-[0_0_24px_-4px_var(--color-accent)]">
          <Waves size={24} strokeWidth={2.4} />
        </div>
        <div className="leading-tight">
          <div className="display text-[15px] font-bold tracking-wide">
            WUTHERING
          </div>
          <div className="text-xs text-[var(--color-fg-muted)]">Companion</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                isActive
                  ? "text-[var(--color-fg)]"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-white/[0.03]",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl border border-[var(--color-accent)]/35 bg-gradient-to-r from-[var(--color-accent)]/15 to-transparent shadow-[0_0_20px_-6px_var(--color-accent)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]" />
                )}
                <item.icon
                  size={19}
                  className={cn(
                    "relative z-10 shrink-0",
                    isActive && "text-[var(--color-accent)]",
                  )}
                />
                <span className="relative z-10 flex flex-col">
                  <span className="display text-[13.5px] font-semibold tracking-wide">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-[var(--color-fg-faint)]">
                    {item.description}
                  </span>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 text-[11px] text-[var(--color-fg-faint)]">
        v0.4.0 · dữ liệu & ảnh thật
      </div>
    </aside>
  );
}
