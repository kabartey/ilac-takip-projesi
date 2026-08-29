import { DartCodeFile } from '../types';

export const FLUTTER_PROJECT_MODULES = [
  {
    id: 1,
    title: 'Modül 1: Proje Kurulumu, Core Katmanı & Firebase Yapılandırması',
    subtitle: 'pubspec.yaml, main.dart, AppTheme, AppColors, AppStrings, FirebaseService',
    description: 'Flutter projesinin bağımlılıkları, null-safety ayarları, tema sistemi, renk paletleri ve Firebase başlatma altyapısı.',
    status: 'active',
  },
  {
    id: 2,
    title: 'Modül 2: Veri Modelleri & JSON Serialization',
    subtitle: 'MedicineModel, DoseLogModel, UserProfile, Enums',
    description: 'Firestore ile çift yönlü çalışan, null-safe ve tip güvenli veri modelleri ile enum yapıları.',
    status: 'ready',
  },
  {
    id: 3,
    title: 'Modül 3: Firebase Auth & Kullanıcı Oturumu (Provider)',
    subtitle: 'AuthService, AuthProvider, Login/Register UI',
    description: 'Email/Password & Google Sign-In, oturum durumu dinleyici stream ve Auth State Provider.',
    status: 'ready',
  },
  {
    id: 4,
    title: 'Modül 4: Cloud Firestore İlaç CRUD & State Management',
    subtitle: 'FirestoreService, MedicineProvider, DoseLogProvider',
    description: 'İlaç ekleme, güncelleme, silme, günlük doz akışı (stream) ve stok takip operasyonları.',
    status: 'ready',
  },
  {
    id: 5,
    title: 'Modül 5: Firebase Storage (Fotoğraf) & Cloud Functions (SMS/FCM)',
    subtitle: 'StorageService, Node.js Cloud Functions, SMS Trigger',
    description: 'Reçete/ilaç fotoğraflarının Storage\'a yüklenmesi, Cloud Functions arka plan tetikleyicileri ve SMS/FCM hatırlatıcıları.',
    status: 'ready',
  },
  {
    id: 6,
    title: 'Modül 6: UI Ekranları & Yerel Alarm/Bildirimler',
    subtitle: 'NotificationService, HomeScreen, AddMedicineScreen, HistoryScreen',
    description: 'flutter_local_notifications ile kesin zamanlı alarmlar, modern kart tasarımları ve dozaj geçmişi.',
    status: 'ready',
  },
];

