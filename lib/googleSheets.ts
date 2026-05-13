import { google } from 'googleapis';

// 環境変数から認証情報を取得
// 案件管理用ID (Legacy) と担当者管理用ID
const SHEET_ID_CASES = process.env.GOOGLE_SHEET_ID_CASES || process.env.GOOGLE_SHEET_ID;
const SHEET_ID_TECHNICIANS = process.env.GOOGLE_SHEET_ID_TECHNICIANS || process.env.GOOGLE_SHEET_ID;
const DRIVE_FOLDER_ID_CASES = process.env.GOOGLE_DRIVE_FOLDER_ID_CASES;

const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if ((!SHEET_ID_CASES && !DRIVE_FOLDER_ID_CASES) || !SHEET_ID_TECHNICIANS || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.warn('Google Sheets API features may be limited. Check .env.local credentials.');
}

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
    },
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly' // Add Drive Scope
    ],
});

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

import { RepairCase, Technician } from "@/types";

// Portfolio/demo fallback data. These records are intentionally fictitious.
const MOCK_CASES: RepairCase[] = [
    {
        id: '1',
        received_at: '2026-05-10 10:00',
        client_name: '店舗担当者A',
        address: '東京都渋谷区サンプル町1-1-1',
        phone: '000-0000-0001',
        issue_description: '洗濯機の脱水時に大きな振動音が発生する。排水まわりの確認希望。',
        status: '未対応',
        assignee_name: '',
        visit_scheduled_at: '',
        completed_at: '',
        admin_note: 'デモ用テスト案件',
        store_no: 'D101',
        store_name: 'デモ渋谷店',
        target_equipment: '洗濯機',
        model_info: 'NA-DEMO-01',
        sales_date: '2023-05-20',
        history: '',
        attachment_link: '',
        sourceSheetId: 'mock-sheet',
        category: 'Default'
    },
    {
        id: '2',
        received_at: '2026-05-09 11:30',
        client_name: '店舗担当者B',
        address: '東京都新宿区デモ通り2-8-1',
        phone: '000-0000-0002',
        issue_description: '冷蔵庫の庫内温度が下がらない。営業前点検を希望。',
        status: '電話確認中',
        assignee_name: '',
        visit_scheduled_at: '',
        completed_at: '',
        admin_note: '電話にて状況ヒアリング中',
        store_no: 'D102',
        store_name: 'デモ新宿店',
        target_equipment: '冷蔵庫',
        model_info: 'NR-DEMO-02',
        sales_date: '2024-08-10',
        history: '2026-05-09 11:45 受付内容を確認',
        attachment_link: '',
        sourceSheetId: 'mock-sheet',
        category: 'Default'
    },
    {
        id: '3',
        received_at: '2026-05-08 15:00',
        client_name: '店舗担当者C',
        address: '東京都世田谷区サンプル5-5-5',
        phone: '000-0000-0003',
        issue_description: 'エアコンの水漏れ',
        status: '対応中',
        assignee_name: '株式会社デモメンテ 担当者C',
        visit_scheduled_at: '2026-05-13 14:00',
        completed_at: '',
        admin_note: '訪問日程調整済み',
        store_no: 'D103',
        store_name: 'デモ世田谷店',
        target_equipment: 'エアコン',
        model_info: 'CS-DEMO-03',
        sales_date: '2022-03-15',
        history: '[訪問予定] 2026-05-13T14:00',
        attachment_link: '',
        sourceSheetId: 'mock-sheet',
        category: 'Default'
    },
    {
        id: '4',
        received_at: '2026-05-07 09:20',
        client_name: '店舗担当者D',
        address: '東京都港区デモ3-2-1',
        phone: '000-0000-0004',
        issue_description: '給湯器のエラーコード表示。再起動後も復旧しない。',
        status: '依頼中',
        assignee_name: '株式会社サンプル設備 担当者D',
        visit_scheduled_at: '',
        completed_at: '',
        admin_note: '部品在庫確認中',
        store_no: 'D104',
        store_name: 'デモ港店',
        target_equipment: '給湯器',
        model_info: 'GT-DEMO-04',
        sales_date: '2021-11-02',
        history: '2026-05-07 10:00 担当者へ依頼',
        attachment_link: '',
        sourceSheetId: 'mock-sheet',
        category: 'Default'
    },
    {
        id: '5',
        received_at: '2026-05-12 16:40',
        client_name: '店舗担当者E',
        address: '東京都目黒区デモ6-1-2',
        phone: '000-0000-0005',
        issue_description: '食洗機の排水エラー。営業終了後の点検を希望。',
        status: '依頼中',
        assignee_name: '株式会社デモメンテ 担当者A',
        visit_scheduled_at: '',
        completed_at: '',
        admin_note: '担当者へ依頼済み。訪問日時の返答待ち。',
        store_no: 'D105',
        store_name: 'デモ目黒店',
        target_equipment: '食洗機',
        model_info: 'DW-DEMO-05',
        sales_date: '2024-02-18',
        history: '2026-05-12 17:00 担当者Aへ依頼',
        attachment_link: '',
        sourceSheetId: 'mock-sheet',
        category: 'Default'
    },
    {
        id: '6',
        received_at: '2026-05-13 09:15',
        client_name: '店舗担当者F',
        address: '東京都品川区サンプル7-3-8',
        phone: '000-0000-0006',
        issue_description: '業務用レンジの加熱ムラ。ランチ営業後に確認希望。',
        status: '対応中',
        assignee_name: '株式会社デモメンテ 担当者B',
        visit_scheduled_at: '2026-05-14 15:30',
        completed_at: '',
        admin_note: '訪問予定登録済み',
        store_no: 'D106',
        store_name: 'デモ品川店',
        target_equipment: '業務用レンジ',
        model_info: 'MW-DEMO-06',
        sales_date: '2023-12-05',
        history: '[訪問予定] 2026-05-14T15:30',
        attachment_link: '',
        sourceSheetId: 'mock-sheet',
        category: 'Default'
    },
    {
        id: '7',
        received_at: '2026-05-06 13:10',
        client_name: '店舗担当者G',
        address: '東京都品川区テスト4-4-4',
        phone: '000-0000-0007',
        issue_description: 'テレビの映像が断続的に乱れる。入力切替後も改善なし。',
        status: '修理完了',
        assignee_name: '株式会社デモメンテ 担当者E',
        visit_scheduled_at: '2026-05-08 16:00',
        completed_at: '2026-05-08 16:30',
        admin_note: '基板交換にて復旧。履歴ログ表示用の完了サンプル。',
        store_no: 'D107',
        store_name: 'デモ品川駅前店',
        target_equipment: 'テレビ',
        model_info: 'TV-DEMO-07',
        sales_date: '2020-07-01',
        history: '2026-05-08 16:00 訪問\n2026-05-08 16:30 修理完了',
        attachment_link: '',
        sourceSheetId: 'mock-sheet',
        category: 'Default'
    },
    {
        id: '8',
        received_at: '2026-05-05 10:25',
        client_name: '店舗担当者H',
        address: '東京都渋谷区デモ坂2-2-2',
        phone: '000-0000-0008',
        issue_description: '空調リモコンの表示不良。電話確認で復旧手順を案内済み。',
        status: '口頭完了',
        assignee_name: '株式会社デモメンテ 担当者A',
        visit_scheduled_at: '',
        completed_at: '2026-05-05 11:05',
        admin_note: '口頭案内で解決。履歴ログ表示用の完了サンプル。',
        store_no: 'D108',
        store_name: 'デモ渋谷南店',
        target_equipment: '空調リモコン',
        model_info: 'RC-DEMO-08',
        sales_date: '2022-09-12',
        history: '2026-05-05 10:40 電話確認\n2026-05-05 11:05 口頭完了',
        attachment_link: '',
        sourceSheetId: 'mock-sheet',
        category: 'Default'
    },
];

