// index.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const TOKEN = 'YOUR_BOT_TOKEN';
const API = `https://api.telegram.org/bot${TOKEN}`;

let userData = {}; // Memory storage

app.get('/', (req, res) => res.send("Vibranium Mining Bot Running"));

app.listen(3000, () => {
  console.log("Bot running on port 3000");
  startPolling();
});

async function startPolling(offset = 0) {
  setInterval(async () => {
    const res = await fetch(`${API}/getUpdates?offset=${offset + 1}`);
    const data = await res.json();

    for (let update of data.result) {
      offset = update.update_id;
      const chatId = update.message.chat.id;
      const text = update.message.text;
      handleCommand(chatId, text);
    }
  }, 1500);
}

function sendMessage(chatId, text) {
  fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

function handleCommand(chatId, text) {
  userData[chatId] = userData[chatId] || { balance: 0, mining: false };

  if (text === '/start') {
    sendMessage(chatId, "Welcome to Vibranium Miner Bot!\nUse /mine to start.");
  } else if (text === '/mine') {
    if (userData[chatId].mining) {
      sendMessage(chatId, "Already mining!");
    } else {
      userData[chatId].mining = true;
      sendMessage(chatId, "Started mining Vibranium...");

      let cycles = 0;
      let interval = setInterval(() => {
        if (!userData[chatId].mining || cycles >= 5) {
          clearInterval(interval);
          userData[chatId].mining = false;
          sendMessage(chatId, "Mining session completed.");
          return;
        }
        let reward = (Math.random() * 0.005).toFixed(4);
        userData[chatId].balance += parseFloat(reward);
        sendMessage(chatId, `+${reward} VBC mined!\nBalance: ${userData[chatId].balance.toFixed(4)} VBC`);
        cycles++;
      }, 5000);
    }
  } else if (text === '/balance') {
    sendMessage(chatId, `Your balance: ${userData[chatId].balance.toFixed(4)} VBC`);
  } else if (text === '/stop') {
    userData[chatId].mining = false;
    sendMessage(chatId, "Mining stopped.");
  } else {
    sendMessage(chatId, "Unknown command. Use /mine, /balance, /stop.");
  }
}
