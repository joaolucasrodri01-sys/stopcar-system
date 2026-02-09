const btn = document.getElementById("btnLogin");
const error = document.getElementById("error");

btn.addEventListener("click", login);

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  error.textContent = "";

  if (!username || !password) {
    error.textContent = "Preencha usuário e senha";
    return;
  }

  btn.textContent = "Entrando...";
  btn.disabled = true;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  btn.textContent = "Entrar";
  btn.disabled = false;

  if (!data.success) {
    error.textContent = "Usuário ou senha inválidos ❌";
    return;
  }

  // salva usuário logado
  localStorage.setItem("user", JSON.stringify(data.user));

  // vai pro dashboard
  window.location.href = "dashboard.html";
}
