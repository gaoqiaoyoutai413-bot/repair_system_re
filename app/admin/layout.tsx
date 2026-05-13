import { getTechniciansData, getCasesData } from "@/lib/googleSheets";
import { Sidebar } from "@/components/admin/Sidebar";
import Link from "next/link";
import { LayoutDashboard, History } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const technicians = await getTechniciansData();
    const cases = await getCasesData();

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Top Navigation */}
            <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/80 backdrop-blur-md z-50 flex items-center px-6 justify-between">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                        S
                    </div>
                    <span>修理案件管理ダッシュボード</span>
                </div>
                <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link href="/admin" className="flex items-center gap-2 hover:text-primary transition-colors">
                        <LayoutDashboard size={18} />
                        ダッシュボード
                    </Link>
                    <Link href="/admin/history" className="flex items-center gap-2 hover:text-primary transition-colors">
                        <History size={18} />
                        履歴・ログ
                    </Link>
                </nav>
            </header>

            {/* Sidebar & Main Content */}
            <div className="flex pt-16">
                <Sidebar technicians={technicians as any} cases={cases} />
                <main className="flex-1 md:ml-64 p-6 min-h-[calc(100vh-64px)] overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
