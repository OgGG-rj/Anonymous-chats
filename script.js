// Connect to the socket server
const socket = io();

// Assign or retrieve a persistent random username
let username = localStorage.getItem('anon_username');
if (!username) {
  const animals = ['🦊', '🐼', '🐸', '🐧', '🐨', '🐯', '🐵', '🦁', '🐶', '🐱'];
  username = animals[Math.floor(Math.random() * animals.length)] + 'Anon' + Math.floor(Math.random() * 1000);
  localStorage.setItem('anon_username', username);
}

// DOM elements
const form = document.querySelector('form');
const input = document.getElementById('message');
const messages = document.getElementById('messages');

// Send message on form submit
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value.trim()) {
    socket.emit('chat message', { user: username, text: input.value.trim() });
    input.value = '';
  }
});

// Listen for incoming messages
socket.on('chat message', function (msg) {
  const item = document.createElement('div');
  item.classList.add('message-item');
  item.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});
