import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.get("/", (req, res) => {
  res.send("Telegram IA Bot Online 🚀");
});

app.post("/webhook", async (req, res) => {
  // Responde imediatamente ao Telegram
  res.sendStatus(200);

  try {
    const message = req.body.message;
    if (!message || !message.text) return;

    const chatId = message.chat.id;
    const userText = message.text;

    console.log("Mensagem recebida:", userText);

    // 🔹 Chamada para OpenRouter (modelo gratuito mais rápido)
    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://railway.app",
          "X-Title": "Assessor Digital Bot"
        },
        body: JSON.stringify({
          model: "openchat/openchat-3.5-0106:free",
          messages: [
            {
              role: "system",
              content: "Você é um assessor pessoal inteligente, organizado, direto e prático."
            },
            {
              role: "user",
              content: userText
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      }
    );

    const aiData = await aiResponse.json();

    console.log("Resposta IA:", aiData);

    const reply =
      aiData.choices?.[0]?.message?.content ||
      "Desculpe, não consegui responder agora.";

    // 🔹 Envia resposta para Telegram
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply
      })
    });

  } catch (error) {
    console.error("Erro geral:", error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