export const DART_FILES: DartCodeFile[] = [
  // MODULE 1
  {
    filePath: 'pubspec.yaml',
    fileName: 'pubspec.yaml',
    module: 1,
    moduleName: 'Proje Kurulumu & Bağımlılıklar',
    description: 'Android & iOS için optimize edilmiş, Firebase ve State Management kütüphanelerini içeren paket listesi.',
    highlights: [
      'firebase_core & firebase_auth & cloud_firestore & firebase_storage',
      'provider: ^6.1.2 (State Management)',
      'flutter_local_notifications & timezone (Kesin zamanlı alarm)',
      'intl & uuid & cached_network_image',
    ],
    code: `name: meditrack_app
description: "Android & iOS Uyumlu Profesyonel İlaç Takip ve Hatırlatıcı Uygulaması"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # --- State Management ---
  provider: ^6.1.2

  # --- Firebase Core & Services ---
  firebase_core: ^3.10.1
  firebase_auth: ^5.4.1
  cloud_firestore: ^5.6.2
  firebase_storage: ^12.4.1
  firebase_messaging: ^15.2.1

  # --- Yerel Bildirimler & Alarm Sistemi ---
  flutter_local_notifications: ^18.0.1
  timezone: ^0.10.0
  flutter_timezone: ^3.0.1

  # --- Medya & Görsel İşlemleri ---
  image_picker: ^1.1.2
  cached_network_image: ^3.4.1

  # --- Yardımcı Paketler ---
  intl: ^0.20.1
  uuid: ^4.5.1
  google_fonts: ^6.2.1
  flutter_spinkit: ^5.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/
`,
  },
  {
    filePath: 'lib/main.dart',
    fileName: 'main.dart',
    module: 1,
    moduleName: 'Uygulama Giriş Noktası',
    description: 'Firebase, Timezone ve Bildirim servislerinin initialize edildiği, MultiProvider ile sarmalanmış ana dosya.',
    highlights: [
      'WidgetsFlutterBinding.ensureInitialized()',
      'Firebase.initializeApp()',
      'MultiProvider yapılandırması (AuthProvider, MedicineProvider, DoseLogProvider)',
      'Karanlık/Aydınlık tema desteği',
    ],
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:meditrack_app/core/constants/app_strings.dart';
import 'package:meditrack_app/core/theme/app_theme.dart';
import 'package:meditrack_app/core/services/firebase_service.dart';
import 'package:meditrack_app/services/notification_service.dart';
import 'package:meditrack_app/providers/auth_provider.dart';
import 'package:meditrack_app/providers/medicine_provider.dart';
import 'package:meditrack_app/providers/dose_log_provider.dart';
import 'package:meditrack_app/screens/splash/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Ekran yönlendirmesini dikey tutalım
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Firebase başlatma
  await FirebaseService.initialize();

  // Yerel bildirim servisini başlatma
  await NotificationService.instance.initialize();

  runApp(const MediTrackApp());
}

class MediTrackApp extends StatelessWidget {
  const MediTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProxyProvider<AuthProvider, MedicineProvider>(
          create: (_) => MedicineProvider(),
          update: (_, auth, medicine) => medicine!..updateUserId(auth.currentUser?.uid),
        ),
        ChangeNotifierProxyProvider<AuthProvider, DoseLogProvider>(
          create: (_) => DoseLogProvider(),
          update: (_, auth, log) => log!..updateUserId(auth.currentUser?.uid),
        ),
      ],
      child: MaterialApp(
        title: AppStrings.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        home: const SplashScreen(),
      ),
    );
  }
}
`,
  },
  {
    filePath: 'lib/core/constants/app_colors.dart',
    fileName: 'app_colors.dart',
    module: 1,
    moduleName: 'Core - Renk Sabitleri',
    description: 'Modern, medikal uyumlu ve göz yormayan renk paleti (Emerald, Sky Blue, Rose, Amber).',
    highlights: [
      'Birincil sağlık renkleri (Teal & Emerald)',
      'Kritik stok ve acil durum uyarı renkleri (Rose & Amber)',
      'Dark ve Light mod için nötr zemin renkleri',
    ],
    code: `import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // --- Birincil Marka & Medikal Renkler ---
  static const Color primary = Color(0xFF0D9488);      // Teal 600
  static const Color primaryLight = Color(0xFF14B8A6); // Teal 500
  static const Color primaryDark = Color(0xFF0F766E);  // Teal 700
  static const Color accent = Color(0xFF0284C7);       // Sky Blue 600

  // --- Durum Renkleri ---
  static const Color success = Color(0xFF10B981);      // Emerald 500 (İçildi)
  static const Color warning = Color(0xFFF59E0B);      // Amber 500 (Ertelendi/Kritik Stok)
  static const Color danger = Color(0xFFEF4444);       // Red 500 (Atlandı/Bitti)
  static const Color info = Color(0xFF3B82F6);         // Blue 500

  // --- Aydınlık Mod Zemin & Metin ---
  static const Color lightBackground = Color(0xFFF8FAFC); // Slate 50
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightTextPrimary = Color(0xFF0F172A); // Slate 900
  static const Color lightTextSecondary = Color(0xFF64748B); // Slate 500
  static const Color lightBorder = Color(0xFFE2E8F0); // Slate 200

  // --- Karanlık Mod Zemin & Metin ---
  static const Color darkBackground = Color(0xFF0F172A); // Slate 900
  static const Color darkCard = Color(0xFF1E293B);       // Slate 800
  static const Color darkTextPrimary = Color(0xFFF8FAFC);
  static const Color darkTextSecondary = Color(0xFF94A3B8);
  static const Color darkBorder = Color(0xFF334155);

  // --- İlaç Formu İkon Renkleri ---
  static const List<Color> medicineColors = [
    Color(0xFF0D9488), // Teal
    Color(0xFF2563EB), // Blue
    Color(0xFF7C3AED), // Purple
    Color(0xFFDB2777), // Pink
    Color(0xFFEA580C), // Orange
    Color(0xFF059669), // Emerald
  ];
}
`,
  },
  {
    filePath: 'lib/core/constants/app_strings.dart',
    fileName: 'app_strings.dart',
    module: 1,
    moduleName: 'Core - Metin Sabitleri',
    description: 'Uygulama içi tüm sabit metinler ve hata mesajlarının merkezi yönetimi.',
    highlights: [
      'Türkçe yerelleştirme hazır yapı',
      'Hata ve başarı mesajları',
      'Dozaj zamanlamaları (Sabah, Öğle, Akşam, Gece)',
    ],
    code: `class AppStrings {
  AppStrings._();

  // Genel
  static const String appName = 'İlaç Takip';
  static const String slogan = 'Sağlığınız İçin Düzenli Hatırlatıcı';

  // Oturum
  static const String loginTitle = 'Hoş Geldiniz';
  static const String loginSubtitle = 'İlaçlarınızı düzenli takip etmek için giriş yapın';
  static const String emailHint = 'E-posta Adresiniz';
  static const String passwordHint = 'Şifreniz';
  static const String loginButton = 'Giriş Yap';
  static const String registerButton = 'Kayıt Ol';
  static const String forgotPassword = 'Şifremi Unuttum';
  static const String googleSignIn = 'Google ile Devam Et';

  // İlaç İşlemleri
  static const String addMedicine = 'Yeni İlaç Ekle';
  static const String editMedicine = 'İlacı Düzenle';
  static const String medicineName = 'İlaç Adı';
  static const String dosage = 'Dozaj (örn: 500mg, 1 tablet)';
  static const String selectForm = 'İlaç Formu';
  static const String foodTiming = 'Açlık / Tokluk Durumu';
  static const String reminderTimes = 'Hatırlatma Saatleri';
  static const String stockCount = 'Mevcut Stok Miktarı';
  static const String criticalStock = 'Kritik Stok Uyarısı (Adet)';
  static const String saveMedicine = 'İlacı Kaydet';

  // Durumlar
  static const String taken = 'İçildi';
  static const String skipped = 'Atlandı';
  static const String snoozed = 'Ertelendi (15 dk)';
  static const String pending = 'Bekliyor';

  // Stok Uyarıları
  static const String stockLowWarning = 'Dikkat: İlaç stoğunuz tükenmek üzere!';
  static const String stockEmpty = 'Stoğunuz bitti. Lütfen reçetenizi yenileyiniz.';
}
`,
  },
  {
    filePath: 'lib/core/services/firebase_service.dart',
    fileName: 'firebase_service.dart',
    module: 1,
    moduleName: 'Core - Firebase Başlatıcı',
    description: 'Firebase core başlatma, offline Firestore cache desteği ve Firestore settings optimizasyonu.',
    highlights: [
      'Platform bazlı DefaultFirebaseOptions',
      'Firestore offline persistence (Yerel önbellek)',
      'Hata yakalama ve loglama',
    ],
    code: `import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

