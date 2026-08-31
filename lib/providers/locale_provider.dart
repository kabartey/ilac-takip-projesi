import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleProvider extends ChangeNotifier {
  static const String _prefKey = 'selected_language_code';

  Locale _locale = const Locale('tr');
  bool _isInitialized = false;

  Locale get locale => _locale;
  String get languageCode => _locale.languageCode;
  bool get isInitialized => _isInitialized;
  bool get isRTL => _locale.languageCode == 'ar';

  LocaleProvider() {
    _loadSavedLocale();
  }

  Future<void> _loadSavedLocale() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? savedCode = prefs.getString(_prefKey);
      if (savedCode != null &&
          ['tr', 'en', 'es', 'zh', 'ja', 'ar', 'fr'].contains(savedCode)) {
        _locale = Locale(savedCode);
      }
    } catch (e) {
      debugPrint('Dil yüklenirken hata: $e');
    } finally {
      _isInitialized = true;
      notifyListeners();
    }
  }

  Future<void> setLocale(Locale newLocale) async {
    if (!['tr', 'en', 'es', 'zh', 'ja', 'ar', 'fr']
        .contains(newLocale.languageCode)) {
      return;
    }

    if (_locale == newLocale) return;

    _locale = newLocale;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKey, newLocale.languageCode);
    } catch (e) {
      debugPrint('Dil kaydedilirken hata: $e');
    }
  }

  Future<void> setLanguageCode(String code) async {
    await setLocale(Locale(code));
  }
}
