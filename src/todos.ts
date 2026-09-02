const STORAGE_KEY = "cozy-corner-todos";

export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Todo => {
        return (
          item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          typeof item.text === "string" &&
          typeof item.done === "boolean"
        );
      })
      .map((item) => ({ id: item.id, text: item.text, done: item.done }));
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
