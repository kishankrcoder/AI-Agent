export default function DocumentList({
  documents = [],
  onDelete,
}) {
  return (
    <div className="space-y-2">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center gap-3 rounded-lg border border-[#262B36] bg-[#12151B] p-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1B1F28] text-xs text-[#7C6FF0]">
            PDF
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-[#D7D9DE]">
              {document.name}
            </p>

            <p className="text-xs text-[#666B75]">
              {document.status || "Ready"}
            </p>
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete(document.id)}
              className="text-xs text-[#777C86] hover:text-[#F2545B]"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}