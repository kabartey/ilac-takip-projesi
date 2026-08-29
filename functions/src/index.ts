import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import twilio from "twilio";

admin.initializeApp();
const db = admin.firestore();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export const checkMissedMedicinesAndNotifyRelative = functions.pubsub
  .schedule("every 15 minutes")
  .timeZone("Europe/Istanbul")
  .onRun(async (context) => {
    const now = new Date();
    const istanbulTimeString = now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" });
    const localNow = new Date(istanbulTimeString);

    const currentHour = localNow.getHours();
    const currentMinute = localNow.getMinutes();
    const todayDateString = localNow.toISOString().split("T")[0];

    try {
      const medicinesSnapshot = await db.collectionGroup("medicines").get();

      if (medicinesSnapshot.empty) return null;

      const promises: Promise<void>[] = [];

      for (const medDoc of medicinesSnapshot.docs) {
        const medData = medDoc.data();
        const {
          userId,
          name: medicineName,
          timeHours,
          timeMinutes,
          lastSmsNotifiedDate,
        } = medData;

        if (timeHours === undefined || timeMinutes === undefined || !userId) {
          continue;
        }

        const scheduledTotalMinutes = timeHours * 60 + timeMinutes;
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const differenceInMinutes = currentTotalMinutes - scheduledTotalMinutes;

        const isTimeOverdue = differenceInMinutes >= 30 && differenceInMinutes <= 60;
        const isAlreadyNotifiedToday = lastSmsNotifiedDate === todayDateString;

        if (isTimeOverdue && !isAlreadyNotifiedToday) {
          const startOfToday = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate());
          
          const doseLogSnapshot = await db
            .collection("users")
            .doc(userId)
            .collection("doseLogs")
            .where("medicineId", "==", medDoc.id)
            .where("status", "==", "taken")
            .where("takenAt", ">=", admin.firestore.Timestamp.fromDate(startOfToday))
            .limit(1)
            .get();

          if (doseLogSnapshot.empty) {
            promises.push(
              sendSmsToRelative({
                userId,
                medicineId: medDoc.id,
                medicineName,
                scheduledTime: `${timeHours.toString().padStart(2, "0")}:${timeMinutes.toString().padStart(2, "0")}`,
                todayDateString,
              })
            );
          }
        }
      }

      await Promise.all(promises);
      return null;
    } catch (error) {
      console.error("Cloud Functions Hatası:", error);
      return null;
    }
  });

interface SmsPayload {
  userId: string;
  medicineId: string;
  medicineName: string;
  scheduledTime: string;
  todayDateString: string;
}

async function sendSmsToRelative(payload: SmsPayload): Promise<void> {
  const { userId, medicineId, medicineName, scheduledTime, todayDateString } = payload;

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    const fullName = userData?.fullName || "Hastanız";
    const relativeFullName = userData?.relativeFullName || "Hasta Yakını";
    const relativePhoneNumber = userData?.relativePhoneNumber;

    if (!relativePhoneNumber) return;

    const messageBody = `Sayın ${relativeFullName}, hastanız ${fullName} saat ${scheduledTime}'da alması gereken ${medicineName} ilacını henüz almadı. Lütfen kontrol ediniz.`;

    if (process.env.TWILIO_ACCOUNT_SID && twilioPhoneNumber) {
      await twilioClient.messages.create({
        body: messageBody,
        from: twilioPhoneNumber,
        to: relativePhoneNumber,
      });
    }

    await db
      .collection("users")
      .doc(userId)
      .collection("medicines")
      .doc(medicineId)
      .update({
        lastSmsNotifiedDate: todayDateString,
      });
  } catch (error) {
    console.error(`SMS Gönderme Hatası:`, error);
  }
}
