import { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const App = () => {
  const [socketUrl, setSocketUrl] = useState('ws://localhost:3000');
  const [socketArray, setSocketArray] = useState<string[]>([]);
  const [displayedText, setDisplayedText] = useState<string>('');

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      const objectMsg = JSON.parse(lastMessage.data)
      setSocketArray(prevSocketArray => [
        ...prevSocketArray,
        objectMsg.text
      ]);
    }
  }, [lastMessage]);

  const createText = () => {
    let novoTexto = '';
    let index = 0;
    while (socketArray.length > 0) {
      novoTexto += socketArray.shift();


      const timeoutId = setTimeout(function addChar() {
        setDisplayedText(prevText => prevText + novoTexto[index]);
        index++;
        if (index < novoTexto.length) {
          setTimeout(addChar, 100);
        }
      }, 100);

      return timeoutId
    }
  };

  useEffect(() => {
    if (socketArray.length > 0) {
      const intervalId = setInterval(() => {
        createText();
      }, 800);

      return () => clearInterval(intervalId);
    }
  }, [socketArray]);

  const handleClickSendMessage = useCallback(() => sendMessage(JSON.stringify({
    totalWords: 300
  })), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
      >
        Enviar
      </button>
      <span>O WebSocket está atualmente {connectionStatus}</span>

      <div>
        <p>{displayedText}</p>
      </div>
    </div>
  );
};