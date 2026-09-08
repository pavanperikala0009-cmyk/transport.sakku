import {
  TransportRecord,
  FleetVehicle,
  User,
  UserRole,
  FuelStation,
  FuelLocation,
  FuelVendor,
  Organization,
  AppNotification,
  NotificationType,
} from '../types';

export const STORAGE_KEY = 'transportRecords';
export const VEHICLES_STORAGE_KEY = 'transportFleetVehicles';
export const USERS_STORAGE_KEY = 'transportUsers';
export const CURRENT_USER_KEY = 'transportCurrentUser';
export const FUEL_STATIONS_KEY = 'transportFuelStations';
export const FUEL_LOCATIONS_KEY = 'transportFuelLocations';
export const FUEL_VENDORS_KEY = 'transportFuelVendors';
export const ORGANIZATIONS_KEY = 'transportOrganizations';
export const NOTIFICATIONS_STORAGE_KEY = 'transportAppNotifications';

// Master Data: Fuel Vendors
export const INITIAL_FUEL_VENDORS: FuelVendor[] = [
  {
    id: 'fvend-1',
    name: 'Hindustan Petroleum Corporation Ltd (HPCL)',
    vendorCode: 'HPCL-IND',
    contactNumber: '+91 1800-22-1200',
    status: 'active',
  },
  {
    id: 'fvend-2',
    name: 'Indian Oil Corporation Ltd (IOCL)',
    vendorCode: 'IOCL-CORP',
    contactNumber: '+91 1800-23-3355',
    status: 'active',
  },
  {
    id: 'fvend-3',
    name: 'Bharat Petroleum Corporation Ltd (BPCL)',
    vendorCode: 'BPCL-SMART',
    contactNumber: '+91 1800-22-4344',
    status: 'active',
  },
  {
    id: 'fvend-4',
    name: 'Reliance Industries Petroleum',
    vendorCode: 'RIL-PETRO',
    contactNumber: '+91 1800-88-9999',
    status: 'active',
  },
  {
    id: 'fvend-5',
    name: 'Nayara Energy Fleet Retail',
    vendorCode: 'NAYARA-FLEET',
    contactNumber: '+91 1800-12-0000',
    status: 'active',
  },
];

// Master Data: Fuel Fill Locations (Villages)
export const INITIAL_FUEL_LOCATIONS: FuelLocation[] = [
  {
    id: 'floc-1',
    villageName: 'Kanchikacherla Village',
    district: 'NTR District (AP)',
    status: 'active',
  },
  {
    id: 'floc-2',
    villageName: 'Anakapalle Village',
    district: 'Visakhapatnam (AP)',
    status: 'active',
  },
  {
    id: 'floc-3',
    villageName: 'Ibrahimpatnam Village',
    district: 'Krishna District (AP)',
    status: 'active',
  },
  {
    id: 'floc-4',
    villageName: 'Gannavaram Village',
    district: 'Krishna District (AP)',
    status: 'active',
  },
  {
    id: 'floc-5',
    villageName: 'Jadcherla Village',
    district: 'Mahabubnagar (TS)',
    status: 'active',
  },
  {
    id: 'floc-6',
    villageName: 'Chilakaluripet Village',
    district: 'Palnadu District (AP)',
    status: 'active',
  },
  {
    id: 'floc-7',
    villageName: 'Shamshabad Village',
    district: 'Ranga Reddy (TS)',
    status: 'active',
  },
];

