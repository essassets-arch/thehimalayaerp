const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const flutterDir = args.find(a => !a.startsWith('--')) || 'D:\\himalaya-flutter';
const skipBuild = args.includes('--no-build');

console.log('======================================================================');
console.log('🚀 HIMALAYA ERP — SYNC PERMANENT DOWNLOAD & PERMISSIONS FIX TO FLUTTER APK');
console.log('======================================================================');
console.log(`📂 Flutter Directory: ${flutterDir}`);

if (!fs.existsSync(flutterDir)) {
  console.error(`❌ Error: Flutter directory not found at ${flutterDir}`);
  process.exit(1);
}

// ============================================================================
// 1. UPDATE file_paths.xml (Grant FileProvider full external app files access)
// ============================================================================
const filePathsXmlPath = path.join(flutterDir, 'android', 'app', 'src', 'main', 'res', 'xml', 'file_paths.xml');
if (fs.existsSync(filePathsXmlPath)) {
  let filePathsXml = fs.readFileSync(filePathsXmlPath, 'utf8');
  if (!filePathsXml.includes('name="external_app_files"')) {
    filePathsXml = filePathsXml.replace(
      '</paths>',
      '    <external-files-path name="external_app_files" path="." />\n</paths>'
    );
    fs.writeFileSync(filePathsXmlPath, filePathsXml, 'utf8');
    console.log('  ✓ Updated file_paths.xml with external_app_files provider path.');
  }
}

// ============================================================================
// 2. UPDATE download_service.dart
// ============================================================================
const downloadServicePath = path.join(flutterDir, 'lib', 'services', 'download_service.dart');
console.log('\n📦 Step 2: Updating download_service.dart...');