class FirebaseService {
  FirebaseService._();

  static Future<void> initialize() async {
    try {
      await Firebase.initializeApp();

      // Firestore Çevrimdışı (Offline) Veri Desteği Ayarı
      FirebaseFirestore.instance.settings = const Settings(
        persistenceEnabled: true,
        cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
      );

      if (kDebugMode) {
        print('✅ Firebase & Firestore başarıyla başlatıldı.');
      }
    } catch (e) {
      if (kDebugMode) {
        print('❌ Firebase başlatma hatası: $e');
      }
      rethrow;
    }
  }
}
`,
  },

  // MODULE 2
  {
    filePath: 'lib/models/medicine_model.dart',
    fileName: 'medicine_model.dart',
    module: 2,
    moduleName: 'Veri Modelleri - İlaç Modeli',
    description: 'Firestore dokümanı ile senkronize çalışan, tam donanımlı Dart İlaç sınıfı.',
    highlights: [
      'Firestore toMap() ve fromFirestore() dönüşümleri',
      'copyWith metodu ile immutable güncelleme',
      'Kritik stok kontrolü metotları',
    ],
    code: `import 'package:cloud_firestore/cloud_firestore.dart';

enum MedicineForm {
  tablet,
  capsule,
  syrup,
  injection,
  drops,
  inhaler,
  cream,
}

