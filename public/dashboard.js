// ============================
// 🔐 AUTENTICAÇÃO
// ============================

const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.username) {
  window.location.href = "index.html";
}

// ============================
// 📌 ELEMENTOS
// ============================

const clienteInput = document.getElementById("cliente");
const whatsInput = document.getElementById("whats");
const modeloInput = document.getElementById("modelo");
const obsInput = document.getElementById("obs");
const lista = document.getElementById("lista");
const buscar = document.getElementById("buscar");
const btnCadastrar = document.getElementById("btnCadastrar");

const modal = document.getElementById("modal");
const eCliente = document.getElementById("eCliente");
const eWhats = document.getElementById("eWhats");
const eModelo = document.getElementById("eModelo");
const eObs = document.getElementById("eObs");
const salvarEdit = document.getElementById("salvarEdit");

let editId = null;

// ============================
// 🎯 EVENTOS
// ============================

btnCadastrar.addEventListener("click", cadastrar);
buscar.addEventListener("input", carregar);
salvarEdit.addEventListener("click", salvarEdicao);

// ============================
// 🚀 CADASTRAR LEAD
// ============================

async function cadastrar() {
  const cliente = clienteInput.value.trim();
  const whats = whatsInput.value.trim();
  const modelo = modeloInput.value.trim();
  const obs = obsInput.value.trim();

  if (!cliente || !whats || !modelo) {
    alert("⚠️ Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    await fetch("/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente,
        whats,
        modelo,
        obs,
        status: "Novo",
        user: user.username,
        createdAt: new Date().toISOString()
      })
    });

    limpar();
    carregar();

  } catch (err) {
    alert("Erro ao cadastrar lead.");
  }
}

// ============================
// 📥 CARREGAR LEADS
// ============================

async function carregar() {
  lista.innerHTML = "<p>Carregando...</p>";

  try {
    const res = await fetch(`/leads?username=${user.username}&role=${user.role}`);
    const leads = await res.json();

    const filtro = buscar.value.toLowerCase();

    lista.innerHTML = "";

    if (!leads.length) {
      lista.innerHTML = "<p>Nenhum lead encontrado.</p>";
      return;
    }

    leads
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter(l => (l.modelo || "").toLowerCase().includes(filtro))
      .forEach(criarCard);

  } catch (err) {
    lista.innerHTML = "<p>Erro ao carregar leads.</p>";
  }
}

// ============================
// 🧱 CRIAR CARD
// ============================

function criarCard(l) {

  const div = document.createElement("div");
  div.className = "card";

  const dataFormatada = new Date(l.createdAt).toLocaleString("pt-BR");

  div.innerHTML = `
    <div>
      <h3>${l.modelo}</h3>
      <p><strong>Cliente:</strong> ${l.cliente}</p>
      <p><strong>Whats:</strong> ${l.whats}</p>
      <p><strong>Status:</strong> ${l.status || "Novo"}</p>
      <p><strong>Obs:</strong> ${l.obs || "-"}</p>
      <p><strong>Operador:</strong> ${l.user}</p>
      <p><strong>Data:</strong> ${dataFormatada}</p>
    </div>

    <div class="actions">
      <button class="green">Whats</button>
      <button class="blue">Editar</button>
      <button class="red">Excluir</button>
    </div>
  `;

  // Eventos separados (mais profissional que onclick inline)

  div.querySelector(".green").addEventListener("click", () => {
    abrirWhats(l.cliente, l.modelo, l.whats);
  });

  div.querySelector(".blue").addEventListener("click", () => {
    abrirModal(l);
  });

  div.querySelector(".red").addEventListener("click", () => {
    excluir(l.id, l.cliente);
  });

  lista.appendChild(div);
}

// ============================
// 📱 WHATSAPP
// ============================

function abrirWhats(nomeCliente, modelo, numero) {

  const nomeVendedor = user.username;

  const msg = `Olá ${nomeCliente}, tudo bem? 😊

O veículo ${modelo} que você solicitou já está disponível em nosso estoque.

Se quiser, posso te enviar mais fotos ou agendar uma visita 🚗

Atenciosamente,
${nomeVendedor}
Equipe StopCar`;

  window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`);
}
// ============================
// 🗑 EXCLUIR
// ============================

const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

let deleteId = null;

function excluir(id, nome) {
  deleteId = id;

  confirmText.innerHTML = `
    Tem certeza que deseja excluir o cliente <strong>${nome}</strong>?<br><br>
    Essa ação não poderá ser desfeita.
  `;

  confirmModal.classList.remove("confirm-hidden");
}

confirmYes.addEventListener("click", async () => {
  await fetch(`/leads/${deleteId}`, {
    method: "DELETE"
  });

  confirmModal.classList.add("confirm-hidden");
  carregar();
});

confirmNo.addEventListener("click", () => {
  confirmModal.classList.add("confirm-hidden");
});
// ============================
// ✏️ MODAL
// ============================

function abrirModal(l) {
  editId = l.id;

  eCliente.value = l.cliente;
  eWhats.value = l.whats;
  eModelo.value = l.modelo;
  eObs.value = l.obs;

  modal.classList.remove("hidden");
}

function fecharModal() {
  modal.classList.add("hidden");
}

async function salvarEdicao() {

  await fetch(`/leads/${editId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cliente: eCliente.value,
      whats: eWhats.value,
      modelo: eModelo.value,
      obs: eObs.value
    })
  });

  fecharModal();
  carregar();
}

// ============================
// 🧹 LIMPAR
// ============================

function limpar() {
  clienteInput.value = "";
  whatsInput.value = "";
  modeloInput.value = "";
  obsInput.value = "";
}

// ============================
// 🚀 INIT
// ============================

carregar();