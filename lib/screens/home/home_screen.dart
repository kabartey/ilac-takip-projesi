import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart' hide AuthProvider;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:meditrack_app/core/constants/app_colors.dart';
import 'package:meditrack_app/core/localization/app_localizations.dart';
import 'package:meditrack_app/models/medicine_model.dart';
import 'package:meditrack_app/providers/medicine_provider.dart';
import 'package:meditrack_app/providers/auth_provider.dart';
import 'package:meditrack_app/providers/locale_provider.dart';
import 'package:meditrack_app/screens/widgets/language_selector_sheet.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        context.read<MedicineProvider>().updateUserId(user.uid);
      }
    });
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.darkCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text(
          context.tr('logout_confirm_title'),
          style: const TextStyle(color: AppColors.textLight, fontWeight: FontWeight.bold),
        ),
        content: Text(
          context.tr('logout_confirm_desc'),
          style: const TextStyle(color: AppColors.textMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(context.tr('cancel'), style: const TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<AuthProvider>().signOut();
              if (mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
            child: Text(context.tr('logout')),
          ),
        ],
      ),
    );
  }

  void _showDeleteMedicineDialog(MedicineModel med) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.darkCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text(
          med.name,
          style: const TextStyle(color: AppColors.textLight, fontWeight: FontWeight.bold),
        ),
        content: Text(
          context.tr('delete_medicine_confirm'),
          style: const TextStyle(color: AppColors.textMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(context.tr('cancel'), style: const TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<MedicineProvider>().deleteMedicine(med.id);
            },
            child: Text(context.tr('delete')),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final medicineProvider = context.watch<MedicineProvider>();
    final localeProvider = context.watch<LocaleProvider>();
    final medicines = medicineProvider.medicines;
    final lowStockMeds = medicineProvider.lowStockMedicines;

    // Current language info
    final currentLang = AppLocalizations.supportedLanguages.firstWhere(
      (l) => l.code == localeProvider.languageCode,
      orElse: () => AppLocalizations.supportedLanguages.first,
    );

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${context.tr('hello')}, ${authProvider.userModel?.fullName ?? context.tr('user')}',
              style: const TextStyle(
                color: AppColors.textLight,
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              context.tr('today_schedule'),
              style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
          ],
        ),
        actions: [
          // Dil Seçici Butonu
          InkWell(
            onTap: () => LanguageSelectorSheet.show(context),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.darkCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.darkBorder),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(currentLang.flag, style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 4),
                  Text(
                    currentLang.code.toUpperCase(),
                    style: const TextStyle(
                      color: AppColors.primaryLight,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.textMuted),
            tooltip: context.tr('logout'),
            onPressed: _showLogoutDialog,
          ),
        ],
      ),
      body: SafeArea(
        child: medicineProvider.isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async {
                  final user = FirebaseAuth.instance.currentUser;
                  if (user != null) {
                    context.read<MedicineProvider>().updateUserId(user.uid);
                  }
                },
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Acil Durum / Hasta Yakını Bilgi Bandı
                      if (authProvider.userModel != null)
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppColors.darkCard,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.shield_outlined, color: AppColors.primaryLight, size: 20),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  '${context.tr('relative_banner_label')}: ${authProvider.userModel!.relativeFullName} (${authProvider.userModel!.relativePhoneNumber})',
                                  style: const TextStyle(color: AppColors.textLight, fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        ),

                      // Düşük Stok Uyarısı
                      if (lowStockMeds.isNotEmpty) ...[
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.warning.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.warning.withOpacity(0.4)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  context.tr('low_stock_warning', params: {
                                    'count': lowStockMeds.length.toString(),
                                    'names': lowStockMeds.map((e) => e.name).join(', '),
                                  }),
                                  style: const TextStyle(
                                    color: AppColors.warning,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 20),
                      Text(
                        context.tr('registered_medicines'),
                        style: const TextStyle(
                          color: AppColors.textLight,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),

                      if (medicines.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 40),
                            child: Column(
                              children: [
                                const Icon(Icons.medication_liquid_outlined, color: AppColors.textMuted, size: 48),
                                const SizedBox(height: 12),
                                Text(
                                  context.tr('no_medicines_yet'),
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(color: AppColors.textMuted, fontSize: 13, height: 1.5),
                                ),
                              ],
                            ),
                          ),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: medicines.length,
                          itemBuilder: (context, index) {
                            final med = medicines[index];
                            return _buildMedicineCard(med);
                          },
                        ),
                    ],
                  ),
                ),
              ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.pushNamed(context, '/add-medicine');
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(
          context.tr('add_medicine'),
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildMedicineCard(MedicineModel med) {
    return Dismissible(
      key: Key(med.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppColors.danger.withOpacity(0.8),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white, size: 28),
      ),
      confirmDismiss: (direction) async {
        _showDeleteMedicineDialog(med);
        return false;
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.darkCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: med.isLowStock ? AppColors.warning.withOpacity(0.5) : AppColors.darkBorder,
          ),
        ),
        child: Row(
          children: [
            // Görsel veya İkon
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: 50,
                height: 50,
                color: AppColors.darkBackground,
                child: med.imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: med.imageUrl!,
                        fit: BoxFit.cover,
                        placeholder: (context, url) =>
                            const Icon(Icons.medication, color: AppColors.primaryLight),
                        errorWidget: (context, url, error) =>
                            const Icon(Icons.medication, color: AppColors.primaryLight),
                      )
                    : const Icon(Icons.medication, color: AppColors.primaryLight, size: 26),
              ),
            ),
            const SizedBox(width: 14),

            // İlaç Bilgileri
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    med.name,
                    style: const TextStyle(
                      color: AppColors.textLight,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.access_time, color: AppColors.textMuted, size: 13),
                      const SizedBox(width: 4),
                      Text(
                        med.formattedTime,
                        style: const TextStyle(
                          color: AppColors.primaryLight,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Flexible(
                        child: Text(
                          '• ${context.tr('dose')}: ${med.dosage}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    context.tr('remaining_stock', params: {'stock': med.stock.toString()}),
                    style: TextStyle(
                      color: med.isLowStock ? AppColors.warning : AppColors.textMuted,
                      fontSize: 12,
                      fontWeight: med.isLowStock ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),

            // İçtim Butonu
            ElevatedButton(
              onPressed: med.stock > 0
                  ? () async {
                      await context.read<MedicineProvider>().takeDose(med);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              context.tr('dose_recorded_success', params: {'name': med.name}),
                            ),
                            backgroundColor: AppColors.success,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      }
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: Text(
                context.tr('took_dose'),
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
