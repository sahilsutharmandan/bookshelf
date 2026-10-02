const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const initialBooks = [
  {
    workId: "OL82563W",
    title: "Harry Potter and the Philosopher's Stone",
    authors: ["J.K. Rowling"],
    coverId: 10521270,
    status: "want",
    rating: 0,
    notes: "",
    dateAdded: "2026-10-02T00:00:00.000Z"
  },
  {
    workId: "OL1168083W",
    title: "Nineteen Eighty-Four",
    authors: ["George Orwell"],
    coverId: 9267242,
    status: "want",
    rating: 0,
    notes: "",
    dateAdded: "2026-10-02T00:00:00.000Z"
  },
  {
    workId: "OL17930368W",
    title: "Atomic Habits",
    authors: ["James Clear"],
    coverId: 12539702,
    status: "want",
    rating: 0,
    notes: "",
    dateAdded: "2026-10-02T00:00:00.000Z"
  },
  {
    workId: "OL27448W",
    title: "The Lord of the Rings",
    authors: ["J.R.R. Tolkien"],
    coverId: 14625765,
    status: "reading",
    rating: 0,
    notes: "",
    dateAdded: "2026-10-02T00:00:00.000Z"
  },
  {
    workId: "OL45804W",
    title: "Fantastic Mr Fox",
    authors: ["Roald Dahl"],
    coverId: 6498519,
    status: "finished",
    rating: 4,
    notes: "",
    dateAdded: "2026-10-02T00:00:00.000Z"
  },
  {
    workId: "OL103123W",
    title: "Fahrenheit 451",
    authors: ["Ray Bradbury"],
    coverId: 12993656,
    status: "finished",
    rating: 5,
    notes: "",
    dateAdded: "2026-10-02T00:00:00.000Z"
  },
  {
    workId: "OL81613W",
    title: "It",
    authors: ["Stephen King"],
    coverId: 8569284,
    status: "finished",
    rating: 3,
    notes: "",
    dateAdded: "2026-10-02T00:00:00.000Z"
  },
  {
    workId: "OL468431W",
    title: "The Great Gatsby",
    authors: ["F. Scott Fitzgerald"],
    coverId: 10590366,
    status: "finished",
    rating: 4,
    notes: "",
    dateAdded: "2026-10-02T00:00:00.000Z"
  }
];

