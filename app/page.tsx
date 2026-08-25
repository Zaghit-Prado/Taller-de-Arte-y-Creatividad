"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Papa from "papaparse";
// ─── TYPES ────────────────────────────────────────────────────
interface CartItem {
  name: string;
  price: number;
}

interface Product {
  id: number;
  name: string;
  cat: string;
  catLabel: string;
  price: number;
  desc: string;
  badge?: string;
  img: string;
}

interface GalItem {
  cat: string;
  catLabel?: string; // Agregamos esto como opcional
  alt: string;
  label: string;
  img: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────
const IMG = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop";

const PRODUCTS: Product[] = [
  { id:1, name:"Atardecer Limeño",    cat:"pinturas",      catLabel:"Pinturas",        price:450, desc:"Óleo sobre lienzo · 60×80 cm",             badge:"Original", img:IMG },
  { id:2, name:"Serie Lima Nocturna", cat:"prints",        catLabel:"Prints Digitales", price:120, desc:"Impresión fine art · A3",                              img:IMG },
  { id:3, name:"Formas Andinas",      cat:"esculturas",    catLabel:"Esculturas",       price:280, desc:"Cerámica esmaltada · 30 cm",                          img:IMG },
  { id:4, name:"Máscaras Peruanas",   cat:"manualidades",  catLabel:"Manualidades",     price:85,  desc:"Artesanía decorativa tradicional",                    img:IMG },
  { id:5, name:"Flores Silvestres",   cat:"pinturas",      catLabel:"Pinturas",         price:190, desc:"Acuarela sobre papel · 40×50 cm",                     img:IMG },
  { id:6, name:"Abstracto Marino",    cat:"prints",        catLabel:"Prints Digitales", price:150, desc:"Impresión en canvas · 50×70 cm",                      img:IMG },
  { id:7, name:"Minimalista",         cat:"esculturas",    catLabel:"Esculturas",       price:320, desc:"Metal y madera · 25 cm",                              img:IMG },
  { id:8, name:"Textiles Andinos",    cat:"manualidades",  catLabel:"Manualidades",     price:95,  desc:"Tejidos decorativos artesanales",                     img:IMG },
];

const PORT_ITEMS: GalItem[] = [
  { cat:"murales",   alt:"Mural Miraflores",  label:'Mural "Cultura Viva" – Mun. Miraflores',  img:IMG },
  { cat:"logotipos", alt:"Logo corporativo",  label:'Identidad Visual – Restaurante "Sabor Peruano"', img:IMG },
  { cat:"alfombras", alt:"Alfombra",          label:"Alfombra Institucional – Semana Santa 2024", img:IMG },
  { cat:"murales",   alt:"Mural TechPerú",    label:'Mural "Innovación" – TechPerú',             img:IMG },
  { cat:"logotipos", alt:"Branding EcoVida",  label:'Branding Completo – Startup "EcoVida"',     img:IMG },
  { cat:"alfombras", alt:"Alfombra Barranco", label:"Alfombra Navideña – Mun. Barranco",         img:IMG },
];

const EDU_GAL: GalItem[] = [
  { cat:"", alt:"Taller infantil",  label:"Arte infantil y juvenil",  img:IMG },
  { cat:"", alt:"Pintura creativa", label:"Pintura creativa",          img:IMG },
  { cat:"", alt:"Proyecto escolar", label:"Proyectos escolares",        img:IMG },
];
const VIDEOS_DATA = [
  { type: "featured", badge: "NUEVO", badgeColor: "var(--red)", dur: "48 min", img: IMG, title: "Técnicas de acuarela para principiantes — Clase completa" },
  { type: "small", badge: "TIPS", badgeColor: "var(--gold)", dur: "12 min", img: IMG, title: "Cómo mezclar colores perfectamente" },
  { type: "small", badge: "SERIE", badgeColor: "var(--green)", dur: "31 min", img: IMG, title: "Dibujo anatómico — Episodio 3: El rostro" },
  { type: "small", badge: "• EN VIVO", badgeColor: "#E50000", dur: "Sábado 10am", img: IMG, title: "Taller en vivo: Óleo sobre lienzo" }
];

const PODCAST_DATA = [
  { ep: "EPISODIO 12", title: "¿Cómo vivir del arte en Latinoamérica?", desc: "Entrevista con artistas peruanos que lograron monetizar su pasión sin sacrificar su visión.", dur: "38 min", img: IMG },
  { ep: "EPISODIO 11", title: "El proceso creativo detrás de un mural urbano", desc: "Desde el boceto hasta la pared — hablamos con el muralista detrás del proyecto \"Cultura Viva\".", dur: "52 min", img: IMG },
  { ep: "EPISODIO 10", title: "Arte corporativo: cuando el diseño habla por la marca", desc: "Casos reales de empresas que transformaron su identidad con proyectos artísticos.", dur: "44 min", img: IMG },
  { ep: "EPISODIO 9", title: "Preparación para Bellas Artes: lo que nadie te dice", desc: "Ex-alumnos comparten sus experiencias, miedos y estrategias para el examen de admisión.", dur: "29 min", img: IMG }
];
// ─── TOAST ────────────────────────────────────────────────────
type ToastItem = { id: number; msg: string; type: "ok" | "info" };

// ─── COMPONENT ────────────────────────────────────────────────
export default function Home() {
  /* state */
  const [cart, setCart]         = useState<CartItem[]>([]);
  const [badgeOn, setBadgeOn]   = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shrunk, setShrunk]     = useState(false);
  const [toasts, setToasts]     = useState<ToastItem[]>([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [lbSrc, setLbSrc]           = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState("todos");
  const [storeFilter, setStoreFilter] = useState("todos");
  const [mediaTab, setMediaTab]     = useState("videos");
  const [activePod, setActivePod]   = useState<number | null>(null);
  const [podPct, setPodPct]         = useState<Record<number, number>>({});
  const podTimers = useRef<Record<number, ReturnType<typeof setInterval>>>({});
  const toastId   = useRef(0);
 
// Estados para Tienda
  const [productosDin, setProductosDin] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(true);

  // NUEVO: Estados para Portafolio
  const [portafolioDin, setPortafolioDin] = useState<GalItem[]>([]);
  const [cargandoPort, setCargandoPort] = useState(true);

  // LECTURA DE GOOGLE SHEETS
  useEffect(() => {
    const cacheBuster = new Date().getTime();
    
    // 1. Cargar Tienda (Hoja 1)
    const SHEET_TIENDA_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vR1RUixX9Bkwjg1JjGKAZ7t2R3HZ9ak3_aH87YypUeiSNQaerpPTAA29WtUnkmkT-SQdQL7VJ5DAJRr/pub?gid=0&single=true&output=csv&t=${cacheBuster}`;
    Papa.parse(SHEET_TIENDA_URL, {
      download: true, header: true, dynamicTyping: true, 
      complete: (results) => {
        setProductosDin(results.data as Product[]);
        setCargando(false);
      }
    });

    // 2. Cargar Portafolio (Hoja 2) - Reemplaza TU_NUEVO_GID por el número que te dio el link
    const SHEET_PORTAFOLIO_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vR1RUixX9Bkwjg1JjGKAZ7t2R3HZ9ak3_aH87YypUeiSNQaerpPTAA29WtUnkmkT-SQdQL7VJ5DAJRr/pub?gid=303872850&single=true&output=csv&t=${cacheBuster}`;
    Papa.parse(SHEET_PORTAFOLIO_URL, {
      download: true, header: true, dynamicTyping: true, 
      complete: (results) => {
        setPortafolioDin(results.data as GalItem[]);
        setCargandoPort(false);
      }
    });
  }, []);
  /* scroll */
  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* toast helper */
  const toast = useCallback((msg: string, type: "ok" | "info" = "info") => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3600);
  }, []);

