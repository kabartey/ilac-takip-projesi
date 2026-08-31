import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:provider/provider.dart';
import 'package:meditrack_app/core/constants/app_colors.dart';
import 'package:meditrack_app/core/localization/app_localizations.dart';
import 'package:meditrack_app/models/user_model.dart';
import 'package:meditrack_app/providers/locale_provider.dart';
import 'package:meditrack_app/screens/widgets/language_selector_sheet.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _relativeFullNameController = TextEditingController();
  final TextEditingController _relativePhoneController = TextEditingController();

  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _relativeFullNameController.dispose();
    _relativePhoneController.dispose();
    super.dispose();
  }

  Future<void> _registerUser() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final UserCredential userCredential =
          await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );

      final User? firebaseUser = userCredential.user;

      if (firebaseUser != null) {
        await firebaseUser.updateDisplayName(_fullNameController.text.trim());

        final UserModel newUser = UserModel(
          uid: firebaseUser.uid,
          fullName: _fullNameController.text.trim(),
          email: _emailController.text.trim(),
          phoneNumber: _phoneController.text.trim(),
          relativeFullName: _relativeFullNameController.text.trim(),
          relativePhoneNumber: _relativePhoneController.text.trim(),
          createdAt: DateTime.now(),
        );

        await FirebaseFirestore.instance
            .collection('users')
            .doc(newUser.uid)
            .set(newUser.toMap());

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(context.tr('register_and_start')),
              backgroundColor: AppColors.primary,
            ),
          );
          Navigator.pushReplacementNamed(context, '/home');
        }
      }
    } on FirebaseAuthException catch (e) {
      String errorMessage = context.tr('generic_error', params: {'error': ''});
      if (e.code == 'weak-password') {
        errorMessage = context.tr('weak_password');
      } else if (e.code == 'email-already-in-use') {
        errorMessage = context.tr('email_in_use');
      } else if (e.code == 'invalid-email') {
        errorMessage = context.tr('invalid_email');
      } else {
        errorMessage = e.message ?? errorMessage;
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMessage), backgroundColor: AppColors.danger),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(context.tr('generic_error', params: {'error': e.toString()})),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final currentLang = AppLocalizations.supportedLanguages.firstWhere(
      (l) => l.code == localeProvider.languageCode,
      orElse: () => AppLocalizations.supportedLanguages.first,
    );

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
          context.tr('register'),
          style: const TextStyle(
            color: AppColors.textLight,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          InkWell(
            onTap: () => LanguageSelectorSheet.show(context),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  context.tr('create_account_title'),
                  style: const TextStyle(
                    color: AppColors.textLight,
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  context.tr('create_account_desc'),
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 24),

                _buildSectionHeader(Icons.person_outline, context.tr('personal_info')),
                const SizedBox(height: 12),
                _buildCardWrapper([
                  _buildTextField(
                    _fullNameController,
                    context.tr('full_name'),
                    context.tr('name_example'),
                    Icons.badge_outlined,
                  ),
                  const SizedBox(height: 14),
                  _buildTextField(
                    _emailController,
                    context.tr('email'),
                    'ornek@email.com',
                    Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 14),
                  _buildTextField(
                    _passwordController,
                    context.tr('password'),
                    context.tr('min_6_char'),
                    Icons.lock_outline,
                    obscureText: _obscurePassword,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off : Icons.visibility,
                        color: AppColors.textMuted,
                        size: 20,
                      ),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _buildTextField(
                    _phoneController,
                    context.tr('phone_number'),
                    context.tr('phone_example'),
                    Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                  ),
                ]),

                const SizedBox(height: 24),

                _buildSectionHeader(Icons.favorite_border, context.tr('emergency_contact')),
                const SizedBox(height: 12),
                _buildCardWrapper([
                  _buildTextField(
                    _relativeFullNameController,
                    context.tr('relative_name'),
                    context.tr('relative_example'),
                    Icons.people_outline,
                  ),
                  const SizedBox(height: 14),
                  _buildTextField(
                    _relativePhoneController,
                    context.tr('relative_phone'),
                    context.tr('phone_example'),
                    Icons.contact_phone_outlined,
                    keyboardType: TextInputType.phone,
                  ),
                ]),

                const SizedBox(height: 32),

                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _registerUser,
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
                        : Text(
                            context.tr('register_and_start'),
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primaryLight, size: 18),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: AppColors.primaryLight,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _buildCardWrapper(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: AppColors.darkCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.darkBorder),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    String hint,
    IconData icon, {
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    Widget? suffixIcon,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      style: const TextStyle(color: AppColors.textLight, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
        hintText: hint,
        hintStyle: TextStyle(color: AppColors.textMuted.withOpacity(0.5), fontSize: 13),
        prefixIcon: Icon(icon, color: AppColors.textMuted, size: 20),
        suffixIcon: suffixIcon,
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
      ),
      validator: (val) =>
          (val == null || val.trim().isEmpty) ? context.tr('field_required') : null,
    );
  }
}
