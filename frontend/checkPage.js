import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.toString()));

  try {
    const response = await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    console.log('Navigation status:', response && response.status());
    await page.screenshot({ path: 'page-screenshot.png', fullPage: true });
    console.log('Screenshot saved to page-screenshot.png');
  } catch (err) {
    console.error('Error during navigation:', err);
  } finally {
    await browser.close();
  }
})();