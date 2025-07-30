const socket = io();
const messagesDiv = document.getElementById('messages');
const input = document.getElementById('messageInput');

const username = getOrCreateUsername();

function getOrCreateUsername() {
  let user = localStorage.getItem('anon_username');
  if (!user) {
    user = 'User' + Math.floor(Math.random() * 10000);
    localStorage.setItem('anon_username', user);
  }
  return user;
}

function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;
  socket.emit('chat message', { username, text: msg });
  input.value = '';
}

function addMessage(text) {
  const div = document.createElement('div');
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

socket.on('chat message', ({ username, text, timestamp }) => {
  addMessage(`[${timestamp}] ${username}: ${text}`);
});

socket.on('user-joined', (name) => {
  addMessage(`[${new Date().toLocaleTimeString()}] ${name} joined`);
});

socket.on('user-left', (name) => {
  addMessage(`[${new Date().toLocaleTimeString()}] ${name} left`);
});

socket.emit('user-joined', username);
window.addEventListener('beforeunload', () => {
  socket.emit('user-left', username);
});
