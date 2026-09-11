// ============================================================================
// HIMALAYA ERP - FLUTTER INAPPWEBVIEW NATIVE HANDLERS
// File: flutter_webview_handlers.dart
// Location: docs/mobile/flutter_webview_handlers.dart
// 
// Description:
// Complete native handlers for InAppWebView in Flutter to enable:
//   1. Direct Base64 Image / PDF Download to Android MediaStore / Gallery
//   2. Native Image Sharing via Share Sheet / WhatsApp
//   3. Geolocation & Notification Permissions
// Completely bypasses browser blob: URLs (no DioException).
// ============================================================================

import 'dart:convert';
import 'dart:typed_data';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:image_gallery_saver/image_gallery_saver.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:geolocator/geolocator.dart';

/// Attaches all Himalaya ERP native handlers to the InAppWebViewController
void setupHimalayaWebViewHandlers({
  required InAppWebViewController controller,
  required BuildContext context,
}) {
  // --------------------------------------------------------------------------
  // 1. DOWNLOAD QUOTATION IMAGE / PDF HANDLER
  // --------------------------------------------------------------------------
  controller.addJavaScriptHandler(
    handlerName: 'downloadQuotationImage',
    callback: (args) async {
      try {
        String base64Data = '';
        String fileName = 'quotation.png';

        if (args.isNotEmpty) {
          if (args[0] is Map) {
            final map = args[0] as Map;
            base64Data = map['base64'] ?? map['data'] ?? '';
            fileName = map['fileName'] ?? map['filename'] ?? 'quotation.png';
          } else {
            base64Data = args[0].toString();
            if (args.length > 1) {
              fileName = args[1].toString();
            }
          }
        }

        if (base64Data.isEmpty) {
          return {'success': false, 'error': 'Empty base64 data'};
        }

        // Clean any data uri prefix if present
        if (base64Data.contains(',')) {
          base64Data = base64Data.split(',').last;
        }

        final Uint8List bytes = base64Decode(base64Data);

        // Save to Android Gallery / iOS Photos
        final cleanName = fileName
            .replaceAll('.png', '')
            .replaceAll('.jpg', '')
            .replaceAll('.jpeg', '')
            .replaceAll('.pdf', '');

        final result = await ImageGallerySaver.saveImage(
          bytes,
          name: cleanName,
          isReturnImagePathOfIOS: true,
        );

        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✓ Quotation saved to Gallery'),
              backgroundColor: Color(0xFF16A34A),
              duration: Duration(seconds: 2),
            ),
          );
        }

        return {'success': true, 'result': result};
      } catch (e) {
        debugPrint('[HimalayaWebView] downloadQuotationImage error: $e');
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Unable to save quotation: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
        return {'success': false, 'error': e.toString()};
      }
    },
  );

  // --------------------------------------------------------------------------
  // 2. SAVE TO GALLERY HANDLER (Generic)
  // --------------------------------------------------------------------------
  controller.addJavaScriptHandler(
    handlerName: 'saveToGallery',
    callback: (args) async {
      try {
        String base64Data = '';
        String fileName = 'image.png';

        if (args.isNotEmpty) {
          if (args[0] is Map) {
            final map = args[0] as Map;
            base64Data = map['base64'] ?? map['data'] ?? '';
            fileName = map['fileName'] ?? map['filename'] ?? 'image.png';
          } else {
            base64Data = args[0].toString();
            if (args.length > 1) {
              fileName = args[1].toString();
            }
          }
        }

        if (base64Data.isEmpty) {
          return {'success': false, 'error': 'Empty base64 data'};
        }

        if (base64Data.contains(',')) {
          base64Data = base64Data.split(',').last;
        }

        final Uint8List bytes = base64Decode(base64Data);
        final cleanName = fileName.replaceAll(RegExp(r'\.[a-zA-Z0-9]+$'), '');

        final result = await ImageGallerySaver.saveImage(
          bytes,
          name: cleanName,
          isReturnImagePathOfIOS: true,
        );

        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✓ Image saved to Gallery'),
              backgroundColor: Color(0xFF16A34A),
              duration: Duration(seconds: 2),
            ),
          );
        }

        return {'success': true, 'result': result};
      } catch (e) {
        debugPrint('[HimalayaWebView] saveToGallery error: $e');
        return {'success': false, 'error': e.toString()};
      }
    },
  );

  // --------------------------------------------------------------------------
  // 3. SHARE QUOTATION IMAGE HANDLER
  // --------------------------------------------------------------------------
  controller.addJavaScriptHandler(
    handlerName: 'shareQuotationImage',
    callback: (args) async {
      try {
        String base64Data = '';
        String fileName = 'quotation.png';
        String text = 'Himalaya Quotation';

        if (args.isNotEmpty) {
          if (args[0] is Map) {
            final map = args[0] as Map;
            base64Data = map['base64'] ?? map['data'] ?? '';
            fileName = map['fileName'] ?? map['filename'] ?? 'quotation.png';
            text = map['text'] ?? map['caption'] ?? 'Himalaya Quotation';
          } else {
            base64Data = args[0].toString();
            if (args.length > 1) {
              fileName = args[1].toString();
            }
            if (args.length > 2) {
              text = args[2].toString();
            }
          }
        }

        if (base64Data.isEmpty) {
          return {'success': false, 'error': 'Empty base64 data'};
        }

        if (base64Data.contains(',')) {
          base64Data = base64Data.split(',').last;
        }

        final Uint8List bytes = base64Decode(base64Data);
        final tempDir = await getTemporaryDirectory();
        final file = File('${tempDir.path}/$fileName');
        await file.writeAsBytes(bytes);

        await Share.shareXFiles(
          [XFile(file.path)],
          text: text.isNotEmpty ? text : 'Himalaya Quotation',
        );

        return {'success': true};
      } catch (e) {
        debugPrint('[HimalayaWebView] shareQuotationImage error: $e');
        return {'success': false, 'error': e.toString()};
      }
    },
  );

  // --------------------------------------------------------------------------
  // 4. GENERIC SHARE FILE HANDLER
  // --------------------------------------------------------------------------
  controller.addJavaScriptHandler(
    handlerName: 'shareFile',
    callback: (args) async {
      try {
        String base64Data = '';
        String fileName = 'file';
        String text = '';

        if (args.isNotEmpty && args[0] is Map) {
          final map = args[0] as Map;
          base64Data = map['base64'] ?? map['data'] ?? '';
          fileName = map['fileName'] ?? map['filename'] ?? 'file';
          text = map['text'] ?? '';
        }

        if (base64Data.isNotEmpty) {
          if (base64Data.contains(',')) {
            base64Data = base64Data.split(',').last;
          }
          final Uint8List bytes = base64Decode(base64Data);
          final tempDir = await getTemporaryDirectory();
          final file = File('${tempDir.path}/$fileName');
          await file.writeAsBytes(bytes);

          await Share.shareXFiles(
            [XFile(file.path)],
            text: text,
          );
          return {'success': true};
        }
        return {'success': false, 'error': 'No data'};
      } catch (e) {
        return {'success': false, 'error': e.toString()};
      }
    },
  );

  // --------------------------------------------------------------------------
  // 5. NATIVE GEOLOCATION HANDLER (Android Fused Location Provider)
  // --------------------------------------------------------------------------
  Future<Map<String, dynamic>> handleNativeLocation() async {
    debugPrint('[NativeLocation] request started');
    try {
      // Step 1: Check runtime permission (ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION)
      var status = await Permission.locationWhenInUse.status;
      debugPrint('[NativeLocation] permission = ${status.name}');

      if (!status.isGranted) {
        status = await Permission.locationWhenInUse.request();
        debugPrint('[NativeLocation] requested permission = ${status.name}');
      }

      if (status.isPermanentlyDenied) {
        debugPrint('[NativeLocation] error = PERMISSION_PERMANENTLY_DENIED');
        return {
          'success': false,
          'errorCode': 'PERMISSION_PERMANENTLY_DENIED',
          'message': 'Location permission permanently denied. Please allow in App Settings.',
        };
      }

      if (!status.isGranted) {
        debugPrint('[NativeLocation] error = PERMISSION_DENIED');
        return {
          'success': false,
          'errorCode': 'PERMISSION_DENIED',
          'message': 'Location permission was denied.',
        };
      }

      // Step 2: Check Location Services enabled
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      debugPrint('[NativeLocation] services = ${serviceEnabled ? 'enabled' : 'disabled'}');
      if (!serviceEnabled) {
        debugPrint('[NativeLocation] error = LOCATION_SERVICES_DISABLED');
        return {
          'success': false,
          'errorCode': 'LOCATION_SERVICES_DISABLED',
          'message': 'Location services are disabled.',
        };
      }

      // Step 3: Fused Location Strategy
      // 1. High accuracy fresh location — 10 seconds (GPS + Wi-Fi + Mobile)
      debugPrint('[NativeLocation] requesting fused location');
      Position? position;

      try {
        debugPrint('[NativeLocation] stage 1: requesting high accuracy fresh location (10s)');
        position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 10),
          ),
        );
      } catch (highErr) {
        debugPrint('[NativeLocation] stage 1 timeout/failure: $highErr');
        try {
          // 2. Medium/balanced accuracy fresh location — 15 seconds (fused Wi-Fi/cell)
          debugPrint('[NativeLocation] stage 2: requesting medium accuracy balanced location (15s)');
          position = await Geolocator.getCurrentPosition(
            locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.medium,
              timeLimit: Duration(seconds: 15),
            ),
          );
        } catch (medErr) {
          debugPrint('[NativeLocation] stage 2 timeout/failure: $medErr');

          // 3. Last known location ONLY if exists, recent (<= 120s), and accurate (<= 100m)
          try {
            debugPrint('[NativeLocation] stage 3: inspecting last known position');
            final lastKnown = await Geolocator.getLastKnownPosition();
            if (lastKnown != null) {
              final ageSeconds = DateTime.now().difference(lastKnown.timestamp).inSeconds.abs();
              final isRecent = ageSeconds <= 120; // Within 2 minutes
              final isAccurate = lastKnown.accuracy <= 100; // Within 100 meters

              debugPrint('[NativeLocation] last known age = ${ageSeconds}s, accuracy = ${lastKnown.accuracy}m');
              if (isRecent && isAccurate) {
                debugPrint('[NativeLocation] last known position accepted');
                position = lastKnown;
              } else {
                debugPrint('[NativeLocation] last known rejected: stale or inaccurate');
              }
            }
          } catch (lastErr) {
            debugPrint('[NativeLocation] stage 3 error: $lastErr');
          }
        }
      }

      if (position != null) {
        debugPrint('[NativeLocation] location received');
        debugPrint('[NativeLocation] latitude = ${position.latitude}');
        debugPrint('[NativeLocation] longitude = ${position.longitude}');
        debugPrint('[NativeLocation] accuracy = ${position.accuracy}');

        return {
          'success': true,
          'latitude': position.latitude,
          'longitude': position.longitude,
          'accuracy': position.accuracy,
          'altitude': position.altitude,
          'speed': position.speed,
        };
      }

      debugPrint('[NativeLocation] error = LOCATION_UNAVAILABLE');
      return {
        'success': false,
        'errorCode': 'LOCATION_UNAVAILABLE',
        'message': 'Unable to obtain the device location.',
      };
    } catch (e) {
      debugPrint('[NativeLocation] error = $e');
      return {
        'success': false,
        'errorCode': 'LOCATION_UNAVAILABLE',
        'message': 'Unable to obtain the device location.',
      };
    }
  }

  // Register both requestLocation and getLocation handlers
  controller.addJavaScriptHandler(
    handlerName: 'requestLocation',
    callback: (args) => handleNativeLocation(),
  );

  controller.addJavaScriptHandler(
    handlerName: 'getLocation',
    callback: (args) => handleNativeLocation(),
  );

  controller.addJavaScriptHandler(
    handlerName: 'checkLocationPermission',
    callback: (args) async {
      try {
        final status = await Permission.locationWhenInUse.status;
        final serviceEnabled = await Geolocator.isLocationServiceEnabled();
        return {
          'granted': status.isGranted,
          'serviceEnabled': serviceEnabled,
          'status': status.name
        };
      } catch (e) {
        return {'granted': false, 'serviceEnabled': false, 'error': e.toString()};
      }
    },
  );
}
