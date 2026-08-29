import React, { useState } from 'react';
import { X, Plus, Clock, Pill, AlertTriangle, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Medicine, MedicineForm, FoodRequirement } from '../types';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Omit<Medicine, 'id' | 'createdAt'>) => void;
}

const FORM_OPTIONS: { id: MedicineForm; label: string; icon: string }[] = [
  { id: 'tablet', label: 'Tablet / Hap', icon: '💊' },
  { id: 'capsule', label: 'Kapsül', icon: '💊' },
  { id: 'syrup', label: 'Şurup', icon: '🧴' },
  { id: 'injection', label: 'Enjeksiyon / İğne', icon: '💉' },
  { id: 'drops', label: 'Damla', icon: '💧' },
  { id: 'inhaler', label: 'İnhaler / Fısfıs', icon: '🫁' },
];

const FOOD_OPTIONS: { id: FoodRequirement; label: string; desc: string }[] = [
  { id: 'after_meal', label: 'Tok Karnına', desc: 'Yemekten 30 dk sonra' },
  { id: 'before_meal', label: 'Aç Karnına', desc: 'Yemekten 30 dk önce' },
  { id: 'with_meal', label: 'Yemekle Birlikte', desc: 'Yemek esnasında' },
  { id: 'anytime', label: 'Fark Etmez', desc: 'İstediğiniz zaman' },
];

const PRESET_MEDICINES = [
  { name: 'Parol 500mg', dosage: '1 tablet', form: 'tablet' as MedicineForm, times: ['08:00', '20:00'], food: 'after_meal' as FoodRequirement, stock: 20 },
  { name: 'Glukofen 1000mg', dosage: '1 tablet', form: 'tablet' as MedicineForm, times: ['08:30', '19:30'], food: 'with_meal' as FoodRequirement, stock: 30 },
  { name: 'Ventolin İnhaler', dosage: '2 puf', form: 'inhaler' as MedicineForm, times: ['09:00', '21:00'], food: 'anytime' as FoodRequirement, stock: 120 },
  { name: 'Benexol B12', dosage: '1 tablet', form: 'tablet' as MedicineForm, times: ['09:00'], food: 'after_meal' as FoodRequirement, stock: 30 },
];

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [foodRequirement, setFoodRequirement] = useState<FoodRequirement>('after_meal');
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00', '20:00']);
  const [newTimeInput, setNewTimeInput] = useState('13:00');
  const [stockCount, setStockCount] = useState(20);
  const [stockWarningThreshold, setStockWarningThreshold] = useState(5);
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#0d9488');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  if (!isOpen) return null;

  const handleAddTime = () => {
    if (newTimeInput && !reminderTimes.includes(newTimeInput)) {
      setReminderTimes([...reminderTimes, newTimeInput].sort());
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setReminderTimes(reminderTimes.filter((t) => t !== timeToRemove));
  };

  const handleQuickPreset = (preset: typeof PRESET_MEDICINES[0]) => {
    setName(preset.name);
    setDosage(preset.dosage);
    setForm(preset.form);
    setFoodRequirement(preset.food);
    setReminderTimes(preset.times);
    setStockCount(preset.stock);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      dosage: dosage.trim() || '1 adet',
      form,
      foodRequirement,
      reminderTimes: reminderTimes.length > 0 ? reminderTimes : ['08:00'],
      startDate: new Date().toISOString().split('T')[0],
      stockCount: Number(stockCount) || 10,
      stockWarningThreshold: Number(stockWarningThreshold) || 5,
      photoUrl,
      notes: notes.trim(),
      color,
      isActive: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        id="add-medicine-modal-content"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Yeni İlaç Ekle</h3>
              <p className="text-xs text-slate-400">Firebase Firestore koleksiyonuna yeni kayıt oluşturulur</p>
            </div>
          </div>
          <button
            id="close-add-medicine-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-800/60 bg-slate-950/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              Hızlı Örnek İlaç Şablonları:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pb-2">
            {PRESET_MEDICINES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                id={`preset-btn-${preset.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handleQuickPreset(preset)}
                className="px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-teal-500/20 hover:text-teal-300 hover:border-teal-500/30 border border-slate-700/60 rounded-lg text-slate-300 transition-all flex items-center gap-1.5"
              >
                <span>{preset.name}</span>
                <span className="text-[10px] text-slate-400">({preset.dosage})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* İlaç Adı ve Dozaj */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                İlaç Adı <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-medicine-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Coraspin, Glifor"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dozaj / Miktar
              </label>
              <input
                id="input-medicine-dosage"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Örn: 100 mg, 1 tablet"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* İlaç Formu */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              İlaç Formu
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FORM_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  id={`form-option-${f.id}`}
                  onClick={() => setForm(f.id)}
                  className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                    form === f.id
                      ? 'bg-teal-500/15 border-teal-500 text-teal-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="text-base">{f.icon}</span>
                  <span className="truncate">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Açlık / Tokluk Durumu */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Açlık / Tokluk Durumu
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  id={`food-option-${opt.id}`}
                  onClick={() => setFoodRequirement(opt.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    foodRequirement === opt.id
                      ? 'bg-teal-500/15 border-teal-500 text-teal-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-slate-500">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hatırlatma Saatleri */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hatırlatma Saatleri (Alarm Zamanları)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {reminderTimes.map((time) => (
                <div
                  key={time}
                  className="px-3 py-1.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 text-xs font-mono font-medium flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{time}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(time)}
                    className="hover:text-rose-400 ml-1 text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id="input-reminder-time"
                type="time"
                value={newTimeInput}
                onChange={(e) => setNewTimeInput(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                id="btn-add-reminder-time"
                onClick={handleAddTime}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Saat Ekle
              </button>
            </div>
          </div>

          {/* Stok Takibi */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Stok & Eczane Hatırlatıcı Ayarları</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Mevcut Kutu/Hap Adedi</label>
                <input
                  id="input-stock-count"
                  type="number"
                  min="0"
                  value={stockCount}
                  onChange={(e) => setStockCount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Kritik Stok Uyarısı (Adet)</label>
                <input
                  id="input-stock-warning"
                  type="number"
                  min="1"
                  value={stockWarningThreshold}
                  onChange={(e) => setStockWarningThreshold(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notlar & İlaç Rengi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kullanım Notu (Opsiyonel)
              </label>
              <input
                id="input-medicine-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Örn: Bol su ile içiniz"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kart Vurgu Rengi
              </label>
              <div className="flex items-center gap-2 pt-1">
                {['#0d9488', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              id="btn-cancel-add-medicine"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              id="btn-submit-save-medicine"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>İlacı Firestore'a Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