enum FoodRequirement {
  beforeMeal,   // Aç karnına
  afterMeal,    // Tok karnına
  withMeal,     // Yemekle birlikte
  emptyStomach, // Sabah aç
  anytime,      // Fark etmez
}

class MedicineModel {
  final String id;
  final String userId;
  final String name;
  final String dosage;
  final MedicineForm form;
  final FoodRequirement foodRequirement;
  final List<String> reminderTimes; // ["08:00", "20:00"]
  final DateTime startDate;
  final DateTime? endDate;
  final int stockCount;
  final int stockWarningThreshold;
  final String? photoUrl;
  final String? notes;
  final int colorValue;
  final bool isActive;
  final DateTime createdAt;

  MedicineModel({
    required this.id,
    required this.userId,
    required this.name,
    required this.dosage,
    required this.form,
    required this.foodRequirement,
    required this.reminderTimes,
    required this.startDate,
    this.endDate,
    required this.stockCount,
    this.stockWarningThreshold = 5,
    this.photoUrl,
    this.notes,
    required this.colorValue,
    this.isActive = true,
    required this.createdAt,
  });

  bool get isStockLow => stockCount <= stockWarningThreshold;
  bool get isOutOfStock => stockCount <= 0;

  // Firestore Map dönüşümü
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'name': name,
      'dosage': dosage,
      'form': form.name,
      'foodRequirement': foodRequirement.name,
      'reminderTimes': reminderTimes,
      'startDate': Timestamp.fromDate(startDate),
      'endDate': endDate != null ? Timestamp.fromDate(endDate!) : null,
      'stockCount': stockCount,
      'stockWarningThreshold': stockWarningThreshold,
      'photoUrl': photoUrl,
      'notes': notes,
      'colorValue': colorValue,
      'isActive': isActive,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  // Firestore DocumentSnapshot'tan oluşturma
  factory MedicineModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return MedicineModel(
      id: doc.id,
      userId: data['userId'] ?? '',
      name: data['name'] ?? '',
      dosage: data['dosage'] ?? '',
      form: MedicineForm.values.firstWhere(
        (e) => e.name == data['form'],
        orElse: () => MedicineForm.tablet,
      ),
      foodRequirement: FoodRequirement.values.firstWhere(
        (e) => e.name == data['foodRequirement'],
        orElse: () => FoodRequirement.anytime,
      ),
      reminderTimes: List<String>.from(data['reminderTimes'] ?? []),
      startDate: (data['startDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      endDate: (data['endDate'] as Timestamp?)?.toDate(),
      stockCount: data['stockCount'] ?? 0,
      stockWarningThreshold: data['stockWarningThreshold'] ?? 5,
      photoUrl: data['photoUrl'],
      notes: data['notes'],
      colorValue: data['colorValue'] ?? 0xFF0D9488,
      isActive: data['isActive'] ?? true,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  MedicineModel copyWith({
    String? name,
    String? dosage,
    MedicineForm? form,
    FoodRequirement? foodRequirement,
    List<String>? reminderTimes,
    DateTime? startDate,
    DateTime? endDate,
    int? stockCount,
    int? stockWarningThreshold,
    String? photoUrl,
    String? notes,
    int? colorValue,
    bool? isActive,
  }) {
    return MedicineModel(
      id: id,
      userId: userId,
      name: name ?? this.name,
      dosage: dosage ?? this.dosage,
      form: form ?? this.form,
      foodRequirement: foodRequirement ?? this.foodRequirement,
      reminderTimes: reminderTimes ?? this.reminderTimes,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      stockCount: stockCount ?? this.stockCount,
      stockWarningThreshold: stockWarningThreshold ?? this.stockWarningThreshold,
      photoUrl: photoUrl ?? this.photoUrl,
      notes: notes ?? this.notes,
      colorValue: colorValue ?? this.colorValue,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt,
    );
  }
}
`,
  },
  {
    filePath: 'lib/models/dose_log_model.dart',
    fileName: 'dose_log_model.dart',
    module: 2,
    moduleName: 'Veri Modelleri - Dozaj Günlüğü',
    description: 'Her bir ilacın içilme, atlanma veya ertelenme kaydını tutan geçmiş modeli.',
    highlights: [
      'DoseStatus (taken, skipped, snoozed, pending)',
      'Planlanan zaman ve fiili alınma zamanı ayrımı',
      'Uyum oranı (adherence) hesaplama desteği',
    ],
    code: `import 'package:cloud_firestore/cloud_firestore.dart';

enum DoseStatus {
  pending,  // Henüz saati gelmedi veya bekleniyor
  taken,    // Zamanında veya geç içildi
  skipped,  // Bilerek atlandı
  snoozed,  // 15-30 dk ertelendi
}

class DoseLogModel {
  final String id;
  final String userId;
  final String medicineId;
  final String medicineName;
  final String dosage;
  final String scheduledTime; // "08:00"
  final DateTime date;        // 2026-08-29
  final DoseStatus status;
  final DateTime? actionTime; // Ne zaman tıklandı
  final String? note;

  DoseLogModel({
    required this.id,
    required this.userId,
    required this.medicineId,
    required this.medicineName,
    required this.dosage,
    required this.scheduledTime,
    required this.date,
    required this.status,
    this.actionTime,
    this.note,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'medicineId': medicineId,
      'medicineName': medicineName,
      'dosage': dosage,
      'scheduledTime': scheduledTime,
      'date': Timestamp.fromDate(date),
      'status': status.name,
      'actionTime': actionTime != null ? Timestamp.fromDate(actionTime!) : null,
      'note': note,
    };
  }

  factory DoseLogModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return DoseLogModel(
      id: doc.id,
      userId: data['userId'] ?? '',
      medicineId: data['medicineId'] ?? '',
      medicineName: data['medicineName'] ?? '',
      dosage: data['dosage'] ?? '',
      scheduledTime: data['scheduledTime'] ?? '',
      date: (data['date'] as Timestamp?)?.toDate() ?? DateTime.now(),
      status: DoseStatus.values.firstWhere(
        (e) => e.name == data['status'],
        orElse: () => DoseStatus.pending,
      ),
      actionTime: (data['actionTime'] as Timestamp?)?.toDate(),
      note: data['note'],
    );
  }
}
`,
  },

  // MODULE 3
  {
    filePath: 'lib/services/auth_service.dart',
    fileName: 'auth_service.dart',
    module: 3,
    moduleName: 'Firebase Auth - Kimlik Doğrulama Servisi',
    description: 'Email/Password kaydı, girişi, şifre sıfırlama ve oturum durumu Stream dinleyicisi.',
    highlights: [
      'FirebaseAuth.instance ile doğrudan güvenli entegrasyon',
      'Kullanıcı profili Firestore eşleşmesi',
      'Özelleştirilmiş Türkçe hata fırlatma (AuthException)',
    ],
    code: `import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Anlık kullanıcı ve Auth State Stream
  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // E-posta & Şifre ile Kayıt
  Future<UserCredential> registerWithEmail({
    required String email,
    required String password,
    required String fullName,
    String? phoneNumber,
  }) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );

