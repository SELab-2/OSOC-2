import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { SessionProvider } from "../contexts/sessionProvider";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { SocketsProvider } from "../contexts/socketProvider";
import { NotificationProvider } from "../contexts/notificationProvider";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App({ Component, pageProps }: AppProps) {
    return (
        <SessionProvider>
            <SocketsProvider>
                <DndProvider backend={HTML5Backend}>
                    <Header />
                    <NotificationProvider>
                        <Component {...pageProps} />
                    </NotificationProvider>
                    <Footer />
                </DndProvider>
            </SocketsProvider>
        </SessionProvider>
    );
}

export default App;
