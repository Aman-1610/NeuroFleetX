# 4. Mentor Q&A Preparation

## Question: "Did you do all this on your own?"

**Recommended Answer:**
"Yes, I implemented these features myself. I followed standard software engineering practices:
1.  **Requirement Analysis:** I identified that our user profile was too basic for a fleet management system. We needed real identification and location data.
2.  **Research:** I looked up the documentation for **Google Maps Platform** to understand how to integrate the map. I also researched security best practices for displaying sensitive IDs (masking).
3.  **Implementation:** I built it layer by layer—first updating the Database schema (Backend), then the API logic, and finally the React frontend interface."

*(Note: It is perfectly okay to say you used AI tools or documentation to look up syntax or debug errors. The logic and design decisions are yours.)*

## Question: "Explain the flow of data when a user saves their profile."

**Answer:**
1.  **Frontend:** The user types into the input fields in `ProfileCard.jsx`. This updates the React `formData` state.
2.  **API Call:** When they click 'Save', the frontend makes a `PUT` or `PATCH` request to the backend API (`/api/users/profile`), sending the `formData` as JSON.
3.  **DTO Mapping:** The Spring Boot controller receives this JSON and maps it to the `UpdateProfileRequest` Java object.
4.  **Service Layer:** The `UserService` finds the logged-in user in the database, updates only the changed fields, and saves the entity.
5.  **Database:** Hibernate generates the SQL `UPDATE users SET address = '...' WHERE id = ...` query and commits it to MySQL.

## Question: "Why did you put the API Key in `.env`?"

**Answer:**
"Hardcoding API keys in the source code is a security risk. If I push the code to GitHub, bots can steal my key. putting it in a `.env` file ensures it stays local to my machine and can be easily configured for different environments (Development vs. Production)."
