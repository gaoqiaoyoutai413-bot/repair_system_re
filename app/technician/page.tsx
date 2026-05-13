import { getCasesData, getTechniciansData } from "@/lib/googleSheets";
import { TechnicianDashboardClient } from "@/components/technician/TechnicianDashboardClient";

export const dynamic = 'force-dynamic';

export default async function TechnicianPage() {
    const cases = await getCasesData();
    const technicians = await getTechniciansData();

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20">
            <header className="mb-8 text-center pt-4">
                <h1 className="text-2xl font-bold text-gray-900">案件管理ポータル</h1>
                <p className="text-sm text-gray-500 mt-1">Repair Progress Management System</p>
            </header>

            <main>
                <TechnicianDashboardClient cases={cases} technicians={technicians} />
            </main>
        </div>
    );
}
