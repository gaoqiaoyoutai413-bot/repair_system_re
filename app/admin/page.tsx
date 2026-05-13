import { getCasesData, getTechniciansData } from "@/lib/googleSheets";
import { DashboardClient } from "@/components/admin/DashboardClient";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
// Removed CreateCaseModal import


export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const cases = await getCasesData();
    const technicians = await getTechniciansData(); // Needed for assignment modal

    // Filter out "口頭完了" and "修理完了"
    const activeCases = cases.filter(c =>
        c.status !== '口頭完了' && c.status !== '修理完了'
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    案件一覧
                </h1>
                <div className="flex gap-2 items-center">
                    <Button asChild className="gap-2">
                        <Link href="/admin/create">
                            + 新規作成
                        </Link>
                    </Button>
                    <div className="text-sm text-muted-foreground mr-2">
                        未完了件数: {activeCases.length}件
                    </div>
                </div>
            </div>

            <DashboardClient cases={activeCases as any} technicians={technicians as any} />
        </div>
    );
}
