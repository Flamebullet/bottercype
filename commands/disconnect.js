module.exports = {
	name: 'disconnect',
	description: 'Disconnect bot from channel',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		if ((tags.badges && tags.badges.broadcaster == '1') || tags.mod) {
			let channelName = channel.substring(1);
			(await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`).forEach(async (result) => {
				await sql`DELETE FROM ${sql(result.table_name)} WHERE username=${String(channelName)};`;
			});

			return;
		}
		return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to disconnect bot.`);
	}
};
