const { twitchID } = require('../cred.js');
const axios = require('axios');

module.exports = {
	name: 'followmsg',
	description: 'add a custom message to send in channel on follow event',
	async execute(channel, tags, message, client, sql, authProvider, trClient, followerchannels, TEclient) {
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
				return client.say(channel, `@${tags.username}, follow event message successfully removed.`);
			}
		} else {
			if (action.toLowerCase() == 'add') {
				await sql`INSERT INTO followmsg (username, message) VALUES (${String(channelName)}, ${String(output)});`;
				if (await trClient.getStream(channelName)) {
					if (!followerchannels[channelName]) {
						followerchannels[channelName] = {};
					}
					let followmsgChannel = followerchannels[channelName];

					followmsgChannel.channelFollow = TEclient.register('channelFollow', {
						broadcaster_user_id: userId,
						moderator_user_id: '1031891799'
					});

					followmsgChannel.channelFollow.onTrigger(async (data) => {
						let result = await sql`SELECT message FROM followmsg WHERE username=${String(data.broadcaster_user_login)}`;

						if (result.length > 0) {
							await client.say(`#${data.broadcaster_user_login}`, result[0].message.replace('{user}', `@${data.user_name}`));
						} else {
							followmsgChannel.channelFollow?.unsubscribe();
						}
					});

					followmsgChannel.channelFollow.onError((e) => {
						console.error('TElistener error', e.getResponse());
						fs.appendFile('error.txt', '\n' + 'TElistener error: \n' + e.getResponse(), () => {});
					});
				}

				return client.say(channel, `@${tags.username}, follow event message has been added successfully!`);
			} else if (action.toLowerCase() == 'remove') {
				return client.say(
					channel,
					`@${tags.username}, unable to remove follow event message as it does not exist, use the command \`!followmsg add [message]\` to add a follow event message.`
				);
			}
		}
	}
};
