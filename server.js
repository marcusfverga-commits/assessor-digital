import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "assessor_token";

// Rota padrão
app.get("/", (req, res) => {
  res.send("Assessor Digital Online 🚀");
});

// Verificação do webhook (Meta envia GET aqui)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado com sucesso!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receber mensagens (Meta envia POST aqui)
app.post("/webhook", (req, res) => {
  console.log("Evento recebido:");
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
