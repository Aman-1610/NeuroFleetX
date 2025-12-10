import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProfileCard from '../components/ProfileCard';
import { getUser, setUser } from '../utils/authUtils';
import { userService } from '../services/services';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setCurrentUser] = useState(getUser());

    useEffect(() => {
        // Refresh user from storage on mount
        setCurrentUser(getUser());
    }, []);

    const handleClose = () => {
        navigate(-1); // Go back
    };

    const handleUpdateProfile = async (updatedData) => {
        try {
            const payload = {
                ...updatedData,
                locations: JSON.stringify(updatedData.locations)
            };

            const response = await userService.updateProfile(payload);
            const updatedUser = response.data;

            setUser(updatedUser);
            setCurrentUser(updatedUser);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        }
    };

    if (!user) {
        return <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Loading user data...Or not logged in.</div>;
    }

    return (
        <div className="dashboard-layout">
            <Navbar />
            <ProfileCard
                user={user}
                onClose={handleClose}
                onUpdate={handleUpdateProfile}
                isFullPage={true}
            />
        </div>
    );
};

export default UserProfile;
