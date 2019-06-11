// Imports
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const graphqlHTTP = require("express-graphql");
const { GraphQLSchema , GraphQLObjectType , GraphQLString, GraphQLNonNull, GraphQLID } = require("graphql");

// Configure express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

// DB
require("./db");

// Memory Store
let inMemoryStore = {};
const RootMutation = new GraphQLObjectType({
  name: "RootMutation",
  description: "The root mutation",
  fields: {
    setNode: {
      type: GraphQLString,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        value: {
          type: new GraphQLNonNull(GraphQLString),
        }
      },
      resolve(source, args) {
        inMemoryStore[args.key] = args.value;
        return inMemoryStore[args.key];
      }
    }
  }
})

// RootQuery
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  description: "The Root Query",
  fields: {
    viewer: {
      type: GraphQLString,
      resolve() {
        return "viewer!";
      }
    },
    node: {
      type: GraphQLString,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        }
      },
      resolve(source, args) {
        return inMemoryStore[args.key];
      }
    }
  }
});

// Schema
const Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

// Set up GraphQL endpoint
app.use("/graphql", graphqlHTTP({ schema: Schema, graphiql: true }));

module.exports = app;
