const express = require('express');
const puppeteer = require('puppeteer');
const { getMapAvailability, getMapIframeUrl } = require('./bubblemapsService.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function generateMapScreenshot(chain, token) {
  let browser = null;
  
  try {
    // First check if the map is available
    const availability = await getMapAvailability(chain, token);
    if (availability.status !== 'OK' || !availability.availability) {
      console.error('Map not available:', availability.message || 'Unknown reason');
      return null;
    }

    const url = getMapIframeUrl(chain, token);

    // Launch puppeteer with settings compatible with Render.com
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      headless: true
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('Waiting for content to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Taking screenshot...');
    const screenshot = await page.screenshot({ type: 'png' });
    
    return screenshot;
  } catch (error) {
    console.error('Error generating screenshot:', error);
    return null;
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
}

app.post('/api/screenshot', async (req, res) => {
  const { chain, token } = req.body;

  if (!chain || !token) {
    return res.status(400).json({ error: 'chain and token are required' });
  }

  console.log(`Processing screenshot request for chain: ${chain}, token: ${token}`);
  const screenshot = await generateMapScreenshot(chain, token);
  if (!screenshot) {
    return res.status(500).json({ error: 'Failed to generate screenshot' });
  }

  res.set('Content-Type', 'image/png');
  res.send(screenshot);
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});