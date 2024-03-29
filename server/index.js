const express = require('express');
const { WebSocketServer } = require('ws');
const { LoremIpsum } = require("lorem-ipsum");

const app = express();
const port = 3000; // Server port

// Create HTTP server with express
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

const lorem = new LoremIpsum();

const sendLoremIpsum = (ws, totalWords) => {
  let wordsSent = 0;
  let wordsPerSecond = 5; // Start with a base rate

  const adjustWordsPerSecond = () => {
    const minWordsPerSecond = 1;
    const maxWordsPerSecond = 50;
    wordsPerSecond = Math.floor(Math.random() * (maxWordsPerSecond - minWordsPerSecond + 1)) + minWordsPerSecond;
};

  const sendBatch = () => {
      if (ws.readyState !== ws.OPEN) {
          console.log('WebSocket is not open. Stopping transmission.');
          return;
      }

      adjustWordsPerSecond();
      const remainingWords = totalWords - wordsSent;
      const batchSize = Math.min(remainingWords, wordsPerSecond);
      wordsSent += batchSize;

      const message = {
          text: lorem.generateWords(batchSize),
          finished: wordsSent >= totalWords,
          isFirstMessage: wordsSent === batchSize
      };

      ws.send(JSON.stringify(message));

      if (!message.finished) {
          setTimeout(sendBatch, 1000);
      }
  };
  sendBatch();
};

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Handle messages from the client
    ws.on('message', (message) => {
        const { totalWords } = JSON.parse(message);
        console.log(message, "teste")

        // Start sending Lorem Ipsum text in batches based on the internally set and dynamically changing rate
        sendLoremIpsum(ws, totalWords);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log(`WebSocket server started on ws://localhost:${port}`);