package com.neurofleetx.backend.controller;

import com.neurofleetx.backend.dto.route.*;
import com.neurofleetx.backend.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")

public class RouteController {

    @Autowired
    private RouteService routeService;

    @PostMapping("/plan")
    public ResponseEntity<List<RouteOption>> planRoute(@RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.planRoute(request));
    }

    @PostMapping("/optimize-load")
    public ResponseEntity<List<LoadAssignment>> optimizeLoad(@RequestBody LoadOptimizationRequest request) {
        return ResponseEntity.ok(routeService.optimizeLoad(request));
    }
}
