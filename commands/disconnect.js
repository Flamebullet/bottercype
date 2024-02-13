module.exports = {
	name: 'disconnect',
	description: 'Disconnect bot from channel',
	async execute(channel, tags, message, client, sql, authProvider, trClient, followerchannels) {
		if ((tags.badges && tags.badges.broadcaster == '1') || tags.mod) {
			let channelName = channel.substring(1);
			await sql`DELETE FROM channels WHERE username=${String(channelName)};`;
			let result = await sql`SELECT * FROM testchannels WHERE username=${String(channelName)};`;
			if (result.length > 0) {
				await sql`DELETE FROM testchannels WHERE username=${String(channelName)};`;
				client.say(channel, `@${channelName}, Bottercype has disconnected your channel successfully!`);
			}
			return;
		}
		return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to disconnect bot.`);
	}
};
