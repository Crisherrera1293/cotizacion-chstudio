const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const TERMINOS = [
  "El anticipo para reservar la fecha no es reembolsable, así garantizamos la disponibilidad del equipo de CH Studio en la fecha acordada",
  "La entrega se realizará únicamente cuando los pagos estén completos",
  "El cliente es responsable de descargar y resguardar el material dentro de los 90 días posteriores a la entrega digital",
  "CH Studio se reserva el derecho de usar algunas imágenes y clips con fines promocionales en portafolio, redes sociales y web, salvo pacto en contrario por escrito.",
  "Cualquier requerimiento adicional se cotiza por separado.",
  "Esta propuesta tiene una validez de 15 días calendario a partir de la fecha de emisión."
];

const STORAGE_KEY = "chstudio-cotizacion-v1";

const defaults = () => ({
  cliente: "",
  telefono: "",
  fecha: new Date().toISOString().slice(0, 10),
  descripcion: "",
  fechaServicio: "",
  horaServicio: "",
  tiempo: "",
  lugar: "",
  invitados: "",
  platos: "",
  equipo: "",
  cobertura: "",
  valorEtiqueta: "Valor total del paquete",
  valor: "",
  direccion: "cra 1b #73-13",
  extras: [],
  entregables: [""],
  pagos: [""],
  responsabilidades: [],
  terminos: TERMINOS.slice(),
  correos: ["cristherreraph@gmail.com", "chstudiocali@gmail.com"],
  telefonos: ["3102128890"]
});

const example = () => ({
  cliente: "Susan Jimenez",
  telefono: "3023591793",
  fecha: "2025-10-03",
  descripcion: "Fotos de embarazo",
  fechaServicio: "",
  horaServicio: "por-definir",
  tiempo: "",
  lugar: "Cali",
  invitados: "",
  platos: "",
  equipo: "1 fotógrafo",
  cobertura: "",
  valorEtiqueta: "Valor total de las fotos",
  valor: "$260.000",
  direccion: "cra 1b #73-13",
  extras: [],
  entregables: [
    "5 fotos fotos editadas, previamente seleccionadas por el cliente.",
    "Almacenamiento en nube por 90 días con link de descarga directa.",
    "Plazo de entrega: 5 días hábiles después de la selección de fotos."
  ],
  pagos: [
    "Reserva de fecha: $130.000 (no reembolsable).",
    "Saldo restante: $130.000 a más tardar el día de la sesión."
  ],
  responsabilidades: [],
  terminos: TERMINOS.slice(),
  correos: ["cristherreraph@gmail.com"],
  telefonos: ["3104137376", "3102128890"]
});

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatFecha(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  const mes = MESES[m - 1];
  return mes.charAt(0).toUpperCase() + mes.slice(1) + " " + d + " de " + y;
}

function formatHora(value) {
  if (!value || value === "por-definir") return "";
  const [h, min] = value.split(":").map(Number);
  if (Number.isNaN(h)) return "";
  const period = h < 12 ? "de la mañana" : h < 19 ? "de la tarde" : "de la noche";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  const minutes = min ? ":" + String(min).padStart(2, "0") : ":00";
  return hour12 + minutes + " " + period;
}

function formatFechaHora(fecha, hora) {
  const fechaTxt = formatFecha(fecha);
  const horaTxt = formatHora(hora);
  if (!fechaTxt && (!hora || hora === "por-definir")) return hora === "por-definir" ? "Por definir" : "";
  if (fechaTxt && horaTxt) return fechaTxt + ", a partir de las " + horaTxt;
  if (fechaTxt && hora === "por-definir") return fechaTxt + ", hora por definir";
  if (fechaTxt) return fechaTxt;
  return "A partir de las " + horaTxt;
}

function listRow(kind, value) {
  if (kind === "extras") {
    const label = value && value.label ? value.label : "";
    const text = value && value.value ? value.value : "";
    return `<div class="extra-row">
      <input type="text" data-extra="label" placeholder="Etiqueta" value="${esc(label)}">
      <input type="text" data-extra="value" placeholder="Valor" value="${esc(text)}">
      <button class="icon-btn" type="button" data-remove aria-label="Quitar">×</button>
    </div>`;
  }
  return `<div class="list-row">
    <input type="text" value="${esc(value || "")}">
    <button class="icon-btn" type="button" data-remove aria-label="Quitar">×</button>
  </div>`;
}