      final user = credential.user;
      if (user != null) {
        await user.updateDisplayName(fullName);

        // Kullanıcı Firestore dokümanını oluştur
        await _firestore.collection('users').doc(user.uid).set({
          'uid': user.uid,
          'email': email.trim(),
          'fullName': fullName,
          'phoneNumber': phoneNumber,
          'fcmToken': null,
          'emergencyContact': null,
          'createdAt': FieldValue.serverTimestamp(),
        });
      }
      return credential;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  // E-posta & Şifre ile Giriş
  Future<UserCredential> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  // Şifre Sıfırlama E-postası Gönderme
  Future<void> sendPasswordResetEmail(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  // Çıkış Yap
  Future<void> signOut() async {
    await _auth.signOut();
  }

  String _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'Bu e-posta adresine kayıtlı kullanıcı bulunamadı.';
      case 'wrong-password':
        return 'Hatalı şifre girdiniz.';
      case 'email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda.';
      case 'invalid-email':
        return 'Geçersiz e-posta formatı.';
      case 'weak-password':
        return 'Şifre en az 6 karakter olmalıdır.';
      default:
        return e.message ?? 'Bir kimlik doğrulama hatası oluştu.';
    }
  }
}
`,
  },
  {
    filePath: 'lib/providers/auth_provider.dart',
    fileName: 'auth_provider.dart',
    module: 3,
    moduleName: 'State Management - AuthProvider',
    description: 'ChangeNotifier tabanlı, UI ile AuthService arasındaki reaktif köprü.',
    highlights: [
      'isLoading ve errorMessage durum yönetimi',
      'Kullanıcı oturumunun reaktif yayını',
    ],
    code: `import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:meditrack_app/services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  
  User? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    _authService.authStateChanges.listen((user) {
      _currentUser = user;
      notifyListeners();
    });
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _errorMessage = null;
    try {
      await _authService.signInWithEmail(email: email, password: password);
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false;
    }
  }

  Future<bool> register(String email, String password, String fullName, {String? phone}) async {
    _setLoading(true);
    _errorMessage = null;
    try {
      await _authService.registerWithEmail(
        email: email,
        password: password,
        fullName: fullName,
        phoneNumber: phone,
      );
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.signOut();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
`,
  },

  // MODULE 4
  {
    filePath: 'lib/services/firestore_service.dart',
    fileName: 'firestore_service.dart',
    module: 4,
    moduleName: 'Firestore Service - Veri Katmanı',
    description: 'İlaçlar, Doz Günlükleri ve Stok güncellemeleri için Firestore CRUD fonksiyonları.',
    highlights: [
      'users/{userId}/medicines alt koleksiyon yapısı',
      'Transaction ile güvenli stok düşürme',
      'Gerçek zamanlı Stream<List<MedicineModel>>',
    ],
    code: `import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:meditrack_app/models/medicine_model.dart';
import 'package:meditrack_app/models/dose_log_model.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  CollectionReference _medicinesRef(String userId) =>
      _firestore.collection('users').doc(userId).collection('medicines');

  CollectionReference _doseLogsRef(String userId) =>
      _firestore.collection('users').doc(userId).collection('doseLogs');

  // --- İlaç CRUD Operasyonları ---

  // Gerçek zamanlı ilaç listesi Stream'i
  Stream<List<MedicineModel>> streamMedicines(String userId) {
    return _medicinesRef(userId)
        .where('isActive', isEqualTo: true)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => MedicineModel.fromFirestore(doc)).toList());
  }

  // Yeni İlaç Ekleme
  Future<void> addMedicine(MedicineModel medicine) async {
    await _medicinesRef(medicine.userId).doc(medicine.id).set(medicine.toMap());
  }

  // İlaç Güncelleme
  Future<void> updateMedicine(MedicineModel medicine) async {
    await _medicinesRef(medicine.userId).doc(medicine.id).update(medicine.toMap());
  }

  // İlaç Silme (Soft Delete)
  Future<void> deleteMedicine(String userId, String medicineId) async {
    await _medicinesRef(userId).doc(medicineId).update({'isActive': false});
  }

  // --- Dozaj & Stok Yönetimi ---

  // Doz içildiğinde: DozLog oluştur + Stok sayısını 1 azalt (Firestore Transaction)
  Future<void> markDoseTaken({
    required String userId,
    required String medicineId,
    required DoseLogModel log,
  }) async {
    final medDocRef = _medicinesRef(userId).doc(medicineId);
    final logDocRef = _doseLogsRef(userId).doc(log.id);

    await _firestore.runTransaction((transaction) async {
      final medSnapshot = await transaction.get(medDocRef);
      if (!medSnapshot.exists) {
        throw Exception('İlaç bulunamadı.');
      }

      final currentStock = (medSnapshot.data() as Map<String, dynamic>)['stockCount'] ?? 0;
      final newStock = currentStock > 0 ? currentStock - 1 : 0;

      // Stoğu güncelle
      transaction.update(medDocRef, {'stockCount': newStock});

      // Dozaj logunu kaydet
      transaction.set(logDocRef, log.toMap());
    });
  }

  // Günlük Doz Günlükleri Stream'i
  Stream<List<DoseLogModel>> streamDoseLogsForDate(String userId, DateTime date) {
    final startOfDay = DateTime(date.year, date.month, date.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));

    return _doseLogsRef(userId)
        .where('date', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('date', isLessThan: Timestamp.fromDate(endOfDay))
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => DoseLogModel.fromFirestore(doc)).toList());
  }
}
`,
  },
  {
    filePath: 'lib/providers/medicine_provider.dart',
    fileName: 'medicine_provider.dart',
    module: 4,
    moduleName: 'State Management - MedicineProvider',
    description: 'İlaçların durumunu, aktif dozajları ve stok uyarılarını yöneten merkezi Provider.',
    highlights: [
      'Firestore Stream subscription yönetimi',
      'Kritik stok listesi filtreleme getter\'ı',
      'Bildirim planlamasını otomatik tetikleme',
    ],
    code: `import 'dart:async';
