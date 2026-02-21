import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Rota padrão
app.get("/", (req, res) => {
  res.send("Telegram IA Bot Online 🚀");
});

// Webhook Telegram
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // responde rápido ao Telegram

  try {
    const message = req.body.message;
    if (!message) return;

    const chatId = message.chat.id;
    const userText = message.text;

    console.log("Mensagem recebida:", userText);

    // 🔹 Chamada para OpenAI
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um assessor pessoal útil, organizado e direto." },
          { role: "user", content: userText }
        ],
        temperature: 0.7
      }),
    });

    const aiData = await aiResponse.json();

    const reply =
      aiData.choices?.[0]?.message?.content ||
      "Desculpe, não consegui responder agora.";

    // 🔹 Envia resposta para Telegram
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply,
      }),
    });

  } catch (error) {
    console.error("Erro:", error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