const MOCK_TECHNICIANS: Technician[] = [
    {
        id: 'tech-1',
        name: '担当者A',
        email: 'tech1@example.com',
        area: '渋谷・新宿・目黒',
        current_active_cases: 1,
        company_name: '株式会社デモメンテ',
        phone: '000-1000-0001',
        detergent: 'あり',
        machine: 'あり',
    },
    {
        id: 'tech-2',
        name: '担当者B',
        email: 'tech2@example.com',
        area: '品川・港',
        current_active_cases: 1,
        company_name: '株式会社デモメンテ',
        phone: '000-1000-0002',
        detergent: 'あり',
        machine: 'あり',
    },
    {
        id: 'tech-3',
        name: '担当者C',
        email: 'tech3@example.com',
        area: '世田谷・目黒',
        current_active_cases: 1,
        company_name: '株式会社デモメンテ',
        phone: '000-1000-0003',
        detergent: 'なし',
        machine: 'あり',
    },
    {
        id: 'tech-4',
        name: '担当者D',
        email: 'tech4@example.com',
        area: '港・品川',
        current_active_cases: 1,
        company_name: '株式会社サンプル設備',
        phone: '000-1000-0004',
        detergent: 'あり',
        machine: 'なし',
    },
    {
        id: 'tech-5',
        name: '担当者E',
        email: 'tech5@example.com',
        area: '品川・大田',
        current_active_cases: 0,
        company_name: '株式会社デモメンテ',
        phone: '000-1000-0005',
        detergent: 'あり',
        machine: 'あり',
    },
    {
        id: 'tech-6',
        name: '担当者F',
        email: 'tech6@example.com',
        area: '新宿・中野',
        current_active_cases: 0,
        company_name: '株式会社サンプル設備',
        phone: '000-1000-0006',
        detergent: 'なし',
        machine: 'あり',
    },
];

