const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const MAX_MESSAGES = 100;
let messageHistory = [];

io.on('connection', (socket) => {
  let user = '';

  socket.on('user-joined', (username) => {
    user = username;
    io.emit('user-joined', username);

    // Send past messages
    messageHistory.forEach(msg => socket.emit('chat message', msg));
  });

  socket.on('chat message', ({ username, text }) => {
    const timestamp = new Date().toLocaleTimeString();
    const msg = { username, text, timestamp };
    messageHistory.push(msg);

    if (messageHistory.length > MAX_MESSAGES) {
      messageHistory.shift(); // Limit history
    }

    io.emit('chat message', msg);

    // Optional: funny AI bot
    if (text.includes('bot')) {
      const botMsg = {
        username: '🤖 Bot',
        text: getFunnyReply(text),
        timestamp: new Date().toLocaleTimeString()
      };
      messageHistory.push(botMsg);
      io.emit('chat message', botMsg);
    }
  });

  socket.on('disconnect', () => {
    if (user) io.emit('user-left', user);
  });
});

function getFunnyReply(input) {
  const replies = [
    "I'm not saying you're wrong, but you are.",
    "Did someone say bot? I prefer the term ‘AI overlord’.",
    "Beep boop. I'm smarter than your fridge!",
    "Sorry, I can't help. I'm just a toaster.",
    "Talk to me like I’m human. Just kidding, I don’t care."
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
