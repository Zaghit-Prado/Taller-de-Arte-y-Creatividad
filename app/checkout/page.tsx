"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ─── TIPOS ────────────────────────────────────────────────────
interface CartItem {
  id: number;
  name: string;
  price: number;
  img: string;
  catLabel: string;
  desc: string;
}

type ToastItem = { id: number; msg: string; type: "ok" | "info" };

// ─── COMPONENTE ───────────────────────────────────────────────
export default function CheckoutPage() {
  const [cart, setCart]       = useState<CartItem[]>([]);
  const [toasts, setToasts]   = useState<ToastItem[]>([]);
  const [termsOk, setTermsOk] = useState(false);
  const [waNumber, setWaNumber] = useState("");
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const toastId = useRef(0);

  // Cargar carrito desde sessionStorage (lo guarda page.tsx antes de redirigir)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("taller_cart");
      if (raw) setCart(JSON.parse(raw));
    } catch {
      // sessionStorage no disponible
    }
  }, []);

  /* toast */
  const toast = useCallback((msg: string, type: "ok" | "info" = "info") => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3600);
  }, []);

  const cartTotal = () => cart.reduce((s, i) => s + i.price, 0).toFixed(2);

  const handleEnviarCodigo = () => {
    if (!waNumber.trim()) { toast("Ingresa tu número de WhatsApp", "info"); return; }
    if (!termsOk)          { toast("Debes aceptar los términos y condiciones", "info"); return; }
    const lines = cart.map(i => `• ${i.name} — S/ ${i.price}`).join("%0A");
    const msg   = `Hola, quiero confirmar mi pedido:%0A${lines}%0A%0ATotal: S/ ${cartTotal()}`;
    window.open(`https://wa.me/51999999999?text=${msg}`, "_blank");
    setCheckoutStep(2);
  };

  const handleVolverTienda = () => {
    sessionStorage.removeItem("taller_cart");
    window.location.href = "/";
  };

  const handleReclamaciones = () =>
    toast("Libro de Reclamaciones disponible en el taller", "info");

  return (
    <>
      {/* Header sin carrito ni scroll-nav (es una página independiente) */}
      <Header useScrollNav={false} />

      {/* Espaciador del header fijo */}
      <div style={{ height: 72 }} />

      {/* ─── CONTENIDO CHECKOUT ─── */}
      <main style={{ minHeight: "calc(100vh - 72px - 280px)", background: "var(--canvas)", padding: "3rem 5% 5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Volver */}
          <button className="checkout-back" onClick={() => window.history.back()}>
            <i className="fa fa-arrow-left" /> Volver al carrito
          </button>

          <h2 className="checkout-title">FINALIZAR PEDIDO</h2>

          {/* Banner WA */}
          <div className="checkout-wa-banner">
            <i className="fa fa-whatsapp" style={{ fontSize: "1.5rem", color: "#25D366" }} />
            <div>
              <strong>Tu pedido se gestiona por WhatsApp</strong>
              <p>
                Verifica tu número y confirma el pedido. Luego un asesor
                continuará la atención contigo por WhatsApp.
              </p>
              <p>
                Recibirás la constancia por WhatsApp y el asesor confirmará
                disponibilidad, forma de pago y entrega.{" "}
                <strong>No se realiza ningún pago en esta web.</strong>
              </p>
            </div>
          </div>

          {cart.length === 0 ? (
            /* Carrito vacío */
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--t-muted)" }}>
              <i className="fa fa-shopping-bag" style={{ fontSize: "3rem", opacity: .3, display: "block", marginBottom: "1rem" }} />
              <p style={{ marginBottom: "1.5rem" }}>No tienes productos en el carrito.</p>
              <button className="btn btn-blue" onClick={() => window.location.href = "/"}>
                <i className="fa fa-arrow-left" /> Ir a la tienda
              </button>
            </div>
          ) : (
            <div className="checkout-grid">

              {/* ── Pasos ── */}
              <div className="checkout-steps">

                {/* Paso 1 */}
                <div className={`checkout-step ${checkoutStep >= 1 ? "active" : ""}`}>
                  <div className="checkout-step-hdr">
                    <span className="checkout-step-num">1</span>
                    <span className="checkout-step-label">TU WHATSAPP</span>
                  </div>
                  {checkoutStep === 1 && (
                    <div className="checkout-step-body">
                      <p>
                        Te enviaremos un código por WhatsApp para confirmar que el
                        número es tuyo. Por ahí recibirás la constancia del pedido.
                      </p>

                      <div className="checkout-wa-input">
                        <span className="checkout-wa-prefix">🇵🇪 +51</span>
                        <input
                          type="tel"
                          placeholder="Ingresa tu número de WhatsApp"
                          value={waNumber}
                          onChange={e => setWaNumber(e.target.value)}
                        />
                      </div>

                      <label className="cart-terms" style={{ marginBottom: "1rem", display: "flex" }}>
                        <input
                          type="checkbox"
                          checked={termsOk}
                          onChange={e => setTermsOk(e.target.checked)}
                        />
                        <span>
                          Acepto los{" "}
                          <a href="#" onClick={e => e.preventDefault()}>
                            términos y condiciones
                          </a>
                        </span>
                      </label>

                      <button className="checkout-send-btn" onClick={handleEnviarCodigo}>
                        <i className="fa fa-whatsapp" /> Enviarme el código
                      </button>
                    </div>
                  )}
                </div>

                {/* Paso 2 */}
                <div className={`checkout-step ${checkoutStep >= 2 ? "active" : "disabled"}`}>
                  <div className="checkout-step-hdr">
                    <span className="checkout-step-num">2</span>
                    <span className="checkout-step-label">CONFIRMAR PEDIDO</span>
                  </div>
                  {checkoutStep === 2 && (
                    <div className="checkout-step-body">
                      <p>
                        Código enviado a <strong>+51 {waNumber}</strong>.
                        Revisa tu WhatsApp y confirma el pedido con el asesor.
                      </p>
                      <div className="checkout-success">
                        <i className="fa fa-check-circle" />
                        <span>¡Pedido enviado! Un asesor se contactará contigo en breve.</span>
                      </div>
                      <button
                        className="checkout-send-btn"
                        style={{ background: "var(--green)", marginTop: "1rem" }}
                        onClick={handleVolverTienda}
                      >
                        <i className="fa fa-shopping-bag" /> Seguir comprando
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* ── Resumen del pedido ── */}
              <div className="checkout-summary">
                <h4>TU PEDIDO</h4>
                {cart.map(item => (
                  <div key={item.id} className="checkout-sum-row">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.img} alt={item.name} />
                    <div className="checkout-sum-info">
                      <p>{item.name}</p>
                      <span>1 × S/ {item.price.toFixed(2)}</span>
                    </div>
                    <strong>S/ {item.price.toFixed(2)}</strong>
                  </div>
                ))}
                <div className="checkout-sum-total">
                  <span>Total</span>
                  <strong>S/ {cartTotal()}</strong>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Footer modular */}
      <Footer onReclamaciones={handleReclamaciones} />

      {/* Botón WhatsApp flotante */}
      <button
        className="wa-float"
        onClick={() =>
          window.open(
            "https://wa.me/51925929447?text=Hola, deseo información sobre sus servicios",
            "_blank"
          )
        }
        title="WhatsApp"
      >
        <i className="fa fa-whatsapp" />
      </button>

      {/* Toasts */}
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