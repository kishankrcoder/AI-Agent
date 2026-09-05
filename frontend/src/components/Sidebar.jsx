import { useState } from "react";
import ConversationList from "./ConversationList";
import MemoryPanel from "./MemoryPanel";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onRename,
  mobile = false,
}) {
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);

  return (
    <>
      <aside
        className={
          mobile
            ? "flex h-full w-72 shrink-0 flex-col border-r border-[#262B36] bg-[#0B0D11]"
            : "hidden h-full w-72 shrink-0 flex-col border-r border-[#262B36] bg-[#0B0D11] md:flex"
        }
      >
        {/* Header */}
        <div className="border-b border-[#262B36] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#343945] bg-[#171A21] text-[#B8BBC3]">
              ✦
            </div>

            <div>
              <h1 className="text-sm font-semibold text-white">
                AI Agent
              </h1>

              <p className="text-xs text-[#666B75]">
                Personal AI Assistant
              </p>
            </div>
          </div>
        </div>

        {/* New Chat */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#343945] bg-[#171A21] px-4 py-3 text-sm font-medium text-[#D7D9DE] transition hover:border-[#4A4565] hover:bg-[#1D2029] hover:text-white active:scale-[0.98]"
          >
            <span className="text-lg leading-none">+</span>
            New Chat
          </button>
        </div>

        {/* Conversation history */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="mb-2 px-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#555A64]">
              Recent Chats
            </p>
          </div>

          {conversations.length > 0 ? (
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={onSelect}
              onDelete={onDelete}
              onRename={onRename}
            />
          ) : (
            <div className="px-2 py-6 text-center">
              <p className="text-xs text-[#555A64]">
                No conversations yet
              </p>
            </div>
          )}
        </div>

        {/* Memory Button */}
        <div className="border-t border-[#262B36] px-4 pt-3">
          <button
            type="button"
            onClick={() => setShowMemoryPanel(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition hover:border-[#292E39] hover:bg-[#171A21]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171A21] text-sm">
              🧠
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#B8BBC3]">
                Memory
              </p>

              <p className="mt-0.5 text-[10px] text-[#555A64]">
                Manage saved memories
              </p>
            </div>

            <span className="text-xs text-[#555A64]">
              →
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-[#262B36] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#8A8F98]">
                Personal AI Agent
              </p>

              <p className="mt-0.5 text-[10px] text-[#555A64]">
                Frontend workspace
              </p>
            </div>

            <div className="rounded-md border border-[#262B36] px-2 py-1 text-[10px] text-[#555A64]">
              v1.0
            </div>
          </div>
        </div>
      </aside>

      {/* Memory Modal */}
      {showMemoryPanel && (
        <MemoryPanel
          onClose={() => setShowMemoryPanel(false)}
        />
      )}
    </>
  );
}
