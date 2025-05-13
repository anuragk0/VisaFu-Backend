const puppeteer = require('puppeteer');

function fillTemplate(html, data) {
    return html.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
  }

async function generateInvoicePdfBuffer(invoiceHtml, data) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Replace placeholders
  const filledHtml = fillTemplate(invoiceHtml, data);

  await page.setContent(filledHtml, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

  await browser.close();

  return pdfBuffer;
}

module.exports = {generateInvoicePdfBuffer};