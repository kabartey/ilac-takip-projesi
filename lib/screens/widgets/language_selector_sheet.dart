import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:meditrack_app/core/constants/app_colors.dart';
import 'package:meditrack_app/core/localization/app_localizations.dart';
import 'package:meditrack_app/providers/locale_provider.dart';

class LanguageSelectorSheet extends StatelessWidget {
  const LanguageSelectorSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkCard,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => const LanguageSelectorSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final currentCode = localeProvider.languageCode;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.language, color: AppColors.primaryLight, size: 24),
                    const SizedBox(width: 10),
                    Text(
                      context.tr('select_language'),
                      style: const TextStyle(
                        color: AppColors.textLight,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textMuted, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...AppLocalizations.supportedLanguages.map((lang) {
              final isSelected = lang.code == currentCode;
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primary.withOpacity(0.15)
                      : AppColors.darkBackground.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.darkBorder,
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
                  leading: Text(
                    lang.flag,
                    style: const TextStyle(fontSize: 26),
                  ),
                  title: Text(
                    lang.nativeName,
                    style: TextStyle(
                      color: isSelected ? AppColors.textLight : AppColors.textLight.withOpacity(0.9),
                      fontSize: 15,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    ),
                  ),
                  subtitle: Text(
                    lang.name,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                  trailing: isSelected
                      ? const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 22)
                      : const Icon(Icons.radio_button_unchecked, color: AppColors.textMuted, size: 20),
                  onTap: () async {
                    await context.read<LocaleProvider>().setLanguageCode(lang.code);
                    if (context.mounted) {
                      Navigator.pop(context);
                    }
                  },
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
