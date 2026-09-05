import { useEffect, useState } from "react";
import {
  getMemories,
  deleteMemory,
  clearMemories,
} from "../api/api";

export default function MemoryPanel({ onClose }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);

  async function loadMemories() {
    try {
      setLoading(true);
      setError(null);

      const data = await getMemories();
      setMemories(data?.memories || []);
    } catch (err) {
      console.error("Failed to load memories:", err);
      setError("Could not load memories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemories();
  }, []);

  async function handleDelete(memory) {
    try {
      await deleteMemory(memory);

      setMemories((current) =>
        current.filter((item) => item !== memory)
      );
    } catch (err) {
      console.error("Failed to delete memory:", err);
      setError("Could not delete memory.");
    }
  }

  async function handleClearAll() {
    if (memories.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete all saved memories?"
    );

    if (!confirmed) return;

    try {
      setClearing(true);
      setError(null);

      await clearMemories();
      setMemories([]);
    } catch (err) {
      console.error("Failed to clear memories:", err);
      setError("Could not clear memories.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#2A2F3A] bg-[#15181F] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262B36] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Memory
            </h2>

            <p className="mt-1 text-xs text-[#777C86]">
              Manage information your AI assistant remembers.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[#858A94] transition hover:bg-[#222630] hover:text-white"
            aria-label="Close memory panel"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[55vh] overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#555B68] border-t-white" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}

              <button
                type="button"
                onClick={loadMemories}
                className="mt-3 block text-xs font-medium text-white underline"
              >
                Try again
              </button>
            </div>
          ) : memories.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-3 text-3xl">🧠</div>

              <p className="text-sm font-medium text-white">
                No memories yet
              </p>

              <p className="mt-1 text-xs text-[#777C86]">
                Tell the AI something about yourself and it can remember it.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {memories.map((memory, index) => (
                <div
                  key={`${memory}-${index}`}
                  className="group flex items-start gap-3 rounded-xl border border-[#292E39] bg-[#101319] p-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#20242D] text-sm">
                    🧠
                  </div>

                  <p className="min-w-0 flex-1 text-sm leading-6 text-[#D7D9DE]">
                    {memory}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleDelete(memory)}
                    className="shrink-0 rounded-lg px-2 py-1 text-xs text-[#777C86] opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                    title="Delete memory"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && memories.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#262B36] px-5 py-4">
            <span className="text-xs text-[#666B75]">
              {memories.length}{" "}
              {memories.length === 1 ? "memory" : "memories"} saved
            </span>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={clearing}
              className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clearing ? "Clearing..." : "Clear all"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}