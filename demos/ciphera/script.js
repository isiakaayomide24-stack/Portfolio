/* ===== Ciphera — password generator & vault ===== */
/* SECURITY NOTE: Generated passwords use crypto.getRandomValues and are never
   sent anywhere. The optional vault is stored in localStorage on this device
   only. It is convenient, but not encrypted — for real-world secrets, use a
   dedicated password manager or add client-side encryption before storing. */

const passwordDisplay = document.getElementById("passwordDisplay");
const strengthLabel = document.getElementById("strengthLabel");
const strengthFill = document.getElementById("strengthFill");
const strengthHint = document.getElementById("strengthHint");
const entropyLabel = document.getElementById("entropyLabel");
const lengthRange = document.getElementById("lengthRange");
const lengthValue = document.getElementById("lengthValue");
const copyBtn = document.getElementById("copyBtn");
const regenerateBtn = document.getElementById("regenerateBtn");
const saveBtn = document.getElementById("saveBtn");
const toggleVisibleBtn = document.getElementById("toggleVisibleBtn");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

const tabGenerator = document.getElementById("tabGenerator");
const tabVault = document.getElementById("tabVault");
const generatorView = document.getElementById("generatorView");
const vaultView = document.getElementById("vaultView");
const vaultList = document.getElementById("vaultList");
const vaultEmpty = document.getElementById("vaultEmpty");
const vaultCount = document.getElementById("vaultCount");
const clearVaultBtn = document.getElementById("clearVaultBtn");
const goGenerateBtn = document.getElementById("goGenerateBtn");

const saveModal = document.getElementById("saveModal");
const saveLabel = document.getElementById("saveLabel");
const confirmSaveBtn = document.getElementById("confirmSaveBtn");
const cancelSaveBtn = document.getElementById("cancelSaveBtn");

const checkboxes = ["uppercase", "lowercase", "numbers", "symbols"].map((id) => document.getElementById(id));
const avoidAmbiguous = document.getElementById("avoidAmbiguous");

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/"
};
const AMBIGUOUS = new Set(["O", "0", "l", "1", "I", "|"]);
const THEME_KEY = "ciphera-theme";
const VAULT_KEY = "ciphera-vault-v1";

let currentPassword = "";
let visible = true;
let vault = [];
const revealed = new Set();

/* ---------- Icons for vault actions ---------- */
const ICONS = {
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>'
};

/* ---------- Generation ---------- */
/* Secure random integer in [0, max) using rejection sampling to avoid bias. */
function secureRandomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

function cleanPool(chars) {
  return avoidAmbiguous.checked ? chars.split("").filter((c) => !AMBIGUOUS.has(c)).join("") : chars;
}

function getPools() {
  const pools = [];
  checkboxes.forEach((box) => {
    if (box.checked) {
      const pool = cleanPool(CHAR_SETS[box.id]);
      if (pool.length) pools.push(pool);
    }
  });
  return pools;
}

function generatePassword() {
  const pools = getPools();
  if (pools.length === 0) {
    showToast("Select at least one character type");
    return;
  }

  const length = Number(lengthRange.value);
  const combined = pools.join("");
  const chars = Array.from({ length }, () => combined[secureRandomInt(combined.length)]);

  // Guarantee at least one character from every selected set.
  const forced = new Set();
  pools.forEach((pool) => {
    if (forced.size >= length) return;
    if (!chars.some((ch) => pool.includes(ch))) {
      let index;
      do { index = secureRandomInt(length); } while (forced.has(index));
      chars[index] = pool[secureRandomInt(pool.length)];
      forced.add(index);
    }
  });

  currentPassword = chars.join("");
  render();
}

function getStrength(bits) {
  if (bits < 40) return { label: "Weak", color: "var(--weak)", width: 25, hint: "Too easy to guess — try a longer password." };
  if (bits < 60) return { label: "Fair", color: "var(--fair)", width: 50, hint: "Decent, but more length or symbols would help." };
  if (bits < 80) return { label: "Strong", color: "var(--strong)", width: 75, hint: "Good choice — this would take a long time to crack." };
  return { label: "Very strong", color: "var(--very)", width: 100, hint: "Excellent. This password is very hard to crack." };
}

function updateRangeFill() {
  const min = Number(lengthRange.min);
  const max = Number(lengthRange.max);
  const value = Number(lengthRange.value);
  const percent = ((value - min) / (max - min)) * 100;
  lengthRange.style.setProperty("--fill", `${percent}%`);
}

function render() {
  passwordDisplay.textContent = visible ? currentPassword : "•".repeat(currentPassword.length);

  const pools = getPools();
  const poolSize = pools.join("").length || 1;
  const bits = Math.round(Number(lengthRange.value) * Math.log2(poolSize));
  const strength = getStrength(bits);

  strengthLabel.textContent = strength.label;
  strengthLabel.style.color = strength.color;
  strengthFill.style.width = `${strength.width}%`;
  strengthFill.style.background = strength.color;
  strengthHint.textContent = strength.hint;
  entropyLabel.textContent = `${bits} bits of entropy`;
  lengthValue.textContent = lengthRange.value;
  updateRangeFill();
}

/* ---------- Toast & clipboard ---------- */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1900);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
}

/* ---------- Vault ---------- */
const dateFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

