import "../styles/globals.css";
import { AppProvider } from "../context/AppContext";
import { Toaster } from "../components/ui/toaster";

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
      <Toaster />
    </AppProvider>
  );
}
