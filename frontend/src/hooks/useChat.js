import { useEffect, useRef, useState } from "react";
import {
  sendMessage,
  getConversationMessages,
} from "../api/api";


export default function useChat(sessionId) {

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);

  const messagesBySession = useRef({});
  const currentSessionRef = useRef(sessionId);


  useEffect(() => {

    let cancelled = false;

    async function loadMessages() {

      currentSessionRef.current =
        sessionId;

      setError(null);
      setLoading(false);
      setAgentStatus(null);
      setActivities([]);

      if (!sessionId) {
        setMessages([]);
        return;
      }

      const cachedMessages =
        messagesBySession.current[
          sessionId
        ];

      if (cachedMessages) {
        setMessages(cachedMessages);
      } else {
        setMessages([]);
      }

      try {

        const history =
          await getConversationMessages(
            sessionId
          );

        if (
          cancelled ||
          currentSessionRef.current !== sessionId
        ) {
          return;
        }

        const formattedMessages =
          (history || []).map(
            (message, index) => ({
              id:
                message.id ||
                `${sessionId}-${index}-${crypto.randomUUID()}`,

              role:
                message.role,

              content:
                message.content,

              tool_usage:
                message.tool_usage || [],

              sources:
                message.sources || [],
            })
          );

        messagesBySession.current[
          sessionId
        ] = formattedMessages;

        setMessages(
          formattedMessages
        );

      } catch (err) {

        console.error(
          "Failed to load conversation:",
          err
        );

        if (
          !cancelled &&
          currentSessionRef.current === sessionId
        ) {
          setError(
            "Could not load conversation history."
          );
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };

  }, [sessionId]);


  function updateMessages(updater) {

    const activeSession =
      currentSessionRef.current;

    setMessages(
      (previousMessages) => {

        const nextMessages =
          typeof updater === "function"
            ? updater(previousMessages)
            : updater;

        messagesBySession.current[
          activeSession
        ] = nextMessages;

        return nextMessages;
      }
    );
  }


  async function sendUserMessage(message) {

    const cleanMessage =
      message.trim();

    if (
      !cleanMessage ||
      loading
    ) {
      return;
    }

    const activeSession =
      currentSessionRef.current;

    if (!activeSession) {

      setError(
        "No active conversation."
      );

      return;
    }

    setError(null);

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanMessage,
    };

    updateMessages(
      (previousMessages) => [
        ...previousMessages,
        userMessage,
      ]
    );


    setActivities([
      {
        id: crypto.randomUUID(),
        type: "thinking",
        label:
          "Understanding your request",
        status: "completed",
      },

      {
        id: crypto.randomUUID(),
        type: "thinking",
        label:
          "Preparing your AI agent",
        status: "active",
      },
    ]);


    setLoading(true);
    setAgentStatus("Thinking");


    try {

      const result =
        await sendMessage(
          activeSession,
          cleanMessage
        );


      if (
        currentSessionRef.current !==
        activeSession
      ) {
        return;
      }


      const toolUsage =
        result?.tool_usage || [];


      if (toolUsage.length > 0) {

        setActivities(
          toolUsage.map(
            (tool, index) => ({
              id:
                `${crypto.randomUUID()}-${index}`,

              type: "tool",

              label:
                `${tool.name} ${tool.status === "completed" ? "completed" : ""}`,

              status:
                tool.status === "completed"
                  ? "completed"
                  : "error",
            })
          )
        );

      } else {

        setActivities(
          (previousActivities) =>
            previousActivities.map(
              (activity) =>
                activity.status === "active"
                  ? {
                      ...activity,
                      status:
                        "completed",
                    }
                  : activity
            )
        );
      }


      const assistantMessage = {

        id: crypto.randomUUID(),

        role: "assistant",

        content:
          result?.response ||
          "I couldn't generate a response.",

        tool_usage:
          toolUsage,

        sources:
          result?.sources || [],
      };


      updateMessages(
        (previousMessages) => [
          ...previousMessages,
          assistantMessage,
        ]
      );


    } catch (err) {

      if (
        currentSessionRef.current !==
        activeSession
      ) {
        return;
      }


      setActivities(
        (previousActivities) =>
          previousActivities.map(
            (activity) =>
              activity.status === "active"
                ? {
                    ...activity,
                    status: "error",
                  }
                : activity
          )
      );


      setError(
        err?.message ||
        "Something went wrong."
      );


    } finally {

      if (
        currentSessionRef.current ===
        activeSession
      ) {

        setLoading(false);
        setAgentStatus(null);

      }
    }
  }


  function clearError() {
    setError(null);
  }


  return {
    messages,
    loading,
    agentStatus,
    activities,
    error,
    sendUserMessage,
    clearError,
  };
}