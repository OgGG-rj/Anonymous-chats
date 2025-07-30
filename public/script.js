const socket = io();
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const modeSelector = document.getElementById("modeSelector");

let username = getOrCreateUsername();
let userColor = getColorForUsername(username);

// Show join message
socket.emit("join", username);

function getOrCreateUsername() {
  let name = localStorage.getItem("anon_username");
  if (!name) {
    const emojis = ['😺','🦊','🐸','🐵','🐯','🦄','🐙'];
    name = emojis[Math.floor(Math.random() * emojis.length)] + " User" + Math.floor(Math.random() * 1000);
    localStorage.setItem("anon_username", name);
  }
  return name;
}

function getColorForUsername(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 60%, 70%)`;
  return color;
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const mode = modeSelector.value;

  if (mode === "bot") {
    addMessage(username, text, true);
    fetch("/api/askbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    })
    .then(res => res.json())
    .then(data => {
      addMessage("🤖 Bot", data.reply, true);
    });
  } else {
    socket.emit("chat message", { user: username, text });
  }

  input.value = "";
}

socket.on("chat message", (data) => {
  addMessage(data.user, data.text);
});

socket.on("system", (msg) => {
  addSystemMessage(msg);
});

function addMessage(user, text, local = false) {
  const time = new Date().toLocaleTimeString();
  const div = document.createElement("div");
  div.innerHTML = `<strong style="color:${local ? '#6cf' : getColorForUsername(user)}">${user}</strong>: ${text} <span style="color:gray;font-size:11px;">${time}</span>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addSystemMessage(msg) {
  const div = document.createElement("div");
  div.style.color = "gray";
  div.style.fontStyle = "italic";
  div.textContent = msg;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
