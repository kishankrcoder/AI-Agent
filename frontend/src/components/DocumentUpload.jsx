import { useRef, useState } from "react";
import { uploadDocument } from "../api/api";

export default function DocumentUpload({ onUploaded }) {
  const inputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  async function handleFile(file) {
    if (!file) return;

    setError(null);
    setUploadedFile(null);

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    setUploading(true);

    try {
      const document = await uploadDocument(file);

      setUploadedFile({
        name: document?.filename || file.name,
        message:
          document?.message ||
          "Document processed successfully.",
      });

      onUploaded?.(document);
    } catch (err) {
      console.error("PDF upload failed:", err);
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleChooseFile() {
    setError(null);
    inputRef.current?.click();
  }

  return (
    <div className="rounded-xl border border-dashed border-[#343945] bg-[#12151B] p-5">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(event) =>
          handleFile(event.target.files?.[0])
        }
      />

      {/* Upload Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#343945] bg-[#171A21] text-lg">
          📄
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-[#D7D9DE]">
            Upload a PDF
          </p>

          <p className="mt-1 text-xs leading-5 text-[#666B75]">
            Upload notes, study material, or documents and
            ask the agent questions about them.
          </p>
        </div>
      </div>

      {/* Upload Button */}
      <button
        type="button"
        onClick={handleChooseFile}
        disabled={uploading}
        className="mt-4 w-full rounded-lg border border-[#343945] bg-[#171A21] px-4 py-2.5 text-xs font-medium text-[#D7D9DE] transition hover:border-[#4A4565] hover:bg-[#1D2029] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#666B75] border-t-white" />
            Processing PDF...
          </span>
        ) : (
          "Choose PDF"
        )}
      </button>

      {/* Success */}
      {uploadedFile && (
        <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <div className="flex items-start gap-2">
            <span className="text-sm">✓</span>

            <div className="min-w-0">
              <p className="text-xs font-medium text-green-300">
                PDF ready
              </p>

              <p className="mt-1 truncate text-xs text-[#A8ACB5]">
                {uploadedFile.name}
              </p>

              <p className="mt-1 text-[10px] text-[#666B75]">
                {uploadedFile.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-xs text-red-300">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}