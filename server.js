const express = require("express");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* ================= DB ================= */

const adapter = new JSONFile("db.json");

const defaultData = {
  users: [],
  leads: []
};

const db = new Low(adapter, defaultData);

async function initDB() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

initDB();

/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {
  await db.read();

  const { username, password } = req.body;

  const user = db.data.users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.json({ success: false });

  res.json({ success: true, user });
});

/* ================= CADASTRAR ================= */

app.post("/leads", async (req, res) => {
  await db.read();

  const lead = {
    id: Date.now(),
    ...req.body
  };

  db.data.leads.push(lead);

  await db.write();

  res.json({ success: true });
});

/* ================= LISTAR (ROTA CORRETA) ================= */
/* ⚠️ AGORA USA QUERY STRING */

app.get("/leads", async (req, res) => {
  await db.read();

  const { username, role } = req.query;

  if (role === "admin") {
    return res.json(db.data.leads);
  }

  const meus = db.data.leads.filter(l => l.user === username);

  res.json(meus);
});

/* ================= EDITAR ================= */

app.put("/leads/:id", async (req, res) => {
  await db.read();

  const id = Number(req.params.id);

  const lead = db.data.leads.find(l => l.id === id);

  if (!lead) return res.json({ success: false });

  Object.assign(lead, req.body);

  await db.write();

  res.json({ success: true });
});

/* ================= EXCLUIR ================= */

app.delete("/leads/:id", async (req, res) => {
  await db.read();

  const id = Number(req.params.id);

  db.data.leads = db.data.leads.filter(l => l.id !== id);

  await db.write();

  res.json({ success: true });
});

/* ================= SERVER ================= */

app.listen(3000, () =>
  console.log("🚀 Rodando em http://localhost:3000")
);
