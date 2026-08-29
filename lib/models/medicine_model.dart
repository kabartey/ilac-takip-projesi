import 'package:cloud_firestore/cloud_firestore.dart';

class MedicineModel {
  final String id;
  final String userId;
  final String name;
  final String dosage;
  final int stock;
  final int timeHours;
  final int timeMinutes;
  final String? imageUrl;
  final DateTime createdAt;

  MedicineModel({
    required this.id,
    required this.userId,
    required this.name,
    required this.dosage,
    required this.stock,
    required this.timeHours,
    required this.timeMinutes,
    this.imageUrl,
    required this.createdAt,
  });

  /// Saat ve dakikayı formatlı metin olarak döner (Örn: "08:05", "14:30")
  String get formattedTime {
    final hour = timeHours.toString().padLeft(2, '0');
    final minute = timeMinutes.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  bool get isLowStock => stock <= 5;
  bool get isOutOfStock => stock <= 0;

  /// Firestore'a yazarken Map<String, dynamic> formatına çevirir
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'name': name,
      'dosage': dosage,
      'stock': stock,
      'timeHours': timeHours,
      'timeMinutes': timeMinutes,
      'imageUrl': imageUrl,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  /// Firestore'dan gelen Map veya DocumentSnapshot.data() verisini MedicineModel nesnesine çevirir
  factory MedicineModel.fromMap(Map<String, dynamic> map, {String? documentId}) {
    DateTime parseCreatedAt(dynamic timestamp) {
      if (timestamp is Timestamp) {
        return timestamp.toDate();
      } else if (timestamp is String) {
        return DateTime.tryParse(timestamp) ?? DateTime.now();
      } else if (timestamp is int) {
        return DateTime.fromMillisecondsSinceEpoch(timestamp);
      }
      return DateTime.now();
    }

    return MedicineModel(
      id: documentId ?? map['id'] ?? '',
      userId: map['userId'] ?? '',
      name: map['name'] ?? '',
      dosage: map['dosage'] ?? '',
      stock: (map['stock'] as num?)?.toInt() ?? 0,
      timeHours: (map['timeHours'] as num?)?.toInt() ?? 0,
      timeMinutes: (map['timeMinutes'] as num?)?.toInt() ?? 0,
      imageUrl: map['imageUrl'],
      createdAt: parseCreatedAt(map['createdAt']),
    );
  }

  MedicineModel copyWith({
    String? id,
    String? userId,
    String? name,
    String? dosage,
    int? stock,
    int? timeHours,
    int? timeMinutes,
    String? imageUrl,
    DateTime? createdAt,
  }) {
    return MedicineModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      dosage: dosage ?? this.dosage,
      stock: stock ?? this.stock,
      timeHours: timeHours ?? this.timeHours,
      timeMinutes: timeMinutes ?? this.timeMinutes,
      imageUrl: imageUrl ?? this.imageUrl,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
