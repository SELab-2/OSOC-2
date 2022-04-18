import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { SessionProvider } from "../contexts/sessionProvider";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";

function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </SessionProvider>
  );
}

export default App;
