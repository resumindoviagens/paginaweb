:root {
  --navy: #252A55;
  --orange: #FF9F00;
  --bg: #F7F9FC;
  --border: #E4E8F0;
  --muted: #64748b;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: var(--bg);
  color: #1f2937;
}

a { color: inherit; text-decoration: none; }

button {
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary, .btn-dark, .btn-light {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

button:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.btn-primary { background: var(--orange); color: white; }
.btn-dark { background: var(--navy); color: white; }
.btn-light { background: white; color: var(--navy); border: 1px solid var(--border); }

.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(37,42,85,.06);
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-header img {
  height: 62px;
  width: auto;
  object-fit: contain;
}

.brand-title {
  color: var(--navy);
  font-size: 26px;
  font-weight: 900;
  margin: 0;
  line-height: 1;
}

.brand-subtitle {
  color: var(--navy);
  font-size: 14px;
  font-weight: 700;
  margin-top: 6px;
}

.brand-contact {
  color: var(--muted);
  font-size: 12px;
  margin-top: 4px;
}

input, select, textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 13px 14px;
  font: inherit;
  outline: none;
  background: white;
}

textarea {
  min-height: 96px;
  resize: vertical;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--orange);
  box-shadow: 0 0 0 4px rgba(255,159,0,.14);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.field.wide, .field.full {
  grid-column: 1 / -1;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--navy);
  font-weight: 700;
  font-size: 14px;
}

.radio {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 13px 14px;
  background: white;
}

.radio label {
  margin: 0;
  color: #334155;
  font-weight: 500;
}

.radio input { width: auto; }

.help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--navy);
  color: white;
  font-size: 12px;
  cursor: help;
  flex-shrink: 0;
  position: relative;
  z-index: 20;
}

.help:hover::after,
.help:focus::after {
  content: attr(data-tip);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 26px;
  width: 280px;
  max-width: 80vw;
  background: #ffffff;
  color: #334155;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(0,0,0,.18);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
  text-align: left;
  white-space: normal;
  z-index: 9999;
}

.status-pill {
  display: inline-block;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
}

.copy-link {
  font-size: 12px;
  word-break: break-all;
  color: var(--navy);
}

.error-alert {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
}

.secure-alert {
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
}

.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(255,159,0,.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(37,42,85,.14), transparent 35%),
    var(--bg);
}

.verify-card {
  max-width: 590px;
  width: 100%;
  padding: 34px;
}

.verify-badge {
  display: inline-block;
  margin-top: 24px;
  border-radius: 999px;
  padding: 7px 12px;
  background: #ecfdf5;
  color: #166534;
  font-weight: 800;
  font-size: 12px;
}

.verify-title {
  margin: 18px 0 8px;
  color: var(--navy);
  font-size: 26px;
}

.verify-text {
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 20px;
}

.verify-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.verify-footnote {
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}

.print-footer {
  display: none;
}

@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
  .form-layout { grid-template-columns: 1fr !important; }
  .brand-header { align-items: flex-start; }
  .brand-header img { height: 50px; }
  .verify-grid { grid-template-columns: 1fr; }
}

@media print {
  body { background: white; }
  .no-print { display: none !important; }
  .card { box-shadow: none; border: none; }
  .print-footer {
    display: block;
    margin-top: 30px;
    padding-top: 12px;
    border-top: 1px solid #ddd;
    color: #555;
    font-size: 12px;
  }
  .brand-header img { height: 56px; }
}


.brand-header-enhanced {
  justify-content: space-between;
}

.brand-main {
  flex: 1;
}

.brand-explanation {
  margin-top: 7px;
  color: #475569;
  font-size: 13px;
  line-height: 1.4;
  max-width: 780px;
}

.brand-contact a {
  color: var(--navy);
  font-weight: 700;
  text-decoration: underline;
}

.brand-client {
  text-align: right;
  color: var(--navy);
  min-width: 220px;
}

.brand-client span {
  display: block;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
}

