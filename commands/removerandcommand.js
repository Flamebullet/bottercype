module.exports = {
	name: 'removerandcommand',
	description: 'removes a custom rng command from your channel',
	async execute(channel, tags, message, client, sql, authProvider, trClient, followerchannels, TEclient) {
		// check for broadcaster/mod permission
		if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
			return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to remove command.`);
		}
		if (message.split(' ').length < 2) {
			return client.say(channel, `@${tags.username}, failed to remove command due to lack of input.`);
		}
		let channelName = channel.substring(1);
		let command = message.split(' ')[1];

		let result = await sql`SELECT * FROM randcommands WHERE username=${String(channelName)} AND command=${String(command)};`;
		if (client.commands.get(command) || result.length == 0) {
			return client.say(channel, `@${tags.username}, failed to remove command, command does not exist.`);
		}
		await sql`DELETE FROM randcommands WHERE username=${String(channelName)} AND command=${String(command)};`;

		return client.say(channel, `@${tags.username}, command '${command}' has been removed successfully!`);
	}
};
