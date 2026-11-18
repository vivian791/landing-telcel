(() => {
const WA = "https://wa.me/525534962059";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const LEGAL_BASE = "Precios en pesos mexicanos, IVA incluido, vigentes al 2026-10-19 y sujetos a cambio sin previo aviso. La renta mostrada corresponde a la modalidad indicada; la modalidad controlada tiene un costo adicional declarado en la tarjeta. Sin plazo forzoso de permanencia. ";
const LEGAL_END = "Servicio prestado por Radiomovil Dipsa, S.A. de C.V. (Telcel). Contratacion a traves de distribuidor autorizado.";
const LEGAL_GENERAL = LEGAL_BASE + "Redes sociales ilimitadas aplican unicamente a las aplicaciones enumeradas y no descuentan del paquete de datos. Cashback calculado sobre la renta abierta, no acumulable entre ciclos, expira en la fecha limite de pago del ciclo, no transferible entre lineas, y se pierde si existe adeudo o si la linea migra a prepago. Cashback aplicable solo a Mas Datos, Mas Datos Apps, Noches de Internet Sin Limite, Internet por Tiempo y Viajero Internacional LATAM Libre; no aplica a pago de fianza, financiamiento de equipos, renta base, consumos bajo demanda ni suscripciones de streaming de terceros. " + LEGAL_END;
const LEGAL_ULTRA = LEGAL_BASE + "Los planes Telcel Ultra no incluyen redes sociales ilimitadas ni generan Cashback; las redes sociales estan disponibles como modulo opcional con costo adicional mensual, activable y cancelable mes a mes. El paquete de datos puede usarse en Mexico, Estados Unidos y Canada. " + LEGAL_END;

// [familia, número, renta abierta, con tope, gb min, gb max (Libre) | gb (Ultra), cashback]
const PLANS = [
  ["Libre","1",265,315,4,6,5],["Libre","2",329,379,5,7.5,5],["Ultra","3",349,399,15,null,0],
  ["Libre","3",429,479,7,10.5,10],["Ultra","4",449,499,25,null,0],["Libre","4",529,579,10,15,15],
  ["Ultra","5",549,599,40,null,0],["Libre","5",629,729,20,30,15],["Libre","6",729,829,30,45,15],
  ["Ultra","7",749,799,60,null,0],["Libre","7",839,939,45,67.5,15],["Ultra","9",999,1049,120,null,0],
  ["Libre","9",1039,1139,50,75,15],["Libre","12",1349,1449,55,82.5,15],["Ultra","Ilimitado",1399,1449,"ilim",null,0],
  ["Libre","VIP",1589,1689,50,75,40]
].map(([fam, n, open, cap, a, b, cb]) => ({ fam, n, open, cap, a, b, cb, name: `Telcel ${fam} ${n}` }));

const money = v => "$" + v.toLocaleString("en-US");
const logo = p => `<div class="plan-logo"><small>Telcel</small><b>${p.fam} <i>${p.n}</i></b></div>`;
const detail = p => `${p.a} GB al pasar tu número Telcel de prepago a plan · ${p.b} GB al traer tu número de otra compañía, cambiar tu plan Telcel o contratar una línea nueva`;
const SOC = ["wa","fb","ms","ig","x","sn","ub"].map(s => `<img src="https://activatecontelcel.com/social/${s}.svg" alt="">`).join("");
let tope = false;
let chosen = null;

/* ---------- plan cards ---------- */
const FEATURED = [PLANS[2], PLANS[0], PLANS[3]]; // Ultra 3 | Libre 1 (destacado) | Libre 3
function card(p, featured) {
  const libre = p.fam === "Libre";
  const tag = `Elegir ${p.fam} ${p.n}`.toUpperCase();
  const body = libre ? `
      <div class="plan-gb"><div class="display">Desde ${p.a} y hasta ${p.b} GB</div><p class="small">${detail(p)}</p><div class="socials">${SOC}</div></div>
      <ul><li class="sq"><span><b>Redes sociales ilimitadas</b>, usa tus datos en lo que tú eliges</span></li>
      <li class="sq"><span>Cashback ${p.cb}%: hasta ${money(+(p.open * p.cb / 100).toFixed(2)).replace(/(\.\d)$/, "$10")} cada mes para paquetes de datos adicionales</span></li></ul>`
    : `
      <div class="plan-gb"><div class="display">${p.a} GB</div></div>
      <ul><li class="sq"><span>WhatsApp ilimitado, Sin descontar de tus gigas</span></li></ul>
      <div class="module"><span class="plus">+</span><div><b>Redes sociales como modulo opcional</b><p>Con costo mensual adicional. Lo activas y lo cancelas mes a mes.</p></div></div>`;
  return `<article class="plan notch rv${featured ? " featured" : ""}">
      ${libre ? '<span class="badge">50% mas gigas</span>' : ""}
      ${logo(p)}
      <div class="plan-price"><span class="num" data-open="${p.open}" data-cap="${p.cap}">${money(tope ? p.cap : p.open)}</span><small class="lbl">${tope ? "CON TOPE DE CONSUMO" : "RENTA ABIERTA"}</small></div>
      ${body}
      <button class="cond-btn" type="button">+ Ver condiciones</button>
      <div class="cond">${libre ? LEGAL_GENERAL : LEGAL_ULTRA}</div>
      <button class="btn ${featured ? "btn-white" : "btn-accent"} btn-block notch-sm" data-plan="${p.name}">${tag}</button>
    </article>`;
}
$("#plan-cards").innerHTML = FEATURED.map((p, i) => card(p, i === 1)).join("");

$("#tope").addEventListener("click", e => {
  tope = !tope;
  e.currentTarget.classList.toggle("on", tope);
  e.currentTarget.setAttribute("aria-checked", tope);
  $$(".plan-price").forEach(el => {
    const n = $(".num", el);
    n.textContent = money(+(tope ? n.dataset.cap : n.dataset.open));
    $(".lbl", el).textContent = tope ? "CON TOPE DE CONSUMO" : "RENTA ABIERTA";
  });
});

/* ---------- all plans table ---------- */
function renderTable(f = "all") {
  $("#tbody").innerHTML = PLANS.filter(p => f === "all" || p.fam.toLowerCase() === f).map(p => {
    const gb = p.a === "ilim"
      ? `<b>Gigas ilimitados</b><small>Con Política de Uso Justo de 200 GB por ciclo, sin cobros adicionales por consumo excedente</small>`
      : p.fam === "Libre" ? `<b>desde ${p.a} y hasta ${p.b} GB</b><small>${detail(p)}</small>` : `<b>${p.a} GB</b>`;
    return `<tr><td>${logo(p)}</td><td><span class="num">${money(p.open)}</span></td><td>${money(p.cap)}</td><td class="gb">${gb}</td>
      <td>${p.cb ? `<span class="cb">${p.cb}%</span>` : `<span class="cb no">No genera</span>`}</td>
      <td><button class="btn btn-blue" data-plan="${p.name}">Elegir</button></td></tr>`;
  }).join("");
}
renderTable();
$("#tabs").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  $$("#tabs button").forEach(x => x.classList.toggle("on", x === b));
  renderTable(b.dataset.f);
});

