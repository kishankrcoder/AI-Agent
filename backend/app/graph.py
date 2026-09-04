from typing import TypedDict

from langgraph.graph import StateGraph, START, END

from app.agent import AIAgent


class AgentState(TypedDict):
    message: str
    response: str
    route: str


agent = AIAgent()


def router_node(state: AgentState):
    message = state["message"].lower()

    if any(word in message for word in [
        "calculate",
        "calculation",
        "math",
        "solve",
        "+",
        "-",
        "*",
        "/"
    ]):
        route = "calculator"

    elif any(word in message for word in [
        "search",
        "latest",
        "current",
        "today",
        "news",
        "internet",
        "web"
    ]):
        route = "web"

    elif any(word in message for word in [
        "pdf",
        "document",
        "uploaded",
        "notes",
        "chapter"
    ]):
        route = "pdf"

    else:
        route = "normal"

    return {
        "route": route
    }


def agent_node(state: AgentState):
    response = agent.run(state["message"])

    return {
        "response": response
    }


def route_decision(state: AgentState):
    return state["route"]


graph_builder = StateGraph(AgentState)

graph_builder.add_node("router", router_node)
graph_builder.add_node("agent", agent_node)

graph_builder.add_edge(START, "router")

graph_builder.add_conditional_edges(
    "router",
    route_decision,
    {
        "calculator": "agent",
        "web": "agent",
        "pdf": "agent",
        "normal": "agent",
    }
)

graph_builder.add_edge("agent", END)

agent_graph = graph_builder.compile()