const express = require('express');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    makeCacheableSignalKeyStore,
    Browsers 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Website Frontend
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="sw">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mega-Baze Session</title>
            <style>
                body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #e5ddd5; }
                .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; width: 350px; }
                input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
                button { width: 100%; padding: 12px; background: #25d366; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
                #displayCode { font-size: 28px; color: #075e54; margin: 15px 0; font-weight: bold; letter-spacing: 2px; }
                .loader { color: #666; font-size: 13px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="color: #075e54;">Mega-Baze Pair</h2>
                <p>Ingiza namba (Mfano: 255712345678)</p>
                <input type="text" id="num" placeholder="255XXXXXXXXX">
                <button onclick="startPairing()">Pata Code</button>
                <div id="displayCode"></div>
                <p id="msg" class="loader"></p>
            </div>
            <script>
                async function startPairing() {
                    const number = document.getElementById('num').value.replace(/[^0-9]/g, '');
                    if(!number) return alert('Weka namba!');
                    document.getElementById('msg').innerText = "Inatengeneza code... subiri kidogo";
                    try {
                        const res = await fetch('/pair?number=' + number);
                        const data = await res.json();
                        document.getElementById('displayCode').innerText = data.code || "Error!";
                        document.getElementById('msg').innerText = "Link na WhatsApp: Devices > Link a Device > Link with phone number instead";
                    } catch(e) { document.getElementById('msg').innerText = "Jaribu tena baadaye"; }
                }
            </script>
        </body>
        </html>
    `);
});

// Pairing Logic
app.get('/pair', async (req, res) => {
    let num = req.query.number;
    // Kutumia /tmp ni muhimu kwa ajili ya Render
    const sessionPath = path.join('/tmp', 'sessions', num);
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    try {
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: Browsers.ubuntu("Chrome")
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'open') {
                await delay(3000);
                const credsData = fs.readFileSync(path.join(sessionPath, 'creds.json'));
                const sessionID = Buffer.from(credsData).toString('base64');
                
                // Tuma Session ID DM
                await sock.sendMessage(sock.user.id, { 
                    text: `*USAJILI UMEKAMILIKA! ✅*\n\n*SESSION ID:* \n\n${sessionID}\n\n*PLUGINS:* \n- MegaBaze_V1\n- Bot_System\n\n_Usitupe kodi hii kwa mtu yeyote!_` 
                });
                console.log(`Zimeunganishwa kwa mafanikio: ${num}`);
            }
        });

        if (!sock.authState.creds.registered) {
            setTimeout(async () => {
                let code = await sock.requestPairingCode(num);
                res.json({ code: code });
            }, 2000);
        }
    } catch (err) {
        res.json({ error: "Server Error" });
    }
});

app.listen(PORT, () => console.log(`Inatumia port ${PORT}`));
