const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('--- Verifying Technician Data Fetching ---');

    // Logic from lib/googleSheets.ts
    const SHEET_ID_CASES = process.env.GOOGLE_SHEET_ID_CASES || process.env.GOOGLE_SHEET_ID;
    const SHEET_ID_TECHNICIANS = process.env.GOOGLE_SHEET_ID_TECHNICIANS || process.env.GOOGLE_SHEET_ID;

    console.log(`SHEET_ID_CASES: ${SHEET_ID_CASES}`);
    console.log(`SHEET_ID_TECHNICIANS: ${SHEET_ID_TECHNICIANS}`);

    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

    if (!SHEET_ID_CASES || !CLIENT_EMAIL || !PRIVATE_KEY) {
        console.error('❌ Missing credentials');
        return;
    }

    if (PRIVATE_KEY && PRIVATE_KEY.includes('\\n')) {
        PRIVATE_KEY = PRIVATE_KEY.split(String.raw`\n`).join('\n');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: CLIENT_EMAIL,
            private_key: PRIVATE_KEY,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        console.log('Fetching Technicians...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID_TECHNICIANS,
            range: 'technicians!A2:G',
        });
        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('⚠️ No technicians found. Rows is empty.');
        } else {
            console.log(`✅ Success! Fetched ${rows.length} technicians.`);
            rows.forEach((row, i) => {
                console.log(`  [${i}] ID: ${row[0]}, Name: ${row[1]}, Area: ${row[3]}`);
            });
        }

    } catch (error) {
        console.error('❌ Failed to fetch technicians:', error.message);
        if (error.response) {
            // console.error(JSON.stringify(error.response.data, null, 2));
            if (error.message.includes('Unable to parse range')) {
                console.error('  -> This likely means the "technicians" tab does not exist in the working spreadsheet.');

                try {
                    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID_TECHNICIANS });
                    console.log('  Available Tabs:', meta.data.sheets.map(s => s.properties.title).join(', '));
                } catch (metaError) {
                    console.error('  Failed to list tabs:', metaError.message);
                }
            }
        }
    }
}

main();
