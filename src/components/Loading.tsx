import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center text-[var(--color-fg-faint)]">
      <Loader2 className="animate-spin" size={28} />
    </div>
  );
}
