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

// Aviator Predator UI
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="sw">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Aviator Predator Pairing</title>
            <style>
                body { font-family: 'Arial', sans-serif; background: #000000; color: #ffffff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #1a1a1a; padding: 30px; border-radius: 15px; text-align: center; width: 90%; max-width: 380px; border: 2px solid #ff0000; box-shadow: 0 0 20px rgba(255, 0, 0, 0.3); }
                h2 { color: #ff0000; text-transform: uppercase; letter-spacing: 2px; }
                input { width: 100%; padding: 12px; margin: 15px 0; border-radius: 8px; border: 1px solid #444; background: #2a2a2a; color: #fff; font-size: 16px; text-align: center; outline: none; }
                button { width: 100%; padding: 12px; background: #ff0000; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: 0.3s; }
                button:hover { background: #cc0000; transform: scale(1.02); }
                #code { font-size: 35px; color: #ff0000; margin: 20px 0; font-weight: bold; letter-spacing: 5px; text-shadow: 0 0 10px rgba(255, 0, 0, 0.5); }
                .footer { font-size: 12px; color: #888; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Aviator Predator 🚀</h2>
                <p class="footer">Weka namba yako kuanza na code ya nchi</p>
                <input type="text" id="phone" placeholder="2557XXXXXXXX">
                <button onclick="getPairingCode()" id="submitBtn">GET PAIRING CODE</button>
                <div id="code"></div>
                <p id="status" class="footer"></p>
            </div>
            <script>
                async function getPairingCode() {
                    const num = document.getElementById('phone').value.replace(/[^0-9]/g, '');
                    if(num.length < 10) return alert('Ingiza namba sahihi ya simu!');
                    
                    const btn = document.getElementById('submitBtn');
                    btn.disabled = true;
                    btn.innerText = "GENERATING...";
                    document.getElementById('status').innerText = "Connecting to Aviator Servers...";

                    try {
                        const res = await fetch('/get-code?num=' + num);
                        const data = await res.json();
                        if(data.code) {
                            document.getElementById('code').innerText = data.code;
                            document.getElementById('status').innerText = "Nenda WhatsApp > Linked Devices > Link with Phone Number uweke kodi hiyo.";
                        } else {
                            document.getElementById('status').innerText = "Kosa limetokea. Jaribu tena.";
                        }
                    } catch(e) {
                        document.getElementById('status').innerText = "Server Error. Check your connection.";
                    }
                    btn.disabled = false;
                    btn.innerText = "GET PAIRING CODE";
                }
            </script>
        </body>
        </html>
    `);
});

// Pairing Logic
app.get('/get-code', async (req, res) => {
    let num = req.query.num;
    const sessionPath = path.join('/tmp', 'aviator-' + num);
    if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    try {
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: ["Aviator Predator", "Chrome", "114.0.5735.199"]
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'open') {
                await delay(5000);
                const credsData = JSON.parse(fs.readFileSync(path.join(sessionPath, 'creds.json')));
                const sessionID = Buffer.from(JSON.stringify(credsData)).toString('base64');
                
                // Tuma Session ID kwa mtumiaji
                await sock.sendMessage(sock.user.id, { 
                    text: `*🚀 AVIATOR PREDATOR CONNECTED! ✅*\n\n*Hii ndio Session ID yako:*\n\n\`\`\`${sessionID}\`\`\`\n\n_Tumia kodi hii kuanzisha Predator Bot yako sasa!_` 
                });
                console.log(`Aviator Predator session active for: ${num}`);
            }
        });

        if (!sock.authState.creds.registered) {
            await delay(2500);
            let code = await sock.requestPairingCode(num);
            if (!res.headersSent) res.json({ code });
        }

    } catch (err) {
        if (!res.headersSent) res.json({ error: "Failed" });
    }
});

app.listen(PORT, () => console.log(`Aviator Predator running on port ${PORT}`));
