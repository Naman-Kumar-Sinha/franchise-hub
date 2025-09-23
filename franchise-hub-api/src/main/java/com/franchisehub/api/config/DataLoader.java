package com.franchisehub.api.config;

import com.franchisehub.api.model.*;
import com.franchisehub.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FranchiseRepository franchiseRepository;
    private final ApplicationRepository applicationRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentRequestRepository paymentRequestRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Loading demo data...");
        loadDemoData();
        log.info("Demo data loaded successfully!");
    }

    private void loadDemoData() {
        // Create demo users
        User businessUser = createBusinessUser();
        User partnerUser = createPartnerUser();
        User adminUser = createAdminUser();

        userRepository.saveAll(Arrays.asList(businessUser, partnerUser, adminUser));

        // Create demo franchises
        Franchise chaayos = createChaayosFranchise(businessUser);
        Franchise subway = createSubwayFranchise(businessUser);

        franchiseRepository.saveAll(Arrays.asList(chaayos, subway));

        // Create demo applications
        Application application1 = createDemoApplication1(chaayos, partnerUser);
        Application application2 = createDemoApplication2(subway, partnerUser);

        applicationRepository.saveAll(Arrays.asList(application1, application2));

        // Create demo payment transactions
        PaymentTransaction transaction1 = createDemoTransaction1(chaayos, partnerUser, application1);
        PaymentTransaction transaction2 = createDemoTransaction2(subway, partnerUser, application2);

        paymentTransactionRepository.saveAll(Arrays.asList(transaction1, transaction2));

        // Create demo payment requests
        PaymentRequest request1 = createDemoPaymentRequest1(chaayos, businessUser, partnerUser, application1);
        PaymentRequest request2 = createDemoPaymentRequest2(subway, businessUser, partnerUser, application2);

        paymentRequestRepository.saveAll(Arrays.asList(request1, request2));

        // Create demo notifications
        List<Notification> notifications = createDemoNotifications(businessUser, partnerUser, chaayos, subway, application1, application2, request1, request2);
        notificationRepository.saveAll(notifications);
    }

    private User createBusinessUser() {
        User user = new User();
        user.setId("demo-business-user");
        user.setEmail("business@demo.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFirstName("Business");
        user.setLastName("Owner");
        user.setRole(User.UserRole.BUSINESS);
        user.setPhone("+91-9876543210");
        user.setCompany("Demo Business Corp");
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User.UserPreferences preferences = new User.UserPreferences();
        preferences.setNotifications(new User.UserPreferences.NotificationSettings(true, true, false));
        preferences.setTheme(User.UserPreferences.Theme.LIGHT);
        preferences.setLanguage("en");
        preferences.setTimezone("UTC");
        user.setPreferences(preferences);

        return user;
    }

    private User createPartnerUser() {
        User user = new User();
        user.setId("demo-partner-user");
        user.setEmail("partner@demo.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFirstName("Partner");
        user.setLastName("Investor");
        user.setRole(User.UserRole.PARTNER);
        user.setPhone("+91-9876543211");
        user.setCompany("Demo Investment Group");
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User.UserPreferences preferences = new User.UserPreferences();
        preferences.setNotifications(new User.UserPreferences.NotificationSettings(true, false, true));
        preferences.setTheme(User.UserPreferences.Theme.DARK);
        preferences.setLanguage("en");
        preferences.setTimezone("UTC");
        user.setPreferences(preferences);

        return user;
    }

    private User createAdminUser() {
        User user = new User();
        user.setId("demo-admin-user");
        user.setEmail("admin@demo.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFirstName("Admin");
        user.setLastName("User");
        user.setRole(User.UserRole.ADMIN);
        user.setPhone("+91-9876543212");
        user.setCompany("FranchiseHub Platform");
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User.UserPreferences preferences = new User.UserPreferences();
        preferences.setNotifications(new User.UserPreferences.NotificationSettings(true, true, true));
        preferences.setTheme(User.UserPreferences.Theme.LIGHT);
        preferences.setLanguage("en");
        preferences.setTimezone("UTC");
        user.setPreferences(preferences);

        return user;
    }

    private Franchise createChaayosFranchise(User businessUser) {
        Franchise franchise = new Franchise();
        franchise.setId("franchise-1");
        franchise.setName("Chaayos");
        franchise.setBusinessOwnerId(businessUser.getId());
        franchise.setBusinessOwnerName(businessUser.getFirstName() + " " + businessUser.getLastName());
        franchise.setCategory(Franchise.FranchiseCategory.FOOD_BEVERAGE);
        franchise.setStatus(Franchise.FranchiseStatus.ACTIVE);
        franchise.setDescription("India's largest chai cafe chain offering premium tea experiences with innovative brewing technology and cozy ambiance.");
        franchise.setLogo("https://example.com/chaayos-logo.png");
        franchise.setYearEstablished(2012);
        franchise.setTotalUnits(200);
        franchise.setFranchisedUnits(180);
        franchise.setCompanyOwnedUnits(20);

        // Financial information
        franchise.setFranchiseFee(new BigDecimal("500000"));
        franchise.setRoyaltyFee(new BigDecimal("6.0"));
        franchise.setMarketingFee(new BigDecimal("2.0"));
        
        Franchise.InvestmentRange investmentRange = new Franchise.InvestmentRange();
        investmentRange.setMin(new BigDecimal("1500000"));
        investmentRange.setMax(new BigDecimal("2500000"));
        franchise.setInitialInvestment(investmentRange);
        
        franchise.setLiquidCapitalRequired(new BigDecimal("800000"));
        franchise.setNetWorthRequired(new BigDecimal("2000000"));

        // Requirements
        Franchise.FranchiseRequirements requirements = new Franchise.FranchiseRequirements();
        requirements.setEducation("Graduate degree preferred");
        requirements.setExperience("2+ years in food service or retail management");
        requirements.setCreditScore(650);
        requirements.setBackground(Arrays.asList("Clean criminal record", "Food service experience"));
        franchise.setRequirements(requirements);

        // Support
        Franchise.TrainingSupport trainingSupport = new Franchise.TrainingSupport();
        trainingSupport.setTrainingLocation("Mumbai, India");
        trainingSupport.setInitialTrainingDays(21);
        trainingSupport.setOngoingSupport(true);
        trainingSupport.setSupportDescription("Comprehensive training, marketing support, and operational guidance");
        franchise.setTrainingSupport(trainingSupport);

        // Marketing
        Franchise.MarketingSupport marketingSupport = new Franchise.MarketingSupport();
        marketingSupport.setNationalAdvertising(true);
        marketingSupport.setLocalMarketingSupport(true);
        marketingSupport.setDigitalMarketing(true);
        marketingSupport.setMarketingDescription("National brand campaigns, local marketing support, and digital presence");
        franchise.setMarketingSupport(marketingSupport);

        // Performance
        Franchise.PerformanceMetrics performanceMetrics = new Franchise.PerformanceMetrics();
        performanceMetrics.setAverageRevenue(new BigDecimal("85.5"));
        performanceMetrics.setProfitMargin(new BigDecimal("18.2"));
        performanceMetrics.setGrowthRate(new BigDecimal("25.0"));
        performanceMetrics.setSatisfactionScore(new BigDecimal("4.3"));
        franchise.setPerformanceMetrics(performanceMetrics);

        // Territory
        franchise.setAvailableStates(Arrays.asList("Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat"));
        franchise.setAvailableTerritories(Arrays.asList("Mumbai", "Delhi NCR", "Bangalore", "Chennai", "Pune"));
        franchise.setImages(Arrays.asList(
            "https://example.com/chaayos-1.jpg",
            "https://example.com/chaayos-2.jpg",
            "https://example.com/chaayos-3.jpg"
        ));

        franchise.setCreatedAt(LocalDateTime.now());
        franchise.setUpdatedAt(LocalDateTime.now());

        return franchise;
    }

    private Franchise createSubwayFranchise(User businessUser) {
        Franchise franchise = new Franchise();
        franchise.setId("franchise-2");
        franchise.setName("Subway");
        franchise.setBusinessOwnerId(businessUser.getId());
        franchise.setBusinessOwnerName(businessUser.getFirstName() + " " + businessUser.getLastName());
        franchise.setCategory(Franchise.FranchiseCategory.FOOD_BEVERAGE);
        franchise.setStatus(Franchise.FranchiseStatus.ACTIVE);
        franchise.setDescription("World's largest submarine sandwich franchise with fresh ingredients and customizable healthy options.");
        franchise.setLogo("https://example.com/subway-logo.png");
        franchise.setYearEstablished(1965);
        franchise.setTotalUnits(37000);
        franchise.setFranchisedUnits(36500);
        franchise.setCompanyOwnedUnits(500);

        // Financial information
        franchise.setFranchiseFee(new BigDecimal("750000"));
        franchise.setRoyaltyFee(new BigDecimal("8.0"));
        franchise.setMarketingFee(new BigDecimal("4.5"));
        
        Franchise.InvestmentRange investmentRange = new Franchise.InvestmentRange();
        investmentRange.setMin(new BigDecimal("2000000"));
        investmentRange.setMax(new BigDecimal("3500000"));
        franchise.setInitialInvestment(investmentRange);
        
        franchise.setLiquidCapitalRequired(new BigDecimal("1200000"));
        franchise.setNetWorthRequired(new BigDecimal("3000000"));

        // Requirements
        Franchise.FranchiseRequirements requirements = new Franchise.FranchiseRequirements();
        requirements.setEducation("High school diploma minimum, business degree preferred");
        requirements.setExperience("Restaurant or retail management experience preferred");
        requirements.setCreditScore(700);
        requirements.setBackground(Arrays.asList("Clean background check", "Financial stability"));
        franchise.setRequirements(requirements);

        // Support
        Franchise.TrainingSupport trainingSupport = new Franchise.TrainingSupport();
        trainingSupport.setTrainingLocation("Various locations");
        trainingSupport.setInitialTrainingDays(14);
        trainingSupport.setOngoingSupport(true);
        trainingSupport.setSupportDescription("Two weeks of training, ongoing operational support, and marketing assistance");
        franchise.setTrainingSupport(trainingSupport);

        // Marketing
        Franchise.MarketingSupport marketingSupport = new Franchise.MarketingSupport();
        marketingSupport.setNationalAdvertising(true);
        marketingSupport.setLocalMarketingSupport(true);
        marketingSupport.setDigitalMarketing(true);
        marketingSupport.setMarketingDescription("Global brand recognition, national advertising campaigns, and local marketing support");
        franchise.setMarketingSupport(marketingSupport);

        // Performance
        Franchise.PerformanceMetrics performanceMetrics = new Franchise.PerformanceMetrics();
        performanceMetrics.setAverageRevenue(new BigDecimal("92.3"));
        performanceMetrics.setProfitMargin(new BigDecimal("15.8"));
        performanceMetrics.setGrowthRate(new BigDecimal("12.5"));
        performanceMetrics.setSatisfactionScore(new BigDecimal("4.1"));
        franchise.setPerformanceMetrics(performanceMetrics);

        // Territory
        franchise.setAvailableStates(Arrays.asList("All States", "Union Territories"));
        franchise.setAvailableTerritories(Arrays.asList("Metro Cities", "Tier 1 Cities", "Tier 2 Cities"));
        franchise.setImages(Arrays.asList(
            "https://example.com/subway-1.jpg",
            "https://example.com/subway-2.jpg",
            "https://example.com/subway-3.jpg"
        ));

        franchise.setCreatedAt(LocalDateTime.now());
        franchise.setUpdatedAt(LocalDateTime.now());

        return franchise;
    }

    private Application createDemoApplication1(Franchise franchise, User applicant) {
        Application application = new Application();
        application.setId("application-1");
        application.setFranchiseId(franchise.getId());
        application.setFranchiseName(franchise.getName());
        application.setApplicantId(applicant.getId());
        application.setApplicantName(applicant.getFirstName() + " " + applicant.getLastName());
        application.setApplicantEmail(applicant.getEmail());
        application.setStatus(Application.ApplicationStatus.UNDER_REVIEW);
        application.setPaymentStatus(Application.PaymentStatus.PAID);
        application.setApplicationFee(new BigDecimal("25000"));
        application.setSubmittedAt(LocalDateTime.now().minusDays(5));
        application.setIsActive(true);

        // Personal Information
        Application.PersonalInfo personalInfo = new Application.PersonalInfo();
        personalInfo.setFirstName("Partner");
        personalInfo.setLastName("Investor");
        personalInfo.setEmail("partner@demo.com");
        personalInfo.setPhone("+91-9876543211");
        personalInfo.setDateOfBirth("1985-06-15");
        personalInfo.setSsn("XXX-XX-1234");
        personalInfo.setEmergencyContactName("John Investor");
        personalInfo.setEmergencyContactPhone("+91-9876543213");

        // Personal Address
        Application.Address personalAddress = new Application.Address();
        personalAddress.setStreet("123 Business Street");
        personalAddress.setCity("Mumbai");
        personalAddress.setState("Maharashtra");
        personalAddress.setZipCode("400001");
        personalAddress.setCountry("India");
        personalInfo.setAddress(personalAddress);
        application.setPersonalInfo(personalInfo);

        // Financial Information
        Application.FinancialInfo financialInfo = new Application.FinancialInfo();
        financialInfo.setNetWorth(new BigDecimal("2500000"));
        financialInfo.setLiquidAssets(new BigDecimal("1000000"));
        financialInfo.setAnnualIncome(new BigDecimal("1200000"));
        financialInfo.setCreditScore(720);
        financialInfo.setHasDebt(true);
        financialInfo.setDebtAmount(new BigDecimal("500000"));
        financialInfo.setInvestmentSource("Personal savings and bank loan");
        application.setFinancialInfo(financialInfo);

        // Business Information
        Application.BusinessInfo businessInfo = new Application.BusinessInfo();
        businessInfo.setFullTimeCommitment(true);
        businessInfo.setHasPartners(false);
        businessInfo.setTimelineToOpen("3-6 months");
        businessInfo.setPreferredStates(Arrays.asList("Maharashtra", "Gujarat"));

        // Preferred Location
        Application.Address preferredAddress = new Application.Address();
        preferredAddress.setStreet("456 Commercial Area");
        preferredAddress.setCity("Mumbai");
        preferredAddress.setState("Maharashtra");
        preferredAddress.setZipCode("400002");
        preferredAddress.setCountry("India");
        businessInfo.setPreferredLocation(preferredAddress);
        application.setBusinessInfo(businessInfo);

        // Additional Information
        application.setMotivation("Passionate about the food industry and want to build a successful franchise business");
        application.setQuestions("What kind of ongoing support is provided for marketing?");
        application.setPaymentTransactionId("transaction-1");
        application.setPaidAt(LocalDateTime.now().minusDays(5));

        return application;
    }

    private Application createDemoApplication2(Franchise franchise, User applicant) {
        Application application = new Application();
        application.setId("application-2");
        application.setFranchiseId(franchise.getId());
        application.setFranchiseName(franchise.getName());
        application.setApplicantId(applicant.getId());
        application.setApplicantName(applicant.getFirstName() + " " + applicant.getLastName());
        application.setApplicantEmail(applicant.getEmail());
        application.setStatus(Application.ApplicationStatus.SUBMITTED);
        application.setPaymentStatus(Application.PaymentStatus.PENDING);
        application.setApplicationFee(new BigDecimal("30000"));
        application.setSubmittedAt(LocalDateTime.now().minusDays(2));
        application.setIsActive(true);

        // Personal Information
        Application.PersonalInfo personalInfo = new Application.PersonalInfo();
        personalInfo.setFirstName("Partner");
        personalInfo.setLastName("Investor");
        personalInfo.setEmail("partner@demo.com");
        personalInfo.setPhone("+91-9876543211");
        personalInfo.setDateOfBirth("1985-06-15");
        personalInfo.setSsn("XXX-XX-1234");
        personalInfo.setEmergencyContactName("Jane Investor");
        personalInfo.setEmergencyContactPhone("+91-9876543214");

        // Personal Address
        Application.Address personalAddress = new Application.Address();
        personalAddress.setStreet("123 Business Street");
        personalAddress.setCity("Delhi");
        personalAddress.setState("Delhi");
        personalAddress.setZipCode("110001");
        personalAddress.setCountry("India");
        personalInfo.setAddress(personalAddress);
        application.setPersonalInfo(personalInfo);

        // Financial Information
        Application.FinancialInfo financialInfo = new Application.FinancialInfo();
        financialInfo.setNetWorth(new BigDecimal("3500000"));
        financialInfo.setLiquidAssets(new BigDecimal("1500000"));
        financialInfo.setAnnualIncome(new BigDecimal("1500000"));
        financialInfo.setCreditScore(750);
        financialInfo.setHasDebt(false);
        financialInfo.setInvestmentSource("Personal savings");
        application.setFinancialInfo(financialInfo);

        // Business Information
        Application.BusinessInfo businessInfo = new Application.BusinessInfo();
        businessInfo.setFullTimeCommitment(true);
        businessInfo.setHasPartners(true);
        businessInfo.setPartnerDetails("Business partner with 10 years restaurant experience");
        businessInfo.setTimelineToOpen("6-12 months");
        businessInfo.setPreferredStates(Arrays.asList("Delhi", "Haryana"));

        // Preferred Location
        Application.Address preferredAddress = new Application.Address();
        preferredAddress.setStreet("789 Mall Road");
        preferredAddress.setCity("Delhi");
        preferredAddress.setState("Delhi");
        preferredAddress.setZipCode("110002");
        preferredAddress.setCountry("India");
        businessInfo.setPreferredLocation(preferredAddress);
        application.setBusinessInfo(businessInfo);

        // Additional Information
        application.setMotivation("Expanding existing restaurant business into franchise model");

        return application;
    }

    private PaymentTransaction createDemoTransaction1(Franchise franchise, User user, Application application) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setId("transaction-1");
        transaction.setUserId(user.getId());
        transaction.setFranchiseId(franchise.getId());
        transaction.setApplicationId(application.getId());
        transaction.setAmount(new BigDecimal("25000"));
        transaction.setCurrency("INR");
        transaction.setMethod(PaymentTransaction.PaymentMethod.UPI);
        transaction.setStatus(PaymentTransaction.TransactionStatus.SUCCESS);
        transaction.setType(PaymentTransaction.TransactionType.APPLICATION_FEE);
        transaction.setDescription("Application fee payment for " + franchise.getName());
        transaction.setPlatformFee(new BigDecimal("500"));
        transaction.setNetAmount(new BigDecimal("24500"));
        transaction.setCreatedAt(LocalDateTime.now().minusDays(5));
        transaction.setProcessedAt(LocalDateTime.now().minusDays(5));
        transaction.setGatewayTransactionId("txn_" + System.currentTimeMillis());

        // Payment Details
        PaymentTransaction.PaymentDetails paymentDetails = new PaymentTransaction.PaymentDetails();
        paymentDetails.setUpiId("partner@paytm");
        paymentDetails.setUpiTransactionId("UPI" + System.currentTimeMillis());
        transaction.setPaymentDetails(paymentDetails);

        return transaction;
    }

    private PaymentTransaction createDemoTransaction2(Franchise franchise, User user, Application application) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setId("transaction-2");
        transaction.setUserId(user.getId());
        transaction.setFranchiseId(franchise.getId());
        transaction.setApplicationId(application.getId());
        transaction.setAmount(new BigDecimal("30000"));
        transaction.setCurrency("INR");
        transaction.setMethod(PaymentTransaction.PaymentMethod.CREDIT_CARD);
        transaction.setStatus(PaymentTransaction.TransactionStatus.PENDING);
        transaction.setType(PaymentTransaction.TransactionType.APPLICATION_FEE);
        transaction.setDescription("Application fee payment for " + franchise.getName());
        transaction.setPlatformFee(new BigDecimal("600"));
        transaction.setNetAmount(new BigDecimal("29400"));
        transaction.setCreatedAt(LocalDateTime.now().minusDays(2));
        transaction.setGatewayTransactionId("txn_" + System.currentTimeMillis());

        // Payment Details
        PaymentTransaction.PaymentDetails paymentDetails = new PaymentTransaction.PaymentDetails();
        paymentDetails.setCardLast4("1234");
        paymentDetails.setCardNetwork("VISA");
        paymentDetails.setCardType("CREDIT");
        transaction.setPaymentDetails(paymentDetails);

        return transaction;
    }

    private PaymentRequest createDemoPaymentRequest1(Franchise franchise, User fromUser, User toUser, Application application) {
        PaymentRequest request = new PaymentRequest();
        request.setId("payment-request-1");
        request.setFromUserId(fromUser.getId());
        request.setToUserId(toUser.getId());
        request.setFranchiseId(franchise.getId());
        request.setApplicationId(application.getId());
        request.setTitle("Application Fee Payment");
        request.setDescription("Payment required for franchise application processing");
        request.setAmount(new BigDecimal("25000"));
        request.setCurrency("INR");
        request.setType(PaymentRequest.PaymentRequestType.APPLICATION_FEE);
        request.setStatus(PaymentRequest.PaymentRequestStatus.PAID);
        request.setDueDate(LocalDateTime.now().plusDays(7));
        request.setCreatedAt(LocalDateTime.now().minusDays(5));
        request.setPaidAt(LocalDateTime.now().minusDays(5));
        request.setPaymentTransactionId("transaction-1");
        request.setPaymentMethod(PaymentRequest.PaymentMethod.UPI);
        return request;
    }

    private PaymentRequest createDemoPaymentRequest2(Franchise franchise, User fromUser, User toUser, Application application) {
        PaymentRequest request = new PaymentRequest();
        request.setId("payment-request-2");
        request.setFromUserId(fromUser.getId());
        request.setToUserId(toUser.getId());
        request.setFranchiseId(franchise.getId());
        request.setApplicationId(application.getId());
        request.setTitle("Application Fee Payment");
        request.setDescription("Payment required for franchise application processing");
        request.setAmount(new BigDecimal("30000"));
        request.setCurrency("INR");
        request.setType(PaymentRequest.PaymentRequestType.APPLICATION_FEE);
        request.setStatus(PaymentRequest.PaymentRequestStatus.PENDING);
        request.setDueDate(LocalDateTime.now().plusDays(5));
        request.setCreatedAt(LocalDateTime.now().minusDays(2));
        request.setRemindersSent(1);
        request.setLastReminderSent(LocalDateTime.now().minusDays(1));
        return request;
    }

    private List<Notification> createDemoNotifications(User businessUser, User partnerUser, Franchise chaayos, Franchise subway,
                                                      Application application1, Application application2,
                                                      PaymentRequest request1, PaymentRequest request2) {
        List<Notification> notifications = Arrays.asList(
            createNotification("notif-1", businessUser.getId(), "New Application Received",
                "A new franchise application has been submitted for " + chaayos.getName(),
                Notification.NotificationType.APPLICATION_UPDATE, Notification.NotificationPriority.HIGH,
                application1.getId(), chaayos.getId(), null),

            createNotification("notif-2", partnerUser.getId(), "Payment Request",
                "Payment required for your franchise application",
                Notification.NotificationType.PAYMENT_REQUEST, Notification.NotificationPriority.URGENT,
                application1.getId(), chaayos.getId(), request1.getId()),

            createNotification("notif-3", businessUser.getId(), "Application Under Review",
                "Your application for " + subway.getName() + " is being reviewed",
                Notification.NotificationType.APPLICATION_UPDATE, Notification.NotificationPriority.MEDIUM,
                application2.getId(), subway.getId(), null),

            createNotification("notif-4", partnerUser.getId(), "Welcome to FranchiseHub",
                "Welcome to the FranchiseHub platform! Start exploring franchise opportunities.",
                Notification.NotificationType.SYSTEM_ALERT, Notification.NotificationPriority.LOW,
                null, null, null)
        );
        return notifications;
    }

    private Notification createNotification(String id, String userId, String title, String message,
                                          Notification.NotificationType type, Notification.NotificationPriority priority,
                                          String applicationId, String franchiseId, String paymentRequestId) {
        Notification notification = new Notification();
        notification.setId(id);
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setPriority(priority);
        notification.setStatus(Notification.NotificationStatus.UNREAD);
        notification.setApplicationId(applicationId);
        notification.setFranchiseId(franchiseId);
        notification.setPaymentRequestId(paymentRequestId);
        notification.setCreatedAt(LocalDateTime.now().minusDays(1));
        return notification;
    }
}
