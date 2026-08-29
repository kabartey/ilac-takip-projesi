import React, { useState } from 'react';
import { 
  Pill, Code2, Smartphone, Database, Layers, Sparkles, Plus, 
  Bell, CheckCircle2, AlertTriangle, ShieldCheck, HeartPulse,
  ExternalLink, Terminal, BookOpen
} from 'lucide-react';
import { Medicine, DoseScheduleItem, AdherenceStats, CloudFunctionLog } from './types';
import { FlutterMobileSimulator } from './components/FlutterMobileSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { FirebaseConsoleSimulator } from './components/FirebaseConsoleSimulator';
import { ArchitectureView } from './components/ArchitectureView';
import { AddMedicineModal } from './components/AddMedicineModal';

// Initial Mock Medicines
const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med_parol_01',
    name: 'Parol 500mg',
    dosage: '1 tablet',
    form: 'tablet',
    foodRequirement: 'after_meal',
    reminderTimes: ['08:00', '20:00'],
    startDate: '2026-08-01',
    stockCount: 16,
    stockWarningThreshold: 5,
    notes: 'Baş ağrısı veya ateş durumunda bol suyla içiniz.',
    color: '#0d9488',
    createdAt: '2026-08-01T08:00:00Z',
    isActive: true,
  },
  {
    id: 'med_glukofen_02',
    name: 'Glukofen 1000mg',
    dosage: '1 tablet',
    form: 'tablet',
    foodRequirement: 'with_meal',
    reminderTimes: ['08:30', '19:30'],
    startDate: '2026-08-10',
    stockCount: 22,
    stockWarningThreshold: 6,
    notes: 'Yemek esnasında alınız.',
    color: '#2563eb',
    createdAt: '2026-08-10T08:30:00Z',
    isActive: true,
  },
  {
    id: 'med_ventolin_03',
    name: 'Ventolin İnhaler',
    dosage: '2 puf',
    form: 'inhaler',
    foodRequirement: 'anytime',
    reminderTimes: ['09:00', '21:00'],
    startDate: '2026-08-15',
    stockCount: 3, // Low stock on purpose to showcase Cloud Function SMS trigger!
    stockWarningThreshold: 5,
    notes: 'Nefes darlığı hissettiğinizde derin soluyunuz.',
    color: '#ea580c',
    createdAt: '2026-08-15T09:00:00Z',
    isActive: true,
  },
  {
    id: 'med_benexol_04',
    name: 'Benexol B12',
    dosage: '1 tablet',
    form: 'tablet',
    foodRequirement: 'after_meal',
    reminderTimes: ['09:00'],
    startDate: '2026-08-20',
    stockCount: 14,
    stockWarningThreshold: 4,
    notes: 'Sabah kahvaltısından sonra alınız.',
    color: '#7c3aed',
    createdAt: '2026-08-20T09:00:00Z',
    isActive: true,
  },
];

const INITIAL_SCHEDULE: DoseScheduleItem[] = [
  {
    id: 'dose_01',
    medicineId: 'med_parol_01',
    medicineName: 'Parol 500mg',
    dosage: '1 tablet',
    form: 'tablet',
    foodRequirement: 'after_meal',
    scheduledTime: '08:00',
    status: 'taken',
    takenAt: '08:14',
    color: '#0d9488',
    stockRemaining: 16,
  },
  {
    id: 'dose_02',
    medicineId: 'med_glukofen_02',
    medicineName: 'Glukofen 1000mg',
    dosage: '1 tablet',
    form: 'tablet',
    foodRequirement: 'with_meal',
    scheduledTime: '08:30',
    status: 'taken',
    takenAt: '08:35',
    color: '#2563eb',
    stockRemaining: 22,
  },
  {
    id: 'dose_03',
    medicineId: 'med_ventolin_03',
    medicineName: 'Ventolin İnhaler',
    dosage: '2 puf',
    form: 'inhaler',
    foodRequirement: 'anytime',
    scheduledTime: '09:00',
    status: 'pending',
    color: '#ea580c',
    stockRemaining: 3,
  },
  {
    id: 'dose_04',
    medicineId: 'med_benexol_04',
    medicineName: 'Benexol B12',
    dosage: '1 tablet',
    form: 'tablet',
    foodRequirement: 'after_meal',
    scheduledTime: '09:00',
    status: 'pending',
    color: '#7c3aed',
    stockRemaining: 14,
  },
  {
    id: 'dose_05',
    medicineId: 'med_glukofen_02',
    medicineName: 'Glukofen 1000mg',
    dosage: '1 tablet',
    form: 'tablet',
    foodRequirement: 'with_meal',
    scheduledTime: '19:30',
    status: 'pending',
    color: '#2563eb',
    stockRemaining: 22,
  },
  {
    id: 'dose_06',
    medicineId: 'med_parol_01',
    medicineName: 'Parol 500mg',
    dosage: '1 tablet',
    form: 'tablet',
    foodRequirement: 'after_meal',
    scheduledTime: '20:00',
    status: 'pending',
    color: '#0d9488',
    stockRemaining: 16,
  },
];

