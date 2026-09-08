package com.vjpl.transportmileage.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vjpl.transportmileage.AppViewModel
import com.vjpl.transportmileage.User

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppHeader(
    viewModel: AppViewModel,
    currentUser: User?,
    unreadNotifCount: Int,
    onOpenAuth: () -> Unit,
    onOpenManageUsers: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenCloudModal: () -> Unit
) {
    var showUserMenu by remember { mutableStateOf(false) }

    Surface(
        color = Color(0xFF1E293B),
        contentColor = Color.White,
        shadowElevation = 4.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Title and Logo Branding
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFF2563EB)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsBus,
                            contentDescription = "Logo",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Transport Mileage Track Record",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "VJPL Fleet & Odometer Tracking",
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8)
                        )
                    }
                }

                // Action Buttons (Notifications, Cloud/CSV, User Avatar)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onOpenNotifications) {
                        BadgedBox(
                            badge = {
                                if (unreadNotifCount > 0) {
                                    Badge { Text("$unreadNotifCount") }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = "Notifications",
                                tint = Color.White
                            )
                        }
                    }

                    IconButton(onClick = onOpenCloudModal) {
                        Icon(
                            imageVector = Icons.Default.CloudSync,
                            contentDescription = "Cloud / CSV",
                            tint = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    if (currentUser != null) {
                        Box {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF2563EB))
                                    .clickable { showUserMenu = true },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = currentUser.name.take(1).uppercase(),
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                            DropdownMenu(
                                expanded = showUserMenu,
                                onDismissRequest = { showUserMenu = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Logged as: ${currentUser.name}") },
                                    onClick = { }
                                )
                                DropdownMenuItem(
                                    text = { Text("Login ID: ${currentUser.loginId ?: "N/A"}") },
                                    onClick = { }
                                )
                                Divider()
                                DropdownMenuItem(
                                    text = { Text("Manage Accounts") },
                                    onClick = {
                                        showUserMenu = false
                                        onOpenManageUsers()
                                    }
                                )
                                DropdownMenuItem(
                                    text = { Text("Logout") },
                                    onClick = {
                                        showUserMenu = false
                                        viewModel.logout()
                                    }
                                )
                            }
                        }
                    } else {
                        Button(
                            onClick = onOpenAuth,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                        ) {
                            Text("Login")
                        }
                    }
                }
            }
        }
    }
}
