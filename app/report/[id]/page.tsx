import { getCasesData } from "@/lib/googleSheets";
import { ReportForm } from "@/components/technician/ReportForm";
import { notFound } from "next/navigation";

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const cases = await getCasesData();
    const repairCase = cases.find(c => c.id === params.id);

    if (!repairCase) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-20">
            <header className="mb-6 text-center">
                <h1 className="text-xl font-bold text-gray-900">案件報告フォーム</h1>
                <p className="text-sm text-gray-500">Repair Progress Management System</p>
            </header>

            <main className="max-w-md mx-auto">
                <ReportForm repairCase={repairCase as any} />
            </main>
        </div>
    );
}
