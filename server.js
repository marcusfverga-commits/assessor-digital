import express from "express";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log("Bot iniciado...");

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const texto = msg.text;

  console.log("Mensagem recebida:", texto);

  try {
    const resposta = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "Você é um assistente pessoal inteligente e útil." },
          { role: "user", content: texto }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const respostaTexto = resposta.data.choices[0].message.content;

    console.log("Resposta IA:", respostaTexto);

    bot.sendMessage(chatId, respostaTexto);

  } catch (erro) {
    console.error("Erro IA:", erro.response?.data || erro.message);
    bot.sendMessage(chatId, "Erro ao consultar IA.");
  }
});

app.get("/", (req, res) => {
  res.send("Servidor rodando");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
