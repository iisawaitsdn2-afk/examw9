/* Tempel di project Apps Script Anda (file Code.gs), lalu
   Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone
   Salin URL berakhiran /exec ke GAS_URL di gas-bridge.js */
function doPost(e) {
  var out;
  try {
    var req = JSON.parse(e.postData.contents);
    var ALLOWED = ['ping', 'login', 'daftarMapel', 'mulaiUjian', 'kirimJawaban', 'catatPelanggaran',
                   'dataAdmin', 'adminTambah', 'adminUbah', 'adminHapus', 'adminUpload'];
    if (ALLOWED.indexOf(req.fn) < 0) throw new Error('Fungsi tidak diizinkan');
    var data = this[req.fn].apply(null, req.args || []);
    out = { ok: true, data: data };
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
