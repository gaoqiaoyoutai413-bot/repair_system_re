'use server';

import { revalidatePath } from "next/cache";

import {
    updateCaseStatusInSheet,
    updateCaseAssigneeInSheet,
    updateVisitDateInSheet,
    createCaseInSheet,
    updateCaseDetailsInSheet,
    deleteCasePermanentlyInSheet
} from "@/lib/googleSheets";

export async function createCase(data: any) {
    console.log(`[Action] Create Case`);
    const result = await createCaseInSheet(data);

    if (!result.success) return { success: false, message: result.message };

    revalidatePath('/admin');
    return { success: true, message: '案件を作成しました' };
}

export async function updateCaseDetails(caseId: string, data: any) {
    console.log(`[Action] Update Case Details: ${caseId}`);
    const result = await updateCaseDetailsInSheet(caseId, data);

    if (!result.success) return { success: false, message: result.message };

    revalidatePath('/admin');
    revalidatePath(`/report/${caseId}`);
    return { success: true, message: '案件情報を更新しました' };
}

export async function assignTechnician(caseId: string, technicianName: string) {
    console.log(`[Action] Assigning Tech: Case ${caseId} -> ${technicianName}`);

    const result = await updateCaseAssigneeInSheet(caseId, technicianName);

    if (!result.success) {
        return { success: false, message: result.message || '割り当てに失敗しました' };
    }

    // 自動的にステータスを「依頼中」に変更
    await updateCaseStatusInSheet(caseId, '依頼中');

    revalidatePath('/admin');
    revalidatePath(`/report/${caseId}`);

    return { success: true, message: '担当者を割り当てました' };
}

export async function updateCaseStatus(caseId: string, newStatus: string) {
    console.log(`[Action] Updating Status: Case ${caseId} -> ${newStatus}`);

    const result = await updateCaseStatusInSheet(caseId, newStatus);

    if (!result.success) {
        return { success: false, message: result.message || '更新に失敗しました' };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/history'); // Since completion moves it here
    revalidatePath(`/report/${caseId}`);

    return { success: true, message: 'ステータスを更新しました' };
}

export async function updateVisitDate(caseId: string, visitDate: string) {
    console.log(`[Action] Update Visit Date: Case ${caseId} -> ${visitDate}`);

    const result = await updateVisitDateInSheet(caseId, visitDate);

    if (!result.success) {
        return { success: false, message: result.message || '保存に失敗しました' };
    }

    // 自動的にステータスを「対応中」に変更
    await updateCaseStatusInSheet(caseId, '対応中');

    revalidatePath('/admin');
    revalidatePath(`/report/${caseId}`);

    return { success: true, message: '訪問予定日時を保存しました' };
}

export async function completeRepair(caseId: string) {
    return await updateCaseStatus(caseId, '修理完了');
}

export async function deleteCasePermanently(caseId: string) {
    const result = await deleteCasePermanentlyInSheet(caseId);

    if (!result.success) {
        return { success: false, message: result.message || '完全削除に失敗しました' };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/history');
    revalidatePath(`/report/${caseId}`);

    return { success: true, message: '案件を完全削除しました' };
}
