// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
  // Google Sheets Web App URL (will be configured after deployment)
  GOOGLE_SHEETS_URL:
    "https://script.google.com/macros/s/AKfycbwWxRK-OmUfZQrF82r4V4_gEY_f0LKXN17oHBlwsIhuY1Qw1HdQs6pFd4qA_2g8llhTyQ/exec",

  // For testing without backend, set this to true
  DEMO_MODE: false,

  // Token-based protection
  // Set to true to enable token protection
  REQUIRE_TOKEN: true,

  // Valid access tokens (add multiple tokens for different users/teams)
  // WARNING: These are visible in the code. For better security, use backend validation
  VALID_TOKENS: [
    "resep2025", // Example: simple token
    "akun-1", // Example: team-specific token
    "akun-2", // Example: role-specific token
    "akun-3", // Example: role-specific token
    "akun-4", // Example: role-specific token
    "akun-5", // Example: role-specific token
  ],

  // Token expiration (optional, in days)
  // Set to 0 to disable expiration
  TOKEN_EXPIRY_DAYS: 0,
};

// ========================================
// MEDICINE ENTRY MANAGEMENT
// ========================================
let medicineCount = 0;

function addMedicineEntry() {
  medicineCount++;
  const container = document.getElementById("medicineContainer");

  const medicineDiv = document.createElement("div");
  medicineDiv.className = "medicine-entry";
  medicineDiv.id = `medicine-${medicineCount}`;

  medicineDiv.innerHTML = `
        <h3>Obat #${medicineCount}</h3>
        ${medicineCount > 1 ? `<button type="button" class="remove-medicine" onclick="removeMedicineEntry(${medicineCount})">❌ Hapus</button>` : ""}

        <div class="form-group">
            <label for="namaObat-${medicineCount}">Nama Obat *</label>
            <input type="text" id="namaObat-${medicineCount}" name="namaObat" required placeholder="Contoh: Paracetamol">
        </div>

        <div class="row">
            <div class="form-group">
                <label for="bentukSediaan-${medicineCount}">Bentuk Sediaan *</label>
                <select id="bentukSediaan-${medicineCount}" name="bentukSediaan" required>
                    <option value="">Pilih...</option>
                    <option value="sirup">Sirup</option>
                    <option value="tablet">Tablet</option>
                    <option value="sirup kering">Sirup Kering</option>
                    <option value="kapsul">Kapsul</option>
                    <option value="kaplet">Kaplet</option>
                    <option value="suspensi">Suspensi</option>
                    <option value="suppositoria">Suppositoria</option>
                    <option value="topikal">Topikal</option>
                    <option value="tetes mata">Tetes Mata</option>
                    <option value="tetes telinga">Tetes Telinga</option>
                    <option value="salep mata">Salep Mata</option>
                    <option value="nebule">Nebule</option>
                    <option value="inhaler">Inhaler/Inhalasi</option>
                </select>
            </div>

            <div class="form-group">
                <label for="dosis-${medicineCount}">Dosis *</label>
                <input type="number" id="dosis-${medicineCount}" name="dosis" required step="0.01" min="0" placeholder="Contoh: 500">
            </div>
        </div>

        <div class="row">
            <div class="form-group">
                <label for="satuanDosis-${medicineCount}">Satuan Dosis *</label>
                <select id="satuanDosis-${medicineCount}" name="satuanDosis" required>
                    <option value="">Pilih...</option>
                    <option value="ml">ml</option>
                    <option value="mg">mg</option>
                    <option value="g">g</option>
                    <option value="mg/ml">mg/ml</option>
                    <option value="mcg">mcg</option>
                    <option value="%">%</option>
                    <option value="IU">IU</option>
                </select>
            </div>

            <div class="form-group">
                <label for="jumlahObat-${medicineCount}">Jumlah Obat *</label>
                <input type="number" id="jumlahObat-${medicineCount}" name="jumlahObat" required min="1" placeholder="Contoh: 10">
            </div>
        </div>

        <div class="row">
            <div class="form-group">
                <label for="satuanObat-${medicineCount}">Satuan Obat *</label>
                <select id="satuanObat-${medicineCount}" name="satuanObat" required>
                    <option value="">Pilih...</option>
                    <option value="botol">Botol</option>
                    <option value="tablet">Tablet</option>
                    <option value="kapsul">Kapsul</option>
                    <option value="tube">Tube</option>
                    <option value="bungkus">Bungkus</option>
                </select>
            </div>

            <div class="form-group">
                <label for="aturanPakai-${medicineCount}">Aturan Pakai *</label>
                <input type="text" id="aturanPakai-${medicineCount}" name="aturanPakai" required placeholder="Contoh: 3x1 sehari">
            </div>
        </div>
    `;

  container.appendChild(medicineDiv);
}

