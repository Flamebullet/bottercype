module.exports = {
	name: 'bitmsg',
	description: 'add custom message to send to channel on cheer event',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		// check for broadcaster/mod permission
		if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
			return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to add bit event message.`);
		}
		if (
			(message.split(' ')[1].toLowerCase() == 'add' && message.split(' ').length < 3) ||
			(message.split(' ')[1].toLowerCase() == 'remove' && message.split(' ').length < 2)
		) {
			return client.say(channel, `@${tags.username}, failed to add/remove message due to lack of input.`);
		}

		let channelName = channel.substring(1);
		let action = message.split(' ')[1].toLowerCase();
		let output = message.split(' ').slice(2).join(' ');

		let result = await sql`SELECT * FROM bitmsg WHERE username=${String(channelName)};`;
		if (result.length > 0) {
			if (action == 'add') {
				return client.say(channel, `@${tags.username}, failed to add bit event, it already exist.`);
			} else if (action == 'remove') {
				await sql`DELETE FROM bitmsg WHERE username=${String(channelName)};`;
				return client.say(channel, `@${tags.username}, bit event successfully removed.`);
			}
		} else {
			if (action == 'add') {
				await sql`INSERT INTO bitmsg (username, message) VALUES (${String(channelName)}, ${String(output)});`;

				return client.say(channel, `@${tags.username}, bit event has been added successfully!`);
			} else if (action == 'remove') {
				return client.say(
					channel,
					`@${tags.username}, unable to remove bit event as it does not exist, use the command \`!bitmsg add [message]\` to add a bit event message.`
				);
			}
		}
	}
};
