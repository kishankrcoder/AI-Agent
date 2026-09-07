from groq import Groq

from app.config import OLLAMA_MODEL
from app.memory import ConversationMemory
from app.web_search import web_search
from app.calculator import calculator
from app.vector_store import search_chunks

import os


class AIAgent:

    def __init__(self):
        self.model = "llama-3.3-70b-versatile"
        self.client = Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.memory = ConversationMemory()

    def run(self, session_id: str, message: str):

        tool_usage = []
        sources = []

        self.memory.add_message(
            session_id,
            "user",
            message
        )

        lower_message = message.lower().strip()

        # ==========================================
        # PERSONAL MEMORY
        # ==========================================

        all_memories = self.memory.get_memories()

        relevant_memories = (
            self.memory.get_relevant_memories(
                message,
                max_memories=5
            )
        )

        if not relevant_memories:
            relevant_memories = all_memories[:5]

        # ==========================================
        # DIRECT NAME QUESTION
        # ==========================================

        if any(
            phrase in lower_message
            for phrase in [
                "what is my name",
                "what's my name",
                "whats my name",
                "do you know my name",
                "tell me my name",
            ]
        ):

            name_memory = None

            for memory in all_memories:
                if "name is" in memory.lower():
                    name_memory = memory
                    break

            if name_memory:
                answer = name_memory.replace(
                    "The user's name is ",
                    "Your name is "
                )
            else:
                answer = (
                    "I don't have your name saved yet. "
                    "Tell me your name and I'll remember it."
                )

            self.memory.add_message(
                session_id,
                "assistant",
                answer
            )

            return {
                "response": answer,
                "tool_usage": [],
                "sources": [],
            }

        # ==========================================
        # MEMORY EXTRACTION
        # ==========================================

        memory_triggers = [
            "my name is",
            "i am",
            "i'm",
            "i live in",
            "i study",
            "i work",
            "my college is",
            "my university is",
            "my goal is",
            "i like",
            "i love",
            "remember that",
            "remember this",
        ]

        should_store_memory = any(
            trigger in lower_message
            for trigger in memory_triggers
        )

        if should_store_memory:

            memory_prompt = [
                {
                    "role": "system",
                    "content": (
                        "Extract useful long-term personal "
                        "information about the user.\n\n"
                        "Always write the fact as a complete "
                        "sentence.\n\n"
                        "Examples:\n"
                        "User: My name is Zoro\n"
                        "Output: The user's name is Zoro.\n\n"
                        "User: I study Computer Science\n"
                        "Output: The user studies Computer Science.\n\n"
                        "User: My goal is to become an AI engineer\n"
                        "Output: The user's goal is to become "
                        "an AI engineer.\n\n"
                        "Return ONLY the fact.\n"
                        "If there is no useful personal fact, "
                        "return NONE."
                    ),
                },
                {
                    "role": "user",
                    "content": message,
                },
            ]

            memory_response = self.client.chat.completions.create(
                model=self.model,
                messages=memory_prompt,
                temperature=0,
            )

            extracted_memory = (
                memory_response.choices[0].message.content.strip()
            )

            if (
                extracted_memory
                and extracted_memory.upper() != "NONE"
            ):

                self.memory.add_memory(
                    extracted_memory
                )

                relevant_memories = (
                    self.memory.get_relevant_memories(
                        message,
                        max_memories=5
                    )
                )

                if not relevant_memories:
                    relevant_memories = (
                        self.memory.get_memories()[:5]
                    )

        # ==========================================
        # PDF / RAG
        # ==========================================

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
            keyword in lower_message
            for keyword in pdf_keywords
        )

        if is_pdf_question:

            results = search_chunks(
                message,
                n_results=4
            )

            if not results:
                context = (
                    "No document content is currently available."
                )
            else:
                context = "\n\n".join(results)

            tool_usage.append({
                "name": "PDF / RAG",
                "status": "completed",
            })

            sources.append("Uploaded PDF")

            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are a helpful AI assistant.\n"
                        "Answer the user's question using ONLY "
                        "the provided document context.\n"
                        "If the answer is not present in the "
                        "context, say that the information was "
                        "not found in the uploaded document.\n\n"
                        "Document context:\n"
                        f"{context}"
                    ),
                },
                {
                    "role": "user",
                    "content": message,
                },
            ]

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.2,
            )

            answer = response.choices[0].message.content

            self.memory.add_message(
                session_id,
                "assistant",
                answer
            )

            return {
                "response": answer,
                "tool_usage": tool_usage,
                "sources": sources,
            }

        # ==========================================
        # TOOLS
        # ==========================================

        tools = [
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": (
                        "Search the web for current, recent, "
                        "or up-to-date information."
                    ),
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query",
                            }
                        },
                        "required": ["query"],
                    },
                },
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
                                ),
                            }
                        },
                        "required": ["expression"],
                    },
                },
            },
        ]

        # ==========================================
        # MEMORY CONTEXT
        # ==========================================

        memory_context = "\n".join(
            f"- {item}"
            for item in relevant_memories
        )

        if not memory_context:
            memory_context = (
                "No relevant personal memory found."
            )

        # ==========================================
        # SYSTEM PROMPT
        # ==========================================

        system_prompt = (
            "You are a helpful personal AI assistant.\n\n"
            "===== RELEVANT USER MEMORY =====\n"
            f"{memory_context}\n"
            "==================================\n\n"
            "Use the memory above whenever it is relevant.\n"
            "Do not claim that you do not know something "
            "if it is present in memory.\n\n"
            "Use web_search for current information.\n"
            "Use calculator for mathematical calculations.\n"
            "Do not invent information."
        )

        messages = [
            {
                "role": "system",
                "content": system_prompt,
            }
        ]

        messages.extend(
            self.memory.get_messages(session_id)
        )

        # ==========================================
        # FIRST AI RESPONSE
        # ==========================================

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools,
            tool_choice="auto",
            temperature=0.2,
        )

        assistant_message = response.choices[0].message

        # ==========================================
        # TOOL CALL
        # ==========================================

        if assistant_message.tool_calls:

            messages.append({
                "role": "assistant",
                "content": assistant_message.content,
                "tool_calls": [
                    {
                        "id": tool_call.id,
                        "type": "function",
                        "function": {
                            "name": tool_call.function.name,
                            "arguments": tool_call.function.arguments,
                        },
                    }
                    for tool_call in assistant_message.tool_calls
                ],
            })

            for tool_call in assistant_message.tool_calls:

                tool_name = tool_call.function.name

                import json

                arguments = json.loads(
                    tool_call.function.arguments
                )

                if tool_name == "web_search":

                    query = arguments.get(
                        "query",
                        message
                    )

                    result = web_search(query)

                    tool_usage.append({
                        "name": "Web Search",
                        "status": "completed",
                    })

                    sources.append(
                        f"Web search: {query}"
                    )

                elif tool_name == "calculator":

                    expression = arguments.get(
                        "expression",
                        ""
                    )

                    result = calculator(
                        expression
                    )

                    tool_usage.append({
                        "name": "Calculator",
                        "status": "completed",
                    })

                else:

                    result = "Unknown tool."

                    tool_usage.append({
                        "name": tool_name,
                        "status": "error",
                    })

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result,
                })

            # ==========================================
            # FINAL RESPONSE
            # ==========================================

            final_response = (
                self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.2,
                )
            )

            answer = (
                final_response
                .choices[0]
                .message
                .content
            )

        else:

            answer = assistant_message.content

        # ==========================================
        # SAVE RESPONSE
        # ==========================================

        self.memory.add_message(
            session_id,
            "assistant",
            answer
        )

        return {
            "response": answer,
            "tool_usage": tool_usage,
            "sources": sources,
        }