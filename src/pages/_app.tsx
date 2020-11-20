import App from "next/app";
import "../../styles/globals.css";

export const MyApp: App = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
}

export default MyApp;
