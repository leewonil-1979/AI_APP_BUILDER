// Zustand 상태관리 스토어
import { create } from 'zustand';

interface AR 손씻기 습관 유도Store {
  // 데이터 상태
  홈Data: any[],
  기록추가Data: any[],
  통계보기Data: any[],
  설정Data: any[],
  
  // 액션 함수들
  add홈: (item: any) => set(state => ({ 홈Data: [...state.홈Data, item] })),
  add기록추가: (item: any) => set(state => ({ 기록추가Data: [...state.기록추가Data, item] })),
  add통계보기: (item: any) => set(state => ({ 통계보기Data: [...state.통계보기Data, item] })),
  add설정: (item: any) => set(state => ({ 설정Data: [...state.설정Data, item] })),
  reset: () => set({ 홈Data: [], 기록추가Data: [], 통계보기Data: [], 설정Data: [] })
}

export const useAR 손씻기 습관 유도Store = create<AR 손씻기 습관 유도Store>((set) => ({
  // 초기 상태
  홈Data: [],
  기록추가Data: [],
  통계보기Data: [],
  설정Data: [],
  
  // 액션들
  add홈: (item: any) => set(state => ({ 홈Data: [...state.홈Data, item] })),
  add기록추가: (item: any) => set(state => ({ 기록추가Data: [...state.기록추가Data, item] })),
  add통계보기: (item: any) => set(state => ({ 통계보기Data: [...state.통계보기Data, item] })),
  add설정: (item: any) => set(state => ({ 설정Data: [...state.설정Data, item] })),
  reset: () => set({ 홈Data: [], 기록추가Data: [], 통계보기Data: [], 설정Data: [] })
}));

// 커스텀 훅들

export const use홈 = () => {
  const 홈Data = useAR 손씻기 습관 유도Store(state => state.홈Data);
  const add홈 = useAR 손씻기 습관 유도Store(state => state.add홈);
  return { 홈Data, add홈 };
};
export const use기록추가 = () => {
  const 기록추가Data = useAR 손씻기 습관 유도Store(state => state.기록추가Data);
  const add기록추가 = useAR 손씻기 습관 유도Store(state => state.add기록추가);
  return { 기록추가Data, add기록추가 };
};
export const use통계보기 = () => {
  const 통계보기Data = useAR 손씻기 습관 유도Store(state => state.통계보기Data);
  const add통계보기 = useAR 손씻기 습관 유도Store(state => state.add통계보기);
  return { 통계보기Data, add통계보기 };
};
export const use설정 = () => {
  const 설정Data = useAR 손씻기 습관 유도Store(state => state.설정Data);
  const add설정 = useAR 손씻기 습관 유도Store(state => state.add설정);
  return { 설정Data, add설정 };
};