// Master Data: Fuel Stations
export const INITIAL_FUEL_STATIONS: FuelStation[] = [
  {
    id: 'fstat-1',
    name: 'HPCL Highway Autocare (NH16)',
    locationVillage: 'Kanchikacherla Village',
    vendorId: 'fvend-1',
    vendorName: 'Hindustan Petroleum Corporation Ltd (HPCL)',
    status: 'active',
  },
  {
    id: 'fstat-2',
    name: 'IndianOil Express Fuel Hub',
    locationVillage: 'Anakapalle Village',
    vendorId: 'fvend-2',
    vendorName: 'Indian Oil Corporation Ltd (IOCL)',
    status: 'active',
  },
  {
    id: 'fstat-3',
    name: 'BPCL Oasis Fuel Depot',
    locationVillage: 'Ibrahimpatnam Village',
    vendorId: 'fvend-3',
    vendorName: 'Bharat Petroleum Corporation Ltd (BPCL)',
    status: 'active',
  },
  {
    id: 'fstat-4',
    name: 'HPCL Bypass Station',
    locationVillage: 'Gannavaram Village',
    vendorId: 'fvend-1',
    vendorName: 'Hindustan Petroleum Corporation Ltd (HPCL)',
    status: 'active',
  },
  {
    id: 'fstat-5',
    name: 'Reliance Petroleum NH44 Highway Plaza',
    locationVillage: 'Jadcherla Village',
    vendorId: 'fvend-4',
    vendorName: 'Reliance Industries Petroleum',
    status: 'active',
  },
  {
    id: 'fstat-6',
    name: 'Nayara Energy Highway Fuel Port',
    locationVillage: 'Chilakaluripet Village',
    vendorId: 'fvend-5',
    vendorName: 'Nayara Energy Fleet Retail',
    status: 'active',
  },
];

// Master Data: Organizations
export const INITIAL_ORGANIZATIONS: Organization[] = [
  { id: 'org-1', name: 'VJPL Logistics Division', code: 'LOG-01' },
  { id: 'org-2', name: 'VJPL Heavy Transport', code: 'HT-02' },
  { id: 'org-3', name: 'VJPL Port Cargo Ops', code: 'PORT-03' },
  { id: 'org-4', name: 'VJPL Regional Express', code: 'REG-04' },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    loginId: 'VJPL-ADM01',
    name: 'Pavan Perikala',
    email: 'pavan@vjpl.com',
    mobile: '9876543210',
    role: 'admin',
    organization: 'VJPL Logistics Division',
    password: 'admin123',
    avatarColor: 'bg-blue-600',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'usr-2',
    loginId: 'VJPL-DRV01',
    name: 'Ramesh Kumar',
    email: 'ramesh@vjpl.com',
    mobile: '9876543211',
    role: 'driver',
    organization: 'VJPL Logistics Division',
    password: 'driver123',
    avatarColor: 'bg-emerald-600',
    createdAt: '2026-01-15T09:30:00.000Z',
  },
  {
    id: 'usr-3',
    loginId: 'VJPL-DRV02',
    name: 'Suresh Reddy',
    email: 'suresh@vjpl.com',
    mobile: '9876543212',
    role: 'driver',
    organization: 'VJPL Heavy Transport',
    password: 'super123',
    avatarColor: 'bg-amber-600',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'usr-4',
    loginId: 'VJPL-DRV03',
    name: 'Mohammed Arif',
    email: 'arif@vjpl.com',
    mobile: '9876543213',
    role: 'driver',
    organization: 'VJPL Regional Express',
    password: 'driver123',
    avatarColor: 'bg-purple-600',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
];

export const INITIAL_FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: 'veh-1',
    vehicleNumber: 'AP 39 TB 4589',
    type: '10-Wheeler Cargo Truck',
    defaultDriver: 'Ramesh Kumar',
    fuelType: 'Diesel',
    status: 'active',
    notes: 'Long haul route vehicle - Hyderabad / Vijayawada sector',
  },
  {
    id: 'veh-2',
    vehicleNumber: 'AP 09 CW 1142',
    type: 'Container Hauler',
    defaultDriver: 'Suresh Reddy',
    fuelType: 'Diesel',
    status: 'active',
    notes: 'Port cargo transportation - Visakhapatnam Port',
  },
  {
    id: 'veh-3',
    vehicleNumber: 'TS 08 UB 7890',
    type: 'Heavy Logistics Truck',
    defaultDriver: 'Mohammed Arif',
    fuelType: 'Diesel',
    status: 'active',
    notes: 'Regional distribution - Hyderabad / Warangal',
  },
  {
    id: 'veh-4',
    vehicleNumber: 'KA 04 EA 7720',
    type: 'Multi-Axle Trailer',
    defaultDriver: 'Venkatesh Rao',
    fuelType: 'Diesel',
    status: 'active',
    notes: 'Interstate machinery parts transport',
  },
  {
    id: 'veh-5',
    vehicleNumber: 'TN 02 BY 9912',
    type: 'Mini Cargo Van',
    defaultDriver: 'Karthik Raja',
    fuelType: 'Diesel',
    status: 'active',
    notes: 'City delivery & feeder cargo',
  },
];

