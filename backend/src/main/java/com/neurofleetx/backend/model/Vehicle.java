package com.neurofleetx.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    private String name;
    private String type;
    private String status; // Idle, In Use, Needs Service

    private Integer seats;
    private String fuelType; // Electric, Petrol, Diesel

    // Telemetry
    private Double battery;
    private Double speed;
    private Double latitude;
    private Double longitude;

    private LocalDateTime lastUpdate;

    // Simulation Fields
    private Double distanceSinceService;
    private Double totalDistance;

    public Vehicle() {
        this.battery = 100.0;
        this.speed = 0.0;
        this.distanceSinceService = 0.0;
        this.totalDistance = 0.0;
        this.lastUpdate = LocalDateTime.now();
    }

    public Vehicle(String name, String type, String status, Double latitude, Double longitude) {
        this.name = name;
        this.type = type;
        this.status = status;
        this.latitude = latitude;
        this.longitude = longitude;
        this.battery = 100.0;
        this.speed = 0.0;
        this.distanceSinceService = 0.0;
        this.totalDistance = 0.0;
        this.lastUpdate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getDriver() {
        return driver;
    }

    public void setDriver(User driver) {
        this.driver = driver;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getBattery() {
        return battery;
    }

    public void setBattery(Double battery) {
        this.battery = battery;
    }

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public LocalDateTime getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(LocalDateTime lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public Double getDistanceSinceService() {
        return distanceSinceService;
    }

    public void setDistanceSinceService(Double distanceSinceService) {
        this.distanceSinceService = distanceSinceService;
    }

    public Double getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(Double totalDistance) {
        this.totalDistance = totalDistance;
    }

    public Integer getSeats() {
        return seats;
    }

    public void setSeats(Integer seats) {
        this.seats = seats;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }
}
