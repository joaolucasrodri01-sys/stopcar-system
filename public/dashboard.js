const nameInput = document.getElementById("nome");
const phoneInput = document.getElementById("telefone");
const modelInput = document.getElementById("modelo");
const lista = document.getElementById("lista");
const searchInput = document.getElementById("buscar");

const user = JSON.parse(localStorage.getItem("user"));

/* ================= CADASTRAR ================= */
async function cadastrar() {
  const nome = nameInput.value.trim();
  const telefone = phoneInput.value.trim();
  const modelo = modelInput.value.trim();

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

  nameInput.value = "";
  phoneInput.value = "";
  modelInput.value = "";

  carregar();
}

/* ================= LISTAR ================= */
async function carregar() {
  const res = await fetch(
    `/leads?username=${user.username}&role=${user.role}`
  );

  const leads = await res.json();

  render(leads);
}

/* ================= RENDER ================= */
function render(leads) {
  lista.innerHTML = "";

  const busca = searchInput.value.toLowerCase();

  leads
    .filter(l => l.modelo.toLowerCase().includes(busca))
    .forEach(l => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${l.modelo}</h3>
        <p><b>Cliente:</b> ${l.nome}</p>
        <p><b>Whats:</b> ${l.telefone}</p>
        <p><b>Operador:</b> ${l.user}</p>

        <div class="acoes">
          <button onclick="whats('${l.telefone}')">WhatsApp</button>
          <button onclick="editar(${l.id})">Editar</button>
          <button onclick="excluir(${l.id})">Excluir</button>
        </div>
      `;

      lista.appendChild(card);
    });
}

/* ================= WHATS ================= */
function whats(num) {
  window.open(`https://wa.me/55${num}`);
}

/* ================= EXCLUIR ================= */
async function excluir(id) {
  await fetch(`/leads/${id}`, { method: "DELETE" });
  carregar();
}

/* ================= EDITAR ================= */
async function editar(id) {
  const novo = prompt("Novo modelo do carro:");
  if (!novo) return;

  await fetch(`/leads/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelo: novo })
  });

  carregar();
}

/* ================= BUSCA ================= */
searchInput.addEventListener("input", carregar);

carregar();