// Helper to get list of sheets
async function listCaseSheets() {
    if (DRIVE_FOLDER_ID_CASES) {
        const folderIds = DRIVE_FOLDER_ID_CASES.split(',').map(id => id.trim()).filter(id => id);

        try {
            const folderPromises = folderIds.map(async (folderId) => {
                const res = await drive.files.list({
                    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
                    fields: 'files(id, name)',
                    includeItemsFromAllDrives: true,
                    supportsAllDrives: true,
                });
                return res.data.files || [];
            });

            const results = await Promise.all(folderPromises);
            return results.flat();
        } catch (error) {
            console.error('Error listing drive files:', error);
            // Fallback to single sheet if configured
            if (SHEET_ID_CASES) return [{ id: SHEET_ID_CASES, name: 'Default' }];
            return [];
        }
    }
    // Legacy single sheet mode
    if (SHEET_ID_CASES) {
        return [{ id: SHEET_ID_CASES, name: 'Default' }];
    }
    return [];
}

export async function getCasesData(): Promise<RepairCase[]> {
    const targetSheets = await listCaseSheets();

    if (targetSheets.length === 0) {
        return MOCK_CASES;
    }

    try {
        const allCasesPromises = targetSheets.map(async (sheetFile) => {
            if (!sheetFile.id) return [];

            try {
                // console.log(`Fetching cases from sheet: ${sheetFile.name} (${sheetFile.id})`);
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId: sheetFile.id,
                    range: 'cases!A2:R',
                });

                const rows = response.data.values;
                if (!rows) return [];

                return rows.map((row, index) => {
                    const history = row[13] || '';
                    const attachment_link = row[14] || '';

                    let visitDate = row[17] || '';
                    if (!visitDate) {
                        const visitMatch = history.match(/\[訪問予定\]\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
                        visitDate = visitMatch ? visitMatch[1].replace('T', ' ') : '';
                    }

                    // Composite ID: sheetId + "_" + rowIndex (index + 2 because of header)
                    // Actually, rowIndex in operations usually assumes 1-based index including header? 
                    // Let's stick to 0-based array index for logic, but for ID we need to be careful.
                    // Previous implementation used `String(index)` which was 0-based array index.
                    // Write operations usually add offset.
                    // Let's use `${sheetFile.id}_${index}` as ID.

                    return {
                        received_at: row[0] || '',
                        store_no: row[3] || '',
                        store_name: row[4] || '',
                        client_name: row[5] || '',
                        phone: row[6] || '',
                        address: row[7] || '',
                        target_equipment: row[8] || '',
                        issue_description: row[9] || '',
                        admin_note: row[10] || '',
                        model_info: row[11] || '',
                        sales_date: row[12] || '',
                        history: history,
                        attachment_link: attachment_link,

                        status: (row[15] || '未対応') as any,
                        assignee_name: row[16] || '',

                        id: `${sheetFile.id}_${index}`, // Composite ID
                        sourceSheetId: typeof sheetFile.id === 'string' ? sheetFile.id : undefined,
                        category: sheetFile.name || 'Unknown',

                        visit_scheduled_at: visitDate,
                        visit_date: visitDate,
                        completed_at: ''
                    };
                });
            } catch (err: any) {
                // If the error is about the range, it likely means the 'cases' tab doesn't exist.
                if (err.message && err.message.includes('Unable to parse range')) {
                    console.warn(`Tab 'cases' not found in "${sheetFile.name}". Attempting to fallback to the first sheet.`);

                    try {
                        // Fetch spreadsheet metadata to get the first sheet name
                        const meta = await sheets.spreadsheets.get({
                            spreadsheetId: sheetFile.id,
                            fields: 'sheets.properties.title'
                        });

                        const firstSheetName = meta.data.sheets?.[0]?.properties?.title;

                        if (firstSheetName) {
                            console.log(`Fallback: Fetching from "${firstSheetName}" in "${sheetFile.name}"`);
                            const fallbackResponse = await sheets.spreadsheets.values.get({
                                spreadsheetId: sheetFile.id,
                                range: `'${firstSheetName}'!A2:R`,
                            });

                            const rows = fallbackResponse.data.values;
                            if (!rows) return [];

                            // Process rows identical to main logic
                            return rows.map((row, index) => {
                                const history = row[13] || '';
                                const attachment_link = row[14] || '';

                                let visitDate = row[17] || '';
                                if (!visitDate) {
                                    const visitMatch = history.match(/\[訪問予定\]\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
                                    visitDate = visitMatch ? visitMatch[1].replace('T', ' ') : '';
                                }

                                return {
                                    received_at: row[0] || '',
                                    store_no: row[3] || '',
                                    store_name: row[4] || '',
                                    client_name: row[5] || '',
                                    phone: row[6] || '',
                                    address: row[7] || '',
                                    target_equipment: row[8] || '',
                                    issue_description: row[9] || '',
                                    admin_note: row[10] || '',
                                    model_info: row[11] || '',
                                    sales_date: row[12] || '',
                                    history: history,
                                    attachment_link: attachment_link,

                                    status: (row[15] || '未対応') as any,
                                    assignee_name: row[16] || '',

                                    id: `${sheetFile.id}_${index}`,
                                    sourceSheetId: typeof sheetFile.id === 'string' ? sheetFile.id : undefined,
                                    category: sheetFile.name || 'Unknown',

                                    visit_scheduled_at: visitDate,
                                    visit_date: visitDate,
                                    completed_at: ''
                                };
                            });
                        }
                    } catch (fallbackErr) {
                        console.error(`Fallback failed for "${sheetFile.name}":`, fallbackErr);
                    }
                } else {
                    console.error(`Error fetching sheet "${sheetFile.name}" (${sheetFile.id}):`, err.message || err);
                }
                return [];
            }
        });

        const results = await Promise.all(allCasesPromises);
        return results.flat();

    } catch (error) {
        console.error('Error fetching cases data:', error);
        return [];
    }
}

