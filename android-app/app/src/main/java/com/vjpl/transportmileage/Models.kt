package com.vjpl.transportmileage

import java.util.UUID

enum class UserRole {
    ADMIN, MANAGER, SUPERVISOR, DRIVER, OPERATOR;

    fun toDisplayString(): String {
        return name.lowercase().replaceFirstChar { it.uppercase() }
    }

    companion object {
        fun fromString(value: String?): UserRole {
            return when (value?.lowercase()) {
                "admin" -> ADMIN
                "manager" -> MANAGER
                "supervisor" -> SUPERVISOR
                "driver" -> DRIVER
                else -> OPERATOR
            }
        }
    }
}

data class User(
    val id: String = UUID.randomUUID().toString(),
    val loginId: String? = null,
    val name: String,
    val email: String? = null,
    val mobile: String? = null,
    val role: UserRole = UserRole.OPERATOR,
    val organization: String? = "VJPL Logistics Division",
    val password: String? = null,
    val avatarColor: String? = "bg-blue-600",
    val createdAt: String = "2026-01-01T08:00:00.000Z",
    val lastLoginAt: String? = null
)

data class FuelStation(
    val id: String,
    val name: String,
    val locationVillage: String? = null,
    val vendorId: String? = null,
    val vendorName: String? = null,
    val status: String = "active"
)

data class FuelLocation(
    val id: String,
    val villageName: String,
    val district: String? = null,
    val status: String = "active"
)

data class FuelVendor(
    val id: String,
    val name: String,
    val vendorCode: String? = null,
    val contactNumber: String? = null,
    val status: String = "active"
)

data class Organization(
    val id: String,
    val name: String,
    val code: String? = null
)

data class FleetVehicle(
    val id: String,
    val vehicleNumber: String,
    val type: String,
    val defaultDriver: String? = null,
    val fuelType: String? = "Diesel",
    val status: String = "active",
    val notes: String? = null
)

data class TransportRecord(
    val id: Long = System.currentTimeMillis(),
    val userId: String = "usr-1",
    val userName: String = "User",
    val organization: String = "VJPL Logistics Division",
    val date: String,
    val vehicle: String,
    val driver: String,
    val startTime: String = "",
    val endTime: String = "",
    val startLocation: String = "",
    val endLocation: String = "",
    val opening: Double = 0.0,
    val closing: Double = 0.0,
    val totalKm: Double = 0.0,
    val fuel: Double = 0.0,
    val fuelAmount: Double = 0.0,
    val fuelStation: String = "",
    val fuelLocation: String = "",
    val fuelVendor: String = "",
    val mileage: Double = 0.0,
    val remarks: String = "",
    val isOdoCorrectedByAdmin: Boolean = false,
    val approvalStatus: String = "approved" // 'approved' | 'pending' | 'rejected'
)

data class NotificationDetails(
    val recordId: Long? = null,
    val vehicle: String? = null,
    val driver: String? = null,
    val totalKm: Double? = null,
    val fuel: Double? = null,
    val oldOpening: Double? = null,
    val newOpening: Double? = null,
    val oldClosing: Double? = null,
    val newClosing: Double? = null,
    val userId: String? = null,
    val userName: String? = null,
    val userRole: String? = null,
    val userLoginId: String? = null,
    val date: String? = null,
    val reason: String? = null
)

data class AppNotification(
    val id: String = "notif-${System.currentTimeMillis()}",
    val type: String, // 'trip_approval' | 'record_modified' | 'record_deleted' | 'user_approval' | 'system_alert'
    val title: String,
    val message: String,
    val details: NotificationDetails? = null,
    val read: Boolean = false,
    val status: String = "pending", // 'pending' | 'approved' | 'rejected' | 'dismissed'
    val createdAt: String = "2026-03-01T08:00:00.000Z",
    val createdBy: String? = "System"
)

data class DashboardMetrics(
    val totalEntries: Int = 0,
    val totalKm: Double = 0.0,
    val totalFuel: Double = 0.0,
    val avgMileage: Double = 0.0,
    val totalFuelAmount: Double = 0.0,
    val avgCostPerKm: Double = 0.0
)

data class FilterOptions(
    val vehicles: List<String> = emptyList(),
    val userId: String? = null,
    val driver: String = "",
    val organization: String? = null,
    val fuelStation: String? = null,
    val fuelVendor: String? = null,
    val fuelLocation: String? = null,
    val date: String = "",
    val startDate: String = "",
    val endDate: String = "",
    val location: String = "",
    val minKm: Double? = null,
    val maxKm: Double? = null,
    val minMileage: Double? = null,
    val period: String = "all" // 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'this_month'
)
