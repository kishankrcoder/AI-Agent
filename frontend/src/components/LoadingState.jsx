export default function LoadingState({
  message = "Loading...",
}) {
  return (
    <div
      className="flex items-center justify-center px-4 py-8"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-xl border border-[#262B36] bg-[#171A21] px-4 py-3">
        <span className="flex h-5 w-5 items-center justify-center">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#343945] border-t-[#7C6FF0]" />
        </span>

        <span className="text-xs text-[#8A8F98]">
          {message}
        </span>
      </div>
    </div>
  );
}