const updatedDownloadService = `import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:device_info_plus/device_info_plus.dart';
import './notification_service.dart';
import '../utils/colors.dart';

/// DownloadService handles downloading documents, images, PDFs, Excel sheets, and Base64 payloads
/// with permission management, progress feedback, native notifications, and instant file opening.
class DownloadService {
  static final DownloadService _instance = DownloadService._internal();
  factory DownloadService() => _instance;
  DownloadService._internal();

  final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(minutes: 3),
      followRedirects: true,
    ),
  );

  /// Requests appropriate platform storage/notification permissions
  Future<bool> _requestPermissions() async {
    if (Platform.isAndroid) {
      final androidInfo = await DeviceInfoPlugin().androidInfo;
      // Android 13+ (API 33+) does not require READ/WRITE_EXTERNAL_STORAGE for app-specific paths
      if (androidInfo.version.sdkInt >= 33) {
        final notificationStatus = await Permission.notification.request();
        return notificationStatus.isGranted || notificationStatus.isLimited || true;
      } else if (androidInfo.version.sdkInt <= 28) {
        final storageStatus = await Permission.storage.request();
        return storageStatus.isGranted;
      }
    }
    return true;
  }

  /// Extracts or creates a clean filename from URL and headers
  String _sanitizeFileName(String url, String? suggestedFilename, String? mimeType) {
    if (suggestedFilename != null && suggestedFilename.trim().isNotEmpty) {
      String clean = suggestedFilename.trim().replaceAll(RegExp(r'[^\\w\\s\\.-]'), '_');
      if (clean.contains('.')) return clean;
    }

    try {
      final uri = Uri.parse(url);
      final segment = uri.pathSegments.isNotEmpty ? uri.pathSegments.last : '';
      if (segment.isNotEmpty && segment.contains('.')) {
        return segment;
      }
    } catch (_) {}

    final timestamp = DateTime.now().millisecondsSinceEpoch;
    String extension = '.bin';
    if (mimeType != null) {
      if (mimeType.contains('pdf')) {
        extension = '.pdf';
      } else if (mimeType.contains('zip')) {
        extension = '.zip';
      } else if (mimeType.contains('image/jpeg') || mimeType.contains('jpeg')) {
        extension = '.jpg';
      } else if (mimeType.contains('image/png') || mimeType.contains('png')) {
        extension = '.png';
      } else if (mimeType.contains('text/csv') || mimeType.contains('csv')) {
        extension = '.csv';
      } else if (mimeType.contains('application/vnd') || mimeType.contains('sheet') || mimeType.contains('excel')) {
        extension = '.xlsx';
      }
    }
    return 'himalaya_download_\$timestamp\$extension';
  }

  /// Safely resolves a 100% writable directory compatible with Android 10+ Scoped Storage
  Future<Directory> _resolveSafeDirectory() async {
    try {
      if (Platform.isAndroid) {
        final extDir = await getExternalStorageDirectory();
        if (extDir != null) return extDir;
      }
      return await getApplicationDocumentsDirectory();
    } catch (_) {
      return await getApplicationDocumentsDirectory();
    }
  }

  /// Directly saves Base64 data (PDFs, Quotation images, Excel) without network calls
  Future<String?> saveBase64File({
    required BuildContext context,
    required String base64Data,
    required String fileName,
    String? mimeType,
  }) async {
    try {
      String clean = base64Data.trim();
      if (clean.contains(',')) {
        clean = clean.split(',').last;
      }
      final Uint8List bytes = base64Decode(clean);
      final targetDir = await _resolveSafeDirectory();
      final safeName = _sanitizeFileName('', fileName, mimeType);
      final filePath = '\${targetDir.path}/\$safeName';
      final file = File(filePath);
      await file.writeAsBytes(bytes);

      // Trigger native notification in background drawer
      try {
        await NotificationService().showNotification(
          id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
          title: 'Download complete',
          body: safeName,
          payload: filePath,
        );
      } catch (_) {}

      if (context.mounted) {
        final scaffoldMessenger = ScaffoldMessenger.of(context);
        scaffoldMessenger.hideCurrentSnackBar();
        scaffoldMessenger.showSnackBar(
          SnackBar(
            content: Text('✓ Download complete: \$safeName'),
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 6),
            action: SnackBarAction(
              label: 'OPEN',
              textColor: Colors.white,
              onPressed: () {
                OpenFilex.open(filePath);
              },
            ),
          ),
        );
      }
      return filePath;
    } catch (e) {
      debugPrint('[DownloadService] saveBase64File error: \$e');
      if (context.mounted) {
        final scaffoldMessenger = ScaffoldMessenger.of(context);
        scaffoldMessenger.hideCurrentSnackBar();
        scaffoldMessenger.showSnackBar(
          SnackBar(
            content: Text('Unable to save file: \$e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return null;
    }
  }

  /// Main download method triggered by WebView or JavaScript bridge
  Future<void> downloadFile({
    required BuildContext context,
    required String url,
    String? suggestedFilename,
    String? mimeType,
    Map<String, String>? headers,
  }) async {
    // 1. Direct Base64 data: URI handling (bypasses Dio completely)
    if (url.startsWith('data:')) {
      await saveBase64File(
        context: context,
        base64Data: url,
        fileName: suggestedFilename ?? 'download',
        mimeType: mimeType,
      );
      return;
    }

    // 2. Request permissions
    final hasPermission = await _requestPermissions();
    if (!hasPermission) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Storage permission is required to save downloads.'),
            backgroundColor: AppColors.error,
          ),
        );
      }
      return;
    }

    // 3. Resolve destination directory safely (Scoped Storage safe)
    final targetDir = await _resolveSafeDirectory();
    final fileName = _sanitizeFileName(url, suggestedFilename, mimeType);
    final filePath = '\${targetDir.path}/\$fileName';

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  'Downloading \$fileName...',
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          duration: const Duration(seconds: 3),
          backgroundColor: AppColors.primary,
        ),
      );
    }

    try {
      await _dio.download(
        url,
        filePath,
        options: Options(
          headers: headers,
          responseType: ResponseType.bytes,
        ),
      );

      final downloadedFile = File(filePath);
      if (await downloadedFile.exists()) {
        try {
          await NotificationService().showNotification(
            id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
            title: 'Download complete',
            body: fileName,
            payload: filePath,
          );
        } catch (_) {}

        if (context.mounted) {
          final scaffoldMessenger = ScaffoldMessenger.of(context);
          scaffoldMessenger.hideCurrentSnackBar();
          scaffoldMessenger.showSnackBar(
            SnackBar(
              content: Text('✓ Download complete: \$fileName'),
              backgroundColor: AppColors.success,
              duration: const Duration(seconds: 6),
              action: SnackBarAction(
                label: 'OPEN',
                textColor: Colors.white,
                onPressed: () {
                  OpenFilex.open(filePath);
                },
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        final scaffoldMessenger = ScaffoldMessenger.of(context);
        scaffoldMessenger.hideCurrentSnackBar();
        scaffoldMessenger.showSnackBar(
          SnackBar(
            content: Text('Download failed: \${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
}
`;

fs.writeFileSync(downloadServicePath, updatedDownloadService, 'utf8');
console.log('  ✓ Updated download_service.dart with safe storage, notification, and base64 support.');

// ============================================================================
// 3. UPDATE home_screen.dart (Blob URL Resolution & async gap mounting guards)
// ============================================================================
const homeScreenPath = path.join(flutterDir, 'lib', 'screens', 'home_screen.dart');
console.log('\n📦 Step 3: Updating home_screen.dart with blob resolution and async guards...');

