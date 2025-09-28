// 간단한 상태관리 - AR 손씻기 습관 유도 앱
import { useState } from "react";

// 타입 정의
export interface AppState {
  homeData: any[];
  recordData: any[];
  statsData: any[];
  settingsData: any[];
}

// 초기 상태
export const initialState: AppState = {
  homeData: [],
  recordData: [],
  statsData: [],
  settingsData: [],
};

// 더미 데이터와 함수들 (실제 앱에서는 Context API나 외부 라이브러리 사용)
export const useAppStore = () => {
  return {
    homeData: [],
    recordData: [],
    statsData: [],
    settingsData: [],
    addHome: (item: any) => console.log("Add home:", item),
    addRecord: (item: any) => console.log("Add record:", item),
    addStats: (item: any) => console.log("Add stats:", item),
    addSettings: (item: any) => console.log("Add settings:", item),
    reset: () => console.log("Reset store"),
  };
};

// 개별 훅들
export const useHome = () => {
  const [homeData, setHomeData] = useState<any[]>([]);
  const addHome = (item: any) => setHomeData((prev) => [...prev, item]);
  return { homeData, addHome };
};

// 한글 별칭
export const use홈 = () => {
  const [홈Data, set홈Data] = useState<any[]>([]);
  const add홈 = (item: any) => set홈Data((prev) => [...prev, item]);
  return { 홈Data, add홈 };
};

export const useRecord = () => {
  const [recordData, setRecordData] = useState<any[]>([]);
  const addRecord = (item: any) => setRecordData((prev) => [...prev, item]);
  return { recordData, addRecord };
};

export const use기록추가 = () => {
  const [기록추가Data, set기록추가Data] = useState<any[]>([]);
  const add기록추가 = (item: any) => set기록추가Data((prev) => [...prev, item]);
  return { 기록추가Data, add기록추가 };
};

export const useStats = () => {
  const [statsData, setStatsData] = useState<any[]>([]);
  const addStats = (item: any) => setStatsData((prev) => [...prev, item]);
  return { statsData, addStats };
};

export const use통계보기 = () => {
  const [통계보기Data, set통계보기Data] = useState<any[]>([]);
  const add통계보기 = (item: any) => set통계보기Data((prev) => [...prev, item]);
  return { 통계보기Data, add통계보기 };
};

export const useSettings = () => {
  const [settingsData, setSettingsData] = useState<any[]>([]);
  const addSettings = (item: any) => setSettingsData((prev) => [...prev, item]);
  return { settingsData, addSettings };
};

export const use설정 = () => {
  const [설정Data, set설정Data] = useState<any[]>([]);
  const add설정 = (item: any) => set설정Data((prev) => [...prev, item]);
  return { 설정Data, add설정 };
};
