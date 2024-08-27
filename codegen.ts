import { CodegenConfig } from '@graphql-codegen/cli';


const config: CodegenConfig = {
    schema: 'http://localhost:7878/graphql',
    documents: ['**/*.graphql'],
    generates: {
      './src/apollo/__generated__/graphql.ts': {
        plugins: ["typescript", "typescript-operations", "typescript-react-apollo"]
      }
    },

};


export default config;