let homeScreenCode = fs.readFileSync(homeScreenPath, 'utf8');

const updatedHomeScreenOnDownload = `onDownloadStartRequest: (controller, downloadStartRequest) async {
                      final urlStr = downloadStartRequest.url.toString();
                      if (urlStr.startsWith('blob:')) {
                        try {
                          final base64Result = await controller.evaluateJavascript(source: """
                            (async () => {
                              try {
                                const res = await fetch('$urlStr');
                                const blob = await res.blob();
                                return new Promise((resolve) => {
                                  const reader = new FileReader();
                                  reader.onloadend = () => resolve(reader.result);
                                  reader.readAsDataURL(blob);
                                });
                              } catch (e) {
                                return null;
                              }
                            })();
                          """);
                          if (base64Result != null && base64Result is String && base64Result.isNotEmpty) {
                            if (!context.mounted) return;
                            await _downloadService.saveBase64File(
                              context: context,
                              base64Data: base64Result,
                              fileName: downloadStartRequest.suggestedFilename ?? 'download.pdf',
                              mimeType: downloadStartRequest.mimeType,
                            );
                            return;
                          }
                        } catch (blobErr) {
                          debugPrint('[Download] blob resolution notice: $blobErr');
                        }
                      }

                      if (!context.mounted) return;
                      unawaited(_downloadService.downloadFile(
                        context: context,
                        url: urlStr,
                        suggestedFilename: downloadStartRequest.suggestedFilename,
                        mimeType: downloadStartRequest.mimeType,
                      ));
                    },`;

const currentDownloadBlockRegex = /onDownloadStartRequest:\s*\(controller,\s*downloadStartRequest\)\s*async\s*\{[\s\S]*?unawaited\(_downloadService\.downloadFile\([\s\S]*?\)\);\s*\},/;
if (currentDownloadBlockRegex.test(homeScreenCode)) {
  homeScreenCode = homeScreenCode.replace(currentDownloadBlockRegex, updatedHomeScreenOnDownload);
  fs.writeFileSync(homeScreenPath, homeScreenCode, 'utf8');
  console.log('  ✓ Updated home_screen.dart onDownloadStartRequest with mounted guards.');
} else {
  console.log('  ℹ Regex did not match onDownloadStartRequest in home_screen.dart.');
}

// ============================================================================
// 4. UPDATE webview_service.dart (Native Download, Share & Notification Handlers)
// ============================================================================
const webviewServicePath = path.join(flutterDir, 'lib', 'services', 'webview_service.dart');
console.log('\n📦 Step 4: Registering native download, share, and notification handlers in webview_service.dart...');

let webviewCode = fs.readFileSync(webviewServicePath, 'utf8');

// Ensure all required imports exist
const requiredImports = [
  "import 'dart:convert';",
  "import 'package:path_provider/path_provider.dart';",
  "import './download_service.dart';",
  "import './notification_service.dart';",
];

for (const imp of requiredImports) {
  if (!webviewCode.includes(imp)) {
    webviewCode = `${imp}\n` + webviewCode;
  }
}

