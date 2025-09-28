// AR 손씻기 습관 유도 - 통계보기 컴포넌트
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  Chip,
  Avatar,
} from "@mui/material";
import { useState, useEffect } from "react";
import { use홈, use기록추가 } from "../store/store";

export const 통계보기Component = () => {
  const { 홈Data } = use홈();
  const { 기록추가Data } = use기록추가();
  const [weeklyStats, setWeeklyStats] = useState({
    totalWashes: 0,
    avgDuration: 0,
    streak: 7,
    weeklyGoal: 42,
  });

  useEffect(() => {
    // 가상 통계 데이터 계산
    const total = 홈Data.length + 기록추가Data.length + 21; // 21은 예시 데이터
    const avg = total > 0 ? 18 : 0;
    setWeeklyStats({
      totalWashes: total,
      avgDuration: avg,
      streak: 7,
      weeklyGoal: 42,
    });
  }, [홈Data, 기록추가Data]);

  const weeklyProgress = (weeklyStats.totalWashes / weeklyStats.weeklyGoal) * 100;
  const dailyAverage = weeklyStats.totalWashes / 7;

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* 헤더 */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            � 손씻기 통계
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            당신의 손씻기 습관을 분석해보세요!
          </Typography>
        </Box>

        {/* 주간 요약 */}
        <Card
          elevation={3}
          sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              이번 주 요약
            </Typography>
            <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                  {weeklyStats.totalWashes}
                </Typography>
                <Typography variant="caption">총 횟수</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                  {weeklyStats.avgDuration}s
                </Typography>
                <Typography variant="caption">평균 시간</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                  {weeklyStats.streak}
                </Typography>
                <Typography variant="caption">연속 일수</Typography>
              </Box>
            </Stack>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                주간 목표: {Math.round(weeklyProgress)}% 달성
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(weeklyProgress, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: weeklyProgress >= 100 ? "#4caf50" : "#ffc107",
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* 일일 통계 카드들 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 2,
          }}
        >
          <Card sx={{ textAlign: "center", p: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 1 }}>
              <span>📈</span>
            </Avatar>
            <Typography variant="h6">{dailyAverage.toFixed(1)}</Typography>
            <Typography variant="caption" color="textSecondary">
              일평균 횟수
            </Typography>
          </Card>

          <Card sx={{ textAlign: "center", p: 2 }}>
            <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 1 }}>
              <span>⏱️</span>
            </Avatar>
            <Typography variant="h6">{weeklyStats.avgDuration}초</Typography>
            <Typography variant="caption" color="textSecondary">
              평균 소요시간
            </Typography>
          </Card>

          <Card sx={{ textAlign: "center", p: 2 }}>
            <Avatar sx={{ bgcolor: "warning.main", mx: "auto", mb: 1 }}>
              <span>🎯</span>
            </Avatar>
            <Typography variant="h6">{Math.round(weeklyProgress)}%</Typography>
            <Typography variant="caption" color="textSecondary">
              목표 달성률
            </Typography>
          </Card>

          <Card sx={{ textAlign: "center", p: 2 }}>
            <Avatar sx={{ bgcolor: "error.main", mx: "auto", mb: 1 }}>
              <span>🔥</span>
            </Avatar>
            <Typography variant="h6">{weeklyStats.streak}일</Typography>
            <Typography variant="caption" color="textSecondary">
              연속 기록
            </Typography>
          </Card>
        </Box>

        {/* 주간 패턴 분석 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📅 주간 패턴 분석
            </Typography>
            <Stack spacing={2}>
              {["월", "화", "수", "목", "금", "토", "일"].map((day) => {
                const dayWashes = Math.floor(Math.random() * 8) + 2; // 가상 데이터
                const dayProgress = (dayWashes / 6) * 100;
                return (
                  <Box key={day}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {day}요일
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">{dayWashes}회</Typography>
                        <Chip
                          size="small"
                          label={dayProgress >= 100 ? "완료" : "진행중"}
                          color={dayProgress >= 100 ? "success" : "default"}
                        />
                      </Stack>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(dayProgress, 100)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {/* 건강 인사이트 */}
        <Card sx={{ backgroundColor: "#e8f5e8" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="success.main">
              💚 건강 인사이트
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: "24px" }}>✅</span>
                <Typography variant="body2">
                  <strong>훌륭합니다!</strong> 평균 손씻기 시간이 WHO 권장 시간인 20초에 근접합니다.
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: "24px" }}>📈</span>
                <Typography variant="body2">
                  <strong>꾸준한 습관:</strong> 7일 연속 기록을 유지하고 있습니다. 계속 이어가세요!
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: "24px" }}>🎯</span>
                <Typography variant="body2">
                  <strong>목표 달성률:</strong> 이번 주 {Math.round(weeklyProgress)}% 달성으로 좋은
                  페이스를 유지하고 있습니다.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* 추천 사항 */}
        <Card sx={{ backgroundColor: "#fff3e0" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="warning.main">
              💡 개선 추천사항
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">• 점심시간 전후 손씻기를 추가해보세요</Typography>
              <Typography variant="body2">• 외출 후 귀가 시 손씻기를 잊지 마세요</Typography>
              <Typography variant="body2">• AR 모드를 활용해 손씻기 정확도를 높여보세요</Typography>
              <Typography variant="body2">• 주말에도 평일과 동일한 패턴을 유지해보세요</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
