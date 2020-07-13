"use strict";

var _apolloServer = require("apollo-server");

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

var _authHelpers = require("./auth-helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HEADER_NAME = 'authorization';
const typeDefs = (0, _graphqlTag.default)`
    type Query {
        me: User
    }
    type User {
        id: ID!
        username: String!
    }
`;
console.log('999999');
const server = new _apolloServer.ApolloServer({
  typeDefs,
  context: async ({
    req
  }) => {
    let authToken = null;
    let currentUser = null;

    try {
      authToken = req.headers[HEADER_NAME];
      console.log('---------- authToken --------');

      if (authToken) {
        currentUser = await (0, _authHelpers.tradeTokenForUser)(authToken);
      }
    } catch (e) {
      console.warn(`Unable to authenticate using auth token: ${authToken}`);
    }

    return {
      authToken,
      currentUser
    };
  }
});
server.listen().then(({
  url
}) => {
  console.log(`🚀  Server ready at ${url}`);
});