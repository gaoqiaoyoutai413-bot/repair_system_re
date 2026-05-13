import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RepairCase, Technician } from "@/types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Region to Prefecture Mapping
const REGION_MAP: Record<string, string[]> = {
    '北海道': ['北海道'],
    '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
    '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '関西'],
    '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
    '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
};

export function isTechnicianRecommended(repairCase: RepairCase, technician: Technician): boolean {
    if (!technician.area) return false;

    const targetText = (repairCase.address + repairCase.store_name).replace(/\s+/g, '');
    const techArea = technician.area.replace(/\s+/g, '');

    // 1. Direct Match (Area name appears in address/store)
    if (targetText.includes(techArea)) return true;

    // 2. Region Logic
    // If techArea is a Region (e.g., "関東"), check if address contains any prefecture in that region.
    // If techArea contains a Prefecture, check if matched directly (covered by 1).

    // Check if techArea implies a broader region that covers the target address
    for (const [region, prefectures] of Object.entries(REGION_MAP)) {
        if (techArea.includes(region)) {
            // Tech covers this region. Does the address belong to this region?
            if (prefectures.some(pref => targetText.includes(pref))) {
                return true;
            }
        }
    }

    // 3. Reverse Check (Optional but handled by 1 usually)
    // If address has "Tokyo", does tech area have "Kanto"? (Already covered if we check structure right)

    return false;
}
