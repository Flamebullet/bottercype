const tmi = require('tmi.js');
const postgres = require('postgres');

const { username, password, twitchID, twitchSecret, databaseUrl } = require('./cred.js');

// Connect to postgres database
const sql = postgres(databaseUrl, {
	idle_timeout: 5
});

const run = async () => {
	try {
		const client = new tmi.Client({
			options: { debug: true },
			connection: {
				reconnect: true,
				secure: true
			},
			identity: {
				username: username,
				password: password // https://twitchapps.com/tmi/
			},
			channels: ['flamebullet_', 'bottercype']
		});
		client.connect();
		client.on('message', (channel, tags, message, self) => {
			// Ignore echoed messages.
			if (self) return;
			if (message.toLowerCase() === '!hello') {
				client.say(channel, `world`);
			}
			if (message.toLowerCase() === '!gay') {
				let min = 0;
				let max = 200;
				let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
				client.say(channel, `@${tags.username}, you are ${randomNumber}% gay!`);
			}
		});
		client.on('error', (err) => {
			console.log(err);
		});
	} catch (error) {
		console.error(error);
	}
};

run();
