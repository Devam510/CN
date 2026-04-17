const http = require('http');
const net = require('net');

const PORTS_TO_SCAN = [21, 22, 23, 25, 80, 443, 445, 3306, 3389, 8080];
const PORT_INFO = {
    21: { service: 'FTP', risk: 'High' },
    22: { service: 'SSH', risk: 'Medium' },
    23: { service: 'Telnet', risk: 'High' },
    25: { service: 'SMTP', risk: 'Medium' },
    80: { service: 'HTTP', risk: 'Low' },
    443: { service: 'HTTPS', risk: 'Low' },
    445: { service: 'SMB', risk: 'High' },
    3306: { service: 'MySQL', risk: 'Medium' },
    3389: { service: 'RDP', risk: 'High' },
    8080: { service: 'HTTP-Alt', risk: 'Low' }
};

function checkPort(port, host) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        
        socket.setTimeout(1000);

        socket.on('connect', () => {
            socket.destroy(); // Always cleanup connections
            resolve({
                port,
                status: 'open',
                service: PORT_INFO[port].service,
                risk: PORT_INFO[port].risk
            });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({
                port,
                status: 'closed',
                service: PORT_INFO[port].service,
                risk: PORT_INFO[port].risk
            });
        });

        socket.on('error', (err) => {
            socket.destroy();
            resolve({
                port,
                status: 'closed',
                service: PORT_INFO[port].service,
                risk: PORT_INFO[port].risk
            });
        });

        socket.connect(port, host);
    });
}

const server = http.createServer((req, res) => {
    // Basic CORS setup since HTML is fetched likely via file://
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/scan') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                if (!data.ip) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'IP address is required.' }));
                    return;
                }

                // Execute port scanning in parallel
                const results = await Promise.all(PORTS_TO_SCAN.map(p => checkPort(p, data.ip)));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ results }));
                
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON body format.' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint not found. Use POST /scan' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`[+] LAN Security Breach Analyzer Engine initialized.\n[+] Server listening on port ${PORT}...`);
});
