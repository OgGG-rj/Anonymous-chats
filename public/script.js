const socket = io();
const messagesDiv = document.getElementById('messages');
const input = document.getElementById('messageInput');
const modeSelector = document.querySelector('input[name="mode"]:checked');
let currentMode = 'everyone';

let username = localStorage.getItem('anon_username') || generateUsername();
let userColor = localStorage.getItem('anon_color') || randomColor();

document.getElementById('username').value = username;

function generateUsername() {
  const name = 'User' + Math.floor(Math.random() * 10000);
  localStorage.setItem('anon_username', name);
  return name;
}

function randomColor() {
  const color = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  localStorage.setItem('anon_color', color);
  return color;
}

function updateUsername() {
  const newName = document.getElementById('username').value.trim();
  if (newName) {
    username = newName;
    localStorage.setItem('anon_username', username);
    socket.emit('join', username);
  }
}

function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  const mode = document.querySelector('input[name="mode"]:checked').value;

  if (mode === 'bot') {
    fetch('/api/askbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    })
    .then(res => res.json())
    .then(data => {
      addMessage({ user: '🤖 Bot', text: data.reply, color: '#ffaa00' });
    });
  } else {
    socket.emit('chat message', { user: username, text: msg, color: userColor });
  }

  input.value = '';
}

function addMessage(data) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgElem = document.createElement('div');
  msgElem.innerHTML = `<span style="color:${data.color || '#fff'};"><strong>${data.user}</strong></span> <small>[${time}]</small>: ${data.text}`;
  messagesDiv.appendChild(msgElem);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

socket.on('chat message', addMessage);
socket.on('system', (msg) => {
  const div = document.createElement('div');
  div.className = 'system';
  div.textContent = msg;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.emit('join', username);
