# Backend Code Walkthrough: Spring Boot

This explains the Java code changes required to store the new profile data.

## 1. `User.java` (The Entity)
File: `backend/src/main/java/com/neurofleetx/backend/model/User.java`

This class defines the "Schema" of our database table.

```java
@Entity
@Table(name = "users")
public class User implements UserDetails {
    // ... existing fields like id, email, password ...

    // --- NEW FIELDS ADDED ---
    
    // 1. Simple Strings for basic info
    private String mobileNumber;
    private String address;
    private String aadhaarNumber;
    private String panNumber;
    private String drivingLicenseNumber;

    // 2. Large Text Fields (@Column(length = 2000))
    // By default, strings are VARCHAR(255). 
    // We increased the length to 2000 because JSON data can be long.
    @Column(length = 2000)
    private String vehicleInformation; 

    @Column(length = 2000)
    private String memberDetails;
}
```
- **Why `@Column(length = 2000)`?**: Standard columns hold 255 characters. Since "Vehicle Information" might contain complex data like `{"model": "Truck", "plate": "KA-01...", "capacity": "10T"}`, we need more space. This annotation tells Hibernate to create a `VARCHAR(2000)` column in MySQL.

## 2. `UpdateProfileRequest.java` (The DTO)
File: `backend/src/main/java/com/neurofleetx/backend/controller/auth/UpdateProfileRequest.java`

This acts as a strict "Menu" of what can be ordered (updated).

```java
@Data
public class UpdateProfileRequest {
    // We explicitly list ONLY the fields allowed for update.
    // Notice we do NOT include 'id', 'role', or 'password' here.
    // This is for security.
    private String mobileNumber;
    private String address;
    private String aadhaarNumber;
    private String panNumber;
    private String drivingLicenseNumber;
    private String vehicleInformation;
    private String memberDetails;
    // ...
}
```

## 3. `UserService.java` (The Logic)
File: `backend/src/main/java/com/neurofleetx/backend/service/UserService.java`

This logic executes when the frontend sends the "Save" request.

```java
public User updateProfile(String email, UpdateProfileRequest request) {
    // 1. Find the user in the database
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // 2. Selective Updates (Line by Line)
    
    // Check if the request has a mobile number.
    if (request.getMobileNumber() != null) {
        // If yes, update the user entity.
        user.setMobileNumber(request.getMobileNumber());
    }

    if (request.getAddress() != null) {
        user.setAddress(request.getAddress());
    }

    // ... same pattern for all other fields ...

    if (request.getVehicleInformation() != null) {
        user.setVehicleInformation(request.getVehicleInformation());
    }

    // 3. Save to Database
    // This methods triggers the SQL UPDATE query.
    return userRepository.save(user); 
}
```
- **`if (value != null)` check**: This is crucial. If the user only wants to update their Phone Number, they might send a request with just `{ "mobileNumber": "123" }`. The other fields in the request will be `null`. If we didn't check for null, we might accidentally overwrite existing database data with empty values.

## Summary of Data Flow
1.  **Frontend**: User enters "123 Main St" into `ProfileCard.jsx`.
2.  **State**: `formData.address` becomes "123 Main St".
3.  **API Call**: Frontend sends POST `{ "address": "123 Main St", ... }`.
4.  **DTO**: `UpdateProfileRequest` is created with `address="123 Main St"`.
5.  **Service**: `updateProfile` sees `request.getAddress()` is not null. It sets `user.setAddress(...)`.
6.  **Database**: `userRepository.save(user)` commits "123 Main St" to the MySQL table.
