import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "assessor_token";

// Teste raiz
app.get("/", (req, res) => {
  res.send("Assessor Digital Online 🚀");
});

// 🔹 Verificação do Webhook (OBRIGATÓRIO)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verificado!");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// 🔹 Receber mensagens do WhatsApp
app.post("/webhook", (req, res) => {
  console.log("Mensagem recebida:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
