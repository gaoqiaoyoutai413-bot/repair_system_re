import { getCasesData } from "@/lib/googleSheets";
import { HistoryClient } from "@/components/admin/HistoryClient";

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
    const cases = await getCasesData();

    // Filter for completed cases
    const completedCases = cases.filter(c =>
        c.status === '口頭完了' || c.status === '修理完了'
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    対応履歴・ログ
                </h1>
                <div className="text-sm text-muted-foreground">
                    完了件数: {completedCases.length}件
                </div>
            </div>

            <HistoryClient cases={completedCases as any} />
        </div>
    );
}
