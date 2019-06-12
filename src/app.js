// Imports
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const graphqlHTTP = require("express-graphql");

// Configure express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

// DB
require("./db");

// GameTypes
const { model: gameTypes, schema } = require("./models/gameTypes");

// Clear gameTypes so that we don't persist testing
gameTypes.remove({});

// Set up GraphQL endpoint
app.use("/graphql", graphqlHTTP({
  schema,
  rootValue: gameTypes.find(),
  graphiql: true
}));

module.exports = app;
