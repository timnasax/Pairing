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

// Website Interface
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mega-Baze Pair</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #111b21; color: white; }
                .card { background: #202c33; padding: 25px; border-radius: 10px; text-align: center; width: 90%; max-width: 380px; border-top: 5px solid #00a884; }
                input { width: 100%; padding: 12px; margin: 15px 0; border-radius: 5px; border: none; font-size: 16px; background: #2a3942; color: white; }
                button { width: 100%; padding: 12px; background: #00a884; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
                #displayCode { font-size: 30px; color: #00a884; margin: 20px 0; font-weight: bold; min-height: 40px; }
                .status { font-size: 13px; color: #8696a0; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Mega-Baze Session</h2>
                <p class="status">Weka namba na code ya nchi (Mfano: 255712...)</p>
                <input type="text" id="num" placeholder="2557XXXXXXXX">
                <button onclick="startPairing()" id="btn">Pata Code</button>
                <div id="displayCode"></div>
                <p id="msg" class="status"></p>
            </div>
            <script>
                async function startPairing() {
                    const number = document.getElementById('num').value.replace(/[^0-9]/g, '');
                    if(!number || number.length < 10) return alert('Ingiza namba sahihi!');
                    
                    const btn = document.getElementById('btn');
                    btn.disabled = true;
                    btn.innerText = "Inatengeneza...";
                    document.getElementById('msg').innerText = "Inatafuta mawasiliano na WhatsApp...";

                    try {
                        const res = await fetch('/pair?number=' + number);
                        const data = await res.json();
                        if(data.code) {
                            document.getElementById('displayCode').innerText = data.code;
                            document.getElementById('msg').innerText = "Nenda WhatsApp > Linked Devices > Link with Phone Number uweke code hiyo.";
                        } else {
                            document.getElementById('msg').innerText = "Kosa: " + (data.error || "Jaribu tena");
                        }
                    } catch(e) {
                        document.getElementById('msg').innerText = "Server imeshindwa kujibu. Jaribu tena.";
                    }
                    btn.disabled = false;
                    btn.innerText = "Pata Code";
                }
            </script>
        </body>
        </html>
    `);
});

// Logic ya Pairing
app.get('/pair', async (req, res) => {
    let num = req.query.number;
    const sessionPath = path.join('/tmp', 'sessions', `${num}_${Date.now()}`); // Jina la folder liwe unique

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    try {
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }),
            browser: Browsers.macOS("Chrome") 
        });

        // Kama baada ya sekunde 15 hakuna code, tupa error
        const timeout = setTimeout(() => {
            if (!res.headersSent) res.json({ error: "Muda umeisha. Jaribu tena." });
        }, 20000);

        if (!sock.authState.creds.registered) {
            let code = await sock.requestPairingCode(num);
            clearTimeout(timeout);
            if (!res.headersSent) res.json({ code });
        }

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                console.log("Kimeeleweka! Inatuma Session...");
                await delay(5000);
                const credsFile = path.join(sessionPath, 'creds.json');
                if (fs.existsSync(credsFile)) {
                    const sessionID = Buffer.from(fs.readFileSync(credsFile)).toString('base64');
                    await sock.sendMessage(sock.user.id, { 
                        text: `*USAJILI WA MEGA-BAZE UMEFANIKIWA! ✅*\n\n*SESSION ID:* \n\n${sessionID}\n\n_Iweke sehemu salama!_` 
                    });
                }
                // Safisha folder baada ya kumaliza (hiari)
                // fs.rmSync(sessionPath, { recursive: true, force: true });
            }

            if (connection === 'close') {
                console.log("Connection imefungwa. Sababu:", lastDisconnect?.error);
            }
        });

    } catch (err) {
        console.error("Kosa la ndani:", err);
        if (!res.headersSent) res.json({ error: "WhatsApp imekataa ombi. Jaribu baada ya dakika 5." });
    }
});

app.listen(PORT, () => console.log(`Inawaka kwenye port ${PORT}`));
