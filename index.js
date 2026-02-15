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

// Website Interface (Frontend)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="sw">
        <head>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mega-Baze Session</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #0b141a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .box { background: #222e35; padding: 30px; border-radius: 12px; text-align: center; width: 350px; border-bottom: 4px solid #00a884; }
                input { width: 100%; padding: 12px; margin: 15px 0; border-radius: 6px; border: none; background: #2a3942; color: white; font-size: 16px; outline: none; }
                button { width: 100%; padding: 12px; background: #00a884; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px; }
                #code { font-size: 32px; color: #00a884; margin: 20px 0; font-weight: bold; letter-spacing: 3px; }
                .info { font-size: 12px; color: #8696a0; line-height: 1.5; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2 style="color: #00a884;">Mega-Baze Pair</h2>
                <p class="info">Ingiza namba yako (Anza na 255...)</p>
                <input type="text" id="phone" placeholder="2557XXXXXXXX">
                <button onclick="getPairCode()" id="btn">Pata Code</button>
                <div id="code"></div>
                <p id="status" class="info"></p>
            </div>
            <script>
                async function getPairCode() {
                    const num = document.getElementById('phone').value.replace(/[^0-9]/g, '');
                    if(num.length < 10) return alert('Weka namba sahihi!');
                    document.getElementById('btn').disabled = true;
                    document.getElementById('status').innerText = "Inatengeneza code... subiri kidogo";
                    try {
                        const res = await fetch('/get-code?num=' + num);
                        const data = await res.json();
                        document.getElementById('code').innerText = data.code || "Error!";
                        document.getElementById('status').innerText = "Link na WhatsApp: Devices > Link a Device > Link with phone number";
                    } catch(e) { document.getElementById('status').innerText = "Server Error. Jaribu tena."; }
                    document.getElementById('btn').disabled = false;
                }
            </script>
        </body>
        </html>
    `);
});

// WhatsApp Linking Logic
app.get('/get-code', async (req, res) => {
    let num = req.query.num;
    const sessionDir = path.join('/tmp', 'session-' + num);
    if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

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
            await delay(5000);
            const creds = JSON.parse(fs.readFileSync(path.join(sessionDir, 'creds.json')));
            // Hii ndio Session ID yako ya kuweka kwenye Bot
            const sessionID = Buffer.from(JSON.stringify(creds)).toString('base64');
            
            await sock.sendMessage(sock.user.id, { 
                text: `*USAJILI WA MEGA PLUGINS KUKAMILIKA! ✅*\n\n*Hii hapa Session ID yako:*\n\n\`\`\`${sessionID}\`\`\`\n\n_Copy kodi hiyo na ukaweke kwenye file la config la bot yako._` 
            });
            console.log("Session ID imetumwa DM!");
        }
    });

    // Request pairing code
    if (!sock.authState.creds.registered) {
        try {
            await delay(2000);
            let code = await sock.requestPairingCode(num);
            res.json({ code });
        } catch (err) {
            res.json({ error: "Goma kupata code. Jaribu tena." });
        }
    }
});

app.listen(PORT, () => console.log(`Inawaka: http://localhost:${PORT}`));
