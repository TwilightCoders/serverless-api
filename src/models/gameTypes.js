const mongoose = require("mongoose");
const shortId = require("shortid");
const { buildSchema } = require('graphql');

// https://mongoosejs.com/docs/guide.html
// https://github.com/TwilightCoders/Card-Games/blob/master/src/contexts/games.js

// Magic number constants
const PLAYERS = {
  min: 1,
  max: 10,
  defaultMin: 2,
  defaultMax: 4,
};

const ROUNDS = 11;

// Enums
const ScoreTypes = ["positive", "negative"];
const WhammieStyles = ["circled", "blockout"];
const WinConditions = ["rounds", "low", "high"];
const WinTypes = ["rounds", "score"];

// Mongoose Schema
const gameTypes = new mongoose.Schema({
  // `_id` will be added automatically by mongoose
  shortId: { type: String, unique: true, default: shortId.generate, required: true },
  url: { type: String, unique: true, lowercase: true, trim: true, required: true },
  name: { type: String, required: true },
  minPlayers: { type: Number, default: PLAYERS.defaultMin, min: PLAYERS.min, max: PLAYERS.max, required: true },
  maxPlayers: { type: Number, default: PLAYERS.defaultMax, min: PLAYERS.min, max: PLAYERS.max, required: true },
  // This should define what type of scores will be calculated ([positive], [negative])
  scoreTypes: [{
    type: String, enum: ScoreTypes, default: ScoreTypes[0], required: true
  }],
  // The score every player will start with
  startScore: { type: Number, default: 0, required: true },
  // Defines whether or not a game contains "whammies" (aka, donuts, or something else)
  whammies: { type: Boolean, default: false, required: true },
  // What is the value of a whammie? (Number)
  whammieScore: { type: Number, default: 0, required: true },
  // What type of css style will be applied to the whammie when rendered on the scoreboard?
  whammieStyle: {
    type: String, enum: WhammieStyles, default: WhammieStyles[0]
  },
  // What is the name of the whammie?
  whammieName: String,
  // Defines if a player can pass a turn, or if they have to play every turn
  passesAllowed: { type: Boolean, default: false, required: true },
  // Defines if there should be a fixed number of rounds to the game
  fixedRounds: { type: Number, default: 11 },
  // ['rounds', 'score']
  winType: [{ type: String, required: true }],
  // if 'rounds', then number of rounds completed. If score, then will high or low score win
  winCondition: { type: String, enum: WinConditions, default: WinConditions[1], required: true },
  winScore: { type: Number, default: null },
  // if the game can be a tie when the finished condition is met, then what will break the tie? Same options as win condition
  tieBreaker: { type: String, enum: WinConditions, default: WinConditions[0], required: true },
  // If the dealer of the game rotates, then the game will be set up that way - if false, then none of the players will be identified as a dealer
  dealerRotates: { type: Boolean, default: true, required: true },
  // If the scoreboard should be pre-rendered, then indicate so
  preRenderScoreboard: { type: Boolean, default: true, required: true },
  // An object listing which scores will have their values replaced, and the value to replace it with
  levelLabels: [{ type: mongoose.Schema.Types.Mixed }],
  // A description of the game, which can be called ondemand by the app user - formatted with markdown
  description: String,
});


// GraphQL Schema
const schema = buildSchema(`
enum ScoreTypes {
  ${ScoreTypes.join("\n")}
}

enum WhammieStyles {
  ${WhammieStyles.join("\n")}
}

enum WinConditions {
  ${WinConditions.join("\n")}
}

enum WinTypes {
  ${WinTypes.join("\n")}
}

"""
These are the available (and typically necessary) game settings needed to start a game on the client
"""
type GameSettings {
  """
  The mongoose ID. If a user can access this, they should be expected to have write access
  """
  _id: ID!
  """
  An alternative ID which is easier to share with others. This ID will typically be useful to offer read only access to a game
  """
  shortId: ID!
  """
  The name of the game
  """
  name: String!
  """
  Minimum number of players a game can have - Min: ${PLAYERS.min} - Default: ${PLAYERS.defaultMin}
  """
  minPlayers: Int!
  """
  Maximum number of players a game can have - Max: ${PLAYERS.max} - Default: ${PLAYERS.defaultMax}
  """
  maxPlayers: Int!
  scoreTypes: [ScoreTypes!]!
  """
  The score each player will start the game with
  """
  startScore: Int!
  """
  Will this game incorporate whammies?
  """
  whammies: Boolean!
  """
  What is a Whammie worth in score? Note this ties in to score settings. A negative number here will be double negated into a positive number if the ScoreType is set to 'Negative'
  """
  whammieScore: Int!
  """
  What CSS style name should apply to a whammie
  """
  whammieStyle: [WhammieStyles]
  """
  What is a whammie called, if we are using it?
  """
  whammieName: String
  """
  Is a player allowed to pass a turn?
  """
  passesAllowed: Boolean!
  """
  Are the number of rounds fixed? If so, set the number. Otherwise leave it null
  """
  fixedRounds: Int
  """
  Multiple win types are allowed, set which ones are allowed here
  """
  winType: [WinTypes!]!
  """
  What is the primary Win Condition
  """
  winCondition: WinConditions!
  """
  What score would result in a win if the condition were set to score
  """
  winScore: Int
  """
  What condition would break a tie?
  """
  tieBreaker: WinConditions!
  """
  The app can track who the dealer is if you establish that the dealer rotates
  """
  dealerRotates: Boolean!
  """
  Tell the app if the scoreboard should be pre-rendered. Setting this to true will only work if fixedScores is also set to true
  """
  preRenderScoreboard: Boolean!
  """
  Provide an object here to map replacement values for a given score value (example: 11 = J or Jack)
  """
  levelLabels: String
  """
  The description of the game itself
  """
  description: String
}

"""
The game types currently saved on the backend API
"""
type Query {
  """
  List of game types currently saved on the backend API
  """
  gameConfigs: GameSettings
  """
  Retrieve a game type by its ID
  """
  GameTypeById(id: ID!): [GameSettings]!
  """
  Retrieve a game type by its shortId
  """
  GameTypeByShortId(id: ID!): [GameSettings]!
}

#"""
#The available methods to create, update, or delete Game Types
#"""
#type Mutation {
#  addGameType(gameType: GameSettings!): GameSettings! {
#    _id
#    shortId
#    name
#    minPlayers
#    maxPlayers
#    scoreTypes
#    startScore
#    whammies
#    whammieScore
#    whammieStyle
#    whammieName
#    passesAllowed
#    fixedRounds
#    winType
#    winCondition
#    winScore
#    tieBreaker
#    dealerRotates
#    preRenderScoreboard
#    levelLabels
#  }
#}
`)


// Export the model, and the schema
module.exports = {
  model: mongoose.model("GameTypes", gameTypes),
  schema,
}