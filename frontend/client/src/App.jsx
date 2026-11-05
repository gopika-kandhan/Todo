import { useEffect, useState } from "react";
import "./App.css";

const apiRequest = async (path, { token, ...options } = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) {
    const error = new Error(data.error || data.message || "The request could not be completed");
    error.status = response.status;
    throw error;
  }
  return data;
};

const taskId = (todo) => String(todo?._id ?? todo?.id ?? "");

const uniqueTasks = (tasks) => {
  const seen = new Set();
  return tasks.filter((todo) => {
    const id = taskId(todo);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("todo-token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authView, setAuthView] = useState(false);
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("todo-token")));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let active = true;
    apiRequest("/api/tasks/get", { token })
      .then((tasks) => {
        if (active) {
          const taskList = Array.isArray(tasks) ? tasks : tasks.tasks || [];
          setTodos(uniqueTasks(taskList));
        }
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401) {
          localStorage.removeItem("todo-token");
          setTodos([]);
          setToken(null);
          setError("Your session expired. Please log in again.");
        } else {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  function switchAuthMode(mode) {
    setAuthMode(mode);
    setAuthView(true);
    setPassword("");
    setConfirmPassword("");
    setError("");
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setError("");
    if (authMode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      if (authMode === "register") {
        await apiRequest("/api/users/register", { method: "POST", body: JSON.stringify({ username, password }) });
      }
      const result = await apiRequest("/api/users/login", { method: "POST", body: JSON.stringify({ username, password }) });
      localStorage.setItem("todo-token", result.token);
      setToken(result.token);
      setLoading(true);
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function addTodo(event) {
    event.preventDefault();
    if (!task.trim()) { setError("Please enter a task."); return; }
    setError("");
    setSubmitting(true);
    try {
      const result = await apiRequest("/api/tasks/add", { method: "POST", token, body: JSON.stringify({ todo: task.trim(), status: "pending" }) });
      const created = result.todo || result;
      setTodos((current) => uniqueTasks([...current, created]));
      setTask("");
    } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  }

  async function toggleTodo(todo) {
    const status = todo.status === "completed" ? "pending" : "completed";
    setError(""); setSubmitting(true);
    try {
      const result = await apiRequest(`/api/tasks/update/${todo._id}`, { method: "PUT", token, body: JSON.stringify({ status }) });
      const updated = result.todo || result;
      setTodos((current) => current.map((item) => taskId(item) === taskId(updated) ? updated : item));
    } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  }

  function startEdit(todo) { setEditingId(todo._id); setEditText(todo.todo); setError(""); }
  function cancelEdit() { setEditingId(null); setEditText(""); }

  async function saveEdit(id) {
    if (!editText.trim()) { setError("Task cannot be empty."); return; }
    setError(""); setSubmitting(true);
    try {
      const result = await apiRequest(`/api/tasks/update/${id}`, { method: "PUT", token, body: JSON.stringify({ todo: editText.trim() }) });
      const updated = result.todo || result;
      setTodos((current) => current.map((item) => taskId(item) === taskId(updated) ? updated : item));
      cancelEdit();
    } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  }

  async function deleteTodo(id) {
    setError(""); setSubmitting(true);
    try {
      await apiRequest(`/api/tasks/delete/${id}`, { method: "DELETE", token });
      setTodos((current) => current.filter((todo) => taskId(todo) !== String(id)));
      if (editingId === id) cancelEdit();
    } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  }

  function logout() {
    localStorage.removeItem("todo-token"); setTodos([]); setLoading(false); setToken(null); cancelEdit(); setError(""); setAuthView(false);
  }

  const completedCount = todos.filter((todo) => todo.status === "completed").length;
  const pendingCount = todos.length - completedCount;

  return (
    <div className="site-app">
      <header className="site-navbar">
        <button className="site-brand" type="button" onClick={() => { setAuthView(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <span className="brand-mark" aria-hidden="true">✓</span><span>TodoMaster</span>
        </button>
        <nav className="site-links" aria-label="Main navigation">
          <a href="#features">Features</a><a href="#about">About</a><a href="#contact">Contact</a>
        </nav>
        <div className="nav-auth">
          {token ? <button className="nav-login" type="button" onClick={logout}>Logout</button> : <><button className="nav-login" type="button" onClick={() => switchAuthMode("login")}>Login</button><button className="nav-signup" type="button" onClick={() => switchAuthMode("register")}>Sign Up</button></>}
        </div>
      </header>

      {token ? (
        <main className="dashboard-page"><section className="dashboard" aria-labelledby="dashboard-heading">
          <div className="dashboard-header"><div><span className="eyebrow">TASK WORKSPACE</span><h1 id="dashboard-heading">My Tasks</h1><p>Welcome back{username ? `, ${username}` : ""}. Stay focused and productive.</p></div><button className="dashboard-logout" type="button" onClick={logout}>Logout</button></div>
          <div className="summary-grid">
            <article className="summary-card"><span className="summary-icon total">✓</span><div><strong>{todos.length}</strong><span>Total Tasks</span></div></article>
            <article className="summary-card"><span className="summary-icon completed">✓</span><div><strong>{completedCount}</strong><span>Completed Tasks</span></div></article>
            <article className="summary-card"><span className="summary-icon pending">○</span><div><strong>{pendingCount}</strong><span>Pending Tasks</span></div></article>
          </div>
          <form className="add-task-form" onSubmit={addTodo}><label className="sr-only" htmlFor="new-task">New task</label><input id="new-task" value={task} onChange={(event) => setTask(event.target.value)} placeholder="What needs to be done?" /><button className="primary-button" type="submit" disabled={submitting || !task.trim()}>+ Add Task</button></form>
          {error && <p className="dashboard-error" role="alert">{error}</p>}
          <section className="task-list-section" aria-label="Task list"><div className="section-heading"><h2>Tasks</h2><span>{todos.length} {todos.length === 1 ? "item" : "items"}</span></div>
            {loading ? <div className="empty-state">Loading your tasks...</div> : todos.length === 0 ? <div className="empty-state"><span>✓</span><h3>No tasks yet</h3><p>Add your first task above and start getting things done.</p></div> : (
              <ul className="task-list">{todos.map((todo) => <li className={`task-row ${todo.status === "completed" ? "is-completed" : ""}`} key={todo._id}>
                {editingId === todo._id ? <div className="edit-row"><input className="edit-input" value={editText} onChange={(event) => setEditText(event.target.value)} aria-label="Edit task" autoFocus /><div className="task-actions"><button className="save-btn" type="button" onClick={() => saveEdit(todo._id)} disabled={submitting}>Save</button><button className="cancel-btn" type="button" onClick={cancelEdit} disabled={submitting}>Cancel</button></div></div> : <><button className="task-check" type="button" onClick={() => toggleTodo(todo)} disabled={submitting} aria-label={`Mark ${todo.todo} as ${todo.status === "completed" ? "pending" : "completed"}`}>{todo.status === "completed" ? "✓" : ""}</button><button className="todo-title" type="button" onClick={() => toggleTodo(todo)} disabled={submitting}>{todo.todo}</button><div className="task-actions"><button className="edit-btn" type="button" onClick={() => startEdit(todo)} disabled={submitting}>Edit</button><button className="delete-btn" type="button" onClick={() => deleteTodo(todo._id)} disabled={submitting}>Delete</button></div></>}
              </li>)}</ul>
            )}
          </section>
        </section></main>
      ) : authView ? (
        <main className="auth-page"><section className="auth-card" aria-labelledby="auth-heading"><button className="auth-back" type="button" onClick={() => setAuthView(false)}>← Back to home</button><div className="auth-mark" aria-hidden="true">✓</div><h1 id="auth-heading">{authMode === "login" ? "Welcome Back" : "Create Your Account"}</h1><p className="auth-subtitle">{authMode === "login" ? "Log in to manage your tasks." : "Get started with your personal task manager."}</p>
          <form className="auth-form" onSubmit={handleAuthSubmit}><label htmlFor="username">Username<input id="username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} /></label><label htmlFor="password">Password<input id="password" type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{authMode === "register" && <label htmlFor="confirm-password">Confirm Password<input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>}{error && <p className="error-message" role="alert">{error}</p>}<button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Please wait..." : authMode === "login" ? "Login" : "Create Account"}</button></form>
          <p className="auth-switch">{authMode === "login" ? "New to TodoMaster?" : "Already have an account?"} <button className="text-button" type="button" onClick={() => switchAuthMode(authMode === "login" ? "register" : "login")}>{authMode === "login" ? "Create account" : "Sign in"}</button></p>
        </section></main>
      ) : (
        <main>
          <section className="hero-section"><div className="hero-copy"><p className="hero-label"></p>what you do in day to day life.<h1>consistency is a key to success.<br /><span></span></h1><p className="hero-description">Bring your plans, priorities, and everyday tasks together. A calmer, clearer way to get things done.</p><div className="hero-actions"><button className="hero-primary" type="button" onClick={() => switchAuthMode("register")}>Get Started</button><a className="hero-secondary" href="#features">Learn More <span>→</span></a></div></div>
            <div className="hero-visual" aria-label="Task management preview"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="visual-glow" /><div className="preview-card preview-main"><div className="preview-heading"><span>Today</span><small><i /> On track</small></div><div className="preview-task"><span className="preview-check">✓</span><div><strong>Plan your next big idea</strong><small>Personal workspace</small></div></div><div className="preview-progress"><span /><span /></div></div><div className="preview-card preview-float"><span className="preview-check">✓</span><strong>Make time for<br />what matters</strong><small>Today · 1 task</small></div></div>
          </section>
          <section className="features-section" id="features"><p className="section-label">BUILT AROUND YOUR DAY</p><h2>Everything in its right place.</h2><p className="section-description">Simple tools to help you stay focused and keep moving forward.</p><div className="feature-grid">
            <article className="feature-card"><div className="feature-icon">✓</div><h3>Organize Your Tasks</h3><p>Keep your daily tasks organized in one simple place.</p></article><article className="feature-card"><div className="feature-icon">↗</div><h3>Track Your Progress</h3><p>Mark tasks complete and see what you have accomplished.</p></article><article className="feature-card"><div className="feature-icon">◎</div><h3>Stay Focused</h3><p>Focus on what matters most with a clear task list.</p></article>
          </div></section>
          <section className="info-section" id="about"><p className="section-label">ABOUT TODOMASTER</p><h2>Less noise. More progress.</h2><p>TodoMaster is a personal task manager designed to help you organize everyday plans and keep your attention on what matters.</p></section>
          <section className="info-section contact-section" id="contact"><p className="section-label">CONTACT</p><h2>Built for your day</h2><p>TodoMaster is ready whenever you are—create an account and begin organizing your tasks.</p></section>
        </main>
      )}
    </div>
  );
}

export default App;
