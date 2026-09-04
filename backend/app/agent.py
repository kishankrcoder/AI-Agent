from ollama import chat
from app.config import OLLAMA_MODEL
from app.memory import ConversationMemory
from app.web_search import web_search
from app.calculator import calculator
from app.vector_store import search_chunks


class AIAgent:
    def __init__(self):
        self.model = OLLAMA_MODEL
        self.memory = ConversationMemory()

    def run(self, message: str) -> str:

        self.memory.add_message("user", message)

        # --------------------------------
        # PDF / RAG ROUTING
        # --------------------------------

        pdf_keywords = [
            "pdf",
            "document",
            "uploaded",
            "file",
            "notes",
            "chapter",
            "according to the document",
            "according to the pdf",
            "from the document",
        ]

        is_pdf_question = any(
            keyword in message.lower()
            for keyword in pdf_keywords
        )

        if is_pdf_question:

            results = search_chunks(message)

            context = "\n\n".join(results)

            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are a helpful AI assistant. "
                        "Answer the user's question using ONLY "
                        "the provided document context. "
                        "If the answer is not present in the context, "
                        "say that the information was not found "
                        "in the uploaded document."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Document context:\n\n{context}\n\n"
                        f"Question:\n{message}"
                    )
                }
            ]

            response = chat(
                model=self.model,
                messages=messages,
            )

            answer = response.message.content

            self.memory.add_message("assistant", answer)

            return answer

        # --------------------------------
        # NORMAL AGENT + TOOLS
        # --------------------------------

        tools = [
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": (
                        "Search the web for current "
                        "or up-to-date information."
                    ),
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query"
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "calculator",
                    "description": (
                        "Perform mathematical calculations."
                    ),
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "expression": {
                                "type": "string",
                                "description": (
                                    "Mathematical expression"
                                )
                            }
                        },
                        "required": ["expression"]
                    }
                }
            }
        ]

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful personal AI assistant. "
                    "Use web_search for current or recent information. "
                    "Use calculator for mathematical calculations. "
                    "Do not invent information."
                )
            }
        ]

        messages.extend(self.memory.get_messages())

        response = chat(
            model=self.model,
            messages=messages,
            tools=tools,
        )

        if response.message.tool_calls:

            messages.append(response.message)

            for tool_call in response.message.tool_calls:

                tool_name = tool_call.function.name
                arguments = tool_call.function.arguments

                if tool_name == "web_search":

                    result = web_search(
                        arguments.get("query", message)
                    )

                elif tool_name == "calculator":

                    result = calculator(
                        arguments.get("expression", "")
                    )

                else:

                    result = "Unknown tool."

                messages.append({
                    "role": "tool",
                    "content": result,
                })

            final_response = chat(
                model=self.model,
                messages=messages,
                tools=tools,
            )

            answer = final_response.message.content

        else:

            answer = response.message.content

        self.memory.add_message("assistant", answer)

        return answer