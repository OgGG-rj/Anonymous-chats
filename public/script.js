const socket = io();

let username = localStorage.getItem('username');
if (!username) {
  username = "User" + Math.floor(Math.random() * 10000);
  localStorage.setItem('username', username);
}

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value.trim()) {
    socket.emit('chat message', { user: username, text: input.value.trim() });
    input.value = '';
  }
});

socket.on('chat message', (msg) => {
  const item = document.createElement('li');
  item.textContent = `${msg.user}: ${msg.text}`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});
