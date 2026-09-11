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
  geolocator: ^12.0.0          # real-time Android fused/network location provider
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

    <!-- Mandatory GPS & Biometric Attendance Permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
    <uses-permission android:name="android.permission.CAMERA"/>

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
import 'package:permission_handler/permission_handler.dart';
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
            geolocationEnabled: true,
          ),
          onWebViewCreated: (controller) {
            webViewController = controller;

            // Attach all Himalaya ERP native download, share & location handlers
            setupHimalayaWebViewHandlers(
              controller: controller,
              context: context,
            );
          },
          onGeolocationPermissionsShowPrompt: (controller, origin) async {
            final uri = Uri.tryParse(origin);
            final isTrusted = uri != null && (
              uri.host == 'thehimalaya.cloud' ||
              uri.host == 'www.thehimalaya.cloud' ||
              uri.host == 'localhost' ||
              uri.host == '127.0.0.1' ||
              uri.host == '10.0.2.2'
            );
            if (!isTrusted) {
              return GeolocationPermissionShowPromptResponse(origin: origin, allow: false, retain: false);
            }
            final status = await Permission.locationWhenInUse.request();
            return GeolocationPermissionShowPromptResponse(
              origin: origin,
              allow: status.isGranted,
              retain: true,
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

---

## 5. Step 17 — Authoritative Android APK Native Location Bridge Fix

### Why the previous APK timed out:
The previous APK binary's `requestLocation` handler only called `Permission.locationWhenInUse.request()` and returned:
```dart
{'granted': true, 'status': 'granted'}
```
Because no coordinates were returned, the website fell back to `navigator.geolocation`, which timed out inside Android WebView.

### The Fix in Existing APK Source File:
In the external Flutter project that builds your APK, open:
`lib/services/webview_service.dart` (or wherever `controller.addJavaScriptHandler` is configured).

#### 1. Add/Verify dependency in `pubspec.yaml`
> **Important**: Check your existing `pubspec.yaml` first. If `geolocator` is already installed, reuse that compatible version. Do not blindly upgrade or downgrade Flutter dependencies:
```yaml
dependencies:
  geolocator: any # or the version already compatible with your Flutter SDK
  permission_handler: any
```

#### 2. Replace lines registering `requestLocation`:
```dart
// ❌ REPLACE THIS OLD BLOCK:
// controller.addJavaScriptHandler(
//   handlerName: 'requestLocation',
//   callback: (args) async {
//     final status = await Permission.locationWhenInUse.request();
//     return {'granted': status.isGranted, 'status': status.name};
//   },
// );

// ✅ WITH THIS AUTHORITATIVE HANDLER:
controller.addJavaScriptHandler(
  handlerName: 'requestLocation',
  callback: (args) async => await handleNativeLocation(),
);

controller.addJavaScriptHandler(
  handlerName: 'getLocation',
  callback: (args) async => await handleNativeLocation(),
);
```

#### 3. Add `handleNativeLocation()`:
Copy `handleNativeLocation()` directly from [`docs/mobile/flutter_webview_handlers.dart`](./flutter_webview_handlers.dart) into `lib/services/webview_service.dart`.

It implements:
1. High accuracy fresh location (10s timeout)
2. Balanced/fused accuracy fresh location (15s timeout)
3. Last known location check (freshness <= 120s, accuracy <= 100m)
4. Consistent JSON return object:
   - Success: `{"success": true, "latitude": 23.xxxx, "longitude": 72.xxxx, "accuracy": 15.0}`
   - Error: `{"success": false, "errorCode": "LOCATION_SERVICES_DISABLED|PERMISSION_DENIED|LOCATION_UNAVAILABLE", "message": "..."}`

#### 4. Rebuild the APK binary:
```bash
flutter clean
flutter pub get
flutter build apk --release
```
Install the resulting `.apk` on the physical phone. Once installed, tapping "Use Current Location" in `/sales/create-lead` will instantly receive the physical phone's fused GPS coordinates without browser timeout!

