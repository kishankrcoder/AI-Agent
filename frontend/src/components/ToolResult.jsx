export default function ToolResult({
  tool,
  result,
}) {
  if (!tool && !result) return null;

  return (
    <div className="mx-4 rounded-xl border border-[#262B36] bg-[#12151B] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-md bg-[#1B1F28] px-2 py-1 font-mono text-xs text-[#7C6FF0]">
          {tool || "Tool"}
        </span>

        <span className="text-xs text-[#666B75]">
          Result
        </span>
      </div>

      <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#0F1116] p-3 font-mono text-xs text-[#A8ACB5]">
        {typeof result === "string"
          ? result
          : JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}