export function getStoredVehicles(): FleetVehicle[] {
  try {
    const raw = localStorage.getItem(VEHICLES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(INITIAL_FLEET_VEHICLES));
      return INITIAL_FLEET_VEHICLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse vehicles from localStorage:', err);
  }
  return INITIAL_FLEET_VEHICLES;
}

export function saveStoredVehicles(vehicles: FleetVehicle[]): void {
  try {
    localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
  } catch (err) {
    console.error('Failed to save vehicles to localStorage:', err);
  }
}

export function getStoredFuelVendors(): FuelVendor[] {
  try {
    const raw = localStorage.getItem(FUEL_VENDORS_KEY);
    if (!raw) {
      localStorage.setItem(FUEL_VENDORS_KEY, JSON.stringify(INITIAL_FUEL_VENDORS));
      return INITIAL_FUEL_VENDORS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (err) {
    console.error('Failed to parse fuel vendors:', err);
  }
  return INITIAL_FUEL_VENDORS;
}

export function saveStoredFuelVendors(vendors: FuelVendor[]): void {
  try {
    localStorage.setItem(FUEL_VENDORS_KEY, JSON.stringify(vendors));
  } catch (err) {
    console.error('Failed to save fuel vendors:', err);
  }
}

export function getStoredFuelLocations(): FuelLocation[] {
  try {
    const raw = localStorage.getItem(FUEL_LOCATIONS_KEY);
    if (!raw) {
      localStorage.setItem(FUEL_LOCATIONS_KEY, JSON.stringify(INITIAL_FUEL_LOCATIONS));
      return INITIAL_FUEL_LOCATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (err) {
    console.error('Failed to parse fuel locations:', err);
  }
  return INITIAL_FUEL_LOCATIONS;
}

export function saveStoredFuelLocations(locations: FuelLocation[]): void {
  try {
    localStorage.setItem(FUEL_LOCATIONS_KEY, JSON.stringify(locations));
  } catch (err) {
    console.error('Failed to save fuel locations:', err);
  }
}

export function getStoredFuelStations(): FuelStation[] {
  try {
    const raw = localStorage.getItem(FUEL_STATIONS_KEY);
    if (!raw) {
      localStorage.setItem(FUEL_STATIONS_KEY, JSON.stringify(INITIAL_FUEL_STATIONS));
      return INITIAL_FUEL_STATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (err) {
    console.error('Failed to parse fuel stations:', err);
  }
  return INITIAL_FUEL_STATIONS;
}

export function saveStoredFuelStations(stations: FuelStation[]): void {
  try {
    localStorage.setItem(FUEL_STATIONS_KEY, JSON.stringify(stations));
  } catch (err) {
    console.error('Failed to save fuel stations:', err);
  }
}

export function getStoredOrganizations(): Organization[] {
  try {
    const raw = localStorage.getItem(ORGANIZATIONS_KEY);
    if (!raw) {
      localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(INITIAL_ORGANIZATIONS));
      return INITIAL_ORGANIZATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (err) {
    console.error('Failed to parse organizations:', err);
  }
  return INITIAL_ORGANIZATIONS;
}

export function saveStoredOrganizations(orgs: Organization[]): void {
  try {
    localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(orgs));
  } catch (err) {
    console.error('Failed to save organizations:', err);
  }
}

export function getVehicleLatestOdo(
  records: TransportRecord[],
  vehicleNumber: string,
  excludeRecordId?: number
): number {
  const clean = vehicleNumber.trim().toUpperCase();
  if (!clean) return 0;
  const matching = records.filter(
    (r) =>
      r.vehicle.trim().toUpperCase() === clean &&
      (excludeRecordId === undefined || r.id !== excludeRecordId)
  );
  if (matching.length === 0) return 0;
  return Math.max(...matching.map((r) => r.closing));
}

export const INITIAL_SAMPLE_RECORDS: TransportRecord[] = [
  {
    id: 1725520000001,
    userId: 'usr-2',
    userName: 'Ramesh Kumar',
    organization: 'VJPL Logistics Division',
    date: '2026-09-07',
    vehicle: 'AP 39 TB 4589',
    driver: 'Ramesh Kumar',
    startTime: '06:30',
    endTime: '15:45',
    startLocation: 'Hyderabad Terminal',
    endLocation: 'Vijayawada Hub',
    opening: 45200,
    closing: 45480,
    totalKm: 280,
    fuel: 65,
    fuelAmount: 6370,
    fuelStation: 'HPCL Highway Autocare (NH16)',
    fuelLocation: 'Kanchikacherla Village',
    fuelVendor: 'Hindustan Petroleum Corporation Ltd (HPCL)',
    mileage: 4.31,
    remarks: 'Delivered industrial cargo on schedule. Highway toll paid.',
  },
  {
    id: 1725520000002,
    userId: 'usr-3',
    userName: 'Suresh Reddy',
    organization: 'VJPL Heavy Transport',
    date: '2026-09-06',
    vehicle: 'AP 09 CW 1142',
    driver: 'Suresh Reddy',
    startTime: '07:00',
    endTime: '18:15',
    startLocation: 'Visakhapatnam Port',
    endLocation: 'Rajahmundry Yard',
    opening: 38920,
    closing: 39140,
    totalKm: 220,
    fuel: 48.5,
    fuelAmount: 4753,
    fuelStation: 'IndianOil Express Fuel Hub',
    fuelLocation: 'Anakapalle Village',
    fuelVendor: 'Indian Oil Corporation Ltd (IOCL)',
    mileage: 4.54,
    remarks: 'Container haul. Smooth journey, tire pressure checked.',
  },
  {
    id: 1725520000003,
    userId: 'usr-4',
    userName: 'Mohammed Arif',
    organization: 'VJPL Regional Express',
    date: '2026-09-05',
    vehicle: 'TS 08 UB 7890',
    driver: 'Mohammed Arif',
    startTime: '08:00',
    endTime: '19:30',
    startLocation: 'Hyderabad Logistics Park',
    endLocation: 'Warangal Depot',
    opening: 62150,
    closing: 62310,
    totalKm: 160,
    fuel: 36,
    fuelAmount: 3528,
    fuelStation: 'BPCL Oasis Fuel Depot',
    fuelLocation: 'Ibrahimpatnam Village',
    fuelVendor: 'Bharat Petroleum Corporation Ltd (BPCL)',
    mileage: 4.44,
    remarks: 'Local distributor goods delivered without delay.',
  },
  {
    id: 1725520000004,
    userId: 'usr-2',
    userName: 'Ramesh Kumar',
    organization: 'VJPL Logistics Division',
    date: '2026-09-04',
    vehicle: 'AP 39 TB 4589',
    driver: 'Ramesh Kumar',
    startTime: '05:45',
    endTime: '14:20',
    startLocation: 'Vijayawada Hub',
    endLocation: 'Guntur Logistics Center',
    opening: 45120,
    closing: 45200,
    totalKm: 80,
    fuel: 18,
    fuelAmount: 1764,
    fuelStation: 'HPCL Bypass Station',
    fuelLocation: 'Gannavaram Village',
    fuelVendor: 'Hindustan Petroleum Corporation Ltd (HPCL)',
    mileage: 4.44,
    remarks: 'Return shuttle cargo.',
  },
  {
    id: 1725520000005,
    userId: 'usr-1',
    userName: 'Pavan Perikala',
    organization: 'VJPL Logistics Division',
    date: '2026-09-03',
    vehicle: 'KA 04 EA 7720',
    driver: 'Venkatesh Rao',
    startTime: '06:00',
    endTime: '20:00',
    startLocation: 'Bengaluru ICD',
    endLocation: 'Anantapur Warehouse',
    opening: 88400,
    closing: 88635,
    totalKm: 235,
    fuel: 52,
    fuelAmount: 5096,
    fuelStation: 'Reliance Petroleum NH44 Highway Plaza',
    fuelLocation: 'Jadcherla Village',
    fuelVendor: 'Reliance Industries Petroleum',
    mileage: 4.52,
    remarks: 'Heavy machinery parts consignment.',
  },
];

export function getStoredRecords(): TransportRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic records if first visit
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_RECORDS));
      return INITIAL_SAMPLE_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse transport records from localStorage:', err);
  }
  return [];
}

export function saveStoredRecords(records: TransportRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save transport records to localStorage:', err);
  }
}

export function generateRecordsCSVString(records: TransportRecord[]): string {
  const header =
    'Date,Vehicle,Driver / User,Organization,Opening KM,Closing KM,Total KM,Fuel Litres,Mileage KM/L,Fuel Amount,Fuel Station,Fuel Location (Village),Fuel Vendor,Start Location,End Location,Remarks\n';

  const rows = records.map((r) => {
    return [
      r.date,
      r.vehicle,
      r.driver || r.userName,
      r.organization || '',
      r.opening,
      r.closing,
      r.totalKm,
      r.fuel,
      r.mileage,
      r.fuelAmount,
      r.fuelStation || '',
      r.fuelLocation || '',
      r.fuelVendor || '',
      r.startLocation,
      r.endLocation,
      r.remarks,
    ]
      .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
      .join(',');
  });

  return header + rows.join('\n');
}

export function exportRecordsToCSV(records: TransportRecord[]): void {
  if (records.length === 0) {
    alert('No records available to export.');
    return;
  }

  const csvContent = generateRecordsCSVString(records);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Transport_Mileage_Record_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSVToRecords(csvText: string): TransportRecord[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const results: TransportRecord[] = [];

  // Parse CSV respecting quotation marks
  const parseLine = (text: string): string[] => {
    const entries: string[] = [];
    let insideQuotes = false;
    let entry = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (insideQuotes && text[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        entries.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    entries.push(entry.trim());
    return entries;
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseLine(line);
    if (cols.length >= 6) {
      // Check if format has organization (16 cols) or original (12 cols)
      const hasExtendedCols = cols.length >= 14;
      const opening = Number(hasExtendedCols ? cols[4] : cols[3]) || 0;
      const closing = Number(hasExtendedCols ? cols[5] : cols[4]) || 0;
      const totalKm = Number(hasExtendedCols ? cols[6] : cols[5]) || (closing - opening);
      const fuel = Number(hasExtendedCols ? cols[7] : cols[6]) || 0;
      const mileage = Number(hasExtendedCols ? cols[8] : cols[7]) || (fuel > 0 ? Number((totalKm / fuel).toFixed(2)) : 0);
      const fuelAmount = Number(hasExtendedCols ? cols[9] : cols[8]) || 0;

      results.push({
        id: Date.now() + i,
        userId: 'usr-1',
        userName: cols[2] || 'Imported User',
        organization: hasExtendedCols ? cols[3] || 'VJPL Logistics Division' : 'VJPL Logistics Division',
        date: cols[0] || new Date().toISOString().split('T')[0],
        vehicle: (cols[1] || 'UNKNOWN').toUpperCase(),
        driver: cols[2] || '',
        opening,
        closing,
        totalKm,
        fuel,
        mileage,
        fuelAmount,
        startTime: '',
        endTime: '',
        fuelStation: hasExtendedCols ? cols[10] || '' : '',
        fuelLocation: hasExtendedCols ? cols[11] || '' : '',
        fuelVendor: hasExtendedCols ? cols[12] || '' : '',
        startLocation: hasExtendedCols ? cols[13] || '' : cols[9] || '',
        endLocation: hasExtendedCols ? cols[14] || '' : cols[10] || '',
        remarks: hasExtendedCols ? cols[15] || '' : cols[11] || '',
      });
    }
  }

  return results;
}

// User Authentication & Management Storage Helpers
const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-indigo-600',
];

export function generateUniqueLoginId(role: UserRole = 'operator', existingUsers: User[] = []): string {
  const rolePrefixes: Record<UserRole, string> = {
    admin: 'ADM',
    manager: 'MGR',
    supervisor: 'SUP',
    driver: 'DRV',
    operator: 'OPR',
  };
  const prefix = `VJPL-${rolePrefixes[role] || 'EMP'}`;
  
  // Find highest number in existing IDs
  let maxNum = 0;
  const regex = new RegExp(`^${prefix}(\\d+)$`, 'i');
  
  existingUsers.forEach((u) => {
    if (u.loginId) {
      const match = u.loginId.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  });

  const nextNum = maxNum + 1;
  const padded = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
  return `${prefix}${padded}`;
}

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all stored users have a valid Login ID
      let hasChanges = false;
      const verified = parsed.map((u: User, idx: number) => {
        if (!u.loginId) {
          hasChanges = true;
          const roleCode = u.role === 'admin' ? 'ADM' : u.role === 'driver' ? 'DRV' : 'EMP';
          const num = idx + 1;
          const pad = num < 10 ? `0${num}` : `${num}`;
          return { ...u, loginId: `VJPL-${roleCode}${pad}` };
        }
        return u;
      });
      if (hasChanges) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(verified));
      }
      return verified;
    }
  } catch (err) {
    console.error('Failed to parse users from localStorage:', err);
  }
  return INITIAL_USERS;
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage:', err);
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      // Default to initial logged-in user (admin) for immediate seamless experience
      const users = getStoredUsers();
      const defaultUser = users[0] || null;
      if (defaultUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
      }
      return defaultUser;
    }
    const parsed = JSON.parse(raw);
    if (parsed && !parsed.loginId) {
      // Hydrate if missing
      const users = getStoredUsers();
      const match = users.find((u) => u.id === parsed.id);
      if (match && match.loginId) {
        parsed.loginId = match.loginId;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse current user from localStorage:', err);
    return null;
  }
}

