'use client';

import { useInstitution } from '@/app/(admin)/institution-context';
import { StudentsTable } from '@/components/admin/students-table';
import { useParams } from 'next/navigation';
import { DashboardFooter } from '@/components/admin/dashboard-footer';

export default function ClassroomDetailPage() {
    const params = useParams();
    const classroomId = params.classroomId as string;
    const { institutionId } = useInstitution();

    return (
        <div className="space-y-6">
            <StudentsTable institutionId={institutionId!} classroomId={classroomId} />
            <DashboardFooter />
        </div>
    )
}
