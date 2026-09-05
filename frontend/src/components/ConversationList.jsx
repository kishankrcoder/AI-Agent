import { useState } from "react";

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onRename,
}) {
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");

  function startEditing(conversation) {
    setEditingId(conversation.id);
    setTitle(conversation.title || "");
  }

  async function finishEditing(id) {
    if (title.trim()) {
      await onRename(id, title.trim());
    }

    setEditingId(null);
    setTitle("");
  }

  function cancelEditing() {
    setEditingId(null);
    setTitle("");
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const conversationTitle =
          conversation.title || "Untitled chat";

        const isActive = activeId === conversation.id;
        const isEditing = editingId === conversation.id;

        return (
          <div
            key={conversation.id}
            className={`group flex items-center rounded-lg transition ${
              isActive
                ? "bg-[#1B1F28]"
                : "hover:bg-[#171A21]"
            }`}
          >
            {/* Rename input */}
            {isEditing ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() =>
                  finishEditing(conversation.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    finishEditing(conversation.id);
                  }

                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelEditing();
                  }
                }}
                aria-label="Rename conversation"
                className="min-w-0 flex-1 rounded-md bg-transparent px-3 py-2 text-sm text-white outline-none ring-2 ring-[#7C6FF0]"
              />
            ) : (
              /* Conversation */
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={`min-w-0 flex-1 truncate rounded-md px-3 py-2 text-left text-sm outline-none focus:ring-2 focus:ring-inset focus:ring-[#7C6FF0] ${
                  isActive
                    ? "text-white"
                    : "text-[#B8BBC3]"
                }`}
                aria-current={
                  isActive ? "true" : undefined
                }
                title={conversationTitle}
              >
                {conversationTitle}
              </button>
            )}

            {/* Actions */}
            {!isEditing && (
              <div className="hidden gap-1 pr-1 group-hover:flex group-focus-within:flex">
                {/* Rename */}
                <button
                  type="button"
                  onClick={() =>
                    startEditing(conversation)
                  }
                  className="rounded p-1 text-xs text-[#777C86] transition hover:bg-[#242832] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7C6FF0] focus:ring-offset-1 focus:ring-offset-[#0B0D11]"
                  aria-label={`Rename ${conversationTitle}`}
                  title="Rename conversation"
                >
                  ✎
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() =>
                    onDelete(conversation.id)
                  }
                  className="rounded p-1 text-xs text-[#777C86] transition hover:bg-[#242832] hover:text-[#F2545B] focus:outline-none focus:ring-2 focus:ring-[#F2545B] focus:ring-offset-1 focus:ring-offset-[#0B0D11]"
                  aria-label={`Delete ${conversationTitle}`}
                  title="Delete conversation"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}