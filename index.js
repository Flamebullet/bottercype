const fs = require('fs');
const tmi = require('tmi.js');
const postgres = require('postgres');
const { TRClient } = require('./twitchrequest/twitchrequest.js');
const prefix = '!';
const createSubscriber = require('pg-listen');
const { EventSub } = require('@twapi/eventsub');
const { Credentials, AuthProvider } = require('@twapi/auth');
const axios = require('axios');

const { username, password, twitchtoken, twitchrefresh, twitchID, twitchSecret, databaseUrl } = require('./cred.js');

// global variables
let acceptedChannels = [];
let followerchannels = {};

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
		// Connecting to twitch event sub
		const credentials = new Credentials(twitchtoken, twitchID, twitchSecret, twitchrefresh);
		const authProvider = new AuthProvider(credentials);

		const TEclient = new EventSub(authProvider);
		TEclient.run();

		// (await sql`SELECT * FROM followmsg`).forEach(async (d) => {
		// 	if (!followerchannels[d.username]) {
		// 		followerchannels[d.username] = {};
		// 	}
		// 	let followmsgChannel = followerchannels[d.username];

		// 	const userId = (await trClient.getUser(d.username)).id;
		// 	if (userId) {
		// 		followmsgChannel.channelFollow = TEclient.register('channelFollow', {
		// 			broadcaster_user_id: userId,
		// 			moderator_user_id: '1031891799'
		// 		});

		// 		followmsgChannel.channelFollow.onTrigger(async (data) => {
		// 			await client.say(`#${data.broadcaster_user_login}`, d.message.replace('{user}', `@${data.user_name}`));
		// 		});

		// 		followmsgChannel.channelFollow.onError((e) => {
		// 			console.error('TElistener error', e.getResponse());
		// 			fs.appendFile('error.txt', '\n' + 'TElistener error: \n' + e.getResponse(), () => {});
		// 		});
		// 	} else {
		// 		console.log('User not found and removed from database');
		// 		await sql`DELETE FROM followmsg WHERE username=${String(d.username)};`;
		// 	}
		// });

		// Trigger when user created followmsg
		subscriber.notifications.on('followmsgsetup', async (payload) => {
			try {
				if (payload.status === 'INSERT') {
					if (!followerchannels[payload.username]) {
						followerchannels[payload.username] = {};
					}
				} else {
					followerchannels[payload.username] = {};
				}
			} catch (err) {
				console.error('Error setting up follow message', err);
				fs.appendFile('error.txt', '\n' + 'Error setting up follow message: \n' + err, () => {});
			}
		});

		// Trigger when user register on website (test channel users)
		subscriber.notifications.on('followedchannel', async (payload) => {
			try {
				if (payload.status === 'INSERT') {
					await client.join(payload.username);
				}
			} catch (err) {
				console.error('Error joining or disconnecting twitch channel', err);
				fs.appendFile('error.txt', '\n' + 'Error joining or disconnecting twitch channel: \n' + err, () => {});
			}
		});

		// trigger when user use !connect or !disconnect
		subscriber.notifications.on('acceptedchannel', async (payload) => {
			try {
				if (payload.status === 'INSERT') {
					trClient.addChannel(payload.username);
					acceptedChannels.push(payload.username);
				} else if (payload.status === 'DELETE') {
					trClient.removeChannel(payload.username);
					acceptedChannels.splice(acceptedChannels.indexOf(payload.username), 1);

					client.say(`#${payload.username}`, `@${payload.username}, Bottercype has left your channel successfully!`);
					await client.part(payload.username);
				}
			} catch (err) {
				console.error('Error joining or disconnecting twitch channel', err);
				fs.appendFile('error.txt', '\n' + 'Error joining or disconnecting twitch channel: \n' + err, () => {});
			}
		});

		subscriber.events.on('error', (err) => {
			console.error('fatal database error:', err);
			fs.appendFile('error.txt', '\n' + 'fatal database error: \n' + err, () => {});
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
			// logging
			fs.appendFile('error.txt', '\n' + 'live event: \n' + data.raw, () => {});
			await client.join(data.raw.broadcaster_login);

			const userId = (await trClient.getUser(data.raw.broadcaster_login)).id;
			if (!userId) {
				console.log('User not found and removed from database');
				await sql`DELETE FROM followmsg WHERE username=${String(data.raw.broadcaster_login)};`;
				await sql`DELETE FROM submsg WHERE username=${String(data.raw.broadcaster_login)};`;
			}

			if (!followerchannels[data.raw.broadcaster_login]) {
				followerchannels[data.raw.broadcaster_login] = {};
			}
			let followmsgChannel = followerchannels[data.raw.broadcaster_login];

			const a = await sql`SELECT * FROM followmsg WHERE username=${data.raw.broadcaster_login}`;
			if (a.length > 0) {
				// Follow message
				followmsgChannel.channelFollow = TEclient.register('channelFollow', {
					broadcaster_user_id: userId,
					moderator_user_id: '1031891799'
				});

				followmsgChannel.channelFollow.onTrigger(async (data) => {
					await client.say(`#${data.broadcaster_user_login}`, a[0].message.replace('{user}', `@${data.user_name}`));
				});

				followmsgChannel.channelFollow.onError((e) => {
					console.error('TEListener error', e.getResponse());
					fs.appendFile('error.txt', '\n' + 'channelFollow error: \n' + e.getResponse(), () => {});
				});
			}

			const b = await sql`SELECT * FROM submsg WHERE username=${data.raw.broadcaster_login}`;
			if (b.length > 0) {
				for (let i in b) {
					if (b[i].type == 'sub') {
						// Sub message
						followmsgChannel.channelSubscribe = TEclient.register('channelSubscribe', {
							broadcaster_user_id: userId
						});

						followmsgChannel.channelSubscribe.onTrigger(async (data) => {
							await client.say(
								`#${data.broadcaster_user_login}`,
								b[i].message.replace('{user}', `@${data.user_name}`).replace('{tier}', `${String(parseInt(data.tier) / 1000)}`)
							);
						});

						followmsgChannel.channelSubscribe.onError((e) => {
							console.error('TEListener error', e.getResponse());
							fs.appendFile('error.txt', '\n' + 'channelSubscribe error: \n' + e.getResponse(), () => {});
						});
					} else if (b[i].type == 'resub') {
					} else if (b[i].type == 'giftsub') {
					}
				}
			}

			client.say(`#${data.raw.broadcaster_login}`, `Bottercype has joined the channel!`);
		});

		// Disconnect to offline channels
		trClient.on('unlive', async (data) => {
			await client.part(data.raw.broadcaster_login);

			let inTest = await sql`SELECT username FROM testchannels;`;
			if (inTest.length > 0) {
				await sql`DELETE FROM testchannels WHERE username=${String(data.raw.broadcaster_login)};`;
			}

			let d = await sql`SELECT username FROM followmsg`;
			if (d.length > 0) {
				if (!followerchannels[d.username]) {
					followerchannels[d.username] = {};
				}
				let followmsgChannel = followerchannels[d.username];

				if (data.length > 0) {
					followmsgChannel.channelFollow?.unsubscribe();
				} else {
					console.log('User not found and removed from database');
					await sql`DELETE FROM followmsg WHERE username=${String(d.username)};`;
				}
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
					client.commands.get(command).execute(channel, tags, message, client, sql, authProvider, trClient, followerchannels, TEclient);
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
						let output = await result[0].output.replace('{user}', `@${user}`).replace('{value}', value);
						client.say(channel, output);
					}
				}
			} else {
				if (command == 'connect') {
					client.commands.get(command).execute(channel, tags, message, client, sql, authProvider, trClient, followerchannels, TEclient);
				} else if (client.commands.get(command)) {
					client.say(
						channel,
						`The channel broadcaster must use !connect to officially join the bot to the channel to start using commands. If you wish to remove the bot, head to https://yt-dl.asuscomm.com/twitch-bot/bottercype to remove it.`
					);
				}
			}
		});
		client.on('error', (err) => {
			console.error('client error:', err);
			fs.appendFile('error.txt', '\n' + 'client error: \n' + err, () => {});
		});
	} catch (err) {
		console.error('run() error', err);
		fs.appendFile('error.txt', '\n' + 'run() error: \n' + err, () => {});
	}
};

// functions
function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

run();
