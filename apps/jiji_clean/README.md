# JIJI Clean - AR Hygiene Habit App

**AR hygiene habit app for kids with depth-aware sticky icons**

JIJI Clean is a Flutter-based AR application designed to help children learn proper hand washing habits through engaging, interactive AR experiences with depth-aware scaling and hand tracking.

## 🎯 Features

### Core Features (MVP)

- **AR World Tracking**: Stable AR anchors for real-world interaction using ARCore/ARKit
- **Hand Detection**: AI-powered hand tracking and recognition with ML Kit
- **Depth Scaling**: Icons scale naturally with distance for realistic interaction
- **Camera Switching**: Rear camera default with manual toggle (AR disabled on front camera)
- **Praise Effects**: Reward animations when washing flow completes

### Advanced Features (Future)

- **Occlusion & Depth Mask**: Realistic icon occlusion using human/hand depth masks
- **Plane Detection Rewards**: Place rewards on detected planes (sink area) after washing

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Flutter 3.x
- **AR Framework**: ARCore (Android) / ARKit (iOS) via ar_flutter_plugin
- **ML/AI**: Google ML Kit for hand detection
- **Backend**: Firebase (Analytics, Crashlytics)
- **Platforms**: Android, iOS, Web (limited AR support)

### Project Structure

```
lib/
├── main.dart                 # App entry point and home screen
├── ar/
│   └── ar_camera_page.dart  # Main AR camera interface
├── services/
│   ├── ar_service.dart      # AR session management
│   └── hand_detection_service.dart  # Hand tracking service
└── widgets/                 # Reusable UI components
```

## 🚀 Getting Started

### Prerequisites

- Flutter 3.8.0 or higher
- Android SDK 21+ (for ARCore)
- iOS 11.0+ (for ARKit)
- Physical device recommended for AR features

### Installation

1. **Install dependencies**

   ```bash
   flutter pub get
   ```

2. **Run the app**

   ```bash
   # For web (limited AR support)
   flutter run -d chrome

   # For Android
   flutter run -d android

   # For iOS
   flutter run -d ios
   ```

### Development Setup

1. **Configure Firebase** (Optional for development)
   - Create a Firebase project
   - Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Configure Firebase Analytics and Crashlytics

2. **AR Development**
   - Test on physical devices for full AR experience
   - Use simulators for UI development only

## 📱 Usage

### Basic Flow

1. Launch the app to see the home screen with feature overview
2. Tap "Start AR Camera" to enter AR mode
3. Point rear camera at hands for tracking
4. Watch depth-aware icons scale naturally with distance
5. Toggle debug info to see AR status and metrics

### AR Features

- **Rear Camera**: Full AR tracking with world anchors
- **Front Camera**: 2D overlay mode (AR disabled)
- **Hand Detection**: Simulated tracking with depth scaling
- **Debug Info**: Real-time AR status, FPS, and hand metrics

## 🔧 Configuration

### Android Configuration

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera.ar" android:required="false" />
<meta-data android:name="com.google.ar.core" android:value="required" />
```

### iOS Configuration

```xml
<!-- ios/Runner/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>JIJI Clean uses the camera for AR hygiene tracking...</string>
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>arkit</string>
</array>
```

## 🧪 Testing

### Unit Tests

```bash
flutter test
```

### Widget Tests

```bash
flutter test test/widget_test.dart
```

## 📊 Performance

### Target Metrics

- **AR Session Start Rate**: 90%+ on AR-capable devices
- **Frame Rate**: ≥24 FPS on mid-tier devices
- **Anchor Stability**: ≤30px jitter in 1080p
- **Hand Detection**: Real-time at 10+ FPS

### Optimization

- Depth scaling uses efficient vector math calculations
- Hand detection runs at 10 FPS to balance performance and accuracy
- AR session automatically pauses on app background

## 🔒 Privacy & Security

### Data Handling

- All hand detection processing is local (no data sent to servers)
- Camera feed is not recorded or stored
- Firebase Analytics follows COPPA compliance for kids' apps
- No personal information collected

### Permissions

- Camera: Required for AR functionality
- Microphone: Optional for enhanced experiences

## 🚦 Development Status

### Completed ✅

- ✅ Flutter project structure with AR dependencies
- ✅ Home screen with feature showcase
- ✅ AR camera page with simulation
- ✅ Hand detection service (simulated)
- ✅ AR service with depth calculations
- ✅ Android/iOS platform configurations
- ✅ Permission handling

### In Progress 🟡

- 🟡 Real AR Flutter plugin integration
- 🟡 Actual ML Kit hand detection implementation
- 🟡 Firebase integration testing

### Planned 📋

- 📋 Real-world AR anchor placement
- 📋 Hand wash flow detection
- 📋 Praise animation system
- 📋 Settings and customization
- 📋 Progress tracking

## 📚 References

### AR Development

- [ARCore Developer Guide](https://developers.google.com/ar)
- [ARKit Documentation](https://developer.apple.com/arkit/)
- [AR Flutter Plugin](https://pub.dev/packages/ar_flutter_plugin)

### ML Kit Integration

- [Google ML Kit](https://developers.google.com/ml-kit)
- [Hand Detection API](https://developers.google.com/ml-kit/vision/pose-detection)

---

**Made with ❤️ for kids' hygiene education through AR technology**
