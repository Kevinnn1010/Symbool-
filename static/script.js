// ================================
// INTRO LOADER (SLICE ANIMATION)
// ================================
function setupIntroLoader() {
  const loader = document.getElementById("intro-loader");
  const reveal = loader?.querySelector(".logo-reveal");
  const symbolWrapper = loader?.querySelector(".logo-symbol-wrapper");

  if (!loader || !reveal || !symbolWrapper) return;

  // STEP 0: MASUK
  setTimeout(() => {
    reveal.classList.add("revealed");
  }, 100);

  // STEP 1: TUNGGU LEBIH LAMA sebelum closing
  // Misal: jeda 3 detik total
  setTimeout(() => {
    reveal.classList.add("closing");
  }, 3500); // awalnya 2300, sekarang +1200

  // STEP 2: Simbol ke tengah & scale up
  setTimeout(() => {
    reveal.classList.add("centered");
  }, 4700); // disesuaikan (3500 + 1200)

  // STEP 3: Shine
  setTimeout(() => {
    symbolWrapper.classList.add("shine");
  }, 6400); // disesuaikan (4700 + durasi + buffer)

  // STEP 4: Fade out
  setTimeout(() => {
    loader.classList.add("fade-out");
  }, 7800);

  // STEP 5: Bersihkan
  setTimeout(() => {
    loader.remove();
  }, 8500);
}


// ================================
// LANDING PAGE TRANSITION
// ================================
function setupLandingTransition() {
  const enterBtn = document.getElementById("enterButton");
  if (enterBtn) {
    enterBtn.addEventListener("click", () => {
      navigateTo("calculatorPage");
    });
  }
}

// ================================
// NAVIGATION LOGIC
// ================================
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-links a[data-target]");

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = link.getAttribute("data-target");
      navigateTo(target);
    });

    link.addEventListener("mouseenter", () => updateHoverLine(link));
    link.addEventListener("mouseleave", () => {
      const activeLink = getActiveLink();
      updateHoverLine(activeLink);
    });
  });

  const logoLink = document.querySelector(".logo a[data-target]");
  if (logoLink) {
    logoLink.addEventListener("click", e => {
      e.preventDefault();
      navigateTo("landingPage");
    });
  }

  updateHoverLine(getActiveLink());
}

function updateHoverLine(link) {
  const hoverLine = document.querySelector(".nav-links .hover-line");
  if (!hoverLine) return;

  if (!link) {
    hoverLine.style.width = "0";
    return;
  }

  hoverLine.style.width = `${link.offsetWidth}px`;
  hoverLine.style.left = `${link.offsetLeft}px`;
}

function getCurrentPage() {
  return document.querySelector(".page-section.active")?.id || "landingPage";
}

function getActiveLink() {
  const page = getCurrentPage();
  return document.querySelector(`.nav-links a[data-target="${page}"]`);
}

// ================================
// SIDEBAR ACCOUNT MENU
// ================================
function setupSidebarMenu() {
  const avatarBtn = document.querySelector(".avatar-btn");
  const sidebar = document.getElementById("accountSidebar");

  if (!avatarBtn || !sidebar) return;

  avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !avatarBtn.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });

  const logoutButtons = sidebar.querySelectorAll(".logout-btn");
  logoutButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      alert("Logout berhasil.");
      sidebar.classList.remove("open");
    });
  });

  const sidebarLinks = sidebar.querySelectorAll("li span[data-target]");
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-target");
      if (target) navigateTo(target);
      sidebar.classList.remove("open"); // ⬅️ Pasti tutup sidebar
    });
  });

  const langToggle = sidebar.querySelector(".dropdown-toggle");
  const langOptions = sidebar.querySelector(".language-options");
  const currentLang = sidebar.querySelector(".current-language");

  if (langToggle && langOptions && currentLang) {
    langToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      langOptions.classList.toggle("hidden");
    });

    langOptions.querySelectorAll("li").forEach(item => {
      item.addEventListener("click", () => {
        const selectedText = item.textContent.trim();
        currentLang.textContent = selectedText;
        langOptions.classList.add("hidden");
        console.log("Selected Language:", item.dataset.lang);
      });
    });
  }
}

// ================================
// SIDEBAR PROFILE SUBMENU LOGIC
// ================================
function setupProfileSidebarTabs() {
  const sidebar = document.getElementById("accountSidebar");
  const sidebarTabs = document.querySelectorAll('.sidebar-submenu span[data-tab]');
  const profileTabs = document.querySelectorAll('.profile-tabs-bar .tab-btn');
  const tabContents = document.querySelectorAll('#profilePage .tab-content');

  function switchTab(targetTab) {
    tabContents.forEach(c => {
      c.style.display = (c.id === targetTab) ? 'block' : 'none';
    });

    profileTabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetTab);
    });

    sidebarTabs.forEach(s => {
      s.classList.toggle('active', s.dataset.tab === targetTab);
    });
  }

  sidebarTabs.forEach(item => {
    item.addEventListener('click', () => {
      if (getCurrentPage() !== "profilePage") {
        navigateTo('profilePage');
      }
      switchTab(item.dataset.tab);

      // ⬅️ Tutup sidebar juga
      sidebar.classList.remove("open");
    });
  });

  profileTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  switchTab('updateProfileTab');
}


