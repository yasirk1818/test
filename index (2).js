// =======================================================
//                  REQUIRED LIBRARIES
// =======================================================
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { Server } = require("socket.io"); // socket.io ko import karain
const qrcode = require('qrcode');
const http = require('http');

// =======================================================
//              SERVER & APP INITIALIZATION
// =======================================================
const app = express();
const server = http.createServer(app);
const io = new Server(server); // socket.io ko server se attach karain

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend HTML file
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});


// =======================================================
//              WHATSAPP CLIENT INITIALIZATION
// =======================================================
// LocalAuth istemal karne se aapko baar baar QR code scan nahi karna parega
// Session data '.wwebjs_auth' folder mein save ho jayega.
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Server par hamesha 'true' hona chahiye
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
    }
});

// =======================================================
//                SOCKET.IO COMMUNICATION
// (Real-time communication between server and web browser)
// =======================================================
io.on('connection', (socket) => {
    console.log('A user connected to the web interface.');

    // Jaise hi client ready ho, frontend ko status bhejo
    // Taake agar server pehle se connected hai to user ko foran pata chal jaye
    if (client.info) {
        socket.emit('status', 'Connected! Ready to chat.');
    } else {
        socket.emit('status', 'Initializing... Please wait.');
    }

    // Frontend se message bhejne ka event receive karain
    socket.on('send-message', (data) => {
        const { number, message } = data;
        // Number format ko WhatsApp ID mein convert karain (e.g., 923001234567@c.us)
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        
        console.log(`Sending message to: ${chatId}`);
        client.sendMessage(chatId, message).then(response => {
            // Frontend ko tasdeeqi paigham bhejo
            socket.emit('log', `Message successfully sent to ${number}`);
        }).catch(err => {
            // Agar koi error aaye to frontend ko batao
            console.error('Error sending message:', err);
            socket.emit('log', `Error sending message: ${err.toString()}`);
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from the web interface.');
    });
});


// =======================================================
//              WHATSAPP CLIENT EVENTS
// =======================================================
client.on('qr', (qr) => {
    console.log('QR code received, sending to frontend.');
    qrcode.toDataURL(qr, (err, url) => {
        io.emit('qr', url); // QR code ko sab connected web clients ko bhejo
        io.emit('status', 'QR Code received. Please scan with your phone.');
    });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    io.emit('status', 'Connected! Ready to chat.');
    io.emit('qr', null); // QR code ko web page se hata do
});

client.on('authenticated', () => {
    console.log('WhatsApp Client is authenticated!');
    io.emit('status', 'Authenticated. Getting ready...');
});

client.on('auth_failure', (msg) => {
    console.error('AUTHENTICATION FAILURE', msg);
    io.emit('status', 'Authentication Failed! Please delete the .wwebjs_auth folder and restart.');
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp Client was logged out.', reason);
    io.emit('status', 'Disconnected. Please restart the server.');
    // Aap yahan client.initialize() dobara call karke auto-reconnect logic daal saktay hain
});

// Jab WhatsApp par koi naya message aaye
client.on('message', message => {
    console.log(`Message received from: ${message.from}, Body: ${message.body}`);
    // Us message ko seedha frontend par bhejo
    // Is se real-time mein incoming messages web page par nazar aayenge
    io.emit('message-received', { 
        from: message.from, 
        body: message.body 
    });
});

// =======================================================
//                  START THE APPLICATION
// =======================================================
client.initialize();

const PORT = process.env.PORT || 3000; // cPanel ke liye process.env.PORT behtar hai
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});