  /* cart */
  const addCart = (name: string, price: number) => {
    setCart(c => [...c, { name, price }]);
    setBadgeOn(true);
    toast(`"${name}" agregado. Abriendo WhatsApp...`, "ok");
    setTimeout(() => {
      const msg = `Hola, estoy interesado en comprar "${name}" por S/ ${price}. ¿Me pueden dar más información?`;
      window.open(`https://wa.me/51999999999?text=${encodeURIComponent(msg)}`, "_blank");
    }, 700);
  };

  const openCart = () => {
    if (!cart.length) { toast("Tu carrito está vacío", "info"); return; }
    const lines = cart.map(i => `${i.name} – S/ ${i.price}`).join("%0A");
    const total = cart.reduce((s, i) => s + i.price, 0);
    window.open(`https://wa.me/51999999999?text=Hola, me interesan estos productos:%0A${lines}%0ATotal: S/ ${total}`, "_blank");
  };

  /* modal */
  const openM  = (title: string) => { setModalTitle(title); setModalOpen(true); };
  const closeM = () => setModalOpen(false);

  /* lightbox */
  const openLB  = (src: string) => setLbSrc(src);
  const closeLB = () => setLbSrc(null);

  /* podcast */
  const togglePod = (idx: number) => {
    if (activePod === idx) {
      clearInterval(podTimers.current[idx]);
      setActivePod(null);
      return;
    }
    if (activePod !== null) {
      clearInterval(podTimers.current[activePod]);
      setPodPct(p => ({ ...p, [activePod]: 0 }));
    }
    setActivePod(idx);
    let pct = 0;
    podTimers.current[idx] = setInterval(() => {
      pct = Math.min(pct + 0.08, 100);
      setPodPct(p => ({ ...p, [idx]: pct }));
      if (pct >= 100) {
        clearInterval(podTimers.current[idx]);
        setActivePod(null);
      }
    }, 300);
  };

