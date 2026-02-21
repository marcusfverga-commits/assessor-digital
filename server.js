import express from "express";
import fetch from "node-fetch";
import AbortController from "abort-controller";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.get("/", (req, res) => {
  res.send("Telegram IA Bot Online 🚀");
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const message = req.body.message;
    if (!message || !message.text) return;

    const chatId = message.chat.id;
    const userText = message.text;

    console.log("Mensagem recebida:", userText);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

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
          model: "mistralai/mistral-7b-instruct:free",
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
          max_tokens: 300
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    const aiData = await aiResponse.json();

    console.log("Resposta IA:", aiData);

    const reply =
      aiData.choices?.[0]?.message?.content ||
      "A IA demorou para responder. Tente novamente.";

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

    // Resposta fallback
    if (req.body?.message?.chat?.id) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: req.body.message.chat.id,
          text: "Erro ao consultar IA. Tente novamente."
        })
      });
    }
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