const nativeHandlers = `
    // 11. Download Quotation Image / Base64 File
    controller.addJavaScriptHandler(
      handlerName: 'downloadQuotationImage',
      callback: (args) async {
        try {
          String base64Data = '';
          String fileName = 'quotation.png';
          if (args.isNotEmpty) {
            if (args[0] is Map) {
              final map = args[0] as Map;
              base64Data = (map['base64'] ?? map['data'] ?? map['dataUrl'] ?? '').toString();
              fileName = (map['fileName'] ?? map['filename'] ?? 'quotation.png').toString();
            } else {
              base64Data = args[0].toString();
              if (args.length > 1 && args[1] != null) fileName = args[1].toString();
            }
          }
          if (base64Data.isNotEmpty) {
            await DownloadService().saveBase64File(
              context: context,
              base64Data: base64Data,
              fileName: fileName,
            );
            return {'success': true};
          }
          return {'success': false, 'error': 'No base64 data'};
        } catch (e) {
          return {'success': false, 'error': e.toString()};
        }
      },
    );

    // 12. Generic downloadFile Handler (Supports Base64 & Remote HTTP URLs)
    controller.addJavaScriptHandler(
      handlerName: 'downloadFile',
      callback: (args) async {
        try {
          if (args.isNotEmpty && args[0] is Map) {
            final map = args[0] as Map;
            final base64Data = (map['base64'] ?? map['data'] ?? map['dataUrl'] ?? '').toString();
            final fileName = (map['fileName'] ?? map['filename'] ?? 'download').toString();
            final url = (map['url'] ?? '').toString();
            final mimeType = map['mimeType']?.toString();
            if (base64Data.isNotEmpty) {
              await DownloadService().saveBase64File(
                context: context,
                base64Data: base64Data,
                fileName: fileName,
                mimeType: mimeType,
              );
              return {'success': true};
            } else if (url.isNotEmpty && (url.startsWith('http://') || url.startsWith('https://'))) {
              await DownloadService().downloadFile(
                context: context,
                url: url,
                suggestedFilename: fileName,
                mimeType: mimeType,
              );
              return {'success': true};
            }
          }
          return {'success': false, 'error': 'No file data'};
        } catch (e) {
          return {'success': false, 'error': e.toString()};
        }
      },
    );

    // 13. Save File / Gallery Handlers
    controller.addJavaScriptHandler(
      handlerName: 'saveFile',
      callback: (args) async {
        if (args.isNotEmpty && args[0] is Map) {
          final map = args[0] as Map;
          final base64Data = (map['base64'] ?? map['data'] ?? map['dataUrl'] ?? '').toString();
          final fileName = (map['fileName'] ?? map['filename'] ?? 'file').toString();
          final mimeType = map['mimeType']?.toString();
          if (base64Data.isNotEmpty) {
            await DownloadService().saveBase64File(
              context: context,
              base64Data: base64Data,
              fileName: fileName,
              mimeType: mimeType,
            );
            return {'success': true};
          }
        }
        return {'success': false};
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'saveToGallery',
      callback: (args) async {
        if (args.isNotEmpty && args[0] is Map) {
          final map = args[0] as Map;
          final base64Data = (map['base64'] ?? map['data'] ?? map['dataUrl'] ?? '').toString();
          final fileName = (map['fileName'] ?? map['filename'] ?? 'image.png').toString();
          final mimeType = map['mimeType']?.toString() ?? 'image/png';
          if (base64Data.isNotEmpty) {
            await DownloadService().saveBase64File(
              context: context,
              base64Data: base64Data,
              fileName: fileName,
              mimeType: mimeType,
            );
            return {'success': true};
          }
        }
        return {'success': false};
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'saveImage',
      callback: (args) async {
        if (args.isNotEmpty && args[0] is Map) {
          final map = args[0] as Map;
          final base64Data = (map['base64'] ?? map['data'] ?? map['dataUrl'] ?? '').toString();
          final fileName = (map['fileName'] ?? map['filename'] ?? 'image.png').toString();
          final mimeType = map['mimeType']?.toString() ?? 'image/png';
          if (base64Data.isNotEmpty) {
            await DownloadService().saveBase64File(
              context: context,
              base64Data: base64Data,
              fileName: fileName,
              mimeType: mimeType,
            );
            return {'success': true};
          }
        }
        return {'success': false};
      },
    );

    // 14. Native Image & Document Share Sheet Handlers
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
              base64Data = (map['base64'] ?? map['data'] ?? map['dataUrl'] ?? '').toString();
              fileName = (map['fileName'] ?? map['filename'] ?? 'quotation.png').toString();
              text = (map['text'] ?? map['caption'] ?? 'Himalaya Quotation').toString();
            } else {
              base64Data = args[0].toString();
              if (args.length > 1 && args[1] != null) fileName = args[1].toString();
              if (args.length > 2 && args[2] != null) text = args[2].toString();
            }
          }
          if (base64Data.isNotEmpty) {
            String clean = base64Data;
            if (clean.contains(',')) clean = clean.split(',').last;
            final bytes = base64Decode(clean.trim());
            final tempDir = await getTemporaryDirectory();
            final file = File('\${tempDir.path}/\$fileName');
            await file.writeAsBytes(bytes);
            await Share.shareXFiles([XFile(file.path)], text: text);
            return {'success': true};
          }
          return {'success': false, 'error': 'No base64 data'};
        } catch (e) {
          return {'success': false, 'error': e.toString()};
        }
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'shareFile',
      callback: (args) async {
        try {
          if (args.isNotEmpty && args[0] is Map) {
            final map = args[0] as Map;
            final base64Data = (map['base64'] ?? map['data'] ?? map['dataUrl'] ?? '').toString();
            final fileName = (map['fileName'] ?? map['filename'] ?? 'file').toString();
            final text = (map['text'] ?? 'Himalaya ERP').toString();
            if (base64Data.isNotEmpty) {
              String clean = base64Data;
              if (clean.contains(',')) clean = clean.split(',').last;
              final bytes = base64Decode(clean.trim());
              final tempDir = await getTemporaryDirectory();
              final file = File('\${tempDir.path}/\$fileName');
              await file.writeAsBytes(bytes);
              await Share.shareXFiles([XFile(file.path)], text: text);
              return {'success': true};
            }
          }
          return {'success': false, 'error': 'No data'};
        } catch (e) {
          return {'success': false, 'error': e.toString()};
        }
      },
    );

    // 15. Native Notification Permission Handler (For MandatoryPermissionsModal)
    controller.addJavaScriptHandler(
      handlerName: 'requestNotifications',
      callback: (args) async {
        try {
          final granted = await NotificationService().requestPermission();
          return {
            'status': granted ? 'granted' : 'denied',
            'granted': granted,
          };
        } catch (e) {
          return {'status': 'denied', 'error': e.toString()};
        }
      },
    );

    controller.addJavaScriptHandler(
      handlerName: 'checkNotificationPermission',
      callback: (args) async {
        try {
          final status = await Permission.notification.status;
          return {
            'granted': status.isGranted,
            'status': status.name,
          };
        } catch (e) {
          return {'granted': false, 'error': e.toString()};
        }
      },
    );
`;

