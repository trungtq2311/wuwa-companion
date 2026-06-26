import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Waves } from "lucide-react";
import { NAV_ITEMS } from "@/routes/nav";
import { cn } from "@/lib/utils";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-[var(--color-border-soft)] bg-[var(--color-bg)]/85 px-3 backdrop-blur-xl sm:gap-4 sm:px-5">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-deep)] text-[var(--color-bg)]">
          <Waves size={18} strokeWidth={2.6} />
        </div>
        <div className="display hidden text-[14px] font-bold tracking-[0.06em] lg:block">
          WUTHERING<span className="text-[var(--color-accent)]">WAVES</span>
        </div>
      </div>

      {/* Nav — icon-only on small windows, icon+label when wide */}
      <nav className="flex flex-1 items-center justify-center gap-0.5 sm:justify-start">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            title={item.label}
            className={({ isActive }) =>
              cn(
                "group relative flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "text-[var(--color-fg)]"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-white/[0.04]",
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={isActive ? "text-[var(--color-accent)]" : ""}
                />
                <span className="display hidden font-medium tracking-wide md:inline">
                  {item.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="topnav-active"
                    className="absolute inset-x-1.5 -bottom-[1px] h-0.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <span className="hidden shrink-0 text-[11px] text-[var(--color-fg-faint)] sm:block">
        v0.5.1
      </span>
    </header>
  );
}
