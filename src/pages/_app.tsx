import '../styles/globals.css'

import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { ApolloProvider } from '@apollo/client'
import { ChakraProvider } from '@chakra-ui/react'


import client from "../apollo/client"
import Layout from '../components/Layout'

export default function Blockchain({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const path = router.asPath;

  return (
        <ApolloProvider client={client}>
          <ChakraProvider>
            <Layout {...pageProps} path={path}>
              <Component {...pageProps} path={path} />
            </Layout>
          </ChakraProvider>
        </ApolloProvider>
  )
}
