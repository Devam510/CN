# Problem Statement
Build a LAN Security Breach Analyzer Tool using raw Node.js (net/http modules) backend and Vanilla HTML/CSS/JS frontend to scan common ports, assess risks, and display a technical dark-mode dashboard.

# Numbered Steps
1. [x] Create project files: `server.js`, `index.html`, `style.css`, `app.js`.
2. [x] Implement `server.js`:
    - Setup HTTP Server with CORS on port 3000.
    - Setup POST `/scan` route taking `ipAddress`.
    - Implement port pinging utilizing the `net.Socket` module with 1-second timeout.
    - Formulate JSON response containing service name, status (open/closed), and risk level.
3. [x] Implement `index.html`:
    - Case study card (WannaCry 2017).
    - IP input + Scan button + Loader.
    - Results Table & Recommendations containers.
4. [x] Implement `style.css`:
    - Hacker-style dark terminal theme (bg: #0a0a0a, color: #00ff88).
    - Status colors (Red=High, Orange=Med, Green=Low/Closed).
    - Responsive layout and animations.
5. [x] Implement `app.js`:
    - Wire up API fetch to backend.
    - Dynamically render results row-by-row in the table.
    - Generate recommendations.
6. [x] Final Verification: Start server, ping local IP, verify response & UI rendering.

# Risk / Uncertainty Flags
- Node.js `net.connect` might behave differently on Windows regarding timeout delays if ports are filtered instead of closed. Must ensure we set a strict `1000`ms timeout manually to destroy sockets.
- The distinction between High, Medium, and Low risk ports is hardcoded so we need a solid object mapper for those states.
