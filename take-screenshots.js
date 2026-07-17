const puppeteer = require('puppeteer-core');

async function main() {
  try {
    // Get the WebSocket debug URL using built-in fetch
    const versionResponse = await fetch('http://127.0.0.1:9445/json/version');
    const versionData = await versionResponse.json();
    const browserWSEndpoint = versionData.webSocketDebuggerUrl;

    console.log('Connecting to browser at:', browserWSEndpoint);

    // Connect to the browser
    const browser = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to analytics list page
    console.log('Navigating to /analytics...');
    await page.goto('http://localhost:5000/analytics', {
      waitUntil: 'networkidle0',
      timeout: 15000
    });

    // Wait for client-side rendering
    console.log('Waiting for client-side rendering...');
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Take screenshot
    console.log('Taking screenshot of /analytics...');
    await page.screenshot({
      path: '/tmp/analytics-list2.png',
      fullPage: true
    });
    console.log('Screenshot saved to /tmp/analytics-list2.png');

    // Navigate to detail page
    console.log('Navigating to /analytics/tabsircg-com...');
    await page.goto('http://localhost:5000/analytics/tabsircg-com', {
      waitUntil: 'networkidle0',
      timeout: 15000
    });

    // Wait for client-side rendering
    console.log('Waiting for client-side rendering...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Take screenshot
    console.log('Taking screenshot of /analytics/tabsircg-com...');
    await page.screenshot({
      path: '/tmp/analytics-detail2.png',
      fullPage: true
    });
    console.log('Screenshot saved to /tmp/analytics-detail2.png');

    // Close the page
    await page.close();

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
