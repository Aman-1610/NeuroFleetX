package com.neurofleetx.backend.service;

import com.neurofleetx.backend.dto.route.*;
import com.neurofleetx.backend.model.Vehicle;
import com.neurofleetx.backend.repository.VehicleRepository;
import com.neurofleetx.backend.util.GraphUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class RouteService {

    @Autowired
    private VehicleRepository vehicleRepository;

    private static final double EARTH_RADIUS = 6371; // km

    public List<RouteOption> planRoute(RouteRequest request) {
        List<RouteOption> routes = new ArrayList<>();
        double distance = calculateDistance(request.getStartLat(), request.getStartLng(), request.getEndLat(),
                request.getEndLng());

        // 1. Fastest Route (Using Dijkstra on City Graph)
        List<List<Double>> path1 = GraphUtils.findShortestPath(request.getStartLat(), request.getStartLng(),
                request.getEndLat(), request.getEndLng());
        // Fallback to curved path if graph fails (e.g. outside Delhi range)
        if (path1 == null || path1.size() < 3)
            path1 = generateCurvedPath(request.getStartLat(), request.getStartLng(), request.getEndLat(),
                    request.getEndLng());

        routes.add(new RouteOption("rt_1", "Fastest (AI-Graph)",
                (int) (distance * 1.5) + " mins", // Rough ETA
                String.format("%.1f km", distance * 1.2),
                "Low", distance * 0.1, path1, "#3b82f6"));

        // 2. Shortest Distance (Straight/Curved)
        routes.add(createRoute("rt_2", "Shortest Path", distance * 1.05, "Heavy",
                request.getStartLat(), request.getStartLng(), request.getEndLat(), request.getEndLng(), "#10b981"));

        // 3. Eco Route
        routes.add(createRoute("rt_3", "Eco-Friendly", distance * 1.15, "Moderate",
                request.getStartLat(), request.getStartLng(), request.getEndLat(), request.getEndLng(), "#22c55e"));

        return routes;
    }

    private RouteOption createRoute(String id, String type, double distKm, String traffic,
            double startLat, double startLng, double endLat, double endLng, String color) {
        // Calculate Time (km / speed)
        double speed = traffic.equals("Low") ? 60 : (traffic.equals("Moderate") ? 40 : 25);
        int minutes = (int) ((distKm / speed) * 60);
        if (minutes < 5)
            minutes = 5; // Min time

        List<List<Double>> path = generateCurvedPath(startLat, startLng, endLat, endLng);

        return new RouteOption(
                id, type,
                minutes + " mins",
                String.format("%.1f km", distKm),
                traffic,
                distKm * 0.1, // Energy usage dummy
                path,
                color);
    }

    // Generate a slightly curved path between two points (Mocking real roads)
    private List<List<Double>> generateCurvedPath(double startLat, double startLng, double endLat, double endLng) {
        List<List<Double>> path = new ArrayList<>();
        path.add(Arrays.asList(startLat, startLng));

        // Add 5 intermediate points with some noise
        for (int i = 1; i <= 5; i++) {
            double fraction = i / 6.0;
            double lat = startLat + (endLat - startLat) * fraction;
            double lng = startLng + (endLng - startLng) * fraction;

            // Add noise to simulate turns
            lat += (Math.random() - 0.5) * 0.005;
            lng += (Math.random() - 0.5) * 0.005;

            path.add(Arrays.asList(lat, lng));
        }

        path.add(Arrays.asList(endLat, endLng));
        return path;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula simplified
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }

    public List<LoadAssignment> optimizeLoad(LoadOptimizationRequest request) {
        List<Vehicle> vehicles = vehicleRepository.findAll(); // In real app, filter by available
        List<LoadAssignment> assignments = new ArrayList<>();

        if (vehicles.isEmpty())
            return assignments;

        // Create assignment entries for all vehicles
        for (Vehicle v : vehicles) {
            assignments.add(new LoadAssignment(v.getId(), v.getName(), new ArrayList<>(), 0.0, "Balanced"));
        }

        // Round robin assignment (Greedy)
        int vehicleIndex = 0;
        for (LoadOptimizationRequest.DeliveryTask task : request.getTasks()) {
            // Find a suitable vehicle (Mock logic: just next available)
            if (vehicleIndex >= assignments.size())
                vehicleIndex = 0;

            LoadAssignment assignment = assignments.get(vehicleIndex);

            assignment.getAssignedTaskIds().add(task.getId());
            assignment.setTotalLoad(assignment.getTotalLoad() + task.getWeight());

            // Simple status logic
            if (assignment.getTotalLoad() > 500)
                assignment.setStatus("Overloaded");
            else if (assignment.getTotalLoad() < 100)
                assignment.setStatus("Underloaded");
            else
                assignment.setStatus("Balanced");

            vehicleIndex++;
        }

        return assignments;
    }
}
