import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QRDisplay from '../components/QRDisplay';
import KeywordManager from '../components/KeywordManager';

const Dashboard = () => {
  const [qr, setQR] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.qr) setQR(data.qr);
      if (data.connected) setConnected(true);
    };
  }, []);

  return (
    <div>
      <h2>WhatsApp Dashboard</h2>
      {!connected ? (
        <QRDisplay qr={qr} />
      ) : (
        <p>✅ WhatsApp Connected</p>
      )}
      <KeywordManager />
    </div>
  );
};

export default Dashboard;
