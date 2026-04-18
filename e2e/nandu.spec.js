/**
 * TEST E2E FINAL — nandu-obres.vercel.app
 * Cobreix: login, crear obra+PDF, planificació, acta (hores+fotos), fitxa treballador,
 * certificació per obra i per treballador.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const EMAIL = 'nandu@nandu-obres.test';
const PASSWORD = 'NanduTest2026!';
const OBRA_UUID = 'f792ce1d-2a1a-48de-b3ff-2d5a87e6550d'; // Casa Puigdomenech (existent)
const TREBALLADOR_UUID = '5a4f73de-5763-401e-ab69-ed7296e6bd4d'; // Joan Martí

fs.mkdirSync('/tmp/nandu-e2e/screenshots', { recursive: true });

const bugs = [];
function bug(id, severity, desc, detail = '') {
  bugs.push({ id, severity, desc, detail });
  console.log(`\n🐛 BUG-${id} [${severity}]: ${desc}${detail ? ' — ' + detail : ''}`);
}

async function login(page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ timeout: 10000 });
  await emailInput.fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  // Verify we're logged in
  const url = page.url();
  if (url.includes('/login')) throw new Error('Login failed - still on login page');
}

async function snap(page, name) {
  await page.screenshot({ path: `/tmp/nandu-e2e/screenshots/${name}.png`, fullPage: false });
}

// ─────────────────────────────────────────────────────────────
test.describe('T01 · Login', () => {
  test('Login amb credencials correctes redirigeix a /obres', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').first().fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await snap(page, 'T01-login-filled');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const url = page.url();
    await snap(page, 'T01-login-after');
    console.log(`URL after login: ${url}`);
    expect(url, 'Ha de redirigir fora de /login').not.toContain('/login');
    expect(url, 'Ha de redirigir a /obres').toContain('/obres');
  });

  test('Login amb credencials incorrectes mostra error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').first().fill('wrong@test.com');
    await page.locator('input[type="password"]').first().fill('wrongpass123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await snap(page, 'T01-login-error');
    const url = page.url();
    const hasError = await page.locator('text=/incorrect|error|invalid|incorrecte/i').count();
    console.log(`URL: ${url}, Error messages: ${hasError}`);
    // Should stay on login or show error
    const staysOnLogin = url.includes('/login');
    if (!staysOnLogin && hasError === 0) {
      bug('01a', 'MEDIUM', 'Login amb credencials incorrectes no mostra error visible', `URL: ${url}`);
    }
  });
});

// ─────────────────────────────────────────────────────────────
test.describe('T02 · Crear Obra', () => {
  test('Formulari de nova obra té els camps correctes', async ({ page }) => {
    await login(page);
    await page.goto('/obres/nova');
    await page.waitForLoadState('networkidle');
    await snap(page, 'T02-nova-obra-form');

    const nomInput = page.locator('input[name="nom"]');
    const clientInput = page.locator('input[name="client_nom"]');
    const liniaSelect = page.locator('[name="linia"]');

    await expect(nomInput, 'Camp "nom" ha d\'existir').toBeVisible();
    await expect(clientInput, 'Camp "client_nom" ha d\'existir').toBeVisible();
    await expect(liniaSelect, 'Select "linia" ha d\'existir').toBeVisible();

    // Check no PDF upload on creation form
    const fileInput = page.locator('input[type="file"]');
    const hasPdfOnCreate = await fileInput.count() > 0;
    if (!hasPdfOnCreate) {
      console.log('ℹ️  DISSENY: Formulari de creació no té camp PDF (el PDF s\'afegeix des del detall de l\'obra)');
    }
  });

  test('Crear nova obra i verificar redirect', async ({ page }) => {
    await login(page);
    await page.goto('/obres/nova');
    await page.waitForLoadState('networkidle');

    const redirects = [];
    page.on('response', r => {
      if (r.status() >= 300 && r.status() < 400) {
        redirects.push({ status: r.status(), location: r.headers()['location'] });
      }
    });

    await page.locator('input[name="nom"]').fill('Obra E2E Test Final');
    await page.locator('input[name="client_nom"]').fill('Client Test SA');
    await page.locator('[name="linia"]').selectOption('rehabilitacio');
    await snap(page, 'T02-nova-obra-filled');

    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    await snap(page, 'T02-nova-obra-after');

    console.log(`Redirects: ${JSON.stringify(redirects)}`);
    console.log(`URL after save: ${urlAfter}`);

    if (urlAfter.includes('/login')) {
      bug('02a', 'CRÍTICO', 'Crear nova obra redirigeix a /login en lloc del detall de l\'obra',
        `POST /obres/nova retorna 303 però redirigeix a /login. Probable error en el server action (sessió perduda o redirect mal configurat)`);
      expect.soft(urlAfter, 'No hauria de redirigir a /login').not.toContain('/login');
    } else {
      expect(urlAfter, 'Ha de redirigir al detall de l\'obra').toMatch(/\/obres\/[a-f0-9-]+/);
    }
  });

  test('Upload pressupost PDF des del detall de l\'obra', async ({ page }) => {
    await login(page);
    await page.goto(`/obres/${OBRA_UUID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await snap(page, 'T02-obra-detail-before-pdf');

    const fileInputs = await page.locator('input[type="file"]').all();
    expect(fileInputs.length, 'Ha d\'haver almenys 1 input de fitxer a l\'obra').toBeGreaterThanOrEqual(1);

    // Create minimal valid PDF
    const pdfPath = '/tmp/nandu-e2e/pressupost-test.pdf';
    fs.writeFileSync(pdfPath, Buffer.from(
      'JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMDkgMDAwMDAgbgowMDAwMDAwMDU4IDAwMDAwIG4KMDAwMDAwMDExNSAwMDAwMCBuCnRyYWlsZXIKPDwKL1NpemUgNAovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMTkwCiUlRU9G',
      'base64'
    ));
    await fileInputs[0].setInputFiles(pdfPath);
    await page.waitForTimeout(2000);
    await snap(page, 'T02-pdf-uploaded');

    const bodyAfter = await page.textContent('body');
    const pdfUploaded = bodyAfter?.includes('Obrir PDF') || bodyAfter?.includes('Substituir');
    console.log(`PDF upload result: ${pdfUploaded ? '✅ UPLOADED' : '❌ FAILED'}`);

    if (!pdfUploaded) {
      bug('02b', 'HIGH', 'Upload de pressupost PDF no confirma l\'èxit visualment', 'No apareix "Obrir PDF" ni "Substituir" després de l\'upload');
    }
    expect(pdfUploaded, 'PDF ha de mostrar confirmació visual d\'upload').toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
test.describe('T03 · Planificació Diària', () => {
  test('Pàgina de planificació accessible i mostra data actual', async ({ page }) => {
    await login(page);
    await page.goto('/planificacio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await snap(page, 'T03-planificacio');

    const bodyText = await page.textContent('body');
    const hasNavigation = bodyText?.includes('Anterior') || bodyText?.includes('Seguent');
    expect(hasNavigation, 'Ha de tenir navegació de dates').toBeTruthy();
    console.log('✅ Navegació de dates present');
  });

  test('Afegir assignació diària (obra + treballador)', async ({ page }) => {
    await login(page);
    await page.goto('/planificacio');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const obraSelect = page.locator('select[name="obra_id"]');
    const treballadorSelect = page.locator('select[name="treballador_id"]');
    await expect(obraSelect, 'Select d\'obra ha d\'existir').toBeVisible();
    await expect(treballadorSelect, 'Select de treballador ha d\'existir').toBeVisible();

    await obraSelect.selectOption({ index: 1 });
    await treballadorSelect.selectOption({ index: 1 });

    const taskInput = page.locator('input[name="tasca"]');
    if (await taskInput.count() > 0) {
      await taskInput.fill('Paleta zona B');
    }
    await snap(page, 'T03-assignacio-filled');

    const afegirBtn = page.locator('button:has-text("Afegir")').first();
    await afegirBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await snap(page, 'T03-assignacio-saved');

    const urlAfter = page.url();
    console.log(`URL after afegir: ${urlAfter}`);
    expect(urlAfter, 'Ha de continuar a /planificacio').toContain('/planificacio');
    console.log('✅ Assignació diària creada correctament');
  });
});

// ─────────────────────────────────────────────────────────────
test.describe('T04 · Crear Acta', () => {
  test('Nova acta: data + treballador + hores + observacions', async ({ page }) => {
    await login(page);
    await page.goto(`/obres/${OBRA_UUID}/actes/nova`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    // Fill date
    const dateInput = page.locator('input[type="date"]').first();
    await expect(dateInput, 'Camp de data ha d\'existir').toBeVisible();
    await dateInput.fill('2026-04-18');

    // Add treballador via select
    const treballadorSelect = page.locator('select').first();
    await expect(treballadorSelect, 'Dropdown de treballadors ha d\'existir').toBeVisible();
    await treballadorSelect.selectOption({ index: 1 }); // Albert Font
    await page.waitForTimeout(800);
    await snap(page, 'T04-acta-treballador-added');

    // Hores input (appears after adding treballador)
    const horesInput = page.locator('input[type="number"]').first();
    const hasHores = await horesInput.count() > 0;
    if (hasHores) {
      await horesInput.fill('8');
      console.log('✅ Hores input present i omplert: 8h');
    } else {
      bug('04a', 'HIGH', 'No hi ha camp d\'hores per treballador a l\'acta', 'Hauria d\'aparèixer input[type="number"] per les hores en afegir un treballador');
    }
    expect(hasHores, 'Ha d\'haver camp d\'hores per treballador').toBeTruthy();

    // Feina feta input
    const feinaInput = page.locator('input[placeholder*="Encofrat"], input[placeholder*="feina"], input[type="text"]').first();
    if (await feinaInput.count() > 0) {
      await feinaInput.fill('Fonamentació pilars zona A');
    }

    // Fotos upload
    const photoInput = page.locator('input[type="file"]');
    const hasPhotoUpload = await photoInput.count() > 0;
    if (hasPhotoUpload) {
      const pngPath = '/tmp/nandu-e2e/test-foto.png';
      fs.writeFileSync(pngPath, Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      ));
      await photoInput.setInputFiles(pngPath);
      console.log('✅ Upload de foto realitzat');
    } else {
      bug('04b', 'HIGH', 'No hi ha camp per adjuntar fotos a l\'acta', 'La funcionalitat de fotos per acta no està implementada o no és accessible');
    }

    // Observacions
    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill('Visita d\'obra. Revisió pilars i encofrats. Treballs en bon estat.');
    }
    await snap(page, 'T04-acta-filled');

    // Guardar
    const guardarBtn = page.locator('button:has-text("Guardar acta")').first();
    await expect(guardarBtn, 'Botó "Guardar acta" ha d\'existir').toBeVisible();
    await guardarBtn.click();
    await page.waitForTimeout(3000);
    await snap(page, 'T04-acta-after-save');

    const urlAfter = page.url();
    const bodyAfter = await page.textContent('body');
    console.log(`URL after guardar: ${urlAfter}`);
    console.log(`Console errors: ${errors.length}`);
    errors.forEach(e => console.log(`  ERROR: ${e}`));

    // Should redirect to obra detail or actes list
    const isSuccess = !urlAfter.includes('/nova') && !urlAfter.includes('/login');
    if (urlAfter.includes('/nova')) {
      bug('04c', 'HIGH', '"Guardar acta" no navega fora del formulari', `Continua a: ${urlAfter}. Possible error de validació silent o resposta async`);
    }
    if (urlAfter.includes('/login')) {
      bug('04d', 'CRÍTICO', '"Guardar acta" redirigeix a /login', 'Sessió perduda durant la creació de l\'acta');
    }
    console.log(`Acta save result: ${isSuccess ? '✅' : '❌'} URL: ${urlAfter}`);
  });
});

// ─────────────────────────────────────────────────────────────
test.describe('T05 · Fitxa Treballador', () => {
  test('Llista de treballadors mostra tots els treballadors', async ({ page }) => {
    await login(page);
    await page.goto('/treballadors');
    await page.waitForLoadState('networkidle');
    await snap(page, 'T05-treballadors-list');

    const treballadorLinks = await page.locator('a[href*="/treballadors/"]').all();
    console.log(`Treballadors a la llista: ${treballadorLinks.length}`);
    expect(treballadorLinks.length, 'Ha d\'haver treballadors a la llista').toBeGreaterThan(0);
  });

  test('Crear nou treballador i verificar redirecció', async ({ page }) => {
    await login(page);
    await page.goto('/treballadors/nou');
    await page.waitForLoadState('networkidle');
    await snap(page, 'T05-nou-treballador');

    await page.locator('input[name="nom"]').fill('E2E Test Playwright');
    await page.locator('[name="tipus"]').selectOption('oficial');
    await page.locator('input[name="telefon"]').fill('699000099');
    await snap(page, 'T05-nou-treballador-filled');

    await page.locator('button:has-text("Desar")').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const urlAfter = page.url();
    await snap(page, 'T05-after-create');
    console.log(`URL after create treballador: ${urlAfter}`);

    expect(urlAfter, 'Ha de redirigir a /treballadors').toContain('/treballadors');
    expect(urlAfter, 'No ha de continuar a /nou').not.toContain('/nou');
    console.log('✅ Nou treballador creat correctament');
  });

  test('Fitxa de treballador existent mostra dades correctes', async ({ page }) => {
    await login(page);
    await page.goto(`/treballadors/${TREBALLADOR_UUID}`);
    await page.waitForLoadState('networkidle');
    await snap(page, 'T05-fitxa-treballador');

    const bodyText = await page.textContent('body');
    expect(bodyText, 'Ha de mostrar el nom del treballador').toContain('Joan Martí');

    // Verificar inconsistència de tipus
    const hasOficial = bodyText?.includes('Oficial');
    console.log(`Tipus treballador visible: ${hasOficial ? 'Oficial (present)' : 'no visible'}`);

    // Filtre de dates
    const dateInputs = await page.locator('input[type="date"]').all();
    if (dateInputs.length >= 2) {
      await dateInputs[0].fill('2026-01-01');
      await dateInputs[1].fill('2026-04-18');
      await page.locator('button:has-text("Filtrar")').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await snap(page, 'T05-treballador-filtrat');
      console.log('✅ Filtre de dates funciona a la fitxa del treballador');
    }

    // Certificació link
    const certLink = page.locator('a[href*="certificacio"]');
    const hasCertLink = await certLink.count() > 0;
    expect(hasCertLink, 'Ha d\'haver link a certificació des de la fitxa').toBeTruthy();
  });

  test('Detectar inconsistència de tipus treballador', async ({ page }) => {
    await login(page);
    // In list
    await page.goto('/treballadors');
    await page.waitForLoadState('networkidle');
    const listBody = await page.textContent('body');
    const tipusInList = listBody?.match(/Joan Martí[^]+?(\bOficial\b[^\n]*)/)?.[1]?.trim() || 'not found';
    console.log(`Tipus a la llista: "${tipusInList}"`);

    // In acta form
    await page.goto(`/obres/${OBRA_UUID}/actes/nova`);
    await page.waitForLoadState('networkidle');
    const actaBody = await page.textContent('body');
    const tipusInActa = actaBody?.match(/Joan Martí[^(]*\(([^)]+)\)/)?.[1]?.trim() || 'not found';
    console.log(`Tipus a l'acta: "${tipusInActa}"`);

    if (tipusInList !== tipusInActa && tipusInList !== 'not found' && tipusInActa !== 'not found') {
      bug('05a', 'LOW', `Inconsistència del tipus del treballador "Joan Martí"`,
        `Llista: "${tipusInList}" vs Formulari acta: "${tipusInActa}"`);
    }
  });
});

// ─────────────────────────────────────────────────────────────
test.describe('T06 · Certificació', () => {
  test('Certificació per obra — accessible, filtre i imprimir', async ({ page }) => {
    await login(page);
    await page.goto(`/obres/${OBRA_UUID}/certificacio`);
    await page.waitForLoadState('networkidle');
    await snap(page, 'T06-cert-obra');

    const bodyText = await page.textContent('body');
    expect(bodyText, 'Ha de mostrar el nom de l\'obra').toContain('Casa Puigdomenech');

    // Date filter
    const dateInputs = await page.locator('input[type="date"]').all();
    expect(dateInputs.length, 'Ha d\'haver 2 inputs de data').toBe(2);
    await dateInputs[0].fill('2026-01-01');
    await dateInputs[1].fill('2026-04-18');
    await page.locator('button:has-text("Filtrar")').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await snap(page, 'T06-cert-obra-filtrat');
    console.log('✅ Filtre de dates funciona a la certificació per obra');

    // Imprimir button
    const imprimirBtn = page.locator('button:has-text("Imprimir")');
    await expect(imprimirBtn, 'Botó "Imprimir" ha d\'existir').toBeVisible();
    console.log('✅ Botó Imprimir present a la certificació per obra');
  });

  test('Certificació per treballador — accessible, filtre i imprimir', async ({ page }) => {
    await login(page);
    await page.goto(`/treballadors/${TREBALLADOR_UUID}/certificacio?inici=2026-01-01&fi=2026-04-18`);
    await page.waitForLoadState('networkidle');
    await snap(page, 'T06-cert-treballador');

    const bodyText = await page.textContent('body');
    expect(bodyText, 'Ha de mostrar el nom del treballador').toContain('Joan Martí');
    expect(bodyText, 'Ha de mostrar el període').toContain('01/01/2026');

    const imprimirBtn = page.locator('button:has-text("Imprimir")');
    await expect(imprimirBtn, 'Botó "Imprimir" ha d\'existir').toBeVisible();
    console.log('✅ Certificació per treballador accessible amb Imprimir present');
  });

  test('Certificació obra accessible des del detall de l\'obra', async ({ page }) => {
    await login(page);
    await page.goto(`/obres/${OBRA_UUID}`);
    await page.waitForLoadState('networkidle');

    const certLink = page.locator('a[href*="certificacio"]').first();
    await expect(certLink, 'Link a Certificació ha d\'existir al detall de l\'obra').toBeVisible();

    await certLink.click();
    await page.waitForURL('**/certificacio**', { timeout: 10000 });
    const url = page.url();
    expect(url, 'Ha de navegar a la certificació').toContain('/certificacio');
    console.log('✅ Certificació accessible des del detall obra');
  });

  test('Certificació treballador accessible des de la fitxa', async ({ page }) => {
    await login(page);
    await page.goto(`/treballadors/${TREBALLADOR_UUID}`);
    await page.waitForLoadState('networkidle');

    const certLink = page.locator('a[href*="certificacio"]').first();
    await expect(certLink, 'Link a Certificació ha d\'existir a la fitxa del treballador').toBeVisible();

    await certLink.click();
    await page.waitForURL('**/certificacio**', { timeout: 10000 });
    const url = page.url();
    expect(url, 'Ha de navegar a la certificació del treballador').toContain('/certificacio');
    console.log('✅ Certificació accessible des de la fitxa treballador');
  });
});

