const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	username: process.env.USERNAME,
	password: process.env.PASSWORD,
	twitchtoken: process.env.TWITCHTOKEN,
	twitchrefresh: process.env.TWITCHREFRESH,
	twitchID: process.env.TWITCHID,
	twitchSecret: process.env.TWITCHSECRET,
	databaseUrl: process.env.DATABASE_URL
};
