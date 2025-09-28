// 설정 Material-UI 컴포넌트
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
} from "@mui/material";
import { useState } from "react";
import { use기록추가 } from "../store/store";

export const 기록추가Component = () => {
  const { 기록추가Data, add기록추가 } = use기록추가();
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    add기록추가({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("ko-KR"),
      type: "wash_record",
    });
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          � 손씻기 기록
        </Typography>

        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          새 손씻기 기록 추가
        </Button>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              최근 기록: {기록추가Data.length}개
            </Typography>
            {기록추가Data
              .slice(-3)
              .reverse()
              .map((record: any) => (
                <Typography key={record.id} variant="body2">
                  {record.timestamp} - {record.type}
                </Typography>
              ))}
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>손씻기 기록 추가</DialogTitle>
        <DialogContent>
          <Typography variant="body2">새로운 손씻기 기록을 추가하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={handleAdd} variant="contained">
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
