const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

const { OpenAI } = require("openai"); // ✅ v4 style

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // ✅ no Configuration class

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  let username = "Someone";
  socket.on("join", (name) => {
    username = name;
    socket.broadcast.emit("system", `${username} joined the chat`);
  });

  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("system", `${username} left the chat`);
  });
});

app.post("/api/askbot", async (req, res) => {
  const prompt = req.body.message;
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Reply like a funny, sarcastic, and silly AI chatbot" },
        { role: "user", content: prompt }
      ]
    });
    res.json({ reply: result.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.json({ reply: "Oops! I’m sleeping 😴" });
  }
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Listening on port " + PORT));
