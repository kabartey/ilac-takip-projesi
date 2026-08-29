import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

class FirebaseService {
  FirebaseService._();

  static Future<void> initialize() async {
    try {
      await Firebase.initializeApp();

      // Firestore Offline Persistence (Çevrimdışı Önbellekleme)
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
