const { twitchID } = require('../cred.js');
const axios = require('axios');

module.exports = {
	name: 'so',
	description: 'Shoutout another channel',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		// check for broadcaster/mod permission
		if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
			return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to shoutout.`);
		}
		if (message.split(' ').length < 2) {
			return;
		}

		let channelName = channel.substring(1);

		// action for add remove and shouting out
		if (message.split(' ')[1].toLowerCase() == 'add') {
			if (message.split(' ').length < 3) {
				return client.say(
					channel,
					`@${tags.username}, message is required to add a shoutout message, check out https://github.com/Flamebullet/bottercype?tab=readme-ov-file#so more info on how to add a shoutout command.`
				);
			}
			let output = message.split(' ').slice(2).join(' ');
			let result = await sql`SELECT * FROM so WHERE username=${String(channelName)};`;

			if (result.length > 0) {
				return client.say(channel, `@${tags.username}, so message has already been added, use \`!so remove\` to remove the message.`);
			} else {
				await sql`INSERT INTO so (username, message) VALUES (${String(channelName)}, ${String(output)});`;
				return client.say(channel, `@${tags.username}, so message added successfully!`);
			}
		} else if (message.split(' ')[1].toLowerCase() == 'remove') {
			let result = await sql`SELECT * FROM so WHERE username=${String(channelName)};`;

			if (result.length > 0) {
				await sql`DELETE FROM so WHERE username=${String(channelName)};`;
				return client.say(channel, `@${tags.username}, so message removed successfully!`);
			} else {
				return client.say(channel, `@${tags.username}, no shoutout message has been added, use \`!so add\` to add a new message`);
			}
		} else {
			let result = await sql`SELECT * FROM so WHERE username=${String(channelName)};`;
			if (result.length == 0) {
				return;
			}

			const user = message.match(/@(\w+)/) ? message.match(/@(\w+)/)[1] : message.split(' ')[1];

			const userInfo = await axios({
				method: 'get',
				url: `https://api.twitch.tv/helix/users?login=${user}`,
				headers: {
					'Client-ID': twitchID,
					'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
				}
			});

			let userId = userInfo.data.data[0].id;

			if (!userId) return client.say(channel, `@${tags.username}, user \`${user}\` not found`);

			const channelData = (
				await axios.get('https://api.twitch.tv/helix/channels', {
					headers: {
						'Client-ID': twitchID,
						'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
					},
					params: {
						broadcaster_id: userId
					}
				})
			).data.data[0];

			let output = await result[0].message
				.replace('{user}', `@${user}`)
				.replace('{link}', `https://twitch.tv/${user}`)
				.replace('{game}', channelData?.game_name);

			return client.say(channel, output);
		}
	}
};
