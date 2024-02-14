const { twitchID } = require('../cred.js');
const axios = require('axios');

module.exports = {
	name: 'submsg',
	description: 'add custom message to user on subscriber event',
	async execute(channel, tags, message, client, sql, authProvider, trClient, followerchannels, TEclient) {
		// check for broadcaster/mod permission
		if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
			return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to add subscriber event message.`);
		}
		if (
			(message.split(' ')[1].toLowerCase() == 'add' && message.split(' ').length < 3) ||
			(message.split(' ')[1].toLowerCase() == 'remove' && message.split(' ').length < 2)
		) {
			return client.say(channel, `@${tags.username}, failed to add/remove message due to lack of input.`);
		}
		if (message.split(' ')[1].toLowerCase() != 'addsub' && message.split(' ')[1].toLowerCase() != 'removesub') {
			return client.say(channel, `@${tags.username}, failed to add/remove message, unknown action used.`);
		}
		let channelName = channel.substring(1);
		let action = message.split(' ')[1];
		let output = message.split(' ').slice(2).join(' ');

		let result = await sql`SELECT * FROM submsg WHERE username=${String(channelName)};`;
		if (result.length > 0) {
			if (action.toLowerCase() == 'addsub') {
				return client.say(channel, `@${tags.username}, failed to add subscriber event, it already exist.`);
			} else if (action.toLowerCase() == 'removesub') {
				await sql`DELETE FROM submsg WHERE username=${String(channelName)} AND type='sub';`;
				return client.say(channel, `@${tags.username}, subscriber event successfully removed.`);
			}
		} else {
			if (action.toLowerCase() == 'addsub') {
				await sql`INSERT INTO submsg (username, message, type) VALUES (${String(channelName)}, ${String(output)}, 'sub');`;

				if (await trClient.getStream(channelName)) {
					if (!followerchannels[channelName]) {
						followerchannels[channelName] = {};
					}
					let followmsgChannel = followerchannels[channelName];

					followmsgChannel.channelSubscribe = TEclient.register('channelSubscribe', {
						broadcaster_user_id: userId
					});

					followmsgChannel.channelSubscribe.onTrigger(async (data) => {
						let result = await sql`SELECT message FROM submsg WHERE username=${String(data.broadcaster_user_login)} AND type='sub';`;

						if (result.length > 0) {
							await client.say(
								`#${data.broadcaster_user_login}`,
								result[0].message.replace('{user}', `@${data.user_name}`).replace('{tier}', `${String(parseInt(data.tier) / 1000)}`)
							);
						} else {
							followmsgChannel.channelSubscribe.unsubscribe();
						}
					});

					followmsgChannel.channelSubscribe.onError((e) => {
						console.error('TEListener error', e.getResponse());
						fs.appendFile('error.txt', '\n' + 'channelSubscribe error: \n' + e.getResponse(), () => {});
					});
				}

				return client.say(channel, `@${tags.username}, subscriber event has been added successfully!`);
			} else if (action.toLowerCase() == 'removesub') {
				return client.say(
					channel,
					`@${tags.username}, unable to remove subscriber event as it does not exist, use the command \`!sub add [message]\` to add a subscriber event message.`
				);
			}
		}
	}
};
