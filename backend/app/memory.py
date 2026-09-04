import sqlite3


class ConversationMemory:

    def __init__(self, db_path="agent_memory.db"):
        self.db_path = db_path
        self.create_table()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def create_table(self):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                content TEXT NOT NULL
            )
        """)

        connection.commit()
        connection.close()

    def add_message(self, role: str, content: str):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            "INSERT INTO messages (role, content) VALUES (?, ?)",
            (role, content)
        )

        connection.commit()
        connection.close()

    def get_messages(self):
        connection = self.get_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT role, content FROM messages ORDER BY id"
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