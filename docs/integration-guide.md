# FranchiseHub API Integration Guide

## 🎯 Overview

This guide provides comprehensive instructions for integrating with the FranchiseHub REST API, including Spring Boot backend implementation and frontend integration patterns.

## 🏗️ Backend Implementation (Spring Boot)

### Project Setup

```xml
<!-- pom.xml dependencies -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.0.2</version>
    </dependency>
</dependencies>
```

### Entity Models

```java
// User Entity
@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    private String phone;
    private String company;
    private String avatar;
    private String bio;
    private String location;
    private String website;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private boolean isActive = true;
    private LocalDateTime lastLoginAt;
    
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserPreferences preferences;
    
    // Constructors, getters, setters
}

// Franchise Entity
@Entity
@Table(name = "franchises")
public class Franchise {
    @Id
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 2000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    private FranchiseCategory category;
    
    @Enumerated(EnumType.STRING)
    private FranchiseStatus status;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_owner_id")
    private User businessOwner;
    
    private String logo;
    
    @ElementCollection
    @CollectionTable(name = "franchise_images")
    private List<String> images;
    
    // Financial fields
    private BigDecimal franchiseFee;
    private BigDecimal royaltyFee;
    private BigDecimal marketingFee;
    private BigDecimal initialInvestmentMin;
    private BigDecimal initialInvestmentMax;
    private BigDecimal liquidCapitalRequired;
    private BigDecimal netWorthRequired;
    
    // Business details
    private Integer yearEstablished;
    private Integer totalUnits;
    private Integer franchisedUnits;
    private Integer companyOwnedUnits;
    
    @Embedded
    private FranchiseRequirements requirements;
    
    @Embedded
    private FranchiseSupport support;
    
    @ElementCollection
    @CollectionTable(name = "franchise_territories")
    private List<String> territories;
    
    @ElementCollection
    @CollectionTable(name = "franchise_states")
    private List<String> availableStates;
    
    private boolean internationalOpportunities;
    
    @Embedded
    private ContactInfo contactInfo;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private boolean isActive = true;
    private boolean isFeatured = false;
    private Long viewCount = 0L;
    private Long applicationCount = 0L;
    private BigDecimal rating = BigDecimal.ZERO;
    private Long reviewCount = 0L;
    
    // Constructors, getters, setters
}
```

### Repository Layer

```java
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByIsActiveTrue();
}

@Repository
public interface FranchiseRepository extends JpaRepository<Franchise, String> {
    List<Franchise> findByBusinessOwner(User businessOwner);
    List<Franchise> findByCategory(FranchiseCategory category);
    List<Franchise> findByStatusAndIsActiveTrue(FranchiseStatus status);
    
    @Query("SELECT f FROM Franchise f WHERE " +
           "(:category IS NULL OR f.category = :category) AND " +
           "(:minInvestment IS NULL OR f.initialInvestmentMin >= :minInvestment) AND " +
           "(:maxInvestment IS NULL OR f.initialInvestmentMax <= :maxInvestment) AND " +
           "f.isActive = true")
    Page<Franchise> findWithFilters(
        @Param("category") FranchiseCategory category,
        @Param("minInvestment") BigDecimal minInvestment,
        @Param("maxInvestment") BigDecimal maxInvestment,
        Pageable pageable
    );
}
```

### Service Layer

```java
@Service
@Transactional
public class FranchiseService {
    
    @Autowired
    private FranchiseRepository franchiseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Page<Franchise> getFranchises(FranchiseSearchFilters filters, Pageable pageable) {
        return franchiseRepository.findWithFilters(
            filters.getCategory(),
            filters.getMinInvestment(),
            filters.getMaxInvestment(),
            pageable
        );
    }
    
    public Franchise createFranchise(FranchiseCreateData createData, String businessOwnerId) {
        User businessOwner = userRepository.findById(businessOwnerId)
            .orElseThrow(() -> new EntityNotFoundException("Business owner not found"));
            
        if (businessOwner.getRole() != UserRole.BUSINESS) {
            throw new AccessDeniedException("Only business owners can create franchises");
        }
        
        Franchise franchise = new Franchise();
        // Map createData to franchise entity
        franchise.setId(UUID.randomUUID().toString());
        franchise.setName(createData.getName());
        franchise.setDescription(createData.getDescription());
        franchise.setCategory(createData.getCategory());
        franchise.setBusinessOwner(businessOwner);
        // ... map other fields
        
        return franchiseRepository.save(franchise);
    }
    
    public Franchise updateFranchise(String franchiseId, FranchiseCreateData updateData, String userId) {
        Franchise franchise = franchiseRepository.findById(franchiseId)
            .orElseThrow(() -> new EntityNotFoundException("Franchise not found"));
            
        if (!franchise.getBusinessOwner().getId().equals(userId)) {
            throw new AccessDeniedException("You can only update your own franchises");
        }
        
        // Update franchise fields
        franchise.setName(updateData.getName());
        franchise.setDescription(updateData.getDescription());
        // ... update other fields
        
        return franchiseRepository.save(franchise);
    }
}
```

### Controller Layer

