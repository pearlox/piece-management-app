let selectedCompany = null;


export function formatDate(dateStr) {
  if (!dateStr) return "";

  const d = new Date(dateStr);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

export function showLoader() {
  loader.style.display = "flex";
}

export function hideLoader() {
  loader.style.display = "none";
}

export function showToast(msg) {
  toast.textContent = msg;
  toast.className = "toast show";

  setTimeout(() => (toast.className = "toast"), 3000);
}

export function renderCompanyCards(entries, onFilter) {
  const container = document.getElementById("companyCards");
  container.innerHTML = "";

  if (!entries.length) return;

  const map = {};

  // Build company → ents → balance
  entries.forEach((e) => {
    if (!map[e.company]) map[e.company] = {};

    if (!map[e.company][e.ents]) map[e.company][e.ents] = 0;

    if (e.type === "Credit") map[e.company][e.ents] += +e.pieces;
    else map[e.company][e.ents] -= +e.pieces;
  });

  Object.keys(map).forEach((company) => {
    const col = document.createElement("div");
    col.className = "col-md-3";

    const total = Object.values(map[company]).reduce((a, b) => a + b, 0);
    const isActive = selectedCompany === company;

    const card = document.createElement("div");
    card.className = "card p-2 shadow-sm";
    card.style.cursor = "pointer";
    card.style.border = isActive ? "2px solid #0d6efd" : "";

    const header = document.createElement("div");
    header.innerHTML = `
      <div class="d-flex justify-content-between">
        <strong>${company}</strong>
        <span class="badge bg-primary">${total}</span>
      </div>
    `;

    const body = document.createElement("div");
    body.style.display = isActive ? "block" : "none";

    Object.keys(map[company]).forEach((ent) => {
      const p = document.createElement("div");
      p.textContent = `${ent} : ${map[company][ent]}`;
      body.appendChild(p);
    });

    card.onclick = () => {
      selectedCompany = selectedCompany === company ? null : company;
      onFilter(selectedCompany);
      renderCompanyCards(entries, onFilter); // refresh UI
    };

    card.appendChild(header);
    card.appendChild(body);
    col.appendChild(card);
    container.appendChild(col);
  });
}

export function renderPaginatedTable(
  data,
  currentPage,
  rowsPerPage,
  onEdit,
  onDelete,
) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const pageData = data.slice(start, start + rowsPerPage);

  pageData.forEach((e, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatDate(e.date)}</td>
      <td>${e.company}</td>
      <td>${e.ents}</td>
      <td>${e.gatePass || ""}</td>
      <td>${e.type}</td>
      <td>${e.party}</td>
      <td>${e.pieces}</td>
    `;

    const td = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn btn-sm btn-warning me-1";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn btn-sm btn-danger";
    
    editBtn.onclick = () => {
      console.log("Edit clicked:", e);
      onEdit && onEdit(e);
    };

    delBtn.onclick = () => {
      console.log("Delete clicked:", e);
      onDelete && onDelete(e);
    };

    td.appendChild(editBtn);
    td.appendChild(delBtn);
    tr.appendChild(td);

    tableBody.appendChild(tr);
  });

  renderPaginationControls(data.length, currentPage, rowsPerPage);
}

export function renderPaginationControls(total, currentPage, rowsPerPage) {
  let container = document.getElementById("pagination");

  if (!container) {
    container = document.createElement("div");
    container.id = "pagination";
    container.className = "mt-3 text-center";
    document.getElementById("dashboard").appendChild(container);
  }

  container.innerHTML = "";

  const totalPages = Math.ceil(total / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className =
      "btn btn-sm mx-1 " +
      (i === currentPage ? "btn-primary" : "btn-outline-primary");

    btn.onclick = () => window.changePage(i);

    container.appendChild(btn);
  }
}
