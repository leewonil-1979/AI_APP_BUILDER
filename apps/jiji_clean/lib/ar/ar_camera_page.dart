import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/ar_service.dart';
import '../services/hand_detection_service.dart';

class ARCameraPage extends StatefulWidget {
  const ARCameraPage({super.key});

  @override
  State<ARCameraPage> createState() => _ARCameraPageState();
}

class _ARCameraPageState extends State<ARCameraPage>
    with WidgetsBindingObserver {
  // AR Services
  final ARService _arService = ARService();
  final HandDetectionService _handDetectionService = HandDetectionService();

  // Camera variables
  CameraController? _cameraController;
  List<CameraDescription> _cameras = [];
  bool _isCameraInitialized = false;
  bool _isRearCamera = true;

  // AR variables
  bool _isARSessionRunning = false;
  String _arStatus = 'Initializing...';

  // Hand detection variables
  bool _isHandDetected = false;
  String _handInfo = 'No hands detected';
  double _depthScale = 1.0;

  // UI state
  bool _showDebugInfo = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeApp();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _disposeResources();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    if (state == AppLifecycleState.inactive) {
      _cameraController?.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initializeCamera();
    }
  }

  Future<void> _initializeApp() async {
    await _requestPermissions();
    await _initializeCamera();
    await _initializeAR();
    _startHandDetection();
  }

  Future<void> _requestPermissions() async {
    await [Permission.camera, Permission.microphone].request();
  }

  Future<void> _initializeCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isEmpty) {
        setState(() {
          _arStatus = 'No cameras available';
        });
        return;
      }

      final camera = _isRearCamera
          ? _cameras.firstWhere(
              (camera) => camera.lensDirection == CameraLensDirection.back,
              orElse: () => _cameras.first,
            )
          : _cameras.firstWhere(
              (camera) => camera.lensDirection == CameraLensDirection.front,
              orElse: () => _cameras.first,
            );

      _cameraController = CameraController(
        camera,
        ResolutionPreset.high,
        enableAudio: false,
      );

      await _cameraController!.initialize();

      if (mounted) {
        setState(() {
          _isCameraInitialized = true;
          _arStatus = 'Camera initialized';
        });
      }
    } catch (e) {
      setState(() {
        _arStatus = 'Camera error: $e';
      });
    }
  }

  Future<void> _initializeAR() async {
    try {
      if (!_isRearCamera) {
        setState(() {
          _arStatus = 'AR disabled (front camera)';
        });
        return;
      }

      await _arService.initialize();
      setState(() {
        _isARSessionRunning = true;
        _arStatus = 'AR session active';
      });
    } catch (e) {
      setState(() {
        _arStatus = 'AR error: $e';
      });
    }
  }

  void _startHandDetection() {
    _handDetectionService.startDetection((handData) {
      if (mounted) {
        setState(() {
          _isHandDetected = handData['detected'] ?? false;
          _handInfo = handData['info'] ?? 'No hands detected';
          _depthScale = handData['scale'] ?? 1.0;
        });
      }
    });
  }

  Future<void> _toggleCamera() async {
    if (_cameraController != null) {
      await _cameraController!.dispose();
    }

    setState(() {
      _isRearCamera = !_isRearCamera;
      _isCameraInitialized = false;
    });

    await _initializeCamera();
    await _initializeAR();
  }

  Future<void> _captureARScene() async {
    try {
      if (_cameraController == null ||
          !_cameraController!.value.isInitialized) {
        _showMessage('Camera not ready for capture');
        return;
      }

      // Capture the current camera frame
      final image = await _cameraController!.takePicture();

      // Show success message with file path
      _showMessage('AR scene captured: ${image.path}');

      // In a real app, you would:
      // 1. Overlay AR elements on the captured image
      // 2. Save to gallery with proper permissions
      // 3. Apply any AR overlays or hand tracking data
    } catch (e) {
      _showMessage('Capture failed: $e');
    }
  }

  void _showMessage(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), duration: const Duration(seconds: 2)),
      );
    }
  }

  void _showARSettings() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.black.withValues(alpha: 0.9),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'AR Settings',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),

            // Debug Info Toggle
            ListTile(
              leading: const Icon(Icons.visibility, color: Colors.white),
              title: const Text(
                'Show Debug Info',
                style: TextStyle(color: Colors.white),
              ),
              trailing: Switch(
                value: _showDebugInfo,
                onChanged: (value) {
                  setState(() {
                    _showDebugInfo = value;
                  });
                  Navigator.pop(context);
                },
                activeColor: Colors.green,
              ),
            ),

            // Camera Info
            ListTile(
              leading: const Icon(Icons.camera, color: Colors.white),
              title: Text(
                'Camera: ${_isRearCamera ? 'Rear' : 'Front'}',
                style: const TextStyle(color: Colors.white),
              ),
              subtitle: Text(
                _isRearCamera ? 'AR enabled' : 'AR disabled',
                style: TextStyle(
                  color: _isRearCamera ? Colors.green : Colors.orange,
                ),
              ),
            ),

            // AR Status
            ListTile(
              leading: const Icon(Icons.view_in_ar, color: Colors.white),
              title: const Text(
                'AR Status',
                style: TextStyle(color: Colors.white),
              ),
              subtitle: Text(
                _arStatus,
                style: TextStyle(
                  color: _isARSessionRunning ? Colors.green : Colors.red,
                ),
              ),
            ),

            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _disposeResources() {
    _cameraController?.dispose();
    _arService.dispose();
    _handDetectionService.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black.withValues(alpha: 0.5),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'JIJI Clean AR',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _showDebugInfo ? Icons.visibility : Icons.visibility_off,
              color: Colors.white,
            ),
            onPressed: () {
              setState(() {
                _showDebugInfo = !_showDebugInfo;
              });
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // Camera Preview
          _buildCameraPreview(),

          // AR Overlay
          if (_isARSessionRunning) _buildAROverlay(),

          // Hand Detection Overlay
          if (_isHandDetected) _buildHandOverlay(),

          // Debug Info
          if (_showDebugInfo) _buildDebugInfo(),

          // Control Panel
          _buildControlPanel(),
        ],
      ),
    );
  }

  Widget _buildCameraPreview() {
    if (!_isCameraInitialized || _cameraController == null) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    }

    final size = MediaQuery.of(context).size;
    return SizedBox(
      width: size.width,
      height: size.height,
      child: FittedBox(
        fit: BoxFit.cover,
        child: SizedBox(
          width: _cameraController!.value.previewSize?.height ?? size.width,
          height: _cameraController!.value.previewSize?.width ?? size.height,
          child: CameraPreview(_cameraController!),
        ),
      ),
    );
  }

  Widget _buildAROverlay() {
    return Positioned.fill(
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: Colors.green.withValues(alpha: 0.5),
            width: 2,
          ),
        ),
        child: const Center(
          child: Text(
            'AR Session Active',
            style: TextStyle(
              color: Colors.green,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHandOverlay() {
    return Positioned(
      top: MediaQuery.of(context).size.height * 0.3,
      left: MediaQuery.of(context).size.width * 0.3,
      child: Transform.scale(
        scale: _depthScale,
        child: Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: Colors.blue.withValues(alpha: 0.7),
            borderRadius: BorderRadius.circular(40),
            border: Border.all(color: Colors.white, width: 2),
          ),
          child: const Icon(Icons.wash, color: Colors.white, size: 40),
        ),
      ),
    );
  }

  Widget _buildDebugInfo() {
    return Positioned(
      top: 100,
      left: 20,
      right: 20,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.7),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Debug Info',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            _buildDebugRow('AR Status', _arStatus),
            _buildDebugRow('Camera', _isRearCamera ? 'Rear' : 'Front'),
            _buildDebugRow('Hand Detection', _handInfo),
            _buildDebugRow('Depth Scale', '${(_depthScale * 100).toInt()}%'),
            _buildDebugRow('FPS', '24 fps (simulated)'),
          ],
        ),
      ),
    );
  }

  Widget _buildDebugRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlPanel() {
    return Positioned(
      bottom: 50,
      left: 20,
      right: 20,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // Camera Toggle
          _buildControlButton(
            icon: _isRearCamera ? Icons.camera_rear : Icons.camera_front,
            label: 'Toggle',
            onPressed: _toggleCamera,
          ),

          // Capture Button (main)
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(40),
              border: Border.all(color: Colors.grey, width: 4),
            ),
            child: IconButton(
              icon: const Icon(Icons.camera_alt, size: 40),
              onPressed: () {
                _captureARScene();
              },
            ),
          ),

          // Settings
          _buildControlButton(
            icon: Icons.settings,
            label: 'Settings',
            onPressed: () {
              _showARSettings();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(25),
            border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
          ),
          child: IconButton(
            icon: Icon(icon, color: Colors.white, size: 24),
            onPressed: onPressed,
          ),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 10)),
      ],
    );
  }
}
