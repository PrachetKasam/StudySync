import Sidebar from '../components/Sidebar'

function DashboardLayout({ children }) {
    return (
        <div className="app">
            <Sidebar />

            <main>
                {children}
            </main>
        </div>
    )
}

export default DashboardLayout