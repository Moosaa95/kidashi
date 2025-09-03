import { Navigate, Route, Routes } from "react-router"


export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<h1>Home</h1>} />
            <Route path="/about" element={<h1>About</h1>} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}
