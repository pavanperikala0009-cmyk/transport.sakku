package com.vjpl.transportmileage

import org.junit.Assert.assertEquals
import org.junit.Test

class CalculationsTest {

    @Test
    fun testMileageCalculation() {
        val totalKm = 280.0
        val fuel = 65.0
        val expectedMileage = 4.31
        val actualMileage = String.format(java.util.Locale.US, "%.2f", totalKm / fuel).toDouble()
        assertEquals(expectedMileage, actualMileage, 0.01)
    }

    @Test
    fun testCostPerKmCalculation() {
        val totalKm = 280.0
        val totalAmount = 6370.0
        val expectedCost = 22.75
        val actualCost = String.format(java.util.Locale.US, "%.2f", totalAmount / totalKm).toDouble()
        assertEquals(expectedCost, actualCost, 0.01)
    }
}
