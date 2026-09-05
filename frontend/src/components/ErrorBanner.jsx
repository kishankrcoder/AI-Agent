export default function ErrorBanner({
  message,
  onRetry,
}) {
  if (!message) return null;

  return (
    <div
      className="mx-4 my-3 rounded-xl border border-[#4A2529] bg-[#211417] px-4 py-3"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#321B1F] text-sm text-[#F2545B]">
          !
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#F0B4B7]">
            Something went wrong
          </p>

          <p className="mt-1 break-words text-xs leading-5 text-[#B98286]">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg border border-[#5A3035] bg-[#2A191C] px-3 py-1.5 text-xs font-medium text-[#F0B4B7] transition hover:bg-[#321B1F] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#F2545B] focus:ring-offset-2 focus:ring-offset-[#211417]"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}