import { getCurrentWindow } from "@tauri-apps/api/window";
import { loadTodos, saveTodos, type Todo } from "./todos";

function boot() {
  const list = document.querySelector<HTMLUListElement>("#todo-list")!;
  const form = document.querySelector<HTMLFormElement>("#todo-form")!;
  const input = document.querySelector<HTMLInputElement>("#todo-input")!;
  const close = document.querySelector<HTMLButtonElement>("#todo-close")!;
  let todos = loadTodos();

  const render = () => {
    list.replaceChildren();
    if (todos.length === 0) {
      const empty = document.createElement("li");
      empty.className = "todo-empty";
      empty.textContent = "Pin a note…";
      list.append(empty);
      return;
    }
    for (const todo of todos) {
      const item = document.createElement("li");
      if (todo.done) item.classList.add("done");
      const check = document.createElement("button");
      check.type = "button";
      check.className = "check";
      check.title = todo.done ? "Not done" : "Done";
      check.setAttribute("aria-label", check.title);
      const text = document.createElement("span");
      text.textContent = todo.text;
      const drop = document.createElement("button");
      drop.type = "button";
      drop.className = "drop";
      drop.title = "Remove";
      drop.setAttribute("aria-label", "Remove");
      drop.textContent = "×";
      check.addEventListener("click", () => {
        todo.done = !todo.done;
        saveTodos(todos);
        render();
      });
      drop.addEventListener("click", () => {
        todos = todos.filter((entry) => entry.id !== todo.id);
        saveTodos(todos);
        render();
      });
      item.append(check, text, drop);
      list.append(item);
    }
  };

  close.addEventListener("click", () => {
    void getCurrentWindow().hide();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const todo: Todo = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      done: false,
    };
    todos = [todo, ...todos];
    saveTodos(todos);
    input.value = "";
    render();
    list.scrollTop = 0;
  });

  window.addEventListener("focus", () => {
    todos = loadTodos();
    render();
  });

  render();
  input.focus();
}

boot();
