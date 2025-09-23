package com.franchisehub.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails {

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

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String company;

    private String avatar;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    private String location;
    
    private String website;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private Boolean isActive = true;

    private LocalDateTime lastLoginAt;

    @Embedded
    private UserPreferences preferences;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    public enum UserRole {
        BUSINESS, PARTNER, ADMIN
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPreferences {
        
        @Embedded
        @AttributeOverrides({
            @AttributeOverride(name = "email", column = @Column(name = "notification_email")),
            @AttributeOverride(name = "push", column = @Column(name = "notification_push")),
            @AttributeOverride(name = "sms", column = @Column(name = "notification_sms"))
        })
        private NotificationSettings notifications;
        
        @Enumerated(EnumType.STRING)
        private Theme theme = Theme.LIGHT;
        
        private String language = "en";
        
        private String timezone = "UTC";

        @Embeddable
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NotificationSettings {
            private Boolean email = true;
            private Boolean push = true;
            private Boolean sms = false;
        }

        public enum Theme {
            LIGHT, DARK
        }
    }
}
