export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IncidentFilters {
  status?: string;
  incidentTypeId?: number;
  locationId?: number;
  severity?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  isHighPotential?: boolean;
}
