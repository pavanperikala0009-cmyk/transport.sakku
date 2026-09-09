package com.vjpl.transportmileage.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun TopRibbonNavigation(
    activeTab: String,
    onTabSelected: (String) -> Unit,
    onNewTripClick: () -> Unit,
    onOpenVehicleManager: () -> Unit,
    onOpenFuelMaster: () -> Unit,
    onPrintPreview: () -> Unit
) {
    Surface(
        color = Color(0xFF0F172A),
        contentColor = Color.White
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                RibbonTabButton("Daily Log", Icons.Default.DirectionsCar, activeTab == "daily") {
                    onTabSelected("daily")
                }
                RibbonTabButton("Monthly Report", Icons.Default.CalendarMonth, activeTab == "monthly") {
                    onTabSelected("monthly")
                }
                RibbonTabButton("Fleet Breakdown", Icons.Default.LocalShipping, activeTab == "fleet") {
                    onTabSelected("fleet")
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Button(
                    onClick = onNewTripClick,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("New Trip", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }

                IconButton(onClick = onOpenVehicleManager) {
                    Icon(Icons.Default.Build, contentDescription = "Vehicles", tint = Color.LightGray)
                }
                IconButton(onClick = onOpenFuelMaster) {
                    Icon(Icons.Default.LocalGasStation, contentDescription = "Fuel Master", tint = Color.LightGray)
                }
                IconButton(onClick = onPrintPreview) {
                    Icon(Icons.Default.Print, contentDescription = "Print Preview", tint = Color.LightGray)
                }
            }
        }
    }
}

@Composable
private fun RibbonTabButton(
    title: String,
    icon: ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(if (isSelected) Color(0xFF2563EB) else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (isSelected) Color.White else Color(0xFF94A3B8),
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) Color.White else Color(0xFF94A3B8)
            )
        }
    }
}