export async function getTechniciansData() {
    if (!SHEET_ID_TECHNICIANS) {
        return MOCK_TECHNICIANS;
    }

    try {
        console.log(`[getTechniciansData] Fetching with ID: ${SHEET_ID_TECHNICIANS}`);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID_TECHNICIANS,
            range: 'technicians!A2:G', // Up to Column G (Email)
        });

        const rows = response.data.values;
        console.log(`[getTechniciansData] Row count: ${rows ? rows.length : 0}`);
        if (!rows) return [];

        // Columns: 
        // 0: Area (エリア)
        // 1: Company (会社名)
        // 2: Name (担当者)
        // 3: Detergent (洗剤)
        // 4: Machine (洗浄機)
        // 5: Phone (連絡先)
        // 6: Email (メールアドレス)

        return rows.map((row, index) => ({
            id: `tech-${index + 1}`, // Generate ID based on row index since it's missing
            area: row[0] || '',
            company_name: row[1] || '',
            name: row[2] || '',
            detergent: row[3] || '',
            machine: row[4] || '',
            phone: row[5] || '',
            email: row[6] || '',
            current_active_cases: 0 // Placeholder, logic removed from sheet
        }));
    } catch (error) {
        console.error('Error fetching technicians:', error);
        return MOCK_TECHNICIANS;
    }
}

