// This file is for defining TypeScript types based on your Firestore data structure.
// It's a good practice to keep these separate from your component files.

export interface Institution {
    id: string;
    name: string;
    superAdminSuspended: boolean;
}

export interface Classroom {
    id: string;
    institutionId: string;
    name: string;
}

export interface Device {
    id: string;
    studentName: string;
    classroomId: string;
    deviceInfo: {
        macAddress: string;
        model: string;
    };
    enrolledAt?: any; // Should be a server timestamp
    institutionId: string;
}


export interface PendingEnrollment {
  id?: string;
  classroomId: string;
  deviceInfo: {
    macAddress: string;
    model: string;
  };
  createdAt: any; // Should be a server timestamp
}


export interface Message {
    id: string;
    deviceId: string;
    senderId: string;
    messageText: string;
    timestamp: any; // server timestamp
    readConfirmation: boolean;
}
