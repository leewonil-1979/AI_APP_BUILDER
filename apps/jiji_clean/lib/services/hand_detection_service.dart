import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';

typedef HandDetectionCallback = void Function(Map<String, dynamic> handData);

class HandDetectionService {
  Timer? _detectionTimer;
  bool _isDetecting = false;
  HandDetectionCallback? _callback;

  // Simulation state
  final bool _simulateHandDetection = true;
  double _simulatedDistance = 1.0; // meters
  final Random _random = Random();

  bool get isDetecting => _isDetecting;

  void startDetection(HandDetectionCallback callback) {
    if (_isDetecting) {
      debugPrint('HandDetectionService: Already detecting');
      return;
    }

    _callback = callback;
    _isDetecting = true;

    debugPrint('HandDetectionService: Starting hand detection...');

    // Start periodic detection simulation
    _detectionTimer = Timer.periodic(
      const Duration(milliseconds: 100), // 10 FPS detection
      _performDetection,
    );
  }

  void stopDetection() {
    if (!_isDetecting) return;

    debugPrint('HandDetectionService: Stopping hand detection...');

    _detectionTimer?.cancel();
    _detectionTimer = null;
    _isDetecting = false;
    _callback = null;
  }

  void _performDetection(Timer timer) {
    if (!_isDetecting || _callback == null) return;

    try {
      final handData = _simulateHandDetection
          ? _simulateDetection()
          : _realHandDetection();

      _callback!(handData);
    } catch (e) {
      debugPrint('HandDetectionService: Detection error - $e');
    }
  }

  Map<String, dynamic> _simulateDetection() {
    // Simulate hand presence with some randomness
    final isHandPresent =
        _random.nextDouble() > 0.3; // 70% chance hand is present

    if (!isHandPresent) {
      return {
        'detected': false,
        'info': 'No hands detected',
        'scale': 1.0,
        'confidence': 0.0,
        'landmarks': <Map<String, double>>[],
      };
    }

    // Simulate distance variation (0.3m to 2.0m)
    _simulatedDistance +=
        (_random.nextDouble() - 0.5) * 0.1; // Small random changes
    _simulatedDistance = _simulatedDistance.clamp(0.3, 2.0);

    // Calculate scale based on distance (closer = larger)
    final scale = _calculateScaleFromDistance(_simulatedDistance);

    // Simulate hand landmarks (simplified)
    final landmarks = _generateSimulatedLandmarks();

    // Simulate confidence
    final confidence = 0.8 + (_random.nextDouble() * 0.2); // 80-100%

    return {
      'detected': true,
      'info': 'Hand detected (${_simulatedDistance.toStringAsFixed(1)}m)',
      'scale': scale,
      'confidence': confidence,
      'distance': _simulatedDistance,
      'landmarks': landmarks,
      'handedness': _random.nextBool() ? 'left' : 'right',
    };
  }

  Map<String, dynamic> _realHandDetection() {
    // This would integrate with Google ML Kit or MediaPipe
    // For now, return empty results
    return {
      'detected': false,
      'info': 'Real detection not implemented',
      'scale': 1.0,
      'confidence': 0.0,
      'landmarks': <Map<String, double>>[],
    };
  }

  double _calculateScaleFromDistance(double distance) {
    // Scale formula: scale = baseScale / distance
    // At 1 meter: scale = 1.0
    // At 0.5 meters: scale = 2.0 (2x larger)
    // At 2 meters: scale = 0.5 (0.5x smaller)
    const baseScale = 1.0;
    final scale = baseScale / distance;

    // Clamp to reasonable limits
    return scale.clamp(0.3, 3.0);
  }

  List<Map<String, double>> _generateSimulatedLandmarks() {
    // Generate simplified hand landmarks
    // In a real implementation, this would come from ML Kit
    final landmarks = <Map<String, double>>[];

    // Simulate 21 hand landmarks (MediaPipe hand model)
    for (int i = 0; i < 21; i++) {
      landmarks.add({
        'x':
            0.3 + (_random.nextDouble() * 0.4), // 0.3 to 0.7 (center of screen)
        'y':
            0.3 + (_random.nextDouble() * 0.4), // 0.3 to 0.7 (center of screen)
        'z': _random.nextDouble() * 0.1, // Small depth variation
        'visibility': 0.8 + (_random.nextDouble() * 0.2), // High visibility
      });
    }

    return landmarks;
  }

  // Get the palm position from landmarks
  Map<String, double>? getPalmPosition(List<Map<String, double>> landmarks) {
    if (landmarks.isEmpty) return null;

    // In MediaPipe, landmark 0 is the wrist, 9 is roughly palm center
    if (landmarks.length > 9) {
      return landmarks[9]; // Return palm center landmark
    }

    return landmarks[0]; // Fallback to wrist
  }

  // Calculate hand bounding box
  Map<String, double>? getHandBoundingBox(List<Map<String, double>> landmarks) {
    if (landmarks.isEmpty) return null;

    double minX = double.infinity;
    double maxX = double.negativeInfinity;
    double minY = double.infinity;
    double maxY = double.negativeInfinity;

    for (final landmark in landmarks) {
      final x = landmark['x'] ?? 0.0;
      final y = landmark['y'] ?? 0.0;

      minX = min(minX, x);
      maxX = max(maxX, x);
      minY = min(minY, y);
      maxY = max(maxY, y);
    }

    return {
      'left': minX,
      'top': minY,
      'right': maxX,
      'bottom': maxY,
      'width': maxX - minX,
      'height': maxY - minY,
      'centerX': (minX + maxX) / 2,
      'centerY': (minY + maxY) / 2,
    };
  }

  // Estimate depth from hand size
  double estimateDepthFromHandSize(Map<String, double> boundingBox) {
    final handWidth = boundingBox['width'] ?? 0.1;

    // Average hand width is about 8.5cm
    // Use this to estimate distance
    const realHandWidth = 0.085; // meters
    const focalLength = 1.0; // Simplified focal length

    final estimatedDistance = (realHandWidth * focalLength) / handWidth;

    return estimatedDistance.clamp(0.2, 5.0); // Reasonable distance limits
  }

  void dispose() {
    debugPrint('HandDetectionService: Disposing...');
    stopDetection();
    debugPrint('HandDetectionService: Disposed');
  }
}
