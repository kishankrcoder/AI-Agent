import uuid
import chromadb


client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="documents"
)


def add_chunks(
    chunks,
    document_name="document.pdf"
):
    if not chunks:
        return

    ids = [
        f"chunk_{uuid.uuid4().hex}"
        for _ in chunks
    ]

    metadatas = [
        {
            "document": document_name,
            "chunk_index": index,
        }
        for index in range(len(chunks))
    ]

    collection.add(
        documents=chunks,
        ids=ids,
        metadatas=metadatas,
    )


def search_chunks(
    query: str,
    n_results: int = 3
):
    if collection.count() == 0:
        return []

    result_count = min(
        n_results,
        collection.count()
    )

    results = collection.query(
        query_texts=[query],
        n_results=result_count,
    )

    return results.get(
        "documents",
        [[]]
    )[0]