'use client';
import {
  doc,
  writeBatch,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Device, PendingEnrollment } from './firestore-types';

interface ConfirmEnrollmentParams {
  firestore: Firestore;
  enrollmentId: string;
  pendingData: PendingEnrollment;
  studentName: string;
  institutionId: string;
}

export async function confirmEnrollment({
  firestore,
  enrollmentId,
  pendingData,
  studentName,
  institutionId,
}: ConfirmEnrollmentParams): Promise<void> {
  const batch = writeBatch(firestore);

  // 1. Define the reference to the document in /pending_enrollments
  const pendingDocRef = doc(firestore, 'pending_enrollments', enrollmentId);

  // 2. Define the reference for the new document in the nested devices subcollection
  const newDeviceRef = doc(
    firestore, 
    'institutions', institutionId, 
    'classrooms', pendingData.classroomId, 
    'devices', enrollmentId
  );

  // 3. Create the new device data object
  const newDeviceData: Omit<Device, 'id'> = {
    studentName: studentName,
    classroomId: pendingData.classroomId,
    institutionId: institutionId,
    macAddress: pendingData.deviceInfo.macAddress,
    model: pendingData.deviceInfo.model,
    // enrolledAt: serverTimestamp(), // This field is not in the new Device type
    // any other fields
  };

  // 4. Add operations to the batch
  batch.set(newDeviceRef, newDeviceData);
  batch.delete(pendingDocRef);

  // 5. Commit the batch
  return batch.commit().catch(async (serverError) => {
    // If the batch fails, it's likely a permissions issue.
    const permissionError = new FirestorePermissionError({
      path: `batch write (devices collection and pending_enrollments)`,
      operation: 'write',
      requestResourceData: { newDevice: newDeviceData, deletedId: enrollmentId },
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the original error to be caught by the caller
    throw serverError;
  });
}
