# Himalaya ERP — Flutter APK WebView Integration Guide

This guide explains how to connect your Flutter Mobile APK to the Himalaya ERP web application (`https://thehimalaya.cloud`) for seamless:
1. **Quotation Image / PDF Downloads directly to Android Gallery (Pictures / MediaStore)**
2. **Quotation Native Sharing (WhatsApp, Email, Bluetooth, etc.)**
3. **Zero-Blob Base64 Bridge** (Eliminates `DioException: No host specified in URI blob:...`)

---

## 1. Flutter Dependencies (`pubspec.yaml`)

Ensure the following packages are in your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_inappwebview: ^6.1.5 # or latest
  image_gallery_saver: ^2.0.3  # saves Uint8List directly to Gallery/Pictures
  path_provider: ^2.1.5        # temporary directory for sharing
  share_plus: ^10.1.4          # native Android/iOS share sheet
  permission_handler: ^11.3.1  # storage/photos permissions
```

---

## 2. Android Permissions (`android/app/src/main/AndroidManifest.xml`)

Add the following permissions:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>

    <application
        android:label="Himalaya ERP"
        android:requestLegacyExternalStorage="true"
        android:usesCleartextTraffic="true">
        ...
    </application>
</manifest>
```

---

## 3. Flutter InAppWebView Setup (`main.dart` / `webview_screen.dart`)

Import the handlers from [`flutter_webview_handlers.dart`](./flutter_webview_handlers.dart):

```dart
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'docs/mobile/flutter_webview_handlers.dart'; // or your path

class HimalayaWebViewScreen extends StatefulWidget {
  const HimalayaWebViewScreen({super.key});

  @override
  State<HimalayaWebViewScreen> createState() => _HimalayaWebViewScreenState();
}

class _HimalayaWebViewScreenState extends State<HimalayaWebViewScreen> {
  InAppWebViewController? webViewController;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: InAppWebView(
          initialUrlRequest: URLRequest(
            url: WebUri('https://thehimalaya.cloud/login'),
          ),
          initialSettings: InAppWebViewSettings(
            useShouldOverrideUrlLoading: true,
            mediaPlaybackRequiresUserGesture: false,
            allowsInlineMediaPlayback: true,
            javaScriptEnabled: true,
            domStorageEnabled: true,
            databaseEnabled: true,
            allowFileAccessFromFileURLs: true,
            allowUniversalAccessFromFileURLs: true,
            useOnDownloadStart: true,
          ),
          onWebViewCreated: (controller) {
            webViewController = controller;

            // Attach all Himalaya ERP native download & share handlers
            setupHimalayaWebViewHandlers(
              controller: controller,
              context: context,
            );
          },
        ),
      ),
    );
  }
}
```

---

## 4. How It Works

```
User Clicks "Download Image" / "Download PDF" / "Share Image"
                         ↓
Web Layer (export.service.js)
  - Detects Flutter APK environment
  - Converts document to Base64 byte array
  - Calls:
      • controller.addJavaScriptHandler('downloadQuotationImage', ...)
      • controller.addJavaScriptHandler('shareQuotationImage', ...)
                         ↓
Flutter Native Layer (flutter_webview_handlers.dart)
  - Receives Base64 string
  - Decodes with `base64Decode(base64Data)` → `Uint8List`
  - Saves via `ImageGallerySaver.saveImage(...)` → Pictures/Gallery
  - Shares via `Share.shareXFiles([XFile(...)])` → Native Share Sheet
```
