export default function MessageBubble({
  role,
  content,
  sources = [],
}) {
  const isUser = role === "user";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  }

  return (
    <div
      className={`group flex w-full px-4 py-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[85%] gap-3 sm:max-w-[75%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm ${
            isUser
              ? "border-[#6B5ED1] bg-[#7C6FF0] text-white"
              : "border-[#343945] bg-[#171A21] text-[#B8BBC3]"
          }`}
        >
          {isUser ? "U" : "✦"}
        </div>

        {/* Message */}
        <div className="min-w-0">
          <div
            className={`mb-1 text-xs font-medium ${
              isUser
                ? "text-right text-[#8F84E8]"
                : "text-[#8A8F98]"
            }`}
          >
            {isUser ? "You" : "AI Agent"}
          </div>

          <div
            className={`relative rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
              isUser
                ? "rounded-tr-sm bg-[#7C6FF0] text-white"
                : "rounded-tl-sm border border-[#262B36] bg-[#171A21] text-[#D7D9DE]"
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              {content}
            </div>

            {/* Copy button for AI messages */}
            {!isUser && (
              <button
                type="button"
                onClick={handleCopy}
                className="mt-3 rounded-md px-2 py-1 text-xs text-[#777C86] opacity-0 transition hover:bg-[#242832] hover:text-white group-hover:opacity-100"
                title="Copy response"
              >
                Copy
              </button>
            )}

            {/* Sources */}
            {!isUser && sources.length > 0 && (
              <div className="mt-3 border-t border-[#262B36] pt-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs">🔎</span>
                  <p className="text-xs font-medium text-[#A8ACB5]">
                    Sources
                  </p>
                </div>

                <div className="space-y-1">
                  {sources.map((source, index) => (
                    <div
                      key={source.id || index}
                      className="rounded-md bg-[#12151B] px-2 py-1.5 text-xs text-[#8F84E8]"
                    >
                      {source.title ||
                        source.name ||
                        `Source ${index + 1}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}