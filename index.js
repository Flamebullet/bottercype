const fs = require('fs');
const tmi = require('tmi.js');
const postgres = require('postgres');
const { TRClient } = require('./twitchrequest/twitchrequest.js');
const prefix = '!';

const { username, password, twitchID, twitchSecret, databaseUrl } = require('./cred.js');

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

		// listen to channels to go live
		(await sql`SELECT DISTINCT username FROM channels;`).forEach(async (result) => {
			const userData = await trClient.getUser(result.username);

			if (!userData) {
				await sql`DELETE FROM channels WHERE username=${String(result.username)};`;
				return;
			}
			trClient.addChannel(result.username);
		});

		// connect to test channels regardless of live status
		(await sql`SELECT DISTINCT username FROM testchannels;`).forEach(async (result) => {
			await client.join(result.username);
			await wait(3000);
		});

		// connect to live channels
		trClient.on('live', async (data) => {
			await client.join(data.raw.broadcaster_login);
			await wait(3000);
			let inTest = await sql`SELECT username FROM testchannels;`;
			if (inTest.length > 0) {
				await sql`DELETE FROM testchannels WHERE username=${String(data.raw.broadcaster_login)};`;
			}
		});

		// Disconnect to offline channels
		trClient.on('unlive', async (data) => {
			await client.disconnect(data.raw.broadcaster_login);
		});

		// when receive message in live/test channels
		client.on('message', (channel, tags, message, self) => {
			// Ignore echoed messages.
			if (self) return;
			if (self || !message.startsWith(prefix)) return;

			const args = message.substring(prefix.length).split(' ');
			const command = args[0].toLowerCase();

			try {
				client.commands.get(command).execute(channel, tags, message, self, client);
			} catch (err) {}
		});
		client.on('error', (err) => {
			console.log(err);
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
