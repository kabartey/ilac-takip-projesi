import 'dart:async';
import 'package:flutter/material.dart';
import 'package:meditrack_app/models/medicine_model.dart';
import 'package:meditrack_app/models/dose_log_model.dart';
import 'package:meditrack_app/services/firestore_service.dart';
import 'package:meditrack_app/services/notification_service.dart';

class MedicineProvider extends ChangeNotifier {
  final FirestoreService _firestoreService = FirestoreService();

  String? _userId;
  List<MedicineModel> _medicines = [];
  List<DoseLogModel> _todayLogs = [];
  bool _isLoading = false;
  StreamSubscription? _medSubscription;
  StreamSubscription? _logSubscription;

  List<MedicineModel> get medicines => _medicines;
  List<DoseLogModel> get todayLogs => _todayLogs;
  bool get isLoading => _isLoading;

  List<MedicineModel> get lowStockMedicines =>
      _medicines.where((m) => m.isLowStock).toList();

  void updateUserId(String? userId) {
    if (_userId == userId) return;
    _userId = userId;
    _medSubscription?.cancel();
    _logSubscription?.cancel();

    if (_userId != null) {
      _listenToData();
    } else {
      _medicines = [];
      _todayLogs = [];
      notifyListeners();
    }
  }

  void _listenToData() {
    _isLoading = true;
    notifyListeners();

    _medSubscription = _firestoreService.streamMedicines(_userId!).listen(
      (list) {
        _medicines = list;
        _isLoading = false;
        notifyListeners();
      },
      onError: (e) {
        _isLoading = false;
        notifyListeners();
      },
    );

    _logSubscription = _firestoreService.streamDoseLogsForToday(_userId!).listen(
      (logs) {
        _todayLogs = logs;
        notifyListeners();
      },
    );
  }

  Future<void> addMedicine(MedicineModel medicine) async {
    // 1. Firestore'a kaydet
    await _firestoreService.addMedicine(medicine);
    
    // 2. Alarm ve Bildirim kur (hata olursa bile işlemi kilitlemez)
    try {
      await NotificationService.instance.scheduleDailyMedicineReminder(medicine);
    } catch (e) {
      debugPrint('Alarm kurma uyarısı/hatası: $e');
    }
  }

  Future<void> updateMedicine(MedicineModel medicine) async {
    await _firestoreService.updateMedicine(medicine);
    try {
      await NotificationService.instance.scheduleDailyMedicineReminder(medicine);
    } catch (e) {
      debugPrint('Alarm güncelleme hatası: $e');
    }
  }

  Future<void> deleteMedicine(String medicineId) async {
    if (_userId == null) return;
    await _firestoreService.deleteMedicine(_userId!, medicineId);
    try {
      await NotificationService.instance.cancelReminder(medicineId.hashCode.abs());
    } catch (e) {
      debugPrint('Alarm iptal hatası: $e');
    }
  }

  Future<void> takeDose(MedicineModel medicine) async {
    if (_userId == null) return;

    await _firestoreService.markDoseTaken(
      userId: _userId!,
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosage: medicine.dosage,
      scheduledTime: medicine.formattedTime,
    );
  }

  @override
  void dispose() {
    _medSubscription?.cancel();
    _logSubscription?.cancel();
    super.dispose();
  }
}