function removeMedicineEntry(id) {
  const element = document.getElementById(`medicine-${id}`);
  if (element) {
    element.remove();
  }
}

// ========================================
// FORM HANDLING
// ========================================
function getCheckboxValue(id) {
  return document.getElementById(id).checked ? "Ada" : "Tidak";
}

function collectFormData() {
  // Get current token for tracking who input the data
  const currentToken = getTokenFromStorage() || "unknown";

  // Collect TABEL 1 data
  const resepData = {
    tanggalResep: document.getElementById("tanggalResep").value,
    noResep: document.getElementById("noResep").value,
    jenisKelamin: document.getElementById("jenisKelamin").value,
    umur: parseInt(document.getElementById("umur").value),
    bbKg: parseInt(document.getElementById("bb").value),
    diagnosa: document.getElementById("diagnosa").value || "",
    identitasDokter: getCheckboxValue("identitasDokter"),
    identitasPasien: getCheckboxValue("identitasPasien"),
    tanggalResepCheck: getCheckboxValue("tanggalResepCheck"),
    noResepCheck: getCheckboxValue("noResepCheck"),
    rCheck: getCheckboxValue("rCheck"),
    praescriptio: getCheckboxValue("praescriptio"),
    signatura: getCheckboxValue("signatura"),
    subscriptio: getCheckboxValue("subscriptio"),
    inputBy: currentToken, // Track who input this data
  };

  // Collect TABEL 2 data (all medicines)
  const obatData = [];
  const medicineEntries = document.querySelectorAll(".medicine-entry");

  medicineEntries.forEach((entry) => {
    const id = entry.id.split("-")[1];
    obatData.push({
      noResep: resepData.noResep,
      namaObat: document.getElementById(`namaObat-${id}`).value,
      bentukSediaan: document.getElementById(`bentukSediaan-${id}`).value,
      dosis: parseFloat(document.getElementById(`dosis-${id}`).value),
      satuanDosis: document.getElementById(`satuanDosis-${id}`).value,
      aturanPakai: document.getElementById(`aturanPakai-${id}`).value,
      jumlahObat: parseInt(document.getElementById(`jumlahObat-${id}`).value),
      satuanObat: document.getElementById(`satuanObat-${id}`).value,
      inputBy: currentToken, // Track who input this data
    });
  });

  return { resepData, obatData };
}

function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alertContainer");
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  alertContainer.innerHTML = "";
  alertContainer.appendChild(alertDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);

  // Scroll to alert at bottom to show it
  alertContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showLoading(show) {
  const loading = document.getElementById("loadingIndicator");
  if (show) {
    loading.classList.add("active");
  } else {
    loading.classList.remove("active");
  }
}

// ========================================
// DATA SUBMISSION
// ========================================
async function submitToGoogleSheets(data) {
  try {
    const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Note: no-cors mode doesn't allow reading the response
    // We assume success if no error is thrown
    return { success: true };
  } catch (error) {
    console.error("Error submitting to Google Sheets:", error);
    throw error;
  }
}

function handleDemoMode(data) {
  console.log("=== DEMO MODE: Data yang akan disimpan ===");
  console.log("TABEL RESEP:", data.resepData);
  console.log("TABEL OBAT:", data.obatData);
  console.log("===========================================");

  // Store in localStorage for demo
  const allData = JSON.parse(localStorage.getItem("resepData") || "[]");
  allData.push({
    timestamp: new Date().toISOString(),
    ...data,
  });
  localStorage.setItem("resepData", JSON.stringify(allData));

  return { success: true, demo: true };
}

// ========================================
// FORM SUBMISSION
// ========================================
document
  .getElementById("resepForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate at least one medicine entry
    if (medicineCount === 0) {
      showAlert("Harap tambahkan minimal 1 obat!", "error");
      return;
    }

    try {
      showLoading(true);

      // Collect all form data
      const formData = collectFormData();

      // Submit data
      let result;
      if (CONFIG.DEMO_MODE) {
        result = handleDemoMode(formData);
      } else {
        result = await submitToGoogleSheets(formData);
      }

      if (result.success) {
        showAlert(
          result.demo
            ? "✅ Data berhasil disimpan (DEMO MODE - lihat console untuk detail)"
            : "✅ Data berhasil disimpan",
          "success",
        );

        // Reset form
        document.getElementById("resepForm").reset();
        document.getElementById("medicineContainer").innerHTML = "";
        medicineCount = 0;
        addMedicineEntry(); // Add one default medicine entry
      } else {
        throw new Error("Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert(
        "❌ Terjadi kesalahan saat menyimpan data: " + error.message,
        "error",
      );
    } finally {
      showLoading(false);
    }
  });

// ========================================
// TOKEN AUTHENTICATION
// ========================================
function getTokenFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return (
    urlParams.get("token") || urlParams.get("key") || urlParams.get("access")
  );
}

