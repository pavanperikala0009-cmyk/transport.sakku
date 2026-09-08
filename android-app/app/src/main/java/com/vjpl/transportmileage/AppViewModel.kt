package com.vjpl.transportmileage

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = LocalStorageRepository(application)

    private val _records = MutableStateFlow(repository.getRecords())
    val records: StateFlow<List<TransportRecord>> = _records.asStateFlow()

    private val _fleetVehicles = MutableStateFlow(repository.getVehicles())
    val fleetVehicles: StateFlow<List<FleetVehicle>> = _fleetVehicles.asStateFlow()

    private val _users = MutableStateFlow(repository.getUsers())
    val users: StateFlow<List<User>> = _users.asStateFlow()

    private val _currentUser = MutableStateFlow<User?>(repository.getCurrentUser())
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private val _fuelStations = MutableStateFlow(repository.getFuelStations())
    val fuelStations: StateFlow<List<FuelStation>> = _fuelStations.asStateFlow()

    private val _fuelLocations = MutableStateFlow(repository.getFuelLocations())
    val fuelLocations: StateFlow<List<FuelLocation>> = _fuelLocations.asStateFlow()

    private val _fuelVendors = MutableStateFlow(repository.getFuelVendors())
    val fuelVendors: StateFlow<List<FuelVendor>> = _fuelVendors.asStateFlow()

    private val _organizations = MutableStateFlow(repository.getOrganizations())
    val organizations: StateFlow<List<Organization>> = _organizations.asStateFlow()

    private val _notifications = MutableStateFlow(repository.getNotifications())
    val notifications: StateFlow<List<AppNotification>> = _notifications.asStateFlow()

    private val _filters = MutableStateFlow(FilterOptions())
    val filters: StateFlow<FilterOptions> = _filters.asStateFlow()

    private val _editingRecord = MutableStateFlow<TransportRecord?>(null)
    val editingRecord: StateFlow<TransportRecord?> = _editingRecord.asStateFlow()

    private val _activeRibbonTab = MutableStateFlow("daily") // 'daily', 'monthly', 'fleet'
    val activeRibbonTab: StateFlow<String> = _activeRibbonTab.asStateFlow()

    fun setActiveRibbonTab(tab: String) {
        _activeRibbonTab.value = tab
    }

    fun setFilters(newFilters: FilterOptions) {
        _filters.value = newFilters
    }

    fun resetFilters() {
        _filters.value = FilterOptions()
    }

    fun setEditingRecord(record: TransportRecord?) {
        _editingRecord.value = record
    }

    fun login(loginIdOrEmail: String, pass: String): Pair<Boolean, String?> {
        val cleanId = loginIdOrEmail.trim().lowercase()
        val match = _users.value.find {
            it.loginId?.trim()?.lowercase() == cleanId ||
            it.email?.trim()?.lowercase() == cleanId ||
            it.mobile?.trim() == cleanId
        }
        if (match == null) {
            return Pair(false, "No account found matching $loginIdOrEmail")
        }
        if (match.password != null && match.password != pass.trim()) {
            return Pair(false, "Invalid password")
        }
        _currentUser.value = match
        repository.saveCurrentUser(match)
        return Pair(true, null)
    }

    fun logout() {
        _currentUser.value = null
        repository.saveCurrentUser(null)
    }

    fun registerUser(name: String, role: UserRole, email: String?, mobile: String?, pass: String, org: String?): Pair<Boolean, String?> {
        val count = _users.value.size + 1
        val roleCode = when (role) {
            UserRole.ADMIN -> "ADM"
            UserRole.DRIVER -> "DRV"
            UserRole.MANAGER -> "MGR"
            UserRole.SUPERVISOR -> "SUP"
            UserRole.OPERATOR -> "OPR"
        }
        val loginId = "VJPL-$roleCode${if (count < 10) "0$count" else "$count"}"
        val newUser = User(
            id = "usr-${System.currentTimeMillis()}",
            loginId = loginId,
            name = name,
            email = email,
            mobile = mobile,
            role = role,
            organization = org ?: "VJPL Logistics Division",
            password = pass,
            avatarColor = "bg-blue-600",
            createdAt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())
        )
        val list = listOf(newUser) + _users.value
        _users.value = list
        repository.saveUsers(list)
        _currentUser.value = newUser
        repository.saveCurrentUser(newUser)
        return Pair(true, loginId)
    }

    fun switchUser(user: User) {
        _currentUser.value = user
        repository.saveCurrentUser(user)
    }

    fun deleteUser(userId: String) {
        val list = _users.value.filter { it.id != userId }
        _users.value = list
        repository.saveUsers(list)
        if (_currentUser.value?.id == userId) {
            _currentUser.value = list.firstOrNull()
            repository.saveCurrentUser(_currentUser.value)
        }
    }

    fun getFilteredRecords(): List<TransportRecord> {
        val all = _records.value
        val f = _filters.value

        val now = Date()
        val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(now)

        return all.filter { r ->
            if (f.vehicles.isNotEmpty() && !f.vehicles.contains(r.vehicle.uppercase())) return@filter false
            if (f.driver.isNotBlank() && !r.driver.lowercase().contains(f.driver.trim().lowercase())) return@filter false
            if (f.date.isNotBlank() && r.date != f.date.trim()) return@filter false
            if (f.startDate.isNotBlank() && r.date < f.startDate.trim()) return@filter false
            if (f.endDate.isNotBlank() && r.date > f.endDate.trim()) return@filter false
            if (f.location.isNotBlank()) {
                val loc = f.location.trim().lowercase()
                val comb = "${r.startLocation} ${r.endLocation} ${r.fuelStation} ${r.remarks}".lowercase()
                if (!comb.contains(loc)) return@filter false
            }
            if (f.minKm != null && r.totalKm < f.minKm) return@filter false
            if (f.maxKm != null && r.totalKm > f.maxKm) return@filter false
            if (f.minMileage != null && r.mileage < f.minMileage) return@filter false

            if (f.period == "today" && r.date != todayStr) return@filter false
            if (f.period == "this_month" && !r.date.startsWith(todayStr.take(7))) return@filter false

            true
        }
    }

    fun getMetrics(): DashboardMetrics {
        val filtered = getFilteredRecords()
        val count = filtered.size
        val totalKm = filtered.sumOf { it.totalKm }
        val totalFuel = filtered.sumOf { it.fuel }
        val totalCost = filtered.sumOf { it.fuelAmount }

        val avgMileage = if (totalFuel > 0) String.format(Locale.US, "%.2f", totalKm / totalFuel).toDouble() else 0.0
        val avgCostKm = if (totalKm > 0) String.format(Locale.US, "%.2f", totalCost / totalKm).toDouble() else 0.0

        return DashboardMetrics(count, totalKm, totalFuel, avgMileage, totalCost, avgCostKm)
    }

    fun getLatestOdoForVehicle(vehicleNum: String, excludeId: Long? = null): Double {
        val clean = vehicleNum.trim().uppercase()
        if (clean.isBlank()) return 0.0
        val matches = _records.value.filter { it.vehicle.trim().uppercase() == clean && (excludeId == null || it.id != excludeId) }
        if (matches.isEmpty()) return 0.0
        return matches.maxOf { it.closing }
    }

    fun saveRecord(record: TransportRecord) {
        val upperVeh = record.vehicle.trim().uppercase()
        if (upperVeh.isNotBlank() && _fleetVehicles.value.none { it.vehicleNumber.uppercase() == upperVeh }) {
            val autoVeh = FleetVehicle("veh-${System.currentTimeMillis()}", upperVeh, "Commercial Transport Vehicle", record.driver, "Diesel", "active")
            val newVehs = listOf(autoVeh) + _fleetVehicles.value
            _fleetVehicles.value = newVehs
            repository.saveVehicles(newVehs)
        }

        val existingIndex = _records.value.indexOfFirst { it.id == record.id }
        val list = if (existingIndex >= 0) {
            _records.value.toMutableList().apply { set(existingIndex, record) }
        } else {
            listOf(record) + _records.value
        }

        _records.value = list
        repository.saveRecords(list)
        _editingRecord.value = null
    }

    fun deleteRecord(id: Long) {
        val list = _records.value.filter { it.id != id }
        _records.value = list
        repository.saveRecords(list)
    }

    fun addVehicle(vehicle: FleetVehicle) {
        val list = listOf(vehicle) + _fleetVehicles.value
        _fleetVehicles.value = list
        repository.saveVehicles(list)
    }

    fun deleteVehicle(id: String) {
        val list = _fleetVehicles.value.filter { it.id != id }
        _fleetVehicles.value = list
        repository.saveVehicles(list)
    }

    fun approveTrip(notification: AppNotification) {
        val recId = notification.details?.recordId
        if (recId != null) {
            val list = _records.value.map { if (it.id == recId) it.copy(approvalStatus = "approved") else it }
            _records.value = list
            repository.saveRecords(list)
        }
        val notifList = _notifications.value.map { if (it.id == notification.id) it.copy(status = "approved", read = true) else it }
        _notifications.value = notifList
        repository.saveNotifications(notifList)
    }

    fun rejectTrip(notification: AppNotification) {
        val recId = notification.details?.recordId
        if (recId != null) {
            val list = _records.value.map { if (it.id == recId) it.copy(approvalStatus = "rejected") else it }
            _records.value = list
            repository.saveRecords(list)
        }
        val notifList = _notifications.value.map { if (it.id == notification.id) it.copy(status = "rejected", read = true) else it }
        _notifications.value = notifList
        repository.saveNotifications(notifList)
    }

    fun dismissNotification(id: String) {
        val notifList = _notifications.value.map { if (it.id == id) it.copy(status = "dismissed", read = true) else it }
        _notifications.value = notifList
        repository.saveNotifications(notifList)
    }

    fun markAllNotificationsRead() {
        val notifList = _notifications.value.map { it.copy(read = true) }
        _notifications.value = notifList
        repository.saveNotifications(notifList)
    }

    fun saveFuelStations(list: List<FuelStation>) {
        _fuelStations.value = list
        repository.saveFuelStations(list)
    }

    fun saveFuelLocations(list: List<FuelLocation>) {
        _fuelLocations.value = list
        repository.saveFuelLocations(list)
    }

    fun saveFuelVendors(list: List<FuelVendor>) {
        _fuelVendors.value = list
        repository.saveFuelVendors(list)
    }

    fun saveOrganizations(list: List<Organization>) {
        _organizations.value = list
        repository.saveOrganizations(list)
    }

    fun generateCsvString(recordsToExport: List<TransportRecord> = getFilteredRecords()): String {
        val header = "Date,Vehicle,Driver / User,Organization,Opening KM,Closing KM,Total KM,Fuel Litres,Mileage KM/L,Fuel Amount,Fuel Station,Fuel Location (Village),Fuel Vendor,Start Location,End Location,Remarks\n"
        val rows = recordsToExport.joinToString("\n") { r ->
            listOf(
                r.date, r.vehicle, r.driver, r.organization, r.opening, r.closing,
                r.totalKm, r.fuel, r.mileage, r.fuelAmount, r.fuelStation, r.fuelLocation,
                r.fuelVendor, r.startLocation, r.endLocation, r.remarks
            ).joinToString(",") { "\"${it.toString().replace("\"", "\"\"")}\"" }
        }
        return header + rows
    }

    fun importCsvText(csvText: String): Int {
        val lines = csvText.trim().split("\n")
        if (lines.size < 2) return 0
        val imported = mutableListOf<TransportRecord>()
        for (i in 1 until lines.size) {
            val line = lines[i].trim()
            if (line.isBlank()) continue
            val parts = line.split(",").map { it.trim().removeSurrounding("\"") }
            if (parts.size >= 6) {
                val hasExtended = parts.size >= 14
                val opening = parts.getOrNull(if (hasExtended) 4 else 3)?.toDoubleOrNull() ?: 0.0
                val closing = parts.getOrNull(if (hasExtended) 5 else 4)?.toDoubleOrNull() ?: 0.0
                val totalKm = parts.getOrNull(if (hasExtended) 6 else 5)?.toDoubleOrNull() ?: (closing - opening)
                val fuel = parts.getOrNull(if (hasExtended) 7 else 6)?.toDoubleOrNull() ?: 0.0
                val mileage = parts.getOrNull(if (hasExtended) 8 else 7)?.toDoubleOrNull() ?: (if (fuel > 0) totalKm / fuel else 0.0)
                val fuelAmount = parts.getOrNull(if (hasExtended) 9 else 8)?.toDoubleOrNull() ?: 0.0

                val rec = TransportRecord(
                    id = System.currentTimeMillis() + i,
                    userId = "usr-1",
                    userName = parts.getOrNull(2) ?: "Imported User",
                    organization = if (hasExtended) parts.getOrNull(3) ?: "VJPL Logistics Division" else "VJPL Logistics Division",
                    date = parts.getOrNull(0) ?: "2026-03-01",
                    vehicle = (parts.getOrNull(1) ?: "UNKNOWN").uppercase(),
                    driver = parts.getOrNull(2) ?: "",
                    opening = opening,
                    closing = closing,
                    totalKm = totalKm,
                    fuel = fuel,
                    mileage = String.format(Locale.US, "%.2f", mileage).toDouble(),
                    fuelAmount = fuelAmount,
                    fuelStation = if (hasExtended) parts.getOrNull(10) ?: "" else "",
                    fuelLocation = if (hasExtended) parts.getOrNull(11) ?: "" else "",
                    fuelVendor = if (hasExtended) parts.getOrNull(12) ?: "" else "",
                    startLocation = if (hasExtended) parts.getOrNull(13) ?: "" else parts.getOrNull(9) ?: "",
                    endLocation = if (hasExtended) parts.getOrNull(14) ?: "" else parts.getOrNull(10) ?: "",
                    remarks = if (hasExtended) parts.getOrNull(15) ?: "" else parts.getOrNull(11) ?: ""
                )
                imported.add(rec)
            }
        }
        if (imported.isNotEmpty()) {
            val merged = imported + _records.value
            _records.value = merged
            repository.saveRecords(merged)
        }
        return imported.size
    }

    fun resetSampleRecords() {
        val samples = LocalStorageRepository.INITIAL_SAMPLE_RECORDS
        _records.value = samples
        repository.saveRecords(samples)
    }

    fun clearAllRecords() {
        _records.value = emptyList()
        repository.saveRecords(emptyList())
    }
}
