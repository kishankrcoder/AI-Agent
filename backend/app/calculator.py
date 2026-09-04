def calculator(expression: str) -> str:
    """
    Safely evaluate a basic mathematical expression.
    """

    try:
        allowed = "0123456789+-*/(). %"

        if not all(char in allowed for char in expression):
            return "Invalid mathematical expression."

        result = eval(expression, {"__builtins__": {}}, {})

        return str(result)

    except Exception:
        return "Could not calculate the expression."