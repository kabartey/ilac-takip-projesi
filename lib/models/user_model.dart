import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String uid;
  final String fullName;
  final String email;
  final String phoneNumber;
  final String relativeFullName;
  final String relativePhoneNumber;
  final DateTime createdAt;

  UserModel({
    required this.uid,
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    required this.relativeFullName,
    required this.relativePhoneNumber,
    required this.createdAt,
  });

  /// Firestore'a yazarken Map<String, dynamic> formatına çevirir
  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'fullName': fullName,
      'email': email,
      'phoneNumber': phoneNumber,
      'relativeFullName': relativeFullName,
      'relativePhoneNumber': relativePhoneNumber,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  /// Firestore'dan gelen Map veya DocumentSnapshot.data() verisini UserModel nesnesine çevirir
  factory UserModel.fromMap(Map<String, dynamic> map, {String? documentId}) {
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

    return UserModel(
      uid: documentId ?? map['uid'] ?? '',
      fullName: map['fullName'] ?? '',
      email: map['email'] ?? '',
      phoneNumber: map['phoneNumber'] ?? '',
      relativeFullName: map['relativeFullName'] ?? '',
      relativePhoneNumber: map['relativePhoneNumber'] ?? '',
      createdAt: parseCreatedAt(map['createdAt']),
    );
  }

  UserModel copyWith({
    String? uid,
    String? fullName,
    String? email,
    String? phoneNumber,
    String? relativeFullName,
    String? relativePhoneNumber,
    DateTime? createdAt,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      relativeFullName: relativeFullName ?? this.relativeFullName,
      relativePhoneNumber: relativePhoneNumber ?? this.relativePhoneNumber,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
