import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:meditrack_app/models/medicine_model.dart';

const String kActionTakeDose = 'ACTION_TAKE_DOSE';
const String kActionSnooze = 'ACTION_SNOOZE';
const String kNotificationChannelId = 'medicine_reminder_channel';
const String kNotificationChannelName = 'İlaç Hatırlatıcıları';
const String kNotificationChannelDesc = 'Düzenli ilaç saatleri için yüksek öncelikli sesli alarmlar';

@pragma('vm:entry-point')
void notificationTapBackground(NotificationResponse notificationResponse) async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  final actionId = notificationResponse.actionId;
  final payload = notificationResponse.payload;

  if (payload == null) return;

  try {
    final Map<String, dynamic> data = jsonDecode(payload);
    final String userId = data['userId'] ?? '';
    final String medicineId = data['medicineId'] ?? '';
    final String medicineName = data['medicineName'] ?? '';

    if (userId.isEmpty || medicineId.isEmpty) return;

    if (actionId == kActionTakeDose) {
      final docRef = FirebaseFirestore.instance
          .collection('users')
          .doc(userId)
          .collection('medicines')
          .doc(medicineId);

      await FirebaseFirestore.instance.runTransaction((transaction) async {
        final snapshot = await transaction.get(docRef);
        if (!snapshot.exists) return;

        final currentStock = (snapshot.data()?['stock'] as num?)?.toInt() ?? 0;
        final newStock = currentStock > 0 ? currentStock - 1 : 0;

        transaction.update(docRef, {'stock': newStock});

        final logRef = FirebaseFirestore.instance
            .collection('users')
            .doc(userId)
            .collection('doseLogs')
            .doc('${medicineId}_${DateTime.now().millisecondsSinceEpoch}');

        transaction.set(logRef, {
          'medicineId': medicineId,
          'medicineName': medicineName,
          'status': 'taken',
          'takenAt': FieldValue.serverTimestamp(),
          'actionSource': 'notification_action',
        });
      });

      if (kDebugMode) {
        print('✅ Arka plan işlemi: $medicineName içildi, stok 1 düşürüldü.');
      }
    } else if (actionId == kActionSnooze) {
      final id = data['notificationId'] ?? 999;
      await NotificationService.instance.scheduleSnoozeNotification(
        notificationId: id + 100000,
        medicineName: medicineName,
        payload: payload,
        minutes: 15,
      );

      if (kDebugMode) {
        print('⏳ $medicineName 15 dakika ertelendi.');
      }
    }
  } catch (e) {
    if (kDebugMode) {
      print('❌ Arka plan bildirim callback hatası: $e');
    }
  }
}

class NotificationService {
  NotificationService._internal();
  static final NotificationService instance = NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    tz.initializeTimeZones();
    final String timeZoneName = await FlutterTimezone.getLocalTimezone();
    tz.setLocalLocation(tz.getLocation(timeZoneName));

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    final DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
      notificationCategories: [
        DarwinNotificationCategory(
          'medicine_category',
          actions: <DarwinNotificationAction>[
            DarwinNotificationAction.plain(
              kActionTakeDose,
              'İçtim ✅',
              options: <DarwinNotificationActionOption>{
                DarwinNotificationActionOption.authenticationRequired,
              },
            ),
            DarwinNotificationAction.plain(
              kActionSnooze,
              '15 dk Ertele ⏳',
            ),
          ],
        ),
      ],
    );

    final InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notificationsPlugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onForegroundNotificationResponse,
      onDidReceiveBackgroundNotificationResponse: notificationTapBackground,
    );

    await requestPermissions();
  }

  Future<void> requestPermissions() async {
    await _notificationsPlugin
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );

    final androidImplementation = _notificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();

    if (androidImplementation != null) {
      await androidImplementation.requestNotificationsPermission();
      await androidImplementation.requestExactAlarmsPermission();
    }
  }

  Future<void> scheduleDailyMedicineReminder(MedicineModel medicine) async {
    final int notificationId = medicine.id.hashCode.abs();

    final payload = jsonEncode({
      'notificationId': notificationId,
      'userId': medicine.userId,
      'medicineId': medicine.id,
      'medicineName': medicine.name,
      'dosage': medicine.dosage,
    });

    final scheduledTime = _nextInstanceOfTime(medicine.timeHours, medicine.timeMinutes);

    await _notificationsPlugin.zonedSchedule(
      notificationId,
      '💊 İlaç Vakti: ${medicine.name}',
      'Doz: ${medicine.dosage} • Sağlığınız için ilacınızı zamanında alınız.',
      scheduledTime,
      NotificationDetails(
        android: AndroidNotificationDetails(
          kNotificationChannelId,
          kNotificationChannelName,
          channelDescription: kNotificationChannelDesc,
          importance: Importance.max,
          priority: Priority.high,
          playSound: true,
          enableVibration: true,
          category: AndroidNotificationCategory.alarm,
          fullScreenIntent: true,
          actions: <AndroidNotificationAction>[
            const AndroidNotificationAction(
              kActionTakeDose,
              'İçtim ✅',
              showsUserInterface: false,
              cancelNotification: true,
            ),
            const AndroidNotificationAction(
              kActionSnooze,
              '15 dk Ertele ⏳',
              showsUserInterface: false,
              cancelNotification: true,
            ),
          ],
        ),
        iOS: const DarwinNotificationDetails(
          categoryIdentifier: 'medicine_category',
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
          interruptionLevel: InterruptionLevel.timeSensitive,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
      payload: payload,
    );

    if (kDebugMode) {
      print('⏰ Günlük Alarm Kuruldu: ${medicine.name} -> $scheduledTime');
    }
  }

  Future<void> scheduleSnoozeNotification({
    required int notificationId,
    required String medicineName,
    required String payload,
    int minutes = 15,
  }) async {
    final snoozeTime = tz.TZDateTime.now(tz.local).add(Duration(minutes: minutes));

    await _notificationsPlugin.zonedSchedule(
      notificationId,
      '⏳ Ertelenen İlaç Vakti: $medicineName',
      '$minutes dakika önce ertelemiştiniz. Lütfen ilacınızı alınız.',
      snoozeTime,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          kNotificationChannelId,
          kNotificationChannelName,
          channelDescription: kNotificationChannelDesc,
          importance: Importance.max,
          priority: Priority.high,
          playSound: true,
          actions: <AndroidNotificationAction>[
            AndroidNotificationAction(
              kActionTakeDose,
              'İçtim ✅',
              cancelNotification: true,
            ),
          ],
        ),
        iOS: DarwinNotificationDetails(
          categoryIdentifier: 'medicine_category',
          presentAlert: true,
          presentSound: true,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      payload: payload,
    );
  }

  Future<void> cancelReminder(int notificationId) async {
    await _notificationsPlugin.cancel(notificationId);
  }

  void _onForegroundNotificationResponse(NotificationResponse response) {
    if (response.actionId != null) {
      notificationTapBackground(response);
    }
  }

  tz.TZDateTime _nextInstanceOfTime(int hour, int minute) {
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day,
      hour,
      minute,
    );

    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    return scheduledDate;
  }
}
