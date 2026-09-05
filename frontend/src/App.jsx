import { useState } from "react";

import ChatWindow from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";

import useChat from "./hooks/useChat";
import { useConversations } from "./hooks/useConversations";


export default function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ==================== CONVERSATIONS ====================

  const {
    conversations,
    activeId,
    setActiveId,
    addConversation,
    removeConversation,
    updateConversationTitle,
  } = useConversations();


  // ==================== SESSION ====================

  const sessionId =
    activeId || "default-session";


  // ==================== CHAT ====================

  const {
    messages,
    loading,
    agentStatus,
    activities,
    error,
    sendUserMessage,
    clearError,
  } = useChat(sessionId);


  // ==================== NEW CHAT ====================

  async function handleNewChat() {
    try {
      const conversation =
        await addConversation();

      if (conversation?.id) {
        setActiveId(conversation.id);
      }

      setMobileSidebarOpen(false);
    } catch (error) {
      console.error(
        "Failed to create new chat:",
        error
      );
    }
  }


  // ==================== SELECT CHAT ====================

  function handleSelectConversation(id) {
    setActiveId(id);
    setMobileSidebarOpen(false);
  }


  // ==================== RETRY ====================

  async function handleRetry() {
    clearError();

    const lastUserMessage =
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role === "user"
        );

    if (lastUserMessage) {
      await sendUserMessage(
        lastUserMessage.content
      );
    }
  }


  // ==================== UI ====================

  return (
    <main className="relative flex h-screen overflow-hidden bg-[#0F1116]">

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onDelete={removeConversation}
        onRename={updateConversationTitle}
      />


      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ===================================================== */}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
          aria-hidden="true"
        />
      )}


      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 md:hidden ${
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <Sidebar
          mobile
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          onDelete={removeConversation}
          onRename={updateConversationTitle}
        />
      </div>


      {/* =====================================================
          MAIN CHAT AREA
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">


        {/* ===================================================
            MOBILE HEADER
        =================================================== */}

        <header className="flex h-14 shrink-0 items-center border-b border-[#262B36] bg-[#0F1116] px-4 md:hidden">

          <button
            type="button"
            onClick={() =>
              setMobileSidebarOpen(true)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-[#A8ACB5] transition hover:bg-[#171A21] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7C6FF0] focus:ring-offset-2 focus:ring-offset-[#0F1116]"
            aria-label="Open sidebar"
          >
            ☰
          </button>


          <div className="ml-3">

            <p className="text-sm font-semibold text-white">
              AI Agent
            </p>

            <p className="text-[10px] text-[#666B75]">
              Personal AI Assistant
            </p>

          </div>

        </header>


        {/* ===================================================
            CHAT WINDOW
        =================================================== */}

        <ChatWindow
          messages={messages}
          loading={loading}
          agentStatus={agentStatus}
          activities={activities}
          error={error}
          onSend={sendUserMessage}
          onRetry={handleRetry}
        />

      </div>

    </main>
  );
}