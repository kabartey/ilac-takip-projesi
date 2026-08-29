# 💊 MediTrack - Flutter & Firebase İlaç Takip Uygulaması

Android ve iOS için hazırlanmış, **Firebase Authentication**, **Cloud Firestore (Offline Cache Destekli)**, **Firebase Storage**, **flutter_local_notifications (Arka Plan Alarmları)** ve **Cloud Functions (Pub/Sub SMS Uyarısı)** içeren tam teşekküllü Flutter projesi.

---

## 📂 Proje Klasör Mimarisi

```text
├── pubspec.yaml                 # Flutter paket bağımlılıkları & SDK ayarları
├── codemagic.yaml               # Codemagic Android & iOS CI/CD derleme pipeline'ı
├── lib/
│   ├── main.dart                # Uygulama başlangıcı, tema, AuthGate & Routes
│   ├── core/
│   │   ├── constants/
│   │   │   └── app_colors.dart  # Slate 900 & Teal 600 renk paleti
│   │   └── services/
│   │       └── firebase_service.dart # Firebase ve Offline Cache başlatıcı
│   ├── models/
│   │   ├── user_model.dart      # Kullanıcı ve hasta yakını modeli (toMap/fromMap)
│   │   ├── medicine_model.dart  # İlaç modeli (toMap/fromMap)
│   │   └── dose_log_model.dart  # Dozaj loglama modeli
│   ├── providers/
│   │   ├── auth_provider.dart   # Firebase Auth durum yönetimi
│   │   └── medicine_provider.dart # İlaç CRUD ve alarm senkronizasyonu
│   ├── services/
│   │   ├── firestore_service.dart # Firestore CRUD ve Transactions
│   │   └── notification_service.dart # Yerel bildirimler ve exact alarm servisi
│   └── screens/
│       ├── auth/
│       │   ├── login_screen.dart    # Kullanıcı giriş ekranı
│       │   └── register_screen.dart # Çift bölümlü kayıt ekranı
│       ├── home/
│       │   └── home_screen.dart     # İlaç listesi ve durum takip ekranı
│       └── medicine/
│           └── add_medicine_screen.dart # Fotoğraflı ve saat seçicili ilaç ekleme
├── android/
│   └── app/src/main/AndroidManifest.xml # Alarm, bildirim ve kamera izinleri
├── ios/
│   └── Runner/Info.plist                # iOS kamera, bildirim ve background modları
└── functions/                           # Firebase Cloud Functions (Node.js/TS)
    ├── package.json
    └── src/index.ts                     # 15 dk Pub/Sub Cron & Twilio SMS modülü
```

---

## 🚀 Kurulum ve Derleme (Codemagic & Yerel Ortam)

### 1. Yerel Ortamda Çalıştırma:
```bash
# 1. Bağımlılıkları yükleyin
flutter pub get

# 2. Emülatör veya cihazda çalıştırın
flutter run
```

### 2. Codemagic ile Derleme (APK / AAB / IPA):
Proje kök dizinindeki `codemagic.yaml` dosyası ile Codemagic üzerinde otomatik olarak:
- **Android Release APK** (`flutter build apk --release`)
- **Android App Bundle (AAB)** (`flutter build appbundle --release`)
- **iOS Release Build** (`flutter build ios --release`)
üretilmektedir.
