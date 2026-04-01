import { auth } from "./firebase.js";
import { getEntries, addEntry, deleteEntry, updateEntry } from "./db.js";
import {
  showLoader,
  hideLoader,
  showToast,
  renderCompanyCards,
  renderPaginatedTable,
  formatDate,
} from "./ui.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// ---------------- STATE ----------------
let entries = [];
let selectedCompany = null;
let currentPage = 1;
const rowsPerPage = 10;

let editId = null;
let deleteId = null;
let modal;
let reportData = [];

// ---------------- DOM ----------------
const loginPageEl = document.getElementById("loginPage");
const appEl = document.getElementById("app");

// ---------------- LOGIN ----------------
window.loginUser = async () => {
  showLoader();
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (e) {
    console.error(e);
    showToast(e.message);
  }
  hideLoader();
};

// ---------------- LOGOUT ----------------
window.logoutUser = () => signOut(auth);

// ---------------- AUTH (ONLY ONE) ----------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginPageEl.classList.add("d-none");
    appEl.classList.remove("d-none");

    await loadData();
  } else {
    loginPageEl.classList.remove("d-none");
    appEl.classList.add("d-none");
  }
});

// ---------------- INIT ----------------
window.addEventListener("DOMContentLoaded", () => {
  modal = new bootstrap.Modal(document.getElementById("confirmModal"));

  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", async () => {
      if (!deleteId) return;

      await deleteEntry(deleteId);

      deleteId = null;
      modal.hide();

      await loadData();
    });

  // input listeners
  document.getElementById("company").addEventListener("input", handleInput);
  document.getElementById("ents").addEventListener("input", handleInput);
});

// ---------------- LOAD ----------------
async function loadData() {
  showLoader();

  entries = await getEntries();

  hideLoader();

  applyFilterAndRender();

  populateReportFilters();
}

// ---------------- SAVE ----------------
window.saveEntry = async (e) => {
  e.preventDefault();

  const data = {
    date: date.value,
    company: company.value,
    ents: ents.value,
    gatePass: gatePass.value,
    type: type.value,
    party: party.value,
    pieces: +pieces.value,
    weight: weight.value,
  };

  if (editId) {
    await updateEntry(editId, data);
    showToast("Updated successfully");
    editId = null;
  } else {
    await addEntry(data);
    showToast("Saved");
  }

  await loadData();
  showTab("dashboard");
};

// ---------------- UI RENDER ----------------
function applyFilterAndRender() {
  let filtered = selectedCompany
    ? entries.filter((e) => e.company === selectedCompany)
    : [...entries];

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  renderCompanyCards(entries, (company) => {
    selectedCompany = company;
    currentPage = 1;
    applyFilterAndRender();
  });

  renderPaginatedTable(
    filtered,
    currentPage,
    rowsPerPage,
    (entry) => startEdit(entry),
    (entry) => startDelete(entry),
  );
}

