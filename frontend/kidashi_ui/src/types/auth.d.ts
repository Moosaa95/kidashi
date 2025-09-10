export interface AdminUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "admin";
}


export interface AuthState {
    user: AdminUser | null;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}
