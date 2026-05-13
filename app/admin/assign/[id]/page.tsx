import { getCasesData, getTechniciansData } from "@/lib/googleSheets";
import { AssignTechnicianPageClient } from "@/components/admin/AssignTechnicianPageClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AssignPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const cases = await getCasesData();
    const technicians = await getTechniciansData();

    // Find the case by ID
    // Important: Currently IDs are strings of row index, but some might be strings.
    // getCasesData ensures IDs are strings.
    const repairCase = cases.find(c => c.id === params.id);

    if (!repairCase) {
        notFound();
    }


    // Calculate Stats
    const techniciansWithStats = technicians.map(t => {
        const theirCases = cases.filter(c => c.assignee_name && c.assignee_name.includes(t.name));

        const requested = theirCases.filter(c => c.status === '依頼中').length;
        const active = theirCases.filter(c => c.status === '対応中').length;
        const completed = theirCases.filter(c => c.status === '修理完了' || c.status === '口頭完了').length;

        return {
            ...t,
            current_active_cases: active,
            requested_cases: requested,
            completed_cases: completed
        };
    });

    return (
        <AssignTechnicianPageClient
            repairCase={repairCase}
            technicians={techniciansWithStats}
        />
    );
}
