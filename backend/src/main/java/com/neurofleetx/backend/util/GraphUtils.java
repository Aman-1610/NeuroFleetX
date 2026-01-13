package com.neurofleetx.backend.util;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.*;

public class GraphUtils {

    @Data
    @AllArgsConstructor
    public static class Node {
        String id;
        double lat;
        double lng;
        List<Edge> neighbors;
    }

    @Data
    @AllArgsConstructor
    public static class Edge {
        Node target;
        double weight; // Distance in km
    }

    private static Map<String, Node> cityGraph = new HashMap<>();

    static {
        // Initialize Micro-Graph of Delhi-NCR
        addNode("CP", 28.6304, 77.2177); // Connaught Place
        addNode("IG", 28.6129, 77.2295); // India Gate
        addNode("AK", 28.6127, 77.2773); // Akshardham
        addNode("LN", 28.6304, 77.2772); // Laxmi Nagar
        addNode("MV", 28.6000, 77.2900); // Mayur Vihar
        addNode("SKK", 28.5880, 77.2580); // Sarai Kale Khan
        addNode("ASH", 28.5700, 77.2550); // Ashram
        addNode("NP", 28.5492, 77.2526); // Nehru Place
        addNode("N15", 28.5898, 77.3101); // Noida Sec 15
        addNode("N18", 28.5700, 77.3200); // Noida Sec 18
        addNode("GP", 28.5670, 77.3300); // Golf Course
        addNode("S62", 28.6200, 77.3700); // Sec 62

        // Edges (Approx distances)
        connect("CP", "IG", 2.5);
        connect("IG", "SKK", 4.0);
        connect("SKK", "ASH", 2.5);
        connect("ASH", "NP", 3.0);
        connect("SKK", "AK", 3.0);
        connect("AK", "MV", 2.0);
        connect("MV", "N15", 3.0);
        connect("N15", "N18", 2.5);
        connect("N18", "GP", 1.5);

        // Alternate route from CP
        connect("CP", "LN", 6.0);
        connect("LN", "AK", 3.0);
    }

    private static void addNode(String id, double lat, double lng) {
        cityGraph.put(id, new Node(id, lat, lng, new ArrayList<>()));
    }

    private static void connect(String id1, String id2, double dist) {
        cityGraph.get(id1).neighbors.add(new Edge(cityGraph.get(id2), dist));
        cityGraph.get(id2).neighbors.add(new Edge(cityGraph.get(id1), dist));
    }

    // Dijkstra Algorithm
    public static List<List<Double>> findShortestPath(double startLat, double startLng, double endLat, double endLng) {
        Node startNode = findNearestNode(startLat, startLng);
        Node endNode = findNearestNode(endLat, endLng);

        if (startNode == null || endNode == null)
            return null;

        Map<Node, Double> distances = new HashMap<>();
        Map<Node, Node> previous = new HashMap<>();
        PriorityQueue<Node> queue = new PriorityQueue<>(Comparator.comparingDouble(distances::get));

        for (Node node : cityGraph.values()) {
            distances.put(node, Double.MAX_VALUE);
        }
        distances.put(startNode, 0.0);
        queue.add(startNode);

        while (!queue.isEmpty()) {
            Node current = queue.poll();
            if (current.equals(endNode))
                break;

            for (Edge edge : current.neighbors) {
                double newDist = distances.get(current) + edge.weight;
                if (newDist < distances.get(edge.target)) {
                    distances.put(edge.target, newDist);
                    previous.put(edge.target, current);
                    queue.add(edge.target);
                }
            }
        }

        // Reconstruct path
        List<List<Double>> path = new ArrayList<>();
        path.add(Arrays.asList(startLat, startLng)); // Real Start

        List<Node> nodePath = new ArrayList<>();
        for (Node at = endNode; at != null; at = previous.get(at)) {
            nodePath.add(at);
        }
        Collections.reverse(nodePath);

        for (Node n : nodePath) {
            path.add(Arrays.asList(n.lat, n.lng));
        }

        path.add(Arrays.asList(endLat, endLng)); // Real End
        return path;
    }

    private static Node findNearestNode(double lat, double lng) {
        Node nearest = null;
        double minDesc = Double.MAX_VALUE;

        for (Node node : cityGraph.values()) {
            double dist = Math.sqrt(Math.pow(node.lat - lat, 2) + Math.pow(node.lng - lng, 2));
            if (dist < minDesc) {
                minDesc = dist;
                nearest = node;
            }
        }
        return nearest;
    }
}
