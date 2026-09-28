import 'dart:typed_data';
import 'package:crop_your_image/crop_your_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:image_picker/image_picker.dart';
import 'package:moonlinks/catalogue/api/catalogue_api.dart';
import 'package:moonlinks/functions/secure_storage.dart';
import 'package:moonlinks/l10n/app_localizations.dart';
import 'package:moonlinks/menu/elements/z_custom/custom_menu_button.dart';

final catalogueService = CatalogueApi();
final ImagePicker _picker = ImagePicker();

Future<String> catalogueCustomPickImage(
    BuildContext context, double aspectRatio) async {
  final picked = await _picker.pickImage(
    source: ImageSource.gallery,
    maxWidth: 1080,
    maxHeight: 1080,
    imageQuality: 100,
  );

  if (picked == null) return '';

  final bytes = await picked.readAsBytes();

  // ✅ Crop
  final cropController = CropController();
  Uint8List? croppedData = await showDialog<Uint8List>(
    context: context,
    barrierDismissible: false,
    builder: (_) => Dialog(
      child: SizedBox(
        width: 400,
        height: 450,
        child: Column(
          children: [
            Expanded(
              child: Crop(
                image: bytes,
                controller: cropController,
                aspectRatio: aspectRatio,
                onCropped: (result) {
                  switch (result) {
                    case CropSuccess(:final croppedImage):
                      Navigator.of(context).pop(croppedImage);
                    case CropFailure():
                      Navigator.of(context).pop();
                  }
                },
                baseColor: Colors.black,
                maskColor: Colors.black.withAlpha(100),
                cornerDotBuilder: (size, edgeAlignment) =>
                    DotControl(color: Colors.white),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: CustomMenuButton(
                onPressed: () => cropController.crop(),
                child: AppLocalizations.of(context)!.menu_add_image,
              ),
            ),
          ],
        ),
      ),
    ),
  );

  if (croppedData == null) return '';

  // ✅ Show loader ONLY for heavy operations (compress + upload)
  showLoader(context);

  try {
    // Determine extension safely
    final extension = picked.path.split('.').last.toLowerCase();

    Uint8List finalData;

    // ✅ Compress AFTER crop (fast now because image is smaller)
    if (extension == 'png') {
      finalData = await FlutterImageCompress.compressWithList(
            croppedData,
            quality: 80,
            format: CompressFormat.png,
          ) ??
          croppedData;
    } else if (extension == 'webp') {
      finalData = await FlutterImageCompress.compressWithList(
            croppedData,
            quality: 70,
            format: CompressFormat.webp,
          ) ??
          croppedData;
    } else {
      finalData = await FlutterImageCompress.compressWithList(
            croppedData,
            quality: 70,
            format: CompressFormat.jpeg,
          ) ??
          croppedData;
    }

    final url = await catalogueService
        .uploadImage(finalData, picked.name)
        .timeout(const Duration(seconds: 20));

    hideLoader(context);
    return url;
  } catch (e) {
    hideLoader(context);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppLocalizations.of(context)!.menu_upload_failed)),
    );

    return '';
  }
}

void showLoader(BuildContext context) {
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (_) => const Center(
      child: CircularProgressIndicator(
        color: Colors.purple,
      ),
    ),
  );
}

void hideLoader(BuildContext context) {
  Navigator.of(context, rootNavigator: true).pop();
}

String customServerName = link;
