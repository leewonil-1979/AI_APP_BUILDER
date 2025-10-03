package com.jiji.jijiclean

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.graphics.PointF
import android.util.Log
import androidx.camera.core.ImageProxy
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.ByteArrayOutputStream

class HandTracker(
    private val context: Context,
    private val onHandDetected: (List<PointF>) -> Unit  // 여러 개의 좌표 전달
) {
    private var handLandmarker: HandLandmarker? = null
    private val scope = CoroutineScope(Dispatchers.Default)

    fun initialize() {
        scope.launch {
            try {
                val baseOptions = BaseOptions.builder()
                    .setModelAssetPath("hand_landmarker.task")
                    .build()

                val options = HandLandmarker.HandLandmarkerOptions.builder()
                    .setBaseOptions(baseOptions)
                    .setRunningMode(RunningMode.LIVE_STREAM)
                    .setNumHands(1)
                    .setMinHandDetectionConfidence(0.5f)
                    .setMinHandPresenceConfidence(0.5f)
                    .setMinTrackingConfidence(0.5f)
                    .setResultListener(::onResults)
                    .setErrorListener { error ->
                        Log.e(TAG, "HandLandmarker error: ${error.message}")
                    }
                    .build()

                handLandmarker = HandLandmarker.createFromOptions(context, options)
                Log.d(TAG, "HandLandmarker initialized successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to initialize HandLandmarker", e)
            }
        }
    }

    fun processImage(imageProxy: ImageProxy) {
        try {
            val bitmap = imageProxy.toBitmap()
            val rotatedBitmap = rotateBitmap(bitmap, imageProxy.imageInfo.rotationDegrees.toFloat())
            
            val mpImage = BitmapImageBuilder(rotatedBitmap).build()
            val frameTime = System.currentTimeMillis()

            handLandmarker?.detectAsync(mpImage, frameTime)
        } catch (e: Exception) {
            Log.e(TAG, "Error processing image", e)
        } finally {
            imageProxy.close()
        }
    }

    private fun onResults(result: HandLandmarkerResult, input: com.google.mediapipe.framework.image.MPImage) {
        if (result.landmarks().isNotEmpty()) {
            val hand = result.landmarks()[0]
            
            // 손 전체 영역에 고르게 분포시키기 위해 더 많은 랜드마크 사용
            val keyPoints = mutableListOf<PointF>()
            
            // 손목 영역 (0)
            keyPoints.add(PointF(hand[0].x(), hand[0].y()))
            
            // 엄지: 손목 -> 끝 (1, 2, 3, 4)
            keyPoints.add(PointF(hand[1].x(), hand[1].y()))
            keyPoints.add(PointF(hand[2].x(), hand[2].y()))
            keyPoints.add(PointF(hand[3].x(), hand[3].y()))
            keyPoints.add(PointF(hand[4].x(), hand[4].y()))
            
            // 검지: 손목 -> 끝 (5, 6, 7, 8)
            keyPoints.add(PointF(hand[5].x(), hand[5].y()))
            keyPoints.add(PointF(hand[6].x(), hand[6].y()))
            keyPoints.add(PointF(hand[7].x(), hand[7].y()))
            keyPoints.add(PointF(hand[8].x(), hand[8].y()))
            
            // 중지: 손목 -> 끝 (9, 10, 11, 12)
            keyPoints.add(PointF(hand[9].x(), hand[9].y()))
            keyPoints.add(PointF(hand[10].x(), hand[10].y()))
            keyPoints.add(PointF(hand[11].x(), hand[11].y()))
            keyPoints.add(PointF(hand[12].x(), hand[12].y()))
            
            // 약지: 손목 -> 끝 (13, 14, 15, 16)
            keyPoints.add(PointF(hand[13].x(), hand[13].y()))
            keyPoints.add(PointF(hand[14].x(), hand[14].y()))
            keyPoints.add(PointF(hand[15].x(), hand[15].y()))
            keyPoints.add(PointF(hand[16].x(), hand[16].y()))
            
            // 새끼: 손목 -> 끝 (17, 18, 19, 20)
            keyPoints.add(PointF(hand[17].x(), hand[17].y()))
            keyPoints.add(PointF(hand[18].x(), hand[18].y()))
            keyPoints.add(PointF(hand[19].x(), hand[19].y()))
            keyPoints.add(PointF(hand[20].x(), hand[20].y()))
            
            Log.d(TAG, "Hand detected with ${keyPoints.size} key points")
            
            // 여러 좌표를 콜백으로 전달
            onHandDetected(keyPoints)
        }
    }

    private fun rotateBitmap(bitmap: Bitmap, degrees: Float): Bitmap {
        if (degrees == 0f) return bitmap
        
        val matrix = Matrix()
        matrix.postRotate(degrees)
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
    }

    fun close() {
        handLandmarker?.close()
        handLandmarker = null
    }

    companion object {
        private const val TAG = "HandTracker"
    }
}

// ImageProxy를 Bitmap으로 변환하는 확장 함수
fun ImageProxy.toBitmap(): Bitmap {
    val yBuffer = planes[0].buffer
    val vuBuffer = planes[2].buffer

    val ySize = yBuffer.remaining()
    val vuSize = vuBuffer.remaining()

    val nv21 = ByteArray(ySize + vuSize)

    yBuffer.get(nv21, 0, ySize)
    vuBuffer.get(nv21, ySize, vuSize)

    val yuvImage = android.graphics.YuvImage(
        nv21,
        android.graphics.ImageFormat.NV21,
        this.width,
        this.height,
        null
    )
    
    val out = ByteArrayOutputStream()
    yuvImage.compressToJpeg(android.graphics.Rect(0, 0, this.width, this.height), 100, out)
    val imageBytes = out.toByteArray()
    
    return android.graphics.BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
}
