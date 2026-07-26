export function isBot(): boolean {
  try {
    if (window.navigator.webdriver === true || window.callPhantom || window._phantom || window.__nightmare) {
      return true;
    }
    if (
      !window.navigator ||
      !window.location ||
      !window.document ||
      typeof window.navigator !== 'object' ||
      typeof window.location !== 'object' ||
      typeof window.document !== 'object'
    ) {
      return true;
    }

    const nav = window.navigator;
    if (!nav.userAgent || nav.userAgent === '' || nav.userAgent === 'undefined' || nav.userAgent.length < 5) {
      return true;
    }

    const ua = nav.userAgent.toLowerCase();
    if (
      ua.includes('headlesschrome') ||
      ua.includes('phantomjs') ||
      ua.includes('selenium') ||
      ua.includes('webdriver') ||
      ua.includes('puppeteer') ||
      ua.includes('playwright')
    ) {
      return true;
    }

    const keys = [
      '__webdriver_evaluate',
      '__selenium_evaluate',
      '__webdriver_script_function',
      '__webdriver_unwrapped',
      '__fxdriver_evaluate',
      '__driver_evaluate',
      '_Selenium_IDE_Recorder',
      '_selenium',
      'calledSelenium',
      '$cdc_asdjflasutopfhvcZLmcfl_',
    ];

    for (const key of keys) {
      if (typeof (window as any)[key] !== 'undefined') return true;
    }

    if (
      document.documentElement &&
      (document.documentElement.getAttribute('webdriver') ||
        document.documentElement.getAttribute('selenium') ||
        document.documentElement.getAttribute('driver'))
    ) {
      return true;
    }

    if (
      ua.includes('python') ||
      ua.includes('curl') ||
      ua.includes('wget') ||
      ua.includes('java/') ||
      ua.includes('go-http') ||
      ua.includes('node.js') ||
      ua.includes('axios') ||
      ua.includes('postman')
    ) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}