export function saveCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to save current user to localStorage:', err);
  }
}

export function authenticateUser(
  loginIdOrIdentifier: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  const cleanId = loginIdOrIdentifier.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanId) {
    return { success: false, error: 'Please enter your Login ID, Email ID, or Mobile Number.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter your password.' };
  }

  const users = getStoredUsers();
  const user = users.find((u) => {
    const loginIdMatch = u.loginId?.trim().toLowerCase() === cleanId;
    const emailMatch = u.email?.trim().toLowerCase() === cleanId;
    const cleanDigits = cleanId.replace(/\D/g, '');
    const mobileMatch = cleanDigits.length >= 7 && u.mobile?.replace(/\D/g, '') === cleanDigits;
    const nameMatch = u.name.trim().toLowerCase() === cleanId;
    return loginIdMatch || emailMatch || mobileMatch || nameMatch;
  });

  if (!user) {
    return {
      success: false,
      error: `No account found with Login ID or credentials "${loginIdOrIdentifier.trim()}". Please verify and try again.`,
    };
  }

  if (user.password && user.password !== cleanPass) {
    return {
      success: false,
      error: 'Invalid password. Please check your credentials and try again.',
    };
  }

  // Update last login timestamp
  const updatedUser: User = {
    ...user,
    lastLoginAt: new Date().toISOString(),
  };

  const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
  saveStoredUsers(updatedUsers);
  saveCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
}

