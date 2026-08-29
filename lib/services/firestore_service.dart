import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:meditrack_app/models/medicine_model.dart';
import 'package:meditrack_app/models/dose_log_model.dart';
import 'package:meditrack_app/models/user_model.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  CollectionReference _medicinesRef(String userId) =>
      _firestore.collection('users').doc(userId).collection('medicines');

  CollectionReference _doseLogsRef(String userId) =>
      _firestore.collection('users').doc(userId).collection('doseLogs');

  // --- Kullanıcı Profil İşlemleri ---
  Future<UserModel?> getUserProfile(String userId) async {
    final doc = await _firestore.collection('users').doc(userId).get();
    if (!doc.exists || doc.data() == null) return null;
    return UserModel.fromMap(doc.data()!, documentId: doc.id);
  }

  Future<void> saveUserProfile(UserModel user) async {
    await _firestore.collection('users').doc(user.uid).set(user.toMap());
  }

  // --- İlaç CRUD Operasyonları ---
  Stream<List<MedicineModel>> streamMedicines(String userId) {
    return _medicinesRef(userId)
        .orderBy('timeHours', descending: false)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => MedicineModel.fromMap(
                  doc.data() as Map<String, dynamic>,
                  documentId: doc.id,
                ))
            .toList());
  }

  Future<void> addMedicine(MedicineModel medicine) async {
    await _medicinesRef(medicine.userId).doc(medicine.id).set(medicine.toMap());
  }

  Future<void> updateMedicine(MedicineModel medicine) async {
    await _medicinesRef(medicine.userId).doc(medicine.id).update(medicine.toMap());
  }

  Future<void> deleteMedicine(String userId, String medicineId) async {
    await _medicinesRef(userId).doc(medicineId).delete();
  }

  // --- Dozaj & Stok Yönetimi (Firestore Transaction) ---
  Future<void> markDoseTaken({
    required String userId,
    required String medicineId,
    required String medicineName,
    required String dosage,
    required String scheduledTime,
  }) async {
    final medDocRef = _medicinesRef(userId).doc(medicineId);
    final logDocRef = _doseLogsRef(userId).doc('${medicineId}_${DateTime.now().millisecondsSinceEpoch}');

    await _firestore.runTransaction((transaction) async {
      final medSnapshot = await transaction.get(medDocRef);
      if (!medSnapshot.exists) {
        throw Exception('İlaç kaydı bulunamadı.');
      }

      final currentStock = (medSnapshot.data() as Map<String, dynamic>)['stock'] ?? 0;
      final newStock = currentStock > 0 ? currentStock - 1 : 0;

      // 1. Stoğu 1 azalt
      transaction.update(medDocRef, {'stock': newStock});

      // 2. Dozaj geçmişi logu ekle
      final log = DoseLogModel(
        id: logDocRef.id,
        userId: userId,
        medicineId: medicineId,
        medicineName: medicineName,
        dosage: dosage,
        scheduledTime: scheduledTime,
        date: DateTime.now(),
        status: DoseStatus.taken,
        actionTime: DateTime.now(),
      );
      transaction.set(logDocRef, log.toMap());
    });
  }

  // Günlük Doz Günlükleri Stream'i
  Stream<List<DoseLogModel>> streamDoseLogsForToday(String userId) {
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));

    return _doseLogsRef(userId)
        .where('date', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('date', isLessThan: Timestamp.fromDate(endOfDay))
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => DoseLogModel.fromFirestore(doc)).toList());
  }
}
