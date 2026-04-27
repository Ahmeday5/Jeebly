export type WeekDayId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface WorkingHourPayload {
  restaurantId: number;
  day: WeekDayId;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface WorkingHour extends WorkingHourPayload {
  id: number;
}

export interface WeekDayMeta {
  id: WeekDayId;
  nameAr: string;
  nameEn: string;
}

export const WEEK_DAYS: readonly WeekDayMeta[] = [
  { id: 1, nameAr: 'الاثنين', nameEn: 'Monday' },
  { id: 2, nameAr: 'الثلاثاء', nameEn: 'Tuesday' },
  { id: 3, nameAr: 'الأربعاء', nameEn: 'Wednesday' },
  { id: 4, nameAr: 'الخميس', nameEn: 'Thursday' },
  { id: 5, nameAr: 'الجمعة', nameEn: 'Friday' },
  { id: 6, nameAr: 'السبت', nameEn: 'Saturday' },
  { id: 7, nameAr: 'الأحد', nameEn: 'Sunday' },
] as const;
