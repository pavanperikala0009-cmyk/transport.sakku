package com.vjpl.transportmileage

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.vjpl.transportmileage.ui.*

class MainActivity : ComponentActivity() {
    private val viewModel: AppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme {
                MainAppScreen(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainAppScreen(viewModel: AppViewModel) {
    val currentUser by viewModel.currentUser.collectAsState()
    val activeTab by viewModel.activeRibbonTab.collectAsState()
    val notifications by viewModel.notifications.collectAsState()
    val filteredRecords = viewModel.getFilteredRecords()
    val fleetVehicles by viewModel.fleetVehicles.collectAsState()
    val editingRecord by viewModel.editingRecord.collectAsState()
    val filters by viewModel.filters.collectAsState()
    val fuelStations by viewModel.fuelStations.collectAsState()
    val fuelLocations by viewModel.fuelLocations.collectAsState()
    val fuelVendors by viewModel.fuelVendors.collectAsState()
    val organizations by viewModel.organizations.collectAsState()
    val metrics = viewModel.getMetrics()

    var showAuthModal by remember { mutableStateOf(false) }
    var showNotifModal by remember { mutableStateOf(false) }
    var showCloudModal by remember { mutableStateOf(false) }
    var showFuelMasterModal by remember { mutableStateOf(false) }
    var showVehicleManagerModal by remember { mutableStateOf(false) }

    val unreadNotifCount = notifications.count { !it.read || it.status == "pending" }

    Scaffold(
        topBar = {
            Column {
                AppHeader(
                    viewModel = viewModel,
                    currentUser = currentUser,
                    unreadNotifCount = unreadNotifCount,
                    onOpenAuth = { showAuthModal = true },
                    onOpenManageUsers = { showAuthModal = true },
                    onOpenNotifications = { showNotifModal = true },
                    onOpenCloudModal = { showCloudModal = true }
                )
                TopRibbonNavigation(
                    activeTab = activeTab,
                    onTabSelected = { viewModel.setActiveRibbonTab(it) },
                    onNewTripClick = {
                        viewModel.setActiveRibbonTab("daily")
                        viewModel.setEditingRecord(null)
                    },
                    onOpenVehicleManager = { showVehicleManagerModal = true },
                    onOpenFuelMaster = { showFuelMasterModal = true },
                    onPrintPreview = { showCloudModal = true }
                )
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF1F5F9))
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            when (activeTab) {
                "daily" -> {
                    DashboardStats(metrics = metrics)
                    EntryForm(
                        viewModel = viewModel,
                        editingRecord = editingRecord,
                        fleetVehicles = fleetVehicles,
                        fuelStations = fuelStations,
                        fuelLocations = fuelLocations,
                        fuelVendors = fuelVendors,
                        organizations = organizations,
                        currentUser = currentUser,
                        onSave = { viewModel.saveRecord(it) },
                        onCancelEdit = { viewModel.setEditingRecord(null) }
                    )
                    SearchFilter(
                        filters = filters,
                        onFilterChange = { viewModel.setFilters(it) },
                        onResetFilters = { viewModel.resetFilters() }
                    )
                    RecordsTable(
                        records = filteredRecords,
                        currentUser = currentUser,
                        onEdit = { viewModel.setEditingRecord(it) },
                        onDelete = { viewModel.deleteRecord(it) }
                    )
                }
                "monthly" -> {
                    MonthWiseReportView(records = filteredRecords)
                }
                "fleet" -> {
                    FleetBreakdown(vehicles = fleetVehicles, records = filteredRecords)
                }
            }
        }
    }

    AuthModal(
        isOpen = showAuthModal,
        onClose = { showAuthModal = false },
        viewModel = viewModel
    )

    NotificationBellModal(
        isOpen = showNotifModal,
        onClose = { showNotifModal = false },
        notifications = notifications,
        onApproveTrip = { viewModel.approveTrip(it) },
        onRejectTrip = { viewModel.rejectTrip(it) },
        onDismissNotif = { viewModel.dismissNotification(it) }
    )

    CloudSyncModal(
        isOpen = showCloudModal,
        onClose = { showCloudModal = false },
        viewModel = viewModel
    )

    FuelMasterModal(
        isOpen = showFuelMasterModal,
        onClose = { showFuelMasterModal = false },
        viewModel = viewModel
    )

    VehicleManagerModal(
        isOpen = showVehicleManagerModal,
        onClose = { showVehicleManagerModal = false },
        viewModel = viewModel
    )
}
