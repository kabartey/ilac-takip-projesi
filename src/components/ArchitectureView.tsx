import React from 'react';
import { 
  Layers, Database, Smartphone, Shield, HardDrive, 
  Terminal, Bell, ArrowRight, CheckCircle, Cpu, Cloud
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-400" />
          <h3 className="font-bold text-slate-100 text-base">
            Flutter + Firebase Modüler Mimari Şeması
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Clean Architecture & Feature-First prensiplerine dayalı katmanlı sistem tasarımı
        </p>
      </div>

      {/* Layer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {/* Layer 1: UI & Presentation */}
        <div className="p-4 bg-slate-950/70 border border-teal-500/30 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl" />
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
            <Smartphone className="w-4 h-4" />
            <span>1. Presentation Layer</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Flutter Material 3 UI ekranları ve yerel alarm servisi.
          </p>
          <ul className="text-[11px] space-y-1 text-slate-300 font-mono pt-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>HomeScreen (Dozlar)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>AddMedicineScreen</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>NotificationService</span>
            </li>
          </ul>
        </div>

        {/* Layer 2: State Management (Provider) */}
        <div className="p-4 bg-slate-950/70 border border-sky-500/30 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/5 rounded-full blur-xl" />
          <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
            <Cpu className="w-4 h-4" />
            <span>2. State Management</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Provider & ChangeNotifier ile reaktif durum yönetimi.
          </p>
          <ul className="text-[11px] space-y-1 text-slate-300 font-mono pt-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>AuthProvider (Session)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>MedicineProvider (CRUD)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>DoseLogProvider (Uyum)</span>
            </li>
          </ul>
        </div>

        {/* Layer 3: Services & Repositories */}
        <div className="p-4 bg-slate-950/70 border border-amber-500/30 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Database className="w-4 h-4" />
            <span>3. Service / Data Layer</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Firebase SDK çağrıları ve yerel önbellek yönetimi.
          </p>
          <ul className="text-[11px] space-y-1 text-slate-300 font-mono pt-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>FirestoreService</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>AuthService</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>StorageService</span>
            </li>
          </ul>
        </div>

        {/* Layer 4: Firebase Cloud Services */}
        <div className="p-4 bg-slate-950/70 border border-rose-500/30 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl" />
          <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
            <Cloud className="w-4 h-4" />
            <span>4. Firebase Backend</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Gerçek zamanlı bulut altyapısı ve otomatik SMS servisi.
          </p>
          <ul className="text-[11px] space-y-1 text-slate-300 font-mono pt-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Cloud Firestore (NoSQL)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Cloud Functions & SMS</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Firebase Storage</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Workflow Step-by-Step Flow */}
      <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          🔄 Örnek İşlem Akışı: Doz İçildi Olarak İşaretlendiğinde
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-teal-400 font-bold">ADIM 1</span>
            <p className="font-semibold text-slate-200">UI Tıklaması</p>
            <p className="text-[11px] text-slate-400">Kullanıcı "İçildi" butonuna basar.</p>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-sky-400 font-bold">ADIM 2</span>
            <p className="font-semibold text-slate-200">Provider & Transaction</p>
            <p className="text-[11px] text-slate-400">Firestore'da stok 1 azaltılır, DozLog yazılır.</p>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-amber-400 font-bold">ADIM 3</span>
            <p className="font-semibold text-slate-200">Cloud Function Tetik</p>
            <p className="text-[11px] text-slate-400">Stok kritik seviyenin altına indiyse SMS tetiklenir.</p>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">ADIM 4</span>
            <p className="font-semibold text-slate-200">Reaktif Ekran Güncellemesi</p>
            <p className="text-[11px] text-slate-400">Stream dinleyicisi tüm ekranları anında günceller.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