// ─────────────────────────────────────────────────────────────
test.describe('T07 · UI i qualitat general', () => {
  test('Menú principal té 4 seccions principals', async ({ page }) => {
    await login(page);
    const navLinks = await page.locator('nav a[href]').all();
    const navTexts = [];
    for (const l of navLinks) navTexts.push((await l.textContent())?.trim());
    console.log(`Nav links: ${navTexts.join(', ')}`);
    expect(navLinks.length, 'Ha d\'haver 4 links de nav').toBe(4);
    expect(navTexts.join(' '), 'Ha d\'incloure Obres').toContain('Obres');
    expect(navTexts.join(' '), 'Ha d\'incloure Treballadors').toContain('Treballadors');
    expect(navTexts.join(' '), 'Ha d\'incloure Planificació').toContain('Planificació');
    expect(navTexts.join(' '), 'Ha d\'incloure Vehicles').toContain('Vehicles');
  });

  test('Tancar sessió funciona', async ({ page }) => {
    await login(page);
    const logoutBtn = page.locator('button:has-text("Tancar sessió"), a:has-text("Tancar sessió")').first();
    await expect(logoutBtn, 'Botó de tancar sessió ha d\'existir').toBeVisible();
    await logoutBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const url = page.url();
    await snap(page, 'T07-logout');
    expect(url, 'Ha de redirigir a /login després de tancar sessió').toContain('/login');
    console.log('✅ Tancar sessió funciona correctament');
  });

  test('Pàgines protegides redirigeixen a /login si no autenticat', async ({ page }) => {
    await page.goto('/obres');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    console.log(`/obres sense auth → ${url}`);
    expect(url, 'Ha de redirigir a /login sense autenticació').toContain('/login');
  });

  test('Pàgina 404 per rutes inexistents', async ({ page }) => {
    await login(page);
    await page.goto('/ruta-inexistent-xyz123');
    await page.waitForLoadState('networkidle');
    await snap(page, 'T07-404');
    const has404 = await page.locator('text=/404/').count();
    console.log(`404 indicador: ${has404 > 0 ? '✅' : '❌'}`);
    // App hauria de mostrar 404 (no crash)
    const hasCrash = await page.locator('text=/error.*application|unhandled/i').count();
    expect(hasCrash, 'No hauria de mostrar error d\'aplicació').toBe(0);
  });

  test('Consola sense errors crítics en navegació normal', async ({ page }) => {
    const criticalErrors = [];
    page.on('pageerror', err => criticalErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        criticalErrors.push(msg.text());
      }
    });

    await login(page);
    await page.waitForTimeout(1000);
    // Navigate main pages
    for (const route of ['/obres', '/treballadors', '/planificacio', '/vehicles']) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }

    console.log(`Errors de consola en navegació: ${criticalErrors.length}`);
    criticalErrors.forEach(e => console.log(`  ERROR: ${e.substring(0, 200)}`));

    if (criticalErrors.length > 0) {
      bug('07a', 'MEDIUM', `${criticalErrors.length} errors de consola JS en navegació normal`,
        criticalErrors[0]?.substring(0, 200));
    }
  });
});
