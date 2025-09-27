package com.franchisehub.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class BusinessDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private Long totalFranchises;
        private Long activeFranchises;
        private Long pendingFranchises;
        private Long totalApplications;
        private Long approvedApplications;
        private Long pendingApplications;
        private BigDecimal totalRevenue;
        private BigDecimal monthlyRevenue;
        private Double conversionRate;
    }
}
