# NeuroFleetX

## Project Structure
- `src/`: Frontend (React + Vite)
- `backend/`: Backend (Spring Boot + MySQL)

## Prerequisites
- Node.js & npm
- Java JDK 17+
- Maven
- MySQL Server

## Setup Instructions

### 1. Database Setup
1. Open MySQL Workbench or CLI.
2. Create the database:
   ```sql
   CREATE DATABASE neurofleetx;
   ```
3. Update database credentials in `backend/src/main/resources/application.properties` if they differ from `root/root`.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### 3. Frontend Setup
1. Open a new terminal.
2. Navigate to the project root:
   ```bash
   cd c:\project\NeuroFleetX
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`.

## Features
- **Authentication**: JWT-based login and registration.
- **Role Management**: Admin, Fleet Manager, Driver, Customer roles.
- **Dashboards**: Role-specific dashboards.
