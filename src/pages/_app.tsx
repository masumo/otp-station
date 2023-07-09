import type { AppProps, AppType } from 'next/app';
import { trpc } from '../utils/trpc';
import { ThemeProvider } from "@material-tailwind/react";
import 'tailwindcss/tailwind.css';
import { SessionProvider } from "next-auth/react"

const MyApp: AppType = ({ Component, pageProps}: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider>
          <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  )
};

export default trpc.withTRPC(MyApp);