export interface Location {
  id: number;
  name: string;
  site?: string | null;
  department?: string | null;
  isActive: boolean;
}

export interface IncidentType {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  isActive: boolean;
  subcategories?: IncidentSubcategory[];
}

export interface IncidentSubcategory {
  id: number;
  incidentTypeId: number;
  name: string;
  description?: string | null;
}

export interface IncidentConsequence {
  id: number;
  name: string;
  description?: string | null;
  severityWeight?: number | null;
}
