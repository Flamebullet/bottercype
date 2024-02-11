const fs = require('fs');
const tmi = require('tmi.js');
const postgres = require('postgres');
const { TRClient } = require('./twitchrequest/twitchrequest.js');
const prefix = '!';
const createSubscriber = require('pg-listen');

const { username, password, twitchID, twitchSecret, databaseUrl } = require('./cred.js');
const { error } = require('console');

// global variables
let acceptedChannels = [];

// connecting to Tmi.js
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
	channels: []
});

// Mapping the commands
client.commands = new Map();

const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Connect to postgres database
const sql = postgres(databaseUrl, {
	idle_timeout: 5
});
const subscriber = createSubscriber({ connectionString: databaseUrl });

// Connecting to twitch channel listener
const options = {
	// The channels you are listening to (all in lowercase)
	channels: [],
	client_id: twitchID,
	client_secret: twitchSecret,

	// The interval it will check (in seconds)
	interval: 10
};
const trClient = new TRClient(options);

const run = async () => {
	try {
		await client.connect();
		await subscriber.connect();
		await subscriber.listenTo('followedchannel');
		await subscriber.listenTo('acceptedchannel');

		subscriber.notifications.on('followedchannel', async (payload) => {
			console.log('followed');
			try {
				if (payload.status === 'INSERT') {
					await client.join(payload.username);
				}
			} catch (err) {
				console.error('Error joining or disconnecting twitch channel', err);
			}
		});
		subscriber.notifications.on('acceptedchannel', async (payload) => {
			console.log(acceptedChannels);
			try {
				if (payload.status === 'INSERT') {
					acceptedChannels.push(payload.username);
				} else if (payload.status === 'DELETE') {
					acceptedChannels.splice(acceptedChannels.indexOf(payload.username), 1);

					client.say(`#${payload.username}`, `@${payload.username}, Bottercype has left your channel successfully!`);
					await client.part(payload.username);
				}
			} catch (err) {
				console.error('Error joining or disconnecting twitch channel', err);
			}
		});

		// listen to channels to go live
		(await sql`SELECT DISTINCT username FROM channels;`).forEach(async (result) => {
			const userData = await trClient.getUser(result.username);

			if (!userData) {
				await sql`DELETE FROM channels WHERE username=${String(result.username)};`;
				return;
			}
			trClient.addChannel(result.username);
			acceptedChannels.push(result.username);
		});

		// connect to test channels regardless of live status
		(await sql`SELECT DISTINCT username FROM testchannels;`).forEach(async (result) => {
			await client.join(result.username);
			await wait(3000);
		});

		// connect to live channels
		trClient.on('live', async (data) => {
			await client.join(data.raw.broadcaster_login);
			client.say(`#${data.raw.broadcaster_login}`, `Bottercype has joined the channel!`);
		});

		// Disconnect to offline channels
		trClient.on('unlive', async (data) => {
			await client.part(data.raw.broadcaster_login);

			let inTest = await sql`SELECT username FROM testchannels;`;
			if (inTest.length > 0) {
				await sql`DELETE FROM testchannels WHERE username=${String(data.raw.broadcaster_login)};`;
			}
		});

		// when receive message in live/test channels
		client.on('message', async (channel, tags, message, self) => {
			// Ignore echoed messages.
			if (self) return;
			if (self || !message.startsWith(prefix)) return;

			const args = message.substring(prefix.length).split(' ');
			const command = args[0].toLowerCase();

			let channelName = channel.substring(1);

			if (acceptedChannels.includes(channelName)) {
				if (command == 'connect') return client.say(channel, `@${tags.username}, Bot has already been added to server.`);

				if (client.commands.get(command)) {
					client.commands.get(command).execute(channel, tags, message, client, sql);
				} else {
					// execute custom command
					let result = await sql`SELECT output FROM commands WHERE username=${String(channelName)} AND command=${String(command)}`;
					if (result.length > 0) {
						client.say(channel, result[0].output);
					}

					// execute custom rand command
					result = await sql`SELECT min, max, output FROM randcommands WHERE username=${String(channelName)} AND command=${String(command)}`;
					if (result.length > 0) {
						let user = message.match(/@(\w+)/) ? message.match(/@(\w+)/)[1] : tags.username;
						let value = Math.floor(Math.random() * (parseInt(result[0].max) - parseInt(result[0].min) + 1)) + parseInt(result[0].min);
						console.log(user);
						let output = await result[0].output.replace('{user}', `@${user}`).replace('{value}', value);
						client.say(channel, output);
					}
				}
			} else {
				if (command == 'connect') {
					client.commands.get(command).execute(channel, tags, message, client, sql);
				} else if (client.commands.get(command)) {
					client.say(
						channel,
						`The channel broadcaster must use !connect to officially join the bot to the channel to start using commands. If you wish to remove the bot, head to https://yt-dl.asuscomm.com/twitch-bot/bottercype to remove it.`
					);
				}
			}
		});
		client.on('error', (err) => {
			console.log(err);
		});

		subscriber.events.on('error', (error) => {
			console.error('fatal database error:', error);
		});
	} catch (error) {
		console.error(error);
	}
};

// functions
function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

run();
