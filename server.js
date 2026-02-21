import express from "express";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post("/", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const chatId = message.chat.id;
    const userText = message.text;

    console.log("Mensagem recebida:", userText);

    // Chamada para IA (OpenRouter)
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "Você é um assistente útil e inteligente." },
          { role: "user", content: userText }
        ]
      })
    });

    const data = await aiResponse.json();
    console.log("Resposta IA:", data);

    const reply =
      data.choices?.[0]?.message?.content ||
      "Erro ao gerar resposta.";

    // Enviar resposta para Telegram
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

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro geral:", error);
    res.sendStatus(500);
  }
});

app.listen(8080, () => {
  console.log("Servidor rodando na porta 8080");
});
