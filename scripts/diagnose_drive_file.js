const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('--- Diagnosing Technician Master File ---');

    const SHEET_ID = process.env.GOOGLE_SHEET_ID_TECHNICIANS;
    const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    let PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
        console.error('❌ Missing credentials or Sheet ID in .env.local');
        return;
    }

    if (PRIVATE_KEY && PRIVATE_KEY.includes('\\n')) {
        PRIVATE_KEY = PRIVATE_KEY.split(String.raw`\n`).join('\n');
    }

    console.log(`Target File ID: ${SHEET_ID}`);
    console.log(`Service Account: ${CLIENT_EMAIL}`);

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: CLIENT_EMAIL,
            private_key: PRIVATE_KEY,
        },
        scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/spreadsheets'],
    });

    const drive = google.drive({ version: 'v3', auth });

    try {
        console.log('Attempting to fetch file metadata...');
        const fileMetadata = await drive.files.get({
            fileId: SHEET_ID,
            fields: 'id, name, mimeType, owners, capabilities, explicitlyTrashed',
        });

        const file = fileMetadata.data;
        console.log('✅ File Found!');
        console.log(`   Name: ${file.name}`);
        console.log(`   MimeType: ${file.mimeType}`);
        console.log(`   Trashed: ${file.explicitlyTrashed}`);
        console.log(`   Can Read: ${file.capabilities.canRead}`);
        console.log(`   Can Edit: ${file.capabilities.canEdit}`);

        if (file.mimeType !== 'application/vnd.google-apps.spreadsheet') {
            console.error('\n⚠️ CRITICAL WARNING:');
            console.error(`   This file is NOT a Google Sheet. It is: ${file.mimeType}`);
            console.error('   The "operation is not supported" error specifically happens when trying to use Sheets API on non-Sheet files (like .xlsx uploaded to Drive).');
            console.error('   SOLUTION: Open the file in Google Drive, go to File > Save as Google Sheets, and use the ID of the NEW file.');
        } else {
            console.log('\nINFO: File type looks correct for Sheets API.');
        }

    } catch (error) {
        console.error('❌ Failed to access file:', error.message);
        if (error.code === 403) {
            console.error('   -> Permission denied. Share the file with the service account email above.');
        } else if (error.code === 404) {
            console.error('   -> File not found. Check the ID.');
        }
    }
}

main();
