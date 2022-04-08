import '../styles/globals.scss'
import type {AppProps} from 'next/app'
import {SessionProvider } from "../contexts/sessionProvider";
import {Header} from "../components/Header/Header";
import {Footer} from "../components/Footer/Footer";
import {SocketsProvider, useSockets} from "../contexts/socketProvider";

function App({Component, pageProps}: AppProps) {

    const {socket} = useSockets();
    console.log(socket.id);


    return (
        <SessionProvider>
            <SocketsProvider>
                <Header/>
                <Component {...pageProps} />
                <Footer />
            </SocketsProvider>
        </SessionProvider>

    )
}

export default App
