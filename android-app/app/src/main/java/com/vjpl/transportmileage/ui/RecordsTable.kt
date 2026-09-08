package com.vjpl.transportmileage.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vjpl.transportmileage.TransportRecord
import com.vjpl.transportmileage.User

@Composable
fun RecordsTable(
    records: List<TransportRecord>,
    currentUser: User?,
    onEdit: (TransportRecord) -> Unit,
    onDelete: (Long) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Daily Transport Mileage Logs (${records.size})",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1E293B)
                )
            }

            if (records.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No matching transport records found.", color = Color(0xFF94A3B8), fontSize = 14.sp)
                }
            } else {
                Column(
                    modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState())
                ) {
                    // Header Row
                    Row(
                        modifier = Modifier
                            .background(Color(0xFFF8FAFC))
                            .padding(vertical = 8.dp, horizontal = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TableCell("Date", 90.dp, isHeader = true)
                        TableCell("Vehicle", 120.dp, isHeader = true)
                        TableCell("Driver", 110.dp, isHeader = true)
                        TableCell("Route", 140.dp, isHeader = true)
                        TableCell("ODO (Start → End)", 130.dp, isHeader = true)
                        TableCell("Distance", 90.dp, isHeader = true)
                        TableCell("Fuel (L)", 80.dp, isHeader = true)
                        TableCell("Mileage", 80.dp, isHeader = true)
                        TableCell("Status", 90.dp, isHeader = true)
                        TableCell("Actions", 80.dp, isHeader = true)
                    }

                    Divider(color = Color(0xFFE2E8F0))

                    records.forEach { record ->
                        Row(
                            modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            TableCell(record.date, 90.dp)
                            TableCell(record.vehicle, 120.dp, isBold = true)
                            TableCell(record.driver, 110.dp)
                            TableCell("${record.startLocation} → ${record.endLocation}", 140.dp)
                            TableCell("${record.opening.toInt()} → ${record.closing.toInt()}", 130.dp)
                            TableCell("${record.totalKm.toInt()} KM", 90.dp, isBold = true, color = Color(0xFF10B981))
                            TableCell("${record.fuel} L", 80.dp)
                            TableCell("${record.mileage} KM/L", 80.dp, isBold = true, color = Color(0xFF2563EB))

                            // Status Tag
                            Box(modifier = Modifier.width(90.dp)) {
                                val (statusText, statusBg, statusFg) = when (record.approvalStatus) {
                                    "approved" -> Triple("Approved", Color(0xFFD1FAE5), Color(0xFF065F46))
                                    "rejected" -> Triple("Rejected", Color(0xFFFEE2E2), Color(0xFF991B1B))
                                    else -> Triple("Pending", Color(0xFFFEF3C7), Color(0xFF92400E))
                                }
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(statusBg)
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(statusText, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = statusFg)
                                }
                            }

                            // Actions
                            Row(modifier = Modifier.width(80.dp)) {
                                IconButton(onClick = { onEdit(record) }, modifier = Modifier.size(28.dp)) {
                                    Icon(Icons.Default.Edit, contentDescription = "Edit", tint = Color(0xFF2563EB), modifier = Modifier.size(16.dp))
                                }
                                IconButton(onClick = { onDelete(record.id) }, modifier = Modifier.size(28.dp)) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFEF4444), modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                        Divider(color = Color(0xFFF1F5F9))
                    }
                }
            }
        }
    }
}

@Composable
private fun TableCell(
    text: String,
    width: androidx.compose.ui.unit.Dp,
    isHeader: Boolean = false,
    isBold: Boolean = false,
    color: Color = Color.Unspecified
) {
    Text(
        text = text,
        modifier = Modifier.width(width).padding(horizontal = 4.dp),
        fontSize = if (isHeader) 11.sp else 12.sp,
        fontWeight = if (isHeader || isBold) FontWeight.Bold else FontWeight.Normal,
        color = if (isHeader) Color(0xFF64748B) else if (color != Color.Unspecified) color else Color(0xFF1E293B)
    )
}
