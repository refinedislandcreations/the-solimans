function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const d = e.parameter;

  const proper = (s) =>
    (s || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const cleanPhone = (p) => (p || "").replace(/\D/g, "");

  const now = new Date();

  /* =========================
     ENSURE HEADER EXISTS
  ========================== */

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Date",
      "Name",
      "Email",
      "WhatsApp",
      "Gender",
      "Diet",
      "Allergy",
      "Meals / Day",
      "Weight",
      "Height",
      "Age",
      "Exercise Level",
      "Goal",
      "Meal Choice",
      "Source",
    ]);
  }

  /* =========================
     ADD ROW (CLEAN DATA)
  ========================== */

  sheet.appendRow([
    now,
    proper(d.name),
    (d.email || "").toLowerCase(),
    cleanPhone(d.whatsapp),
    proper(d.gender),
    proper(d.meat),
    proper(d.allergy || "None"),
    d.meals,
    d.weight ? `${d.weight} kg` : "",
    d.height ? `${d.height} cm` : "",
    d.age ? `${d.age} years old` : "",
    proper(d.exercise),
    proper(d.target),
    proper(d.choice),
    proper(d.source),
  ]);

  formatSheet(sheet);

  return ContentService.createTextOutput("success");
}

/* =========================
   BEAUTIFY SHEET
========================= */

function formatSheet(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  const header = sheet.getRange(1, 1, 1, lastCol);

  header
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground("#f3f4f6");

  sheet.setFrozenRows(1);

  // pretty date
  sheet.getRange(2, 1, lastRow).setNumberFormat("d mmmm yyyy hh:mm AM/PM");

  // center some columns
  sheet.getRange(2, 4, lastRow, 1).setHorizontalAlignment("center");
  sheet.getRange(2, 8, lastRow, 4).setHorizontalAlignment("center");

  // fixed widths (stable layout)
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 110);
  sheet.setColumnWidth(6, 160);
  sheet.setColumnWidth(7, 160);
  sheet.setColumnWidth(8, 110);
  sheet.setColumnWidth(9, 110);
  sheet.setColumnWidth(10, 110);
  sheet.setColumnWidth(11, 120);
  sheet.setColumnWidth(12, 220);
  sheet.setColumnWidth(13, 160);
  sheet.setColumnWidth(14, 180);
  sheet.setColumnWidth(15, 160);

  if (lastRow > 1) {
    sheet
      .getRange(2, 1, lastRow - 1, lastCol)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
  }
}
