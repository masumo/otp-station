import type { AppType } from 'next/app';
import { trpc } from '../utils/trpc';
import { ThemeProvider } from "@material-tailwind/react";
import 'tailwindcss/tailwind.css';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider>
        <Component {...pageProps} />
    </ThemeProvider>
  )
};

export default trpc.withTRPC(MyApp);