  /* filter helper */
  const visible = (cat: string, filter: string) => filter === "todos" || cat === filter;

  /* keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeM(); closeLB(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* smooth scroll */
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <header id="hdr" className={shrunk ? "shrunk" : ""}>
        <div className="wrap">
          <a href="#inicio" className="logo" onClick={e => { e.preventDefault(); scrollTo("inicio"); }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#D4006A,#0099C8)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"1.4rem", flexShrink:0 }}>
              <i className="fa fa-paint-brush" />
            </div>
            <span className="logo-text">Taller Estudio<span>Arte &amp; Creatividad</span></span>
          </a>

          <nav>
            <ul className="nav-list">
              {[
                ["educacion",       "Educación"],
                ["corporativo",     "Corporativo"],
                ["preuniversitario","Bellas Artes"],
                ["tienda",         "Tienda"],
                ["media",          "Videos & Podcast"],
              ].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hdr-right">
            <button className="cart-btn" onClick={openCart} title="Ver carrito">
              <i className="fa fa-shopping-bag" />
              <span className={`cart-badge ${badgeOn ? "on" : ""}`}>{cart.length}</span>
            </button>
            <button className={`hbg ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menú">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className={`mob-nav ${menuOpen ? "open" : ""}`}>
        <ul>
          {[
            ["educacion",       "fa-pencil",         "Educación y Talleres"],
            ["corporativo",     "fa-building",        "Proyectos Corporativos"],
            ["preuniversitario","fa-graduation-cap",  "Preparación Bellas Artes"],
            ["tienda",          "fa-shopping-bag",    "Tienda Galería"],
            ["media",           "fa-play-circle",     "Videos & Podcast"],
          ].map(([id, icon, label]) => (
            <li key={id}>
              <a href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>
                <i className={`fa ${icon} fa-fw`} /> {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* ===== HERO ===== */}
      <section id="inicio">
        <div id="hero">
          <div className="hero-inner">
            <p className="hero-kicker">
              <i className="fa fa-paint-brush" /> Lima, Perú &mdash; Desde 2015
            </p>
            <h1 className="hero-h1">
              Creatividad que<br /><em>transforma</em> vidas
            </h1>
            <p className="hero-sub">
              Educación artística integral, proyectos corporativos y preparación profesional para artistas del futuro.
            </p>
            <a href="#servicios" className="hero-cta" onClick={e => { e.preventDefault(); scrollTo("servicios"); }}>
              <i className="fa fa-th-large" /> Catálogo de servicios
            </a>
          </div>
        </div>
      </section>

      {/* ===== SERVICIOS ===== */}
      <section id="servicios">
        <div className="quad-intro">
          <span className="eyebrow">Nuestros servicios</span>
          <h2>Todo lo que necesitas en un solo lugar</h2>
          <p>Soluciones artísticas especializadas para cada etapa de tu vida creativa</p>
        </div>
        <div className="quad-grid">
          {[
            { id:"educacion",       c:"red",   icon:"fa-pencil",        eyebrow:"Para niños y jóvenes",      title:"Educación y Talleres",    desc:"Clases particulares, talleres de verano y asesoría escolar especializada.",      btn:"Talleres y Asesoría" },
            { id:"corporativo",     c:"blue",  icon:"fa-building",       eyebrow:"Para empresas e instituciones", title:"Proyectos Corporativos", desc:"Murales urbanos, logotipos y proyectos institucionales de alto impacto.",     btn:"Ver Portafolio B2B" },
            { id:"preuniversitario",c:"green", icon:"fa-graduation-cap", eyebrow:"Preparación universitaria", title:"Preparación Bellas Artes", desc:"Programa intensivo para ingresar a la Escuela Nacional de Bellas Artes.",    btn:"Programa Pre-U" },
            { id:"tienda",          c:"gold",  icon:"fa-shopping-bag",   eyebrow:"Galería y tienda",          title:"Tienda Galería",           desc:"Obras originales, prints digitales y artesanías para decorar tu espacio.",   btn:"Ver Galería" },
          ].map(s => (
            <div key={s.id} className="svc-card" data-c={s.c} onClick={() => scrollTo(s.id)}>
              <div className="svc-thumb">
                <Image src={IMG} alt={s.title} fill style={{ objectFit:"cover", borderRadius:0 }} />
                <div className="svc-ico"><i className={`fa ${s.icon}`} /></div>
              </div>
              <div className="svc-body">
                <span className="eyebrow">{s.eyebrow}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <a href={`#${s.id}`} className="btn-svc" onClick={e => { e.preventDefault(); scrollTo(s.id); }}>
                  <i className="fa fa-arrow-right" /> {s.btn}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== EDUCACIÓN ===== */}
      <section id="educacion" style={{ background:"var(--white)" }}>
        <div className="section-pad">
          <div className="sec-banner">
            <h2>Despierta el talento, asegura las mejores calificaciones</h2>
            <p>Programas especializados para desarrollar la creatividad y el éxito académico de tus hijos.</p>
          </div>

          <div className="sec-h">
            <span className="eyebrow">Talleres</span>
            <h3>Talleres de Verano y Clases Particulares</h3>
            <p>Desde S/ 200 por mes &middot; Lunes a Sábado</p>
          </div>

          <div className="gal-grid">
            {EDU_GAL.map((g, i) => (
              <div key={i} className="gal-item" onClick={() => openLB(g.img)}>
                <Image src={g.img} alt={g.alt} fill style={{ objectFit:"cover", borderRadius:0 }} />
                <div className="gal-ov">
                  <i className="fa fa-search-plus" />
                  <span>{g.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cta-row">
            <a href="https://wa.me/51999999999?text=Hola, deseo información sobre los talleres de arte para mi hijo" className="btn btn-wa" target="_blank" rel="noreferrer">
              <i className="fa fa-whatsapp" /> Inscribirse por WhatsApp
            </a>
            <button className="btn btn-outline blue" onClick={() => toast("Lunes–Viernes 3pm–7pm · Sábados 9am–1pm", "info")}>
              <i className="fa fa-clock-o" /> Ver Horarios
            </button>
          </div>

          <div className="sec-h" style={{ marginTop:"3rem" }}>
            <span className="eyebrow">Asesoría escolar</span>
            <h3>Proyectos Escolares Especializados</h3>
          </div>

          <div className="feat-grid">
            {[
              { bg:"#FDE8F3", color:"var(--red)",   icon:"fa-cubes",         title:"Maquetas",            desc:"Proyectos de arte, arquitectura y geometría" },
              { bg:"#E5F5FA", color:"var(--blue)",  icon:"fa-flask",         title:"Proyectos de Ciencia", desc:"Feria Eureka y experimentos escolares" },
              { bg:"#EFF7F3", color:"var(--green)", icon:"fa-film",          title:"Escenografías",        desc:"Para obras teatrales y presentaciones" },
              { bg:"#FEF6E4", color:"var(--gold)",  icon:"fa-eye",           title:"Exposiciones",         desc:"Capacitación para presentar proyectos" },
            ].map((f, i) => (
              <div key={i} className="feat-item">
                <div className="feat-ico" style={{ background:f.bg, color:f.color }}>
                  <i className={`fa ${f.icon}`} />
                </div>
                <div><h4>{f.title}</h4><p>{f.desc}</p></div>
              </div>
            ))}
          </div>

          <div className="cta-row">
            <button className="btn btn-red" onClick={() => openM("Cotizar mi Proyecto Escolar")}>
              <i className="fa fa-file-text" /> Cotizar Proyecto Escolar
            </button>
          </div>

          {/* Testimonios */}
          <div className="sec-h" style={{ marginTop:"3rem" }}>
            <span className="eyebrow">Testimonios</span>
            <h3>Lo que dicen los padres</h3>
          </div>
          <div className="succ-grid">
            {[
              { name:"María G. — Surco",     q:"Mi hija mejoró notablemente en arte y ahora disfruta mucho más sus clases. Excelente profe con mucha paciencia y creatividad." },
              { name:"Carlos R. — Miraflores", q:"El taller de verano fue una experiencia increíble. Mi hijo aprendió técnicas nuevas y se divirtió muchísimo." },
            ].map((t, i) => (
              <div key={i} className="succ-card">
                <div className="succ-body">
                  <h4>{t.name}</h4>
                  <p>&ldquo;{t.q}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CORPORATIVO ===== */}
      <section id="corporativo">
        <div className="section-pad">
          <div className="sec-banner">
            <h2>Impacto visual, identidad y gestión cultural para empresas</h2>
            <p>Proyectos profesionales que transforman espacios y comunican los valores de tu organización.</p>
          </div>

          <div className="sec-h">
            <span className="eyebrow">Portafolio</span>
            <h3>Proyectos Realizados</h3>
          </div>

{/* Tabs Dinámicos */}
          <div className="tab-nav">
            <button 
              className={`tab ${activeTab === "todos" ? "active" : ""}`} 
              onClick={() => setActiveTab("todos")}
            >
              Todos
            </button>
            {Array.from(new Map(portafolioDin.filter(g => g.cat).map(g => [g.cat, g.catLabel || g.cat])).entries()).map(([f, label]) => (
              <button 
                key={f as string} 
                className={`tab ${activeTab === f ? "active" : ""}`} 
                onClick={() => setActiveTab(f as string)}
              >
                {label as string}
              </button>
            ))}
          </div>

          {/* Galería Dinámica */}
          <div className="gal-grid">
            {cargandoPort ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--t-muted)" }}>
                Cargando portafolio...
              </p>
            ) : (
              portafolioDin.filter(g => visible(g.cat, activeTab)).map((g, i) => (
                <div key={i} className="gal-item" onClick={() => openLB(g.img)}>
                  {/* Ya aplicamos el <img /> directo para evitar errores 400 */}
                  <img src={g.img} alt={g.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, position: 'absolute', top: 0, left: 0 }} loading="lazy" />
                  <div className="gal-ov">
                    <i className="fa fa-expand" />
                    <span>{g.label}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        

          <div className="cta-row" style={{ marginTop:"2rem" }}>
            <button className="btn btn-gold" onClick={() => toast("Descargando dossier de proyectos...", "info")}>
              <i className="fa fa-download" /> Descargar Dossier PDF
            </button>
            <button className="btn btn-blue" onClick={() => openM("Solicitar Reunión Técnica")}>
              <i className="fa fa-handshake-o" /> Solicitar Cotización
            </button>
          </div>
        </div>
      </section>

      {/* ===== PRE-UNIVERSITARIO ===== */}
      <section id="preuniversitario" style={{ background:"var(--white)" }}>
        <div className="section-pad">
          <div className="sec-banner">
            <h2>Prepárate con éxito para el examen de admisión a Bellas Artes</h2>
            <p>Programa intensivo con metodología probada. 98 % de ingresantes en nuestro historial.</p>
          </div>

          <div className="sec-h">
            <span className="eyebrow">Programa</span>
            <h3>Contenido del Ciclo Intensivo</h3>
          </div>

          <div className="feat-grid">
            {[
              { bg:"#EFF7F3", color:"var(--green)", icon:"fa-user",         title:"Dibujo Anatómico", desc:"Figura humana, proporciones y movimiento" },
              { bg:"#EFF7F3", color:"var(--green)", icon:"fa-tint",         title:"Pintura",          desc:"Óleo, acrílico y acuarela" },
              { bg:"#EFF7F3", color:"var(--green)", icon:"fa-object-group", title:"Composición",      desc:"Estructura, balance y armonía visual" },
              { bg:"#EFF7F3", color:"var(--green)", icon:"fa-arrows-alt",   title:"Perspectiva",      desc:"Perspectiva lineal y atmosférica" },
              { bg:"#EFF7F3", color:"var(--green)", icon:"fa-folder-open",  title:"Portafolio",       desc:"Preparación para entrevista y presentación" },
            ].map((f, i) => (
              <div key={i} className="feat-item">
                <div className="feat-ico" style={{ background:f.bg, color:f.color }}>
                  <i className={`fa ${f.icon}`} />
                </div>
                <div><h4>{f.title}</h4><p>{f.desc}</p></div>
              </div>
            ))}
          </div>

          <div className="sec-h" style={{ marginTop:"3rem" }}>
            <span className="eyebrow">Casos de éxito</span>
            <h3>Alumnos que ingresaron a Bellas Artes</h3>
          </div>

          <div className="succ-grid">
            {[
              { name:"Andrea Martínez", text:"Gracias al programa pude ingresar a Bellas Artes en mi primer intento. La preparación técnica y el apoyo del profesor fueron clave." },
              { name:"Luis Fernández",  text:"El enfoque en técnica y portafolio me dio la confianza necesaria para el examen. Lo recomiendo 100 % a quien quiera ingresar." },
            ].map((s, i) => (
              <div key={i} className="succ-card">
                <div className="succ-body">
                  <h4>{s.name}</h4>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="cta-row">
            <a href="https://wa.me/51999999999?text=Hola, quiero información sobre el ciclo de preparación para Bellas Artes" className="btn btn-wa" target="_blank" rel="noreferrer">
              <i className="fa fa-whatsapp" /> Clase Modelo Gratis
            </a>
            <button className="btn btn-outline green" onClick={() => toast("Ciclo regular: S/ 300 mensuales. Incluye materiales básicos.", "info")}>
              <i className="fa fa-list-ul" /> Ver Costos del Ciclo
            </button>
          </div>
        </div>
      </section>

      {/* ===== TIENDA ===== */}
      <section id="tienda">
        <div className="section-pad">
          <div className="sec-banner">
            <h2>Tienda Galería &mdash; Arte para tu espacio</h2>
            <p>Obras originales, prints digitales y artesanías peruanas para decorar tu hogar o lugar de trabajo.</p>
          </div>

          <div className="filt-nav">
            {/* 1. El botón "Todos" siempre queda fijo al inicio */}
            <button 
              className={`filt ${storeFilter === "todos" ? "active" : ""}`} 
              onClick={() => setStoreFilter("todos")}
            >
              Todos
            </button>
            
            {/* 2. Generamos los botones leyendo las categorías de tu Google Sheet sin repetirlas */}
            {Array.from(new Map(productosDin.filter(p => p.cat).map(p => [p.cat, p.catLabel])).entries()).map(([f, label]) => (
              <button 
                key={f as string} 
                className={`filt ${storeFilter === f ? "active" : ""}`} 
                onClick={() => setStoreFilter(f as string)}
              >
                {label as string}
              </button>
            ))}
          </div>

  <div className="prod-grid">
  {cargando ? (
    <p>Cargando catálogo...</p>
  ) : (
    productosDin.filter(p => visible(p.cat, storeFilter)).map((p, index) => (
      <div key={p.id || index} className="prod-card">
        <div className="prod-thumb">
              <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, position: 'absolute', top: 0, left: 0 }} loading="lazy" />
              {p.badge && <span className="prod-badge">{p.badge}</span>}
            </div>
        <div className="prod-body">
          <p className="prod-cat">{p.catLabel}</p>
          <h4>{p.name}</h4>
          <p>{p.desc}</p>
          <div className="prod-price">S/ {p.price}</div>
          <button className="btn-buy" onClick={() => addCart(p.name, p.price)}>
            <i className="fa fa-whatsapp" /> Comprar
          </button>
        </div>
      </div>
    ))
  )}
</div>

          {/* Métodos de pago */}
          <div className="pay-strip">
            <h3>Métodos de Pago</h3>
            <div className="pay-chips">
              {["Yape","Plin","BCP","Interbank","Scotiabank","Tarjeta Crédito","Efectivo"].map(m => (
                <span key={m} className="chip">{m}</span>
              ))}
            </div>
          </div>

          <div className="cta-row" style={{ marginTop:"1rem" }}>
            <button className="btn btn-red" onClick={() => openM("Solicitar Obra Personalizada")}>
              <i className="fa fa-paint-brush" /> Solicitar Obra Personalizada
            </button>
          </div>
        </div>
      </section>

{/* ===== MEDIA ===== */}
      <section id="media" style={{ background:"linear-gradient(180deg,var(--canvas) 0%,#f4f2ff 100%)", padding:"3rem 5% 4rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          
          {/* Header estilizado según imagen */}
          <div className="media-header">
            <h2 className="media-title">
              <i className="fa fa-play-circle" style={{ color: "var(--blue)" }} /> 
              Videos &amp; Podcast
            </h2>
            <p>Contenido exclusivo sobre arte, creatividad y técnicas. Tutoriales, entrevistas y episodios para inspirarte.</p>
          </div>

          {/* Media Tabs Estilo Pill */}
          <div className="media-tabs-styled">
            <button 
              className={`media-tab-btn ${mediaTab === "videos" ? "active-vid" : ""}`} 
              onClick={() => setMediaTab("videos")}
            >
              <i className="fa fa-youtube-play" /> Videos
            </button>
            <button 
              className={`media-tab-btn ${mediaTab === "podcast" ? "active-pod" : ""}`} 
              onClick={() => setMediaTab("podcast")}
            >
              <i className="fa fa-microphone" /> Podcast
            </button>
          </div>

          {/* Videos Panel (Bento Grid) */}
          {mediaTab === "videos" && (
            <div>
              <div className="media-bento">
                {/* Video Destacado (Izquierda) */}
                <div className="vid-card-styled featured">
                  <img src={VIDEOS_DATA[0].img} alt={VIDEOS_DATA[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, position: 'absolute', top: 0, left: 0 }} loading="lazy" />
                  <div className="vid-badge" style={{ background: VIDEOS_DATA[0].badgeColor }}>{VIDEOS_DATA[0].badge}</div>
                  <div className="vid-play-btn-large"><i className="fa fa-play" /></div>
                  <div className="vid-info">
                    <h3>{VIDEOS_DATA[0].title}</h3>
                    <span><i className="fa fa-clock-o" /> {VIDEOS_DATA[0].dur}</span>
                  </div>
                </div>

                {/* Videos Pequeños (Derecha) */}
                <div className="media-bento-right"> 
                 {VIDEOS_DATA.slice(1).map((v, i) => (
                    <div key={i} className="vid-card-styled small">
                      <img src={v.img} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, position: 'absolute', top: 0, left: 0 }} loading="lazy" />
                      <div className="vid-badge" style={{ background: v.badgeColor }}>{v.badge}</div>
                      <div className="vid-info">
                        <h3>{v.title}</h3>
                        <span><i className="fa fa-clock-o" /> {v.dur}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción inferior */}
              <div className="cta-row" style={{ marginTop: "2rem", justifyContent: "center" }}>
                <a href="https://www.youtube.com/@tallerarte" target="_blank" rel="noreferrer" className="btn btn-red">
                  <i className="fa fa-youtube-play" /> Ver canal completo
                </a>
                <button className="btn btn-outline blue" onClick={() => toast("¡Notificaciones activadas!", "ok")}>
                  <i className="fa fa-bell" /> Activar notificaciones
                </button>
              </div>
            </div>
          )}

          {/* Podcast Panel */}
          {mediaTab === "podcast" && (
            <div>
              <div className="pod-list-styled">
                {PODCAST_DATA.map((pod, i) => (
                  <div key={i} className="pod-card-styled">
                    <img src={pod.img} alt={pod.ep} className="pod-thumb-sq" />
                    
                    <div className="pod-content">
                      <span className="pod-ep-label">{pod.ep}</span>
                      <h4>{pod.title}</h4>
                      <p>{pod.desc}</p>
                    </div>

                    <div className="pod-action">
                      <button className="pod-play-grad">
                        <i className="fa fa-play" style={{ marginLeft: "3px" }} />
                      </button>
                      <span>{pod.dur}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones de acción inferior */}
              <div className="cta-row" style={{ marginTop: "2rem", justifyContent: "center" }}>
                <a href="#" className="btn" style={{ background: "#1DB954", color: "#fff" }}>
                  <i className="fa fa-spotify" /> Escuchar en Spotify
                </a>
                <a href="#" className="btn btn-blue">
                  <i className="fa fa-podcast" /> Apple Podcasts
                </a>
                <button className="btn btn-outline blue" onClick={() => toast("¡Suscrito al podcast!", "ok")}>
                  <i className="fa fa-rss" /> Suscribirse
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="logo" style={{ marginBottom:"1rem" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#D4006A,#0099C8)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"1.2rem" }}>
                <i className="fa fa-paint-brush" />
              </div>
              <span className="logo-text">Taller Estudio<span>Arte &amp; Creatividad</span></span>
            </div>
            <p>Transformamos la creatividad en éxito académico y profesional. Formando artistas desde 2015 en Lima, Perú.</p>
            <div className="soc-row">
              {[["fa-facebook","Facebook"],["fa-instagram","Instagram"],["fa-music","TikTok"],["fa-youtube-play","YouTube"]].map(([icon, label]) => (
                <a key={icon} href="#" className="soc-btn" title={label}><i className={`fa ${icon}`} /></a>
              ))}
            </div>
          </div>
          <div className="foot-col">
            <h4>Contacto</h4>
            <ul>
              <li><i className="fa fa-map-marker" /> Lima, Perú</li>
              <li><i className="fa fa-phone" /> +51 999 999 999</li>
              <li><i className="fa fa-envelope" /> info@tallerarte.com</li>
              <li><i className="fa fa-clock-o" /> Lun–Sáb: 9am – 7pm</li>
            </ul>
          </div>
          <div className="foot-col">
            <h4>Legal</h4>
            <ul>
              <li><i className="fa fa-id-card" /> RUC: 20123456789</li>
              <li><i className="fa fa-book" /><a href="#" onClick={e => { e.preventDefault(); toast("Libro de Reclamaciones disponible en el taller","info"); }}>Libro de Reclamaciones</a></li>
              <li><i className="fa fa-file-text-o" /><a href="#">Términos y Condiciones</a></li>
              <li><i className="fa fa-lock" /><a href="#">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-btm">
          <p>&copy; 2025 Taller Estudio Arte &amp; Creatividad &mdash; Todos los derechos reservados.</p>
          <p><i className="fa fa-heart" style={{ color:"var(--red)" }} /> Hecho con arte en Lima</p>
        </div>
      </footer>

      {/* ===== WA FLOAT ===== */}
      <button
        className="wa-float"
        onClick={() => window.open("https://wa.me/51999999999?text=Hola, deseo información sobre sus servicios", "_blank")}
        title="WhatsApp"
      >
        <i className="fa fa-whatsapp" />
      </button>

      {/* ===== MODAL ===== */}
      {modalOpen && (
        <div className="modal-ov on" onClick={e => { if (e.target === e.currentTarget) closeM(); }}>
          <div className="modal-box">
            <button className="modal-x" onClick={closeM}><i className="fa fa-times" /></button>
            <h3>{modalTitle}</h3>
            <p className="modal-sub">Completa el formulario y te contactamos en menos de 24 horas.</p>
            <form onSubmit={e => { e.preventDefault(); closeM(); toast("¡Mensaje enviado! Te contactaremos pronto.", "ok"); (e.target as HTMLFormElement).reset(); }}>
              <div className="fgrp">
                <label>Nombre</label>
                <input type="text" placeholder="Tu nombre completo" required />
              </div>
              <div className="fgrp">
                <label>Teléfono / WhatsApp</label>
                <input type="tel" placeholder="+51 999 999 999" required />
              </div>
              <div className="fgrp">
                <label>Mensaje</label>
                <textarea placeholder="Cuéntanos sobre tu proyecto..." required />
              </div>
              <button type="submit" className="btn btn-red" style={{ width:"100%", justifyContent:"center" }}>
                <i className="fa fa-paper-plane" /> Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== LIGHTBOX ===== */}
      {lbSrc && (
        <div className="lb on" onClick={closeLB}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lbSrc} alt="Galería" className="lb-img" />
          <button className="lb-x" onClick={closeLB}><i className="fa fa-times" /></button>
        </div>
      )}

      {/* ===== TOASTS ===== */}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <i className={`fa ${t.type === "ok" ? "fa-check-circle" : "fa-info-circle"}`} />
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}
