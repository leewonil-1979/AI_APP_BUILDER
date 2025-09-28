// AR 손씻기 습관 유도 - 기록추가 컴포넌트 (Phase 3: AR 고도화)
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Alert,
  LinearProgress,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { use기록추가 } from "../store/store";

// WHO 손씻기 6단계 정의
const WASH_STEPS = [
  {
    id: 1,
    title: "손바닥과 손바닥",
    description: "손바닥과 손바닥을 마주대고 문지르기",
    duration: 3,
    icon: "🤲",
  },
  {
    id: 2,
    title: "손바닥과 손등",
    description: "손바닥과 손등을 번갈아 문지르기",
    duration: 3,
    icon: "✋",
  },
  {
    id: 3,
    title: "손가락 사이",
    description: "손가락 사이사이를 깍지 끼며 문지르기",
    duration: 3,
    icon: "🤞",
  },
  {
    id: 4,
    title: "손가락 끝",
    description: "손가락 끝과 손톱 밑을 문지르기",
    duration: 3,
    icon: "👆",
  },
  {
    id: 5,
    title: "엄지손가락",
    description: "엄지손가락을 돌려가며 문지르기",
    duration: 3,
    icon: "👍",
  },
  {
    id: 6,
    title: "손목까지",
    description: "손목까지 깨끗하게 씻기",
    duration: 5,
    icon: "💪",
  },
];

interface WashRecord {
  id: string;
  timestamp: string;
  duration: number;
  quality: "excellent" | "good" | "poor";
  location: string;
  arUsed: boolean;
  completedSteps: number[];
  notes?: string;
}

