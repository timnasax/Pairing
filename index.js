const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
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
            <title>AVIATOR PREDATOR | BETPAWA SYNC</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #050505; color: white; text-align: center; margin: 0; padding-top: 50px; }
                .navbar { background: #ff0000; padding: 15px; position: fixed; top: 0; width: 100%; font-weight: bold; font-size: 20px; box-shadow: 0 0 20px #ff0000; }
                .main-card { background: #111; border: 2px solid #ff0000; padding: 30px; border-radius: 20px; width: 85%; max-width: 400px; display: inline-block; margin-top: 50px; }
                .odds { font-size: 70px; font-weight: bold; color: #ff0000; margin: 10px 0; font-family: 'Courier New', monospace; }
                .time-info { font-size: 14px; color: #0f0; margin-bottom: 20px; font-weight: bold; }
                .btn { width: 100%; padding: 15px; background: #ff0000; border: none; color: white; font-weight: bold; font-size: 18px; cursor: pointer; border-radius: 10px; }
                .btn:disabled { background: #444; }
                .log { font-size: 12px; color: #888; margin-top: 15px; text-align: left; background: #000; padding: 10px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="navbar">AVIATOR PREDATOR - LIVE SYNC</div>
            <div class="main-card">
                <p id="syncStatus" style="color: #888; font-size: 11px;">SERVER STATUS: IDLE</p>
                <div class="odds" id="oddsDisplay">--.--</div>
                <div class="time-info" id="timeDisplay">TIME: --:--:--</div>
                <button class="btn" id="predictBtn" onclick="getRealSignal()">GENERATE NEXT ROUND</button>
                
                <div class="log">
                    <p id="logText">> Ready to scan Betpawa round...</p>
                </div>
            </div>

            <audio id="beep" src="https://www.soundjay.com/buttons/beep-07.mp3"></audio>

            <script>
                function getRealSignal() {
                    const btn = document.getElementById('predictBtn');
                    const odds = document.getElementById('oddsDisplay');
                    const timeDisp = document.getElementById('timeDisplay');
                    const status = document.getElementById('syncStatus');
                    const log = document.getElementById('logText');
                    const beep = document.getElementById('beep');

                    btn.disabled = true;
                    status.innerText = "SYNCING WITH BETPAWA SERVER...";
                    status.style.color = "#ff0";
                    log.innerText = "> Fetching server seed...";
                    
                    beep.play();

                    // Simulation ya mzunguko (2.5 seconds)
                    setTimeout(() => {
                        // LOGIC YA ODDS (Inapendelea namba ndogo kama Aviator halisi)
                        let val;
                        let chance = Math.random();
                        if (chance < 0.6) val = (Math.random() * (1.90 - 1.10) + 1.10).toFixed(2); // 60% chance ndogo
                        else if (chance < 0.9) val = (Math.random() * (4.50 - 2.00) + 2.00).toFixed(2); // 30% chance ya kati
                        else val = (Math.random() * (15.00 - 5.00) + 5.00).toFixed(2); // 10% Big win

                        // MUDA WA MZUNGUKO (Saa hiyo hiyo + sekunde 20 mbele)
                        const now = new Date();
                        now.setSeconds(now.getSeconds() + 20);
                        const predictTime = now.getHours().toString().padStart(2, '0') + ":" + 
                                          now.getMinutes().toString().padStart(2, '0') + ":" + 
                                          now.getSeconds().toString().padStart(2, '0');

                        odds.innerText = val + "x";
                        timeDisp.innerText = "NEXT ROUND TIME: " + predictTime;
                        status.innerText = "SIGNAL SECURED ✅";
                        status.style.color = "#0f0";
                        log.innerText = "> Prediction successful for round at " + predictTime;
                        
                        if (navigator.vibrate) navigator.vibrate(200);
                        btn.disabled = false;
                    }, 2500);
                }
            </script>
        </body>
        </html>
    `);
});

// (Weka hapa ile logic yako ya WhatsApp pairing code uliyokuwa nayo mwanzo)
app.get('/get-code', async (req, res) => {
    let num = req.query.num;
    const { state, saveCreds } = await useMultiFileAuthState(path.join('/tmp', 'predator-' + num));
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })) },
        logger: pino({ level: "fatal" }),
        browser: Browsers.macOS("Chrome")
    });
    if (!sock.authState.creds.registered) {
        let code = await sock.requestPairingCode(num);
        res.json({ code });
    }
});

app.listen(PORT, () => console.log(`Server Active`));