// Function to seed initial dummy data
export async function seedCases() {
    if (!SHEET_ID_CASES) return { success: false, message: 'No Sheet ID configured' };

    try {
        const rows = [
            ['2026-05-10 10:00', 'demo@example.com', '【デモ】洗濯機の異音', 'D101', 'デモ渋谷店', '店舗担当者A', '000-0000-0001', '東京都渋谷区サンプル町1-1-1', '洗濯機', '脱水時に大きな振動音が発生する。', 'デモ用テスト案件', 'NA-DEMO-01', '2023-05-20', '', '', '未対応', '', '']
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID_CASES,
            range: 'cases!A:R',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: rows
            }
        });
        return { success: true, message: 'Seed data added' };
    } catch (error) {
        console.error('Seed error:', error);
        return { success: false, message: 'Failed to seed data' };
    }
}
// Update Status
// Helper to parse Composite ID
async function parseCaseIdAsync(id: string) {
    const lastUnderscoreIndex = id.lastIndexOf('_');
    if (lastUnderscoreIndex !== -1 && lastUnderscoreIndex !== 0) {
        const sheetId = id.substring(0, lastUnderscoreIndex);
        const rowIndex = id.substring(lastUnderscoreIndex + 1);
        return { sheetId, rowIndex: parseInt(rowIndex, 10) };
    }

    // Legacy fallback (assumes SHEET_ID_CASES) or current month sheet fallback
    let fallbackSheetId = SHEET_ID_CASES ? SHEET_ID_CASES : '';

    if (!fallbackSheetId) {
        const sheetsList = await listCaseSheets();
        if (sheetsList.length > 0) {
            const now = new Date();
            const targetName = `Sherpa_Data_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const currentMonthSheet = sheetsList.find(s => s.name === targetName || (s.name && s.name.includes(targetName)));
            fallbackSheetId = currentMonthSheet ? (currentMonthSheet.id || '') : (sheetsList[0].id || '');
        }
    }

    return { sheetId: fallbackSheetId, rowIndex: parseInt(id, 10) };
}

export async function updateCaseStatusInSheet(id: string, newStatus: string) {
    try {
        const { sheetId, rowIndex } = await parseCaseIdAsync(id);
        if (!sheetId) return { success: false, message: 'Target Sheet ID not found for case' };

        const sheetRow = rowIndex + 2;
        const range = `cases!P${sheetRow}`; // Status at P (Index 15)

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: range,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[newStatus]],
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating status:', error);
        return { success: false, message: 'Failed to update status' };
    }
}

export async function updateCaseAssigneeInSheet(id: string, assigneeName: string) {
    try {
        const { sheetId, rowIndex } = await parseCaseIdAsync(id);
        if (!sheetId) return { success: false, message: 'Target Sheet ID not found for case' };

        const sheetRow = rowIndex + 2;
        const range = `cases!Q${sheetRow}`; // Assignee at Q (Index 16)

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: range,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[assigneeName]],
            },
        });
        return { success: true };
    } catch (error: any) {
        const errorDetails = error?.response?.data?.error || error.message || 'Unknown Google API Error';
        console.error('[Google API Error] -> updateCaseAssigneeInSheet Failed:', JSON.stringify(errorDetails, null, 2));
        return { success: false, message: `Failed to update assignee: ${errorDetails.message || errorDetails}` };
    }
}

export async function updateVisitDateInSheet(id: string, visitDate: string) {
    try {
        const { sheetId, rowIndex } = await parseCaseIdAsync(id);
        if (!sheetId) return { success: false, message: 'Target Sheet ID not found for case' };

        const sheetRow = rowIndex + 2;

        // Update Visit Date Column (R)
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `cases!R${sheetRow}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[visitDate]] }
        });

        // Update History Column (N)
        const historyRes = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `cases!N${sheetRow}`
        });
        const currentHistory = historyRes.data.values?.[0]?.[0] || '';
        const visitHistoryLine = `[訪問予定] ${visitDate}`;
        const newHistory = currentHistory ? `${currentHistory}\n${visitHistoryLine}` : visitHistoryLine;

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `cases!N${sheetRow}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[newHistory]] }
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating visit date:', error);
        return { success: false, message: 'Failed to update visit date' };
    }
}



export async function createCaseInSheet(data: any) {
    // Determine Target Sheet
    let targetSheetId = SHEET_ID_CASES;
    if (!targetSheetId) {
        // 現在の年月のファイルを探す (例: Sherpa_Data_2026-02)
        const sheetsList = await listCaseSheets();
        if (sheetsList.length > 0) {
            const now = new Date();
            const targetName = `Sherpa_Data_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const currentMonthSheet = sheetsList.find(s => s.name === targetName || (s.name && s.name.includes(targetName)));

            if (currentMonthSheet && currentMonthSheet.id) {
                targetSheetId = currentMonthSheet.id;
            } else {
                // 該当月のファイルがない場合は、取得できたもののうち一番最初のものを使う
                targetSheetId = sheetsList[0].id || undefined;
                console.warn(`Monthly sheet ${targetName} not found. Falling back to: ${sheetsList[0].name}`);
            }
        }
    }

    if (!targetSheetId) {
        return { success: false, message: 'Google Sheets ID not configured and no folder sheets found' };
    }

    try {
        const values = [
            [
                new Date().toLocaleString('ja-JP'), // A: Received At
                '', // B: Sender
                '', // C: Subject
                data.store_no || '',
                data.store_name || '',
                data.client_name || '',
                data.phone || '',
                data.address || '',
                data.target_equipment || '',
                data.issue_description || '',
                data.admin_note || '',
                data.model_info || '',
                data.sales_date || '', // K: Sales Date
                '', // J: History (Empty initial)
                '', // Attachment Link (Empty)
                '未対応', // K->P (Status)
                '', // L->Q (Assignee)
                ''  // M->R (Visit Date)
            ]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: targetSheetId,
            range: 'cases!A2:R',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: values,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error creating case:', error);
        return { success: false, message: 'Failed to create case' };
    }
}

