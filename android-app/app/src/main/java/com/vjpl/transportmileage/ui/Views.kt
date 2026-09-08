package com.vjpl.transportmileage.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vjpl.transportmileage.FleetVehicle
import com.vjpl.transportmileage.TransportRecord
import java.util.Locale

@Composable
fun MonthWiseReportView(records: List<TransportRecord>) {
    val grouped = records.groupBy { if (it.date.length >= 7) it.date.take(7) else "Unknown" }

    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Text("Month-Wise Fleet Summary Reports", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
        Spacer(modifier = Modifier.height(12.dp))

        if (grouped.isEmpty()) {
            Text("No monthly data available.", color = Color.Gray)
        } else {
            grouped.forEach { (month, monthRecords) ->
                val totalKm = monthRecords.sumOf { it.totalKm }
                val totalFuel = monthRecords.sumOf { it.fuel }
                val totalCost = monthRecords.sumOf { it.fuelAmount }
                val avgMileage = if (totalFuel > 0) String.format(Locale.US, "%.2f", totalKm / totalFuel) else "0"

                Card(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CalendarMonth, contentDescription = null, tint = Color(0xFF2563EB))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Month: $month", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                            }
                            Text("${monthRecords.size} Entries", fontSize = 12.sp, color = Color(0xFF64748B))
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Column {
                                Text("Total Distance", fontSize = 11.sp, color = Color(0xFF64748B))
                                Text("${totalKm.toInt()} KM", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                            }
                            Column {
                                Text("Total Fuel", fontSize = 11.sp, color = Color(0xFF64748B))
                                Text("${totalFuel.toInt()} L", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B))
                            }
                            Column {
                                Text("Avg Mileage", fontSize = 11.sp, color = Color(0xFF64748B))
                                Text("$avgMileage KM/L", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2563EB))
                            }
                            Column {
                                Text("Total Expense", fontSize = 11.sp, color = Color(0xFF64748B))
                                Text("₹${totalCost.toInt()}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFFEF4444))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FleetBreakdown(vehicles: List<FleetVehicle>, records: List<TransportRecord>) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Text("Fleet Vehicles Overview (${vehicles.size})", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
        Spacer(modifier = Modifier.height(12.dp))

        vehicles.forEach { veh ->
            val vehRecords = records.filter { it.vehicle.equals(veh.vehicleNumber, ignoreCase = true) }
            val totalKm = vehRecords.sumOf { it.totalKm }
            val totalFuel = vehRecords.sumOf { it.fuel }
            val avgMileage = if (totalFuel > 0) String.format(Locale.US, "%.2f", totalKm / totalFuel) else "0"

            Card(
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier.size(40.dp).background(Color(0xFFE0F2FE), shape = RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.LocalShipping, contentDescription = null, tint = Color(0xFF0284C7))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(veh.vehicleNumber, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                            Text("${veh.type} • Driver: ${veh.defaultDriver ?: "Unassigned"}", fontSize = 12.sp, color = Color(0xFF64748B))
                        }
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text("${totalKm.toInt()} KM logged", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                        Text("$avgMileage KM/L avg", fontSize = 11.sp, color = Color(0xFF2563EB))
                    }
                }
            }
        }
    }
}