// ---------------- Report RENDER ----------------
window.renderReport = function () {
  const companyEl = document.getElementById("reportCompany");
  const entsEl = document.getElementById("reportEnts");
  const fromEl = document.getElementById("fromDate");
  const toEl = document.getElementById("toDate");

  // 🚨 SAFETY CHECK
  if (!companyEl || !entsEl) {
    console.warn("Report filters not loaded yet");
    return;
  }

  const company = companyEl.value;
  const entsFilter = entsEl.value;
  const from = fromEl?.value;
  const to = toEl?.value;

  let filtered = [...entries];

  // ✅ FILTERS
  if (company) {
    filtered = filtered.filter((e) => e.company === company);
  }

  if (entsFilter && entsFilter !== "All") {
    filtered = filtered.filter((e) => e.ents === entsFilter);
  }

  if (from) {
    const fromDate = new Date(from);
    filtered = filtered.filter((e) => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    filtered = filtered.filter((e) => new Date(e.date) <= toDate);
  }

  // ✅ SORT ASC (for running balance)
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

  // 🔥 GROUP BY ENTS
  const grouped = {};

  filtered.forEach((e) => {
    const ents = e.ents || "No Ents";

    if (!grouped[ents]) {
      grouped[ents] = {
        rows: [],
        balance: 0,
      };
    }

    const credit = e.type === "Credit" ? +e.pieces : 0;
    const debit = e.type === "Debit" ? +e.pieces : 0;

    // running balance per ents
    grouped[ents].balance += credit - debit;

    grouped[ents].rows.push({
      date: e.date,
      ents: e.ents,
      party: e.party || "-",
      weight: e.weight || "",
      credit,
      debit,
      balance: grouped[ents].balance,
    });
  });

  // ✅ STORE FOR EXPORT
  reportData = grouped;

  // ✅ RENDER UI
  renderReportUI(grouped);
};

// ---------------- EDIT ----------------
function startEdit(entry) {
  editId = entry.id;

  showTab("entry");

  date.value = entry.date || "";
  company.value = entry.company || "";
  ents.value = entry.ents || "";
  gatePass.value = entry.gatePass || "";
  type.value = entry.type || "";
  party.value = entry.party || "";
  pieces.value = entry.pieces || "";
  weight.value = entry.weight || "";

  toggleFields();
}

// ---------------- DELETE ----------------
function startDelete(entry) {
  deleteId = entry.id;

  if (!deleteId) {
    console.error("Missing ID");
    return;
  }

  modal.show();
}

// ---------------- PAGINATION ----------------
window.changePage = (page) => {
  currentPage = page;
  applyFilterAndRender();
};

// ---------------- TABS ----------------
window.showTab = (t) => {
  // Switch content
  ["dashboard", "entry", "report"].forEach((x) => {
    document.getElementById(x).style.display = x === t ? "block" : "none";
  });

  // Fix active tab highlight
  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.classList.remove("active");
  });

  const activeTab = document.getElementById(`tab-${t}`);
  if (activeTab) activeTab.classList.add("active");

  // Reset form only when opening entry (not edit)
  if (t === "entry" && !editId) {
    document.querySelector("form").reset();

    const d = document.getElementById("date");
    if (d) d.value = new Date().toISOString().split("T")[0];
  }

  if (t === "report") {
    renderReport(); // ✅ IMPORTANT
  }
};

// ---------------- FORM LOGIC ----------------
window.toggleFields = toggleFields;

function toggleFields() {
  const typeVal = type.value;

  if (typeVal === "Credit") {
    weightDiv.classList.remove("d-none");
    refDiv.classList.add("d-none");
  } else {
    weightDiv.classList.add("d-none");
    refDiv.classList.remove("d-none");

    populateGatePass();
    updateBalanceField();
  }
}

// ---------------- EXPORT REPORT ----------------
window.exportReport = function () {
  if (!reportData || !Object.keys(reportData).length) {
    showToast("No data to export");
    return;
  }

  let exportRows = [];

  Object.entries(reportData).forEach(([ents, obj]) => {
    // 🔥 ENTS HEADER
    exportRows.push({
      Date: "",
      Party: "",
      Ents: ents,
      Weight: "",
      Credit: "",
      Debit: "",
      Balance: "",
    });

    obj.rows.forEach((r) => {
      exportRows.push({
        Date: formatDate(r.date),
        Party: r.party,
        Ents: r.ents,
        Weight: r.weight || "",
        Credit: r.credit,
        Debit: r.debit,
        Balance: r.balance,
      });
    });

    exportRows.push({});
  });

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Ents_Grouped_Report");
  XLSX.writeFile(wb, "Ents_Grouped_Report.xlsx");

  showToast("Exported ENTS grouped report ✅");
};

// ---------------- HELPERS ----------------
function handleInput() {
  if (type.value === "Debit") populateGatePass();
  updateBalanceField();
}

function populateGatePass() {
  const select = refGatePass;
  select.innerHTML = "";

  const gps = [
    ...new Set(
      entries
        .filter(
          (e) =>
            e.type === "Credit" &&
            e.company === company.value &&
            e.ents === ents.value,
        )
        .map((e) => e.gatePass),
    ),
  ];

  gps.forEach((gp) => {
    const bal = getBalance(gp);

    if (bal > 0) {
      const opt = document.createElement("option");
      opt.value = gp;
      opt.textContent = `${gp} (Bal: ${bal})`;
      select.appendChild(opt);
    }
  });
}

