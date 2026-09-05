const icons = {
  thinking: "◌",
  searching: "⌕",
  calculating: "∑",
  reading: "▤",
  executing: "▶",
  completed: "✓",
  error: "!",
};

export default function AgentActivity({ activities = [] }) {
  if (!activities.length) return null;

  return (
    <div className="mx-4 my-2 rounded-2xl border border-[#262B36] bg-[#12151B] p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1B1F28] text-sm text-[#7C6FF0]">
            ✦
          </div>

          <div>
            <p className="text-xs font-semibold text-[#D7D9DE]">
              Agent activity
            </p>

            <p className="text-[10px] text-[#666B75]">
              Working on your request
            </p>
          </div>
        </div>

        <span className="h-2 w-2 animate-pulse rounded-full bg-[#7C6FF0]" />
      </div>

      {/* Timeline */}
      <div className="relative ml-3">
        {/* Timeline line */}
        <div className="absolute left-3 top-3 h-[calc(100%-24px)] w-px bg-[#262B36]" />

        <div className="space-y-3">
          {activities.map((activity, index) => {
            const isCompleted =
              activity.status === "completed";

            const isError =
              activity.status === "error";

            const isCurrent =
              !isCompleted &&
              !isError &&
              index === activities.length - 1;

            return (
              <div
                key={activity.id || index}
                className="relative flex items-center gap-3"
              >
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                    isError
                      ? "border-[#4A2529] bg-[#211417] text-[#F2545B]"
                      : isCompleted
                        ? "border-[#343945] bg-[#171A21] text-[#7C6FF0]"
                        : "border-[#4A4565] bg-[#1D1A2B] text-[#9A8FF5]"
                  }`}
                >
                  {isCurrent ? (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#9A8FF5]" />
                  ) : (
                    icons[activity.type] || "•"
                  )}
                </div>

                {/* Label */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs ${
                      isCurrent
                        ? "font-medium text-[#E8E9ED]"
                        : isError
                          ? "text-[#F2545B]"
                          : "text-[#A8ACB5]"
                    }`}
                  >
                    {activity.label}
                  </p>
                </div>

                {/* Status */}
                {isCompleted && (
                  <span className="text-xs text-[#7C6FF0]">
                    ✓
                  </span>
                )}

                {isCurrent && (
                  <span className="text-[10px] text-[#666B75]">
                    Working
                  </span>
                )}

                {isError && (
                  <span className="text-[10px] text-[#F2545B]">
                    Failed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}