function makeId() {
  if (window.crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "recently" : dateFormatter.format(date);
}

function loadVault() {
  try {
    const raw = JSON.parse(localStorage.getItem(VAULT_KEY) || "[]");
    vault = Array.isArray(raw)
      ? raw
          .filter((item) => item && typeof item.password === "string" && typeof item.label === "string")
          .map((item) => ({
            id: item.id || makeId(),
            label: item.label,
            password: item.password,
            createdAt: item.createdAt || new Date().toISOString()
          }))
      : [];
  } catch {
    vault = [];
  }
}

function persistVault() {
  try {
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
  } catch {
    showToast("Couldn't save — storage is blocked or full");
  }
}

function iconButton(action, icon, label, danger = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `mini-btn${danger ? " danger" : ""}`;
  button.dataset.action = action;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML = icon;
  return button;
}

function renderVault() {
  vaultCount.textContent = vault.length;
  const empty = vault.length === 0;
  vaultEmpty.hidden = !empty;
  vaultList.hidden = empty;
  clearVaultBtn.hidden = empty;
  vaultList.innerHTML = "";

  vault.forEach((item) => {
    const row = document.createElement("div");
    row.className = "vault-item";
    row.dataset.id = item.id;

    const badge = document.createElement("div");
    badge.className = "vault-badge";
    badge.textContent = (item.label.trim().charAt(0) || "?").toUpperCase();

    const info = document.createElement("div");
    info.className = "vault-info";

    const name = document.createElement("span");
    name.className = "vault-name";
    name.textContent = item.label;

    const pass = document.createElement("span");
    pass.className = "vault-pass";
    const isRevealed = revealed.has(item.id);
    pass.textContent = isRevealed ? item.password : "•".repeat(Math.min(item.password.length, 16));

    const meta = document.createElement("span");
    meta.className = "vault-meta";
    meta.textContent = `Saved ${formatDate(item.createdAt)}`;

    info.append(name, pass, meta);

    const actions = document.createElement("div");
    actions.className = "vault-actions";
    actions.append(
      iconButton("reveal", isRevealed ? ICONS.eyeOff : ICONS.eye, isRevealed ? "Hide password" : "Reveal password"),
      iconButton("copy", ICONS.copy, "Copy password"),
      iconButton("delete", ICONS.trash, "Delete password", true)
    );

    row.append(badge, info, actions);
    vaultList.appendChild(row);
  });
}

function openSaveModal() {
  if (!currentPassword) {
    showToast("Generate a password first");
    return;
  }
  saveLabel.value = "";
  saveModal.hidden = false;
  requestAnimationFrame(() => saveLabel.focus());
}

function closeSaveModal() {
  saveModal.hidden = true;
}

function saveCurrentPassword() {
  if (!currentPassword) {
    showToast("Generate a password first");
    return;
  }
  const label = saveLabel.value.trim().slice(0, 48) || "Untitled password";
  vault.unshift({
    id: makeId(),
    label,
    password: currentPassword,
    createdAt: new Date().toISOString()
  });
  persistVault();
  renderVault();
  closeSaveModal();
  showToast(`“${label}” saved to your vault`);
}

/* ---------- Views & theme ---------- */
function switchView(view) {
  const isGenerator = view === "generator";
  generatorView.hidden = !isGenerator;
  vaultView.hidden = isGenerator;
  tabGenerator.classList.toggle("is-active", isGenerator);
  tabVault.classList.toggle("is-active", !isGenerator);
  tabGenerator.setAttribute("aria-selected", String(isGenerator));
  tabVault.setAttribute("aria-selected", String(!isGenerator));
  if (!isGenerator) renderVault();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0c0e0b" : "#e9e5da");
}

/* ---------- Events ---------- */
lengthRange.addEventListener("input", generatePassword);
checkboxes.forEach((box) => box.addEventListener("change", generatePassword));
avoidAmbiguous.addEventListener("change", generatePassword);
regenerateBtn.addEventListener("click", generatePassword);

copyBtn.addEventListener("click", async () => {
  if (!currentPassword) return;
  await copyText(currentPassword);
  showToast("Copied to clipboard");
});

saveBtn.addEventListener("click", openSaveModal);
confirmSaveBtn.addEventListener("click", saveCurrentPassword);
cancelSaveBtn.addEventListener("click", closeSaveModal);
saveModal.addEventListener("click", (event) => {
  if (event.target === saveModal) closeSaveModal();
});

toggleVisibleBtn.addEventListener("click", () => {
  visible = !visible;
  toggleVisibleBtn.dataset.visible = String(visible);
  toggleVisibleBtn.querySelector(".action-text").textContent = visible ? "Hide" : "Show";
  render();
});

tabGenerator.addEventListener("click", () => switchView("generator"));
tabVault.addEventListener("click", () => switchView("vault"));
goGenerateBtn.addEventListener("click", () => {
  switchView("generator");
  lengthRange.focus();
});

vaultList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const row = button.closest(".vault-item");
  const item = vault.find((entry) => entry.id === row.dataset.id);
  if (!item) return;

  if (button.dataset.action === "reveal") {
    if (revealed.has(item.id)) revealed.delete(item.id);
    else revealed.add(item.id);
    renderVault();
  } else if (button.dataset.action === "copy") {
    await copyText(item.password);
    showToast("Copied to clipboard");
  } else if (button.dataset.action === "delete") {
    vault = vault.filter((entry) => entry.id !== item.id);
    revealed.delete(item.id);
    persistVault();
    renderVault();
    showToast("Password removed");
  }
});

clearVaultBtn.addEventListener("click", () => {
  if (!vault.length) return;
  if (window.confirm("Delete all saved passwords? This can't be undone.")) {
    vault = [];
    revealed.clear();
    persistVault();
    renderVault();
    showToast("Vault cleared");
  }
});

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || saveModal.hidden) return;
  closeSaveModal();
});

saveLabel.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    saveCurrentPassword();
  }
});

/* ---------- Init ---------- */
(function init() {
  if (localStorage.getItem(THEME_KEY) === "dark") applyTheme("dark");
  loadVault();
  renderVault();
  generatePassword();
})();