function getBalance(gp) {
  return entries.reduce((t, e) => {
    if (e.type === "Credit" && e.gatePass === gp) t += +e.pieces;
    if (e.type === "Debit" && e.refGatePass === gp) t -= +e.pieces;
    return t;
  }, 0);
}

function updateBalanceField() {
  if (!company.value || !ents.value) {
    balance.value = "";
    return;
  }

  balance.value = entries.reduce((t, e) => {
    if (e.company === company.value && e.ents === ents.value) {
      return e.type === "Credit" ? t + +e.pieces : t - +e.pieces;
    }
    return t;
  }, 0);
}

function populateReportFilters() {
  const companySelect = document.getElementById("reportCompany");
  const entsSelect = document.getElementById("reportEnts");

  // unique companies
  const companies = [...new Set(entries.map((e) => e.company))];

  companySelect.innerHTML = `<option value="">All Companies</option>`;
  companies.forEach((c) => {
    companySelect.innerHTML += `<option value="${c}">${c}</option>`;
  });

  companySelect.onchange = () => {
    populateEntsFilter();
    renderReport();
  };

  populateEntsFilter();

  entsSelect.onchange = renderReport;
  document.getElementById("fromDate").onchange = renderReport;
  document.getElementById("toDate").onchange = renderReport;
}

function populateEntsFilter() {
  const company = document.getElementById("reportCompany").value;
  const entsSelect = document.getElementById("reportEnts");

  let filtered = company
    ? entries.filter((e) => e.company === company)
    : entries;

  const entsList = [...new Set(filtered.map((e) => e.ents))];

  entsSelect.innerHTML = `<option value="All">All</option>`;
  entsList.forEach((e) => {
    entsSelect.innerHTML += `<option value="${e}">${e}</option>`;
  });
}

function renderReportUI(groupedData) {
  const container = document.getElementById("reportBody");

  if (!groupedData || !Object.keys(groupedData).length) {
    container.innerHTML = "<p class='text-muted'>No data</p>";
    return;
  }

  let html = "";

  Object.entries(groupedData).forEach(([party, obj]) => {
    // 🚨 skip empty groups
    if (!obj.rows || obj.rows.length === 0) return;

    html += `
      <div class="card mb-3 shadow-sm">
        <div class="card-body">

          <h5 class="fw-bold mb-3">Ents: ${party}</h5>

          <div class="table-responsive">
            <table class="table table-bordered report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Party</th>
                  <th>Ents</th>
                  <th>Weight</th>
                  <th>Credit</th>
                  <th>Debit</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
    `;

    obj.rows.forEach((r) => {
      html += `
        <tr>
          <td>${formatDate(r.date)}</td>
          <td>${r.party || ""}</td>
          <td>${r.ents || ""}</td>
          <td>${r.weight || ""}</td>
          <td>${r.credit || ""}</td>
          <td class="text-danger">${r.debit || ""}</td>
          <td class="${r.balance < 0 ? "text-danger fw-bold" : ""}">
            ${r.balance ?? ""}
          </td>
        </tr>
      `;
    });

    html += `
              </tbody>
            </table>
          </div>

        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ---------------- INIT DATE ----------------
const d = document.getElementById("date");
if (d) d.value = new Date().toISOString().split("T")[0];

window.clearReportFilters = function () {
  const companyEl = document.getElementById("reportCompany");
  const fromEl = document.getElementById("fromDate");
  const toEl = document.getElementById("toDate");

  if (companyEl) companyEl.value = "";

  populateEntsFilter(); // 🔥 reset ents list

  const entsEl = document.getElementById("reportEnts");
  if (entsEl) entsEl.value = "All";

  if (fromEl) fromEl.value = "";
  if (toEl) toEl.value = "";

  renderReport();
};