import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Rota padrão
app.get("/", async (req, res) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: "5511973264022", // SEU NÚMERO AQUI
          type: "text",
          text: {
            body: "Teste direto da rota / 🚀",
          },
        }),
      }
    );

    const data = await response.json();
    console.log("Resposta da Meta:", data);

    res.json(data);
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).send("Erro ao enviar mensagem");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
