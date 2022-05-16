import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { SessionProvider } from "../contexts/sessionProvider";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { SocketsProvider } from "../contexts/socketProvider";
import { NotificationProvider } from "../contexts/notificationProvider";

function App({ Component, pageProps }: AppProps) {
    return (
        <SessionProvider>
            <SocketsProvider>
                <Header />
                <NotificationProvider>
                    <Component {...pageProps} />
                </NotificationProvider>
                <Footer />
            </SocketsProvider>
        </SessionProvider>
    );
}

export default App;
