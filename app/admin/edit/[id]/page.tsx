import { getCasesData } from "@/lib/googleSheets";
import { EditCasePageClient } from "@/components/admin/EditCasePageClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditCasePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const cases = await getCasesData();
    const repairCase = cases.find(c => c.id === params.id);

    if (!repairCase) {
        notFound();
    }

    return <EditCasePageClient repairCase={repairCase} />;
}
