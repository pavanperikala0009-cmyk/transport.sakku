package com.vjpl.transportmileage.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.vjpl.transportmileage.FilterOptions

@Composable
fun SearchFilter(
    filters: FilterOptions,
    onFilterChange: (FilterOptions) -> Unit,
    onResetFilters: () -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
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
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Search, contentDescription = null, tint = Color(0xFF2563EB))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Search & Filter Records", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                }
                Row {
                    TextButton(onClick = onResetFilters) {
                        Text("Reset Filters", fontSize = 12.sp, color = Color(0xFFEF4444))
                    }
                    IconButton(onClick = { expanded = !expanded }) {
                        Icon(if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore, contentDescription = null)
                    }
                }
            }

            // Quick Preset Period Chips
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                FilterChip(
                    selected = filters.period == "all",
                    onClick = { onFilterChange(filters.copy(period = "all")) },
                    label = { Text("All", fontSize = 11.sp) }
                )
                FilterChip(
                    selected = filters.period == "today",
                    onClick = { onFilterChange(filters.copy(period = "today")) },
                    label = { Text("Today", fontSize = 11.sp) }
                )
                FilterChip(
                    selected = filters.period == "this_month",
                    onClick = { onFilterChange(filters.copy(period = "this_month")) },
                    label = { Text("This Month", fontSize = 11.sp) }
                )
            }

            if (expanded) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = filters.driver,
                        onValueChange = { onFilterChange(filters.copy(driver = it)) },
                        label = { Text("Filter Driver / User") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = filters.location,
                        onValueChange = { onFilterChange(filters.copy(location = it)) },
                        label = { Text("Route / Location") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = filters.startDate,
                        onValueChange = { onFilterChange(filters.copy(startDate = it)) },
                        label = { Text("From Date") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = filters.endDate,
                        onValueChange = { onFilterChange(filters.copy(endDate = it)) },
                        label = { Text("To Date") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }
            }
        }
    }
}
