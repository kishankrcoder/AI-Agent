const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK !== "false";


// ==================== GENERIC REQUEST ====================

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = await response.json();
      message =
        data.detail ||
        data.message ||
        message;
    } catch {}

    throw new Error(message);
  }

  return response.json();
}


// ==================== CHAT ====================

export async function sendMessage(
  sessionId,
  message
) {
  if (USE_MOCK) {
    await new Promise(
      (resolve) => setTimeout(resolve, 900)
    );

    return {
      response: `(mock) You said: "${message}"`,
      tool_usage: [],
      sources: [],
    };
  }

  return request("/chat", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      message,
    }),
  });
}


// ==================== CONVERSATIONS ====================

export async function getConversations() {
  if (USE_MOCK) return [];

  return request("/conversations");
}


export async function createConversation() {
  if (USE_MOCK) {
    return {
      id: crypto.randomUUID(),
      title: "New Chat",
    };
  }

  return request("/conversations", {
    method: "POST",
  });
}


export async function getConversationMessages(
  sessionId
) {
  if (USE_MOCK) return [];

  return request(
    `/conversations/${sessionId}/messages`
  );
}


export async function deleteConversation(id) {
  if (USE_MOCK) return;

  return request(
    `/conversations/${id}`,
    {
      method: "DELETE",
    }
  );
}


export async function renameConversation(
  id,
  title
) {
  if (USE_MOCK) {
    return {
      id,
      title,
    };
  }

  return request(
    `/conversations/${id}?title=${encodeURIComponent(title)}`,
    {
      method: "PATCH",
    }
  );
}


// ==================== DOCUMENTS ====================

export async function uploadDocument(file) {
  if (USE_MOCK) {
    await new Promise(
      (resolve) => setTimeout(resolve, 700)
    );

    return {
      id: crypto.randomUUID(),
      name: file.name,
      status: "ready",
    };
  }

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const response = await fetch(
    `${API_BASE}/upload-pdf`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    let message =
      `Upload failed (${response.status})`;

    try {
      const data = await response.json();

      message =
        data.detail ||
        data.message ||
        message;
    } catch {}

    throw new Error(message);
  }

  return response.json();
}


export async function getDocuments() {
  if (USE_MOCK) return [];

  return [];
}


export async function deleteDocument(id) {
  if (USE_MOCK) return;

  return;
}


// ==================== PERSONAL MEMORY ====================

export async function getMemories() {
  if (USE_MOCK) {
    return {
      memories: [
        "ZORO",
        "The user studies Computer Science.",
        "The user's goal is to become an AI engineer.",
      ],
    };
  }

  return request("/memories");
}


export async function deleteMemory(
  content
) {
  if (USE_MOCK) return;

  return request(
    `/memories/item?content=${encodeURIComponent(content)}`,
    {
      method: "DELETE",
    }
  );
}


export async function clearMemories() {
  if (USE_MOCK) return;

  return request(
    "/memories",
    {
      method: "DELETE",
    }
  );
}