function paintList(id, items, kind) {
  const el = document.getElementById(id);
  const rows = (items && items.length ? items : (kind === "optional" ? [] : [""]));
  el.innerHTML = rows.map((item) => listRow(id === "extras" ? "extras" : "text", item)).join("");
}

function readList(id) {
  const el = document.getElementById(id);
  if (id === "extras") {
    return [...el.querySelectorAll(".extra-row")].map((row) => ({
      label: row.querySelector("[data-extra=label]").value.trim(),
      value: row.querySelector("[data-extra=value]").value.trim()
    })).filter((row) => row.label || row.value);
  }
  return [...el.querySelectorAll("input")].map((input) => input.value.trim()).filter(Boolean);
}

function readForm() {
  const form = document.getElementById("form");
  const data = Object.fromEntries(new FormData(form).entries());
  data.extras = [...document.querySelectorAll("#extras .extra-row")].map((row) => ({
    label: row.querySelector("[data-extra=label]").value.trim(),
    value: row.querySelector("[data-extra=value]").value.trim()
  }));
  data.entregables = [...document.querySelectorAll("#entregables input")].map((input) => input.value.trim());
  data.pagos = [...document.querySelectorAll("#pagos input")].map((input) => input.value.trim());
  data.responsabilidades = [...document.querySelectorAll("#responsabilidades input")].map((input) => input.value.trim());
  data.terminos = [...document.querySelectorAll("#terminos input")].map((input) => input.value.trim());
  data.correos = [...document.querySelectorAll("#correos input")].map((input) => input.value.trim());
  data.telefonos = [...document.querySelectorAll("#telefonos input")].map((input) => input.value.trim());
  return data;
}

function applyData(data) {
  const form = document.getElementById("form");
  for (const [key, value] of Object.entries(data)) {
    const field = form.elements[key];
    if (field && "value" in field) field.value = value ?? "";
  }
  paintList("extras", data.extras && data.extras.length ? data.extras : [], "optional");
  paintList("entregables", data.entregables);
  paintList("pagos", data.pagos);
  paintList("responsabilidades", data.responsabilidades, "optional");
  paintList("terminos", data.terminos);
  paintList("correos", data.correos);
  paintList("telefonos", data.telefonos);
  render();
}

function filled(list) {
  return (list || []).map((item) => String(item || "").trim()).filter(Boolean);
}

function row(label, value) {
  const text = String(value || "").trim();
  if (!label || !text) return "";
  return `<p class="row"><span class="k">${esc(label)}:</span> ${esc(text)}</p>`;
}

