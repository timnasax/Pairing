const express = require('express');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    Browsers,
    makeCacheableSignalKeyStore,
    DisconnectReason
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
            <title>Mega-Baze Anti-Ban</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: sans-serif; background: #0b141a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #222e35; padding: 25px; border-radius: 12px; text-align: center; width: 90%; max-width: 350px; border-top: 4px solid #00a884; }
                input { width: 100%; padding: 12px; margin: 15px 0; border-radius: 8px; border: none; background: #2a3942; color: white; font-size: 16px; text-align: center; }
                button { width: 100%; padding: 12px; background: #00a884; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
                #code { font-size: 32px; color: #00a884; margin: 20px 0; font-weight: bold; letter-spacing: 4px; }
                .status { font-size: 13px; color: #8696a0; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Mega-Baze Pair</h2>
                <input type="text" id="num" placeholder="2557XXXXXXXX">
                <button onclick="getPair()">Pata Code</button>
                <div id="code"></div>
                <p id="msg" class="status">Ingiza namba kuanzia na code ya nchi (255)</p>
            </div>
            <script>
                async function getPair() {
                    const n = document.getElementById('num').value.replace(/[^0-9]/g, '');
                    if(n.length < 10) return alert('Namba haijakamilika!');
                    document.getElementById('msg').innerText = "Inatengeneza... subiri sekunde 10";
                    try {
                        const r = await fetch('/get-code?num=' + n);
                        const d = await r.json();
                        document.getElementById('code').innerText = d.code || "Error";
                        document.getElementById('msg').innerText = "Weka code hiyo kwenye WhatsApp yako sasa.";
                    } catch(e) { document.getElementById('msg').innerText = "Jaribu tena."; }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/get-code', async (req, res) => {
    let num = req.query.num;
    const sessionPath = path.join('/tmp', 'auth-' + num);
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
            // HII NI MUHIMU KUZUIA "COULDN'T LINK"
            browser: ["Chrome (Linux)", "Chrome", "110.0.5481.177"],
            syncFullHistory: false,
            markOnlineOnConnect: true
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                await delay(8000);
                const creds = JSON.parse(fs.readFileSync(path.join(sessionPath, 'creds.json')));
                const sessionID = Buffer.from(JSON.stringify(creds)).toString('base64');
                
                await sock.sendMessage(sock.user.id, { 
                    text: `*MEGA-BAZE SESSION ID:* \n\n\`\`\`${sessionID}\`\`\`\n\n_Copy hii kodi ukaweke kwenye bot yako._` 
                });
            }
            if (connection === 'close') {
                let reason = lastDisconnect?.error?.output?.statusCode;
                console.log("Connection closed, reason:", reason);
            }
        });

        if (!sock.authState.creds.registered) {
            await delay(3000);
            const code = await sock.requestPairingCode(num);
            if (!res.headersSent) res.json({ code });
        }

    } catch (err) {
        if (!res.headersSent) res.json({ error: "Try again" });
    }
});

app.listen(PORT, () => console.log(`Inawaka!`));
