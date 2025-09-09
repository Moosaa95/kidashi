import { navigation } from "@/config"
import { Link } from "react-router"

export default function SidebarContent({
    pathname,
    navigate,
}: {
    pathname: string
    navigate: (path: string) => void
}) {
    const handleNavigation = (href: string) => {
        console.log("Navigating to:", href)
        navigate(href)
    }

    return (
        <>
            {/* Logo */}
            <div className="flex h-20 shrink-0 items-center pt-6">
                <Link to="/" className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xl shadow-lg">
                        K
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-sidebar-foreground tracking-tight">
                            Kidashi
                        </h1>
                        <p className="text-sm text-sidebar-foreground/70 font-medium text-center">
                            Admin
                        </p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col mt-8">
                <ul className="space-y-2">
                    {navigation.map((item, index) => {
                        const current = pathname === item.href
                        console.log("CURRENT=======", current, pathname, item.href);

                        return (
                            <li
                                key={item.name}
                                className="animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <button
                                    onClick={() => handleNavigation(item.href)}
                                    className={`group flex gap-x-4 rounded-2xl p-4 text-sm font-medium w-full text-left transition-all duration-300 ${current
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg scale-[1.02]"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground hover:scale-[1.01] cursor-pointer"
                                        }`}
                                >
                                    {current && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl" />
                                    )}
                                    <item.icon
                                        className={`h-5 w-5 shrink-0 transition-colors duration-300 relative z-10 ${current
                                            ? "text-white/100"
                                            : "group-hover:text-primary/80"
                                            }`}
                                    />
                                    <span className="relative z-10">{item.name}</span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </>
    )
}
