'use client';
import {
  doc,
  writeBatch,
  Firestore,
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

  // 2. Define the reference for the new document in the institution's devices subcollection
  const newDeviceRef = doc(firestore, 'institutions', institutionId, 'devices', enrollmentId);

  // 3. Create the new device data object from the pending data and new info
  const newDeviceData: Omit<Device, 'id' | 'enrolledAt'> = {
    studentName: studentName,
    classroomId: pendingData.classroomId,
    deviceInfo: pendingData.deviceInfo,
    institutionId: institutionId,
    // Add any other fields that should be carried over or initialized
  };


  // 4. Add operations to the batch
  // Using set with merge: false to ensure it's a new document, not an update
  batch.set(newDeviceRef, newDeviceData); 
  batch.delete(pendingDocRef);

  // 5. Commit the batch
  return batch.commit().catch(async (serverError) => {
      // If the batch fails, it's likely a permissions issue.
      const permissionError = new FirestorePermissionError({
          path: `batch write (institutions/${institutionId}/devices/${enrollmentId}, pending_enrollments/${enrollmentId})`,
          operation: 'write',
          requestResourceData: { newDevice: newDeviceData, deletedId: enrollmentId }
      })
      errorEmitter.emit('permission-error', permissionError);
      // Re-throw the original error to be caught by the caller
      throw serverError;
  })
}
