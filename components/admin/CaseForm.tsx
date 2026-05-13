'use client';

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

interface CaseFormData {
    store_no: string;
    store_name: string;
    client_name: string;
    phone: string;
    address: string;
    target_equipment: string;
    model_info: string;
    sales_date?: string;
    issue_description: string;
    admin_note: string;
}

interface CaseFormProps {
    initialData?: Partial<CaseFormData>;
    onSubmit: (data: CaseFormData) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

export function CaseForm({ initialData = {}, onSubmit, onCancel, submitLabel = "保存" }: CaseFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CaseFormData>({
        store_no: initialData.store_no || '',
        store_name: initialData.store_name || '',
        client_name: initialData.client_name || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        target_equipment: initialData.target_equipment || '',
        model_info: initialData.model_info || '',
        sales_date: initialData.sales_date || '',
        issue_description: initialData.issue_description || '',
        admin_note: initialData.admin_note || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">店舗番号</label>
                    <input name="store_no" className="w-full border rounded p-2 text-sm" value={formData.store_no} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">店舗名 <span className="text-red-500">*</span></label>
                    <input name="store_name" required className="w-full border rounded p-2 text-sm" value={formData.store_name} onChange={handleChange} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">担当者名</label>
                    <input name="client_name" className="w-full border rounded p-2 text-sm" value={formData.client_name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">電話番号</label>
                    <input name="phone" className="w-full border rounded p-2 text-sm" value={formData.phone} onChange={handleChange} />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">住所</label>
                <input name="address" className="w-full border rounded p-2 text-sm" value={formData.address} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">対象機器</label>
                    <input name="target_equipment" className="w-full border rounded p-2 text-sm" value={formData.target_equipment} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">型式</label>
                    <input name="model_info" className="w-full border rounded p-2 text-sm" value={formData.model_info} onChange={handleChange} />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">販売日</label>
                <input name="sales_date" className="w-full border rounded p-2 text-sm" placeholder="YYYY/MM/DD 等" value={formData.sales_date || ''} onChange={handleChange} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">故障内容・依頼詳細</label>
                <textarea name="issue_description" rows={4} className="w-full border rounded p-2 text-sm" value={formData.issue_description} onChange={handleChange} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">管理者メモ</label>
                <textarea name="admin_note" rows={2} className="w-full border rounded p-2 text-sm" value={formData.admin_note} onChange={handleChange} />
            </div>

            <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>キャンセル</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