export function registerUser(data: {
  name: string;
  loginId?: string;
  email?: string;
  mobile?: string;
  password: string;
  role?: UserRole;
  organization?: string;
}): { success: boolean; user?: User; error?: string } {
  const cleanName = data.name.trim();
  const rawLoginId = data.loginId?.trim().toUpperCase();
  const cleanEmail = data.email?.trim().toLowerCase();
  const cleanMobile = data.mobile?.trim().replace(/\D/g, '');
  const cleanPassword = data.password.trim();
  const selectedRole = data.role || 'operator';

  if (!cleanName) {
    return { success: false, error: 'Full name is required.' };
  }

  if (cleanPassword.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }

  const users = getStoredUsers();

  // Determine final unique Login ID
  let assignedLoginId = rawLoginId;
  if (!assignedLoginId) {
    assignedLoginId = generateUniqueLoginId(selectedRole, users);
  } else {
    // Validate custom login ID uniqueness
    if (users.some((u) => u.loginId?.trim().toUpperCase() === assignedLoginId)) {
      return {
        success: false,
        error: `Login ID "${assignedLoginId}" is already assigned to another user. Please choose another or generate one.`,
      };
    }
  }

  // Check duplicate email if provided
  if (cleanEmail) {
    if (!cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid Email ID format.' };
    }
    if (users.some((u) => u.email?.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'An account with this Email ID is already registered.',
      };
    }
  }

  // Check duplicate mobile if provided
  if (cleanMobile) {
    if (cleanMobile.length < 10) {
      return { success: false, error: 'Mobile number must be at least 10 digits.' };
    }
    if (users.some((u) => u.mobile?.replace(/\D/g, '') === cleanMobile)) {
      return {
        success: false,
        error: 'An account with this Mobile Number is already registered.',
      };
    }
  }

  const randomColor =
    AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    loginId: assignedLoginId,
    name: cleanName,
    email: cleanEmail || undefined,
    mobile: cleanMobile || undefined,
    role: selectedRole,
    organization: data.organization || 'VJPL Logistics Division',
    password: cleanPassword,
    avatarColor: randomColor,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const updatedUsers = [newUser, ...users];
  saveStoredUsers(updatedUsers);
  saveCurrentUser(newUser);

  return { success: true, user: newUser };
}

