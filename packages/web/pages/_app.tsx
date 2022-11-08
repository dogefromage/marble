import { AppProps } from 'next/app'
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import defaultTheme from '../app/assets/defaultTheme';
import '../styles/globals.scss';

const MyApp = ({ Component, pageProps }: AppProps) =>
{
    return (<>
        <Head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        </Head>
        <ThemeProvider theme={defaultTheme}>
            <Component {...pageProps} />
        </ThemeProvider>
    </>);
}

export default MyApp