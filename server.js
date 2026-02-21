import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

// Rota padrão
app.get("/", (req, res) => {
  res.send("Telegram Bot Online 🚀");
});

// Webhook Telegram
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.sendStatus(200);
    }

    const chatId = message.chat.id;
    const text = message.text;

    console.log("Mensagem recebida:", text);

    // Resposta automática
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Você disse: "${text}"`,
      }),
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro:", error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