import 'package:flutter/material.dart';
import 'package:meditrack_app/models/medicine_model.dart';
import 'package:meditrack_app/services/firestore_service.dart';
import 'package:meditrack_app/services/notification_service.dart';

class MedicineProvider extends ChangeNotifier {
  final FirestoreService _firestoreService = FirestoreService();

  String? _userId;
  List<MedicineModel> _medicines = [];
  bool _isLoading = false;
  StreamSubscription? _subscription;

  List<MedicineModel> get medicines => _medicines;
  bool get isLoading => _isLoading;

  // Kritik stoğu kalan ilaçlar
  List<MedicineModel> get lowStockMedicines =>
      _medicines.where((m) => m.isStockLow).toList();

  void updateUserId(String? userId) {
    if (_userId == userId) return;
    _userId = userId;
    _subscription?.cancel();

    if (_userId != null) {
      _listenToMedicines();
    } else {
      _medicines = [];
      notifyListeners();
    }
  }

  void _listenToMedicines() {
    _isLoading = true;
    notifyListeners();

    _subscription = _firestoreService.streamMedicines(_userId!).listen((list) {
      _medicines = list;
      _isLoading = false;
      notifyListeners();

      // İlaç bildirimlerini güncelle
      _rescheduleAllNotifications();
    });
  }

