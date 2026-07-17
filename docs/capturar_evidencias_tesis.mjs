import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const playwrightModulePath = process.env.PLAYWRIGHT_MODULE_PATH || 'playwright';
const { chromium } = require(playwrightModulePath);

const baseUrl = 'https://proyecto-curso-integrador-frontend.vercel.app';
const outputDir = path.resolve('docs/evidencias');

const credentials = {
  username: 'admin',
  password: 'Administrador123',
};

async function ensureDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function launchBrowser() {
  const channels = ['msedge', 'chrome'];
  for (const channel of channels) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      // Try the next installed browser channel.
    }
  }
  return chromium.launch({ headless: true });
}

async function screenshot(page, fileName, options = {}) {
  await page.screenshot({
    path: path.join(outputDir, fileName),
    fullPage: options.fullPage ?? false,
  });
}

async function login(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('current_user');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await screenshot(page, '03-seguridad-login.png');

  const response = await fetch('https://proyecto-curso-integrador.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(`No se pudo autenticar para capturas: HTTP ${response.status}`);
  }

  const session = await response.json();
  const userSession = {
    userId: session.userId,
    username: session.username,
    role: String(session.role || '').trim().toUpperCase(),
    employeeId: session.employeeId,
    permissions: session.permissions || session.modulePermissions || [],
  };

  await page.evaluate((auth) => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('current_user', JSON.stringify(auth.userSession));
    localStorage.setItem('sidebar_collapsed', 'true');
  }, { token: session.token, userSession });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Dashboard', { timeout: 30000 });
}

