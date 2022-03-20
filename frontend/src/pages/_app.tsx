import "../styles/globals.scss";
import type { AppProps } from "next/app";
import wrapper from "../lib/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initApp } from "../reducers/app";

function MyApp({ Component, pageProps }: AppProps) {
  const d = useDispatch();

  useEffect(() => {
    d(initApp());
  }, []);

  return <Component {...pageProps} />;
}

export default wrapper.withRedux(MyApp);
