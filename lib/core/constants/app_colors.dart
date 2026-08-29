import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Birincil Medikal Renkler
  static const Color primary = Color(0xFF0D9488);      // Teal 600
  static const Color primaryLight = Color(0xFF14B8A6); // Teal 500
  static const Color primaryDark = Color(0xFF0F766E);  // Teal 700
  static const Color accent = Color(0xFF0284C7);       // Sky Blue 600

  // Durum Renkleri
  static const Color success = Color(0xFF10B981);      // Emerald 500 (İçildi)
  static const Color warning = Color(0xFFF59E0B);      // Amber 500 (Ertelendi/Kritik Stok)
  static const Color danger = Color(0xFFEF4444);       // Red 500 (Atlandı/Bitti)
  static const Color info = Color(0xFF3B82F6);         // Blue 500

  // Zemin & Kart Renkleri (Dark Theme)
  static const Color darkBackground = Color(0xFF0F172A); // Slate 900
  static const Color darkCard = Color(0xFF1E293B);       // Slate 800
  static const Color darkBorder = Color(0xFF334155);     // Slate 700
  static const Color textLight = Color(0xFFF8FAFC);      // Slate 50
  static const Color textMuted = Color(0xFF94A3B8);      // Slate 400
}
