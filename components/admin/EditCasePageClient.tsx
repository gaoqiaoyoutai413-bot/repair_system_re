'use client';

import { updateCaseDetails } from "@/lib/actions";
import { CaseForm } from "@/components/admin/CaseForm";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RepairCase } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function EditCasePageClient({ repairCase }: { repairCase: RepairCase }) {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        const result = await updateCaseDetails(repairCase.id, data);
        if (result.success) {
            alert("案件情報を更新しました");
            router.push('/admin');
        } else {
            alert("エラー: " + result.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/admin">
                        <ArrowLeft size={20} />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">案件情報の編集</h1>
                    <p className="text-sm text-muted-foreground">ID: {repairCase.id}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>編集</CardTitle>
                </CardHeader>
                <CardContent>
                    <CaseForm
                        initialData={repairCase}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push('/admin')}
                        submitLabel="更新する"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
