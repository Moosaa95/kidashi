import type { AuthState } from "@/types/auth";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
    token: null,
    refreshToken: null,
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false
}


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<{ user: AuthState["user"], token: string, refreshToken: string }>) => {
            if (action.payload) {
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            } else {
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
            }
        },
        logout: (state: any) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
        },
    }
})


export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;