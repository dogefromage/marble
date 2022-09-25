import { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components';
import defaultTheme from '../app/styled/defaultTheme';
import '../styles/globals.scss';

const MyApp = ({ Component, pageProps }: AppProps) =>
{
    return (
        <ThemeProvider theme={defaultTheme}>
            <Component {...pageProps} />
        </ThemeProvider>
    )
}

export default MyApp