function bullets(items) {
  const list = filled(items);
  if (!list.length) return "";
  return `<ul>${list.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

const iconMail = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>`;
const iconPin = `<svg viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>`;
const iconPhone = `<svg viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 7a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1l-2.22 2.2z"/></svg>`;

function render() {
  const data = readForm();
  const fecha = formatFecha(data.fecha);
  const entregables = filled(data.entregables);
  const pagos = filled(data.pagos);
  const responsabilidades = filled(data.responsabilidades);
  const terminos = filled(data.terminos);
  const correos = filled(data.correos);
  const telefonos = filled(data.telefonos);
  const extras = (data.extras || []).filter((item) => item.label && item.value);

  const service = [
    row("Descripción del servicio", data.descripcion),
    row("Fecha y hora", formatFechaHora(data.fechaServicio, data.horaServicio)),
    row("Tiempo estimado", data.tiempo),
    row("Lugar", data.lugar),
    row("Cantidad de invitados", data.invitados),
    row("Cantidad de platos", data.platos),
    row("Equipo humano", data.equipo),
    row("Cobertura", data.cobertura),
    extras.map((item) => row(item.label.replace(/:$/, ""), item.value)).join(""),
    entregables.length ? `<p class="row"><span class="k">Entregables:</span></p>${bullets(entregables)}` : ""
  ].join("");

  const invest = [
    row(data.valorEtiqueta || "Valor total del paquete", data.valor),
    pagos.length ? `<p class="row"><span class="k">Condiciones de pago:</span></p>${bullets(pagos)}` : ""
  ].join("");

  const phonesHtml = telefonos.length
    ? `<div class="phones">${telefonos.map((tel) => `<div class="contact-line">${iconPhone}<span>${esc(tel)}</span></div>`).join("")}</div>`
    : "";

  const addressHtml = data.direccion.trim()
    ? `<div class="contact-line addr">${iconPin}<span>${esc(data.direccion.trim())}</span></div>`
    : "";

  document.getElementById("sheet").innerHTML = `
    <div class="sheet-main">
      <img class="logo" src="assets/logo.png" alt="CH Studio">
      <div class="client">
        <p><strong>Cliente:</strong> ${esc(data.cliente.trim())}</p>
        <p><strong>Teléfono:</strong> ${esc(data.telefono.trim())}</p>
        <p><strong>Fecha:</strong> ${esc(fecha)}</p>
      </div>
      <h2 class="doc-title">Cotización</h2>
      <div class="service">${service}</div>
      ${(data.valor.trim() || pagos.length) ? `<h2 class="section-title">Inversión</h2><div class="invest">${invest}</div>` : ""}
      ${responsabilidades.length ? `<h2 class="section-title">Responsabilidades del cliente</h2>${bullets(responsabilidades)}` : ""}
      <div class="spacer"></div>
      ${terminos.length ? `<section class="terms"><h2>Términos y condiciones</h2>${bullets(terminos)}</section>` : ""}
    </div>
    <footer class="foot">
      <img class="foot-mark" src="assets/footer-ch.png" alt="">
      <div class="foot-contact">
        <h3>CONTACTO:</h3>
        <div class="contact-grid">
          <div>
            ${correos.length ? `<div class="contact-line">${iconMail}<div class="emails">${correos.map(esc).join("<br>")}</div></div>` : ""}
            ${addressHtml}
          </div>
          ${phonesHtml}
        </div>
      </div>
    </footer>`;

  const nombre = data.cliente.trim();
  document.title = nombre ? `Cotización CH Studio - ${nombre}` : "Cotización CH Studio";
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (err) { /* ignore quota */ }
}

document.getElementById("form").addEventListener("input", render);
document.getElementById("form").addEventListener("change", render);

document.getElementById("form").addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove]");
  if (remove) {
    const rowEl = remove.closest(".list-row, .extra-row");
    const list = rowEl.parentElement;
    rowEl.remove();
    if (!list.children.length && list.id !== "extras" && list.id !== "responsabilidades") {
      list.insertAdjacentHTML("beforeend", listRow("text", ""));
    }
    render();
    return;
  }
  const add = event.target.closest("[data-add]");
  if (add) {
    const id = add.getAttribute("data-add");
    document.getElementById(id).insertAdjacentHTML("beforeend", listRow(id === "extras" ? "extras" : "text", ""));
    const inputs = document.getElementById(id).querySelectorAll("input");
    inputs[inputs.length - (id === "extras" ? 2 : 1)].focus();
  }
});

document.getElementById("print").addEventListener("click", () => window.print());
document.getElementById("example").addEventListener("click", () => {
  const current = readForm();
  const sample = example();
  if (filled(current.correos).length) sample.correos = current.correos;
  if (filled(current.telefonos).length) sample.telefonos = current.telefonos;
  if (current.direccion.trim()) sample.direccion = current.direccion;
  if (filled(current.terminos).length) sample.terminos = current.terminos;
  applyData(sample);
});
document.getElementById("clear").addEventListener("click", () => {
  const current = readForm();
  const fresh = defaults();
  fresh.terminos = filled(current.terminos).length ? current.terminos : fresh.terminos;
  fresh.correos = filled(current.correos).length ? current.correos : fresh.correos;
  fresh.telefonos = filled(current.telefonos).length ? current.telefonos : fresh.telefonos;
  fresh.direccion = current.direccion.trim() || fresh.direccion;
  fresh.valorEtiqueta = current.valorEtiqueta.trim() || fresh.valorEtiqueta;
  applyData(fresh);
});

let saved = null;
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (err) { saved = null; }
if (saved && saved.fechaHora === "Por definir" && !saved.horaServicio) saved.horaServicio = "por-definir";
if (new URLSearchParams(location.search).has("ejemplo")) {
  applyData(example());
} else {
  applyData(saved && saved.cliente !== undefined ? saved : defaults());
}
