import MessageBubble from "./MessageBubble";
import AgentStatus from "./AgentStatus";
import AgentActivity from "./AgentActivity";
import ErrorBanner from "./ErrorBanner";
import MessageInput from "./MessageInput";
import LoadingState from "./LoadingState";
import DocumentUpload from "./DocumentUpload";

export default function ChatWindow({
  messages,
  loading,
  agentStatus,
  activities,
  error,
  onSend,
  onRetry,
}) {
  const starterPrompts = [
    {
      icon: "🔎",
      title: "Search the web",
      description:
        "Find current information on a topic.",
      prompt:
        "Search the web for the latest information about ",
    },
    {
      icon: "🧮",
      title: "Calculate something",
      description:
        "Solve calculations and work through problems.",
      prompt: "Help me calculate ",
    },
    {
      icon: "✨",
      title: "Create something",
      description:
        "Draft plans, messages, ideas, and more.",
      prompt: "Help me create ",
    },
  ];

  function handleStarterClick(prompt) {
    onSend(prompt);
  }

  const showWelcome = messages.length === 0 && !loading;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-[#0F1116]">
      <div
        className="flex-1 overflow-y-auto py-6"
        aria-live="polite"
      >
        {/* Empty / Welcome State */}
        {showWelcome && (
          <div className="flex min-h-full items-center justify-center px-4 sm:px-6">
            <div className="w-full max-w-2xl text-center">

              {/* Hero */}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#343945] bg-[#171A21] text-2xl shadow-lg">
                ✦
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Personal AI Agent
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#777C86]">
                Your intelligent workspace for conversations,
                documents, web research, calculations, and
                multi-step tasks.
              </p>

              {/* PDF Upload */}
              <div className="mx-auto mt-8 w-full max-w-2xl text-left">
                <DocumentUpload />
              </div>

              {/* Starter cards */}
              <div className="mx-auto mt-4 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                {starterPrompts.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() =>
                      handleStarterClick(item.prompt)
                    }
                    disabled={loading}
                    className="group rounded-2xl border border-[#262B36] bg-[#12151B] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#454052] hover:bg-[#171A21] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#7C6FF0] focus:ring-offset-2 focus:ring-offset-[#0F1116]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1D1A2B] text-lg">
                        {item.icon}
                      </span>

                      <div className="min-w-0">
                        <h2 className="text-sm font-medium text-[#E8E9ED]">
                          {item.title}
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-[#777C86]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="mt-6 text-xs text-[#555A64]">
                Upload a document or choose an option above
                to get started.
              </p>
            </div>
          </div>
        )}

        {/* Initial loading state */}
        {loading &&
          messages.length === 0 &&
          !activities?.length && (
            <LoadingState message="Preparing your AI agent..." />
          )}

        {/* Messages */}
        <div className="space-y-1">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              sources={message.sources}
            />
          ))}
        </div>

        {/* Agent activity */}
        {loading && activities?.length > 0 && (
          <AgentActivity activities={activities} />
        )}

        {/* Current agent status */}
        {loading && (
          <AgentStatus
            status={agentStatus || "thinking"}
          />
        )}

        {/* Error */}
        {error && (
          <ErrorBanner
            message={error}
            onRetry={onRetry}
          />
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={onSend}
        disabled={loading}
      />
    </div>
  );
}