/* ---------- FAQ ---------- */
const FAQ = [
  ["¿Cómo me traigo mi número de otra compañía?","Necesitas un NIP de portabilidad de 4 dígitos. Lo pides desde el número que vas a traer: manda la palabra NIP por SMS al 051, o llama al 051. Te lo pedimos hasta el final del trámite, cuando ya tengamos todo lo demas guardado con tu folio."],
  ["¿Cuánto tiempo tengo para usar mi NIP?","Te lo confirmamos antes de que lo pidas. Si ya lo tienes y tienes duda, escribenos y lo revisamos contigo."],
  ["¿Qué es el tope de consumo?","Es una modalidad del plan: cuando se acaban tus gigas, la navegación se pausa en lugar de seguir consumiendo. Así no puede llegarte un cargo de más de lo que acordaste. Tiene un costo adicional al mes, que viene declarado en cada plan.",LEGAL_GENERAL],
  ["Ya tengo Telcel de prepago, ¿qué me toca?","Si pasas tu línea Telcel de prepago a un plan de la familia Telcel Libre, no pagas tu tercera renta mensual. Es el trámite con menos pasos: tu número ya es Telcel, así que no hay portabilidad de por medio.","Promocion vigente hasta el 31 de agosto de 2026. El beneficio consiste en la exencion de la tercera renta mensual, aplicable unicamente a lineas Telcel de prepago que pasan a un plan de la familia Telcel Libre. El regalo esta sujeto a existencias y se entrega con el envio del chip. No acumulable con otras promociones sobre el mismo tramite salvo indicacion expresa."],
  ["¿Cómo funciona el Cashback?","Cada mes se te acredita un porcentaje de tu renta para que lo uses en paquetes de datos adicionales. No es dinero en efectivo ni descuento de tu renta: aplica a paquetes específicos, no se acumula entre ciclos y expira en la fecha límite de pago del ciclo.",LEGAL_GENERAL],
  ["¿Qué es la Política de Uso Justo de Telcel Ultra Ilimitado?","Es un límite de referencia de 200 GB por ciclo. Lo que si esta confirmado es que no se generan cobros adicionales por consumo excedente. El detalle de lo que ocurre al superarla se publica conforme al comunicado Telcel vigente.","Ademas de las condiciones generales del plan: los datos de Telcel Ultra Ilimitado estan sujetos a una Politica de Uso Justo de 200 GB por ciclo. No se generan cobros adicionales por consumo excedente. El detalle del efecto al superar la Politica de Uso Justo se publicara conforme al comunicado Telcel vigente."],
  ["¿Los planes Ultra incluyen redes sociales?","No de origen: en Ultra todos los gigas van a tu bolsa libre y los usas en lo que quieras. Si las quieres sin que descuenten de tus gigas, hay un modulo opcional con costo mensual, que activas y cancelas mes a mes.",LEGAL_ULTRA],
  ["¿Qué documentos necesito?","Tu INE por el frente y por el reverso. Nada más. Lo pedimos porque es el documento con el que Telcel confirma que el trámite es tuyo — sin eso no se puede activar la línea. Puedes tomarles foto con tu celular desde el mismo formulario."],
  ["¿Por qué el plan Telcel Libre VIP me manda con un asesor?","Porque ese plan se contrata con equipo. Puedes dejarnos tu solicitud completa igual, y un asesor te contacta para revisar contigo las opciones con y sin equipo y ver cual te conviene más.","Ademas de las condiciones generales del plan: Telcel Libre VIP esta disponible unicamente con la contratacion de un equipo elegible y no se comercializa en tramites sin equipo. Al solicitarlo por este medio, un asesor te contactara para cotizar la opcion con equipo."],
  ["¿Cómo cancelo si ya no lo quiero?","No hay plazo forzoso de permanencia; puedes cancelar en cualquier momento sin penalización."],
  ["¿Me van a pedir mi tarjeta o mi cuenta?","En esta página no. No pedimos datos bancarios ni forma de pago para dejar tu solicitud."],
  ["¿Tienen promociones además de las de los planes?","Sí. Como clientes de Actívate con Telcel reciben ofertas exclusivas: seguido tenemos promociones en equipos, en contrataciones y en accesorios. Si quieres, te aviso cuáles están vigentes ahora."],
  ["Si paso mi prepago a un plan, ¿me quedo sin línea?","No. Al pasar tu línea Telcel de prepago a un plan de la familia Telcel Libre, tu número se queda activo todo el tiempo — no hay ningún momento en el que te quedes sin servicio."],
  ["Si traigo mi número de otra compañía, ¿me quedo sin línea?","Sí, pero solo por 1 día: una vez que aplicamos el trámite de portabilidad, tu línea queda sin servicio ese día mientras recibes tu nueva SIM. Al día siguiente ya estas activo con Telcel, con el mismo número."],
  ["¿Puedo pedir eSIM en vez de chip físico?","Sí, en cualquiera de los caminos (línea nueva, portabilidad o pasar tu prepago a un plan). Cuando tu trámite ya tenga folio, un asesor coordina contigo la entrega de tu eSIM."]
];
$("#faq").innerHTML = FAQ.map(([q, a, c], i) => `<details${i === 0 ? " open" : ""}><summary>${q}</summary><div class="ans"><p>${a}</p>${c ? `<button class="cond-btn" type="button">Ver condiciones</button><div class="cond">${c}</div>` : ""}</div></details>`).join("");

