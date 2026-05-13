const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('--- Debugging Technician Columns ---');

    // Use the Tech Sheet ID
    const SHEET_ID = process.env.GOOGLE_SHEET_ID_TECHNICIANS;
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!SHEET_ID) {
        console.error('❌ GOOGLE_SHEET_ID_TECHNICIANS is missing.');
        return;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: { client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            // Fetch first few columns to see what's where.
            range: 'technicians!A1:J2',
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('No data found.');
            return;
        }

        const headers = rows[0];
        const firstRow = rows[1] || [];

        console.log('\nHeader Mapping:');
        headers.forEach((header, index) => {
            const char = String.fromCharCode(65 + index);
            console.log(`${char} (${index}): ${header}`);
        });

        console.log('\nFirst Row Data:');
        firstRow.forEach((cell, index) => {
            const char = String.fromCharCode(65 + index);
            console.log(`${char} (${index}): ${cell}`);
        });

    } catch (error) {
        console.error('Error fetching sheet:', error.message);
    }
}

main();
