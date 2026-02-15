const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Website Rahisi (Frontend)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="sw">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WhatsApp Pairing Code</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
                .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; width: 90%; max-width: 400px; }
                h2 { color: #075e54; }
                input { width: 100%; padding: 12px; margin: 15px 0; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 16px; }
                button { width: 100%; padding: 12px; background-color: #25d366; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: 0.3s; }
                button:hover { background-color: #128c7e; }
                #displayCode { font-size: 32px; font-weight: bold; color: #128c7e; letter-spacing: 5px; margin: 20px 0; }
                #status { font-size: 14px; color: #666; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Mega-Baze Pair</h2>
                <p>Ingiza namba yako kuanzia na code ya nchi (Mfano: 255712345678)</p>
                <input type="text" id="number" placeholder="255XXXXXXXXX">
                <button onclick="getCode()">Pata Code</button>
                <div id="displayCode"></div>
                <p id="status"></p>
            </div>

            <script>
                async function getCode() {
                    const num = document.getElementById('number').value.replace(/[^0-9]/g, '');
                    if(!num || num.length < 10) return alert('Weka namba sahihi!');
                    
                    document.getElementById('status').innerText = "Inatafuta code, subiri kidogo...";
                    document.getElementById('displayCode').innerText = "";
                    
                    try {
                        const response = await fetch('/get-code?number=' + num);
                        const data = await response.json();
                        if(data.code) {
                            document.getElementById('displayCode').innerText = data.code;
                            document.getElementById('status').innerText = "Weka code hiyo kwenye WhatsApp yako (Linked Devices > Link with phone number)";
                        } else {
                            document.getElementById('status').innerText = "Imeshindikana! Jaribu tena.";
                        }
                    } catch (err) {
                        document.getElementById('status').innerText = "Error imetokea!";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Logic ya WhatsApp
app.get('/get-code', async (req, res) => {
    let num = req.query.number;
    const sessionDir = path.join(__dirname, 'sessions', num);
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Chrome") // Hii inasaidia kutotambuliwa kama bot haraka
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log(`Imeunganishwa kikamilifu: ${num}`);
            
            // Tengeneza Session ID (Base64 ya creds.json)
            const credsPath = path.join(sessionDir, 'creds.json');
            const sessionId = Buffer.from(fs.readFileSync(credsPath)).toString('base64');
            
            // Tuma Plugins na Session ID DM
            await delay(5000);
            await sock.sendMessage(sock.user.id, { 
                text: `*KAZI IMESHAISHA! ✅*\n\n*Hii ndio Session ID yako:* \n\n${sessionId}\n\n*PLUGIN ZAKO:* \n- MegaBaze_Plugin_V1\n- Auto_Downloader\n- Antidelete_Plus\n\n_Usishare Session ID hii na mtu yeyote!_` 
            });
        }
    });

    if (!sock.authState.creds.registered) {
        try {
            await delay(1500);
            let code = await sock.requestPairingCode(num);
            res.json({ code });
        } catch (error) {
            res.json({ error: "Failed to get code" });
        }
    }
});

app.listen(PORT, () => console.log(`Inatumia Port: ${PORT}`));
