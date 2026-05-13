export type CaseStatus =
    | '未対応'
    | '電話確認中'
    | '口頭完了'
    | '依頼中'
    | '対応中'
    | '修理完了';

export interface RepairCase {
    id: string; // Composite ID: {sheetId}_{rowIndex}
    sourceSheetId?: string; // (New) Source Spreadsheet ID
    category?: string;      // (New) Sheet Name (e.g. "AirConditioner")
    received_at: string; // (Column N)

    // User defined columns A-J
    store_no: string;      // A: 店舗NO
    store_name: string;    // B: 店舗名
    client_name: string;   // C: 担当者
    phone: string;         // D: 電話番号
    address: string;       // E: 住所
    target_equipment: string; // F: 対象機器
    issue_description: string; // G: 症状
    admin_note: string;    // H: コメント
    model_info: string;    // I: 型式他
    sales_date?: string;   // K: 販売日
    history: string;       // J: 履歴
    attachment_link?: string; // (New) 添付ファイルリンク
    visit_date?: string;      // (New) 訪問日時

    status: CaseStatus;    // K: ステータス (System)
    assignee_name?: string; // L: 作業担当者 (System)

    // Legacy/Optional
    visit_scheduled_at?: string;
    completed_at?: string;
}

export interface Technician {
    id: string; // Will be generated or mapped
    name: string; // 担当者
    company_name: string; // 会社名
    area: string; // エリア
    phone: string; // 連絡先
    email: string; // メールアドレス
    detergent: string; // 洗剤
    machine: string; // 洗浄機
    current_active_cases: number; // Calculated dynamically
    completed_cases?: number; // Calculated dynamically
    requested_cases?: number; // Calculated dynamically
}
