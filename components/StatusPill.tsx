const styles: Record<string, string> = {
  Running: "bg-ink text-canvas",
  Queued: "bg-sand text-ink",
  Completed: "bg-sand text-ink",
  Paused: "bg-sand text-muted",
  Failed: "bg-sand text-ink",
  Sent: "bg-sand text-ink",
  Pending: "bg-sand text-muted",
  Connected: "bg-ink text-canvas",
  "Needs Reconnect": "bg-sand text-ink",
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-sand text-ink"
      }`}
    >
      {status}
    </span>
  );
}
