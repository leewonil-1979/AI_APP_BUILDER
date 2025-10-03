package com.jiji.jijiclean

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.PointF
import android.util.AttributeSet
import android.view.View
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

class OverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var selectedIcon: String? = null
    private var handKeyPoints: List<PointF> = emptyList()
    private var startTime = System.currentTimeMillis()
    private var currentZoom: Float = 1.0f  // 줌 레벨
    
    // 각 키포인트마다 여러 아이콘 생성
    private data class IconInstance(
        val offsetX: Float,
        val offsetY: Float,
        val speed: Float,
        val phase: Float
    )
    
    // 각 키포인트당 2개의 아이콘 생성 (21개 포인트 × 2 = 42개)
    private val iconsPerPoint = 2
    private val iconInstances = mutableListOf<IconInstance>()
    
    private val baseIconSize = 60f  // 기본 크기를 절반으로 줄임 (120 → 60)
    private val iconPaint = Paint().apply {
        textSize = baseIconSize
        isAntiAlias = true
    }

    init {
        // 각 키포인트마다 랜덤 오프셋과 속도를 가진 아이콘 생성
        regenerateIconInstances()
    }

    private fun regenerateIconInstances() {
        iconInstances.clear()
        repeat(iconsPerPoint) {
            iconInstances.add(
                IconInstance(
                    offsetX = Random.nextFloat() * 30 - 15,  // -15 ~ 15 (조금 줄임)
                    offsetY = Random.nextFloat() * 30 - 15,
                    speed = Random.nextFloat() * 2f + 1f,   // 1.0 ~ 3.0
                    phase = Random.nextFloat() * 6.28f      // 0 ~ 2π
                )
            )
        }
    }

    fun setSelectedIcon(icon: String?) {
        selectedIcon = icon
        if (icon != null) {
            regenerateIconInstances()
        }
        invalidate()
    }

    fun setHandKeyPoints(keyPoints: List<PointF>) {
        this.handKeyPoints = keyPoints
        invalidate()
    }

    fun setZoom(zoom: Float) {
        currentZoom = zoom
        iconPaint.textSize = baseIconSize * zoom
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        // Apply zoom to icon size
        iconPaint.textSize = baseIconSize * currentZoom
        
        selectedIcon?.let { icon ->
            if (handKeyPoints.isEmpty()) {
                // 손이 없으면 중앙에 1개만
                canvas.drawText(
                    icon,
                    width / 2f - 50,
                    height / 2f + 50,
                    iconPaint
                )
                return
            }
            
            val currentTime = (System.currentTimeMillis() - startTime) / 1000f
            
            // 각 키포인트마다 여러 아이콘 그리기
            handKeyPoints.forEach { keyPoint ->
                val baseX = keyPoint.x * width
                val baseY = keyPoint.y * height
                
                iconInstances.forEach { instance ->
                    // 진동 효과 (sin/cos로 꿈틀거림)
                    val wobbleX = sin(currentTime * instance.speed + instance.phase) * 8f
                    val wobbleY = cos(currentTime * instance.speed * 1.3f + instance.phase) * 8f
                    
                    val finalX = baseX + instance.offsetX + wobbleX - 50
                    val finalY = baseY + instance.offsetY + wobbleY + 50
                    
                    canvas.drawText(icon, finalX, finalY, iconPaint)
                }
            }
            
            // 계속 애니메이션
            postInvalidateOnAnimation()
        }
    }
}
