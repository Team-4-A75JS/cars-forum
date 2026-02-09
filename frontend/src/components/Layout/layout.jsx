import Navigation from "../Navigation/Navigation";

function Layout({ children }) {
    return (
        <div>
            <header>
                <Navigation />
            </header>

            <main>
                {children}
            </main>
        </div>
    )
}

export default Layout;