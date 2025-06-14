import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import '../styles/globals.css'
import { GoogleAnalytics } from '@next/third-parties/google'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </Layout>
  )
}
