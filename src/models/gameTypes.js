const mongoose = require("mongoose");
const shortId = require("shortid");

// https://mongoosejs.com/docs/guide.html
// https://github.com/TwilightCoders/Card-Games/blob/master/src/contexts/games.js

const gameTypes = new mongoose.Schema({
  // `_id` will be added automatically by mongoose
  shortId: { type: String, unique: true, default: shortId.generate },
  url: { type: String, unique: true, lowercase: true, trim: true },
  settings: {
    name: String,
    possiblePlayers: {
      min: { type: Number, default: 2, min: 1, max: 10 },
      max: { type: Number, default: 4, min: 1, max: 10 },
    }
  },
  gameplay: {  // These settings govern how the game should be played, after it has been initiated
    scoreTypes: [String],                                   // This should define what type of scores will be calculated ([positive], [negative])
    startScore: { type: Number, default: 0 },               // The score every player will start with
    whammies: { type: Boolean, default: false },            // Defines whether or not a game contains "whammies" (aka, donuts, or something else)
    whammieScore: { type: Number, default: -1 },            // What is the value of a whammie? (Number)
    whammieStyle: [String],                                 // What type of css style will be applied to the whammie when rendered on the scoreboard? ([circled], [blockout])
    whammieName: String,                                    // What is the name of the whammie?
    passesAllowed: { type: Boolean, default: false },       // Defines if a player can pass a turn, or if they have to play every turn
    fixedRounds: { type: Number, default: 11 },             // Defines if there should be a fixed number of rounds to the game
    winType: [String],                                      // ['rounds', 'score']
    winCondition: { type: String, default: "low" },         // if 'rounds', then number of rounds completed. If score, then will high or low score win ('rounds', 'low', 'high')
    winScore: { type: Number, default: -1 },                // 
    tieBreaker: { type: String, default: "rounds" },        // if the game can be a tie when the finished condition is met, then what will break the tie? Same options as win condition
    dealerRotates: { type: Boolean, default: true },        // If the dealer of the game rotates, then the game will be set up that way - if false, then none of the players will be identified as a dealer
    preRenderScoreboard: { type: Boolean, default: true },  // If the scoreboard should be pre-rendered, then indicate so
    levelLabels: [{ type: Schema.Types.Mixed }]             // An object listing which scores will have their values replaced, and the value to replace it with
  },
  description: String,                                      // A description of the game, which can be called ondemand by the app user - formatted with markdown
});

module.exports = mongoose.model("GameTypes", gameTypes);