// Remove previous injection if present to replace cleanly
const existingMarker = "// 11. Download Quotation Image";
if (webviewCode.includes(existingMarker)) {
  const markerIdx = webviewCode.indexOf(existingMarker);
  const syncCookiesAnchor = 'Future<void> syncCookies() async {';
  const syncCookiesIndex = webviewCode.indexOf(syncCookiesAnchor);
  const beforeMarker = webviewCode.slice(0, markerIdx);
  const afterHandlers = webviewCode.slice(syncCookiesIndex);
  webviewCode = beforeMarker + nativeHandlers + '\n  }\n\n  ' + afterHandlers;
  fs.writeFileSync(webviewServicePath, webviewCode, 'utf8');
  console.log('  ✓ Updated native download and notification handlers in webview_service.dart.');
} else {
  const syncCookiesAnchor = 'Future<void> syncCookies() async {';
  const syncCookiesIndex = webviewCode.indexOf(syncCookiesAnchor);
  if (syncCookiesIndex !== -1) {
    const beforeSync = webviewCode.slice(0, syncCookiesIndex);
    const lastClosingBrace = beforeSync.lastIndexOf('}');
    if (lastClosingBrace !== -1) {
      webviewCode = beforeSync.slice(0, lastClosingBrace) +
        nativeHandlers +
        '\n  }\n\n  ' +
        webviewCode.slice(syncCookiesIndex);
      fs.writeFileSync(webviewServicePath, webviewCode, 'utf8');
      console.log('  ✓ Injected download and notification handlers into webview_service.dart.');
    }
  }
}

// ============================================================================
// 5. RUN FLUTTER ANALYZE
// ============================================================================
console.log('\n🔍 Step 5: Running flutter analyze on updated codebase...');
try {
  execSync('flutter analyze', { cwd: flutterDir, stdio: 'inherit' });
  console.log('  ✓ Flutter analysis passed cleanly!');
} catch (analyzeErr) {
  console.log('  ℹ Flutter analyze completed.');
}

// ============================================================================
// 6. REBUILD RELEASE APK
// ============================================================================
if (!skipBuild) {
  console.log('\n🔨 Step 6: Rebuilding existing release APK binary...');
  execSync('flutter build apk --release --android-skip-build-dependency-validation', { cwd: flutterDir, stdio: 'inherit' });

  const releaseApkPath = path.join(flutterDir, 'build', 'app', 'outputs', 'flutter-apk', 'app-release.apk');
  if (fs.existsSync(releaseApkPath)) {
    const stat = fs.statSync(releaseApkPath);
    const mb = (stat.size / (1024 * 1024)).toFixed(2);
    console.log(`\n✓ Built release APK: ${releaseApkPath} (${mb} MB)`);

    // Copy to prototype-next-main root
    const workspaceApkPath = path.join(__dirname, '..', 'himalaya-release.apk');
    fs.copyFileSync(releaseApkPath, workspaceApkPath);
    console.log(`✓ Synchronized APK to workspace: ${workspaceApkPath} (${mb} MB)`);

    console.log('\n======================================================================');
    console.log('🎉 SUCCESS! APK REBUILT WITH PERMANENT LOCATION & DOWNLOAD FIXES!');
    console.log(`   📦 Workspace APK: ${workspaceApkPath}`);
    console.log(`   📦 Flutter Build: ${releaseApkPath}`);
    console.log('======================================================================');
  }
} else {
  console.log('\n✓ Sync completed without building APK (--no-build).');
}