// ================================
// PAGE SWITCHER
// ================================
function showPage(pageId) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle("active", section.id === pageId);
  });
  document.body.className = pageId;
  window.scrollTo({ top: 0, behavior: "auto" });
  updateBackButton();
}

function updateBackButton() {
  const backBtn = document.getElementById("backButton");
  const backIcon = document.getElementById("backIcon");
  const currentPage = getCurrentPage();

  if (!backBtn || !backIcon) return;

  // Tampilkan tombol kalau bukan landing page
  backBtn.style.display = currentPage === "landingPage" ? "none" : "flex";

  if (currentPage === "profilePage") {
    backIcon.src = "/static/back button.svg"; // biru normal
    backBtn.classList.add("profile-style");

    // Tambah hover handler hanya 1x
    backBtn.onmouseover = () => {
      backIcon.src = "/static/back button wh.svg";
    };
    backBtn.onmouseout = () => {
      backIcon.src = "/static/back button.svg";
    };

  } else {
    backIcon.src = "/static/back button.svg"; // biru untuk page lain
    backBtn.classList.remove("profile-style");

    // Pastikan hover di-nonaktifkan kalau bukan profil
    backBtn.onmouseover = null;
    backBtn.onmouseout = null;
  }
}


function getCurrentPage() {
  return document.querySelector(".page-section.active")?.id || "landingPage";
}

function navigateTo(pageId) {
  showPage(pageId);
  if (pageId === "calculatorPage") focusInput();
  updateHoverLine(getActiveLink());

  // HANYA push ke riwayat kalau BUKAN profilePage
  if (pageId !== "profilePage") {
    pushHistory(pageId);
  }
}

function pushHistory(pageId) {
  window.history.pushState({ page: pageId }, "", "#" + pageId);
}

window.addEventListener("popstate", e => {
  let pageId = e.state?.page || "landingPage";

  // Kalau pageId hasil back = profilePage, langsung paksa ke landingPage
  if (pageId === "profilePage") {
    pageId = "landingPage";
  }

  showPage(pageId);
  updateHoverLine(getActiveLink());
});


// Tombol back manual
const backBtn = document.getElementById("backButton");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    const current = getCurrentPage();
    if (current === "profilePage") {
      navigateTo("landingPage");
    } else {
      window.history.back();
    }
  });
}


