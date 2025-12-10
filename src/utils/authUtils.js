import { jwtDecode } from 'jwt-decode';

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

export const setUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
    localStorage.removeItem('user');
};

export const clearAuth = () => {
    removeToken();
    removeUser();
};

export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;
    return !isTokenExpired(token);
};

export const getUserRole = () => {
    const user = getUser();
    return user?.role || null;
};

export const hasRole = (role) => {
    return getUserRole() === role;
};

export const hasAnyRole = (roles) => {
    const userRole = getUserRole();
    return roles.includes(userRole);
};

export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        return null;
    }
};

export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};