export const 기록추가Component = () => {
  const { 기록추가Data, add기록추가 } = use기록추가();

  // AR 세션 상태
  const [isARActive, setIsARActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [stepTimer, setStepTimer] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // 카메라 및 움직임 감지
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [motionDetected, setMotionDetected] = useState(false);
  const [handMovementIntensity, setHandMovementIntensity] = useState(0);

  // 설정 및 메타데이터
  const [washLocation, setWashLocation] = useState("집");
  const [notes, setNotes] = useState("");
  const [showARDialog, setShowARDialog] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const motionDetectionRef = useRef<NodeJS.Timeout | null>(null);

  // AR 모드 시작
  const startARMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsARActive(true);
      setShowARDialog(true);
      startWashingSession();
      startMotionDetection();
    } catch (error) {
      console.error("카메라 접근 실패:", error);
      alert("❌ 카메라에 접근할 수 없습니다.\n일반 타이머 모드로 진행하시겠습니까?");
      startWashingSession();
    }
  };

  // 기본 타이머 모드 시작
  const startBasicMode = () => {
    setIsARActive(false);
    setShowARDialog(true);
    startWashingSession();
  };

  // 손씻기 세션 시작
  const startWashingSession = () => {
    setIsRecording(true);
    setCurrentStep(0);
    setTimer(0);
    setStepTimer(0);
    setCompletedSteps([]);

    // 전체 타이머
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    // 단계별 타이머
    startStepTimer();
  };

  // 단계별 타이머 시작
  const startStepTimer = () => {
    setStepTimer(0);
    stepTimerRef.current = setInterval(() => {
      setStepTimer((prev) => {
        const newTime = prev + 1;
        const currentStepData = WASH_STEPS[currentStep];

        // 단계 완료 조건 확인
        if (newTime >= currentStepData.duration && handMovementIntensity > 30) {
          completeCurrentStep();
        }

        return newTime;
      });
    }, 1000);
  };

  // 현재 단계 완료
  const completeCurrentStep = () => {
    const stepId = WASH_STEPS[currentStep].id;
    setCompletedSteps((prev) => [...prev, stepId]);

    if (currentStep < WASH_STEPS.length - 1) {
      // 다음 단계로
      setCurrentStep((prev) => prev + 1);
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
      }
      startStepTimer();
    } else {
      // 모든 단계 완료
      finishWashing();
    }
  };

  // 손동작 감지 시작 (간단한 pixel diff 기반)
  const startMotionDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    let prevImageData: ImageData | null = null;

    motionDetectionRef.current = setInterval(() => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);

        const currentImageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

        if (prevImageData && currentImageData) {
          const diffSum = calculatePixelDifference(prevImageData, currentImageData);
          const intensity = Math.min(100, diffSum / 1000); // 0-100 스케일

          setHandMovementIntensity(intensity);
          setMotionDetected(intensity > 20);
        }

        if (currentImageData) {
          prevImageData = currentImageData;
        }
      }
    }, 500); // 0.5초마다 체크
  };

  // 픽셀 차이 계산
  const calculatePixelDifference = (prev: ImageData, current: ImageData): number => {
    let diff = 0;
    const length = prev.data.length;

    for (let i = 0; i < length; i += 4) {
      const rDiff = Math.abs(prev.data[i] - current.data[i]);
      const gDiff = Math.abs(prev.data[i + 1] - current.data[i + 1]);
      const bDiff = Math.abs(prev.data[i + 2] - current.data[i + 2]);
      diff += rDiff + gDiff + bDiff;
    }

    return diff;
  };

  // 손씻기 완료
  const finishWashing = () => {
    // 모든 타이머 정지
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    if (motionDetectionRef.current) clearInterval(motionDetectionRef.current);

    // 카메라 정지
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    // 품질 계산
    const completionRate = completedSteps.length / WASH_STEPS.length;
    const quality: "excellent" | "good" | "poor" =
      completionRate >= 0.9 && timer >= 20
        ? "excellent"
        : completionRate >= 0.7 && timer >= 15
          ? "good"
          : "poor";

    // 기록 저장
    const newRecord: WashRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("ko-KR"),
      duration: timer,
      quality,
      location: washLocation,
      arUsed: isARActive,
      completedSteps,
      notes,
    };

    add기록추가(newRecord);

    // 상태 초기화
    resetSession();

    // 결과 표시
    const message =
      quality === "excellent"
        ? `🎉 완벽한 손씻기! (${timer}초, ${completedSteps.length}/${WASH_STEPS.length} 단계 완료)`
        : quality === "good"
          ? `👍 좋은 손씻기! (${timer}초, ${completedSteps.length}/${WASH_STEPS.length} 단계 완료)`
          : `📝 더 꼼꼼히 씻어보세요 (${timer}초, ${completedSteps.length}/${WASH_STEPS.length} 단계 완료)`;

    alert(message);
  };

  // 세션 취소
  const cancelWashing = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    if (motionDetectionRef.current) clearInterval(motionDetectionRef.current);

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    resetSession();
  };

  // 세션 상태 초기화
  const resetSession = () => {
    setIsRecording(false);
    setIsARActive(false);
    setShowARDialog(false);
    setCurrentStep(0);
    setTimer(0);
    setStepTimer(0);
    setCompletedSteps([]);
    setMotionDetected(false);
    setHandMovementIntensity(0);
    setNotes("");
  };

  // 수동 단계 완료 (AR 없을 때)
  const manualCompleteStep = () => {
    completeCurrentStep();
  };

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 품질 관련 함수들
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "#4caf50";
      case "good":
        return "#ff9800";
      case "poor":
        return "#f44336";
      default:
        return "#757575";
    }
  };

  const getQualityText = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "완벽";
      case "good":
        return "양호";
      case "poor":
        return "개선 필요";
      default:
        return "미정";
    }
  };

  // 정리 effect
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      if (motionDetectionRef.current) clearInterval(motionDetectionRef.current);
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* 헤더 */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🚿 AR 손씻기 가이드
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            WHO 권장 6단계를 AR로 정확하게 따라해보세요!
          </Typography>
        </Box>

        {/* 시작 버튼들 */}
        {!isRecording && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={startARMode}
              startIcon={<span>📱</span>}
              sx={{
                height: 80,
                background: "linear-gradient(45deg, #e91e63, #ff4081)",
                fontSize: "1.1rem",
              }}
            >
              AR 가이드 시작
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={startBasicMode}
              startIcon={<span>⏱️</span>}
              sx={{ height: 80, fontSize: "1.1rem" }}
            >
              기본 타이머
            </Button>
          </Stack>
        )}

        {/* 설정 옵션 */}
        {!isRecording && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚙️ 세션 설정
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>손씻기 위치</InputLabel>
                  <Select value={washLocation} onChange={(e) => setWashLocation(e.target.value)}>
                    <MenuItem value="집">🏠 집</MenuItem>
                    <MenuItem value="회사">🏢 회사</MenuItem>
                    <MenuItem value="식당">🍽️ 식당</MenuItem>
                    <MenuItem value="화장실">🚻 화장실</MenuItem>
                    <MenuItem value="기타">🌍 기타</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="메모 (선택사항)"
                  multiline
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="특이사항을 기록해보세요..."
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* WHO 6단계 가이드 */}
        {!isRecording && (
          <Card sx={{ backgroundColor: "#f0f8ff" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                📋 WHO 권장 6단계 손씻기
              </Typography>
              <Stack spacing={2}>
                {WASH_STEPS.map((step) => (
                  <Box key={step.id} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                      <Typography variant="caption">{step.id}</Typography>
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {step.icon} {step.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {step.description} ({step.duration}초)
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* 최근 기록 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 최근 기록 (최근 5개)
            </Typography>
            <Stack spacing={2}>
              {기록추가Data
                .slice(-5)
                .reverse()
                .map((record: WashRecord) => (
                  <Card key={record.id} sx={{ backgroundColor: "#f9f9f9" }}>
                    <CardContent sx={{ py: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: getQualityColor(record.quality),
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontSize: "0.7rem", color: "white" }}
                              >
                                {record.duration}s
                              </Typography>
                            </Avatar>
                            <Typography variant="body2" fontWeight="bold">
                              {record.location}
                            </Typography>
                            <Chip
                              label={getQualityText(record.quality)}
                              size="small"
                              sx={{ bgcolor: getQualityColor(record.quality), color: "white" }}
                            />
                            {record.arUsed && <Chip label="AR" size="small" color="secondary" />}
                            <Chip label={`${record.completedSteps?.length || 0}/6`} size="small" />
                          </Stack>
                          <Typography variant="caption" color="textSecondary">
                            {record.timestamp}
                          </Typography>
                          {record.notes && (
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, fontStyle: "italic", fontSize: "0.8rem" }}
                            >
                              "{record.notes}"
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="h6" color="primary">
                          {record.duration}초
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}

              {기록추가Data.length === 0 && (
                <Alert severity="info">아직 기록이 없습니다. 첫 AR 손씻기를 시작해보세요! 🚿</Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* AR 가이드 다이얼로그 */}
      <Dialog
        open={showARDialog}
        onClose={cancelWashing}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { height: "90vh" } }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {isARActive ? "📱 AR 손씻기 가이드" : "⏱️ 손씻기 타이머"}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip label={`${completedSteps.length}/6 단계`} color="primary" />
              <Typography variant="h5" color="primary">
                {formatTime(timer)}
              </Typography>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* 카메라 뷰 (AR 모드일 때만) */}
            {isARActive && (
              <Box sx={{ position: "relative", textAlign: "center" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    backgroundColor: "#000",
                  }}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />

                {/* 움직임 감지 오버레이 */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Chip
                    label={motionDetected ? "움직임 감지됨" : "손을 움직여주세요"}
                    color={motionDetected ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={`강도: ${handMovementIntensity.toFixed(0)}%`}
                    color={handMovementIntensity > 30 ? "success" : "warning"}
                    size="small"
                  />
                </Box>
              </Box>
            )}

            {/* 현재 단계 가이드 */}
            <Card sx={{ backgroundColor: currentStep < WASH_STEPS.length ? "#e8f5e8" : "#fff3e0" }}>
              <CardContent>
                {currentStep < WASH_STEPS.length ? (
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="h4">{WASH_STEPS[currentStep].icon}</Typography>
                    <Typography variant="h6" textAlign="center">
                      단계 {currentStep + 1}: {WASH_STEPS[currentStep].title}
                    </Typography>
                    <Typography variant="body2" textAlign="center" color="textSecondary">
                      {WASH_STEPS[currentStep].description}
                    </Typography>

                    <Box sx={{ width: "100%", mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        단계 진행: {stepTimer}/{WASH_STEPS[currentStep].duration}초
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(stepTimer / WASH_STEPS[currentStep].duration) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    {!isARActive && (
                      <Button
                        variant="contained"
                        onClick={manualCompleteStep}
                        disabled={stepTimer < WASH_STEPS[currentStep].duration}
                        startIcon={<span>✅</span>}
                      >
                        단계 완료
                      </Button>
                    )}
                  </Stack>
                ) : (
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="h4">🎉</Typography>
                    <Typography variant="h6" textAlign="center">
                      모든 단계 완료!
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      손씻기를 완료하시겠습니까?
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* 진행 상황 스테퍼 */}
            <Stepper activeStep={currentStep} orientation="horizontal" alternativeLabel>
              {WASH_STEPS.map((step) => (
                <Step key={step.id} completed={completedSteps.includes(step.id)}>
                  <StepLabel>
                    <Typography variant="caption">
                      {step.icon}
                      <br />
                      {step.title}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={cancelWashing} color="error">
            취소
          </Button>
          <Button
            onClick={finishWashing}
            variant="contained"
            color="success"
            disabled={timer < 10}
            startIcon={<span>✅</span>}
          >
            완료 ({timer}초)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
