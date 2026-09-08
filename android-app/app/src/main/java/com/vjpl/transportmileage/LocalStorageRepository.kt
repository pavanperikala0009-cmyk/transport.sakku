package com.vjpl.transportmileage

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class LocalStorageRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("transport_app_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()

    companion object {
        private const val KEY_RECORDS = "transportRecords"
        private const val KEY_VEHICLES = "transportFleetVehicles"
        private const val KEY_USERS = "transportUsers"
        private const val KEY_CURRENT_USER = "transportCurrentUser"
        private const val KEY_STATIONS = "transportFuelStations"
        private const val KEY_LOCATIONS = "transportFuelLocations"
        private const val KEY_VENDORS = "transportFuelVendors"
        private const val KEY_ORGS = "transportOrganizations"
        private const val KEY_NOTIFS = "transportAppNotifications"

        val INITIAL_USERS = listOf(
            User(
                id = "usr-1",
                loginId = "VJPL-ADM01",
                name = "Pavan Perikala",
                email = "pavan@vjpl.com",
                mobile = "9876543210",
                role = UserRole.ADMIN,
                organization = "VJPL Logistics Division",
                password = "admin123",
                avatarColor = "bg-blue-600",
                createdAt = "2026-01-01T08:00:00.000Z"
            ),
            User(
                id = "usr-2",
                loginId = "VJPL-DRV01",
                name = "Ramesh Kumar",
                email = "ramesh@vjpl.com",
                mobile = "9876543211",
                role = UserRole.DRIVER,
                organization = "VJPL Logistics Division",
                password = "driver123",
                avatarColor = "bg-emerald-600",
                createdAt = "2026-01-15T09:30:00.000Z"
            ),
            User(
                id = "usr-3",
                loginId = "VJPL-DRV02",
                name = "Suresh Reddy",
                email = "suresh@vjpl.com",
                mobile = "9876543212",
                role = UserRole.DRIVER,
                organization = "VJPL Heavy Transport",
                password = "super123",
                avatarColor = "bg-amber-600",
                createdAt = "2026-02-01T10:00:00.000Z"
            ),
            User(
                id = "usr-4",
                loginId = "VJPL-DRV03",
                name = "Mohammed Arif",
                email = "arif@vjpl.com",
                mobile = "9876543213",
                role = UserRole.DRIVER,
                organization = "VJPL Regional Express",
                password = "driver123",
                avatarColor = "bg-purple-600",
                createdAt = "2026-02-10T11:00:00.000Z"
            )
        )

        val INITIAL_FLEET_VEHICLES = listOf(
            FleetVehicle("veh-1", "AP 39 TB 4589", "10-Wheeler Cargo Truck", "Ramesh Kumar", "Diesel", "active", "Long haul route vehicle - Hyderabad / Vijayawada sector"),
            FleetVehicle("veh-2", "AP 09 CW 1142", "Container Hauler", "Suresh Reddy", "Diesel", "active", "Port cargo transportation - Visakhapatnam Port"),
            FleetVehicle("veh-3", "TS 08 UB 7890", "Heavy Logistics Truck", "Mohammed Arif", "Diesel", "active", "Regional distribution - Hyderabad / Warangal"),
            FleetVehicle("veh-4", "KA 04 EA 7720", "Multi-Axle Trailer", "Venkatesh Rao", "Diesel", "active", "Interstate machinery parts transport"),
            FleetVehicle("veh-5", "TN 02 BY 9912", "Mini Cargo Van", "Karthik Raja", "Diesel", "active", "City delivery & feeder cargo")
        )

        val INITIAL_SAMPLE_RECORDS = listOf(
            TransportRecord(
                id = 1725520000001L,
                userId = "usr-2",
                userName = "Ramesh Kumar",
                organization = "VJPL Logistics Division",
                date = "2026-09-07",
                vehicle = "AP 39 TB 4589",
                driver = "Ramesh Kumar",
                startTime = "06:30",
                endTime = "15:45",
                startLocation = "Hyderabad Terminal",
                endLocation = "Vijayawada Hub",
                opening = 45200.0,
                closing = 45480.0,
                totalKm = 280.0,
                fuel = 65.0,
                fuelAmount = 6370.0,
                fuelStation = "HPCL Highway Autocare (NH16)",
                fuelLocation = "Kanchikacherla Village",
                fuelVendor = "Hindustan Petroleum Corporation Ltd (HPCL)",
                mileage = 4.31,
                remarks = "Delivered industrial cargo on schedule. Highway toll paid.",
                approvalStatus = "approved"
            ),
            TransportRecord(
                id = 1725520000002L,
                userId = "usr-3",
                userName = "Suresh Reddy",
                organization = "VJPL Heavy Transport",
                date = "2026-09-06",
                vehicle = "AP 09 CW 1142",
                driver = "Suresh Reddy",
                startTime = "07:00",
                endTime = "18:15",
                startLocation = "Visakhapatnam Port",
                endLocation = "Rajahmundry Yard",
                opening = 38920.0,
                closing = 39140.0,
                totalKm = 220.0,
                fuel = 48.5,
                fuelAmount = 4753.0,
                fuelStation = "IndianOil Express Fuel Hub",
                fuelLocation = "Anakapalle Village",
                fuelVendor = "Indian Oil Corporation Ltd (IOCL)",
                mileage = 4.54,
                remarks = "Container haul. Smooth journey, tire pressure checked.",
                approvalStatus = "approved"
            ),
            TransportRecord(
                id = 1725520000003L,
                userId = "usr-4",
                userName = "Mohammed Arif",
                organization = "VJPL Regional Express",
                date = "2026-09-05",
                vehicle = "TS 08 UB 7890",
                driver = "Mohammed Arif",
                startTime = "08:00",
                endTime = "19:30",
                startLocation = "Hyderabad Logistics Park",
                endLocation = "Warangal Depot",
                opening = 62150.0,
                closing = 62310.0,
                totalKm = 160.0,
                fuel = 36.0,
                fuelAmount = 3528.0,
                fuelStation = "BPCL Oasis Fuel Depot",
                fuelLocation = "Ibrahimpatnam Village",
                fuelVendor = "Bharat Petroleum Corporation Ltd (BPCL)",
                mileage = 4.44,
                remarks = "Local distributor goods delivered without delay.",
                approvalStatus = "approved"
            ),
            TransportRecord(
                id = 1725520000004L,
                userId = "usr-2",
                userName = "Ramesh Kumar",
                organization = "VJPL Logistics Division",
                date = "2026-09-04",
                vehicle = "AP 39 TB 4589",
                driver = "Ramesh Kumar",
                startTime = "05:45",
                endTime = "14:20",
                startLocation = "Vijayawada Hub",
                endLocation = "Guntur Logistics Center",
                opening = 45120.0,
                closing = 45200.0,
                totalKm = 80.0,
                fuel = 18.0,
                fuelAmount = 1764.0,
                fuelStation = "HPCL Bypass Station",
                fuelLocation = "Gannavaram Village",
                fuelVendor = "Hindustan Petroleum Corporation Ltd (HPCL)",
                mileage = 4.44,
                remarks = "Return shuttle cargo.",
                approvalStatus = "approved"
            ),
            TransportRecord(
                id = 1725520000005L,
                userId = "usr-1",
                userName = "Pavan Perikala",
                organization = "VJPL Logistics Division",
                date = "2026-09-03",
                vehicle = "KA 04 EA 7720",
                driver = "Venkatesh Rao",
                startTime = "06:00",
                endTime = "20:00",
                startLocation = "Bengaluru ICD",
                endLocation = "Anantapur Warehouse",
                opening = 88400.0,
                closing = 88635.0,
                totalKm = 235.0,
                fuel = 52.0,
                fuelAmount = 5096.0,
                fuelStation = "Reliance Petroleum NH44 Highway Plaza",
                fuelLocation = "Jadcherla Village",
                fuelVendor = "Reliance Industries Petroleum",
                mileage = 4.52,
                remarks = "Heavy machinery parts consignment.",
                approvalStatus = "approved"
            )
        )

        val INITIAL_FUEL_VENDORS = listOf(
            FuelVendor("fvend-1", "Hindustan Petroleum Corporation Ltd (HPCL)", "HPCL-IND", "+91 1800-22-1200"),
            FuelVendor("fvend-2", "Indian Oil Corporation Ltd (IOCL)", "IOCL-CORP", "+91 1800-23-3355"),
            FuelVendor("fvend-3", "Bharat Petroleum Corporation Ltd (BPCL)", "BPCL-SMART", "+91 1800-22-4344"),
            FuelVendor("fvend-4", "Reliance Industries Petroleum", "RIL-PETRO", "+91 1800-88-9999"),
            FuelVendor("fvend-5", "Nayara Energy Fleet Retail", "NAYARA-FLEET", "+91 1800-12-0000")
        )

        val INITIAL_FUEL_LOCATIONS = listOf(
            FuelLocation("floc-1", "Kanchikacherla Village", "NTR District (AP)"),
            FuelLocation("floc-2", "Anakapalle Village", "Visakhapatnam (AP)"),
            FuelLocation("floc-3", "Ibrahimpatnam Village", "Krishna District (AP)"),
            FuelLocation("floc-4", "Gannavaram Village", "Krishna District (AP)"),
            FuelLocation("floc-5", "Jadcherla Village", "Mahabubnagar (TS)"),
            FuelLocation("floc-6", "Chilakaluripet Village", "Palnadu District (AP)"),
            FuelLocation("floc-7", "Shamshabad Village", "Ranga Reddy (TS)")
        )

        val INITIAL_FUEL_STATIONS = listOf(
            FuelStation("fstat-1", "HPCL Highway Autocare (NH16)", "Kanchikacherla Village", "fvend-1", "Hindustan Petroleum Corporation Ltd (HPCL)"),
            FuelStation("fstat-2", "IndianOil Express Fuel Hub", "Anakapalle Village", "fvend-2", "Indian Oil Corporation Ltd (IOCL)"),
            FuelStation("fstat-3", "BPCL Oasis Fuel Depot", "Ibrahimpatnam Village", "fvend-3", "Bharat Petroleum Corporation Ltd (BPCL)"),
            FuelStation("fstat-4", "HPCL Bypass Station", "Gannavaram Village", "fvend-1", "Hindustan Petroleum Corporation Ltd (HPCL)"),
            FuelStation("fstat-5", "Reliance Petroleum NH44 Highway Plaza", "Jadcherla Village", "fvend-4", "Reliance Industries Petroleum"),
            FuelStation("fstat-6", "Nayara Energy Highway Fuel Port", "Chilakaluripet Village", "fvend-5", "Nayara Energy Fleet Retail")
        )

        val INITIAL_ORGANIZATIONS = listOf(
            Organization("org-1", "VJPL Logistics Division", "LOG-01"),
            Organization("org-2", "VJPL Heavy Transport", "HT-02"),
            Organization("org-3", "VJPL Port Cargo Ops", "PORT-03"),
            Organization("org-4", "VJPL Regional Express", "REG-04")
        )

        val INITIAL_NOTIFICATIONS = listOf(
            AppNotification(
                id = "notif-1",
                type = "trip_approval",
                title = "Trip Mileage Log Pending Approval",
                message = "Driver Ramesh Kumar logged 180 KM on AP39TF1234 (Vijayawada Port → Guntur Yard). Fuel filled: 32L.",
                details = NotificationDetails(
                    recordId = 1L,
                    vehicle = "AP39TF1234",
                    driver = "Ramesh Kumar",
                    totalKm = 180.0,
                    fuel = 32.0,
                    date = "2026-03-01"
                ),
                read = false,
                status = "pending",
                createdAt = "2026-03-01T08:00:00.000Z",
                createdBy = "Ramesh Kumar"
            )
        )
    }

    fun getRecords(): List<TransportRecord> {
        val json = prefs.getString(KEY_RECORDS, null) ?: return INITIAL_SAMPLE_RECORDS.also { saveRecords(it) }
        val type = object : TypeToken<List<TransportRecord>>() {}.type
        return try { gson.fromJson(json, type) ?: INITIAL_SAMPLE_RECORDS } catch (e: Exception) { INITIAL_SAMPLE_RECORDS }
    }

    fun saveRecords(records: List<TransportRecord>) {
        prefs.edit().putString(KEY_RECORDS, gson.toJson(records)).apply()
    }

    fun getVehicles(): List<FleetVehicle> {
        val json = prefs.getString(KEY_VEHICLES, null) ?: return INITIAL_FLEET_VEHICLES.also { saveVehicles(it) }
        val type = object : TypeToken<List<FleetVehicle>>() {}.type
        return try { gson.fromJson(json, type) ?: INITIAL_FLEET_VEHICLES } catch (e: Exception) { INITIAL_FLEET_VEHICLES }
    }

    fun saveVehicles(vehicles: List<FleetVehicle>) {
        prefs.edit().putString(KEY_VEHICLES, gson.toJson(vehicles)).apply()
    }

    fun getUsers(): List<User> {
        val json = prefs.getString(KEY_USERS, null) ?: return INITIAL_USERS.also { saveUsers(it) }
        val type = object : TypeToken<List<User>>() {}.type
        return try { gson.fromJson(json, type) ?: INITIAL_USERS } catch (e: Exception) { INITIAL_USERS }
    }

    fun saveUsers(users: List<User>) {
        prefs.edit().putString(KEY_USERS, gson.toJson(users)).apply()
    }

    fun getCurrentUser(): User? {
        val json = prefs.getString(KEY_CURRENT_USER, null) ?: return INITIAL_USERS.first().also { saveCurrentUser(it) }
        return try { gson.fromJson(json, User::class.java) } catch (e: Exception) { INITIAL_USERS.first() }
    }

    fun saveCurrentUser(user: User?) {
        if (user == null) {
            prefs.edit().remove(KEY_CURRENT_USER).apply()
        } else {
            prefs.edit().putString(KEY_CURRENT_USER, gson.toJson(user)).apply()
        }
    }

    fun getFuelStations(): List<FuelStation> {
        val json = prefs.getString(KEY_STATIONS, null) ?: return INITIAL_FUEL_STATIONS.also { saveFuelStations(it) }
        val type = object : TypeToken<List<FuelStation>>() {}.type
        return try { gson.fromJson(json, type) ?: INITIAL_FUEL_STATIONS } catch (e: Exception) { INITIAL_FUEL_STATIONS }
    }

    fun saveFuelStations(stations: List<FuelStation>) {
        prefs.edit().putString(KEY_STATIONS, gson.toJson(stations)).apply()
    }

    fun getFuelLocations(): List<FuelLocation> {
        val json = prefs.getString(KEY_LOCATIONS, null) ?: return INITIAL_FUEL_LOCATIONS.also { saveFuelLocations(it) }
        val type = object : TypeToken<List<FuelLocation>>() {}.type
        return try { gson.fromJson(json, type) ?: INITIAL_FUEL_LOCATIONS } catch (e: Exception) { INITIAL_FUEL_LOCATIONS }
    }

    fun saveFuelLocations(locations: List<FuelLocation>) {
        prefs.edit().putString(KEY_LOCATIONS, gson.toJson(locations)).apply()
    }

    fun getFuelVendors(): List<FuelVendor> {
        val json = prefs.getString(KEY_VENDORS, null) ?: return INITIAL_FUEL_VENDORS.also { saveFuelVendors(it) }
        val type = object : TypeToken<List<FuelVendor>>() {}.type
        return try { gson.fromJson(json, type) ?: INITIAL_FUEL_VENDORS } catch (e: Exception) { INITIAL_FUEL_VENDORS }
    }

    fun saveFuelVendors(vendors: List<FuelVendor>) {
        prefs.edit().putString(KEY_VENDORS, gson.toJson(vendors)).apply()
    }

    fun getOrganizations(): List<Organization> {
        val json = prefs.getString(KEY_ORGS, null) ?: return INITIAL_ORGANIZATIONS.also { saveOrganizations(it) }
        val type = object : TypeToken<List<Organization>>() {}.type
        return try { gson.fromJson(json, type) ?: INITIAL_ORGANIZATIONS } catch (e: Exception) { INITIAL_ORGANIZATIONS }
    }

    fun saveOrganizations(orgs: List<Organization>) {
        prefs.edit().putString(KEY_ORGS, gson.toJson(orgs)).apply()
    }

    fun getNotifications(): List<AppNotification> {
        val json = prefs.getString(KEY_NOTIFS, null) ?: return INITIAL_NOTIFICATIONS.also { saveNotifications(it) }
        val type = object : TypeToken<List<AppNotification>>() {}.type
        return try { gson.fromJson(json, type) ?: INITIAL_NOTIFICATIONS } catch (e: Exception) { INITIAL_NOTIFICATIONS }
    }

    fun saveNotifications(notifications: List<AppNotification>) {
        prefs.edit().putString(KEY_NOTIFS, gson.toJson(notifications)).apply()
    }
}
