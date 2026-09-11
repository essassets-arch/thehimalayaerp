const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const flutterDir = args.find(a => !a.startsWith('--')) || 'D:\\himalaya-flutter';
const skipBuild = args.includes('--no-build');

console.log('======================================================================');
console.log('🚀 HIMALAYA ERP — SYNC FLUTTER APK NATIVE LOCATION BRIDGE');
console.log('======================================================================');
console.log(`📂 Flutter Directory: ${flutterDir}`);

if (!fs.existsSync(flutterDir)) {
  console.error(`❌ Error: Flutter directory not found at ${flutterDir}`);
  process.exit(1);
}

// 1. Check pubspec.yaml
const pubspecPath = path.join(flutterDir, 'pubspec.yaml');
let pubspec = fs.readFileSync(pubspecPath, 'utf8');

if (!pubspec.includes('geolocator:')) {
  console.log('\n📦 Step 1: Adding geolocator to pubspec.yaml...');
  execSync('flutter pub add geolocator', { cwd: flutterDir, stdio: 'inherit' });
} else {
  console.log('\n📦 Step 1: geolocator is already in pubspec.yaml.');
}

// 2. Update webview_service.dart
const webviewServicePath = path.join(flutterDir, 'lib', 'services', 'webview_service.dart');
if (!fs.existsSync(webviewServicePath)) {
  console.error(`❌ Error: ${webviewServicePath} not found`);
  process.exit(1);
}

console.log('\n📝 Step 2: Updating webview_service.dart...');
let code = fs.readFileSync(webviewServicePath, 'utf8');

// Backup original
const backupPath = `${webviewServicePath}.bak`;
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, code, 'utf8');
  console.log(`  ↳ Backup saved at ${backupPath}`);
}

// Add geolocator import
if (!code.includes("import 'package:geolocator/geolocator.dart';")) {
  code = code.replace(
    "import 'package:permission_handler/permission_handler.dart';",
    "import 'package:permission_handler/permission_handler.dart';\nimport 'package:geolocator/geolocator.dart';"
  );
  console.log('  ✓ Added geolocator import');
}

// Check / Add handleNativeLocation method
const nativeLocationMethod = `
  /// Authoritative Android Fused Location Handler
  static Future<Map<String, dynamic>> handleNativeLocation() async {
    debugPrint('[NativeLocation] request started');
    try {
      // Step 1: Check runtime permission
      var status = await Permission.locationWhenInUse.status;
      debugPrint('[NativeLocation] permission = \${status.name}');

      if (!status.isGranted) {
        status = await Permission.locationWhenInUse.request();
        debugPrint('[NativeLocation] requested permission = \${status.name}');
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
      debugPrint('[NativeLocation] services = \${serviceEnabled ? "enabled" : "disabled"}');
      if (!serviceEnabled) {
        debugPrint('[NativeLocation] error = LOCATION_SERVICES_DISABLED');
        return {
          'success': false,
          'errorCode': 'LOCATION_SERVICES_DISABLED',
          'message': 'Location services are disabled.',
        };
      }

      // Step 3: Fused Location Strategy
      debugPrint('[NativeLocation] requesting fused location');
      Position? position;

      try {
        debugPrint('[NativeLocation] stage 1: high accuracy fresh location (10s)');
        position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 10),
          ),
        );
      } catch (highErr) {
        debugPrint('[NativeLocation] stage 1 timeout/failure: \$highErr');
        try {
          debugPrint('[NativeLocation] stage 2: medium accuracy balanced location (15s)');
          position = await Geolocator.getCurrentPosition(
            locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.medium,
              timeLimit: Duration(seconds: 15),
            ),
          );
        } catch (medErr) {
          debugPrint('[NativeLocation] stage 2 timeout/failure: \$medErr');
          try {
            debugPrint('[NativeLocation] stage 3: inspecting last known position');
            final lastKnown = await Geolocator.getLastKnownPosition();
            if (lastKnown != null) {
              final ageSeconds = DateTime.now().difference(lastKnown.timestamp).inSeconds.abs();
              final isRecent = ageSeconds <= 120;
              final isAccurate = lastKnown.accuracy <= 100;

              debugPrint('[NativeLocation] last known age = \${ageSeconds}s, accuracy = \${lastKnown.accuracy}m');
              if (isRecent && isAccurate) {
                debugPrint('[NativeLocation] last known position accepted');
                position = lastKnown;
              }
            }
          } catch (lastErr) {
            debugPrint('[NativeLocation] stage 3 error: \$lastErr');
          }
        }
      }

      if (position != null) {
        debugPrint('[NativeLocation] location received');
        debugPrint('[NativeLocation] latitude = \${position.latitude}');
        debugPrint('[NativeLocation] longitude = \${position.longitude}');
        debugPrint('[NativeLocation] accuracy = \${position.accuracy}');

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
      debugPrint('[NativeLocation] error = \$e');
      return {
        'success': false,
        'errorCode': 'LOCATION_UNAVAILABLE',
        'message': 'Unable to obtain the device location.',
      };
    }
  }
`;

if (!code.includes('handleNativeLocation()')) {
  const lastBrace = code.lastIndexOf('}');
  if (lastBrace !== -1) {
    code = code.slice(0, lastBrace) + '\n' + nativeLocationMethod + '\n}\n';
    console.log('  ✓ Injected handleNativeLocation()');
  }
}

// Add requestLocation handlers after getStorage handler
const locationHandlers = `
    // 9. Request Location Handler: window.flutter_inappwebview.callHandler('requestLocation')
    controller.addJavaScriptHandler(
      handlerName: 'requestLocation',
      callback: (args) async => await handleNativeLocation(),
    );

    controller.addJavaScriptHandler(
      handlerName: 'getLocation',
      callback: (args) async => await handleNativeLocation(),
    );

    // 10. Check Location Permission: window.flutter_inappwebview.callHandler('checkLocationPermission')
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
`;

if (!code.includes("handlerName: 'requestLocation'")) {
  code = code.replace(
    /(\/\/\s*8\.\s*Secure Storage Get:[\s\S]*?controller\.addJavaScriptHandler\([\s\S]*?\};\s*\}\,\s*\);)/,
    `$1\n${locationHandlers}`
  );
  console.log('  ✓ Registered requestLocation, getLocation, checkLocationPermission handlers');
} else {
  console.log('  ✓ requestLocation handler already present');
}

fs.writeFileSync(webviewServicePath, code, 'utf8');

// 3. Build APK if requested
if (!skipBuild) {
  console.log('\n🔨 Step 3: Rebuilding existing release APK binary...');
  execSync('flutter pub get', { cwd: flutterDir, stdio: 'inherit' });
  execSync('flutter build apk --release', { cwd: flutterDir, stdio: 'inherit' });

  const apkPath = path.join(flutterDir, 'build', 'app', 'outputs', 'flutter-apk', 'app-release.apk');
  if (fs.existsSync(apkPath)) {
    const stat = fs.statSync(apkPath);
    const mb = (stat.size / (1024 * 1024)).toFixed(2);
    console.log('\n======================================================================');
    console.log('🎉 SUCCESS! Rebuilt existing APK binary with native coordinates:');
    console.log(`   📁 Location: ${apkPath} (${mb} MB)`);
    console.log('======================================================================');
  }
} else {
  console.log('\n✓ Sync completed without building APK (--no-build).');
}
