package com.vjpl.transportmileage.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vjpl.transportmileage.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EntryForm(
    viewModel: AppViewModel,
    editingRecord: TransportRecord?,
    fleetVehicles: List<FleetVehicle>,
    fuelStations: List<FuelStation>,
    fuelLocations: List<FuelLocation>,
    fuelVendors: List<FuelVendor>,
    organizations: List<Organization>,
    currentUser: User?,
    onSave: (TransportRecord) -> Unit,
    onCancelEdit: () -> Unit
) {
    val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())

    var vehicle by remember(editingRecord) { mutableStateOf(editingRecord?.vehicle ?: "") }
    var driver by remember(editingRecord) { mutableStateOf(editingRecord?.driver ?: currentUser?.name ?: "") }
    var organization by remember(editingRecord) { mutableStateOf(editingRecord?.organization ?: currentUser?.organization ?: "VJPL Logistics Division") }
    var date by remember(editingRecord) { mutableStateOf(editingRecord?.date ?: today) }
    var startTime by remember(editingRecord) { mutableStateOf(editingRecord?.startTime ?: "07:00") }
    var endTime by remember(editingRecord) { mutableStateOf(editingRecord?.endTime ?: "18:00") }
    var startLocation by remember(editingRecord) { mutableStateOf(editingRecord?.startLocation ?: "") }
    var endLocation by remember(editingRecord) { mutableStateOf(editingRecord?.endLocation ?: "") }

    var opening by remember(editingRecord) { mutableStateOf(editingRecord?.opening?.toString() ?: "") }
    var closing by remember(editingRecord) { mutableStateOf(editingRecord?.closing?.toString() ?: "") }
    var fuel by remember(editingRecord) { mutableStateOf(editingRecord?.fuel?.toString() ?: "") }
    var fuelAmount by remember(editingRecord) { mutableStateOf(editingRecord?.fuelAmount?.toString() ?: "") }

    var fuelStation by remember(editingRecord) { mutableStateOf(editingRecord?.fuelStation ?: "") }
    var fuelLocation by remember(editingRecord) { mutableStateOf(editingRecord?.fuelLocation ?: "") }
    var fuelVendor by remember(editingRecord) { mutableStateOf(editingRecord?.fuelVendor ?: "") }
    var remarks by remember(editingRecord) { mutableStateOf(editingRecord?.remarks ?: "") }

    // Auto lookup previous closing ODO when vehicle changes
    LaunchedEffect(vehicle) {
        if (editingRecord == null && vehicle.isNotBlank() && opening.isBlank()) {
            val latest = viewModel.getLatestOdoForVehicle(vehicle)
            if (latest > 0) {
                opening = latest.toInt().toString()
            }
        }
    }

    val openVal = opening.toDoubleOrNull() ?: 0.0
    val closeVal = closing.toDoubleOrNull() ?: 0.0
    val totalKm = if (closeVal >= openVal && openVal > 0) closeVal - openVal else 0.0
    val fuelVal = fuel.toDoubleOrNull() ?: 0.0
    val mileage = if (fuelVal > 0) String.format(Locale.US, "%.2f", totalKm / fuelVal).toDouble() else 0.0

    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
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
                    Icon(
                        imageVector = if (editingRecord != null) Icons.Default.Edit else Icons.Default.AddCircle,
                        contentDescription = null,
                        tint = Color(0xFF2563EB)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (editingRecord != null) "Edit Trip Mileage Entry" else "Daily Vehicle Mileage Log Entry",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E293B)
                    )
                }
                if (editingRecord != null) {
                    TextButton(onClick = onCancelEdit) {
                        Text("Cancel Edit", color = Color(0xFFEF4444))
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Row 1: Date, Vehicle, Driver
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it },
                    label = { Text("Date (YYYY-MM-DD)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = vehicle,
                    onValueChange = { vehicle = it.uppercase() },
                    label = { Text("Vehicle No.") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = driver,
                    onValueChange = { driver = it },
                    label = { Text("Driver / User") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Row 2: Opening ODO, Closing ODO, Calculated Total KM, Calculated Mileage
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = opening,
                    onValueChange = { opening = it },
                    label = { Text("Opening ODO (KM)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = closing,
                    onValueChange = { closing = it },
                    label = { Text("Closing ODO (KM)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                Card(
                    modifier = Modifier.weight(1f).height(56.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9))
                ) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Total Distance", fontSize = 10.sp, color = Color(0xFF64748B))
                            Text("${totalKm.toInt()} KM", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Row 3: Fuel Litres, Fuel Amount, Mileage Result
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = fuel,
                    onValueChange = { fuel = it },
                    label = { Text("Fuel (Litres)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = fuelAmount,
                    onValueChange = { fuelAmount = it },
                    label = { Text("Fuel Amount (₹)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                Card(
                    modifier = Modifier.weight(1f).height(56.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9))
                ) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Calculated Mileage", fontSize = 10.sp, color = Color(0xFF64748B))
                            Text("$mileage KM/L", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2563EB))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Row 4: Route Locations (Start & End)
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = startLocation,
                    onValueChange = { startLocation = it },
                    label = { Text("Start Location") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = endLocation,
                    onValueChange = { endLocation = it },
                    label = { Text("End Location / Destination") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Row 5: Fuel Station & Village
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = fuelStation,
                    onValueChange = { fuelStation = it },
                    label = { Text("Fuel Station Name") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = fuelLocation,
                    onValueChange = { fuelLocation = it },
                    label = { Text("Fuel Fill Village / Location") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Remarks
            OutlinedTextField(
                value = remarks,
                onValueChange = { remarks = it },
                label = { Text("Trip Notes / Cargo / Toll Remarks") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Save Button
            Button(
                onClick = {
                    if (vehicle.isNotBlank() && date.isNotBlank()) {
                        val record = TransportRecord(
                            id = editingRecord?.id ?: System.currentTimeMillis(),
                            userId = currentUser?.id ?: "usr-1",
                            userName = currentUser?.name ?: driver,
                            organization = organization,
                            date = date,
                            vehicle = vehicle.uppercase(),
                            driver = driver,
                            startTime = startTime,
                            endTime = endTime,
                            startLocation = startLocation,
                            endLocation = endLocation,
                            opening = openVal,
                            closing = closeVal,
                            totalKm = totalKm,
                            fuel = fuelVal,
                            fuelAmount = fuelAmount.toDoubleOrNull() ?: 0.0,
                            fuelStation = fuelStation,
                            fuelLocation = fuelLocation,
                            fuelVendor = fuelVendor,
                            mileage = mileage,
                            remarks = remarks,
                            approvalStatus = if (currentUser?.role == UserRole.ADMIN) "approved" else "pending"
                        )
                        onSave(record)
                        if (editingRecord == null) {
                            vehicle = ""
                            opening = ""
                            closing = ""
                            fuel = ""
                            fuelAmount = ""
                            startLocation = ""
                            endLocation = ""
                            remarks = ""
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.Save, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (editingRecord != null) "Update Trip Record" else "Save Daily Mileage Entry",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
