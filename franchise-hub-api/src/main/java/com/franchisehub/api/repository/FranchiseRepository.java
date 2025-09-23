package com.franchisehub.api.repository;

import com.franchisehub.api.entity.Franchise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FranchiseRepository extends JpaRepository<Franchise, String> {

    List<Franchise> findByBusinessOwnerId(String businessOwnerId);

    Page<Franchise> findByBusinessOwnerId(String businessOwnerId, Pageable pageable);

    List<Franchise> findByStatus(Franchise.FranchiseStatus status);

    Page<Franchise> findByStatus(Franchise.FranchiseStatus status, Pageable pageable);

    List<Franchise> findByCategory(Franchise.FranchiseCategory category);

    Page<Franchise> findByCategory(Franchise.FranchiseCategory category, Pageable pageable);

    @Query("SELECT f FROM Franchise f WHERE f.status = 'ACTIVE' ORDER BY f.createdAt DESC")
    List<Franchise> findActiveFranchises();

    @Query("SELECT f FROM Franchise f WHERE f.status = 'ACTIVE' ORDER BY f.createdAt DESC")
    Page<Franchise> findActiveFranchises(Pageable pageable);

    @Query("SELECT f FROM Franchise f WHERE f.status = 'ACTIVE' ORDER BY f.createdAt DESC LIMIT :limit")
    List<Franchise> findFeaturedFranchises(@Param("limit") int limit);

    @Query("SELECT f FROM Franchise f WHERE " +
           "f.status = 'ACTIVE' AND " +
           "(LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.businessOwnerName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Franchise> searchActiveFranchises(@Param("search") String search, Pageable pageable);

    @Query("SELECT f FROM Franchise f WHERE " +
           "f.status = 'ACTIVE' AND " +
           "(:category IS NULL OR f.category = :category) AND " +
           "(:minInvestment IS NULL OR f.initialInvestment.min >= :minInvestment) AND " +
           "(:maxInvestment IS NULL OR f.initialInvestment.max <= :maxInvestment) AND " +
           "(:minFee IS NULL OR f.franchiseFee >= :minFee) AND " +
           "(:maxFee IS NULL OR f.franchiseFee <= :maxFee)")
    Page<Franchise> findWithFilters(
        @Param("category") Franchise.FranchiseCategory category,
        @Param("minInvestment") BigDecimal minInvestment,
        @Param("maxInvestment") BigDecimal maxInvestment,
        @Param("minFee") BigDecimal minFee,
        @Param("maxFee") BigDecimal maxFee,
        Pageable pageable
    );

    @Query("SELECT COUNT(f) FROM Franchise f WHERE f.businessOwnerId = :businessOwnerId AND f.status = 'ACTIVE'")
    long countActiveFranchisesByOwner(@Param("businessOwnerId") String businessOwnerId);

    @Query("SELECT COUNT(f) FROM Franchise f WHERE f.status = :status")
    long countByStatus(@Param("status") Franchise.FranchiseStatus status);

    @Query("SELECT COUNT(f) FROM Franchise f WHERE f.createdAt >= :since")
    long countFranchisesCreatedSince(@Param("since") LocalDateTime since);

    @Query("SELECT f.category, COUNT(f) FROM Franchise f WHERE f.status = 'ACTIVE' GROUP BY f.category")
    List<Object[]> getFranchiseCountByCategory();
}
