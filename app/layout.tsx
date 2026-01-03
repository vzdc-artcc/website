import {ReactNode} from "react";
import type {Metadata} from "next";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v14-appRouter";
import {Roboto} from 'next/font/google';
import {Container, CssBaseline, ThemeProvider} from "@mui/material";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import theme from "@/theme/theme";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import {ToastContainer} from "react-toastify";
import {GoogleTagManager} from "@next/third-parties/google";
import InitColorSchemeScript from "@mui/system/InitColorSchemeScript";
import BroadcastViewer from "@/components/BroadcastViewer/BroadcastViewer";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import WelcomeMessageDialog from "@/components/WelcomeMessages/WelcomeMessageDialog";
import prisma from "@/lib/db";
import StaffTasksAlert from "@/components/Admin/StaffTasksAlert";
import Script from "next/script"

export const metadata: Metadata = {
    title: "Virtual Washington ARTCC",
    description: "The Virtual Washington ARTCC is a community of pilots and air traffic controllers on VATSIM who come together to enjoy the art of flight simulation.",
};

const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto',
});

export default async function RootLayout({
  children,
}: Readonly<{
    children: ReactNode;
}>) {

    const session = await getServerSession(authOptions);

    const welcomeMessages = await prisma.welcomeMessages.findFirst();

  return (
      <html lang="en" suppressHydrationWarning>
      <body className={roboto.variable}>
    <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <GoogleTagManager gtmId={googleAnalyticsId || ''}/>
            <InitColorSchemeScript attribute="class" defaultMode="system"/>
            <div>
                {session?.user && <BroadcastViewer user={session.user}/>}
                {session?.user && session.user.controllerStatus !== 'NONE' && welcomeMessages &&
                    <WelcomeMessageDialog user={session.user} welcomeMessages={welcomeMessages}/>}
                <Navbar/>
                <Container maxWidth="xl" sx={{marginTop: 2,}}>
                    <StaffTasksAlert/>
                    {children}
                    <Script
                        src="https://rybbit.vzdc.org/api/script.js"
                        data-site-id={process.env.NEXT_PUBLIC_RYBBIT_SITE_ID}
                        strategy="afterInteractive"
                    />
                </Container>
                <Footer/>
                <ToastContainer theme="dark"/>
            </div>
        </ThemeProvider>
    </AppRouterCacheProvider>
    </body>
    </html>
  );
}
