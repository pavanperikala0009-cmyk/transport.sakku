package com.vjpl.transportmileage.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vjpl.transportmileage.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    viewModel: AppViewModel
) {
    if (!isOpen) return

    var isRegister by remember { mutableStateOf(false) }
    var loginId by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var selectedRole by remember { mutableStateOf(UserRole.DRIVER) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onClose,
        title = {
            Text(if (isRegister) "Register User Account" else "Account Login", fontWeight = FontWeight.Bold)
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                if (errorMsg != null) {
                    Text(errorMsg!!, color = Color(0xFFEF4444), fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                }

                if (isRegister) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }

                OutlinedTextField(
                    value = loginId,
                    onValueChange = { loginId = it },
                    label = { Text(if (isRegister) "Email / Mobile" else "Login ID / Email / Mobile") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                TextButton(onClick = { isRegister = !isRegister; errorMsg = null }) {
                    Text(if (isRegister) "Already have an account? Login" else "Need an account? Register")
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (isRegister) {
                        val res = viewModel.registerUser(name, selectedRole, loginId, null, password, null)
                        if (res.first) onClose() else errorMsg = res.second
                    } else {
                        val res = viewModel.login(loginId, password)
                        if (res.first) onClose() else errorMsg = res.second
                    }
                }
            ) {
                Text(if (isRegister) "Register" else "Login")
            }
        },
        dismissButton = {
            TextButton(onClick = onClose) { Text("Cancel") }
        }
    )
}

@Composable
fun NotificationBellModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    notifications: List<AppNotification>,
    onApproveTrip: (AppNotification) -> Unit,
    onRejectTrip: (AppNotification) -> Unit,
    onDismissNotif: (String) -> Unit
) {
    if (!isOpen) return

    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("Notifications & Trip Approvals", fontWeight = FontWeight.Bold) },
        text = {
            Column(modifier = Modifier.fillMaxWidth().height(300.dp)) {
                if (notifications.isEmpty()) {
                    Text("No notifications.", color = Color.Gray)
                } else {
                    LazyColumn {
                        items(notifications) { notif ->
                            Card(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC))
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text(notif.title, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Text(notif.message, fontSize = 12.sp, color = Color(0xFF475569))

                                    if (notif.type == "trip_approval" && notif.status == "pending") {
                                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                                            TextButton(onClick = { onRejectTrip(notif) }) {
                                                Text("Reject", color = Color(0xFFEF4444), fontSize = 11.sp)
                                            }
                                            Button(
                                                onClick = { onApproveTrip(notif) },
                                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                                            ) {
                                                Text("Approve", fontSize = 11.sp)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = onClose) { Text("Close") }
        }
    )
}

@Composable
fun CloudSyncModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    viewModel: AppViewModel
) {
    if (!isOpen) return

    var importText by remember { mutableStateOf("") }
    var msg by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("Cloud Backup & CSV Data", fontWeight = FontWeight.Bold) },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                if (msg != null) {
                    Text(msg!!, color = Color(0xFF10B981), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                }

                Text("Import Records from CSV Format:", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = importText,
                    onValueChange = { importText = it },
                    placeholder = { Text("Paste CSV text here...") },
                    modifier = Modifier.fillMaxWidth().height(120.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = {
                        val count = viewModel.importCsvText(importText)
                        msg = "Successfully imported $count records!"
                        importText = ""
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Import CSV")
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onClose) { Text("Done") }
        }
    )
}

@Composable
fun FuelMasterModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    viewModel: AppViewModel
) {
    if (!isOpen) return

    val stations by viewModel.fuelStations.collectAsState()
    var newName by remember { mutableStateOf("") }
    var newVillage by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("Fuel Master Data Manager", fontWeight = FontWeight.Bold) },
        text = {
            Column(modifier = Modifier.fillMaxWidth().height(300.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    OutlinedTextField(
                        value = newName,
                        onValueChange = { newName = it },
                        label = { Text("Station") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = newVillage,
                        onValueChange = { newVillage = it },
                        label = { Text("Village") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    Button(
                        onClick = {
                            if (newName.isNotBlank()) {
                                val newSt = FuelStation("fstat-${System.currentTimeMillis()}", newName, newVillage)
                                viewModel.saveFuelStations(listOf(newSt) + stations)
                                newName = ""
                                newVillage = ""
                            }
                        }
                    ) { Text("Add") }
                }

                Spacer(modifier = Modifier.height(8.dp))

                LazyColumn {
                    items(stations) { st ->
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(st.name, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text(st.locationVillage ?: "", fontSize = 12.sp, color = Color.Gray)
                        }
                        Divider()
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onClose) { Text("Close") }
        }
    )
}

@Composable
fun VehicleManagerModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    viewModel: AppViewModel
) {
    if (!isOpen) return

    val vehicles by viewModel.fleetVehicles.collectAsState()
    var num by remember { mutableStateOf("") }
    var driver by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("Fleet Vehicles Manager", fontWeight = FontWeight.Bold) },
        text = {
            Column(modifier = Modifier.fillMaxWidth().height(300.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    OutlinedTextField(
                        value = num,
                        onValueChange = { num = it.uppercase() },
                        label = { Text("Vehicle No") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = driver,
                        onValueChange = { driver = it },
                        label = { Text("Driver") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    Button(
                        onClick = {
                            if (num.isNotBlank()) {
                                viewModel.addVehicle(FleetVehicle("veh-${System.currentTimeMillis()}", num, "Commercial Transport Vehicle", driver))
                                num = ""
                                driver = ""
                            }
                        }
                    ) { Text("Add") }
                }

                Spacer(modifier = Modifier.height(8.dp))

                LazyColumn {
                    items(vehicles) { veh ->
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(veh.vehicleNumber, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text("Driver: ${veh.defaultDriver ?: "N/A"}", fontSize = 11.sp, color = Color.Gray)
                            }
                            IconButton(onClick = { viewModel.deleteVehicle(veh.id) }) {
                                Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red, modifier = Modifier.size(18.dp))
                            }
                        }
                        Divider()
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onClose) { Text("Close") }
        }
    )
}
