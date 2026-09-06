"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Papa from "papaparse";
import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";

// ─── TYPES ────────────────────────────────────────────────────
interface CartItem {
  id: number;
  name: string;
  price: number;
  img: string;
  catLabel: string;
  desc: string;
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
  catLabel?: string;
  alt: string;
  label: string;
  img: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────
const IMG = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop";

const VIDEOS_DATA = [
  { type: "featured", badge: "NUEVO",    badgeColor: "var(--red)",   dur: "48 min",      img: IMG, title: "Técnicas de acuarela para principiantes — Clase completa" },
  { type: "small",    badge: "TIPS",     badgeColor: "var(--gold)",  dur: "12 min",      img: IMG, title: "Cómo mezclar colores perfectamente" },
  { type: "small",    badge: "SERIE",    badgeColor: "var(--green)", dur: "31 min",      img: IMG, title: "Dibujo anatómico — Episodio 3: El rostro" },
  { type: "small",    badge: "• EN VIVO",badgeColor: "#E50000",      dur: "Sábado 10am", img: IMG, title: "Taller en vivo: Óleo sobre lienzo" },
];

const PODCAST_DATA = [
  { ep: "EPISODIO 12", title: "¿Cómo vivir del arte en Latinoamérica?",               desc: "Entrevista con artistas peruanos que lograron monetizar su pasión sin sacrificar su visión.", dur: "38 min", img: IMG },
  { ep: "EPISODIO 11", title: "El proceso creativo detrás de un mural urbano",        desc: 'Desde el boceto hasta la pared — hablamos con el muralista detrás del proyecto "Cultura Viva".', dur: "52 min", img: IMG },
  { ep: "EPISODIO 10", title: "Arte corporativo: cuando el diseño habla por la marca",desc: "Casos reales de empresas que transformaron su identidad con proyectos artísticos.", dur: "44 min", img: IMG },
  { ep: "EPISODIO 9",  title: "Preparación para Bellas Artes: lo que nadie te dice", desc: "Ex-alumnos comparten sus experiencias, miedos y estrategias para el examen de admisión.", dur: "29 min", img: IMG },
];

type ToastItem = { id: number; msg: string; type: "ok" | "info" };

// ─── COMPONENT ────────────────────────────────────────────────
export default function Home() {
  const [cart, setCart]             = useState<CartItem[]>([]);
  const [toasts, setToasts]         = useState<ToastItem[]>([]);
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

  const [cartOpen, setCartOpen]     = useState(false);
  const [termsOk, setTermsOk]       = useState(false);

  const [productosDin, setProductosDin]   = useState<Product[]>([]);
  const [cargando, setCargando]           = useState(true);
  const [portafolioDin, setPortafolioDin] = useState<GalItem[]>([]);
  const [cargandoPort, setCargandoPort]   = useState(true);
  const [serviciosDin, setServiciosDin]   = useState<{
    id: number; img: string; color: string; eyebrow: string;
    title: string; desc: string; btnText: string; scrollTo: string;
  }[]>([]);
  const [tallerGal, setTallerGal]         = useState<{ alt: string; img: string }[]>([]);
  const [showAllTaller, setShowAllTaller] = useState(false);
  const [heroDin, setHeroDin]             = useState<{
    kicker: string; h1_line1: string; h1_em: string;
    h1_line2: string; sub: string; btnText: string;
  } | null>(null);

  useEffect(() => {
    const cb   = new Date().getTime();
    const BASE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1RUixX9Bkwjg1JjGKAZ7t2R3HZ9ak3_aH87YypUeiSNQaerpPTAA29WtUnkmkT-SQdQL7VJ5DAJRr/pub";
    Papa.parse(`${BASE}?gid=0&single=true&output=csv&t=${cb}`,               { download:true,header:true,dynamicTyping:true, complete:r=>{ setProductosDin(r.data as Product[]); setCargando(false); } });
    Papa.parse(`${BASE}?gid=2076785391&single=true&output=csv&t=${cb}`,      { download:true,header:true,dynamicTyping:true, complete:r=>setServiciosDin(r.data as typeof serviciosDin) });
    Papa.parse(`${BASE}?gid=1153909406&single=true&output=csv&t=${cb}`,      { download:true,header:true,dynamicTyping:true, complete:r=>setTallerGal(r.data as {alt:string;img:string}[]) });
    Papa.parse(`${BASE}?gid=1839069743&single=true&output=csv&t=${cb}`,      { download:true,header:true,dynamicTyping:true, complete:r=>{ const rows=r.data as typeof heroDin[]; if(rows.length) setHeroDin(rows[0]); } });
    Papa.parse(`${BASE}?gid=303872850&single=true&output=csv&t=${cb}`,       { download:true,header:true,dynamicTyping:true, complete:r=>{ setPortafolioDin(r.data as GalItem[]); setCargandoPort(false); } });
  }, []);

  const toast = useCallback((msg: string, type: "ok"|"info" = "info") => {
    const id = ++toastId.current;
    setToasts(t => [...t,{id,msg,type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3600);
  }, []);

  const isInCart  = (id: number) => cart.some(i => i.id === id);
  const addCart   = (p: Product) => {
    if (isInCart(p.id)) { toast(`"${p.name}" ya está en tu carrito`,"info"); return; }
    setCart(c => [...c,{id:p.id,name:p.name,price:p.price,img:p.img,catLabel:p.catLabel,desc:p.desc}]);
    toast(`"${p.name}" agregado al carrito`,"ok");
    setCartOpen(true);
  };
  const removeCart = (id: number) => setCart(c => c.filter(i => i.id !== id));
  const clearCart  = () => setCart([]);
  const cartTotal  = () => cart.reduce((s,i) => s+i.price,0).toFixed(2);

  const handleContinuar = () => {
    if (!termsOk) { toast("Debes aceptar los términos y condiciones","info"); return; }
    try { sessionStorage.setItem("taller_cart", JSON.stringify(cart)); } catch {}
    window.location.href = "/checkout";
  };

  const openM  = (title: string) => { setModalTitle(title); setModalOpen(true); };
  const closeM = () => setModalOpen(false);
  const openLB  = (src: string) => setLbSrc(src);
  const closeLB = () => setLbSrc(null);

  const togglePod = (idx: number) => {
    if (activePod === idx) { clearInterval(podTimers.current[idx]); setActivePod(null); return; }
    if (activePod !== null) { clearInterval(podTimers.current[activePod]); setPodPct(p=>({...p,[activePod]:0})); }
    setActivePod(idx);
    let pct = 0;
    podTimers.current[idx] = setInterval(() => {
      pct = Math.min(pct+0.08,100);
      setPodPct(p=>({...p,[idx]:pct}));
      if (pct>=100) { clearInterval(podTimers.current[idx]); setActivePod(null); }
    },300);
  };

  const visible = (cat: string, filter: string) => filter==="todos" || cat===filter;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if(e.key==="Escape"){closeM();closeLB();} };
    window.addEventListener("keydown",onKey);
    return () => window.removeEventListener("keydown",onKey);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});

