import '../styles/globals.scss'
import type {AppProps} from 'next/app'
import { SessionProvider } from "../contexts/sessionProvider";
import {Header} from "../components/Header/Header";

function App({Component, pageProps}: AppProps) {

    return (
        <SessionProvider>
            <Header/>
            <Component {...pageProps} />
        </SessionProvider>

    )
}

export default App
