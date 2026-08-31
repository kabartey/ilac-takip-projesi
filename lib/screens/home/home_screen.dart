import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart' hide AuthProvider;
import 'package:cached_network_image/cached_network_image.dart';
import 'package:meditrack_app/core/constants/app_colors.dart';
import 'package:meditrack_app/models/medicine_model.dart';
import 'package:meditrack_app/providers/medicine_provider.dart';
import 'package:meditrack_app/providers/auth_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Kullanıcı ID'sini MedicineProvider'a aktar
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        context.read<MedicineProvider>().updateUserId(user.uid);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final medicineProvider = context.watch<MedicineProvider>();
    final medicines = medicineProvider.medicines;
    final lowStockMeds = medicineProvider.lowStockMedicines;

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Merhaba, ${authProvider.userModel?.fullName ?? 'Kullanıcı'}',
              style: const TextStyle(color: AppColors.textLight, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const Text(
              'Bugünkü İlaç Programınız',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.textMuted),
            onPressed: () async {
              await authProvider.signOut();
              if (mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
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
                                  'Acil Durum Yakını: ${authProvider.userModel!.relativeFullName} (${authProvider.userModel!.relativePhoneNumber})',
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
                                  '${lowStockMeds.length} ilacınızın stoğu azalıyor (${lowStockMeds.map((e) => e.name).join(', ')})',
                                  style: const TextStyle(color: AppColors.warning, fontSize: 12, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 20),
                      const Text(
                        'Kayıtlı İlaçlarınız',
                        style: TextStyle(color: AppColors.textLight, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),

                      if (medicines.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 40),
                            child: Column(
                              children: const [
                                Icon(Icons.medication_liquid_outlined, color: AppColors.textMuted, size: 48),
                                SizedBox(height: 12),
                                Text(
                                  'Henüz ilaç eklenmemiş.\n"+" butonuna basarak ilk ilacınızı ekleyin.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: AppColors.textMuted, fontSize: 13),
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
          final result = await Navigator.pushNamed(context, '/add-medicine');
          if (result == true) {
            // Liste otomatik stream ile güncellenecektir
          }
        },
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('İlaç Ekle', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildMedicineCard(MedicineModel med) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.darkCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: med.isLowStock ? AppColors.warning.withOpacity(0.5) : AppColors.darkBorder),
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
                      placeholder: (context, url) => const Icon(Icons.medication, color: AppColors.primaryLight),
                      errorWidget: (context, url, error) => const Icon(Icons.medication, color: AppColors.primaryLight),
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
                  style: const TextStyle(color: AppColors.textLight, fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.access_time, color: AppColors.textMuted, size: 13),
                    const SizedBox(width: 4),
                    Text(
                      med.formattedTime,
                      style: const TextStyle(color: AppColors.primaryLight, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      '• Doz: ${med.dosage}',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  'Kalan Stok: ${med.stock} adet',
                  style: TextStyle(
                    color: med.isLowStock ? AppColors.warning : AppColors.textMuted,
                    fontSize: 12,
                    fontWeight: med.isLowStock ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),

          // İçtim Butonu
          ElevatedButton(
            onPressed: med.stock > 0
                ? () async {
                    await context.read<MedicineProvider>().takeDose(med);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('${med.name} alındı olarak kaydedildi.'),
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
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('İçtim ✅', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
