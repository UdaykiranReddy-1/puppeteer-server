const express = require('express');
const puppeteer = require('puppeteer');
const { getMapAvailability, getMapIframeUrl } = require('./bubblemapsService.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function generateMapScreenshot(chain, token) {
  try {
    // First check if the map is available
    const availability = await getMapAvailability(chain, token);
    if (availability.status !== 'OK' || !availability.availability) {
        console.error('Map not available:', availability.message || 'Unknown reason');
        return null;
    }

    const url = getMapIframeUrl(chain, token);

    const browser = await puppeteer.launch({
      executablePath: '/opt/render/.cache/puppeteer/chrome/linux-135.0.7049.84/chrome-linux64/chrome',
      headless: true, // Works on most environments
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await new Promise(resolve => setTimeout(resolve, 5000));

    const screenshot = await page.screenshot({ type: 'png' });
    await browser.close();

    return screenshot;
  } catch (error) {
    console.error('Error generating screenshot:', error);
    return null;
  }
}

app.post('/api/screenshot', async (req, res) => {
  const { chain, token } = req.body;

  if (!chain || !token) {
    return res.status(400).json({ error: 'chain and token are required' });
  }

  const screenshot = await generateMapScreenshot(chain, token);
  if (!screenshot) {
    return res.status(500).json({ error: 'Failed to generate screenshot' });
  }

  res.set('Content-Type', 'image/png');
  res.send(screenshot);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
