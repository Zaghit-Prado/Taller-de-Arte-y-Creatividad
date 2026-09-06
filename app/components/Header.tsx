"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  /** Si es true, los links del nav hacen scroll suave (solo en la home) */
  useScrollNav?: boolean;
}

export default function Header({ cartCount = 0, onCartClick, useScrollNav = false }: HeaderProps) {
  const [shrunk, setShrunk]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!useScrollNav) return; // deja el comportamiento normal (link href)
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const NAV_ITEMS: [string, string][] = [
    ["educacion",        "Educación"],
    ["corporativo",      "Corporativo"],
    ["preuniversitario", "Bellas Artes"],
    ["tienda",           "Tienda"],
    ["media",            "Videos & Podcast"],
  ];

  const MOB_ITEMS: [string, string, string][] = [
    ["educacion",        "fa-pencil",        "Educación y Talleres"],
    ["corporativo",      "fa-building",       "Proyectos Corporativos"],
    ["preuniversitario", "fa-graduation-cap", "Preparación Bellas Artes"],
    ["tienda",           "fa-shopping-bag",   "Tienda Galería"],
    ["media",            "fa-play-circle",    "Videos & Podcast"],
  ];

  return (
    <>
      <header id="hdr" className={shrunk ? "shrunk" : ""}>
        <div className="wrap">
          {/* Logo */}
          <a href="/" className="logo">
            <Image
              src="/logo.png"
              alt="Taller Arte"
              width={52}
              height={52}
              style={{ borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
            />
            <span className="logo-text">
              Taller Estudio<span>Arte &amp; Creatividad</span>
            </span>
          </a>

          {/* Nav desktop */}
          <nav>
            <ul className="nav-list">
              {NAV_ITEMS.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={useScrollNav ? `#${id}` : `/#${id}`}
                    onClick={e => handleNav(e, id)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Derecha: carrito + hamburguesa */}
          <div className="hdr-right">
            {onCartClick && (
              <button className="cart-btn" onClick={onCartClick} title="Ver carrito">
                <i className="fa fa-shopping-bag" />
                {cartCount > 0 && (
                  <span className="cart-badge on">{cartCount}</span>
                )}
              </button>
            )}
            <button
              className={`hbg ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menú"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Nav móvil */}
      <div className={`mob-nav ${menuOpen ? "open" : ""}`}>
        <ul>
          {MOB_ITEMS.map(([id, icon, label]) => (
            <li key={id}>
              <a
                href={useScrollNav ? `#${id}` : `/#${id}`}
                onClick={e => handleNav(e, id)}
              >
                <i className={`fa ${icon} fa-fw`} /> {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}