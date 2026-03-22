const fs = require('fs');

async function scrape() {
  const res = await fetch('https://www.rightscon.org/');
  const html = await res.text();
  
  // get CSS links
  const regex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi;
  const links = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
      links.push(match[1]);
  }
  console.log('CSS Files:');
  console.log(links);

  let cssCombined = '';
  for (const link of links) {
      if (link.includes('rightscon') && link.includes('.css')) {
          try {
              const cssRes = await fetch(link.startsWith('http') ? link : 'https://www.rightscon.org' + link);
              const css = await cssRes.text();
              cssCombined += css;
          } catch(e) {}
      }
  }
  
  // Extract CSS variables (common in modern theming)
  const rootVars = cssCombined.match(/--[\w-]+:\s*#[0-9a-fA-F]+;/g);
  let varsSet = new Set(rootVars);
  console.log('\nPotential Colors (hex):');
  console.log([...varsSet].slice(0, 30));

  // Extract font families
  const fonts = cssCombined.match(/font-family:\s*([^;\}]+)/g);
  let fontsSet = new Set(fonts);
  console.log('\nFonts:');
  console.log([...fontsSet].slice(0, 15));

  // Extract common properties
  const borders = cssCombined.match(/border-radius:\s*([^;\}]+)/g);
  console.log('\nBorder Radius examples:');
  console.log([...new Set(borders)].slice(0, 10));

  // Try extracting hardcoded colors
  const hardcodedColors = cssCombined.match(/color:\s*(#[0-9a-fA-F]+);/g);
  console.log('\nHardcoded text colors:');
  console.log([...new Set(hardcodedColors)].slice(0, 10));
  
  const bgColors = cssCombined.match(/background-color:\s*(#[0-9a-fA-F]+);/g);
  console.log('\nBackground colors:');
  console.log([...new Set(bgColors)].slice(0, 10));
}

scrape();