function saveTokenToStorage(token) {
  const tokenData = {
    token: token,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem("accessToken", JSON.stringify(tokenData));
}

function getTokenFromStorage() {
  const stored = localStorage.getItem("accessToken");
  if (!stored) return null;

  try {
    const tokenData = JSON.parse(stored);

    // Check if token has expired
    if (CONFIG.TOKEN_EXPIRY_DAYS > 0) {
      const savedDate = new Date(tokenData.savedAt);
      const now = new Date();
      const daysDiff = (now - savedDate) / (1000 * 60 * 60 * 24);

      if (daysDiff > CONFIG.TOKEN_EXPIRY_DAYS) {
        localStorage.removeItem("accessToken");
        return null;
      }
    }

    return tokenData.token;
  } catch (e) {
    return null;
  }
}

function validateToken(token) {
  if (!token) return false;
  return CONFIG.VALID_TOKENS.includes(token);
}

function showAccessDenied() {
  document.body.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 20px;
    ">
      <div style="
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        max-width: 500px;
        text-align: center;
      ">
        <div style="font-size: 60px; margin-bottom: 20px;">🔒</div>
        <h1 style="color: #333; margin-bottom: 10px;">Akses Terbatas</h1>
        <p style="color: #666; margin-bottom: 30px;">
          Anda memerlukan token akses untuk menggunakan form ini.
        </p>

        <div style="
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #ff4757;
          margin-bottom: 20px;
          text-align: left;
        ">
          <strong style="color: #ff4757;">Token tidak valid atau telah kadaluarsa</strong>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
            Silakan hubungi administrator untuk mendapatkan link akses yang valid.
          </p>
        </div>

        <div style="
          background: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: left;
        ">
          <strong style="color: #2196F3;">Format URL yang benar:</strong>
          <code style="
            display: block;
            margin-top: 10px;
            padding: 10px;
            background: #f4f4f4;
            border-radius: 4px;
            font-size: 12px;
            word-break: break-all;
          ">https://your-site.com?token=YOUR_TOKEN</code>

          <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
            atau gunakan: <code>?key=</code> atau <code>?access=</code>
          </p>
        </div>

        <button onclick="window.location.reload()" style="
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        ">
          🔄 Coba Lagi
        </button>
      </div>
    </div>
  `;
}

function checkAccess() {
  // Skip if token not required
  if (!CONFIG.REQUIRE_TOKEN) {
    return true;
  }

  // Check token from URL first
  let token = getTokenFromURL();

  // If token in URL, save it
  if (token) {
    if (validateToken(token)) {
      saveTokenToStorage(token);

      // Clean URL (remove token from address bar for security)
      const url = new URL(window.location);
      url.searchParams.delete("token");
      url.searchParams.delete("key");
      url.searchParams.delete("access");
      window.history.replaceState({}, document.title, url);

      return true;
    }
  }

  // Check token from storage
  token = getTokenFromStorage();
  if (token && validateToken(token)) {
    return true;
  }

  // No valid token found
  return false;
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  // Check access first
  if (!checkAccess()) {
    showAccessDenied();
    return;
  }

  // Add initial medicine entry
  addMedicineEntry();

  // Set today's date as default
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("tanggalResep").value = today;

  // Show demo mode warning
  if (CONFIG.DEMO_MODE) {
    console.log(
      "%c⚠️ DEMO MODE AKTIF",
      "color: orange; font-size: 20px; font-weight: bold;",
    );
    console.log(
      "Data akan disimpan di localStorage. Untuk menyimpan ke Google Sheets:",
    );
    console.log(
      "1. Deploy Google Apps Script (lihat google-sheets-backend.js)",
    );
    console.log("2. Ganti GOOGLE_SHEETS_URL di CONFIG");
    console.log("3. Set DEMO_MODE = false");
  }

  // Show token info
  if (CONFIG.REQUIRE_TOKEN) {
    console.log(
      "%c🔒 TOKEN PROTECTION ENABLED",
      "color: green; font-size: 16px; font-weight: bold;",
    );
    console.log("Access granted with valid token");

    // Show token expiry info
    const tokenData = JSON.parse(localStorage.getItem("accessToken") || "{}");
    if (tokenData.savedAt && CONFIG.TOKEN_EXPIRY_DAYS > 0) {
      const savedDate = new Date(tokenData.savedAt);
      const expiryDate = new Date(
        savedDate.getTime() + CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      );
      console.log(`Token expires on: ${expiryDate.toLocaleDateString()}`);
    }
  }
});

// ========================================
// UTILITY: View stored data (Demo mode)
// ========================================
function viewStoredData() {
  const data = JSON.parse(localStorage.getItem("resepData") || "[]");
  console.table(data);
  return data;
}

// Make it available in console
window.viewStoredData = viewStoredData;
