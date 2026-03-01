import Navigation from "../Navigation/Navigation.jsx";
import "./Layout.css";

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