const INITIAL_LOGS: CloudFunctionLog[] = [
  {
    id: 'log_01',
    timestamp: '09:00:02',
    functionName: 'onMedicineStockLow',
    event: 'firestore.onUpdate',
    status: 'warning',
    details: '⚠️ Ventolin İnhaler stoğu (3) kritik eşik (5) altına indi. SMS kuyruğuna alındı: +90 555 *** 1234',
  },
  {
    id: 'log_02',
    timestamp: '08:35:10',
    functionName: 'onDoseLogged',
    event: 'firestore.onCreate',
    status: 'success',
    details: '✅ Glukofen 1000mg dozu kaydedildi. Stok 23 -> 22 olarak güncellendi.',
  },
  {
    id: 'log_03',
    timestamp: '08:00:00',
    functionName: 'scheduledDoseReminder',
    event: 'pubsub.schedule',
    status: 'info',
    details: '⏰ Sabah 08:00 ilaçları için FCM Push bildirimi dağıtıldı.',
  },
];

export default function App() {
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [doseSchedule, setDoseSchedule] = useState<DoseScheduleItem[]>(INITIAL_SCHEDULE);
  const [logs, setLogs] = useState<CloudFunctionLog[]>(INITIAL_LOGS);
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'split' | 'code' | 'mobile' | 'console' | 'arch'>('split');
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [simulatedNotification, setSimulatedNotification] = useState<{ title: string; body: string } | null>(null);

  // Compute adherence stats
  const totalScheduled = doseSchedule.length;
  const totalTaken = doseSchedule.filter((d) => d.status === 'taken').length;
  const totalSkipped = doseSchedule.filter((d) => d.status === 'skipped').length;
  const totalPending = doseSchedule.filter((d) => d.status === 'pending' || d.status === 'snoozed').length;
  const adherencePercentage = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

  const adherenceStats: AdherenceStats = {
    totalScheduled,
    totalTaken,
    totalSkipped,
    totalPending,
    streakDays: 6,
    adherencePercentage,
  };

  // Actions
  const handleTakeDose = (doseId: string) => {
    setDoseSchedule((prev) =>
      prev.map((item) => {
        if (item.id === doseId) {
          const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          return {
            ...item,
            status: 'taken',
            takenAt: nowStr,
            stockRemaining: Math.max(0, item.stockRemaining - 1),
          };
        }
        return item;
      })
    );

    const doseItem = doseSchedule.find((d) => d.id === doseId);
    if (!doseItem) return;

    // Decrement stock in medicines collection
    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === doseItem.medicineId) {
          const newStock = Math.max(0, med.stockCount - 1);
          
          // Trigger Cloud Function SMS simulator if stock gets critically low
          if (newStock <= med.stockWarningThreshold && med.stockCount > med.stockWarningThreshold) {
            const newLog: CloudFunctionLog = {
              id: 'log_' + Date.now(),
              timestamp: new Date().toLocaleTimeString(),
              functionName: 'onMedicineStockLow',
              event: 'firestore.onUpdate',
              status: 'warning',
              details: `⚠️ [OTOMATİK SMS GÖNDERİLDİ] ${med.name} stoğu ${newStock} adede düştü. Sayın Aydın Yılmaz, eczaneden temin ediniz.`,
            };
            setLogs((l) => [newLog, ...l]);
            triggerNotificationBanner('⚠️ Kritik İlaç Stoğu & SMS Gönderildi', `${med.name} stoğunuz ${newStock} adede indi.`);
          }
          return { ...med, stockCount: newStock };
        }
        return med;
      })
    );

    // Add function log for dose taken
    const logItem: CloudFunctionLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      functionName: 'onDoseLogged',
      event: 'firestore.onCreate',
      status: 'success',
      details: `✅ ${doseItem.medicineName} dozu alındı olarak işaretlendi (Stok güncellendi).`,
    };
    setLogs((prev) => [logItem, ...prev]);
  };

  const handleSkipDose = (doseId: string) => {
    setDoseSchedule((prev) =>
      prev.map((item) => (item.id === doseId ? { ...item, status: 'skipped' } : item))
    );
  };

  const handleSnoozeDose = (doseId: string) => {
    setDoseSchedule((prev) =>
      prev.map((item) => (item.id === doseId ? { ...item, status: 'snoozed' } : item))
    );
    triggerNotificationBanner('⏳ İlaç 15 Dakika Ertelendi', '15 dakika sonra tekrar sesli alarm çalacaktır.');
  };

  const handleSaveMedicine = (newMedData: Omit<Medicine, 'id' | 'createdAt'>) => {
    const newId = 'med_' + Date.now();
    const newMed: Medicine = {
      ...newMedData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setMedicines((prev) => [newMed, ...prev]);

    // Create dose items for today
    const newDoses: DoseScheduleItem[] = newMed.reminderTimes.map((time, idx) => ({
      id: `dose_${newId}_${idx}`,
      medicineId: newId,
      medicineName: newMed.name,
      dosage: newMed.dosage,
      form: newMed.form,
      foodRequirement: newMed.foodRequirement,
      scheduledTime: time,
      status: 'pending',
      color: newMed.color,
      stockRemaining: newMed.stockCount,
    }));

    setDoseSchedule((prev) => [...prev, ...newDoses].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)));

    // Add Cloud Function log
    const logItem: CloudFunctionLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      functionName: 'onMedicineCreated',
      event: 'firestore.onCreate',
      status: 'success',
      details: `💊 Yeni ilaç eklendi: ${newMed.name} (${newMed.dosage}) - ${newMed.reminderTimes.length} alarm kuruldu.`,
    };
    setLogs((prev) => [logItem, ...prev]);

    triggerNotificationBanner('✅ Yeni İlaç Firestore\'a Kaydedildi', `${newMed.name} için yerel alarmlar kuruldu.`);
  };

  const triggerNotificationBanner = (title: string, body: string) => {
    setSimulatedNotification({ title, body });
    setTimeout(() => {
      setSimulatedNotification(null);
    }, 4500);
  };

  const handleTriggerManualFunction = () => {
    const newLog: CloudFunctionLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      functionName: 'manualAlarmTrigger',
      event: 'http.onRequest',
      status: 'success',
      details: '⚡ Cloud Function manuel tetiklendi: Tüm kullanıcılara anlık dozaj eşitlemesi yapıldı.',
    };
    setLogs((prev) => [newLog, ...prev]);
    triggerNotificationBanner('🔔 Cloud Functions Tetiklendi', 'FCM servisi tüm aktif cihazları senkronize etti.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Info */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-teal-400">
                  <Pill className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                    İlaç Takip • Flutter & Firebase
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-mono font-semibold">
                    v1.0 Modüler
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Android & iOS • Provider • Firestore • Auth • Storage • Cloud Functions
                </p>
              </div>
            </div>

            {/* Mobile Add Medicine Button */}
            <button
              id="header-mobile-add-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="md:hidden p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md shadow-teal-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>İlaç Ekle</span>
            </button>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto justify-center overflow-x-auto no-scrollbar">
            <button
              id="view-btn-split"
              onClick={() => setActiveWorkspaceTab('split')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeWorkspaceTab === 'split'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Çift Görünüm</span>
            </button>
            <button
              id="view-btn-mobile"
              onClick={() => setActiveWorkspaceTab('mobile')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeWorkspaceTab === 'mobile'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobil Simülatör</span>
            </button>
            <button
              id="view-btn-code"
              onClick={() => setActiveWorkspaceTab('code')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeWorkspaceTab === 'code'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Dart Kodları</span>
            </button>
            <button
              id="view-btn-console"
              onClick={() => setActiveWorkspaceTab('console')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeWorkspaceTab === 'console'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Firebase Konsol</span>
            </button>
            <button
              id="view-btn-arch"
              onClick={() => setActiveWorkspaceTab('arch')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeWorkspaceTab === 'arch'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Mimari</span>
            </button>
          </div>

          {/* Action button */}
          <div className="hidden md:flex items-center gap-2">
            <button
              id="header-desktop-add-med-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-teal-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni İlaç Ekle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Quick Architecture Banner */}
        <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-sky-950/40 border border-teal-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Modül 1 Başlatıldı: Proje Yapısı, Core & Firebase Altyapısı</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kıdemli Flutter Mimarı olarak tüm modüller ve Dart dosyaları null-safe ve üretime hazır halde yapılandırıldı.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-open-arch-modal"
              onClick={() => setActiveWorkspaceTab('arch')}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mimariyi İncele</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE LAYOUTS */}
        {activeWorkspaceTab === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Phone Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <FlutterMobileSimulator
                medicines={medicines}
                doseSchedule={doseSchedule}
                adherenceStats={adherenceStats}
                onTakeDose={handleTakeDose}
                onSkipDose={handleSkipDose}
                onSnoozeDose={handleSnoozeDose}
                onOpenAddMedicine={() => setIsAddModalOpen(true)}
                deviceType={deviceType}
                onToggleDevice={() => setDeviceType(deviceType === 'ios' ? 'android' : 'ios')}
                onSimulateAlarm={(medName, time) => triggerNotificationBanner(`💊 İlaç Vakti: ${medName}`, `Saat: ${time} • Dozajınızı almayı unutmayınız.`)}
                simulatedNotification={simulatedNotification}
              />
            </div>

            {/* Right: Dart Code Explorer */}
            <div className="lg:col-span-7 h-[760px]">
              <CodeExplorer
                activeModuleId={activeModuleId}
                onSelectModule={(id) => setActiveModuleId(id)}
              />
            </div>
          </div>
        )}

        {activeWorkspaceTab === 'mobile' && (
          <div className="flex justify-center py-4">
            <FlutterMobileSimulator
              medicines={medicines}
              doseSchedule={doseSchedule}
              adherenceStats={adherenceStats}
              onTakeDose={handleTakeDose}
              onSkipDose={handleSkipDose}
              onSnoozeDose={handleSnoozeDose}
              onOpenAddMedicine={() => setIsAddModalOpen(true)}
              deviceType={deviceType}
              onToggleDevice={() => setDeviceType(deviceType === 'ios' ? 'android' : 'ios')}
              onSimulateAlarm={(medName, time) => triggerNotificationBanner(`💊 İlaç Vakti: ${medName}`, `Saat: ${time} • Dozajınızı almayı unutmayınız.`)}
              simulatedNotification={simulatedNotification}
            />
          </div>
        )}

        {activeWorkspaceTab === 'code' && (
          <div className="h-[760px]">
            <CodeExplorer
              activeModuleId={activeModuleId}
              onSelectModule={(id) => setActiveModuleId(id)}
            />
          </div>
        )}

        {activeWorkspaceTab === 'console' && (
          <div className="h-[700px]">
            <FirebaseConsoleSimulator
              medicines={medicines}
              logs={logs}
              onTriggerManualFunction={handleTriggerManualFunction}
            />
          </div>
        )}

        {activeWorkspaceTab === 'arch' && (
          <div>
            <ArchitectureView />
          </div>
        )}
      </main>

      {/* Add Medicine Interactive Modal */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveMedicine}
      />
    </div>
  );
}