document.addEventListener("click", e => {
  const c = e.target.closest(".cond-btn");
  if (c) { const d = c.nextElementSibling; d.classList.toggle("open"); c.textContent = c.textContent.replace(/^(\+ )?(Ver|Ocultar)/, (m, p) => (p || "") + (d.classList.contains("open") ? "Ocultar" : "Ver")); }
});

/* ---------- modals ---------- */
const openM = id => { $(id).classList.add("open"); document.body.style.overflow = "hidden"; };
const closeM = m => { m.classList.remove("open"); if (!$$(".modal.open").length) document.body.style.overflow = ""; };
$("#open-all").addEventListener("click", () => openM("#allplans"));
$$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) closeM(m); }));
document.addEventListener("keydown", e => { if (e.key === "Escape") { const o = $$(".modal.open").pop(); if (o) closeM(o); } });
document.addEventListener("click", e => {
  const b = e.target.closest("[data-plan],[data-reg]"); if (!b) return;
  e.preventDefault();
  if (b.dataset.plan) chosen = b.dataset.plan;
  $("#mmenu").classList.remove("open");
  startReg();
});

/* ---------- registro (5 pasos) ---------- */
// NOTA: el envío es solo front-end. Conecta submitLead() al backend/CRM del cliente.
const STATES = ["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila de Zaragoza","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán de Ocampo","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz de Ignacio de la Llave","Yucatán","Zacatecas"];
const F = (name, label, attrs = "", help = "") => `<div class="field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" ${attrs}>${help ? `<p class="help">${help}</p>` : ""}<p class="err">Revisa este dato.</p></div>`;
const SEL = (name, label, opts, req = true) => `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}" ${req ? "required" : ""}><option value="">Selecciona</option>${opts.map(o => `<option>${o}</option>`).join("")}</select><p class="err">Selecciona una opción.</p></div>`;
const data = {};
let step = 0, folio = null;
const STEPS = [
  { t: "Empecemos con lo básico", html: () => `<p class="reg-intro">Es rápido y sencillo: en un par de minutos tu trámite queda listo para que actives tu nuevo plan.</p>
      ${chosen ? `<div class="folio" style="padding:10px 14px">Plan elegido: <strong>${chosen}</strong></div>` : ""}
      ${F("nombre", "Tu nombre", 'required placeholder="Como te llamas" autocomplete="given-name"')}
      ${F("celular", "Tu celular", 'required inputmode="numeric" maxlength="10" pattern="\\d{10}" placeholder="10 dígitos" autocomplete="tel-national"', "Es el número al que te vamos a contactar. Si vas a traer otro número, ese lo pedimos en el siguiente paso.")}
      ${F("correo", "Tu correo (opcional)", 'type="email" placeholder="tucorreo@ejemplo.com" autocomplete="email"', "Si nos lo dejas, te mandamos tu folio y puedes retomar el trámite desde ahi.")}
      <label class="opt"><input type="checkbox" name="promos"> Quiero recibir ofertas y promociones. (Opcional)</label>` },
  { t: "Tu línea", html: () => `<p class="reg-intro">Tu folio: <b style="font-family:var(--num);color:var(--field)">${folio}</b>. Cuéntanos cómo quieres tu línea.</p>
      ${!chosen ? SEL("plan", "Tu plan", PLANS.map(p => p.name)) : ""}
      <div class="choices">
        <label><input type="radio" name="tramite" value="portabilidad" required checked><span><b>Traer mi número de otra compañía</b>Te quedas con tu mismo número.</span></label>
        <label><input type="radio" name="tramite" value="prepago"><span><b>Pasar mi Telcel de prepago a plan</b>Tu número ya es Telcel, sin portabilidad.</span></label>
        <label><input type="radio" name="tramite" value="nueva"><span><b>Contratar una línea nueva</b>Te asignamos un número nuevo.</span></label>
      </div>
      <div id="port-fields">${SEL("compania", "¿Cuál es tu compañía actual?", ["AT&T","Movistar","Bait","Virgin","Unefon","Otro"])}
      ${F("numero", "Número que vas a traer", 'required inputmode="numeric" maxlength="10" pattern="\\d{10}" placeholder="10 dígitos"')}</div>
      <label class="opt"><input type="checkbox" name="esim"> Prefiero eSIM en lugar de chip físico</label>` },
  { t: "Tus datos y dirección de entrega", html: () => `
      ${F("apellidos", "Apellidos", 'required autocomplete="family-name"')}
      ${F("cp", "Código postal", 'required inputmode="numeric" maxlength="5" pattern="\\d{5}" autocomplete="postal-code"')}
      ${SEL("estado", "Estado", STATES)}
      ${F("municipio", "Municipio o alcaldía", "required")}
      ${F("colonia", "Colonia", "required")}
      ${F("calle", "Calle y número", 'required autocomplete="street-address"')}
      ${F("referencias", "Referencias del domicilio", 'placeholder="Entre calles, color de fachada…"')}` },
  { t: "Sube tu INE", html: () => `<p class="reg-intro">Tu INE por el frente y por el reverso. Nada más. Puedes tomarles foto con tu celular.</p>
      ${F("ine_frente", "INE por el frente", 'type="file" accept="image/*,application/pdf" capture="environment" required')}
      ${F("ine_reverso", "INE por el reverso", 'type="file" accept="image/*,application/pdf" capture="environment" required')}` },
  { t: "Último paso", html: () => `<div class="folio">Tu folio<b>${folio}</b></div>
      ${data.tramite === "portabilidad" ? F("nip", "NIP de portabilidad", 'required inputmode="numeric" maxlength="4" pattern="\\d{4}" placeholder="4 dígitos"', "Lo pides desde el número que vas a traer: manda la palabra NIP por SMS al 051, o llama al 051.") : `<p class="reg-intro">Revisa que tus datos estén bien. Un asesor te contacta para confirmar los últimos datos y coordinar el envío de tu chip.</p>`}` },
];
function paint() {
  $$("#prog i").forEach((el, i) => el.classList.toggle("on", i <= step));
  $("#step-t").textContent = STEPS[step].t;
  $("#regform").innerHTML = STEPS[step].html();
  $("#next").textContent = step === STEPS.length - 1 ? "ENVIAR SOLICITUD" : "CONTINUAR";
  $("#next").style.display = "";
  $("#regform").scrollTop = 0;
  const radios = $$('input[name="tramite"]');
  const sync = () => { const v = ($('input[name="tramite"]:checked') || {}).value; const pf = $("#port-fields"); if (pf) { pf.style.display = v === "portabilidad" ? "" : "none"; $$("input,select", pf).forEach(i => i.disabled = v !== "portabilidad"); } };
  radios.forEach(r => r.addEventListener("change", sync)); sync();
}
function startReg() { step = 0; paint(); openM("#reg"); setTimeout(() => { const i = $("#regform input"); if (i) i.focus(); }, 50); }
$("#regform").addEventListener("submit", async e => {
  e.preventDefault();
  let ok = true;
  $$("input,select", e.target).forEach(i => { if (i.disabled) return; const bad = !i.checkValidity(); i.closest(".field")?.classList.toggle("bad", bad); if (bad) ok = false; });
  if (!ok) return;
  new FormData(e.target).forEach((v, k) => data[k] = v instanceof File ? v.name : v);
  if (step === 0 && !folio) folio = "ACT-" + Date.now().toString(36).toUpperCase().slice(-6);
  if (step < STEPS.length - 1) { step++; paint(); return; }
  await submitLead({ ...data, plan: chosen || data.plan, folio });
  $("#step-t").textContent = "¡Listo!";
  $("#regform").innerHTML = `<div class="folio">Tu folio<b>${folio}</b></div><p class="reg-intro">Recibimos tu solicitud. Un asesor revisa tu solicitud, te contacta para confirmar los últimos datos y coordina el envio de tu chip.</p><a class="btn btn-accent btn-block notch-sm" href="${WA}?text=${encodeURIComponent("Hola, mi folio es " + folio)}" target="_blank" rel="noopener">ESCRIBIR POR WHATSAPP</a>`;
  $("#next").style.display = "none";
});
async function submitLead(payload) {
  // TODO: conectar al endpoint del cliente (CRM / API). Ejemplo:
  // await fetch("https://API_DEL_CLIENTE/leads", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
  console.info("submitLead", payload);
}
window.submitLead = submitLead;

/* ---------- nav, scrollspy, reveal, floating ---------- */
$("#burger").addEventListener("click", () => $("#mmenu").classList.toggle("open"));
$$("#mmenu a").forEach(a => a.addEventListener("click", () => $("#mmenu").classList.remove("open")));
const links = $$("#navlinks a");
const spy = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
["planes","como","uso","portabilidad","confianza","preguntas"].forEach(id => spy.observe(document.getElementById(id)));
const rv = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); rv.unobserve(en.target); } }), { threshold: .12 });
$$(".rv").forEach(el => rv.observe(el));
addEventListener("scroll", () => $("#backtop").classList.toggle("show", scrollY > 600), { passive: true });
$("#backtop").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
setTimeout(() => $("#chatw-bub").classList.add("show"), 2500);
$("#bub-x").addEventListener("click", () => $("#chatw-bub").remove());
})();
