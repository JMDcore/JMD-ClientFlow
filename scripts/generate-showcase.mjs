import { mkdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const screenshotsDir = path.join(root, "public", "screenshots")
const outputDir = path.join(root, "public", "showcase")

await mkdir(outputDir, { recursive: true })

const toDataUrl = async (filename) => {
  const data = await readFile(path.join(screenshotsDir, filename))
  return `data:image/png;base64,${data.toString("base64")}`
}

const images = {
  dashboard: await toDataUrl("dashboard.png"),
  clients: await toDataUrl("clients.png"),
  opportunities: await toDataUrl("opportunities.png"),
  pipeline: await toDataUrl("pipeline.png"),
  tasks: await toDataUrl("tasks.png"),
}

const logoMark = `data:image/svg+xml;base64,${(
  await readFile(path.join(root, "public", "brand", "clientflow-mark.svg"))
).toString("base64")}`

const baseStyles = `
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }
  body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #17241f; }
  .canvas { position: relative; width: 100%; height: 100%; overflow: hidden; }
  .brand { display: flex; align-items: center; gap: 13px; font-size: 18px; font-weight: 720; }
  .mark { display: block; width: 38px; height: 38px; filter: drop-shadow(0 8px 12px rgba(16, 47, 37, .2)); }
  .mark img { display: block; width: 100%; height: 100%; }
  .eyebrow { color: #3f6f5d; font-size: 13px; font-weight: 750; text-transform: uppercase; letter-spacing: .08em; }
  h1 { margin: 0; font-size: 66px; line-height: .98; letter-spacing: 0; font-weight: 760; }
  h2 { margin: 0; font-size: 48px; line-height: 1.02; letter-spacing: 0; font-weight: 750; }
  p { margin: 0; }
  .subcopy { color: #5d6f67; font-size: 20px; line-height: 1.5; }
  .browser { overflow: hidden; border: 1px solid rgba(255,255,255,.48); border-radius: 10px; background: #e8eeea; box-shadow: 0 34px 90px rgba(21, 42, 34, .24), 0 4px 14px rgba(21, 42, 34, .12); }
  .browser-bar { display: flex; height: 36px; align-items: center; gap: 7px; padding: 0 14px; background: #e3e9e5; border-bottom: 1px solid #c2cec7; }
  .browser-bar i { display: block; width: 8px; height: 8px; border-radius: 50%; background: #8da198; }
  .browser-bar i:nth-child(2) { background: #b2a06f; }
  .browser-bar i:nth-child(3) { background: #6c9e89; }
  .browser img { display: block; width: 100%; height: auto; }
  .rule { height: 1px; background: rgba(43, 77, 64, .22); }
  .metric { border-left: 2px solid #4c9277; padding-left: 15px; }
  .metric strong { display: block; font-size: 25px; font-weight: 760; }
  .metric span { color: #65766e; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
  .wave { position: absolute; border: 1px solid rgba(69, 111, 94, .2); border-radius: 50%; pointer-events: none; }
`

const browserFrame = (src, className = "") => `
  <div class="browser ${className}">
    <div class="browser-bar"><i></i><i></i><i></i></div>
    <img src="${src}" alt="" />
  </div>
`

const featureCreative = ({
  filename,
  index,
  eyebrow,
  title,
  description,
  image,
  bullets,
  markers,
  dark = false,
}) => ({
  filename,
  width: 1600,
  height: 900,
  html: `
    <main class="canvas feature ${dark ? "feature-dark" : "feature-light"}">
      <header><div class="brand"><span class="mark"><img src="${logoMark}" alt="" /></span> ClientFlow</div><span>FEATURE · ${index}</span></header>
      <section class="feature-copy">
        <p class="eyebrow">${eyebrow}</p>
        <h2>${title}</h2>
        <p class="subcopy">${description}</p>
        <ol>
          ${bullets.map((item, bulletIndex) => `<li><b>0${bulletIndex + 1}</b><span><strong>${item.title}</strong><small>${item.copy}</small></span></li>`).join("")}
        </ol>
      </section>
      ${browserFrame(image, "feature-screen")}
      ${markers.map((marker, markerIndex) => `<span class="annotation" style="left:${marker.x}px;top:${marker.y}px">0${markerIndex + 1}</span>`).join("")}
    </main>
    <style>
      ${baseStyles}
      .feature { padding: 48px 56px; }
      .feature-light { background: #c7d2cc; }
      .feature-dark { background: #263a32; color: #eef3ef; }
      .feature::after { content: ""; position: absolute; left: 560px; top: 0; bottom: 0; width: 1px; background: rgba(70, 102, 89, .2); }
      .feature-dark::after { background: rgba(255,255,255,.09); }
      .feature header { position: relative; z-index: 5; display: flex; align-items: center; justify-content: space-between; }
      .feature header > span { color: ${dark ? "#91a69b" : "#63766c"}; font-size: 11px; font-weight: 720; letter-spacing: .1em; }
      .feature-copy { position: relative; z-index: 5; width: 445px; margin-top: 88px; }
      .feature-dark .eyebrow { color: #72b296; }
      .feature h2 { margin-top: 15px; font-size: 52px; }
      .feature .subcopy { margin-top: 24px; color: ${dark ? "#a9bab1" : "#5d7066"}; font-size: 17px; }
      .feature ol { display: flex; flex-direction: column; gap: 21px; margin: 42px 0 0; padding: 0; list-style: none; }
      .feature li { display: flex; align-items: flex-start; gap: 15px; }
      .feature li > b { display: grid; width: 31px; height: 31px; flex: 0 0 auto; place-items: center; border: 1px solid ${dark ? "#587c6c" : "#79958a"}; border-radius: 50%; color: ${dark ? "#86c4a8" : "#2f7258"}; font-size: 10px; }
      .feature li span { display: flex; flex-direction: column; gap: 3px; }
      .feature li strong { font-size: 15px; }
      .feature li small { max-width: 350px; color: ${dark ? "#93a79d" : "#60736a"}; font-size: 12px; line-height: 1.45; }
      .feature-screen { position: absolute; z-index: 2; width: 1060px; left: 610px; top: 138px; transform: rotate(-1deg); }
      .feature-dark .feature-screen { box-shadow: 0 34px 90px rgba(4, 17, 12, .38), 0 4px 14px rgba(4, 17, 12, .18); }
      .feature-screen img { height: 598px; object-fit: cover; object-position: top left; }
      .annotation { position: absolute; z-index: 6; display: grid; width: 42px; height: 42px; place-items: center; border: 4px solid ${dark ? "#263a32" : "#c7d2cc"}; border-radius: 50%; background: #2d8a68; color: white; box-shadow: 0 8px 20px rgba(21, 51, 40, .25); font-size: 11px; font-weight: 800; }
    </style>
  `,
})

const creatives = [
  {
    filename: "github-hero.png",
    width: 1600,
    height: 900,
    html: `
      <main class="canvas hero">
        <div class="wave wave-a"></div><div class="wave wave-b"></div>
        <header class="brand"><span class="mark"><img src="${logoMark}" alt="" /></span> ClientFlow</header>
        <section class="copy">
          <p class="eyebrow">CRM ligero para profesionales</p>
          <h1>Tu actividad comercial,<br />siempre en movimiento.</h1>
          <p class="subcopy">Clientes, oportunidades y próximas acciones<br />en un espacio de trabajo claro y visual.</p>
          <div class="metrics">
            <div class="metric"><strong>28 mil €</strong><span>Pipeline activo</span></div>
            <div class="metric"><strong>67%</strong><span>Tasa de éxito</span></div>
            <div class="metric"><strong>8</strong><span>Oportunidades</span></div>
          </div>
        </section>
        ${browserFrame(images.dashboard, "hero-screen")}
        <footer>Diseñado y desarrollado por José Miguel Díaz</footer>
      </main>
      <style>
        ${baseStyles}
        .hero { background: #c8d3cd; padding: 54px 62px; }
        .hero::after { content: ""; position: absolute; inset: 0 0 0 43%; background: #263a32; z-index: 0; }
        .hero .brand, .hero .copy, .hero footer { position: relative; z-index: 2; }
        .hero .copy { width: 650px; margin-top: 105px; }
        .hero h1 { margin-top: 20px; font-size: 62px; }
        .hero .subcopy { margin-top: 27px; }
        .metrics { display: flex; gap: 43px; margin-top: 48px; }
        .hero-screen { position: absolute; z-index: 3; width: 930px; right: -74px; top: 132px; transform: rotate(-1.8deg); }
        .hero-screen img { min-height: 524px; object-fit: cover; object-position: top left; }
        .hero footer { position: absolute; left: 62px; bottom: 42px; color: #5b6c64; font-size: 13px; }
        .hero .wave-a { width: 850px; height: 370px; left: -260px; bottom: -170px; }
        .hero .wave-b { width: 720px; height: 320px; left: -130px; bottom: -150px; }
      </style>
    `,
  },
  {
    filename: "github-social-preview.png",
    width: 1280,
    height: 640,
    html: `
      <main class="canvas social-preview">
        <div class="social-copy">
          <header class="brand"><span class="mark"><img src="${logoMark}" alt="" /></span> ClientFlow</header>
          <p class="eyebrow">CRM ligero para profesionales</p>
          <h1>Negocio claro.<br />Próximo paso visible.</h1>
          <p class="subcopy">Clientes, oportunidades y seguimiento<br />en un espacio de trabajo visual.</p>
          <footer>JMD · José Miguel Díaz</footer>
        </div>
        ${browserFrame(images.dashboard, "social-screen")}
      </main>
      <style>
        ${baseStyles}
        .social-preview { background: #263a32; }
        .social-copy { position: relative; z-index: 2; width: 530px; height: 100%; padding: 46px 50px; background: #c8d3cd; }
        .social-copy .eyebrow { margin-top: 70px; }
        .social-copy h1 { margin-top: 15px; font-size: 48px; line-height: 1.02; }
        .social-copy .subcopy { margin-top: 21px; font-size: 16px; }
        .social-copy footer { position: absolute; left: 50px; bottom: 36px; color: #596c63; font-size: 12px; }
        .social-screen { position: absolute; z-index: 3; width: 825px; right: -80px; top: 82px; transform: rotate(-1.5deg); }
        .social-screen img { height: 464px; object-fit: cover; object-position: top left; }
      </style>
    `,
  },
  {
    filename: "linkedin-pipeline.png",
    width: 1200,
    height: 1200,
    html: `
      <main class="canvas pipeline-ad">
        <div class="wave wave-a"></div><div class="wave wave-b"></div>
        <header><div class="brand"><span class="mark"><img src="${logoMark}" alt="" /></span> ClientFlow</div><span>PRODUCT SHOWCASE · 01</span></header>
        <section class="headline">
          <div><p class="eyebrow">Pipeline visual</p><h2>Cada oportunidad,<br />en el momento correcto.</h2></div>
          <div class="metric"><strong>28.000 €</strong><span>Valor en curso</span></div>
        </section>
        ${browserFrame(images.pipeline, "pipeline-screen")}
        <aside><strong>Arrastra. Prioriza. Avanza.</strong><span>Un flujo comercial pensado para trabajar, no para configurar.</span></aside>
      </main>
      <style>
        ${baseStyles}
        .pipeline-ad { background: #c5d0ca; padding: 48px 54px; }
        .pipeline-ad header { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; }
        .pipeline-ad header > span { color: #64766d; font-size: 11px; font-weight: 700; letter-spacing: .09em; }
        .headline { position: relative; z-index: 2; display: flex; align-items: end; justify-content: space-between; margin-top: 70px; }
        .headline h2 { margin-top: 14px; }
        .headline .metric { width: 190px; margin-bottom: 8px; }
        .pipeline-screen { position: absolute; z-index: 3; left: 54px; right: 54px; top: 390px; height: 650px; }
        .pipeline-screen img { height: 614px; object-fit: cover; object-position: top left; }
        .pipeline-ad aside { position: absolute; z-index: 4; left: 88px; right: 88px; bottom: 45px; display: flex; justify-content: space-between; color: #e7eee9; }
        .pipeline-ad aside strong { font-size: 17px; }
        .pipeline-ad aside span { color: #aebeb6; font-size: 14px; }
        .pipeline-ad::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 155px; background: #263a32; }
        .pipeline-ad .wave-a { width: 720px; height: 260px; right: -240px; top: 70px; }
        .pipeline-ad .wave-b { width: 620px; height: 220px; right: -130px; top: 100px; }
      </style>
    `,
  },
  {
    filename: "linkedin-relations.png",
    width: 1200,
    height: 1200,
    html: `
      <main class="canvas relations-ad">
        <header><div class="brand"><span class="mark"><img src="${logoMark}" alt="" /></span> ClientFlow</div><span>PRODUCT SHOWCASE · 02</span></header>
        <section class="copy"><p class="eyebrow">Relaciones comerciales</p><h2>Contexto para avanzar.<br />Claridad para decidir.</h2></section>
        ${browserFrame(images.clients, "clients-screen")}
        ${browserFrame(images.tasks, "tasks-screen")}
        <div class="note"><strong>9 relaciones activas</strong><span>Clientes, seguimiento y próximas acciones en una única vista.</span></div>
      </main>
      <style>
        ${baseStyles}
        .relations-ad { background: #263a32; color: #eef3ef; padding: 48px 54px; }
        .relations-ad header { display: flex; align-items: center; justify-content: space-between; }
        .relations-ad header > span { color: #92a49b; font-size: 11px; font-weight: 700; letter-spacing: .09em; }
        .relations-ad .copy { margin-top: 65px; }
        .relations-ad .eyebrow { color: #75b498; }
        .relations-ad h2 { margin-top: 14px; }
        .clients-screen { position: absolute; width: 900px; left: 54px; top: 330px; transform: rotate(-1.4deg); }
        .tasks-screen { position: absolute; width: 760px; right: -120px; top: 660px; transform: rotate(2.4deg); }
        .clients-screen img, .tasks-screen img { height: 500px; object-fit: cover; object-position: top left; }
        .note { position: absolute; z-index: 5; left: 54px; bottom: 58px; display: flex; flex-direction: column; gap: 7px; border-left: 2px solid #67ad90; padding-left: 17px; }
        .note strong { font-size: 21px; }
        .note span { color: #9eb0a7; font-size: 14px; }
      </style>
    `,
  },
  {
    filename: "github-product-tour.png",
    width: 1600,
    height: 900,
    html: `
      <main class="canvas tour">
        <header><div class="brand"><span class="mark"><img src="${logoMark}" alt="" /></span> ClientFlow</div><div><p class="eyebrow">Producto</p><h2>Un espacio. Todo tu flujo comercial.</h2></div></header>
        <section class="frames">
          ${browserFrame(images.clients, "tour-clients")}
          ${browserFrame(images.opportunities, "tour-opportunities")}
          ${browserFrame(images.tasks, "tour-tasks")}
        </section>
        <footer><span>01 · Clientes</span><span>02 · Oportunidades</span><span>03 · Seguimiento</span></footer>
      </main>
      <style>
        ${baseStyles}
        .tour { background: #c5d0ca; padding: 46px 58px; }
        .tour header { display: flex; align-items: flex-start; justify-content: space-between; }
        .tour header > div:last-child { width: 720px; }
        .tour h2 { margin-top: 9px; }
        .frames { position: absolute; left: 58px; right: 58px; top: 205px; bottom: 95px; }
        .frames .browser { position: absolute; width: 790px; }
        .frames img { height: 480px; object-fit: cover; object-position: top left; }
        .tour-clients { left: 0; top: 70px; transform: rotate(-2deg); z-index: 2; }
        .tour-opportunities { left: 350px; top: 5px; z-index: 3; }
        .tour-tasks { right: -35px; top: 85px; transform: rotate(2deg); z-index: 4; }
        .tour footer { position: absolute; left: 58px; right: 58px; bottom: 42px; display: flex; justify-content: space-between; border-top: 1px solid rgba(43,77,64,.25); padding-top: 17px; color: #52665d; font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
      </style>
    `,
  },
]

creatives.push(
  featureCreative({
    filename: "feature-dashboard.png",
    index: "01",
    eyebrow: "Dashboard accionable",
    title: "Decide qué necesita atención hoy.",
    description:
      "Una vista diaria que combina previsión, rendimiento y próximas acciones sin ruido innecesario.",
    image: images.dashboard,
    bullets: [
      {
        title: "Previsión ponderada",
        copy: "Valor realista según la probabilidad de cada etapa.",
      },
      {
        title: "Alertas operativas",
        copy: "Tareas vencidas y seguimientos visibles al entrar.",
      },
      {
        title: "Ingresos y rendimiento",
        copy: "Evolución comercial y tasa de éxito en contexto.",
      },
    ],
    markers: [
      { x: 855, y: 336 },
      { x: 1125, y: 507 },
      { x: 895, y: 675 },
    ],
  }),
  featureCreative({
    filename: "feature-clients.png",
    index: "02",
    eyebrow: "Cartera de clientes",
    title: "Todo el contexto de cada relación.",
    description:
      "Contactos, estado comercial y valor potencial organizados para consultar y actuar con rapidez.",
    image: images.clients,
    dark: true,
    bullets: [
      {
        title: "Información centralizada",
        copy: "Contacto, empresa y sector en una única fila.",
      },
      {
        title: "Valor de pipeline",
        copy: "Visibilidad inmediata del potencial por cliente.",
      },
      {
        title: "Exportación CSV",
        copy: "La cartera puede salir de la aplicación cuando lo necesites.",
      },
    ],
    markers: [
      { x: 830, y: 425 },
      { x: 1370, y: 430 },
      { x: 1430, y: 252 },
    ],
  }),
  featureCreative({
    filename: "feature-opportunities.png",
    index: "03",
    eyebrow: "Oportunidades",
    title: "De una conversación a un proyecto ganado.",
    description:
      "Cada posible trabajo conserva su valor, prioridad, etapa y próxima fecha de seguimiento.",
    image: images.opportunities,
    bullets: [
      {
        title: "Etapa y prioridad",
        copy: "Señales visuales para ordenar dónde invertir tiempo.",
      },
      {
        title: "Valor y cierre",
        copy: "Importe y fecha estimada siempre visibles.",
      },
      {
        title: "Seguimiento",
        copy: "La próxima acción evita que una propuesta se enfríe.",
      },
    ],
    markers: [
      { x: 1075, y: 440 },
      { x: 1310, y: 438 },
      { x: 1510, y: 438 },
    ],
  }),
  featureCreative({
    filename: "feature-pipeline.png",
    index: "04",
    eyebrow: "Pipeline Kanban",
    title: "Un flujo comercial que se mueve contigo.",
    description:
      "Las oportunidades avanzan entre etapas con una interacción directa, visual y predecible.",
    image: images.pipeline,
    dark: true,
    bullets: [
      {
        title: "Drag and drop",
        copy: "Mueve oportunidades manteniendo su orden dentro de cada etapa.",
      },
      {
        title: "Probabilidad por fase",
        copy: "Cada columna aporta contexto al valor ponderado.",
      },
      {
        title: "Filtros instantáneos",
        copy: "Busca y prioriza sin abandonar el tablero.",
      },
    ],
    markers: [
      { x: 930, y: 550 },
      { x: 1130, y: 396 },
      { x: 1450, y: 292 },
    ],
  }),
  featureCreative({
    filename: "feature-tasks.png",
    index: "05",
    eyebrow: "Seguimiento",
    title: "Cada próxima acción, bajo control.",
    description:
      "Una agenda comercial conectada con clientes y oportunidades, no una lista de tareas aislada.",
    image: images.tasks,
    bullets: [
      {
        title: "Vencidas, hoy y próximas",
        copy: "El resumen temporal permite decidir por dónde empezar.",
      },
      {
        title: "Contexto relacionado",
        copy: "Cada tarea conserva su cliente y oportunidad.",
      },
      {
        title: "Prioridades claras",
        copy: "Las señales de urgencia ayudan a ordenar el trabajo.",
      },
    ],
    markers: [
      { x: 990, y: 350 },
      { x: 1040, y: 575 },
      { x: 1450, y: 575 },
    ],
  }),
)

const browser = await chromium.launch({ headless: true })

for (const creative of creatives) {
  const page = await browser.newPage({
    viewport: { width: creative.width, height: creative.height },
    deviceScaleFactor: 1,
  })
  await page.setContent(creative.html, { waitUntil: "load" })
  await page.screenshot({
    path: path.join(outputDir, creative.filename),
    type: "png",
  })
  await page.close()
}

await browser.close()
console.log(`Generated ${creatives.length} showcase assets in ${outputDir}`)
