import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { Route, BrowserRouter as Router, Routes } from 'react-router'
import AppRouter from './AppRouter'
import { store } from './states/app/store'

export default function MainWrapper() {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/*" element={<AppRouter />} />
                </Routes>
                <Toaster visibleToasts={1} position='top-right' richColors />
            </Router>
        </Provider>
    )
}