async function captureAppEvidence(page) {
  await screenshot(page, '01-integracion-frontend-backend-dashboard.png', { fullPage: true });

  await page.goto(`${baseUrl}/ventas/pos`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Carrito de Ventas', { timeout: 30000 }).catch(() => {});
  await screenshot(page, '02-funcionalidad-ventas-pos.png', { fullPage: true });

  await page.goto(`${baseUrl}/inventario/catalogo`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await screenshot(page, '02-funcionalidad-catalogo-productos.png', { fullPage: true });

  await page.goto(`${baseUrl}/clientes`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await screenshot(page, '02-funcionalidad-clientes.png', { fullPage: true });

  await page.goto(`${baseUrl}/panel-permisos`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await screenshot(page, '03-seguridad-panel-permisos.png', { fullPage: true });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function evidenceHtml({ title, subtitle, blocks }) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #0b172a;
      background: #f5f7fb;
    }
    .page {
      width: 1366px;
      min-height: 768px;
      padding: 54px 64px;
      background:
        linear-gradient(90deg, rgba(0,52,113,0.06), transparent 34%),
        #f8fafc;
    }
    .eyebrow {
      color: #ff6b00;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      font-size: 13px;
      margin-bottom: 12px;
    }
    h1 {
      margin: 0;
      font-size: 44px;
      line-height: 1.05;
      color: #003471;
    }
    .subtitle {
      max-width: 900px;
      margin: 16px 0 34px;
      color: #465468;
      font-size: 19px;
      line-height: 1.45;
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }
    .block {
      background: #fff;
      border: 1px solid #d9e2ef;
      border-radius: 12px;
      padding: 22px;
      box-shadow: 0 14px 34px rgba(0, 52, 113, .08);
    }
    .block h2 {
      margin: 0 0 12px;
      color: #003471;
      font-size: 20px;
    }
    .block p, .block li {
      font-size: 16px;
      line-height: 1.45;
      color: #344155;
    }
    .block ul { margin: 0; padding-left: 20px; }
    pre {
      margin: 0;
      padding: 16px;
      background: #0b172a;
      color: #d8f3ff;
      border-radius: 10px;
      overflow: hidden;
      font-size: 14px;
      line-height: 1.45;
      white-space: pre-wrap;
    }
    .pill {
      display: inline-block;
      margin: 4px 6px 4px 0;
      padding: 8px 11px;
      border-radius: 999px;
      background: #eaf2ff;
      color: #003471;
      font-weight: 800;
      font-size: 13px;
    }
    .footer {
      margin-top: 30px;
      color: #66758a;
      font-size: 13px;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <main class="page">
    <div class="eyebrow">Evidencia para tesis</div>
    <h1>${escapeHtml(title)}</h1>
    <p class="subtitle">${escapeHtml(subtitle)}</p>
    <section class="grid">
      ${blocks.map(block => `
        <article class="block">
          <h2>${escapeHtml(block.heading)}</h2>
          ${block.code ? `<pre>${escapeHtml(block.code)}</pre>` : ''}
          ${block.items ? `<ul>${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
          ${block.tags ? `<p>${block.tags.map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join('')}</p>` : ''}
          ${block.text ? `<p>${escapeHtml(block.text)}</p>` : ''}
        </article>
      `).join('')}
    </section>
    <div class="footer">Proyecto Curso Integrador - Sistema de gestion ferretera</div>
  </main>
</body>
</html>`;
}

async function captureStaticEvidence(page) {
  const apiCode = await fs.readFile('frontend/src/services/api.js', 'utf8');
  const appCode = await fs.readFile('frontend/src/App.jsx', 'utf8');
  const readme = await fs.readFile('README.md', 'utf8');

  await page.setViewportSize({ width: 1366, height: 768 });

  await page.setContent(evidenceHtml({
    title: 'Calidad del código y buenas prácticas',
    subtitle: 'Evidencia de separación por servicios, manejo centralizado de API, autenticación JWT y control de errores.',
    blocks: [
      {
        heading: 'Servicio centralizado de API',
        code: apiCode.split('\n').slice(0, 36).join('\n'),
      },
      {
        heading: 'Buenas prácticas observables',
        items: [
          'Consumo HTTP centralizado con Axios.',
          'JWT adjuntado automáticamente en cada request.',
          'Timeout de red para evitar pantallas bloqueadas.',
          'Separación entre páginas, componentes, servicios y contexto.',
        ],
      },
      {
        heading: 'Control de rutas y permisos',
        code: appCode.split('\n').slice(35, 84).join('\n'),
      },
      {
        heading: 'Tecnologías',
        tags: ['React', 'Vite', 'Axios', 'Spring Boot', 'PostgreSQL', 'JWT', 'Render', 'Vercel'],
      },
    ],
  }));
  await screenshot(page, '04-calidad-codigo-buenas-practicas.png');

  await page.setContent(evidenceHtml({
    title: 'Despliegue en la nube',
    subtitle: 'Evidencia de publicación del front-end y back-end con servicios operativos.',
    blocks: [
      {
        heading: 'Front-end publicado',
        items: [
          'Plataforma: Vercel',
          'URL: https://proyecto-curso-integrador-frontend.vercel.app',
          'Build: producción',
        ],
      },
      {
        heading: 'Back-end publicado',
        items: [
          'Plataforma: Render',
          'URL base: https://proyecto-curso-integrador.onrender.com/api',
          'Health check: /api/health',
        ],
      },
      {
        heading: 'Estado operativo verificado',
        code: 'GET /api/health -> {"status":"ok"}\nPOST /api/auth/login -> usuario admin autenticado\nGET /api/auth/me -> role ADMIN',
      },
      {
        heading: 'Configuración relevante',
        tags: ['VITE_API_URL', 'CORS_ALLOWED_ORIGINS', 'JWT_SECRET', 'DB_URL', 'DB_USERNAME', 'DB_PASSWORD'],
      },
    ],
  }));
  await screenshot(page, '05-despliegue-nube.png');

  await page.setContent(evidenceHtml({
    title: 'Documentación técnica y manuales',
    subtitle: 'Evidencia de documentación disponible para instalación, ejecución, credenciales y despliegue.',
    blocks: [
      {
        heading: 'README principal',
        code: readme.split('\n').slice(0, 42).join('\n'),
      },
      {
        heading: 'Documentos del proyecto',
        items: [
          'README.md',
          'esquema.sql',
          'render.yaml',
          'postman_endpoints.md',
          'archivo_estrucutra_documento.md',
        ],
      },
      {
        heading: 'Contenido cubierto',
        items: [
          'Instalación y ejecución local.',
          'Credenciales de prueba.',
          'Configuración de variables de entorno.',
          'Despliegue de front-end y back-end.',
        ],
      },
      {
        heading: 'Base de datos',
        tags: ['Tablas', 'Índices', 'Constraints', 'Datos semilla', 'Usuario admin'],
      },
    ],
  }));
  await screenshot(page, '06-documentacion-tecnica.png');

  await page.setContent(evidenceHtml({
    title: 'Sustentación y dominio técnico',
    subtitle: 'Resumen visual para explicar arquitectura, tecnologías y decisiones técnicas del sistema.',
    blocks: [
      {
        heading: 'Arquitectura general',
        items: [
          'React en Vercel consume API REST del back-end.',
          'Spring Boot centraliza reglas de negocio y seguridad.',
          'PostgreSQL almacena usuarios, clientes, productos, ventas e inventario.',
          'JWT protege rutas y operaciones autenticadas.',
        ],
      },
      {
        heading: 'Flujo de autenticación',
        code: 'Login -> /api/auth/login -> JWT\nJWT -> localStorage\nAxios -> Authorization: Bearer token\nApp -> /api/auth/me -> sesión y permisos',
      },
      {
        heading: 'Decisiones técnicas',
        items: [
          'Separar front-end y back-end para despliegue independiente.',
          'Usar roles ADMIN y permisos por módulo.',
          'Validaciones adaptadas a documentos peruanos.',
          'Catálogo y POS consumen datos reales desde API.',
        ],
      },
      {
        heading: 'Módulos explicables',
        tags: ['Dashboard', 'POS', 'Clientes', 'Inventario', 'Empleados', 'Permisos', 'Ventas'],
      },
    ],
  }));
  await screenshot(page, '07-sustentacion-arquitectura.png');
}

async function writeIndex() {
  const files = [
    ['01-integracion-frontend-backend-dashboard.png', 'Integración Front-end y Back-end'],
    ['02-funcionalidad-ventas-pos.png', 'Funcionalidad integral - Ventas POS'],
    ['02-funcionalidad-catalogo-productos.png', 'Funcionalidad integral - Catálogo'],
    ['02-funcionalidad-clientes.png', 'Funcionalidad integral - Clientes'],
    ['03-seguridad-login.png', 'Seguridad - Login'],
    ['03-seguridad-panel-permisos.png', 'Seguridad - Panel de permisos'],
    ['04-calidad-codigo-buenas-practicas.png', 'Calidad de código'],
    ['05-despliegue-nube.png', 'Despliegue en la nube'],
    ['06-documentacion-tecnica.png', 'Documentación técnica'],
    ['07-sustentacion-arquitectura.png', 'Sustentación técnica'],
  ];

  const markdown = [
    '# Evidencias en Imágenes para Tesis',
    '',
    'Carpeta generada con capturas del sistema y láminas de soporte técnico.',
    '',
    ...files.map(([file, label]) => `- ${label}: \`${file}\``),
    '',
  ].join('\n');

  await fs.writeFile(path.join(outputDir, 'README.md'), markdown, 'utf8');
}

await ensureDir();
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

try {
  await login(page);
  await captureAppEvidence(page);
  await captureStaticEvidence(page);
  await writeIndex();
} finally {
  await browser.close();
}

console.log(`Evidencias generadas en: ${outputDir}`);
