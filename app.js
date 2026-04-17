const scanBtn = document.getElementById('scanBtn');
const ipAddressInput = document.getElementById('ipAddress');
const loader = document.getElementById('loader');
const resultsSection = document.getElementById('resultsSection');
const resultsTableBody = document.querySelector('#resultsTable tbody');
const recommendationsSection = document.getElementById('recommendationsSection');
const recommendationsList = document.getElementById('recommendationsList');

scanBtn.addEventListener('click', async () => {
    let ip = ipAddressInput.value.trim();
    if (!ip) {
        alert("Please enter a target IP address.");
        return;
    }

    // Basic IPv4 validation regex (also allowing localhost)
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip) && ip !== 'localhost' && ip !== '127.0.0.1') {
        alert("Invalid IPv4 address format.");
        return;
    }
    
    // Resolve localhost to IP for net native module
    if (ip === 'localhost') {
        ip = '127.0.0.1';
    }

    // Reset UI before processing
    resultsSection.classList.add('hidden');
    recommendationsSection.classList.add('hidden');
    resultsTableBody.innerHTML = '';
    recommendationsList.innerHTML = '';
    
    scanBtn.disabled = true;
    loader.classList.remove('hidden');

    try {
        const response = await fetch('https://cn-yu1y.onrender.com/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to receive a valid response from backend.');
        }

        renderResults(data.results);
        renderRecommendations(data.results);

        resultsSection.classList.remove('hidden');

    } catch (error) {
        alert("Error: " + error.message + "\nEnsure the backend server is running on port 3000 (execute `node server.js` in terminal).");
    } finally {
        scanBtn.disabled = false;
        loader.classList.add('hidden');
    }
});

function renderResults(results) {
    // Sort results chronologically by port number for display purposes
    const sortedResults = [...results].sort((a,b) => a.port - b.port);
    
    sortedResults.forEach(result => {
        const row = document.createElement('tr');
        
        let riskClass = '';
        if (result.status === 'open') {
            if (result.risk === 'High') riskClass = 'risk-high';
            else if (result.risk === 'Medium') riskClass = 'risk-medium';
            else riskClass = 'risk-low';
        } else {
            riskClass = 'risk-low';
            result.risk = 'None';
        }

        row.innerHTML = `
            <td>${result.port}</td>
            <td>${result.service}</td>
            <td class="status-${result.status}">${result.status.toUpperCase()}</td>
            <td class="${riskClass}">${result.risk.toUpperCase()}</td>
        `;
        resultsTableBody.appendChild(row);
    });
}

function renderRecommendations(results) {
    // Only fetch recommendations for High-risk ports that are exposed
    const openHighRisk = results.filter(r => r.status === 'open' && r.risk === 'High');
    
    if (openHighRisk.length === 0) {
        return; 
    }

    const recommendationsConfig = {
        21: "Port 21 (FTP) is exposed. FTP transmits data and credentials in plain text. Consider using SFTP (Port 22) or FTPS to encrypt data.",
        23: "Port 23 (Telnet) is exposed. Telnet passes traffic in plain text. Replace it immediately with SSH (Port 22) for strongly encrypted remote access.",
        445: "Port 445 (SMB) is exposed. This is a critical risk vector (WannaCry payload). Ensure MS17-010 patch is applied, disable SMBv1, and strict firewall configurations block internet access.",
        3389: "Port 3389 (RDP) is exposed. Do not expose RDP directly. Protect it via VPN or strictly limit IP access, and enforce Network Level Authentication (NLA)."
    };

    openHighRisk.forEach(result => {
        if (recommendationsConfig[result.port]) {
            const li = document.createElement('li');
            li.textContent = recommendationsConfig[result.port];
            recommendationsList.appendChild(li);
        }
    });

    recommendationsSection.classList.remove('hidden');
}

// Allow "Enter" key trigger for usability
ipAddressInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        scanBtn.click();
    }
});