export function updateUserLoginId(
  userId: string,
  newLoginId: string
): { success: boolean; user?: User; error?: string } {
  const cleanId = newLoginId.trim().toUpperCase();
  if (!cleanId) {
    return { success: false, error: 'Login ID cannot be empty.' };
  }
  const users = getStoredUsers();
  if (users.some((u) => u.id !== userId && u.loginId?.toUpperCase() === cleanId)) {
    return { success: false, error: `Login ID "${cleanId}" is already taken by another account.` };
  }
  const target = users.find((u) => u.id === userId);
  if (!target) {
    return { success: false, error: 'User account not found.' };
  }
  const updatedUser: User = { ...target, loginId: cleanId };
  const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
  saveStoredUsers(updatedUsers);
  const current = getCurrentUser();
  if (current?.id === userId) {
    saveCurrentUser(updatedUser);
  }
  return { success: true, user: updatedUser };
}

// -------------------------------------------------------------
// Admin Notification Bell & Approvals Storage System
// -------------------------------------------------------------
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'trip_approval',
    title: 'Trip Mileage Log Pending Approval',
    message: 'Driver Ramesh Kumar logged 180 KM on AP39TF1234 (Vijayawada Port → Guntur Yard). Fuel filled: 32L.',
    details: {
      recordId: 1,
      vehicle: 'AP39TF1234',
      driver: 'Ramesh Kumar',
      totalKm: 180,
      fuel: 32,
      date: '2026-03-01',
    },
    read: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    createdBy: 'Ramesh Kumar',
  },
  {
    id: 'notif-2',
    type: 'record_modified',
    title: 'Trip ODO Modification Alert',
    message: 'Closing ODO was modified on AP02TC5678 from 32,800 KM to 32,950 KM (+150 KM change).',
    details: {
      recordId: 2,
      vehicle: 'AP02TC5678',
      driver: 'Suresh Reddy',
      oldClosing: 32800,
      newClosing: 32950,
      reason: 'Bypass road diversion log correction',
    },
    read: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Suresh Reddy',
  },
  {
    id: 'notif-3',
    type: 'user_approval',
    title: 'New Operator Access Request',
    message: 'New user Mohammed Arif (Login ID: VJPL-DRV03) registered and requires role verification.',
    details: {
      userId: 'usr-4',
      userName: 'Mohammed Arif',
      userRole: 'driver',
      userLoginId: 'VJPL-DRV03',
    },
    read: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdBy: 'System Auth',
  },
  {
    id: 'notif-4',
    type: 'record_deleted',
    title: 'Trip Entry Deleted Notice',
    message: 'Trip record #4 on AP39TF1234 was deleted from Daily Log by operator.',
    details: {
      recordId: 4,
      vehicle: 'AP39TF1234',
      driver: 'Ramesh Kumar',
      date: '2026-02-28',
    },
    read: true,
    status: 'dismissed',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Pavan Perikala',
  },
];

export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse notifications from localStorage:', err);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications to localStorage:', err);
  }
}

export function addNotification(
  data: Omit<AppNotification, 'id' | 'createdAt'>
): AppNotification {
  const notifications = getStoredNotifications();
  const newNotif: AppNotification = {
    ...data,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newNotif, ...notifications];
  saveStoredNotifications(updated);
  return newNotif;
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveStoredNotifications(updated);
}

export function markAllNotificationsAsRead(): void {
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  saveStoredNotifications(updated);
}

export function updateNotificationStatus(
  notificationId: string,
  status: 'approved' | 'rejected' | 'dismissed'
): void {
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) =>
    n.id === notificationId ? { ...n, status, read: true } : n
  );
  saveStoredNotifications(updated);
}

export function clearDismissedNotifications(): void {
  const notifications = getStoredNotifications();
  const updated = notifications.filter((n) => n.status !== 'dismissed');
  saveStoredNotifications(updated);
}