  return (
    <>
      <Header useScrollNav cartCount={cart.length} onCartClick={() => setCartOpen(true)} />

      {/* ===== HERO ===== */}
      <section id="inicio">
        <div id="hero">
          <video className="hero-video-bg" src="/taller/videoportada.mp4" autoPlay loop muted playsInline disablePictureInPicture controlsList="nodownload nofullscreen noremoteplayback"/>
          <div className="hero-overlay"/>
          <div className="hero-inner">
            <p className="hero-kicker"><i className="fa fa-paint-brush"/> {heroDin?.kicker ?? "Lima, Perú — Desde 2015"}</p>
            <h1 className="hero-h1">
              {heroDin?.h1_line1 ?? "Creatividad que"}<br/>
              <em>{heroDin?.h1_em ?? "transforma"}</em>{" "}{heroDin?.h1_line2 ?? "vidas"}
            </h1>
            <p className="hero-sub">{heroDin?.sub ?? "Educación artística integral, proyectos corporativos y preparación profesional para artistas del futuro."}</p>
            <a href="#servicios" className="hero-cta" onClick={e=>{e.preventDefault();scrollTo("servicios");}}>
              <i className="fa fa-th-large"/> {heroDin?.btnText ?? "Catálogo de servicios"}
            </a>
            <div className="qr-app-banner">
              <Image src="/taller/qr.png" alt="QR Descarga App" width={72} height={72} style={{borderRadius:8,flexShrink:0,objectFit:"cover"}}/>
              <div className="qr-app-text">
                <span className="qr-app-title"><i className="fa fa-mobile"/> Descarga nuestra app</span>
                <span className="qr-app-sub">Escanea el QR con tu cámara y accede desde tu celular</span>
                <div className="qr-app-chips"><span><i className="fa fa-android"/> Android</span></div>
              </div>
            </div>
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
          {serviciosDin.map(s => (
            <div key={s.id} className="svc-card" data-c={s.color} onClick={()=>scrollTo(s.scrollTo)}>
              <div className="svc-thumb">
                <img src={s.img} alt={s.title} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:0,position:"absolute",top:0,left:0}} loading="lazy"/>
                <div className="svc-ico"><i className={`fa ${s.color==="red"?"fa-pencil":s.color==="blue"?"fa-building":s.color==="green"?"fa-graduation-cap":"fa-shopping-bag"}`}/></div>
              </div>
              <div className="svc-body">
                <span className="eyebrow">{s.eyebrow}</span>
                <h3>{s.title}</h3><p>{s.desc}</p>
                <a href={`#${s.scrollTo}`} className="btn-svc" onClick={e=>{e.preventDefault();scrollTo(s.scrollTo);}}>
                  <i className="fa fa-arrow-right"/> {s.btnText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== EDUCACIÓN ===== */}
      <section id="educacion" style={{background:"var(--white)"}}>
        <div className="section-pad">
          <div className="sec-banner">
            <h2>Despierta el talento, asegura las mejores calificaciones</h2>
            <p>Programas especializados para desarrollar la creatividad y el éxito académico de tus hijos.</p>
          </div>
<div className="sec-h"><span className="eyebrow">Talleres</span><h3>Talleres de Verano y Clases Particulares</h3></div>

{/* ── Descripción del taller ── */}
<div className="taller-desc-box">
  <p className="taller-desc-lead">
    ¡Despierta la creatividad y el talento artístico de tus hijos! En nuestro{" "}
    <strong>Taller de Arte y Creatividad</strong> aprenderán a soltar la imaginación,
    expresarse sin miedo y desarrollar su paciencia mientras crean verdaderas obras de arte.
  </p>
  <p className="taller-desc-subtitle">¿Qué aprenderán?</p>
  <div className="feat-grid">
    {[
      { bg:"#FDE8F3", color:"var(--red)",   icon:"fa-paint-brush", title:"Dibujo y Pintura",       desc:"Técnicas tradicionales y creativas para expresarse con libertad." },
      { bg:"#E5F5FA", color:"var(--blue)",  icon:"fa-tint",        title:"Color y Composición",    desc:"Exploración del color, mezclas y teoría de la composición visual." },
      { bg:"#EFF7F3", color:"var(--green)", icon:"fa-child",       title:"Personajes y Animación", desc:"Diseño de personajes y animación de sus figuras favoritas." },
      { bg:"#FEF6E4", color:"var(--gold)",  icon:"fa-star",        title:"Clases Personalizadas",  desc:"Adaptadas al ritmo de cada alumno en un entorno divertido y seguro." },
    ].map((f,i)=>(
      <div key={i} className="feat-item">
        <div className="feat-ico" style={{background:f.bg,color:f.color}}><i className={`fa ${f.icon}`}/></div>
        <div><h4>{f.title}</h4><p>{f.desc}</p></div>
      </div>
    ))}
  </div>
  <p className="taller-desc-cta">¡Cupos limitados! Pide información e inscríbete.</p>
</div>

{(()=>{
            const VI=9; const displayed=showAllTaller?tallerGal:tallerGal.slice(0,VI); const hasMore=tallerGal.length>VI;
            return(
              <div className="edu-collage-wrap">
                <div className="edu-masonry">
                  {displayed.map((g,i)=>(
                    <div key={i} className="edu-mas-item" onClick={()=>openLB(g.img)}>
                      <img src={g.img} alt={g.alt} loading="lazy"/>
                      <div className="edu-col-ov"><i className="fa fa-expand"/><span>{g.alt}</span></div>
                    </div>
                  ))}
                </div>
                {hasMore&&!showAllTaller&&(
                  <div className="edu-ver-mas-wrap">
                    <div className="edu-ver-mas-fade"/>
                    <button className="edu-ver-mas-btn" onClick={()=>setShowAllTaller(true)}>
                      <i className="fa fa-images"/> Ver más ({tallerGal.length-VI} fotos más) <i className="fa fa-chevron-down"/>
                    </button>
                  </div>
                )}
                {showAllTaller&&(
                  <div className="edu-colapsar-wrap">
                    <button className="edu-colapsar-btn" onClick={()=>setShowAllTaller(false)}><i className="fa fa-chevron-up"/> Mostrar menos</button>
                  </div>
                )}
              </div>
            );
          })()}
          <div className="cta-row">
            <a href="https://wa.me/51999999999?text=Hola, deseo información sobre los talleres de arte para mi hijo" className="btn btn-wa" target="_blank" rel="noreferrer"><i className="fa fa-whatsapp"/> Inscribirse por WhatsApp</a>
            <button className="btn btn-outline blue" onClick={()=>toast("Lunes–Viernes 3pm–7pm · Sábados 9am–1pm","info")}><i className="fa fa-clock-o"/> Ver Horarios</button>
          </div>
          <div className="sec-h" style={{marginTop:"3rem"}}><span className="eyebrow">Asesoría escolar</span><h3>Proyectos Escolares Especializados</h3></div>
          <div className="feat-grid">
            {[
              {bg:"#FDE8F3",color:"var(--red)",  icon:"fa-cubes",       title:"Maquetas",            desc:"Proyectos de arte, arquitectura y geometría"},
              {bg:"#E5F5FA",color:"var(--blue)", icon:"fa-flask",       title:"Proyectos de Ciencia",desc:"Feria Eureka y experimentos escolares"},
              {bg:"#EFF7F3",color:"var(--green)",icon:"fa-film",        title:"Escenografías",       desc:"Para obras teatrales y presentaciones"},
              {bg:"#FEF6E4",color:"var(--gold)", icon:"fa-eye",         title:"Exposiciones",        desc:"Capacitación para presentar proyectos"},
            ].map((f,i)=>(
              <div key={i} className="feat-item">
                <div className="feat-ico" style={{background:f.bg,color:f.color}}><i className={`fa ${f.icon}`}/></div>
                <div><h4>{f.title}</h4><p>{f.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="cta-row">
            <button className="btn btn-red" onClick={()=>openM("Cotizar mi Proyecto Escolar")}><i className="fa fa-file-text"/> Cotizar Proyecto Escolar</button>
          </div>
          <div className="sec-h" style={{marginTop:"3rem"}}><span className="eyebrow">Testimonios</span><h3>Lo que dicen los padres</h3></div>
          <div className="succ-grid">
            {[
              {name:"María G. — Surco",      q:"Mi hija mejoró notablemente en arte y ahora disfruta mucho más sus clases. Excelente profe con mucha paciencia y creatividad."},
              {name:"Carlos R. — Miraflores",q:"El taller de verano fue una experiencia increíble. Mi hijo aprendió técnicas nuevas y se divirtió muchísimo."},
            ].map((t,i)=>(
              <div key={i} className="succ-card"><div className="succ-body"><h4>{t.name}</h4><p>&ldquo;{t.q}&rdquo;</p></div></div>
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
          <div className="sec-h"><span className="eyebrow">Portafolio</span><h3>Proyectos corporativos Realizados</h3></div>
          <div className="tab-nav">
            <button className={`tab ${activeTab==="todos"?"active":""}`} onClick={()=>setActiveTab("todos")}>Todos</button>
            {Array.from(new Map(portafolioDin.filter(g=>g.cat).map(g=>[g.cat,g.catLabel||g.cat])).entries()).map(([f,label])=>(
              <button key={f as string} className={`tab ${activeTab===f?"active":""}`} onClick={()=>setActiveTab(f as string)}>{label as string}</button>
            ))}
          </div>
          <div className="gal-grid">
            {cargandoPort?(
              <p style={{gridColumn:"1/-1",textAlign:"center",color:"var(--t-muted)"}}>Cargando portafolio...</p>
            ):(
              portafolioDin.filter(g=>visible(g.cat,activeTab)).map((g,i)=>(
                <div key={i} className="gal-item" onClick={()=>openLB(g.img)}>
                  <img src={g.img} alt={g.alt} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:0,position:"absolute",top:0,left:0}} loading="lazy"/>
                  <div className="gal-ov"><i className="fa fa-expand"/><span>{g.label}</span></div>
                </div>
              ))
            )}
          </div>
          <div className="cta-row" style={{marginTop:"2rem"}}>
            <button className="btn btn-gold" onClick={()=>toast("Descargando dossier de proyectos...","info")}><i className="fa fa-download"/> Descargar Dossier PDF</button>
            <button className="btn btn-blue" onClick={()=>openM("Solicitar Reunión Técnica")}><i className="fa fa-handshake-o"/> Solicitar Cotización</button>
          </div>
        </div>
      </section>

      {/* ===== PRE-UNIVERSITARIO ===== */}
      <section id="preuniversitario" style={{background:"var(--white)"}}>
        <div className="section-pad">
          <div className="sec-banner">
            <h2>Prepárate con éxito para el examen de admisión a Bellas Artes</h2>
            <p>Programa intensivo con metodología probada. 98 % de ingresantes en nuestro historial.</p>
          </div>
          <div className="sec-h"><span className="eyebrow">Programa</span><h3>Contenido del Ciclo Intensivo</h3></div>
          <div className="feat-grid">
            {[
              {bg:"#EFF7F3",color:"var(--green)",icon:"fa-user",        title:"Dibujo Anatómico",desc:"Figura humana, proporciones y movimiento"},
              {bg:"#EFF7F3",color:"var(--green)",icon:"fa-tint",        title:"Pintura",         desc:"Óleo, acrílico y acuarela"},
              {bg:"#EFF7F3",color:"var(--green)",icon:"fa-object-group",title:"Composición",     desc:"Estructura, balance y armonía visual"},
              {bg:"#EFF7F3",color:"var(--green)",icon:"fa-arrows-alt",  title:"Perspectiva",     desc:"Perspectiva lineal y atmosférica"},
              {bg:"#EFF7F3",color:"var(--green)",icon:"fa-folder-open", title:"Portafolio",      desc:"Preparación para entrevista y presentación"},
            ].map((f,i)=>(
              <div key={i} className="feat-item">
                <div className="feat-ico" style={{background:f.bg,color:f.color}}><i className={`fa ${f.icon}`}/></div>
                <div><h4>{f.title}</h4><p>{f.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="sec-h" style={{marginTop:"3rem"}}><span className="eyebrow">Casos de éxito</span><h3>Alumnos que ingresaron a Bellas Artes</h3></div>
          <div className="succ-grid">
            {[
              {name:"Andrea Martínez",text:"Gracias al programa pude ingresar a Bellas Artes en mi primer intento. La preparación técnica y el apoyo del profesor fueron clave."},
              {name:"Luis Fernández", text:"El enfoque en técnica y portafolio me dio la confianza necesaria para el examen. Lo recomiendo 100 % a quien quiera ingresar."},
            ].map((s,i)=>(
              <div key={i} className="succ-card"><div className="succ-body"><h4>{s.name}</h4><p>{s.text}</p></div></div>
            ))}
          </div>
          <div className="cta-row">
            <a href="https://wa.me/51999999999?text=Hola, quiero información sobre el ciclo de preparación para Bellas Artes" className="btn btn-wa" target="_blank" rel="noreferrer"><i className="fa fa-whatsapp"/> Clase Modelo Gratis</a>
            <button className="btn btn-outline green" onClick={()=>toast("Ciclo regular: S/ 300 mensuales. Incluye materiales básicos.","info")}><i className="fa fa-list-ul"/> Ver Costos del Ciclo</button>
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
            <button className={`filt ${storeFilter==="todos"?"active":""}`} onClick={()=>setStoreFilter("todos")}>Todos</button>
            {Array.from(new Map(productosDin.filter(p=>p.cat).map(p=>[p.cat,p.catLabel])).entries()).map(([f,label])=>(
              <button key={f as string} className={`filt ${storeFilter===f?"active":""}`} onClick={()=>setStoreFilter(f as string)}>{label as string}</button>
            ))}
          </div>
          <div className="prod-grid">
            {cargando?<p>Cargando catálogo...</p>:(
              productosDin.filter(p=>visible(p.cat,storeFilter)).map((p,index)=>(
                <div key={p.id||index} className="prod-card">
                  <div className="prod-thumb">
                    <img src={p.img} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:0,position:"absolute",top:0,left:0}} loading="lazy"/>
                    {p.badge&&<span className="prod-badge">{p.badge}</span>}
                  </div>
                  <div className="prod-body">
                    <p className="prod-cat">{p.catLabel}</p>
                    <h4>{p.name}</h4><p>{p.desc}</p>
                    <div className="prod-price">S/ {p.price}</div>
                    <button className={`btn-buy ${isInCart(p.id)?"in-cart":""}`} onClick={()=>addCart(p)} disabled={isInCart(p.id)}>
                      <i className={`fa ${isInCart(p.id)?"fa-check":"fa-shopping-bag"}`}/>{isInCart(p.id)?"En carrito":"Agregar"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pay-strip">
            <h3>Métodos de Pago</h3>
            <div className="pay-chips">
              {["Yape","Plin","BCP","Interbank","Scotiabank","Tarjeta Crédito","Efectivo"].map(m=>(<span key={m} className="chip">{m}</span>))}
            </div>
          </div>
          <div className="cta-row" style={{marginTop:"1rem"}}>
            <button className="btn btn-red" onClick={()=>openM("Solicitar Obra Personalizada")}><i className="fa fa-paint-brush"/> Solicitar Obra Personalizada</button>
          </div>
        </div>
      </section>

      {/* ===== MEDIA ===== */}
      <section id="media" style={{background:"linear-gradient(180deg,var(--canvas) 0%,#f4f2ff 100%)",padding:"3rem 5% 4rem",position:"relative"}}>
        <div className="media-coming-overlay">
          <div className="media-coming-box">
            <div className="media-coming-icon"><i className="fa fa-play-circle"/></div>
            <span className="media-coming-eyebrow">Sección en construcción</span>
            <h3 className="media-coming-title">Próxima Apertura</h3>
            <p className="media-coming-sub">Estamos preparando contenido exclusivo para ti.<br/>Videos, tutoriales y podcast muy pronto.</p>
            <div className="media-coming-chips">
              <span><i className="fa fa-youtube-play"/> Videos</span>
              <span><i className="fa fa-microphone"/> Podcast</span>
              <span><i className="fa fa-bell"/> Notificaciones</span>
            </div>
          </div>
        </div>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div className="media-header">
            <h2 className="media-title"><i className="fa fa-play-circle" style={{color:"var(--blue)"}}/> Videos &amp; Podcast</h2>
            <p>Contenido exclusivo sobre arte, creatividad y técnicas. Tutoriales, entrevistas y episodios para inspirarte.</p>
          </div>
          <div className="media-tabs-styled">
            <button className={`media-tab-btn ${mediaTab==="videos"?"active-vid":""}`} onClick={()=>setMediaTab("videos")}><i className="fa fa-youtube-play"/> Videos</button>
            <button className={`media-tab-btn ${mediaTab==="podcast"?"active-pod":""}`} onClick={()=>setMediaTab("podcast")}><i className="fa fa-microphone"/> Podcast</button>
          </div>
          {mediaTab==="videos"&&(
            <div>
              <div className="media-bento">
                <div className="vid-card-styled featured">
                  <img src={VIDEOS_DATA[0].img} alt={VIDEOS_DATA[0].title} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:0,position:"absolute",top:0,left:0}} loading="lazy"/>
                  <div className="vid-badge" style={{background:VIDEOS_DATA[0].badgeColor}}>{VIDEOS_DATA[0].badge}</div>
                  <div className="vid-play-btn-large"><i className="fa fa-play"/></div>
                  <div className="vid-info"><h3>{VIDEOS_DATA[0].title}</h3><span><i className="fa fa-clock-o"/> {VIDEOS_DATA[0].dur}</span></div>
                </div>
                <div className="media-bento-right">
                  {VIDEOS_DATA.slice(1).map((v,i)=>(
                    <div key={i} className="vid-card-styled small">
                      <img src={v.img} alt={v.title} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:0,position:"absolute",top:0,left:0}} loading="lazy"/>
                      <div className="vid-badge" style={{background:v.badgeColor}}>{v.badge}</div>
                      <div className="vid-info"><h3>{v.title}</h3><span><i className="fa fa-clock-o"/> {v.dur}</span></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cta-row" style={{marginTop:"2rem",justifyContent:"center"}}>
                <a href="https://www.youtube.com/@tallerarte" target="_blank" rel="noreferrer" className="btn btn-red"><i className="fa fa-youtube-play"/> Ver canal completo</a>
                <button className="btn btn-outline blue" onClick={()=>toast("¡Notificaciones activadas!","ok")}><i className="fa fa-bell"/> Activar notificaciones</button>
              </div>
            </div>
          )}
          {mediaTab==="podcast"&&(
            <div>
              <div className="pod-list-styled">
                {PODCAST_DATA.map((pod,i)=>(
                  <div key={i} className="pod-card-styled">
                    <img src={pod.img} alt={pod.ep} className="pod-thumb-sq"/>
                    <div className="pod-content">
                      <span className="pod-ep-label">{pod.ep}</span>
                      <h4>{pod.title}</h4><p>{pod.desc}</p>
                    </div>
                    <div className="pod-action">
                      <button className="pod-play-grad" onClick={()=>togglePod(i)}><i className={`fa ${activePod===i?"fa-pause":"fa-play"}`} style={{marginLeft:"3px"}}/></button>
                      <span>{pod.dur}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cta-row" style={{marginTop:"2rem",justifyContent:"center"}}>
                <a href="#" className="btn" style={{background:"#1DB954",color:"#fff"}}><i className="fa fa-spotify"/> Escuchar en Spotify</a>
                <a href="#" className="btn btn-blue"><i className="fa fa-podcast"/> Apple Podcasts</a>
                <button className="btn btn-outline blue" onClick={()=>toast("¡Suscrito al podcast!","ok")}><i className="fa fa-rss"/> Suscribirse</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer modular ── */}
      <Footer onReclamaciones={()=>toast("Libro de Reclamaciones disponible en el taller","info")}/>

      {/* ===== WA FLOAT ===== */}
      <button className="wa-float" onClick={()=>window.open("https://wa.me/51925929447?text=Hola, deseo información sobre sus servicios","_blank")} title="WhatsApp">
        <i className="fa fa-whatsapp"/>
      </button>

      {/* ===== MODAL ===== */}
      {modalOpen&&(
        <div className="modal-ov on" onClick={e=>{if(e.target===e.currentTarget)closeM();}}>
          <div className="modal-box">
            <button className="modal-x" onClick={closeM}><i className="fa fa-times"/></button>
            <h3>{modalTitle}</h3>
            <p className="modal-sub">Completa el formulario y te contactamos en menos de 24 horas.</p>
            <form onSubmit={e=>{e.preventDefault();closeM();toast("¡Mensaje enviado! Te contactaremos pronto.","ok");(e.target as HTMLFormElement).reset();}}>
              <div className="fgrp"><label>Nombre</label><input type="text" placeholder="Tu nombre completo" required/></div>
              <div className="fgrp"><label>Teléfono / WhatsApp</label><input type="tel" placeholder="+51 999 999 999" required/></div>
              <div className="fgrp"><label>Mensaje</label><textarea placeholder="Cuéntanos sobre tu proyecto..." required/></div>
              <button type="submit" className="btn btn-red" style={{width:"100%",justifyContent:"center"}}><i className="fa fa-paper-plane"/> Enviar Mensaje</button>
            </form>
          </div>
        </div>
      )}

      {/* ===== LIGHTBOX ===== */}
      {lbSrc&&(
        <div className="lb on" onClick={closeLB}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lbSrc} alt="Galería" className="lb-img"/>
          <button className="lb-x" onClick={closeLB}><i className="fa fa-times"/></button>
        </div>
      )}

      {/* ===== CARRITO LATERAL ===== */}
      {cartOpen&&(
        <div className="cart-overlay" onClick={e=>{if(e.target===e.currentTarget)setCartOpen(false);}}>
          <div className="cart-drawer">
            <div className="cart-drawer-hdr">
              <div>
                <h3 className="cart-drawer-title">Mi Carrito</h3>
                <p className="cart-drawer-sub">{cart.length} producto{cart.length!==1?"s":""} en tu pedido</p>
              </div>
              <button className="cart-drawer-x" onClick={()=>setCartOpen(false)}><i className="fa fa-times"/></button>
            </div>
            <div className="cart-drawer-body">
              {cart.length===0?(
                <div className="cart-empty"><i className="fa fa-shopping-bag"/><p>Tu carrito está vacío</p></div>
              ):(
                cart.map(item=>(
                  <div key={item.id} className="cart-row">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.img} alt={item.name} className="cart-row-img"/>
                    <div className="cart-row-info">
                      <span className="cart-row-cat">{item.catLabel}</span>
                      <p className="cart-row-name">{item.name}</p>
                      <span className="cart-row-desc">{item.desc}</span>
                    </div>
                    <div className="cart-row-right">
                      <span className="cart-row-price">S/ {item.price.toFixed(2)}</span>
                      <button className="cart-row-del" onClick={()=>removeCart(item.id)} title="Eliminar"><i className="fa fa-trash-o"/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length>0&&(
              <div className="cart-drawer-footer">
                <div className="cart-resumen">
                  <span className="cart-resumen-label">RESUMEN</span>
                  <div className="cart-resumen-row"><span>Subtotal</span><span>S/ {cartTotal()}</span></div>
                  <div className="cart-resumen-row total"><span>Total</span><strong>S/ {cartTotal()}</strong></div>
                </div>
                <label className="cart-terms">
                  <input type="checkbox" checked={termsOk} onChange={e=>setTermsOk(e.target.checked)}/>
                  <span>Acepto los <a href="#" onClick={e=>e.preventDefault()}>términos y condiciones</a></span>
                </label>
                <button className="cart-continuar-btn" onClick={handleContinuar}>
                  Continuar pedido <i className="fa fa-arrow-right"/>
                </button>
                <button className="cart-vaciar-btn" onClick={()=>{clearCart();setTermsOk(false);}}>
                  <i className="fa fa-trash-o"/> Vaciar carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TOASTS ===== */}
      <div className="toast-wrap">
        {toasts.map(t=>(
          <div key={t.id} className={`toast ${t.type}`}>
            <i className={`fa ${t.type==="ok"?"fa-check-circle":"fa-info-circle"}`}/>{t.msg}
          </div>
        ))}
      </div>
    </>
  );
}