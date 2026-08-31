import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' hide AuthProvider;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:meditrack_app/core/constants/app_colors.dart';
import 'package:meditrack_app/core/localization/app_localizations.dart';
import 'package:meditrack_app/models/medicine_model.dart';
import 'package:meditrack_app/providers/medicine_provider.dart';

class AddMedicineScreen extends StatefulWidget {
  const AddMedicineScreen({super.key});

  @override
  State<AddMedicineScreen> createState() => _AddMedicineScreenState();
}

class _AddMedicineScreenState extends State<AddMedicineScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _stockController = TextEditingController(text: '20');
  final TextEditingController _dosageController = TextEditingController(text: '1');

  TimeOfDay _selectedTime = const TimeOfDay(hour: 8, minute: 0);
  File? _imageFile;
  final ImagePicker _picker = ImagePicker();
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _stockController.dispose();
    _dosageController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 80,
      );

      if (pickedFile != null && mounted) {
        setState(() => _imageFile = File(pickedFile.path));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(context.tr('photo_error', params: {'error': e.toString()})),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    }
  }

  void _showImageSourceActionSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                context.tr('box_photo_title'),
                style: const TextStyle(
                  color: AppColors.textLight,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.camera_alt_outlined, color: AppColors.primaryLight),
                title: Text(
                  context.tr('take_camera'),
                  style: const TextStyle(color: AppColors.textLight),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_outlined, color: AppColors.primaryLight),
                title: Text(
                  context.tr('choose_gallery'),
                  style: const TextStyle(color: AppColors.textLight),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _selectTime() async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              surface: AppColors.darkCard,
              onSurface: AppColors.textLight,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _selectedTime && mounted) {
      setState(() => _selectedTime = picked);
    }
  }

  Future<String?> _uploadImage(String userId, String medicineId) async {
    if (_imageFile == null) return null;

    try {
      final Reference storageRef = FirebaseStorage.instance
          .ref()
          .child('users')
          .child(userId)
          .child('medicines')
          .child('${medicineId}_${DateTime.now().millisecondsSinceEpoch}.jpg');

      final UploadTask uploadTask = storageRef.putFile(
        _imageFile!,
        SettableMetadata(contentType: 'image/jpeg'),
      );

      final TaskSnapshot snapshot = await uploadTask.timeout(const Duration(seconds: 15));
      return await snapshot.ref.getDownloadURL().timeout(const Duration(seconds: 10));
    } catch (e) {
      debugPrint('Fotoğraf yükleme uyarısı/hatası: $e');
      return null;
    }
  }

  Future<void> _saveMedicine() async {
    if (!_formKey.currentState!.validate()) return;

    final User? currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.tr('login_first')),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final String uid = currentUser.uid;
      final DocumentReference docRef = FirebaseFirestore.instance
          .collection('users')
          .doc(uid)
          .collection('medicines')
          .doc();

      final String medicineId = docRef.id;

      String? imageUrl;
      if (_imageFile != null) {
        imageUrl = await _uploadImage(uid, medicineId);
      }

      final MedicineModel newMedicine = MedicineModel(
        id: medicineId,
        userId: uid,
        name: _nameController.text.trim(),
        dosage: '${_dosageController.text.trim()} ${context.tr('dosage_unit')}',
        stock: int.parse(_stockController.text.trim()),
        timeHours: _selectedTime.hour,
        timeMinutes: _selectedTime.minute,
        imageUrl: imageUrl,
        createdAt: DateTime.now(),
      );

      // Provider üzerinden ekle (hem Firestore'a yazar hem alarm kurar)
      await context.read<MedicineProvider>().addMedicine(newMedicine);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              context.tr('medicine_saved_success', params: {'name': newMedicine.name}),
            ),
            backgroundColor: AppColors.primary,
            duration: const Duration(seconds: 2),
          ),
        );
        // Otomatik olarak önceki ekrana dön
        Navigator.pop(context, true);
      }
    } catch (e) {
      debugPrint('İlaç kaydetme hatası: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(context.tr('generic_error', params: {'error': e.toString()})),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final String formattedTimeStr =
        '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}';

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(
            context.isRTL ? Icons.arrow_forward_ios : Icons.arrow_back_ios_new,
            color: AppColors.textLight,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          context.tr('new_medicine_title'),
          style: const TextStyle(
            color: AppColors.textLight,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Fotoğraf Alanı
                Center(
                  child: GestureDetector(
                    onTap: _showImageSourceActionSheet,
                    child: Container(
                      width: 130,
                      height: 130,
                      decoration: BoxDecoration(
                        color: AppColors.darkCard,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.primary.withOpacity(0.5), width: 1.5),
                        image: _imageFile != null
                            ? DecorationImage(
                                image: FileImage(_imageFile!),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      child: _imageFile == null
                          ? Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.add_a_photo_outlined, color: AppColors.primaryLight, size: 32),
                                const SizedBox(height: 6),
                                Text(
                                  context.tr('box_photo'),
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    color: AppColors.textMuted,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            )
                          : null,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Form Kartı
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppColors.darkCard,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.darkBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        context.tr('medicine_name'),
                        style: const TextStyle(
                          color: AppColors.textLight,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextFormField(
                        controller: _nameController,
                        style: const TextStyle(color: AppColors.textLight, fontSize: 14),
                        decoration: _inputDecoration(
                          context.tr('med_name_example'),
                          Icons.medication_outlined,
                        ),
                        validator: (val) =>
                            (val == null || val.trim().isEmpty) ? context.tr('field_required') : null,
                      ),
                      const SizedBox(height: 16),

                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  context.tr('dosage_label'),
                                  style: const TextStyle(
                                    color: AppColors.textLight,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                TextFormField(
                                  controller: _dosageController,
                                  keyboardType: TextInputType.number,
                                  style: const TextStyle(color: AppColors.textLight, fontSize: 14),
                                  decoration: _inputDecoration('1', Icons.numbers_outlined),
                                  validator: (val) =>
                                      (val == null || val.isEmpty) ? context.tr('field_required') : null,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  context.tr('current_stock'),
                                  style: const TextStyle(
                                    color: AppColors.textLight,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                TextFormField(
                                  controller: _stockController,
                                  keyboardType: TextInputType.number,
                                  style: const TextStyle(color: AppColors.textLight, fontSize: 14),
                                  decoration: _inputDecoration('20', Icons.inventory_2_outlined),
                                  validator: (val) =>
                                      (val == null || val.isEmpty) ? context.tr('field_required') : null,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      Text(
                        context.tr('reminder_time'),
                        style: const TextStyle(
                          color: AppColors.textLight,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 6),
                      InkWell(
                        onTap: _selectTime,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: AppColors.darkBackground.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.darkBorder),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.access_time_filled_rounded, color: AppColors.primaryLight, size: 20),
                                  const SizedBox(width: 10),
                                  Text(
                                    formattedTimeStr,
                                    style: const TextStyle(
                                      color: AppColors.textLight,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  context.tr('change'),
                                  style: const TextStyle(
                                    color: AppColors.primaryLight,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _saveMedicine,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 4,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.save_outlined, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                context.tr('save_medicine_btn'),
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: AppColors.textMuted.withOpacity(0.5), fontSize: 13),
      prefixIcon: Icon(icon, color: AppColors.textMuted, size: 20),
      filled: true,
      fillColor: AppColors.darkBackground.withOpacity(0.6),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.darkBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
    );
  }
}
