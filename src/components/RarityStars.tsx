import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RarityStars({
  rarity,
  size = 12,
  className,
}: {
  rarity: number;
  size?: number;
  className?: string;
}) {
  const color =
    rarity >= 5 ? "var(--color-rarity-5)" : "var(--color-rarity-4)";
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: rarity }).map((_, i) => (
        <Star key={i} size={size} fill={color} stroke="none" />
      ))}
    </span>
  );
}
