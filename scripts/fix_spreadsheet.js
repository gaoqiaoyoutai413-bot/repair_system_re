const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('--- Fixing Spreadsheet Structure ---');
    const SHEET_ID = process.env.GOOGLE_SHEET_ID_CASES || process.env.GOOGLE_SHEET_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
        console.error('❌ Missing credentials in .env.local');
        return;
    }

    try {
        if (PRIVATE_KEY.includes('\\n')) {
            PRIVATE_KEY = PRIVATE_KEY.split(String.raw`\n`).join('\n');
        }
    } catch (e) {
        console.error('❌ Key cleanup error:', e);
        return;
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
        console.log(`Target Spreadsheet ID: ${SHEET_ID}`);

        // 1. Check if 'technicians' tab exists
        const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
        const tabs = meta.data.sheets.map(s => s.properties.title);

        if (tabs.includes('technicians')) {
            console.log('✅ "technicians" tab already exists.');
        } else {
            console.log('⚠️ "technicians" tab missing. creating it...');
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SHEET_ID,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: 'technicians'
                                }
                            }
                        }
                    ]
                }
            });
            console.log('✅ "technicians" tab created.');

            // 2. Add Headers and Dummy Data
            console.log('📝 Populating "technicians" with initial data...');
            const values = [
                ['ID', 'Name', 'Email', 'Area', 'ActiveCases'],
                ['tech-1', '担当者 A', 'tech1@example.com', '渋谷・新宿', '0'],
                ['tech-2', '担当者 B', 'tech2@example.com', '世田谷・目黒', '0'],
                ['tech-3', '担当者 C', 'tech3@example.com', '港・品川', '0'],
                ['tech-4', '担当者 D', 'tech4@example.com', '渋谷・新宿', '0'],
            ];

            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: 'technicians!A1',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values }
            });
            console.log('✅ Initial technician data added.');
        }

    } catch (error) {
        console.error('❌ Error fixing spreadsheet:', error.message);
        if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
    }
}

main();
