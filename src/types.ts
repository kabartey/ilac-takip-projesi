export type MedicineForm = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'drops' | 'inhaler' | 'cream';

export type FoodRequirement = 'before_meal' | 'after_meal' | 'with_meal' | 'empty_stomach' | 'anytime';

export type DoseStatus = 'pending' | 'taken' | 'skipped' | 'snoozed';

export interface Medicine {
  id: string;
  name: string;
  dosage: string; // e.g. "500 mg", "1 ölçek", "2 puf"
  form: MedicineForm;
  foodRequirement: FoodRequirement;
  reminderTimes: string[]; // ["08:00", "20:00"]
  startDate: string;
  endDate?: string;
  stockCount: number; // Current quantity
  stockWarningThreshold: number; // Alert when stock <= threshold
  photoUrl?: string;
  notes?: string;
  color: string; // Hex color or tag for UI
  createdAt: string;
  isActive: boolean;
}

export interface DoseScheduleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  form: MedicineForm;
  foodRequirement: FoodRequirement;
  scheduledTime: string; // "08:00"
  status: DoseStatus;
  takenAt?: string;
  photoUrl?: string;
  color: string;
  stockRemaining: number;
}

export interface AdherenceStats {
  totalScheduled: number;
  totalTaken: number;
  totalSkipped: number;
  totalPending: number;
  streakDays: number;
  adherencePercentage: number;
}

export interface DartCodeFile {
  filePath: string;
  fileName: string;
  module: number;
  moduleName: string;
  description: string;
  code: string;
  highlights: string[];
}

export interface FirestoreDocumentSimulator {
  collection: string;
  docId: string;
  data: Record<string, any>;
  updatedAt: string;
}

export interface CloudFunctionLog {
  id: string;
  timestamp: string;
  functionName: string;
  event: string;
  status: 'info' | 'success' | 'warning' | 'error';
  details: string;
}