// ================================
// OPTIMIZE BOOLEAN (REVISI FINAL)
// ================================
async function optimize() {
  const input = document.getElementById("expression");
  const method = document.getElementById("method")?.value || "simplify";
  const resultEl = document.getElementById("result");
  const explanationEl = document.getElementById("explanation");
  const durationEl = document.getElementById("duration");
  const kmapContainer = document.getElementById("kmapContainer");
  const tableResult = document.getElementById("tableResult");
  const exportContainer = document.querySelector(".export-container");
  const errorMsg = document.getElementById("inputError");
  const mintermContainer = document.getElementById("mintermResult");
  const mintermListEl = document.getElementById("mintermList");
  const mintermValuesEl = document.getElementById("mintermValues");
  const toggleDetailBtn = document.getElementById("toggleDetailBtn");
  const detailContainer = document.getElementById("detailContainer");
  const primeImplicantsContainer = document.getElementById("primeImplicantsResult");

  const expression = input?.value.trim();
  if (!expression) {
    errorMsg.textContent = "Masukkan ekspresi Boolean terlebih dahulu.";
    errorMsg.classList.remove("hidden");
    errorMsg.scrollIntoView({ behavior: "smooth" });
    return;
  }
  errorMsg.classList.add("hidden");

  // Hitung variabel unik
  const matches = expression.match(/[A-Za-z]/g);
  const uniqueVars = matches ? [...new Set(matches.map(v => v.toUpperCase()))] : [];

  // ✅ VALIDASI KMAP: max 4 variabel
  if (method === "kmap" && uniqueVars.length > 4) {
    resultEl.textContent = "";
    explanationEl.textContent = "";
    durationEl.textContent = "";
    kmapContainer.innerHTML = "";
    tableResult.innerHTML = "";
    exportContainer?.classList.add("hidden");
    mintermContainer.classList.add("hidden");
    toggleDetailBtn.classList.add("hidden");
    detailContainer.classList.add("hidden");
    primeImplicantsContainer.innerHTML = "";
    primeImplicantsContainer.classList.add("hidden");

    errorMsg.textContent = "K-Map hanya mendukung maksimal 4 variabel.";
    errorMsg.classList.remove("hidden");
    errorMsg.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // ✅ VALIDASI Q-M: max 8 variabel
  if (method === "qm" && uniqueVars.length > 8) {
    resultEl.textContent = "";
    explanationEl.textContent = "";
    durationEl.textContent = "";
    kmapContainer.innerHTML = "";
    tableResult.innerHTML = "";
    exportContainer?.classList.add("hidden");
    mintermContainer.classList.add("hidden");
    toggleDetailBtn.classList.add("hidden");
    detailContainer.classList.add("hidden");
    primeImplicantsContainer.innerHTML = "";
    primeImplicantsContainer.classList.add("hidden");

    errorMsg.textContent = "Metode Quine–McCluskey hanya mendukung maksimal 8 variabel.";
    errorMsg.classList.remove("hidden");
    errorMsg.scrollIntoView({ behavior: "smooth" });
    return;
  }

  try {
    const response = await fetch("/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expression, method }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("=== DATA FETCHED ===");
    console.log(data);

    resultEl.textContent = data.simplified || "–";
    explanationEl.textContent = data.explanation || "–";

    const isValid =
      Array.isArray(data.variables) && data.variables.length > 0 &&
      Array.isArray(data.table) && data.table.length > 0;

    durationEl.textContent = isValid && data.duration !== undefined ? `${data.duration} ms` : "–";

    if (isValid) {
      renderTruthTable(data.variables, data.table);
      exportContainer?.classList.remove("hidden");
    } else {
      tableResult.innerHTML = "<p class='no-table-msg'>Tabel tidak dapat ditampilkan.</p>";
      exportContainer?.classList.add("hidden");
    }

    if (data.kmap && isValid) {
      renderKmap(data.kmap);
    } else {
      kmapContainer.innerHTML = "";
    }

    if (
      isValid &&
      (method === "kmap" || method === "qm") &&
      data.minterm &&
      data.minterm_values
    ) {
      const rawMinterms = data.minterm.replace(/m\(|\)/g, ""); 
      mintermListEl.innerHTML = rawMinterms
      .split(",")
      .map(m => `<span class="minterm-item">m(${m.trim()})</span>`)
      .join("");
      mintermValuesEl.textContent = data.minterm_values;
      mintermContainer.classList.remove("hidden");
    } else {
      mintermContainer.classList.add("hidden");
    }

    if (isValid && data.threads && data.mainJoin) {
      renderThreadDetail(data, toggleDetailBtn, detailContainer);
    } else {
      toggleDetailBtn.classList.add("hidden");
      detailContainer.classList.add("hidden");
    }

    // === Quine–McCluskey Prime Implicants ===
    const piTable1 = Array.isArray(data.prime_implicant_table_1) ? data.prime_implicant_table_1 : [];
    const piTable2 = Array.isArray(data.prime_implicant_table_2) ? data.prime_implicant_table_2 : [];
    const piExpression = Array.isArray(data.prime_implicant_expression) ? data.prime_implicant_expression : [];
    const piChart = Array.isArray(data.prime_implicant_chart) ? data.prime_implicant_chart : [];
    const findingUnique = Array.isArray(data.finding_unique) ? data.finding_unique : [];
    const essentialImplicants = Array.isArray(data.essential_implicants) ? data.essential_implicants : [];

    if (
      isValid &&
      method === "qm" &&
      primeImplicantsContainer &&
      (
        piTable1.length > 0 || piTable2.length > 0 || piExpression.length > 0 ||
        piChart.length > 0 || findingUnique.length > 0
      )
    ) {
      let html = `<h3>Quine–McCluskey Process</h3>`;

      if (piTable1.length > 0) {
        html += `<h4>Prime Implicant Table 1:</h4>
          <table class="qm-table">
          <thead><tr><th>Group</th><th>Decimal</th><th>Binary</th><th>Cost</th></tr></thead>
          <tbody>`;
        piTable1.forEach(row => {
          html += `<tr>
            <td>${row.group ?? "-"}</td>
            <td>${Array.isArray(row.decimal) ? row.decimal.join(", ") : "-"}</td>
            <td>${row.binary ?? "-"}</td>
            <td>${row.cost ?? "-"}</td>
          </tr>`;
        });
        html += `</tbody></table>`;
      }

      if (piTable2.length > 0) {
        piTable2.forEach((stepTable, idx) => {
          html += `<h4>Prime Implicant Table ${idx + 2}:</h4>
            <table class="qm-table">
            <thead><tr><th>Group</th><th>Decimal</th><th>Binary</th><th>Cost</th></tr></thead>
            <tbody>`;
          stepTable.forEach(row => {
            html += `<tr>
              <td>${row.group ?? "-"}</td>
              <td>${Array.isArray(row.decimal) ? row.decimal.join(", ") : "-"}</td>
              <td>${row.binary ?? "-"}</td>
              <td>${row.cost ?? "-"}</td>
            </tr>`;
          });
          html += `</tbody></table>`;
        });
      }

      if (piExpression.length > 0) {
        html += `<h4>Prime Implicant Expression:</h4><ul>`;
        piExpression.forEach(expr => {
          html += `<li>${expr.binary ?? "-"} → ${expr.expression ?? "-"}</li>`;
        });
        html += `</ul>`;
      }

      if (piChart.length > 0) {
        const mintermKeys = [];
        piChart.forEach(row => {
          Object.keys(row).forEach(k => {
            if (!["PI", "expression", "minterms", "cost"].includes(k)) {
              if (!mintermKeys.includes(k)) mintermKeys.push(k);
            }
          });
        });

        const MAX_COLS_PER_TABLE = 5;
        const chartChunks = [];
        for (let i = 0; i < mintermKeys.length; i += MAX_COLS_PER_TABLE) {
          chartChunks.push(mintermKeys.slice(i, i + MAX_COLS_PER_TABLE));
        }

        html += `<h4>Prime Implicant Chart:</h4>`;
        chartChunks.forEach((chunk, idx) => {
          html += `<table class="qm-chart-table" style="margin-top:${idx === 0 ? '0' : '2rem'};">
            <thead>
              <tr>
                <th>PI</th><th>Expression</th><th>Minterms</th><th>Cost</th>
                ${chunk.map(m => `<th>${m}</th>`).join("")}
              </tr>
            </thead>
            <tbody>`;

          piChart.forEach(row => {
            html += `<tr>
              <td>${row.PI ?? "-"}</td>
              <td>${row.expression ?? "-"}</td>
              <td>${Array.isArray(row.minterms) ? row.minterms.join(", ") : "-"}</td>
              <td>${row.cost ?? "-"}</td>`;
            chunk.forEach(m => {
              html += `<td>${row[m] ?? ""}</td>`;
            });
            html += `</tr>`;
          });

          html += `</tbody></table>`;
        });
      }

      if (findingUnique.length > 0) {
        const mintermKeys = [];
        findingUnique.forEach(row => {
          Object.keys(row).forEach(k => {
            if (!["PI", "expression", "minterms", "cost", "essential"].includes(k)) {
              if (!mintermKeys.includes(k)) mintermKeys.push(k);
            }
          });
        });

        const MAX_COLS_PER_TABLE = 5;
        const chartChunks = [];
        for (let i = 0; i < mintermKeys.length; i += MAX_COLS_PER_TABLE) {
          chartChunks.push(mintermKeys.slice(i, i + MAX_COLS_PER_TABLE));
        }

        html += `<h4>Finding Unique Minterm:</h4>`;
        chartChunks.forEach((chunk, idx) => {
          html += `<table class="qm-chart-table" style="margin-top:${idx === 0 ? '0' : '2rem'};">
            <thead>
              <tr>
                <th>PI</th><th>Expression</th><th>Minterms</th><th>Cost</th><th>Essential</th>
                ${chunk.map(m => `<th>${m}</th>`).join("")}
              </tr>
            </thead>
            <tbody>`;

          findingUnique.forEach(row => {
            html += `<tr>
              <td>${row.PI ?? "-"}</td>
              <td>${row.expression ?? "-"}</td>
              <td>${Array.isArray(row.minterms) ? row.minterms.join(", ") : "-"}</td>
              <td>${row.cost ?? "-"}</td>
              <td>${row.essential ?? ""}</td>`;
            chunk.forEach(m => {
              html += `<td>${row[m] ?? ""}</td>`;
            });
            html += `</tr>`;
          });

          html += `</tbody></table>`;
        });
      }

      html += `<h4>Essential Prime Implicants:</h4>`;
      if (essentialImplicants.length > 0) {
        html += `<ul>${essentialImplicants.map(e => `<li>${e}</li>`).join("")}</ul>`;
      } else {
        html += `<p><i>None</i></p>`;
      }

      html += `<h2>Hasil Akhir:</h2><p>${data.simplified || "–"}</p>`;

      primeImplicantsContainer.innerHTML = html;
      primeImplicantsContainer.classList.remove("hidden");

    } else {
      primeImplicantsContainer.innerHTML = "";
      primeImplicantsContainer.classList.add("hidden");
    }

  } catch (err) {
    console.error("Terjadi error:", err);
    errorMsg.textContent = "Gagal memproses ekspresi.";
    errorMsg.classList.remove("hidden");
  }
}


// ================================
// RENDER THREAD DETAIL & TOGGLE
// ================================
function renderThreadDetail(data, toggleDetailBtn, detailContainer) {
  if (!toggleDetailBtn || !detailContainer) return;

  if (Array.isArray(data.threads) && data.mainJoin) {
    let html = `
      <div class="output-step">
        <h4>Hasil Simplifikasi</h4>
        <p>${data.simplified || "–"}</p>
      </div>
      <div class="output-step">
        <h4>Thread Proses</h4>
        <div class="thread-container">
    `;

    data.threads.forEach(thread => {
      html += `<div class="thread">
        <h5>${thread.name || "Thread"}</h5>
        <ul>`;
      if (Array.isArray(thread.steps)) {
        thread.steps.forEach(step => {
          html += `<li>${step}</li>`;
        });
      }
      html += `</ul></div>`;
    });

    html += `</div></div>`;

    html += `
      <div class="output-step">
        <h4>Grouping</h4>
        <div class="group-container">
    `;

    if (Array.isArray(data.groupings) && data.groupings.length > 0) {
      data.groupings.forEach(group => {
        html += `<div class="group-box">
          <h5>${group.group || "Group"}</h5>
          <ul>`;

        // Safety: check jika threads ada & objek
        if (group.threads && typeof group.threads === "object") {
          for (const [key, value] of Object.entries(group.threads)) {
            html += `<li><b>${key}:</b> ${value}</li>`;
          }
        }

        if (Array.isArray(group.steps)) {
          group.steps.forEach(step => {
            html += `<li>${step}</li>`;
          });
        }

        html += `<li><b>Result:</b> ${group.result || "–"}</li>`;
        html += `</ul></div>`;
      });
    } else {
      html += `<p><i>Tidak ada grouping.</i></p>`;
    }

    html += `</div></div>`;

    html += `
      <div class="output-step">
        <h4>Main Join</h4>
        <p>${data.mainJoin || "–"}</p>
      </div>
    `;

    detailContainer.innerHTML = html;
    toggleDetailBtn.classList.remove("hidden");
    detailContainer.classList.add("hidden");
    toggleDetailBtn.textContent = "Lihat Selengkapnya";

    toggleDetailBtn.onclick = () => {
      detailContainer.classList.toggle("hidden");
      toggleDetailBtn.textContent = detailContainer.classList.contains("hidden")
        ? "Lihat Selengkapnya"
        : "Sembunyikan Detail";
    };
  } else {
    toggleDetailBtn.classList.add("hidden");
    detailContainer.classList.add("hidden");
  }
}


// ================================
// K-MAP RENDERER
// ================================
function renderKmap(kmap) {
  const container = document.getElementById("kmapContainer");
  if (!container) return;

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "kmap-wrapper";

  const table = document.createElement("table");
  table.className = "kmap-table";

  const caption = document.createElement("caption");
  caption.textContent = "Peta Karnaugh:";
  table.appendChild(caption);

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  const corner = document.createElement("th");
  corner.className = "corner-cell";
  corner.innerHTML = `
    <span class="corner-row">${kmap.corner_label_row || ""}</span>
    <span class="corner-col">${kmap.corner_label_col || ""}</span>
  `;
  headRow.appendChild(corner);

  kmap.cols.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  kmap.rows.forEach((rowLabel, i) => {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = rowLabel;
    tr.appendChild(th);

    kmap.grid[i].forEach(val => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
  container.appendChild(wrapper);
}

// ================================
// TRUTH TABLE RENDERER
// ================================
function renderTruthTable(variables, tableData) {
  const container = document.getElementById("tableResult");
  if (!container) return;

  const wrapper = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = "Tabel Kebenaran:";
  wrapper.appendChild(heading);

  const table = document.createElement("table");
  table.id = "truthTable";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  variables.forEach(v => {
    const th = document.createElement("th");
    th.textContent = v;
    headRow.appendChild(th);
  });
  const thResult = document.createElement("th");
  thResult.textContent = "Hasil";
  headRow.appendChild(thResult);
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  tableData.forEach(([inputs, output]) => {
    const row = document.createElement("tr");
    variables.forEach(v => {
      const td = document.createElement("td");
      td.textContent = inputs[v] ? "1" : "0";
      row.appendChild(td);
    });
    const tdOutput = document.createElement("td");
    tdOutput.textContent = output ? "1" : "0";
    row.appendChild(tdOutput);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  wrapper.appendChild(table);
  container.innerHTML = "";
  container.appendChild(wrapper);
}

// ================================
// EXPORT CSV
// ================================
function exportToCSV() {
  const table = document.getElementById("truthTable");
  if (!table) return;

  const csv = Array.from(table.rows).map(row =>
    Array.from(row.cells).map(cell => `"${cell.innerText}"`).join(",")
  );
  const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "tabel_kebenaran.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ================================
// LOGIC BUTTONS
// ================================
function setupLogicButtons() {
  const input = document.getElementById("expression");
  const buttons = document.querySelectorAll(".logic-button, .logic-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const symbol = btn.dataset.symbol || btn.innerText.trim();
      insertAtCursor(input, symbol);
    });
  });
}

function insertAtCursor(input, text) {
  if (!input) return;
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const before = input.value.substring(0, start);
  const after = input.value.substring(end);
  input.value = before + text + after;
  const newPos = start + text.length;
  input.setSelectionRange(newPos, newPos);
  input.focus();
}

function focusInput() {
  document.getElementById("expression")?.focus();
}

function clearInput() {
  const input = document.getElementById("expression");
  if (input) input.value = "";

  // Reset teks hasil
  document.getElementById("result").textContent = "–";
  document.getElementById("explanation").textContent = "–";
  document.getElementById("duration").textContent = "–";

  // Bersihkan container visual
  document.getElementById("kmapContainer").innerHTML = "";
  document.getElementById("tableResult").innerHTML = "";

  // Bersihkan error
  document.getElementById("inputError").classList.add("hidden");

  // Sembunyikan export & minterm
  document.querySelector(".export-container")?.classList.add("hidden");
  document.getElementById("mintermResult")?.classList.add("hidden");

  // Sembunyikan detail thread
  document.getElementById("detailContainer")?.classList.add("hidden");
  document.getElementById("toggleDetailBtn")?.classList.add("hidden");

  // Tambahan PENTING: Bersihkan Quine–McCluskey output
  const primeImplicantsContainer = document.getElementById("primeImplicantsResult");
  if (primeImplicantsContainer) {
    primeImplicantsContainer.innerHTML = "";
    primeImplicantsContainer.classList.add("hidden");
  }

  focusInput();
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && getCurrentPage() === "calculatorPage") {
    optimize();
  }
});


// === Support Page Script ===
function setupFileUpload() {
  const dropArea = document.querySelector(".file-drop-area");
  const fileInput = document.getElementById("file");
  const fileMsg = dropArea.querySelector(".file-msg");
  const previewContainer = dropArea.querySelector(".file-preview");

  if (!dropArea || !fileInput) return;

  dropArea.addEventListener("click", (e) => {
    if (e.target !== fileInput) {
      fileInput.click();
    }
  });

  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("highlight");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("highlight");
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("highlight");

    const files = e.dataTransfer.files;
    if (files.length) {
      fileInput.files = files;
      updateFileMsg(files[0]);
      renderPreview(files[0]);
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      updateFileMsg(fileInput.files[0]);
      renderPreview(fileInput.files[0]);
    }
  });

  function updateFileMsg(file) {
    fileMsg.textContent = `File terpilih: ${file.name}`;
  }

  function renderPreview(file) {
    previewContainer.innerHTML = ""; // Bersihkan preview dulu

    const fileType = file.type;

    if (fileType.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      img.style.maxWidth = "120px";
      img.style.maxHeight = "120px";
      img.onload = () => URL.revokeObjectURL(img.src); // bersihkan memori
      previewContainer.appendChild(img);
    } else {
      // PDF atau lainnya
      const icon = document.createElement("div");
      icon.textContent = `📄 ${file.name}`;
      icon.style.fontSize = "0.85rem";
      icon.style.marginTop = "10px";
      previewContainer.appendChild(icon);
    }
  }
}

// === Feedback Page Script ===
function setupFeedbackPage() {
  const emojiButtons = document.querySelectorAll(".emoji-button");
  const caption = document.getElementById("emojiCaption");
  const commentBox = document.getElementById("feedbackComment");
  const submitBtn = document.querySelector(".submit-feedback-btn");

  const feelingLabels = {
    terrible: "Terrible",
    bad: "Bad",
    medium: "Medium",
    good: "Good",
    excellent: "Excellent"
  };

  function updateCaptionPosition(selected) {
    const parent = selected.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const btnRect = selected.getBoundingClientRect();
    const centerX = btnRect.left + btnRect.width / 2 - parentRect.left;

    caption.style.left = `${centerX}px`;
    caption.textContent = feelingLabels[selected.dataset.value] || "";
    caption.style.display = "block"; // ✅ Tampilkan hanya setelah diklik
  }

  emojiButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      emojiButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      updateCaptionPosition(btn);
    });
  });

  submitBtn.addEventListener("click", () => {
    const selected = document.querySelector(".emoji-button.selected");
    const feeling = selected?.dataset.value || "";
    const comment = commentBox.value.trim();

    if (!feeling) {
      alert("Please select how you're feeling.");
      return;
    }

    console.log("Feedback sent:", { feeling, comment });
    alert("Thank you for your feedback!");

    // Reset
    emojiButtons.forEach((b) => b.classList.remove("selected"));
    caption.textContent = "";
    caption.style.display = "none"; // ✅ Sembunyikan caption lagi
    commentBox.value = "";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupFeedbackPage();
});


