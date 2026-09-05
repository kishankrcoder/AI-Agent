import { useRef, useState } from "react";
import { uploadDocument } from "../api/api";

export default function MessageInput({
  onSend,
  disabled = false,
}) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Project currently supports PDF documents
    if (selectedFile.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      setFile(null);
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const uploadedDocument = await uploadDocument(selectedFile);

      setFile({
        name: selectedFile.name,
        document: uploadedDocument,
      });
    } catch (err) {
      setUploadError(err.message || "Failed to upload PDF.");
      setFile(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeFile() {
    setFile(null);
    setUploadError(null);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (disabled || uploading) return;

    const trimmedMessage = message.trim();

    if (!trimmedMessage && !file) return;

    // Keep the existing chat API compatible.
    // The uploaded document is available for later backend integration.
    onSend(trimmedMessage);

    setMessage("");
    setFile(null);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-[#262B36] bg-[#0F1116] p-4"
    >
      <div className="mx-auto max-w-4xl">

        {/* Selected PDF */}
        {file && (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-[#262B36] bg-[#171A21] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-lg">📄</span>

              <span className="truncate text-sm text-[#B8BBC3]">
                {file.name}
              </span>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="ml-3 text-sm text-[#888D98] hover:text-white"
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div className="mb-2 rounded-lg border border-[#4A2529] bg-[#211417] px-3 py-2 text-xs text-[#F2545B]">
            {uploadError}
          </div>
        )}

        {/* Input box */}
        <div className="flex items-end gap-2 rounded-xl border border-[#262B36] bg-[#171A21] p-2 focus-within:border-[#7C6FF0]">

          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl text-[#A8ACB5] transition hover:bg-[#242832] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Attach PDF"
            title="Attach PDF"
          >
            📎
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled || uploading}
            rows={1}
            placeholder={
              uploading
                ? "Uploading PDF..."
                : disabled
                  ? "Agent is thinking..."
                  : file
                    ? "Ask something about this document..."
                    : "Message your AI agent..."
            }
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-[#666B75] disabled:cursor-not-allowed disabled:opacity-60"
          />

          {/* Send */}
          <button
            type="submit"
            disabled={
              disabled ||
              uploading ||
              (!message.trim() && !file)
            }
            className="rounded-lg bg-[#7C6FF0] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploading ? "Uploading..." : "Send"}
          </button>
        </div>
      </div>
    </form>
  );
}