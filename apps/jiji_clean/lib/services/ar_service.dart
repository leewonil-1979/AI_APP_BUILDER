import 'package:flutter/foundation.dart';
import 'package:vector_math/vector_math_64.dart' as vector;

// Simple anchor representation
class ARNode {
  final String id;
  final vector.Vector3 position;
  final vector.Vector3 scale;
  final vector.Vector4 rotation;
  final DateTime createdAt;

  ARNode({
    required this.id,
    required this.position,
    required this.scale,
    required this.rotation,
  }) : createdAt = DateTime.now();
}

class ARService {
  bool _isInitialized = false;
  bool _isSessionRunning = false;

  // AR tracking state
  String _trackingState = 'Not initialized';
  final List<ARNode> _anchors = [];

  bool get isInitialized => _isInitialized;
  bool get isSessionRunning => _isSessionRunning;
  String get trackingState => _trackingState;
  List<ARNode> get anchors => _anchors;

  Future<void> initialize() async {
    try {
      debugPrint('ARService: Initializing AR session...');

      // Simulate AR initialization
      await Future.delayed(const Duration(milliseconds: 500));

      // For now, assume AR is always supported in development
      _isInitialized = true;
      _trackingState = 'Initialized';

      debugPrint('ARService: AR session initialized successfully');
    } catch (e) {
      debugPrint('ARService: Failed to initialize - $e');
      _trackingState = 'Failed: $e';
      rethrow;
    }
  }

  Future<void> startSession() async {
    if (!_isInitialized) {
      throw Exception('AR service not initialized');
    }

    try {
      debugPrint('ARService: Starting AR session...');

      // Simulate session start
      await Future.delayed(const Duration(milliseconds: 300));

      _isSessionRunning = true;
      _trackingState = 'Tracking';

      debugPrint('ARService: AR session started successfully');
    } catch (e) {
      debugPrint('ARService: Failed to start session - $e');
      _trackingState = 'Session failed: $e';
      rethrow;
    }
  }

  Future<void> stopSession() async {
    if (!_isSessionRunning) return;

    try {
      debugPrint('ARService: Stopping AR session...');

      _isSessionRunning = false;
      _trackingState = 'Stopped';

      debugPrint('ARService: AR session stopped');
    } catch (e) {
      debugPrint('ARService: Error stopping session - $e');
    }
  }

  Future<ARNode?> addAnchor(vector.Vector3 position) async {
    if (!_isSessionRunning) {
      debugPrint('ARService: Cannot add anchor - session not running');
      return null;
    }

    try {
      // Create a virtual anchor at the given position
      final anchor = ARNode(
        id: 'anchor_${DateTime.now().millisecondsSinceEpoch}',
        position: position,
        scale: vector.Vector3(0.1, 0.1, 0.1),
        rotation: vector.Vector4(0, 0, 0, 1),
      );

      _anchors.add(anchor);

      debugPrint('ARService: Added anchor at position $position');
      return anchor;
    } catch (e) {
      debugPrint('ARService: Failed to add anchor - $e');
      return null;
    }
  }

  void removeAnchor(ARNode anchor) {
    try {
      _anchors.remove(anchor);
      debugPrint('ARService: Removed anchor');
    } catch (e) {
      debugPrint('ARService: Failed to remove anchor - $e');
    }
  }

  void clearAnchors() {
    try {
      _anchors.clear();
      debugPrint('ARService: Cleared all anchors');
    } catch (e) {
      debugPrint('ARService: Failed to clear anchors - $e');
    }
  }

  // Get the current camera pose (position and orientation)
  Map<String, dynamic>? getCameraPose() {
    if (!_isSessionRunning) return null;

    // Return a simulated pose
    return {
      'position': [0.0, 0.0, 0.0],
      'rotation': [0.0, 0.0, 0.0, 1.0],
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };
  }

  // Convert screen coordinates to world position
  vector.Vector3? screenToWorldPosition(double screenX, double screenY) {
    if (!_isSessionRunning) return null;

    // Return a simulated position
    return vector.Vector3(
      (screenX - 0.5) * 2.0, // Convert to -1 to 1 range
      -(screenY - 0.5) * 2.0, // Flip Y axis
      -1.0, // 1 meter in front of camera
    );
  }

  // Calculate depth-based scale factor
  double calculateDepthScale(vector.Vector3 worldPosition) {
    // Calculate distance from camera
    final distance = worldPosition.length;

    // Scale factor: closer objects are larger, farther objects are smaller
    // Base scale at 1 meter = 1.0
    // At 0.5 meters = 1.5x, At 2 meters = 0.5x
    final scale = 1.0 / distance;

    // Clamp scale between 0.3 and 2.0 for reasonable limits
    return scale.clamp(0.3, 2.0);
  }

  void dispose() {
    debugPrint('ARService: Disposing...');

    stopSession();
    clearAnchors();

    _isInitialized = false;
    _trackingState = 'Disposed';

    debugPrint('ARService: Disposed');
  }
}