export async function updateCaseDetailsInSheet(id: string, data: any) {
    try {
        const { sheetId, rowIndex } = await parseCaseIdAsync(id);
        if (!sheetId) throw new Error('Target Sheet ID not found for case');

        const sheetRow = rowIndex + 2;

        const range = `cases!D${sheetRow}:M${sheetRow}`;

        const values = [[
            data.store_no,
            data.store_name,
            data.client_name,
            data.phone,
            data.address,
            data.target_equipment,
            data.issue_description,
            data.admin_note,
            data.model_info,
            data.sales_date
        ]];

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating case details:', error);
        return { success: false, message: 'Failed to update case details' };
    }
}

export async function deleteCasePermanentlyInSheet(id: string) {
    try {
        const { sheetId, rowIndex } = await parseCaseIdAsync(id);
        if (!sheetId) {
            return { success: false, message: 'Target Sheet ID not found for case' };
        }

        const sheetMeta = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
            fields: 'sheets.properties(sheetId,title)'
        });

        const casesTab = sheetMeta.data.sheets?.find(
            s => s.properties?.title === 'cases'
        ) || sheetMeta.data.sheets?.[0];

        const targetGridSheetId = casesTab?.properties?.sheetId;
        if (targetGridSheetId === undefined) {
            return { success: false, message: 'Target tab not found for deletion' };
        }

        const startIndex = rowIndex + 1; // header row is index 0
        const endIndex = startIndex + 1;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: targetGridSheetId,
                                dimension: 'ROWS',
                                startIndex,
                                endIndex
                            }
                        }
                    }
                ]
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting case permanently:', error);
        return { success: false, message: 'Failed to delete case permanently' };
    }
}
