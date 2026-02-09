const user = JSON.parse(localStorage.getItem("user"));

/* ================= CADASTRAR ================= */

async function cadastrar() {
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const modelo = document.getElementById("modelo").value;

  if (!nome || !telefone || !modelo) {
    alert("Preencha tudo");
    return;
  }

  await fetch("/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      telefone,
      modelo,
      user: user.username
    })
  });

  carregar();
}

/* ================= LISTAR ================= */

async function carregar() {
  const res = await fetch(`/leads/${user.username}/${user.role}`);
  const leads = await res.json();

  const div = document.getElementById("lista");
  div.innerHTML = "";

  leads.forEach(l => {
    div.innerHTML += `
      <div class="card">
        <b>${l.nome}</b><br>
        📞 ${l.telefone}<br>
        🚘 ${l.modelo}<br>
        <a target="_blank" href="https://wa.me/55${l.telefone}">
          WhatsApp
        </a>
      </div>
    `;
  });

  carregarRanking();
}

/* ================= RANKING ================= */

async function carregarRanking() {
  const res = await fetch("/ranking");
  const data = await res.json();

  const div = document.getElementById("ranking");
  div.innerHTML = "";

  for (let user in data) {
    div.innerHTML += `<p>${user} — ${data[user]} cadastros</p>`;
  }
}

if (window.location.pathname.includes("dashboard")) {
  carregar();
}

