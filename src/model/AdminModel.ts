// src/model/AdminModel.ts
export interface ViewsPerPeriode {
  [key: string]: number;
}

export interface MostViewsByJenis {
  jenis: string;
  totalViews: number;
}

export interface DashboardAdminData {
  viewsPerPeriode: ViewsPerPeriode;
  totalViewsThisMonth: number;
  totalAllViews: number;
  countArtikel: number;
  countProgram: number;
  mostViewsByJenis: MostViewsByJenis[];
}

export interface DashboardAdminResponse {
  success: boolean;
  data: DashboardAdminData;
}
