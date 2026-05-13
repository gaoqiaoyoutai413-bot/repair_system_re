'use client';

import { createCase } from "@/lib/actions";
import { CaseForm } from "@/components/admin/CaseForm";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function CreateCasePageClient() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        const result = await createCase(data);
        if (result.success) {
            alert("案件を作成しました");
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
                <h1 className="text-2xl font-bold">新規案件登録</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>案件情報を入力</CardTitle>
                </CardHeader>
                <CardContent>
                    <CaseForm
                        onSubmit={handleSubmit}
                        onCancel={() => router.push('/admin')}
                        submitLabel="登録する"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
