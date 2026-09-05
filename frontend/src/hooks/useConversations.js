import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getConversations,
  createConversation,
  deleteConversation,
  renameConversation,
} from "../api/api";


export function useConversations() {
  const [conversations, setConversations] =
    useState([]);

  const [activeId, setActiveId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);


  // ==================== LOAD CONVERSATIONS ====================

  const loadConversations =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await getConversations();

        const list = data || [];

        setConversations(list);

        // Select first conversation
        // if nothing is currently selected.
        if (
          list.length > 0 &&
          !activeId
        ) {
          setActiveId(list[0].id);
        }

      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, [activeId]);


  // ==================== INITIAL LOAD ====================

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);


  // ==================== NEW CHAT ====================

  const addConversation =
    async () => {
      try {
        const conversation =
          await createConversation();

        setConversations(
          (current) => [
            conversation,
            ...current,
          ]
        );

        // IMPORTANT:
        // Immediately open the newly created chat.
        setActiveId(conversation.id);

        return conversation;

      } catch (error) {
        console.error(
          "Failed to create conversation:",
          error
        );

        throw error;
      }
    };


  // ==================== DELETE ====================

  const removeConversation =
    async (id) => {
      try {
        await deleteConversation(id);

        setConversations(
          (current) =>
            current.filter(
              (conversation) =>
                conversation.id !== id
            )
        );

        // If the currently active chat
        // was deleted, open another one.
        if (activeId === id) {
          const remaining =
            conversations.filter(
              (conversation) =>
                conversation.id !== id
            );

          if (remaining.length > 0) {
            setActiveId(
              remaining[0].id
            );
          } else {
            setActiveId(null);
          }
        }

      } catch (error) {
        console.error(
          "Failed to delete conversation:",
          error
        );

        throw error;
      }
    };


  // ==================== RENAME ====================

  const updateConversationTitle =
    async (id, title) => {
      try {
        const updated =
          await renameConversation(
            id,
            title
          );

        setConversations(
          (current) =>
            current.map(
              (conversation) =>
                conversation.id === id
                  ? {
                      ...conversation,
                      title:
                        updated.title,
                    }
                  : conversation
            )
        );

        return updated;

      } catch (error) {
        console.error(
          "Failed to rename conversation:",
          error
        );

        throw error;
      }
    };


  // ==================== RETURN ====================

  return {
    conversations,
    activeId,
    setActiveId,
    loading,

    addConversation,
    removeConversation,
    updateConversationTitle,

    loadConversations,
  };
}