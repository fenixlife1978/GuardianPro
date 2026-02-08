import { Timestamp } from 'firebase/firestore';

export interface Institution {
  id: string;
  name: string;
  address?: string;
  logoUrl?: string;
  filterMode: 'Blacklist' | 'Whitelist';
  superAdminSuspended: boolean;
}

export interface Classroom {
  id: string;
  institutionId: string;
  name: string;
  capacity?: number;
  published: boolean;
}

export interface Device {
  id: string;
  institutionId: string;
  classroomId: string;
  studentName: string;
  model: string;
  macAddress: string;
  activityLogs?: {
    url: string;
    date: Timestamp;
    duration: number;
  }[];
}

export interface PendingEnrollment {
  id?: string;
  classroomId: string;
  deviceInfo: {
    macAddress: string;
    model: string;
  };
  createdAt: Timestamp; // Should be a server timestamp
}
