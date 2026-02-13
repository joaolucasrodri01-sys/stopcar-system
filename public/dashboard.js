const user = JSON.parse(localStorage.getItem("user"));

if(!user){
  window.location.href = "index.html";
}

/* ===== INPUTS ===== */
const clienteInput = document.getElementById("cliente");
const whatsInput = document.getElementById("whats");
const modeloInput = document.getElementById("modelo");
const obsInput = document.getElementById("obs");
const lista = document.getElementById("lista");
const buscar = document.getElementById("buscar");
const btnCadastrar = document.getElementById("btnCadastrar");

/* ===== MODAL ===== */
const modal = document.getElementById("modal");
const eCliente = document.getElementById("eCliente");
const eWhats = document.getElementById("eWhats");
const eModelo = document.getElementById("eModelo");
const eObs = document.getElementById("eObs");
const salvarEdit = document.getElementById("salvarEdit");

let editId = null;

/* ================= CADASTRAR ================= */
btnCadastrar.addEventListener("click", cadastrar);

async function cadastrar(){
  const cliente = clienteInput.value.trim();
  const whats = whatsInput.value.trim();
  const modelo = modeloInput.value.trim();
  const obs = obsInput.value.trim();

  if(!cliente || !whats || !modelo){
    alert("Preencha tudo");
    return;
  }

  await fetch("/leads",{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      cliente,
      whats,
      modelo,
      obs,
      user:user.username,
      createdAt:new Date().toLocaleString()
    })
  });

  limpar();
  carregar();
}

/* ================= LISTAR ================= */
async function carregar(){
  const res = await fetch(`/leads?username=${user.username}&role=${user.role}`);
  const leads = await res.json();

  const filtro = buscar.value.toLowerCase();

  lista.innerHTML="";

  leads
    .filter(l => (l.modelo || "").toLowerCase().includes(filtro))
    .forEach(criarCard);
}

buscar.addEventListener("input", carregar);

/* ================= CARD ================= */
function criarCard(l){
  const div = document.createElement("div");
  div.className="card";

  div.innerHTML = `
    <div>
      <b>${l.modelo}</b><br>
      Cliente: ${l.cliente}<br>
      Whats: ${l.whats}<br>
      Obs: ${l.obs || "-"}<br>
      Operador: ${l.user}<br>
      Data: ${l.createdAt || "-"}
    </div>

    <div class="actions">
      <button class="green" onclick="abrirWhats('${l.cliente}','${l.modelo}','${l.whats}')">Whats</button>
      <button class="blue" onclick='abrirModal(${JSON.stringify(l)})'>Editar</button>
      <button class="red" onclick="excluir(${l.id})">Excluir</button>
    </div>
  `;

  lista.appendChild(div);
}

/* ================= WHATS ================= */
function abrirWhats(nome, modelo, numero){
  const msg = `Olá ${nome}, chegou em nosso estoque ${modelo} que você pediu 🚗`;
  window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`);
}

/* ================= EXCLUIR ================= */
async function excluir(id){
  await fetch(`/leads/${id}`,{method:"DELETE"});
  carregar();
}

/* ================= EDITAR ================= */
function abrirModal(l){
  editId = l.id;

  eCliente.value = l.cliente;
  eWhats.value = l.whats;
  eModelo.value = l.modelo;
  eObs.value = l.obs;

  modal.classList.remove("hidden");
}

function fecharModal(){
  modal.classList.add("hidden");
}

salvarEdit.addEventListener("click", async ()=>{
  await fetch(`/leads/${editId}`,{
    method:"PUT",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      cliente:eCliente.value,
      whats:eWhats.value,
      modelo:eModelo.value,
      obs:eObs.value
    })
  });

  fecharModal();
  carregar();
});

/* ================= UTIL ================= */
function limpar(){
  clienteInput.value="";
  whatsInput.value="";
  modeloInput.value="";
  obsInput.value="";
}

carregar();

