package com.jiji.jijiclean

import android.Manifest
import android.content.ContentValues
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.ImageDecoder
import android.graphics.Matrix
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.widget.ImageButton
import android.widget.SeekBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import com.google.common.util.concurrent.ListenableFuture
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {
    
    private lateinit var previewView: PreviewView
    private lateinit var overlayView: OverlayView
    private lateinit var cameraProviderFuture: ListenableFuture<ProcessCameraProvider>
    private lateinit var cameraExecutor: ExecutorService
    private lateinit var handTracker: HandTracker
    
    private var camera: Camera? = null
    private var imageCapture: ImageCapture? = null
    private var selectedIcon: String? = null
    private var cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
    
    private val icons = arrayOf("🦠", "🧫", "🦟", "🐛", "✨", "💎", "⭐", "🌟")
    
    // 권한 요청
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions[Manifest.permission.CAMERA] == true) {
            startCamera()
        } else {
            Toast.makeText(this, "카메라 권한이 필요합니다", Toast.LENGTH_SHORT).show()
            finish()
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        previewView = findViewById(R.id.previewView)
        overlayView = findViewById(R.id.overlayView)
        
        cameraExecutor = Executors.newSingleThreadExecutor()
        
        // 손 추적 초기화
        handTracker = HandTracker(this) { keyPoints ->
            runOnUiThread {
                // 여러 개의 키포인트를 OverlayView에 전달
                overlayView.setHandKeyPoints(keyPoints)
            }
        }
        handTracker.initialize()
        
        // 아이콘 선택 리스너
        setupIconListeners()
        
        // 버튼 리스너
        findViewById<ImageButton>(R.id.captureButton).setOnClickListener { takePhoto() }
        findViewById<ImageButton>(R.id.flipButton).setOnClickListener { flipCamera() }
        findViewById<ImageButton>(R.id.galleryButton).setOnClickListener { 
            Toast.makeText(this, "갤러리 기능", Toast.LENGTH_SHORT).show()
        }
        
        // 권한 확인 및 요청
        if (allPermissionsGranted()) {
            startCamera()
        } else {
            requestPermissionLauncher.launch(REQUIRED_PERMISSIONS)
        }
    }
    
    private fun setupIconListeners() {
        val iconViews = arrayOf(
            findViewById(R.id.icon1),
            findViewById(R.id.icon2),
            findViewById(R.id.icon3),
            findViewById(R.id.icon4),
            findViewById(R.id.icon5),
            findViewById(R.id.icon6),
            findViewById(R.id.icon7),
            findViewById<TextView>(R.id.icon8)
        )
        
        iconViews.forEachIndexed { index, view ->
            view.setOnClickListener {
                // 이전 선택 해제
                iconViews.forEach { it.isSelected = false }
                
                // 새로운 선택
                view.isSelected = true
                selectedIcon = icons[index]
                overlayView.setSelectedIcon(selectedIcon)
                
                Log.d(TAG, "Selected icon: $selectedIcon")
            }
        }
    }
    
    private fun startCamera() {
        cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            
            val preview = Preview.Builder()
                .build()
                .also {
                    it.setSurfaceProvider(previewView.surfaceProvider)
                }
            
            imageCapture = ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                .build()
            
            val imageAnalysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also { analysis ->
                    analysis.setAnalyzer(cameraExecutor) { imageProxy ->
                        handTracker.processImage(imageProxy)
                    }
                }
            
            try {
                cameraProvider.unbindAll()
                camera = cameraProvider.bindToLifecycle(
                    this,
                    cameraSelector,
                    preview,
                    imageCapture,
                    imageAnalysis
                )
                
                // 줌 SeekBar 설정
                setupZoomControl()
                
            } catch (e: Exception) {
                Log.e(TAG, "Camera binding failed", e)
            }
            
        }, ContextCompat.getMainExecutor(this))
    }
    
    private fun flipCamera() {
        cameraSelector = if (cameraSelector == CameraSelector.DEFAULT_FRONT_CAMERA) {
            CameraSelector.DEFAULT_BACK_CAMERA
        } else {
            CameraSelector.DEFAULT_FRONT_CAMERA
        }
        startCamera()
    }
    
    private fun setupZoomControl() {
        findViewById<SeekBar>(R.id.zoomSeekBar)?.setOnSeekBarChangeListener(
            object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                    // progress: 0-30 -> zoom: 0.5x-2.0x
                    val zoom = 0.5f + (progress / 30f) * 1.5f
                    camera?.cameraControl?.setZoomRatio(zoom)
                    overlayView.setZoom(zoom)
                }
                
                override fun onStartTrackingTouch(seekBar: SeekBar?) {}
                override fun onStopTrackingTouch(seekBar: SeekBar?) {}
            }
        )
    }
    
    private fun takePhoto() {
        val imageCapture = imageCapture ?: return
        
        val name = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US)
            .format(System.currentTimeMillis())
        
        val contentValues = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, "JIJI_$name")
            put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
            put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/JIJI Clean")
        }
        
        val outputOptions = ImageCapture.OutputFileOptions
            .Builder(
                contentResolver,
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                contentValues
            )
            .build()
        
        imageCapture.takePicture(
            outputOptions,
            ContextCompat.getMainExecutor(this),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    // 촬영된 사진에 오버레이 합성
                    output.savedUri?.let { uri ->
                        compositeOverlayOnPhoto(uri)
                    }
                    
                    Toast.makeText(
                        this@MainActivity,
                        "사진이 갤러리에 저장되었습니다!",
                        Toast.LENGTH_SHORT
                    ).show()
                    Log.d(TAG, "Photo saved: ${output.savedUri}")
                }
                
                override fun onError(exception: ImageCaptureException) {
                    Log.e(TAG, "Photo capture failed", exception)
                    Toast.makeText(
                        this@MainActivity,
                        "사진 저장 실패",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        )
    }
    
    private fun compositeOverlayOnPhoto(photoUri: Uri) {
        try {
            // 1. 저장된 사진 로드
            val photoBitmap = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val source = ImageDecoder.createSource(contentResolver, photoUri)
                ImageDecoder.decodeBitmap(source).copy(Bitmap.Config.ARGB_8888, true)
            } else {
                @Suppress("DEPRECATION")
                MediaStore.Images.Media.getBitmap(contentResolver, photoUri)
            }
            
            // 2. OverlayView를 Bitmap으로 렌더링
            val overlayBitmap = Bitmap.createBitmap(
                overlayView.width,
                overlayView.height,
                Bitmap.Config.ARGB_8888
            ) ?: return
            val overlayCanvas = Canvas(overlayBitmap)
            overlayView.draw(overlayCanvas)
            
            // 3. 사진 비트맵에 오버레이 합성
            val resultBitmap = Bitmap.createBitmap(
                photoBitmap.width,
                photoBitmap.height,
                Bitmap.Config.ARGB_8888
            ) ?: return
            val resultCanvas = Canvas(resultBitmap)
            
            // 사진 그리기
            resultCanvas.drawBitmap(photoBitmap, 0f, 0f, null)
            
            // 오버레이 스케일 조정 후 그리기
            val scaleX = photoBitmap.width.toFloat() / overlayView.width
            val scaleY = photoBitmap.height.toFloat() / overlayView.height
            val matrix = Matrix().apply {
                setScale(scaleX, scaleY)
            }
            resultCanvas.drawBitmap(overlayBitmap, matrix, null)
            
            // 4. 결과를 다시 저장
            contentResolver.openOutputStream(photoUri)?.use { outputStream ->
                resultBitmap.compress(Bitmap.CompressFormat.JPEG, 95, outputStream)
            }
            
            // 메모리 정리
            photoBitmap.recycle()
            overlayBitmap.recycle()
            resultBitmap.recycle()
            
            Log.d(TAG, "Overlay composited successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to composite overlay", e)
        }
    }
    
    private fun allPermissionsGranted() = REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(baseContext, it) == PackageManager.PERMISSION_GRANTED
    }
    
    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
        handTracker.close()
    }
    
    companion object {
        private const val TAG = "MainActivity"
        private val REQUIRED_PERMISSIONS = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        )
    }
}
