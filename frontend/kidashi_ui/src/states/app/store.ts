import { configureStore } from "@reduxjs/toolkit"
import { apiSlice } from "../api/apiSlice";
import { AuthReducer, DashboardReducer, TransactionsReducer, TrustCircleReducer, VendorsReducer, WomenReducer } from "..";



export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: AuthReducer,
        dashboard: DashboardReducer,
        vendors: VendorsReducer,
        circles: TrustCircleReducer,
        women: WomenReducer,
        transactions: TransactionsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: process.env.NODE_ENV !== "production",
})

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
