const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const socketUtils = require('../utils/socket');

let clients = {};

function initWhatsAppClient(userId) {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: `user-${userId}` }),
    puppeteer: { headless: true }
  });

  client.on('qr', async (qr) => {
    const qrImg = await qrcode.toDataURL(qr);
    socketUtils.sendQR(userId, qrImg);
  });

  client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    socketUtils.sendReady(userId);
  });

  client.on('message', async (msg) => {
    const user = await User.findById(userId);
    const keyword = user.keywords.find(kw => msg.body.toLowerCase() === kw.keyword.toLowerCase());
    if (keyword) {
      await msg.reply(keyword.reply);
    }
  });

  client.initialize();
  clients[userId] = client;
}

exports.initWhatsAppClient = initWhatsAppClient;
