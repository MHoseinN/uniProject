import { ref } from 'vue';

// Create reactive auth state
export const authState = ref({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    user: localStorage.getItem('user')
});

// Function to update auth state
export function updateAuthState() {
    const newState = {
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        user: localStorage.getItem('user')
    };

    // Only update if values have changed 
    const hasChanged =
        authState.value.token !== newState.token ||
        authState.value.role !== newState.role ||
        authState.value.user !== newState.user;

    if (hasChanged) {
        authState.value = newState;
    }
}

// Function to clear auth state
export function clearAuthState() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');

    authState.value = {
        token: null,
        role: null,
        user: null
    };
}

// Function to set auth state
export function setAuthState(token, role, user = null) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    authState.value = {
        token: token,
        role: role,
        user: user ? JSON.stringify(user) : localStorage.getItem('user')
    };
}

// Computed properties
export function isLoggedIn() {
    return !!authState.value.token;
}

export function getUserRole() {
    return authState.value.role;
}

export function getUser() {
    if (authState.value.user) {
        try {
            return JSON.parse(authState.value.user);
        } catch (e) {
            return null;
        }
    }
    return null;
}
