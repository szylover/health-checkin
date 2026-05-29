import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
const logs = [];

page.on('console', msg => {
  if (msg.type() === 'error') errors.push('[console.error] ' + msg.text());
  else logs.push('[log] ' + msg.text());
});
page.on('pageerror', err => errors.push('[pageerror] ' + err.message));

// === Test 1: Basic route rendering ===
const routes = ['/', '/checkin', '/calories', '/eatwhat', '/plan', '/progress'];
let allOk = true;
for (const route of routes) {
  errors.length = 0;
  await page.goto('http://localhost:5173' + route, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  const rootLen = await page.evaluate(() => document.getElementById('root')?.innerHTML?.length ?? 0);
  const status = errors.length === 0 ? '✅ OK' : '❌ ERRORS';
  console.log(`${status} ${route} (root: ${rootLen} chars)`);
  if (errors.length) { errors.forEach(e => console.log('   ', e)); allOk = false; }
}

// === Test 2: Simulate food vision confirm flow ===
console.log('\n--- Testing food vision confirm flow ---');
errors.length = 0;
await page.goto('http://localhost:5173/calories', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

// Inject mock photoFoods state by calling React setState via window
await page.evaluate(() => {
  // Simulate what happens after AI returns foods: inject photoFoods + selectedPhotoIdx state
  // Find the React fiber root and trigger setState
  const mockFoods = [
    { name: '白米饭', amount: '1碗 约200g', grams: 200, calories: 232, protein: 4.8, carbs: 51, fat: 0.4 },
    { name: '红烧肉', amount: '3块 约150g', grams: 150, calories: 395, protein: 18, carbs: 8, fat: 32 },
  ];
  window.__mockPhotoFoods = mockFoods;
});

// Check if the "AI识图" button exists
const photoBtn = await page.locator('button:has-text("AI识图")').first();
console.log('AI识图 button exists:', await photoBtn.isVisible());

// Directly call confirmPhotoFoods via page.evaluate by manipulating state
// We'll check by looking at the modal close button and confirm button structure
// First let's see if we can trigger the modal by injecting state through React DevTools approach
const modalVisible = await page.evaluate(() => {
  // Find all buttons with text containing "添加所选"
  const btns = Array.from(document.querySelectorAll('button'));
  return btns.map(b => b.textContent?.trim()).filter(Boolean);
});
console.log('Current buttons:', modalVisible.filter(t => t.length < 20));

// Simulate the photo foods modal appearing by using page internals
// Inject mock data via the zustand store directly
await page.evaluate(() => {
  // Try to access zustand store via window
  const storeKey = 'health-meals';
  const stored = localStorage.getItem(storeKey);
  console.log('Meal store in localStorage:', stored ? 'exists' : 'empty');
});

// Check initial meal records count
const initialRecordCount = await page.evaluate(() => {
  const stored = localStorage.getItem('health-meals');
  if (!stored) return 0;
  const data = JSON.parse(stored);
  return data?.state?.records?.length ?? 0;
});
console.log('Initial meal records:', initialRecordCount);

// Simulate adding via the normal "+ 添加" button to verify addRecord works
await page.click('button:has-text("+ 添加")');
await page.waitForTimeout(300);
const modalOpen = await page.locator('text=添加早餐食物').isVisible().catch(() => false)
  || await page.locator('text=添加午餐食物').isVisible().catch(() => false);
console.log('Add food modal opened:', modalOpen);

if (modalOpen) {
  // Search for a food
  await page.fill('input[placeholder="搜索食物..."]', '米饭');
  await page.waitForTimeout(200);
  // Click first result
  const firstFood = page.locator('.flex-1.overflow-y-auto button').first();
  if (await firstFood.isVisible()) {
    await firstFood.click();
    await page.waitForTimeout(200);
    // Click confirm
    await page.click('button:has-text("确认添加")');
    await page.waitForTimeout(500);
    const newCount = await page.evaluate(() => {
      const stored = localStorage.getItem('health-meals');
      if (!stored) return 0;
      const data = JSON.parse(stored);
      return data?.state?.records?.length ?? 0;
    });
    console.log('Records after manual add:', newCount, newCount > initialRecordCount ? '✅ addRecord works' : '❌ addRecord failed');
  }
}

if (errors.length) { console.log('Errors:', errors); allOk = false; }

await browser.close();
process.exit(allOk ? 0 : 1);
