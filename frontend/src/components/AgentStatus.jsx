const statusLabels = {
  thinking: "Thinking",
  searching: "Searching",
  calculating: "Calculating",
  reading: "Reading document",
  executing: "Executing",
};

export default function AgentStatus({
  status = "thinking",
}) {
  const normalizedStatus =
    status?.toLowerCase?.() || "thinking";

  const label =
    statusLabels[normalizedStatus] || status;

  return (
    <div
      className="flex justify-start px-4"
      role="status"
      aria-live="polite"
      aria-label={`${label}, please wait`}
    >
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-[#262B36] bg-[#171A21] px-4 py-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7C6FF0] opacity-75" />

          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7C6FF0]" />
        </span>

        <span className="font-mono text-xs tracking-tight text-[#8A8F98]">
          {label}…
        </span>
      </div>
    </div>
  );
}