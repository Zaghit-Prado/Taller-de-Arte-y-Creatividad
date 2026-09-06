"use client";

interface FooterProps {
  onReclamaciones?: () => void;
}

export default function Footer({ onReclamaciones }: FooterProps) {
  const handleReclamaciones = (e: React.MouseEvent) => {
    e.preventDefault();
    onReclamaciones?.();
  };

  return (
    <footer className="footer">
      <div className="foot-grid">
        {/* Marca */}
        <div className="foot-brand">
          <div className="logo" style={{ marginBottom: "1rem" }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "linear-gradient(135deg,#D4006A,#0099C8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "1.2rem",
              }}
            >
              <i className="fa fa-paint-brush" />
            </div>
            <span className="logo-text">
              Taller Estudio<span>Arte &amp; Creatividad</span>
            </span>
          </div>
          <p>
            Transformamos la creatividad en éxito académico y profesional.
            Formando artistas desde 2015 en Lima, Perú.
          </p>
          <div className="soc-row">
            {[
              ["fa-facebook",    "Facebook"],
              ["fa-instagram",   "Instagram"],
              ["fa-music",       "TikTok"],
              ["fa-youtube-play","YouTube"],
            ].map(([icon, label]) => (
              <a key={icon} href="#" className="soc-btn" title={label}>
                <i className={`fa ${icon}`} />
              </a>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div className="foot-col">
          <h4>Contacto</h4>
          <ul>
            <li><i className="fa fa-map-marker" /> Lima, Perú</li>
            <li><i className="fa fa-phone" /> +51 999 999 999</li>
            <li><i className="fa fa-envelope" /> info@tallerarte.com</li>
            <li><i className="fa fa-clock-o" /> Lun–Sáb: 9am – 7pm</li>
          </ul>
        </div>

        {/* Legal */}
        <div className="foot-col">
          <h4>Legal</h4>
          <ul>
            <li><i className="fa fa-id-card" /> RUC: 20123456789</li>
            <li>
              <i className="fa fa-book" />
              <a href="#" onClick={handleReclamaciones}>
                Libro de Reclamaciones
              </a>
            </li>
            <li>
              <i className="fa fa-file-text-o" />
              <a href="#">Términos y Condiciones</a>
            </li>
            <li>
              <i className="fa fa-lock" />
              <a href="#">Política de Privacidad</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="foot-btm">
        <p>
          &copy; 2025 Taller Estudio Arte &amp; Creatividad &mdash; Todos los derechos reservados.
        </p>
        <p>
          <i className="fa fa-heart" style={{ color: "var(--red)" }} /> Hecho con arte en Lima
        </p>
      </div>
    </footer>
  );
}