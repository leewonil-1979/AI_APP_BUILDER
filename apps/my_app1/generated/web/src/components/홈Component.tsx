// 홈 Material-UI 컴포넌트
import {
  Box, Paper, Typography, Button, TextField, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import { useState } from 'react';

export const 홈Component = () => {
  const [data, setData] = useState('');
  const [open, setOpen] = useState(false);
  
  const handleAdd = () => {
    if (data.trim()) {
      console.log('Adding:', data);
      setData('');
      setOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          📱 홈
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setOpen(true)}
        >
          새 홈 추가
        </Button>
        
        <Card>
          <CardContent>
            <Typography>
              여기에 홈 목록이 표시됩니다.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
      
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>홈 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="홈 내용"
            fullWidth
            variant="outlined"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={handleAdd} variant="contained">추가</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};