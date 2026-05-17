/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Google Apps Script function to fetch data from the "Appointment" sheet.
 * Deploy this as a Web App to use with the dashboard.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function getDataFromSheet() {
  const SPREADSHEET_ID = ""; // Leave blank for the bonded spreadsheet
  const SHEET_NAME = "Appointment";
  
  try {
    const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found.`);
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return []; // Safe empty dataset
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const jsonData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        let val = row[index];
        // Ensure consistent string/numeric return and handle Date objects
        if (val instanceof Date) {
          obj[header] = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
        } else {
          obj[header] = val !== null && val !== undefined ? String(val) : "";
        }
      });
      return obj;
    });
    
    return jsonData;
  } catch (e) {
    console.error("Error in getDataFromSheet:", e.message, e.stack);
    return { error: e.message };
  }
}
