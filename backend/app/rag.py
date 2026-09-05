from app.pdf_loader import extract_text_from_pdf
from app.chunker import chunk_text
from app.vector_store import add_chunks


def ingest_pdf(file_path: str, document_name: str = "document.pdf"):
    text = extract_text_from_pdf(file_path)

    if not text.strip():
        return "No text found in PDF."

    chunks = chunk_text(text)

    add_chunks(
        chunks,
        document_name=document_name,
    )

    return (
        f"PDF processed successfully. "
        f"{len(chunks)} chunks stored."
    )