.brand-client strong {
  display: block;
  font-size: 21px;
  line-height: 1.15;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, .55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.modal-card {
  background: #fff;
  border-radius: 18px;
  max-width: 680px;
  width: 100%;
  max-height: 80vh;
  overflow: auto;
  padding: 24px;
  box-shadow: 0 24px 60px rgba(0,0,0,.25);
}

.admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.admin-actions a,
.admin-actions button {
  margin: 0 !important;
}

.email-page {
  margin: 0;
  padding: 0;
  background: #f6f8fb;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
}

@media (max-width: 900px) {
  .brand-header-enhanced {
    align-items: flex-start;
  }

  .brand-client {
    text-align: left;
    min-width: 0;
    margin-top: 10px;
  }
}

.foto-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 18px 50px;
  color: #25283a;
}
.foto-hero, .foto-poster, .foto-content {
  background: #ffffff;
  border-radius: 26px;
  box-shadow: 0 14px 35px rgba(30,35,60,.08);
}
.foto-hero { padding: 30px; text-align: center; margin-bottom: 24px; }
.foto-logo { width: 260px; max-width: 80%; display: block; margin: 0 auto 18px; }
.foto-tag { display: inline-block; padding: 8px 16px; border-radius: 999px; background: rgba(246,160,0,.12); color: #f6a000; font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.foto-hero h1 { margin: 16px 0 10px; color: #363958; font-size: clamp(30px,5vw,50px); line-height: 1.05; }
.foto-lead { max-width: 900px; margin: 0 auto; font-size: 18px; line-height: 1.6; color: #61667c; }
.foto-poster { padding: 20px; margin-bottom: 24px; }
.foto-poster img { display: block; width: 100%; height: auto; border-radius: 18px; border: 1px solid #e1e4ec; }
.foto-content { padding: 34px; }
.foto-section { margin-bottom: 30px; }
.foto-section:last-child { margin-bottom: 0; }
.foto-section h2 { color: #363958; font-size: 26px; margin: 0 0 16px; display: flex; align-items: center; gap: 12px; }
.foto-section h2::before { content: ""; width: 12px; height: 34px; border-radius: 999px; background: #f6a000; display: inline-block; flex: 0 0 auto; }
.foto-requirements { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; padding: 0; margin: 0; list-style: none; }
.foto-requirements li { border: 1px solid #e1e4ec; background: #fbfcff; border-radius: 18px; padding: 16px 18px; line-height: 1.5; font-size: 16px; }
.foto-requirements strong { color: #363958; }
.foto-checklist { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; }
.foto-box { border-radius: 20px; padding: 20px; border: 1px solid #e1e4ec; background: #fbfcff; }
.foto-box h3 { margin: 0 0 12px; font-size: 21px; }
.foto-box.ok h3 { color: #188038; }
.foto-box.bad h3 { color: #c5221f; }
.foto-box ul { margin: 0; padding-left: 20px; color: #61667c; line-height: 1.65; font-size: 16px; }
.foto-alert { border-left: 6px solid #f6a000; background: #fff9ec; border-radius: 18px; padding: 18px 20px; color: #4b3a14; font-size: 16px; line-height: 1.6; }
.foto-footer { text-align: center; color: #61667c; font-size: 13px; margin-top: 28px; }
@media (max-width: 800px) {
  .foto-requirements, .foto-checklist { grid-template-columns: 1fr; }
  .foto-content, .foto-hero { padding: 24px 18px; border-radius: 20px; }
  .foto-poster { padding: 12px; border-radius: 20px; }
}


/* Navegação lateral do formulário: permite quebra em duas linhas sem estourar a caixa */
.section-nav-button {
  width: 100%;
  margin-bottom: 10px;
  justify-content: center !important;
  text-align: center !important;
  white-space: normal !important;
  overflow-wrap: anywhere;
  word-break: normal;
  line-height: 1.25;
  min-height: 56px;
  padding: 12px 14px;
}

/* Destaque amarelo para perguntas que exigem atenção especial */
.highlighted-question {
  background: #fff8bf;
  border: 1px solid #facc15;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 3px 10px rgba(250, 204, 21, .16);
}

.highlighted-question input,
.highlighted-question select,
.highlighted-question textarea,
.highlighted-question .radio {
  background: #fffef2;
  border-color: #eab308;
}

.admin-critical-alert {
  margin-top: 10px;
  padding: 9px 10px;
  border-radius: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
}


/* Contatos oficiais no cabeçalho */
.brand-contact-social { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 10px; }
.brand-social-link { display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--border); background: #ffffff; border-radius: 999px; padding: 7px 10px; color: var(--navy) !important; font-weight: 800; text-decoration: none !important; line-height: 1.2; }
.brand-social-link img { width: 22px !important; height: 22px !important; object-fit: contain; flex: 0 0 auto; }
.brand-social-link.whatsapp { border-color: #bbf7d0; background: #f0fdf4; }
.brand-social-link.instagram { border-color: #fbcfe8; background: #fff7fb; }
.foto-contact-card { margin: 18px auto 0; max-width: 760px; border: 1px solid #e1e4ec; background: #fbfcff; border-radius: 18px; padding: 16px; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.foto-contact-link { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; padding: 9px 12px; background: #fff; border: 1px solid #e1e4ec; font-weight: 800; color: #363958; text-decoration: none; }
.foto-contact-link img { width: 24px; height: 24px; }


/* Vídeo inicial das instruções */
.intro-video-box {
  display: flex;
  justify-content: center;
  margin: 22px 0 24px;
}

.intro-video {
  width: min(760px, 100%);
  border-radius: 18px;
  border: 1px solid var(--border);
  box-shadow: 0 14px 32px rgba(37,42,85,.12);
  background: #000;
}

/* Barra de progresso do formulário do cliente */
.progress-card {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 16px 18px;
  margin: 0 0 22px;
  box-shadow: 0 8px 25px rgba(37,42,85,.06);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}

.progress-info strong {
  display: block;
  color: var(--navy);
  font-size: 15px;
}

.progress-info span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  margin-top: 3px;
}

.progress-percent {
  color: var(--navy);
  font-weight: 900;
  font-size: 22px;
  min-width: 58px;
  text-align: right;
}

.progress-track {
  width: 100%;
  height: 12px;
  background: #edf2f7;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--orange), #ffbd4a);
  border-radius: 999px;
  transition: width .25s ease;
}

@media (max-width: 700px) {
  .progress-info { align-items: flex-start; }
  .progress-percent { font-size: 20px; }
}

.admin-email-menu {
  display: inline-block;
}

.admin-email-menu summary {
  list-style: none;
  cursor: pointer;
}

.admin-email-menu summary::-webkit-details-marker {
  display: none;
}

.admin-email-options {
  display: grid;
  gap: 6px;
  margin-top: 8px;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(15, 42, 68, 0.12);
  min-width: 240px;
  position: absolute;
  z-index: 10;
}

.admin-date-alert {
  margin-top: 7px;
  padding: 7px 9px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.admin-date-alert.danger {
  background: #fee2e2;
  color: #991b1b;
}

.admin-date-alert.warning {
  background: #fef3c7;
  color: #92400e;
}

.admin-date-alert.info {
  background: #dbeafe;
  color: #1e3a8a;
}

.btn-success {
  border: 1px solid #86efac;
  background: #dcfce7;
  color: #166534;
  border-radius: 999px;
  padding: 9px 13px;
  cursor: pointer;
  font-weight: 700;
}

button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.admin-email-options label {
  display: grid;
  gap: 4px;
  color: var(--muted);
  font-size: 12px;
}

.admin-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.admin-field-label {
  display: grid;
  gap: 6px;
  align-items: stretch;
  margin-bottom: 0;
}

.admin-field-label span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
}

.admin-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  background: #fff;
  color: var(--navy);
  font-weight: 800;
}

.admin-checkbox input {
  width: auto;
}

.admin-renewal-alert {
  margin-top: 8px;
  display: inline-block;
  padding: 7px 9px;
  border-radius: 10px;
  background: #ede9fe;
  color: #5b21b6;
  font-size: 12px;
  font-weight: 900;
}

.admin-renewal-alert.muted {
  background: #f1f5f9;
  color: #334155;
}


.version-badge {
  display: inline-block;
  margin-top: 14px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #166534;
  font-size: 12px;
  font-weight: 900;
}

.family-row {
  background: linear-gradient(90deg, rgba(31,42,96,.045), transparent 65%);
}

.process-panel h3 {
  width: 100%;
}

.renewal-client-card {
  background: #fff9ec;
  border-color: #fed7aa !important;
}

.popup-close {
  position: absolute;
  top: 8px;
  right: 8px;
  border: 0;
  background: #f1f5f9;
  color: #0f2a44;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
}

.admin-email-options {
  padding-top: 42px;
}

.version-badge {
  margin-top: 14px;
  display: inline-block;
  background: #eef2ff;
  color: #1f2a60;
  border: 1px solid #c7d2fe;
  border-radius: 999px;
  padding: 7px 12px;
  font-weight: 800;
  font-size: 13px;
}

/* v21 - termômetro de etapas */
.process-thermometer {
  margin: 10px 0 6px;
  max-width: 240px;
}
.thermo-label {
  font-size: 12px;
  font-weight: 700;
  color: #1f2a60;
  margin-bottom: 4px;
}
.thermo-bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}
.thermo-bars span {
  display: block;
  height: 10px;
  border-radius: 999px;
  background: #e5e7eb;
  border: 1px solid #d1d5db;
}
.thermo-bars span.filled {
  background: #ff9900;
  border-color: #ff9900;
}

/* v22 - relatórios */
.report-kpis {
  display: grid;
  grid-template-columns: repeat(5, minmax(120px, 1fr));
  gap: 10px;
  margin: 14px 0;
}
.report-kpis div {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
  background: #f8fafc;
}
.report-kpis strong {
  display: block;
  font-size: 28px;
  color: #1f2a60;
}
.report-kpis span {
  color: #64748b;
  font-weight: 700;
  font-size: 13px;
}
.report-modal table th {
  color: #1f2a60;
}