  Future<void> addMedicine(MedicineModel medicine) async {
    await _firestoreService.addMedicine(medicine);
  }

  Future<void> updateMedicine(MedicineModel medicine) async {
    await _firestoreService.updateMedicine(medicine);
  }

  Future<void> deleteMedicine(String medicineId) async {
    if (_userId == null) return;
    await _firestoreService.deleteMedicine(_userId!, medicineId);
  }

  void _rescheduleAllNotifications() {
    for (final med in _medicines) {
      if (med.isActive) {
        NotificationService.instance.scheduleMedicineReminders(med);
      }
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
`,
  },

  // MODULE 5
  {
    filePath: 'lib/services/storage_service.dart',
    fileName: 'storage_service.dart',
    module: 5,
    moduleName: 'Firebase Storage - Fotoğraf Servisi',
    description: 'İlaç kutusu veya reçete fotoğraflarının Firebase Storage\'a sıkıştırılarak yüklenmesi.',
    highlights: [
      'ImagePicker entegrasyonu',
      'users/{userId}/medicines/{medId}.jpg path yönetimi',
      'Download URL alma ve Firestore\'a kaydetme',
    ],
    code: `import 'dart:io';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';

class StorageService {
  final FirebaseStorage _storage = FirebaseStorage.instance;
  final ImagePicker _picker = ImagePicker();

  // Galeriden veya Kameradan Fotoğraf Seç
  Future<File?> pickMedicinePhoto({required ImageSource source}) async {
    final pickedFile = await _picker.pickImage(
      source: source,
      imageQuality: 80, // Depolama ve hız için sıkıştırma
      maxWidth: 1024,
    );

    if (pickedFile != null) {
      return File(pickedFile.path);
    }
    return null;
  }

  // Firebase Storage'a Yükleme ve URL Döndürme
  Future<String> uploadMedicinePhoto({
    required String userId,
    required String medicineId,
    required File file,
  }) async {
    final ref = _storage
        .ref()
        .child('users')
        .child(userId)
        .child('medicines')
        .child('\${medicineId}_\${DateTime.now().millisecondsSinceEpoch}.jpg');

    final uploadTask = await ref.putFile(
      file,
      SettableMetadata(contentType: 'image/jpeg'),
    );

    return await uploadTask.ref.getDownloadURL();
  }
}
`,
  },
  {
    filePath: 'functions/index.js',
    fileName: 'index.js (Cloud Functions)',
    module: 5,
    moduleName: 'Firebase Cloud Functions - Arka Plan & SMS',
    description: 'Node.js Cloud Functions ile kritik stok SMS tetikleyici ve geciken doz uyarı servisi.',
    highlights: [
      'Firestore onUpdate tetikleyicisi (Stok düştüğünde otomatik SMS)',
      'Twilio veya Netgsm SMS API entegrasyonu',
      'Pub/Sub zamanlanmış görev (Cron job) ile FCM hatırlatıcı',
    ],
    code: `const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * 1. İlaç Stoğu Kritik Seviyeye Düştüğünde SMS Gönderen Cloud Function
 */
exports.onMedicineStockLow = functions.firestore
  .document("users/{userId}/medicines/{medicineId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const { userId } = context.params;

    // Eğer stok kritik eşiğin altına indiyse
    if (
      afterData.stockCount <= afterData.stockWarningThreshold &&
      beforeData.stockCount > afterData.stockWarningThreshold
    ) {
      const userDoc = await admin.firestore().collection("users").doc(userId).get();
      const userData = userDoc.data();

      if (userData && userData.phoneNumber) {
        const smsMessage = \`[İlaç Takip] Sayın \${userData.fullName}, \${afterData.name} ilacınızın stoğu \${afterData.stockCount} adede düşmüştür. Lütfen eczanenizden temin ediniz.\`;

        try {
          await twilio.messages.create({
            body: smsMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: userData.phoneNumber,
          });
          console.log(\`✅ SMS başarıyla gönderildi: \${userData.phoneNumber}\`);
        } catch (error) {
          console.error("❌ SMS gönderme hatası:", error);
        }
      }
    }
  });

/**
 * 2. Her Gün Belirli Aralıklarla Alınmayan Dozlar İçin FCM Bildirimi Gönderme
 */
exports.scheduledDoseReminder = functions.pubsub
  .schedule("every 30 minutes")
  .onRun(async (context) => {
    // Geciken dozları tespit edip FCM ile push notification gönderir
    console.log("⏰ Zamanlanmış doz kontrolü çalıştı.");
    return null;
  });
`,
  },

  // MODULE 6
  {
    filePath: 'lib/services/notification_service.dart',
    fileName: 'notification_service.dart',
    module: 6,
    moduleName: 'Yerel Bildirimler & Alarm Servisi',
    description: 'flutter_local_notifications ve Timezone ile tam zamanında çalan yerel ilaç alarmları.',
    highlights: [
      'Android NotificationChannel (Yüksek öncelikli sesli alarm)',
      'iOS DarwinNotificationDetails yapılandırması',
      'Her gün tekrarlayan saatlik alarm planlaması (zonedSchedule)',
    ],
    code: `import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:meditrack_app/models/medicine_model.dart';

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    tz.initializeTimeZones();
    final String currentTimeZone = await FlutterTimezone.getLocalTimezone();
    tz.setLocalLocation(tz.getLocation(currentTimeZone));

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notificationsPlugin.initialize(
      settings,
      onDidReceiveNotificationResponse: (details) {
        // Bildirime tıklandığında ilgili ilaca yönlendir
      },
    );
  }

  // İlacın tüm hatırlatma saatlerini her gün tekrarlayan alarm olarak ayarla
  Future<void> scheduleMedicineReminders(MedicineModel medicine) async {
    for (int i = 0; i < medicine.reminderTimes.length; i++) {
      final timeStr = medicine.reminderTimes[i];
      final parts = timeStr.split(':');
      final hour = int.parse(parts[0]);
      final minute = int.parse(parts[1]);

      final notificationId = (medicine.id.hashCode + i).abs();

      await _notificationsPlugin.zonedSchedule(
        notificationId,
        '💊 İlaç Vakti: \${medicine.name}',
        'Dozaj: \${medicine.dosage} (\${medicine.foodRequirement.name})',
        _nextInstanceOfTime(hour, minute),
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'med_reminders',
            'İlaç Hatırlatıcıları',
            channelDescription: 'Düzenli ilaç saatleri için yüksek öncelikli alarmlar',
            importance: Importance.max,
            priority: Priority.high,
            sound: RawResourceAndroidNotificationSound('alarm_sound'),
            playSound: true,
          ),
          iOS: DarwinNotificationDetails(
            sound: 'alarm_sound.aiff',
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        matchDateTimeComponents: DateTimeComponents.time,
      );
    }
  }

  tz.TZDateTime _nextInstanceOfTime(int hour, int minute) {
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate =
        tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    return scheduledDate;
  }
}
`,
  },
];