const initialGoal = {
  year: 2026,
  target: 3
};

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.msgId = 0;
    this.callbacks = new Map();
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
  }

  static async connect(port) {
    const listRes = await fetch(`http://localhost:${port}/json/new?http://localhost:4210/reading-list`, { method: 'PUT' });
    const target = await listRes.json();
    const client = new CDPClient(target.webSocketDebuggerUrl);
    await new Promise((resolve) => {
      if (client.ws.readyState === WebSocket.OPEN) resolve();
      else client.ws.onopen = resolve;
    });
    return client;
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await this.wait(1500);
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile,
      screenWidth: width,
      screenHeight: height,
    });
    await this.send('Emulation.setVisibleSize', { width, height }).catch(() => {});
  }

  async waitForImages(maxWaitMs = 6000) {
    await this.eval(`
      new Promise(async (resolve) => {
        const start = Date.now();
        const check = () => {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs.length > 0 && imgs.every(img => img.complete && img.naturalWidth > 0);
        };
        while (Date.now() - start < ${maxWaitMs}) {
          if (check()) return resolve();
          await new Promise(r => setTimeout(r, 200));
        }
        resolve();
      })
    `);
    await this.wait(500);
  }

  async captureScreenshot(filepath, clip = null) {
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await this.send('Page.captureScreenshot', params);
    const buf = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filepath, buf);
    console.log(`Saved screenshot to ${filepath}`);
  }

  wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  const port = 9224;
  const profileDir = '/tmp/chrome-bookshelf-profile';
  const chrome = cp.spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    `--user-data-dir=${profileDir}`,
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
  ]);

  await new Promise((r) => setTimeout(r, 1200));

  try {
    const client = await CDPClient.connect(port);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    const outDir = path.resolve(__dirname, '../evidence/after');
    const sharedOutDir = '/Users/sahil/Documents/rl-multimodal2/in-progress/RL Multimodal_BookShelf_ReadingList/shared_evidence/gemini_evidence/after';
    fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(sharedOutDir, { recursive: true });

    // 1. Initial State: Set localStorage
    await client.setViewport(1280, 901, false);
    await client.navigate('http://localhost:4210/reading-list');
    await client.eval(`
      localStorage.setItem('bookshelf_reading_list', JSON.stringify(${JSON.stringify(initialBooks)}));
      localStorage.setItem('bookshelf_reading_goal', JSON.stringify(${JSON.stringify(initialGoal)}));
    `);
    await client.navigate('http://localhost:4210/reading-list');
    await client.waitForImages(8000);

    // Capture 1-reading-list.png
    await client.captureScreenshot(path.join(outDir, '1-reading-list.png'), { x: 0, y: 0, width: 1280, height: 901, scale: 1 });
    fs.copyFileSync(path.join(outDir, '1-reading-list.png'), path.join(sharedOutDir, '1-reading-list.png'));

    // 2. Drag Harry Potter to Reading column
    console.log('Finding positions of Harry Potter card and Reading column...');
    const coords = await client.eval(`
      (() => {
        const cards = Array.from(document.querySelectorAll('.kanban-card'));
        const hpCard = cards.find(c => c.textContent.includes('Harry Potter'));
        if (!hpCard) return null;
        const hpRect = hpCard.getBoundingClientRect();

        const columns = Array.from(document.querySelectorAll('.column'));
        const readingCol = columns.find(c => c.textContent.includes('Reading'));
        if (!readingCol) return null;
        const readingCardList = readingCol.querySelector('.card-list');
        const readingRect = readingCardList.getBoundingClientRect();

        return {
          dragStartX: Math.round(hpRect.x + hpRect.width / 2),
          dragStartY: Math.round(hpRect.y + hpRect.height / 2),
          dropX: Math.round(readingRect.x + readingRect.width / 2),
          dropY: Math.round(readingRect.y + readingRect.height - 20)
        };
      })()
    `);

    console.log('Coords:', coords);

    if (coords) {
      await client.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: coords.dragStartX,
        y: coords.dragStartY,
        button: 'left',
        buttons: 1,
        clickCount: 1,
      });
      await client.wait(150);

      const steps = 25;
      for (let i = 1; i <= steps; i++) {
        const curX = Math.round(coords.dragStartX + (coords.dropX - coords.dragStartX) * (i / steps));
        const curY = Math.round(coords.dragStartY + (coords.dropY - coords.dragStartY) * (i / steps));
        await client.send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: curX,
          y: curY,
          buttons: 1,
        });
        await client.wait(25);
      }

      await client.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: coords.dropX,
        y: coords.dropY,
        button: 'left',
        buttons: 0,
      });
      await client.wait(1000);
    }

    await client.waitForImages(3000);

    // Capture 2-dragged-to-reading.png
    await client.captureScreenshot(path.join(outDir, '2-dragged-to-reading.png'), { x: 0, y: 0, width: 1280, height: 901, scale: 1 });
    fs.copyFileSync(path.join(outDir, '2-dragged-to-reading.png'), path.join(sharedOutDir, '2-dragged-to-reading.png'));

    // 3. Refresh the page to verify persistence!
    console.log('Refreshing page...');
    await client.send('Page.reload', {});
    await client.wait(1500);
    await client.waitForImages(8000);

    // Capture 3-after-refresh.png
    await client.captureScreenshot(path.join(outDir, '3-after-refresh.png'), { x: 0, y: 0, width: 1280, height: 901, scale: 1 });
    fs.copyFileSync(path.join(outDir, '3-after-refresh.png'), path.join(sharedOutDir, '3-after-refresh.png'));

    // 4. Mobile view: 390x844
    console.log('Setting mobile viewport (390x844)...');
    await client.setViewport(390, 844, true);
    await client.eval(`
      localStorage.setItem('bookshelf_reading_list', JSON.stringify(${JSON.stringify(initialBooks)}));
    `);
    await client.send('Page.reload', {});
    await client.wait(1500);
    await client.waitForImages(8000);

    // Capture 4-reading-list-mobile.png
    await client.captureScreenshot(path.join(outDir, '4-reading-list-mobile.png'), { x: 0, y: 0, width: 390, height: 844, scale: 1 });
    fs.copyFileSync(path.join(outDir, '4-reading-list-mobile.png'), path.join(sharedOutDir, '4-reading-list-mobile.png'));

    // 5. Stats page: 1280x901
    console.log('Navigating to stats page...');
    await client.setViewport(1280, 901, false);
    await client.navigate('http://localhost:4210/stats');
    await client.wait(1500);

    // Capture 5-stats-goal.png
    await client.captureScreenshot(path.join(outDir, '5-stats-goal.png'), { x: 0, y: 0, width: 1280, height: 901, scale: 1 });
    fs.copyFileSync(path.join(outDir, '5-stats-goal.png'), path.join(sharedOutDir, '5-stats-goal.png'));

    console.log('All screenshots captured successfully!');
    client.close();
    chrome.kill();
  } catch (err) {
    console.error('Error during capture:', err);
    chrome.kill();
  }
}

main();
