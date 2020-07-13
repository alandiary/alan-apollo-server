// https://the-guild.dev/blog/graphql-modules-auth

import { ApolloServer } from 'apollo-server';
import gql from 'graphql-tag';
import { tradeTokenForUser } from './auth-helpers';
import { authenticated } from './authenticated-guard';
import { validateRole } from './validate-role';

const HEADER_NAME = 'authorization';

const typeDefs = gql`
    type Query {
        me: User,
        serverTime: String
    }
    type User {
        id: ID!
        username: String!   
    }
    type Article {
        id: ID!
        title: String!
        content: String!
    }
    type Mutation {
        publishArticle(title: String!, content: String!): Article!
    }
`;
const resolvers = {
    Query: {
        me: authenticated((root, args, context) => context.currentUser),
        serverTime: ()=> new Date()
    },
    Mutation: {
        publishArticle: authenticated(
            // authenticated
            validateRole('EDITOR')((root, { title, content }, context) =>
                createNewArticle(title, content, context.currentUser)
            )
        ),
    },
    User: {
        id: (user) => user._id,
        username: (user) => user.username,
    },
};
console.log('999999')
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        let authToken = null;
        let currentUser = null;

        try {
            authToken = req.headers[HEADER_NAME];
            console.log('---------- authToken --------')
            if (authToken) {
                currentUser = await tradeTokenForUser(authToken);
            }
        } catch (e) {
            console.warn(`Unable to authenticate using auth token: ${authToken}`);
        }

        return {
            authToken,
            currentUser,
        };
    },
});

server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
