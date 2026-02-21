import express from "express";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post(`/bot${TELEGRAM_TOKEN}`, async (req, res) => {
  try {
    const message = req.body.message?.text;
    const chatId = req.body.message?.chat?.id;

    if (!message) return res.sendStatus(200);

    console.log("Mensagem recebida:", message);

    // Chamada OpenRouter (modelo gratuito correto)
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openchat/openchat-3.5-0106",
        messages: [
          { role: "system", content: "Você é um assistente pessoal chamado Assessor Digital, ajuda a organizar tarefas, consultas e compromissos." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await aiResponse.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "Erro ao gerar resposta da IA.";

    console.log("Resposta IA:", reply);

    // Enviar resposta ao Telegram
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply
      })
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro geral:", error);
    res.sendStatus(200);
  }
});

app.listen(8080, () => {
  console.log("Servidor rodando na porta 8080");
});
