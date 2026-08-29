import 'package:cloud_firestore/cloud_firestore.dart';

enum DoseStatus {
  pending,  // Bekliyor
  taken,    // İçildi
  skipped,  // Atlandı
  snoozed,  // Ertelendi
}

class DoseLogModel {
  final String id;
  final String userId;
  final String medicineId;
  final String medicineName;
  final String dosage;
  final String scheduledTime;
  final DateTime date;
  final DoseStatus status;
  final DateTime? actionTime;
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
