package com.examiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalUsers;
    private Map<String, Long> usersByRole;
    private long totalExams;
    private long activeExams;
    private long certificatesIssued;
    private List<MonthlyGrowth> monthlyUserGrowth;
    private Map<String, Long> examsByStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyGrowth {
        private String month;
        private long count;
    }
}
