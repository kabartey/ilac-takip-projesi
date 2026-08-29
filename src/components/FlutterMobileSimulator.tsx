import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Pill, Clock, CheckCircle2, XCircle, RotateCcw, AlertTriangle, Plus, 
  Calendar, Check, ChevronRight, Bell, Shield, Smartphone, ArrowUpRight,
  TrendingUp, Sparkles, Droplets, Info, Heart
} from 'lucide-react';
import { Medicine, DoseScheduleItem, AdherenceStats } from '../types';

interface FlutterMobileSimulatorProps {
  medicines: Medicine[];
  doseSchedule: DoseScheduleItem[];
  adherenceStats: AdherenceStats;
  onTakeDose: (doseId: string) => void;
  onSkipDose: (doseId: string) => void;
  onSnoozeDose: (doseId: string) => void;
  onOpenAddMedicine: () => void;
  deviceType: 'ios' | 'android';
  onToggleDevice: () => void;
  onSimulateAlarm: (medName: string, time: string) => void;
  simulatedNotification?: { title: string; body: string } | null;
}

export const FlutterMobileSimulator: React.FC<FlutterMobileSimulatorProps> = ({
  medicines,
  doseSchedule,
  adherenceStats,
  onTakeDose,
  onSkipDose,
  onSnoozeDose,
  onOpenAddMedicine,
  deviceType,
  onToggleDevice,
  onSimulateAlarm,
  simulatedNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'cabinet' | 'history' | 'profile'>('today');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'morning' | 'noon' | 'evening' | 'night'>('all');

  const handleTakeWithConfetti = (doseId: string) => {
    onTakeDose(doseId);
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0d9488', '#10b981', '#38bdf8', '#fbbf24'],
      });
    } catch {
      // safe fallback
    }
  };

  const getFormIcon = (form: string) => {
    switch (form) {
      case 'syrup': return '🧴';
      case 'injection': return '💉';
      case 'drops': return '💧';
      case 'inhaler': return '🫁';
      default: return '💊';
    }
  };

  const getFoodLabel = (food: string) => {
    switch (food) {
      case 'after_meal': return 'Tok Karnına';
      case 'before_meal': return 'Aç Karnına';
      case 'with_meal': return 'Yemekle';
      default: return 'Fark Etmez';
    }
  };

  const filteredSchedule = doseSchedule.filter((item) => {
    if (filterPeriod === 'all') return true;
    const hour = parseInt(item.scheduledTime.split(':')[0], 10);
    if (filterPeriod === 'morning') return hour >= 5 && hour < 12;
    if (filterPeriod === 'noon') return hour >= 12 && hour < 17;
    if (filterPeriod === 'evening') return hour >= 17 && hour < 22;
    if (filterPeriod === 'night') return hour >= 22 || hour < 5;
    return true;
  });

  const lowStockCount = medicines.filter((m) => m.stockCount <= m.stockWarningThreshold).length;

  return (
    <div className="flex flex-col items-center">
      {/* Device Toolbar */}
      <div className="flex items-center justify-between w-full max-w-[380px] mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span>Canlı Flutter Simülatörü</span>
          </span>
        </div>
        <button
          id="btn-toggle-device-os"
          onClick={onToggleDevice}
          className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <span>{deviceType === 'ios' ? ' iOS 18 (iPhone)' : '🤖 Android 15 (Material 3)'}</span>
        </button>
      </div>

      {/* Phone Mockup Frame */}
      <div 
        id="flutter-phone-frame"
        className={`relative w-[360px] h-[720px] bg-slate-900 border-4 ${
          deviceType === 'ios' ? 'border-slate-700 rounded-[48px]' : 'border-slate-800 rounded-[36px]'
        } shadow-2xl overflow-hidden flex flex-col select-none ring-1 ring-slate-700/50`}
      >
        {/* Dynamic Island / Notch */}
        {deviceType === 'ios' ? (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-between px-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-2 h-2 rounded-full bg-teal-500/40 animate-pulse" />
          </div>
        ) : (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-40 border border-slate-800" />
        )}

        {/* Status Bar */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-30 bg-slate-950/60 backdrop-blur-md">
          <span>09:41</span>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-mono">5G</span>
            <span>📶</span>
            <span>100% 🔋</span>
          </div>
        </div>

        {/* Push Notification / Alarm Banner Simulation */}
        {simulatedNotification && (
          <div 
            id="simulated-fcm-banner"
            className="absolute top-12 left-3 right-3 z-50 bg-teal-950/95 border border-teal-500/40 shadow-xl rounded-2xl p-3 backdrop-blur-md animate-in slide-in-from-top-4 duration-300"
          >
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-200">{simulatedNotification.title}</span>
                  <span className="text-[9px] text-teal-400 font-mono">Şimdi</span>
                </div>
                <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">{simulatedNotification.body}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 flex flex-col">
          {/* TAB 1: BUGÜN / DOZLAR */}
          {activeTab === 'today' && (
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Bugünün Dozları</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {new Date().toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Günde {doseSchedule.length} planlı ilaç</p>
                </div>
                <button
                  id="btn-flutter-add-medicine"
                  onClick={onOpenAddMedicine}
                  className="p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md shadow-teal-600/30 transition-all flex items-center gap-1 text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ekle</span>
                </button>
              </div>

              {/* Adherence Progress Bar Card */}
              <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800/80 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                    Günlük Uyum Oranı
                  </span>
                  <span className="font-bold font-mono text-teal-400">{adherenceStats.adherencePercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${adherenceStats.adherencePercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                  <span>{adherenceStats.totalTaken} / {adherenceStats.totalScheduled} Alındı</span>
                  <span>🔥 {adherenceStats.streakDays} Gün Seri</span>
                </div>
              </div>

              {/* Time Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'morning', label: 'Sabah' },
                  { id: 'noon', label: 'Öğle' },
                  { id: 'evening', label: 'Akşam' },
                  { id: 'night', label: 'Gece' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterPeriod(tab.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      filterPeriod === tab.id
                        ? 'bg-teal-500 text-white font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dose Cards List */}
              <div className="space-y-2.5">
                {filteredSchedule.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <p>Bu zaman diliminde planlanmış ilaç bulunmuyor.</p>
                  </div>
                ) : (
                  filteredSchedule.map((item) => {
                    const isTaken = item.status === 'taken';
                    const isSkipped = item.status === 'skipped';
                    const isSnoozed = item.status === 'snoozed';

                    return (
                      <div
                        key={item.id}
                        id={`dose-item-${item.id}`}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isTaken
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : isSkipped
                            ? 'bg-rose-950/20 border-rose-500/30 opacity-75'
                            : isSnoozed
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border"
                              style={{ backgroundColor: `${item.color}20`, borderColor: `${item.color}40` }}
                            >
                              <span>{getFormIcon(item.form)}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-sm text-white">{item.medicineName}</h4>
                                {item.stockRemaining <= 5 && (
                                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded font-mono">
                                    Stok: {item.stockRemaining}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span>{item.dosage}</span>
                                <span>•</span>
                                <span className="text-teal-400/90">{getFoodLabel(item.foodRequirement)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-xs font-mono font-bold text-teal-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.scheduledTime}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {isTaken ? '✅ Alındı' : isSkipped ? '❌ Atlandı' : isSnoozed ? '⏳ Ertelendi' : 'Bekliyor'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        {!isTaken && !isSkipped ? (
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <button
                              id={`btn-snooze-${item.id}`}
                              onClick={() => onSnoozeDose(item.id)}
                              className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl flex items-center gap-1 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-400" />
                              <span>15 dk Ertele</span>
                            </button>
                            <div className="flex items-center gap-1.5">
                              <button
                                id={`btn-skip-${item.id}`}
                                onClick={() => onSkipDose(item.id)}
                                className="px-2.5 py-1.5 text-[11px] font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl flex items-center gap-1 transition-colors"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Atla</span>
                              </button>
                              <button
                                id={`btn-take-${item.id}`}
                                onClick={() => handleTakeWithConfetti(item.id)}
                                className="px-3 py-1.5 text-[11px] font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md shadow-teal-600/30 flex items-center gap-1 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>İçildi</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Kayıt saati: {item.takenAt || '09:15'}</span>
                            <button
                              onClick={() => onSnoozeDose(item.id)}
                              className="text-teal-400 hover:underline text-[10px]"
                            >
                              Durumu Değiştir
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Alarm Test Trigger */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Bildirim & Alarm Test Et:</span>
                </div>
                <button
                  id="btn-test-flutter-alarm"
                  onClick={() => onSimulateAlarm('Parol 500mg', '10:00')}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  🔔 Alarmlı Bildirim Çal
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: İLAÇ DOLABI & STOK */}
          {activeTab === 'cabinet' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h2 className="text-lg font-bold text-white">İlaç Dolabı & Stok</h2>
                  <p className="text-xs text-slate-400">{medicines.length} aktif kayıtlı ilaç</p>
                </div>
                <button
                  id="btn-cabinet-add-med"
                  onClick={onOpenAddMedicine}
                  className="p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ekle</span>
                </button>
              </div>

              {/* Low stock alert box */}
              {lowStockCount > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-amber-300">Kritik Stok Uyarısı ({lowStockCount} İlaç)</p>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      Cloud Function otomatik olarak telefonunuza SMS ve bildirim uyarısı gönderir.
                    </p>
                  </div>
                </div>
              )}

              {/* Medicine List */}
              <div className="space-y-2.5">
                {medicines.map((med) => {
                  const isLow = med.stockCount <= med.stockWarningThreshold;
                  return (
                    <div
                      key={med.id}
                      className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border"
                            style={{ backgroundColor: `${med.color}20`, borderColor: `${med.color}40` }}
                          >
                            <span>{getFormIcon(med.form)}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{med.name}</h4>
                            <p className="text-xs text-slate-400">{med.dosage} • {getFoodLabel(med.foodRequirement)}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                          isLow ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {med.stockCount} adet
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-teal-400" />
                          <span>{med.reminderTimes.join(', ')}</span>
                        </div>
                        {isLow ? (
                          <span className="text-[11px] text-amber-400 font-medium">⚠️ Reçete yenile</span>
                        ) : (
                          <span className="text-[11px] text-emerald-400">Yeterli Stok</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: GEÇMİŞ & RAPORLAR */}
          {activeTab === 'history' && (
            <div className="p-4 space-y-4">
              <div className="pt-1">
                <h2 className="text-lg font-bold text-white">İlaç Takip Geçmişi</h2>
                <p className="text-xs text-slate-400">Haftalık ve aylık doz uyum analizleri</p>
              </div>

              {/* Big Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Alınan Doz</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{adherenceStats.totalTaken}</div>
                  <span className="text-[10px] text-slate-500">Toplam {adherenceStats.totalScheduled} dozdan</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Atlanan Doz</span>
                  <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{adherenceStats.totalSkipped}</div>
                  <span className="text-[10px] text-slate-500">Unutulan / İptal</span>
                </div>
              </div>

              {/* Adherence Graph Representation */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Son 7 Günlük Doz Grafiği</span>
                  <span className="text-teal-400 font-mono font-bold">%92 Ortalama</span>
                </div>
                <div className="flex items-end justify-between h-24 pt-4 px-2">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, idx) => {
                    const heights = [80, 100, 60, 100, 100, 90, 100];
                    return (
                      <div key={day} className="flex flex-col items-center gap-1.5">
                        <div className="w-6 bg-slate-950 rounded-t-lg h-20 flex items-end p-0.5">
                          <div 
                            className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t"
                            style={{ height: `${heights[idx]}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Doktorunuza göstermek için PDF formatında çıktı alabilirsiniz.</span>
              </div>
            </div>
          )}

          {/* TAB 4: PROFİL & FIREBASE */}
          {activeTab === 'profile' && (
            <div className="p-4 space-y-4">
              <div className="pt-1">
                <h2 className="text-lg font-bold text-white">Hesap & Ayarlar</h2>
                <p className="text-xs text-slate-400">Firebase Auth & Bildirim Tercihleri</p>
              </div>

              {/* User Card */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-lg">
                  AY
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Aydın Yılmaz</h3>
                  <p className="text-xs text-slate-400">aydinyilmaz@example.com</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1 font-mono">
                    <Shield className="w-3 h-3" /> Firebase Auth Doğrulandı
                  </span>
                </div>
              </div>

              {/* Settings List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Bell className="w-4 h-4 text-teal-400" />
                    <span>Yüksek Öncelikli Alarmlar</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-medium text-[11px]">Açık</span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Smartphone className="w-4 h-4 text-teal-400" />
                    <span>Kritik Stokta SMS Uyarısı</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-medium text-[11px]">Aktif</span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Acil Durum Yakını İletişimi</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">+90 555 *** 1234</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="h-16 bg-slate-950 border-t border-slate-800 flex items-center justify-around px-2 z-30">
          <button
            id="tab-btn-today"
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'today' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Bugün</span>
          </button>

          <button
            id="tab-btn-cabinet"
            onClick={() => setActiveTab('cabinet')}
            className={`flex flex-col items-center gap-1 relative transition-colors ${
              activeTab === 'cabinet' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Pill className="w-5 h-5" />
            <span className="text-[10px] font-semibold">İlaç Dolabı</span>
            {lowStockCount > 0 && (
              <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'history' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Geçmiş</span>
          </button>

          <button
            id="tab-btn-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'profile' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Profil</span>
          </button>
        </div>

        {/* iOS Home Indicator Bar */}
        {deviceType === 'ios' && (
          <div className="h-4 bg-slate-950 flex items-center justify-center pb-1">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