```java
@RestController
@RequestMapping("/api/v1/franchises")
@Validated
public class FranchiseController {
    
    @Autowired
    private FranchiseService franchiseService;
    
    @GetMapping
    public ResponseEntity<PagedResponse<Franchise>> getFranchises(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) FranchiseCategory category,
            @RequestParam(required = false) BigDecimal minInvestment,
            @RequestParam(required = false) BigDecimal maxInvestment,
            @RequestParam(required = false) String states,
            @RequestParam(required = false) String keywords,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        
        FranchiseSearchFilters filters = FranchiseSearchFilters.builder()
            .category(category)
            .minInvestment(minInvestment)
            .maxInvestment(maxInvestment)
            .states(states != null ? Arrays.asList(states.split(",")) : null)
            .keywords(keywords)
            .sortBy(sortBy)
            .sortOrder(sortOrder)
            .build();
            
        Pageable pageable = PageRequest.of(page - 1, limit, 
            Sort.by(Sort.Direction.fromString(sortOrder), sortBy));
            
        Page<Franchise> franchisePage = franchiseService.getFranchises(filters, pageable);
        
        PagedResponse<Franchise> response = PagedResponse.<Franchise>builder()
            .data(franchisePage.getContent())
            .pagination(PaginationInfo.from(franchisePage))
            .build();
            
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<Franchise> createFranchise(
            @Valid @RequestBody FranchiseCreateData createData,
            Authentication authentication) {
        
        String userId = authentication.getName();
        Franchise franchise = franchiseService.createFranchise(createData, userId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(franchise);
    }
    
    @GetMapping("/{franchiseId}")
    public ResponseEntity<Franchise> getFranchiseById(@PathVariable String franchiseId) {
        Franchise franchise = franchiseService.getFranchiseById(franchiseId);
        return ResponseEntity.ok(franchise);
    }
}
```

## 🔐 Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    
    @Autowired
    private JwtRequestFilter jwtRequestFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/franchises/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
            
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

## 🔗 Frontend Integration

### Angular Service Integration

```typescript
// franchise.service.ts
@Injectable({
  providedIn: 'root'
})
export class FranchiseApiService {
  private readonly baseUrl = environment.apiUrl + '/franchises';

  constructor(private http: HttpClient) {}

  getFranchises(filters: FranchiseSearchFilters): Observable<PagedResponse<Franchise>> {
    const params = this.buildQueryParams(filters);
    return this.http.get<PagedResponse<Franchise>>(this.baseUrl, { params });
  }

  createFranchise(franchiseData: FranchiseCreateData): Observable<Franchise> {
    return this.http.post<Franchise>(this.baseUrl, franchiseData);
  }

  getFranchiseById(id: string): Observable<Franchise> {
    return this.http.get<Franchise>(`${this.baseUrl}/${id}`);
  }

  updateFranchise(id: string, franchiseData: FranchiseCreateData): Observable<Franchise> {
    return this.http.put<Franchise>(`${this.baseUrl}/${id}`, franchiseData);
  }

  deleteFranchise(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private buildQueryParams(filters: FranchiseSearchFilters): HttpParams {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.category) params = params.set('category', filters.category);
    if (filters.minInvestment) params = params.set('minInvestment', filters.minInvestment.toString());
    if (filters.maxInvestment) params = params.set('maxInvestment', filters.maxInvestment.toString());
    if (filters.states?.length) params = params.set('states', filters.states.join(','));
    if (filters.keywords) params = params.set('keywords', filters.keywords);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    
    return params;
  }
}
```

### HTTP Interceptor for Authentication

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}
```

## 📊 Testing Strategy

### Unit Tests

```java
@ExtendWith(MockitoExtension.class)
class FranchiseServiceTest {
    
    @Mock
    private FranchiseRepository franchiseRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private FranchiseService franchiseService;
    
    @Test
    void createFranchise_ValidData_ReturnsFranchise() {
        // Given
        String businessOwnerId = "business-1";
        User businessOwner = createBusinessOwner(businessOwnerId);
        FranchiseCreateData createData = createValidFranchiseData();
        
        when(userRepository.findById(businessOwnerId)).thenReturn(Optional.of(businessOwner));
        when(franchiseRepository.save(any(Franchise.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        Franchise result = franchiseService.createFranchise(createData, businessOwnerId);
        
        // Then
        assertThat(result.getName()).isEqualTo(createData.getName());
        assertThat(result.getBusinessOwner()).isEqualTo(businessOwner);
        verify(franchiseRepository).save(any(Franchise.class));
    }
}
```

### Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class FranchiseControllerIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:13")
            .withDatabaseName("franchisehub_test")
            .withUsername("test")
            .withPassword("test");
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void getFranchises_NoFilters_ReturnsPagedResponse() {
        // When
        ResponseEntity<PagedResponse> response = restTemplate.getForEntity(
            "/api/v1/franchises", PagedResponse.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).isNotEmpty();
    }
}
```

## 🚀 Deployment Considerations

### Docker Configuration

```dockerfile
# Dockerfile for Spring Boot API
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/franchise-hub-api-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Environment Configuration

```yaml
# application-prod.yml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  
  security:
    jwt:
      secret: ${JWT_SECRET}
      expiration: 86400000

server:
  port: 8080

logging:
  level:
    com.franchisehub: INFO
    org.springframework.security: WARN
```

This integration guide provides a comprehensive foundation for implementing the FranchiseHub API using Spring Boot and integrating it with the Angular frontend.
