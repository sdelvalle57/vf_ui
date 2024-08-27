import { ApolloClient, InMemoryCache } from "@apollo/client";


const client = new ApolloClient({
    uri: "http://localhost:7878/graphql",
    cache: new InMemoryCache(),
    defaultOptions: {
        query: {
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
});

export default client;