import { Construction } from "lucide-react";

export function ComingSoon({ note }: { note?: string }) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-3 px-8 py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
        <Construction size={26} />
      </div>
      <p className="text-sm font-medium">Đang xây dựng</p>
      <p className="max-w-md text-sm text-[var(--color-fg-muted)]">
        {note ?? "Tính năng này sẽ có ở các giai đoạn tiếp theo."}
      </p>
    </div>
  );
}
