from app.pdf_loader import extract_text_from_pdf
from app.chunker import chunk_text
from app.vector_store import add_chunks


def ingest_pdf(file_path: str):
    text = extract_text_from_pdf(file_path)

    if not text.strip():
        return "No text found in PDF."

    chunks = chunk_text(text)

    add_chunks(chunks)

    return f"PDF processed successfully. {len(chunks)} chunks stored."