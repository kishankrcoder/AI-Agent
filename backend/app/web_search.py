from ddgs import DDGS


def web_search(query: str, max_results: int = 5) -> str:
    """
    Search the web and return useful search results.
    """

    try:
        results = DDGS().text(
            query,
            max_results=max_results
        )

        if not results:
            return "No useful search results found."

        formatted_results = []

        for result in results:
            title = result.get("title", "")
            body = result.get("body", "")
            url = result.get("href", "")

            formatted_results.append(
                f"Title: {title}\n"
                f"Summary: {body}\n"
                f"URL: {url}"
            )

        return "\n\n".join(formatted_results)

    except Exception as e:
        return f"Web search failed: {str(e)}"