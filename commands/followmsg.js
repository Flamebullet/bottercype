const { twitchID } = require('../cred.js');
const axios = require('axios');

module.exports = {
	name: 'followmsg',
	description: 'add a custom message to send in channel on follow event',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		// check for broadcaster/mod permission
		if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
			return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to add command.`);
		}
		if (
			(message.split(' ')[1].toLowerCase() == 'add' && message.split(' ').length < 3) ||
			(message.split(' ')[1].toLowerCase() == 'remove' && message.split(' ').length < 2)
		) {
			return client.say(channel, `@${tags.username}, failed to add/remove message due to lack of input.`);
		}
		if (message.split(' ')[1].toLowerCase() != 'add' && message.split(' ')[1].toLowerCase() != 'remove') {
			return client.say(channel, `@${tags.username}, failed to add/remove message, unknown action used.`);
		}
		let channelName = channel.substring(1);
		let action = message.split(' ')[1];
		let output = message.split(' ').slice(2).join(' ');

		let cursor = '';
		while (true) {
			const result = await axios({
				method: 'get',
				url: `https://api.twitch.tv/helix/moderation/channels?user_id=1031891799&first=100&after=${cursor}`,
				headers: {
					'Client-ID': twitchID,
					'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
				}
			});

			if (result.data.data.some((broadcaster) => broadcaster.broadcaster_login == channelName)) {
				break;
			} else if (result.data.pagination?.cursor) {
				cursor = result.data.pagination?.cursor;
				continue;
			} else {
				return client.say(channel, '@Bottercype must be a mod to use this function');
			}
		}

		let result = await sql`SELECT * FROM followmsg WHERE username=${String(channelName)};`;
		if (result.length > 0) {
			if (action.toLowerCase() == 'add') {
				return client.say(channel, `@${tags.username}, failed to add follow event message, it already exist.`);
			} else if (action.toLowerCase() == 'remove') {
				await sql`DELETE FROM followmsg WHERE username=${String(channelName)};`;
				return;
			}
		} else {
			if (action.toLowerCase() == 'add') {
				await sql`INSERT INTO followmsg (username, message) VALUES (${String(channelName)}, ${String(output)});`;

				return;
			} else if (action.toLowerCase() == 'remove') {
				return client.say(
					channel,
					`@${tags.username}, unable to remove follow event message as it does not exist, use the command \`!followmsg add [message]\` to add a follow event message.`
				);
			}
		}
	}
};
