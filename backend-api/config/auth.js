require("dotenv").config();

module.exports = {
  clientID: process.env.SNOWFLAKE_CLIENT_ID,
  clientSecret: process.env.SNOWFLAKE_CLIENT_SECRET,
  authorizationURL: process.env.SNOWFLAKE_AUTHORIZATION_URL,
  tokenURL: process.env.SNOWFLAKE_TOKEN_URL,
  callbackURL: process.env.SNOWFLAKE_CALLBACK_URL,
};
