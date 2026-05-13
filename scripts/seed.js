const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const CASE_ROWS = [
    ['2026-05-10 10:00', 'demo@example.com', '【デモ】洗濯機の異音', 'D101', 'デモ渋谷店', '店舗担当者A', '000-0000-0001', '東京都渋谷区サンプル町1-1-1', '洗濯機', '脱水時に大きな振動音が発生する。排水まわりの確認希望。', 'デモ用テスト案件', 'NA-DEMO-01', '2023-05-20', '', '', '未対応', '', ''],
    ['2026-05-09 11:30', 'demo@example.com', '【デモ】冷蔵庫温度低下不良', 'D102', 'デモ新宿店', '店舗担当者B', '000-0000-0002', '東京都新宿区デモ通り2-8-1', '冷蔵庫', '庫内温度が下がらない。営業前点検を希望。', '電話にて状況ヒアリング中', 'NR-DEMO-02', '2024-08-10', '2026-05-09 11:45 受付内容を確認', '', '電話確認中', '', ''],
    ['2026-05-08 15:00', 'demo@example.com', '【デモ】エアコン水漏れ', 'D103', 'デモ世田谷店', '店舗担当者C', '000-0000-0003', '東京都世田谷区サンプル5-5-5', 'エアコン', '室内機から水漏れ。ドレンまわりの確認希望。', '訪問日程調整済み', 'CS-DEMO-03', '2022-03-15', '[訪問予定] 2026-05-13T14:00', '', '対応中', '株式会社デモメンテ 担当者C', '2026-05-13 14:00'],
    ['2026-05-07 09:20', 'demo@example.com', '【デモ】給湯器エラー', 'D104', 'デモ港店', '店舗担当者D', '000-0000-0004', '東京都港区デモ3-2-1', '給湯器', 'エラーコード表示。再起動後も復旧しない。', '部品在庫確認中', 'GT-DEMO-04', '2021-11-02', '2026-05-07 10:00 担当者へ依頼', '', '依頼中', '株式会社サンプル設備 担当者D', ''],
    ['2026-05-06 13:10', 'demo@example.com', '【デモ】テレビ映像不良', 'D105', 'デモ品川店', '店舗担当者E', '000-0000-0005', '東京都品川区テスト4-4-4', 'テレビ', '映像が断続的に乱れる。入力切替後も改善なし。', '修理完了サンプル', 'TV-DEMO-05', '2020-07-01', '2026-05-08 16:30 修理完了', '', '修理完了', '株式会社デモメンテ 担当者E', '2026-05-08 16:00'],
];

const TECHNICIAN_ROWS = [
    ['渋谷・新宿', '株式会社デモメンテ', '担当者A', 'あり', 'あり', '000-1000-0001', 'tech1@example.com'],
    ['世田谷・目黒', '株式会社デモメンテ', '担当者B', 'あり', 'あり', '000-1000-0002', 'tech2@example.com'],
    ['港・品川', '株式会社サンプル設備', '担当者C', 'なし', 'あり', '000-1000-0003', 'tech3@example.com'],
    ['渋谷・新宿', '株式会社サンプル設備', '担当者D', 'あり', 'なし', '000-1000-0004', 'tech4@example.com'],
];

function normalizePrivateKey(privateKey) {
    if (!privateKey) return privateKey;
    return privateKey.includes('\\n')
        ? privateKey.split(String.raw`\n`).join('\n')
        : privateKey;
}

async function appendRows(sheets, spreadsheetId, range, values) {
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
}

async function main() {
    const sheetIdCases = process.env.GOOGLE_SHEET_ID_CASES || process.env.GOOGLE_SHEET_ID;
    const sheetIdTechnicians = process.env.GOOGLE_SHEET_ID_TECHNICIANS || process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);

    if (!sheetIdCases || !sheetIdTechnicians || !clientEmail || !privateKey) {
        console.error('Missing credentials in .env.local');
        process.exit(1);
    }

    if (!privateKey.startsWith('-----BEGIN ') || !privateKey.includes('PRIVATE KEY-----')) {
        console.error('Invalid GOOGLE_PRIVATE_KEY format.');
        process.exit(1);
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
        await appendRows(sheets, sheetIdCases, 'cases!A:R', CASE_ROWS);
        await appendRows(sheets, sheetIdTechnicians, 'technicians!A:G', TECHNICIAN_ROWS);
        console.log(`Seeded ${CASE_ROWS.length} demo cases and ${TECHNICIAN_ROWS.length} demo technicians.`);
    } catch (error) {
        console.error('Failed to seed demo data:', error.message);
        process.exit(1);
    }
}

main();
