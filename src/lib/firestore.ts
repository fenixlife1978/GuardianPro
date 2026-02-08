'use client';
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Firestore,
  writeBatch,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface PendingEnrollment {
  id?: string;
  classroomId: string;
  deviceInfo: {
    macAddress: string;
    model: string;
  };
  createdAt: any; // Should be a server timestamp
}

export interface Device {
    id?: string;
    studentName: string;
    classroomId: string;
    deviceInfo: {
        macAddress: string;
        model: string;
    },
    enrolledAt: any; // Should be a server timestamp
    institutionId: string;
}

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

  // 2. Define the reference for the new document in /devices
  const newDeviceRef = doc(firestore, 'devices', enrollmentId); // Use same ID for simplicity

  // 3. Create the new device data object
  const newDeviceData: Device = {
    ...pendingData,
    studentName: studentName,
    institutionId: institutionId,
    enrolledAt: serverTimestamp(),
  };

  // 4. Add operations to the batch
  batch.set(newDeviceRef, newDeviceData);
  batch.delete(pendingDocRef);

  // 5. Commit the batch
  return batch.commit().catch(async (serverError) => {
      // If the batch fails, it's likely a permissions issue.
      const permissionError = new FirestorePermissionError({
          path: `batch write (devices/${enrollmentId}, pending_enrollments/${enrollmentId})`,
          operation: 'write',
          requestResourceData: { newDevice: newDeviceData, deletedId: enrollmentId }
      })
      errorEmitter.emit('permission-error', permissionError);
      // Re-throw the original error to be caught by the caller
      throw serverError;
  })
}
