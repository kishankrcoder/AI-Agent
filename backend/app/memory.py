import sqlite3
import uuid


class ConversationMemory:

    def __init__(self, db_path="agent_memory.db"):
        self.db_path = db_path
        self.create_tables()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    # ==================== TABLES ====================

    def create_tables(self):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.commit()
        connection.close()

    # ==================== CONVERSATIONS ====================

    def create_conversation(self, title="New Chat"):
        session_id = str(uuid.uuid4())

        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            "INSERT INTO conversations (id, title) VALUES (?, ?)",
            (session_id, title)
        )

        connection.commit()
        connection.close()

        return {
            "id": session_id,
            "title": title
        }

    def get_conversations(self):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id, title, created_at
            FROM conversations
            ORDER BY created_at DESC
        """)

        rows = cursor.fetchall()

        connection.close()

        return [
            {
                "id": row[0],
                "title": row[1],
                "created_at": row[2]
            }
            for row in rows
        ]

    def delete_conversation(self, session_id):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            "DELETE FROM messages WHERE session_id = ?",
            (session_id,)
        )

        cursor.execute(
            "DELETE FROM conversations WHERE id = ?",
            (session_id,)
        )

        connection.commit()
        connection.close()

    def rename_conversation(self, session_id, title):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE conversations
            SET title = ?
            WHERE id = ?
            """,
            (title, session_id)
        )

        connection.commit()
        connection.close()

    # ==================== CHAT MESSAGES ====================

    def add_message(self, session_id, role, content):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO messages
            (session_id, role, content)
            VALUES (?, ?, ?)
            """,
            (session_id, role, content)
        )

        connection.commit()
        connection.close()

    def get_messages(self, session_id):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT role, content
            FROM messages
            WHERE session_id = ?
            ORDER BY id
            """,
            (session_id,)
        )

        rows = cursor.fetchall()

        connection.close()

        return [
            {
                "role": role,
                "content": content
            }
            for role, content in rows
        ]

    # ==================== PERSONAL MEMORY ====================

    def add_memory(self, content):
        content = content.strip()

        if not content:
            return

        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT OR IGNORE INTO memories
            (content)
            VALUES (?)
            """,
            (content,)
        )

        connection.commit()
        connection.close()

    def get_memories(self):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT content
            FROM memories
            ORDER BY id
        """)

        rows = cursor.fetchall()

        connection.close()

        return [
            row[0]
            for row in rows
        ]

    # ==================== RELEVANT MEMORY ====================

    def get_relevant_memories(
        self,
        query: str,
        max_memories: int = 5
    ):
        """
        Return only memories that share important words
        with the user's current question.
        """

        memories = self.get_memories()

        if not memories:
            return []

        query_words = {
            word.lower().strip(".,!?")
            for word in query.split()
            if len(word) > 2
        }

        scored_memories = []

        for memory in memories:

            memory_words = {
                word.lower().strip(".,!?")
                for word in memory.split()
                if len(word) > 2
            }

            score = len(
                query_words.intersection(memory_words)
            )

            if score > 0:
                scored_memories.append(
                    (score, memory)
                )

        scored_memories.sort(
            key=lambda item: item[0],
            reverse=True
        )

        return [
            memory
            for score, memory in scored_memories[:max_memories]
        ]

    # ==================== MEMORY MANAGEMENT ====================

    def delete_memory(self, content):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM memories
            WHERE content = ?
            """,
            (content,)
        )

        connection.commit()
        connection.close()

    def clear_memories(self):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            "DELETE FROM memories"
        )

        connection.commit()
        connection.close()