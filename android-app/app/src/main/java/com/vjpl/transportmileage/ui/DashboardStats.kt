package com.vjpl.transportmileage.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vjpl.transportmileage.DashboardMetrics
import java.util.Locale

@Composable
fun DashboardStats(metrics: DashboardMetrics) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            StatCard(
                title = "Total Trips",
                value = "${metrics.totalEntries}",
                subtitle = "Logged Entries",
                icon = Icons.Default.DirectionsCar,
                color = Color(0xFF2563EB),
                modifier = Modifier.weight(1f)
            )
            StatCard(
                title = "Total Distance",
                value = "${metrics.totalKm.toInt()} KM",
                subtitle = "Odometer Sum",
                icon = Icons.Default.Speed,
                color = Color(0xFF10B981),
                modifier = Modifier.weight(1f)
            )
            StatCard(
                title = "Total Fuel",
                value = "${metrics.totalFuel.toInt()} L",
                subtitle = "Diesel Filled",
                icon = Icons.Default.LocalGasStation,
                color = Color(0xFFF59E0B),
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            StatCard(
                title = "Avg Mileage",
                value = "${metrics.avgMileage} KM/L",
                subtitle = "Fleet Average",
                icon = Icons.Default.BarChart,
                color = Color(0xFF8B5CF6),
                modifier = Modifier.weight(1f)
            )
            StatCard(
                title = "Fuel Expense",
                value = "₹${metrics.totalFuelAmount.toInt()}",
                subtitle = "Total Amount",
                icon = Icons.Default.Payments,
                color = Color(0xFFEF4444),
                modifier = Modifier.weight(1f)
            )
            StatCard(
                title = "Cost per KM",
                value = "₹${metrics.avgCostPerKm}",
                subtitle = "Avg Operating Cost",
                icon = Icons.Default.Calculate,
                color = Color(0xFF06B6D4),
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun StatCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = title, fontSize = 12.sp, color = Color(0xFF64748B), fontWeight = FontWeight.Medium)
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .background(color.copy(alpha = 0.1f), shape = RoundedCornerShape(6.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
            Text(text = subtitle, fontSize = 10.sp, color = Color(0xFF94A3B8))
        }
    }
}
