import React, { useState } from 'react';
import { 
  Database, Server, HardDrive, ShieldCheck, Terminal, 
  Layers, RefreshCw, Send, CheckCircle2, Clock, Smartphone
} from 'lucide-react';
import { Medicine, CloudFunctionLog } from '../types';

interface FirebaseConsoleSimulatorProps {
  medicines: Medicine[];
  logs: CloudFunctionLog[];
  onTriggerManualFunction: () => void;
}

export const FirebaseConsoleSimulator: React.FC<FirebaseConsoleSimulatorProps> = ({
  medicines,
  logs,
  onTriggerManualFunction,
}) => {
  const [activeConsoleTab, setActiveConsoleTab] = useState<'firestore' | 'storage' | 'functions' | 'auth'>('firestore');
  const [selectedDocId, setSelectedDocId] = useState<string>(medicines[0]?.id || '');

  const selectedMed = medicines.find((m) => m.id === selectedDocId) || medicines[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Firebase Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">Firebase Cloud Konsolu</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                CANLI BAĞLI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Proje: meditrack-flutter-prod (europe-west1)</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'firestore', label: 'Cloud Firestore', icon: Database },
            { id: 'functions', label: 'Cloud Functions', icon: Terminal },
            { id: 'storage', label: 'Cloud Storage', icon: HardDrive },
            { id: 'auth', label: 'Firebase Auth', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeConsoleTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`console-tab-${tab.id}`}
                onClick={() => setActiveConsoleTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Console Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-950">
        {/* FIRESTORE TAB */}
        {activeConsoleTab === 'firestore' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className="font-mono text-teal-300">
                📁 users / <span className="text-amber-300">uid_aydinyilmaz</span> / <span className="text-teal-300">medicines</span> / <span className="text-white">{selectedMed?.id || 'doc'}</span>
              </span>
              <span className="text-[11px] text-slate-400">{medicines.length} Doküman</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Document List */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Koleksiyon: medicines
                </div>
                {medicines.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => setSelectedDocId(med.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                      (selectedMed?.id === med.id)
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{med.id}</span>
                    <span className="text-[10px] text-slate-500">{med.name}</span>
                  </button>
                ))}
              </div>

              {/* JSON Document Viewer */}
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span>Doküman JSON Görünümü</span>
                  <span className="text-emerald-400">● Realtime Sync</span>
                </div>
                {selectedMed ? (
                  <pre className="text-slate-300 leading-relaxed">
                    {JSON.stringify(
                      {
                        id: selectedMed.id,
                        userId: "uid_aydinyilmaz",
                        name: selectedMed.name,
                        dosage: selectedMed.dosage,
                        form: selectedMed.form,
                        foodRequirement: selectedMed.foodRequirement,
                        reminderTimes: selectedMed.reminderTimes,
                        stockCount: selectedMed.stockCount,
                        stockWarningThreshold: selectedMed.stockWarningThreshold,
                        isStockLow: selectedMed.stockCount <= selectedMed.stockWarningThreshold,
                        notes: selectedMed.notes || null,
                        colorValue: selectedMed.color,
                        isActive: selectedMed.isActive,
                        createdAt: selectedMed.createdAt,
                      },
                      null,
                      2
                    )}
                  </pre>
                ) : (
                  <p className="text-slate-500">Seçili doküman yok.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CLOUD FUNCTIONS TAB */}
        {activeConsoleTab === 'functions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Cloud Function Tetikleyici & SMS Logları</h4>
                <p className="text-[11px] text-slate-400">Firestore onUpdate & Twilio / Netgsm SMS entegrasyonu</p>
              </div>
              <button
                id="btn-test-cloud-function"
                onClick={onTriggerManualFunction}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Fonksiyonu Manuel Tetikle</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs space-y-2 max-h-72 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-semibold">{log.functionName}</span>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>
                  <div className="text-slate-300 text-xs">{log.details}</div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">200 OK</span>
                    <span className="text-slate-500">Execution time: 142ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STORAGE TAB */}
        {activeConsoleTab === 'storage' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <span className="font-mono text-teal-300">
                gs://meditrack-app.appspot.com/users/uid_aydinyilmaz/medicines/
              </span>
              <span className="text-slate-400 font-mono">2 Görsel Dosyası (JPG)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-xl">
                  💊
                </div>
                <div className="text-xs font-mono">
                  <p className="font-semibold text-slate-200">parol_500mg_box.jpg</p>
                  <p className="text-slate-500 text-[11px]">184 KB • image/jpeg</p>
                  <span className="text-[10px] text-teal-400">Download URL aktif</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-xl">
                  📄
                </div>
                <div className="text-xs font-mono">
                  <p className="font-semibold text-slate-200">recete_agustos_2026.jpg</p>
                  <p className="text-slate-500 text-[11px]">420 KB • image/jpeg</p>
                  <span className="text-[10px] text-teal-400">Download URL aktif</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUTH TAB */}
        {activeConsoleTab === 'auth' && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-xs">
            <h4 className="font-bold text-slate-200">Kimlik Doğrulama Tablosu</h4>
            <div className="space-y-2">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">Aydın Yılmaz</p>
                  <p className="text-slate-400 font-mono text-[11px]">aydinyilmaz37883788@gmail.com</p>
                  <span className="text-[10px] text-slate-500 font-mono">UID: aydin_uid_789102</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full font-mono text-[10px]">
                  Aktif Oturum (JWT)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
