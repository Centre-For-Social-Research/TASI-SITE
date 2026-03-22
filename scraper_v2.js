const fs = require('fs');
const https = require('https');

function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function scrape() {
  try {
    const html = await get('https://www.rightscon.org/');
    const regex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi;
    const links = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
        links.push(match[1]);
    }
    
    let out = 'CSS Files:\n' + links.join('\n') + '\n';
    
    let cssCombined = '';
    for (const link of links) {
        if (link.includes('wp-content')) {
            try {
                const url = link.startsWith('http') ? link : 'https://www.rightscon.org' + link;
                const css = await get(url);
                cssCombined += css;
            } catch(e) {}
        }
    }
    
    const rootVarsHex = cssCombined.match(/--[\w-]+:\s*#[0-9a-fA-F]+;/g) || [];
    out += '\nPotential Colors (hex):\n' + [...new Set(rootVarsHex)].join('\n') + '\n';

    const rootVarsOther = cssCombined.match(/--[\w-]+:\s*[^;]+;/g) || [];
    out += '\nPotential Vars (other):\n' + [...new Set(rootVarsOther)].filter(x=>x.includes('color') || x.includes('bg')).join('\n') + '\n';

    const fonts = cssCombined.match(/font-family:\s*([^;\}]+)/g) || [];
    out += '\nFonts:\n' + [...new Set(fonts)].join('\n') + '\n';

    const borders = cssCombined.match(/border-radius:\s*([^;\}]+)/g) || [];
    out += '\nBorder Radius examples:\n' + [...new Set(borders)].slice(0, 10).join('\n') + '\n';

    const buttons = cssCombined.match(/\.btn[^\{]*\{[^\}]*\}/g) || [];
    out += '\nButton styles:\n' + buttons.slice(0, 5).join('\n') + '\n';

    fs.writeFileSync('c:\\Users\\Media\\Desktop\\New folder\\scraper_output.txt', out);
  } catch(e) {
    fs.writeFileSync('c:\\Users\\Media\\Desktop\\New folder\\scraper_output.txt', 'Error: ' + e.message);
  }
}

scrape();