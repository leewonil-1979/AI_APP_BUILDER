// AR 손씻기 습관 유도 - 홈 컴포넌트
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Avatar,
  LinearProgress,
  Chip,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { use홈 } from "../store/store";

interface DailyProgress {
  date: string;
  washes: number;
  target: number;
  streak: number;
}

export const 홈Component = () => {
  const { 홈Data, add홈 } = use홈();
  const [todayProgress, setTodayProgress] = useState<DailyProgress>({
    date: new Date().toLocaleDateString("ko-KR"),
    washes: 3,
    target: 6,
    streak: 7,
  });

  // 오늘의 손씻기 진행률
  const progressPercentage = (todayProgress.washes / todayProgress.target) * 100;
  const isTargetAchieved = todayProgress.washes >= todayProgress.target;

  // 다음 손씻기 시간 계산 (2시간 간격 권장)
  const [nextWashTime, setNextWashTime] = useState("");

  useEffect(() => {
    const now = new Date();
    const next = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2시간 후
    setNextWashTime(
      next.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, []);

  const handleQuickWash = () => {
    setTodayProgress((prev) => ({
      ...prev,
      washes: prev.washes + 1,
      streak: prev.washes + 1 >= prev.target ? prev.streak + 1 : prev.streak,
    }));

    add홈({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("ko-KR"),
      type: "quick_wash",
      duration: 20,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* 헤더 */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            � AR 손씻기 트래커
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            건강한 손씻기 습관으로 깨끗한 하루를!
          </Typography>
        </Box>

        {/* 오늘의 진행 상황 */}
        <Card
          elevation={3}
          sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">오늘의 진행 상황</Typography>
                <Chip
                  icon={<span>🔥</span>}
                  label={`${todayProgress.streak}일 연속`}
                  color="warning"
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                  {todayProgress.washes}/{todayProgress.target}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progressPercentage, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(255,255,255,0.3)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: isTargetAchieved ? "#4caf50" : "#ffc107",
                    },
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  {isTargetAchieved
                    ? "🎉 오늘 목표 달성!"
                    : `목표까지 ${todayProgress.target - todayProgress.washes}번 남음`}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* 빠른 액션 버튼들 */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<span>🚿</span>}
            onClick={handleQuickWash}
            sx={{
              height: 80,
              fontSize: "1.1rem",
              background: "linear-gradient(45deg, #2196f3, #21cbf3)",
            }}
          >
            지금 손씻기
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<span>⏰</span>}
            sx={{ height: 80, fontSize: "1.1rem" }}
          >
            타이머 설정
          </Button>
        </Stack>

        {/* 다음 손씻기 알림 */}
        <Alert severity="info" icon={<span>⏰</span>} sx={{ backgroundColor: "#e3f2fd" }}>
          <Typography variant="body1">
            <strong>다음 손씻기 권장 시간:</strong> {nextWashTime}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            건강한 습관을 위해 2시간마다 손씻기를 권장합니다.
          </Typography>
        </Alert>

        {/* 오늘의 통계 요약 */}
        <Stack direction="row" spacing={2}>
          <Card sx={{ textAlign: "center", p: 2, flex: 1 }}>
            <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 1 }}>
              <span>🚿</span>
            </Avatar>
            <Typography variant="h6">{todayProgress.washes}</Typography>
            <Typography variant="caption" color="textSecondary">
              오늘 횟수
            </Typography>
          </Card>

          <Card sx={{ textAlign: "center", p: 2, flex: 1 }}>
            <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 1 }}>
              <span>📈</span>
            </Avatar>
            <Typography variant="h6">{todayProgress.streak}</Typography>
            <Typography variant="caption" color="textSecondary">
              연속 일수
            </Typography>
          </Card>

          <Card sx={{ textAlign: "center", p: 2, flex: 1 }}>
            <Avatar sx={{ bgcolor: "warning.main", mx: "auto", mb: 1 }}>
              <span>⭐</span>
            </Avatar>
            <Typography variant="h6">{Math.round(progressPercentage)}%</Typography>
            <Typography variant="caption" color="textSecondary">
              목표 달성률
            </Typography>
          </Card>
        </Stack>

        {/* 최근 활동 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              최근 활동
            </Typography>
            <Stack spacing={1}>
              {홈Data
                .slice(-3)
                .reverse()
                .map((activity: any) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span style={{ color: "#4caf50" }}>✅</span>
                      <Typography variant="body2">손씻기 완료 ({activity.duration}초)</Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {activity.timestamp}
                    </Typography>
                  </Box>
                ))}

              {홈Data.length === 0 && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  아직 기록이 없습니다. 첫 손씻기를 시작해보세요! 🚿
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 건강 팁 */}
        <Card sx={{ backgroundColor: "#fff3e0" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="warning.main">
              💡 오늘의 손씻기 팁
            </Typography>
            <Typography variant="body2">
              <strong>올바른 손씻기 순서:</strong>
              <br />
              1. 물로 손을 적신다 → 2. 비누를 충분히 묻힌다 → 3. 20초 이상 문지른다 → 4. 찬물로
              헹군다 → 5. 깨끗한 수건으로 닦는다
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
