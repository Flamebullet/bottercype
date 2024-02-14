module.exports = {
	name: 'connect',
	description: 'Connect bot to channel',
	async execute(channel, tags, message, client, sql, authProvider, trClient, followerchannels, TEclient) {
		if ((tags.badges && tags.badges.broadcaster == '1') || tags.mod) {
			let channelName = channel.substring(1);
			await sql`DELETE FROM testchannels WHERE username=${String(channelName)};`;
			await sql`INSERT INTO channels (username) VALUES (${String(channelName)});`;

			return client.say(channel, `@${tags.username}, Bottercype has joined your channel successfully!`);
		}
		return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to connect bot.`);
	}
};
