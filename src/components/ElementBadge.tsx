import { cn } from "@/lib/utils";

interface ElementBadgeProps {
  name: string;
  color: string;
  icon?: string | null;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ElementBadge({
  name,
  color,
  icon,
  showLabel = true,
  size = "md",
  className,
}: ElementBadgeProps) {
  const dim = size === "sm" ? 14 : 18;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        size === "sm" ? "text-xs" : "text-sm",
        className,
      )}
    >
      {icon ? (
        <img
          src={icon}
          alt={name}
          width={dim}
          height={dim}
          className="shrink-0"
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      ) : (
        <span
          className="rounded-full"
          style={{
            width: dim * 0.6,
            height: dim * 0.6,
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      )}
      {showLabel && <span style={{ color }}>{name}</span>}
    </span>
  );
}
