// AR 손씻기 습관 유도 - 설정 컴포넌트
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
} from "@mui/material";
import { useState } from "react";
import { use설정 } from "../store/store";

export const 설정Component = () => {
  const { 설정Data, add설정 } = use설정();
  const [dailyGoal, setDailyGoal] = useState(6);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(120); // 분 단위
  const [arModeEnabled, setArModeEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [language, setLanguage] = useState("ko");

  const handleSaveSettings = () => {
    const settings = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("ko-KR"),
      dailyGoal,
      reminderEnabled,
      reminderInterval,
      arModeEnabled,
      soundEnabled,
      vibrationEnabled,
      language,
    };
    add설정(settings);

    // 저장 완료 알림
    alert("✅ 설정이 저장되었습니다!");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* 헤더 */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ⚙️ 설정
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            손씻기 습관을 위한 개인 맞춤 설정
          </Typography>
        </Box>

        {/* 목표 설정 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎯 목표 설정
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  일일 손씻기 목표: {dailyGoal}회
                </Typography>
                <Slider
                  value={dailyGoal}
                  onChange={(_, newValue) => setDailyGoal(newValue as number)}
                  min={3}
                  max={15}
                  marks={[
                    { value: 3, label: "3회" },
                    { value: 6, label: "6회" },
                    { value: 9, label: "9회" },
                    { value: 12, label: "12회" },
                    { value: 15, label: "15회" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Alert severity="info">WHO에서는 하루 6-8회의 손씻기를 권장합니다.</Alert>
            </Stack>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔔 알림 설정
            </Typography>
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                  />
                }
                label="알림 활성화"
              />

              {reminderEnabled && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    알림 간격: {reminderInterval}분
                  </Typography>
                  <Slider
                    value={reminderInterval}
                    onChange={(_, newValue) => setReminderInterval(newValue as number)}
                    min={30}
                    max={240}
                    step={30}
                    marks={[
                      { value: 30, label: "30분" },
                      { value: 60, label: "1시간" },
                      { value: 120, label: "2시간" },
                      { value: 180, label: "3시간" },
                      { value: 240, label: "4시간" },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                  />
                }
                label="알림음 활성화"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={vibrationEnabled}
                    onChange={(e) => setVibrationEnabled(e.target.checked)}
                  />
                }
                label="진동 알림"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* AR 및 기술 설정 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📱 AR 및 기술 설정
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={arModeEnabled}
                    onChange={(e) => setArModeEnabled(e.target.checked)}
                  />
                }
                label="AR 모드 활성화"
              />

              {arModeEnabled && (
                <Alert severity="success">AR 모드로 정확한 손씻기 가이드를 받을 수 있습니다.</Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 언어 및 지역 설정 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🌐 언어 및 지역 설정
            </Typography>
            <FormControl fullWidth>
              <InputLabel>언어</InputLabel>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)} label="언어">
                <MenuItem value="ko">🇰🇷 한국어</MenuItem>
                <MenuItem value="en">🇺🇸 English</MenuItem>
                <MenuItem value="ja">🇯🇵 日本語</MenuItem>
                <MenuItem value="zh">🇨🇳 中文</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* 현재 설정 요약 */}
        <Card sx={{ backgroundColor: "#f5f5f5" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 현재 설정 요약
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label={`일일 목표: ${dailyGoal}회`} color="primary" />
                <Chip
                  label={reminderEnabled ? "알림 ON" : "알림 OFF"}
                  color={reminderEnabled ? "success" : "default"}
                />
                <Chip
                  label={arModeEnabled ? "AR ON" : "AR OFF"}
                  color={arModeEnabled ? "secondary" : "default"}
                />
              </Stack>

              {reminderEnabled && (
                <Typography variant="body2" color="textSecondary">
                  • {reminderInterval}분마다 알림
                  {soundEnabled && " • 소리 알림"}
                  {vibrationEnabled && " • 진동 알림"}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <Card sx={{ backgroundColor: "#e3f2fd" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h6" gutterBottom color="primary">
              설정 저장
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              변경된 설정을 저장하시겠습니까?
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Chip
                label="💾 설정 저장"
                color="primary"
                clickable
                onClick={handleSaveSettings}
                sx={{ fontSize: "1rem", p: 2 }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* 설정 히스토리 */}
        {설정Data.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📚 설정 변경 이력
              </Typography>
              <Stack spacing={1}>
                {설정Data
                  .slice(-3)
                  .reverse()
                  .map((setting: any) => (
                    <Box
                      key={setting.id}
                      sx={{ p: 2, backgroundColor: "#fafafa", borderRadius: 1 }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {setting.timestamp}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        일일 목표: {setting.dailyGoal}회 | 알림:{" "}
                        {setting.reminderEnabled ? `${setting.reminderInterval}분` : "OFF"} | AR:{" "}
                        {setting.arModeEnabled ? "ON" : "OFF"}
                      </Typography>
                    </Box>
                  ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
};
