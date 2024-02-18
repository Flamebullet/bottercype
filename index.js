const fs = require('fs');
const tmi = require('tmi.js');
const postgres = require('postgres');
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
	options: { debug: false },
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

const run = async () => {
	try {
		await client.connect();
		await subscriber.connect();
		await subscriber.listenTo('followedchannel');
		await subscriber.listenTo('followmsgsetup');
		await subscriber.listenTo('acceptedchannel');
		// Connecting to twitch event sub
		const credentials = new Credentials(twitchtoken, twitchID, twitchSecret, twitchrefresh);
		const authProvider = new AuthProvider(credentials);

		const TEclient = new EventSub(authProvider);
		TEclient.run();

		// listen to channels to go live
		await sql`SELECT DISTINCT username FROM channels;`.then(async (results) => {
			let toAdd = [];
			for (let i = 0; i < results.length; i++) {
				if (!followerchannels[results[i].username]) {
					followerchannels[results[i].username] = {};
				}
				acceptedChannels.push(results[i].username);
				toAdd.push(results[i].username);
				await client.join(results[i].username);
			}

			while (toAdd.length > 0) {
				let params = '';
				let chunk = toAdd.splice(0, Math.min(100, toAdd.length));

				// Add each item to the string
				for (let item of chunk) {
					params += `login=${item}&`;
				}

				// Remove the trailing '&'
				params = params.slice(0, -1);

				const result = await axios({
					method: 'get',
					url: `https://api.twitch.tv/helix/users?${params}`,
					headers: {
						'Client-ID': twitchID,
						'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
					}
				});

				result.data.data.forEach(async (data) => {
					let followChannel = followerchannels[data.login];
					let currentlyLive = await axios({
						method: 'get',
						url: `https://api.twitch.tv/helix/streams?user_id${data.id}&type=live`,
						headers: {
							'Client-ID': twitchID,
							'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
						}
					});

					if (currentlyLive.data.data.length != 0) {
						client.say(
							`#${currentlyLive.data.data[0].user_login}`,
							`@${currentlyLive.data.data[0].user_login} is LIVE! Streaming ${currentlyLive.data.data[0].game_name}`
						);
					}

					followChannel.streamOnline = TEclient.register('streamOnline', {
						broadcaster_user_id: String(data.id)
					});

					followChannel.streamOnline.onTrigger(async (data) => {
						let currentlyLive = await axios({
							method: 'get',
							url: `https://api.twitch.tv/helix/streams?user_id${data.broadcaster_user_id}&type=live`,
							headers: {
								'Client-ID': twitchID,
								'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
							}
						});

						client.say(
							`#${data.broadcaster_user_login}`,
							`@${data.broadcaster_user_login} is LIVE! Streaming ${currentlyLive.data.data[0].game_name}`
						);
					});

					followChannel.streamOnline.onError((e) => {
						console.error('TElistener error', e.getResponse());
						fs.appendFile('error.txt', '\n' + 'TElistener error: \n' + e.getResponse(), () => {});
					});
				});
			}
		});

		// connect to test channels regardless of live status
		(await sql`SELECT DISTINCT username FROM testchannels;`).forEach(async (result) => {
			await client.join(result.username);
		});

		(await sql`SELECT * FROM followmsg`).forEach(async (d) => {
			if (!followerchannels[d.username]) {
				followerchannels[d.username] = {};
			}
			let followChannel = followerchannels[d.username];

			const userInfo = await axios({
				method: 'get',
				url: `https://api.twitch.tv/helix/users?login=${payload.username}`,
				headers: {
					'Client-ID': twitchID,
					'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
				}
			});

			let userId = userInfo.data.data[0].id;

			if (userId) {
				followChannel.channelFollow = TEclient.register('channelFollow', {
					broadcaster_user_id: userId,
					moderator_user_id: '1031891799'
				});

				followChannel.channelFollow.onTrigger(async (data) => {
					await client.say(`#${data.broadcaster_user_login}`, d.message.replace('{user}', `@${data.user_name}`));
				});

				followChannel.channelFollow.onError((e) => {
					console.error('TElistener error', e.getResponse());
					fs.appendFile('error.txt', '\n' + 'TElistener error: \n' + e.getResponse(), () => {});
				});
			} else {
				console.log('User not found and removed from database');
				await sql`DELETE FROM followmsg WHERE username=${String(d.username)};`;
			}
		});

		// Trigger when user created followmsg
		subscriber.notifications.on('followmsgsetup', async (payload) => {
			try {
				if (payload.status === 'INSERT') {
					if (!followerchannels[payload.username]) {
						followerchannels[payload.username] = {};
					}
					let followChannel = followerchannels[payload.username];

					const result = await axios({
						method: 'get',
						url: `https://api.twitch.tv/helix/users?login=${payload.username}`,
						headers: {
							'Client-ID': twitchID,
							'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
						}
					});

					let userId = result.data.data[0].id;

					followChannel.channelFollow = TEclient.register('channelFollow', {
						broadcaster_user_id: userId,
						moderator_user_id: '1031891799'
					});

					followChannel.channelFollow.onTrigger(async (data) => {
						let result = await sql`SELECT message FROM followmsg WHERE username=${String(data.broadcaster_user_login)}`;

						if (result.length > 0) {
							await client.say(`#${data.broadcaster_user_login}`, result[0].message.replace('{user}', `@${data.user_name}`));
						} else {
							followChannel.channelFollow?.unsubscribe();
						}
					});

					followChannel.channelFollow.onError((e) => {
						console.error('TElistener error', e.getResponse());
						fs.appendFile('error.txt', '\n' + 'TElistener error: \n' + e.getResponse(), () => {});
					});

					client.say(`#${payload.username}`, `@${payload.username}, follow event message has been added successfully!`);
				} else {
					let followChannel = followerchannels[payload.username];
					followChannel.channelFollow?.unsubscribe();
					client.say(`#${payload.username}`, `@${payload.username}, follow event message successfully removed.`);
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
					if (!followerchannels[payload.username]) {
						followerchannels[payload.username] = {};
					}
					let followChannel = followerchannels[payload.username];

					const result = await axios({
						method: 'get',
						url: `https://api.twitch.tv/helix/users?login=${payload.username}`,
						headers: {
							'Client-ID': twitchID,
							'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
						}
					});

					result.data.data.forEach(async (data) => {
						let currentlyLive = await axios({
							method: 'get',
							url: `https://api.twitch.tv/helix/streams?user_id${data.id}&type=live`,
							headers: {
								'Client-ID': twitchID,
								'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
							}
						});

						if (currentlyLive.data.data.length != 0) {
							client.say(
								`#${currentlyLive.data.data[0].user_login}`,
								`@${currentlyLive.data.data[0].user_login} is LIVE! Streaming ${currentlyLive.data.data[0].game_name}`
							);
						}

						followChannel.streamOnline = TEclient.register('streamOnline', {
							broadcaster_user_id: String(data.id)
						});

						followChannel.streamOnline.onTrigger(async (data) => {
							let currentlyLive = await axios({
								method: 'get',
								url: `https://api.twitch.tv/helix/streams?user_id${data.broadcaster_user_id}&type=live`,
								headers: {
									'Client-ID': twitchID,
									'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
								}
							});

							client.say(
								`#${data.broadcaster_user_login}`,
								`@${data.broadcaster_user_login} is LIVE! Streaming ${currentlyLive.data.data[0].game_name}`
							);
						});

						followChannel.streamOnline.onError((e) => {
							console.error('TElistener error', e.getResponse());
							fs.appendFile('error.txt', '\n' + 'TElistener error: \n' + e.getResponse(), () => {});
						});
					});

					acceptedChannels.push(payload.username);
				} else if (payload.status === 'DELETE') {
					let followChannel = followerchannels[payload.username];
					followChannel?.streamOnline?.unsubscribe();
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

		client.on('subscription', async (channel, username, methods, message, userstate) => {
			const result = await sql`SELECT * FROM submsg WHERE username=${channel.substring(1)} AND type='sub'`;
			if (result.length > 0) {
				const tier = methods.prime ? 'Prime' : `tier ${parseInt(methods.plan) / 1000}`;
				await client.say(channel, result.message.replace('{user}', `@${username}`).replace('{tier}', `${String(tier)}`));
			}
		});

		client.on('resub', async (channel, username, months, message, userstate, methods) => {
			const result = await sql`SELECT * FROM submsg WHERE username=${channel.substring(1)} AND type='resub'`;
			if (result.length > 0) {
				const tier = methods.prime ? 'Prime' : `tier ${parseInt(methods.plan) / 1000}`;
				await client.say(
					channel,
					result.message
						.replace('{user}', `@${username}`)
						.replace('{tier}', `${String(tier)}`)
						.replace('{duration}', `${~~userstate['msg-param-cumulative-months']} months`)
				);
			}
		});

		client.on('submysterygift', async (channel, username, numbOfSubs, methods, userstate) => {
			const result = await sql`SELECT * FROM submsg WHERE username=${channel.substring(1)} AND type='giftsub'`;
			if (result.length > 0) {
				const tier = methods.prime ? 'Prime' : `tier ${parseInt(methods.plan) / 1000}`;
				await client.say(
					channel,
					result.message
						.replace('{user}', `@${username}`)
						.replace('{subcount}', String(numbOfSubs))
						.replace('{tier}', `${String(tier)}`)
						.replace('{totalcount}', ~~userstate['msg-param-sender-count'])
				);
			}
		});

		client.on('cheer', async (channel, userstate, message) => {
			const result = await sql`SELECT * FROM bitmsg WHERE username=${channel.substring(1)}`;
			if (result.length > 0) {
				await client.say(channel, result.message.replace('{user}', `@${userstate['display-name']}`).replace('{bits}', userstate.bits));
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
					client.commands.get(command).execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient);
				} else {
					// execute custom command
					let result = await sql`SELECT output FROM commands WHERE username=${String(channelName)} AND command=${String(command)}`;
					if (result.length > 0) {
						let user = message.match(/@(\w+)/) ? message.match(/@(\w+)/)[1] : args.length > 1 ? args[1] : tags.username;
						let output = await result[0].output.replace('{user}', `@${user}`);
						client.say(channel, output);
					}

					// execute custom rand command
					result = await sql`SELECT min, max, output FROM randcommands WHERE username=${String(channelName)} AND command=${String(command)}`;
					if (result.length > 0) {
						let user = message.match(/@(\w+)/) ? message.match(/@(\w+)/)[1] : args.length > 1 ? args[1] : tags.username;
						let value = Math.floor(Math.random() * (parseInt(result[0].max) - parseInt(result[0].min) + 1)) + parseInt(result[0].min);
						let output = await result[0].output.replace('{user}', `@${user}`).replace('{value}', value);
						client.say(channel, output);
					}
				}
			} else {
				if (command == 'connect') {
					client.commands.get(command).execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient);
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
