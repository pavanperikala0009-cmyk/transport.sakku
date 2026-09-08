export type UserRole = 'admin' | 'manager' | 'supervisor' | 'driver' | 'operator';

export interface User {
  id: string;
  loginId?: string; // Dedicated Login ID (e.g., VJPL-ADM01, VJPL-DRV01, EMP-101)
  name: string;
  email?: string;
  mobile?: string;
  role: UserRole;
  organization?: string;
  password?: string;
  avatarColor?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface FuelStation {
  id: string;
  name: string;
  locationVillage?: string;
  vendorId?: string;
  vendorName?: string;
  status: 'active' | 'inactive';
}

export interface FuelLocation {
  id: string;
  villageName: string;
  district?: string;
  status: 'active' | 'inactive';
}

export interface FuelVendor {
  id: string;
  name: string;
  vendorCode?: string;
  contactNumber?: string;
  status: 'active' | 'inactive';
}

export interface Organization {
  id: string;
  name: string;
  code?: string;
}

export interface FleetVehicle {
  id: string;
  vehicleNumber: string;
  type: string; // e.g. '10-Wheeler Truck', 'Container Hauler', 'Tanker', 'Mini Truck', 'Pickup', 'Trailer'
  defaultDriver?: string;
  fuelType?: 'Diesel' | 'Petrol' | 'CNG' | 'EV';
  status: 'active' | 'maintenance' | 'inactive';
  notes?: string;
}

export interface TransportRecord {
  id: number;
  userId: string; // Owner user ID
  userName: string; // User / Driver who entered or operated
  organization: string; // Organization affiliation
  date: string; // YYYY-MM-DD
  vehicle: string;
  driver: string;
  startTime: string;
  endTime: string;
  startLocation: string;
  endLocation: string;
  opening: number; // Starting ODO KM
  closing: number; // Ending ODO KM
  totalKm: number;
  fuel: number; // Fuel Litres
  fuelAmount: number;
  fuelStation: string; // Fuel Station Name
  fuelLocation: string; // Fuel Fill Location (Village)
  fuelVendor: string; // Fuel Vendor
  mileage: number; // KM/L
  remarks: string;
  isOdoCorrectedByAdmin?: boolean; // True if corrected/overridden by Admin
  approvalStatus?: 'approved' | 'pending' | 'rejected';
}

export type NotificationType =
  | 'trip_approval'
  | 'record_modified'
  | 'record_deleted'
  | 'user_approval'
  | 'system_alert';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  details?: {
    recordId?: number;
    vehicle?: string;
    driver?: string;
    totalKm?: number;
    fuel?: number;
    oldOpening?: number;
    newOpening?: number;
    oldClosing?: number;
    newClosing?: number;
    userId?: string;
    userName?: string;
    userRole?: string;
    userLoginId?: string;
    date?: string;
    reason?: string;
  };
  read: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'dismissed';
  createdAt: string;
  createdBy?: string;
}

export interface DashboardMetrics {
  totalEntries: number;
  totalKm: number;
  totalFuel: number;
  avgMileage: number;
  totalFuelAmount: number;
  avgCostPerKm: number;
}

export interface FilterOptions {
  vehicles: string[]; // multi-select vehicles or empty for all
  userId?: string; // Admin filter: specific user
  driver: string;
  organization?: string; // Admin filter: organization
  fuelStation?: string; // Admin filter: fuel station
  fuelVendor?: string; // Admin filter: fuel vendor
  fuelLocation?: string; // Filter: fuel fill location (village)
  date: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  minKm?: number;
  maxKm?: number;
  minMileage?: number;
  period: 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'this_month';
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

