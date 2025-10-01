import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError
} from "@reduxjs/toolkit/query"
import { Mutex } from "async-mutex"
import type { RootState } from "../app/store";
import { config } from "@/config";

// const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/kidashi/api/";


const mutex = new Mutex();

function getCookie(name: string) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie("csrftoken");

console.log("CSRF", csrftoken);

const baseQuery = fetchBaseQuery({
    baseUrl: config.apiUrl,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        headers.set("Content-Type", "application/json");
        headers.set("Accept", "application/json");
        headers.set("X-CSRFToken", `${csrftoken}`)
    }
})


const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);

    if (result.error) {
        console.log("error details", result.error);
    }
    if (result.error && result.error.status === 401) {
        console.log("=== 401 Unauthorized - Token may be expired ===");

        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                console.log("Attempting to refresh token");
                const refreshToken = (api.getState() as RootState).auth.refreshToken;

                if (refreshToken) {
                    const refreshResult = await baseQuery(
                        {
                            url: "/auth/refresh",
                            method: "POST",
                            body: { refreshToken }
                        },
                        api,
                        extraOptions
                    );

                    if (refreshResult.data) {
                        console.log("Token refreshed successfully");
                        result = await baseQuery(args, api, extraOptions)
                        console.log("Retry after refresh:", !result.error ? "Success" : "Failed");

                    } else {
                        console.log("Failed to refresh token");
                        // api.dispatch(logout());
                    }
                } else {
                    console.log("No refresh token available");
                    // api.dispatch(logout());
                }

            } catch (error) {
                console.error("Error during token refresh:", error);
                // api.dispatch(logout());
            } finally {
                release();
            }
        } else {
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }

    }
    return result;

    // } catch (error: any) {
    //     console.error("Error during API call:", error);
    //     return {
    //         error: {
    //             status: error.status,
    //             data: error.data || { message: error.message },
    //             error: error.message

    //         }
    //     }
    // }
};

// export const apiSlice = createApi({
//     reducerPath: 'api',
//     baseQuery: baseQueryWithReauth as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
//     tagTypes: ["Auth"],
//     endpoints: builder => ({})
// })

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
    tagTypes: ["Auth"],
    endpoints: _builder => ({})
})
