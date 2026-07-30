const AUTH_STORAGE_KEY = 'auth';

function normalizeAuthData(data) {
    const authData = data?.data || data || {};

    return {
        nonce: authData.nonce || '',
        token: authData.token || '',
        user_id: authData.user_id || '',
        user_email: authData.user_email || '',
    };
}

function hasAuthData(authData) {
    return Boolean(
        authData?.token &&
        authData?.user_id &&
        authData?.user_email,
    );
}

export function saveAuthData(data) {
    const authData = normalizeAuthData(data);

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    return authData;
}

export function getAuthData() {
    const value = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!value) {
        return null;
    }

    try {
        const parsedValue = JSON.parse(value);
        const authData = normalizeAuthData(parsedValue);

        if (!hasAuthData(authData)) {
            return null;
        }

        return authData;
    } catch (error) {
        console.error('Failed to parse auth data from localStorage', error);

        clearAuthData();
        return null;
    }
}

export function getNonce() {
    const authData = getAuthData();
    return authData?.nonce || '';
}

export function getAccessToken() {
    const authData = getAuthData();
    return authData?.token || '';
}

export function getUserId() {
    const authData = getAuthData();
    return authData?.user_id || '';
}

export function getUserEmail() {
    const authData = getAuthData();
    return authData?.user_email || '';
}

export function isAuthenticated() {
    return hasAuthData(getAuthData());
}

export function clearAuthData() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}