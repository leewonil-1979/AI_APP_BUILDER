import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'dart:developer' as developer;

late List<CameraDescription> cameras;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  cameras = await availableCameras();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JIJI Clean',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const CameraScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;
  int _selectedCameraIndex = 0;
  double _currentZoom = 1.0;
  String? _selectedIcon;

  // ML Kit Pose Detection
  late PoseDetector _poseDetector;
  Offset? _wristPosition;
  bool _isDetecting = false;

  // 갤러리
  final ImagePicker _picker = ImagePicker();
  String? _lastCapturedImagePath;

  // 아이콘 목록 (임시로 이모지 사용)
  final List<String> germIcons = ['🦠', '🧫', '🦟', '🐛'];
  final List<String> sparkleIcons = ['✨', '💎', '⭐', '🌟'];

  @override
  void initState() {
    super.initState();
    _initializePoseDetector();
    _initializeCamera();
  }

  void _initializePoseDetector() {
    final options = PoseDetectorOptions(
      mode: PoseDetectionMode.stream,
      model: PoseDetectionModel.accurate,
    );
    _poseDetector = PoseDetector(options: options);
  }

  Future<void> _initializeCamera() async {
    _controller = CameraController(
      cameras[_selectedCameraIndex],
      ResolutionPreset.high,
      enableAudio: false,
    );
    _initializeControllerFuture = _controller.initialize().then((_) {
      _controller.startImageStream(_processCameraImage);
    });
    setState(() {});
  }

  Future<void> _processCameraImage(CameraImage image) async {
    if (_isDetecting || !mounted) return;
    _isDetecting = true;

    try {
      final InputImage inputImage = _convertCameraImage(image);
      final List<Pose> poses = await _poseDetector.processImage(inputImage);

      if (poses.isNotEmpty && mounted) {
        final pose = poses.first;

        // 왼쪽 손목 또는 오른쪽 손목 찾기
        PoseLandmark? wrist = pose.landmarks[PoseLandmarkType.leftWrist];
        if (wrist == null || wrist.likelihood < 0.5) {
          wrist = pose.landmarks[PoseLandmarkType.rightWrist];
        }

        if (wrist != null && wrist.likelihood > 0.5) {
          // 카메라 이미지 좌표를 화면 좌표로 변환
          final screenSize = MediaQuery.of(context).size;

          // 전면 카메라의 경우 좌우 반전
          double x = wrist.x;
          if (_selectedCameraIndex == 1) {
            x = image.width.toDouble() - x;
          }

          final double wristY = wrist.y;

          setState(() {
            _wristPosition = Offset(
              (x / image.width) * screenSize.width,
              (wristY / image.height) * screenSize.height,
            );
          });
        }
      }
    } catch (e) {
      developer.log('Pose detection error: $e', name: 'PoseDetection');
    } finally {
      _isDetecting = false;
    }
  }

  InputImage _convertCameraImage(CameraImage image) {
    final WriteBuffer allBytes = WriteBuffer();
    for (final Plane plane in image.planes) {
      allBytes.putUint8List(plane.bytes);
    }
    final bytes = allBytes.done().buffer.asUint8List();

    final Size imageSize = Size(
      image.width.toDouble(),
      image.height.toDouble(),
    );

    final InputImageRotation imageRotation = _getImageRotation();

    final InputImageFormat inputImageFormat = InputImageFormat.yuv420;

    final metadata = InputImageMetadata(
      size: imageSize,
      rotation: imageRotation,
      format: inputImageFormat,
      bytesPerRow: image.planes[0].bytesPerRow,
    );

    return InputImage.fromBytes(bytes: bytes, metadata: metadata);
  }

  InputImageRotation _getImageRotation() {
    // Android에서 후면 카메라는 90도 회전
    if (_selectedCameraIndex == 0) {
      return InputImageRotation.rotation90deg;
    } else {
      return InputImageRotation.rotation270deg;
    }
  }

  Future<void> _switchCamera() async {
    await _controller.stopImageStream();
    await _controller.dispose();
    _selectedCameraIndex = (_selectedCameraIndex + 1) % cameras.length;
    await _initializeCamera();
  }

  Future<void> _takePicture() async {
    try {
      await _initializeControllerFuture;

      // 이미지 스트림 일시 중지
      await _controller.stopImageStream();

      final image = await _controller.takePicture();
      _lastCapturedImagePath = image.path;

      // 이미지 스트림 재시작
      await _controller.startImageStream(_processCameraImage);

      if (mounted) {
        setState(() {});
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('사진이 갤러리에 저장되었습니다')));
      }
    } catch (e) {
      developer.log('사진 촬영 오류: $e', name: 'CameraCapture');
    }
  }

  Future<void> _openGallery() async {
    try {
      final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
      if (image != null && mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('선택된 이미지: ${image.name}')));
      }
    } catch (e) {
      developer.log('갤러리 열기 오류: $e', name: 'Gallery');
    }
  }

  @override
  void dispose() {
    _controller.stopImageStream().then((_) {
      _controller.dispose();
    });
    _poseDetector.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: FutureBuilder<void>(
        future: _initializeControllerFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return Stack(
              children: [
                // 카메라 프리뷰
                Positioned.fill(child: CameraPreview(_controller)),

                // 상단: 아이콘 선택 영역
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.7),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    child: SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            // 세균 아이콘 줄
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: germIcons.map((icon) {
                                return GestureDetector(
                                  onTap: () =>
                                      setState(() => _selectedIcon = icon),
                                  child: Container(
                                    width: 60,
                                    height: 60,
                                    decoration: BoxDecoration(
                                      color: _selectedIcon == icon
                                          ? Colors.red.withValues(alpha: 0.3)
                                          : Colors.white.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: _selectedIcon == icon
                                            ? Colors.red
                                            : Colors.white.withValues(
                                                alpha: 0.5,
                                              ),
                                        width: 2,
                                      ),
                                    ),
                                    child: Center(
                                      child: Text(
                                        icon,
                                        style: const TextStyle(fontSize: 32),
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 8),
                            // 반짝 아이콘 줄
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: sparkleIcons.map((icon) {
                                return GestureDetector(
                                  onTap: () =>
                                      setState(() => _selectedIcon = icon),
                                  child: Container(
                                    width: 60,
                                    height: 60,
                                    decoration: BoxDecoration(
                                      color: _selectedIcon == icon
                                          ? Colors.yellow.withValues(alpha: 0.3)
                                          : Colors.white.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: _selectedIcon == icon
                                            ? Colors.yellow
                                            : Colors.white.withValues(
                                                alpha: 0.5,
                                              ),
                                        width: 2,
                                      ),
                                    ),
                                    child: Center(
                                      child: Text(
                                        icon,
                                        style: const TextStyle(fontSize: 32),
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                // 우측: 줌 슬라이더
                Positioned(
                  right: 16,
                  top: MediaQuery.of(context).size.height * 0.3,
                  bottom: MediaQuery.of(context).size.height * 0.3,
                  child: Container(
                    width: 40,
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          '2.0×',
                          style: TextStyle(color: Colors.white, fontSize: 10),
                        ),
                        Expanded(
                          child: RotatedBox(
                            quarterTurns: 3,
                            child: Slider(
                              value: _currentZoom,
                              min: 0.5,
                              max: 2.0,
                              divisions: 15,
                              activeColor: Colors.white,
                              inactiveColor: Colors.white30,
                              onChanged: (value) {
                                setState(() => _currentZoom = value);
                                _controller.setZoomLevel(value);
                              },
                            ),
                          ),
                        ),
                        const Text(
                          '0.5×',
                          style: TextStyle(color: Colors.white, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ),

                // 하단: 컨트롤 버튼들
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.7),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    child: SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            // 갤러리 버튼
                            IconButton(
                              onPressed: _openGallery,
                              icon: Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.3),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 2,
                                  ),
                                ),
                                child: _lastCapturedImagePath != null
                                    ? ClipRRect(
                                        borderRadius: BorderRadius.circular(6),
                                        child: Image.file(
                                          File(_lastCapturedImagePath!),
                                          fit: BoxFit.cover,
                                        ),
                                      )
                                    : const Icon(
                                        Icons.photo_library,
                                        color: Colors.white,
                                        size: 28,
                                      ),
                              ),
                            ),

                            // 셔터 버튼
                            GestureDetector(
                              onTap: _takePicture,
                              child: Container(
                                width: 80,
                                height: 80,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white,
                                  border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.5),
                                    width: 4,
                                  ),
                                ),
                                child: Container(
                                  margin: const EdgeInsets.all(6),
                                  decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),

                            // 카메라 전환 버튼
                            IconButton(
                              onPressed: _switchCamera,
                              icon: Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.3),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.flip_camera_ios,
                                  color: Colors.white,
                                  size: 28,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                // 선택된 아이콘 표시 (손목 위치 또는 중앙)
                if (_selectedIcon != null)
                  Positioned(
                    left: _wristPosition != null
                        ? _wristPosition!.dx - 50
                        : MediaQuery.of(context).size.width / 2 - 50,
                    top: _wristPosition != null
                        ? _wristPosition!.dy - 50
                        : MediaQuery.of(context).size.height / 2 - 50,
                    child: Container(
                      width: 100,
                      height: 100,
                      child: Text(
                        _selectedIcon!,
                        style: const TextStyle(fontSize: 80),
                      ),
                    ),
                  ),
              ],
            );
          } else {
            // 로딩 화면
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('🧼', style: TextStyle(fontSize: 100)),
                  const SizedBox(height: 20),
                  const Text(
                    'JIJI Clean',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const CircularProgressIndicator(color: Colors.white),
                ],
              ),
            );
          }
        },
      ),
    );
  }
}
