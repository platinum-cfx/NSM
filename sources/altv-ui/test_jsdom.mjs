import fs from 'fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('C:/Users/aspidev/Desktop/altv-fix-source/data/ui_index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
dom.window.onerror = function(msg, url, line, col, error) {
  console.error('Browser Error:', msg, error);
};
dom.window.addEventListener('unhandledrejection', event => {
  console.error('Promise Error:', event.reason);
});
setTimeout(() => console.log('Done waiting'), 2000);
