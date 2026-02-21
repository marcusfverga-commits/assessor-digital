import express from "express"
import axios from "axios"

const app = express()
app.use(express.json())

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

app.post("/", async (req, res) => {
  try {
    const message = req.body.message
    if (!message || !message.text) return res.sendStatus(200)

    const chatId = message.chat.id
    const userText = message.text

    console.log("Mensagem recebida:", userText)

    // 🔥 CHAMADA PARA OPENROUTER
    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Você é um assistente útil e conversacional." },
          { role: "user", content: userText }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    )

    const reply = aiResponse.data.choices[0].message.content

    // 📤 ENVIA RESPOSTA PARA TELEGRAM
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: reply
      }
    )

    res.sendStatus(200)

  } catch (error) {
    console.error("Erro:", error.response?.data || error.message)
    res.sendStatus(200)
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT)
})