// ================================
// HAMBURGER MENU
// ================================
function setupHamburgerMenu() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  navLinks.querySelectorAll("a[data-target]").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("show");
    }
  });
}


// ================================
// COUNTRY–STATE DATA
// ================================
const statesByCountry = {
  "Afghanistan": ["Kabul", "Kandahar", "Herat"],
  "Albania": ["Tirana", "Durrës", "Vlorë"],
  "Algeria": ["Algiers", "Oran", "Constantine"],
  "Andorra": ["Andorra la Vella"],
  "Angola": ["Luanda", "Benguela", "Huambo"],
  "Argentina": ["Buenos Aires", "Córdoba", "Mendoza"],
  "Armenia": ["Yerevan", "Gyumri"],
  "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia", "Tasmania"],
  "Austria": ["Vienna", "Salzburg", "Tyrol"],
  "Azerbaijan": ["Baku", "Ganja"],
  "Bahamas": ["Nassau", "Freeport"],
  "Bahrain": ["Capital", "Muharraq"],
  "Bangladesh": ["Dhaka", "Chittagong"],
  "Belarus": ["Minsk", "Brest", "Gomel"],
  "Belgium": ["Brussels", "Flanders", "Wallonia"],
  "Belize": ["Belize District", "Cayo"],
  "Benin": ["Cotonou", "Porto-Novo"],
  "Bhutan": ["Thimphu", "Paro"],
  "Bolivia": ["La Paz", "Santa Cruz"],
  "Bosnia and Herzegovina": ["Sarajevo", "Banja Luka"],
  "Botswana": ["Gaborone", "Francistown"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Bahia", "Paraná"],
  "Brunei": ["Brunei-Muara", "Tutong"],
  "Bulgaria": ["Sofia", "Plovdiv"],
  "Burkina Faso": ["Ouagadougou", "Bobo-Dioulasso"],
  "Burundi": ["Bujumbura", "Gitega"],
  "Cambodia": ["Phnom Penh", "Siem Reap"],
  "Cameroon": ["Yaoundé", "Douala"],
  "Canada": ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba"],
  "Chile": ["Santiago Metropolitan", "Valparaíso"],
  "China": ["Beijing", "Shanghai", "Guangdong", "Zhejiang", "Sichuan"],
  "Colombia": ["Bogotá", "Antioquia", "Valle del Cauca"],
  "Costa Rica": ["San José", "Alajuela"],
  "Croatia": ["Zagreb", "Split-Dalmatia"],
  "Cuba": ["Havana", "Santiago de Cuba"],
  "Cyprus": ["Nicosia", "Limassol"],
  "Czech Republic": ["Prague", "South Moravian"],
  "Denmark": ["Capital Region", "Central Denmark"],
  "Dominican Republic": ["Santo Domingo", "Santiago"],
  "Egypt": ["Cairo", "Alexandria", "Giza"],
  "Estonia": ["Harju County", "Tartu County"],
  "Finland": ["Uusimaa", "Pirkanmaa"],
  "France": ["Île-de-France", "Provence-Alpes-Côte d'Azur", "Occitanie"],
  "Germany": ["Bavaria", "Berlin", "North Rhine-Westphalia", "Hesse"],
  "Ghana": ["Greater Accra", "Ashanti"],
  "Greece": ["Attica", "Central Macedonia"],
  "Guatemala": ["Guatemala Department", "Quetzaltenango"],
  "Honduras": ["Francisco Morazán", "Cortés"],
  "Hungary": ["Budapest", "Pest County"],
  "Iceland": ["Capital Region", "Southern Peninsula"],
  "India": ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh"],
  "Indonesia": ["Jakarta", "West Java", "Central Java", "East Java", "Bali"],
  "Iran": ["Tehran", "Isfahan"],
  "Iraq": ["Baghdad", "Basra"],
  "Ireland": ["Dublin", "Cork"],
  "Israel": ["Tel Aviv", "Jerusalem"],
  "Italy": ["Lazio", "Lombardy", "Sicily", "Tuscany"],
  "Jamaica": ["Kingston", "Saint Andrew"],
  "Japan": ["Tokyo", "Osaka", "Hokkaido", "Kyoto"],
  "Jordan": ["Amman", "Irbid"],
  "Kazakhstan": ["Almaty", "Nur-Sultan"],
  "Kenya": ["Nairobi", "Mombasa"],
  "Kuwait": ["Al Asimah", "Hawalli"],
  "Latvia": ["Riga", "Latgale"],
  "Lebanon": ["Beirut", "Mount Lebanon"],
  "Libya": ["Tripoli", "Benghazi"],
  "Lithuania": ["Vilnius", "Kaunas"],
  "Luxembourg": ["Luxembourg City", "Esch-sur-Alzette"],
  "Madagascar": ["Antananarivo", "Toamasina"],
  "Malaysia": ["Kuala Lumpur", "Selangor", "Penang", "Sabah"],
  "Maldives": ["Malé"],
  "Mali": ["Bamako"],
  "Malta": ["Valletta"],
  "Mexico": ["Mexico City", "Jalisco", "Nuevo León", "Puebla"],
  "Moldova": ["Chișinău"],
  "Monaco": ["Monaco"],
  "Mongolia": ["Ulaanbaatar"],
  "Morocco": ["Casablanca", "Marrakesh"],
  "Myanmar": ["Yangon", "Mandalay"],
  "Namibia": ["Windhoek"],
  "Nepal": ["Kathmandu"],
  "Netherlands": ["North Holland", "South Holland", "Utrecht"],
  "New Zealand": ["Auckland", "Wellington", "Canterbury"],
  "Nigeria": ["Lagos", "Abuja", "Kano"],
  "Norway": ["Oslo", "Vestland"],
  "Oman": ["Muscat", "Dhofar"],
  "Pakistan": ["Punjab", "Sindh", "Khyber Pakhtunkhwa"],
  "Panama": ["Panama City"],
  "Paraguay": ["Asunción"],
  "Peru": ["Lima", "Cusco"],
  "Philippines": ["Metro Manila", "Cebu", "Davao"],
  "Poland": ["Masovian", "Lesser Poland"],
  "Portugal": ["Lisbon", "Porto"],
  "Qatar": ["Doha"],
  "Romania": ["Bucharest", "Cluj"],
  "Russia": ["Moscow", "Saint Petersburg", "Siberia"],
  "Rwanda": ["Kigali"],
  "Saudi Arabia": ["Riyadh", "Mecca"],
  "Senegal": ["Dakar"],
  "Serbia": ["Belgrade", "Novi Sad"],
  "Singapore": ["Singapore"],
  "Slovakia": ["Bratislava"],
  "Slovenia": ["Ljubljana"],
  "Somalia": ["Mogadishu"],
  "South Africa": ["Gauteng", "Western Cape", "KwaZulu-Natal"],
  "South Korea": ["Seoul", "Busan"],
  "Spain": ["Madrid", "Catalonia", "Andalusia"],
  "Sri Lanka": ["Colombo", "Kandy"],
  "Sudan": ["Khartoum"],
  "Suriname": ["Paramaribo"],
  "Sweden": ["Stockholm", "Skåne"],
  "Switzerland": ["Zurich", "Geneva"],
  "Syria": ["Damascus", "Aleppo"],
  "Taiwan": ["Taipei", "Kaohsiung"],
  "Tanzania": ["Dar es Salaam", "Dodoma"],
  "Thailand": ["Bangkok", "Chiang Mai"],
  "Togo": ["Lomé"],
  "Tunisia": ["Tunis", "Sfax"],
  "Turkey": ["Istanbul", "Ankara", "Izmir"],
  "Uganda": ["Kampala"],
  "Ukraine": ["Kyiv", "Lviv"],
  "United Arab Emirates": ["Abu Dhabi", "Dubai"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  "United States": ["California", "New York", "Texas", "Florida", "Washington"],
  "Uruguay": ["Montevideo"],
  "Uzbekistan": ["Tashkent"],
  "Vanuatu": ["Port Vila"],
  "Venezuela": ["Caracas"],
  "Vietnam": ["Hanoi", "Ho Chi Minh City"],
  "Yemen": ["Sana'a"],
  "Zambia": ["Lusaka"],
  "Zimbabwe": ["Harare"]
};

// ================================
// SETUP COUNTRY–STATE SELECTOR
// ================================
function setupCountryState() {
  const countrySelect = document.getElementById("country");
  const stateSelect = document.getElementById("state");

  if (!countrySelect || !stateSelect) return;

  countrySelect.addEventListener("change", () => {
    const selectedCountry = countrySelect.value;
    const states = statesByCountry[selectedCountry] || [];

    // Bersihkan isi state dulu
    stateSelect.innerHTML = "";

    if (states.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "No states available";
      stateSelect.appendChild(opt);
    } else {
      states.forEach(state => {
        const opt = document.createElement("option");
        opt.textContent = state;
        stateSelect.appendChild(opt);
      });
    }
  });

  // Trigger sekali agar state muncul di awal
  countrySelect.dispatchEvent(new Event("change"));
}


// ================================
// INIT
// ================================
document.addEventListener("DOMContentLoaded", () => {
  setupIntroLoader();
  setupLandingTransition();
  setupNavigation();
  setupSidebarMenu();
  setupProfileSidebarTabs();
  setupLogicButtons();
  setupHamburgerMenu();
  setupCountryState();
  setupFileUpload();
  setupFeedbackPage();

  document.getElementById("optimizeBtn")?.addEventListener("click", optimize);
  document.getElementById("clearBtn")?.addEventListener("click", clearInput);
  document.getElementById("exportBtn")?.addEventListener("click", exportToCSV);

  const input = document.getElementById("expression");
  input?.addEventListener("input", () => {
    document.getElementById("inputError")?.classList.add("hidden");
  });

  document.getElementById("backButton")?.addEventListener("click", () => window.history.back());

  const hashPage = window.location.hash.replace("#", "");
  if (hashPage) {
    navigateTo(hashPage);
  } else {
    navigateTo("landingPage");
  }
});

