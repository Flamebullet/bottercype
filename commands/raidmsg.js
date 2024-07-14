module.exports = {
	name: 'raidmsg',
	description: 'add custom message to send when raided',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		// check for broadcaster/mod permission
		if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
			return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to add raid message event message.`);
		}
		if (
			(message.split(' ')[1].toLowerCase() == 'add' && message.split(' ').length < 3) ||
			(message.split(' ')[1].toLowerCase() == 'remove' && message.split(' ').length < 2)
		) {
			return client.say(channel, `@${tags.username}, failed to add/remove message due to lack of input.`);
		}

		let channelName = channel.substring(1);
		let action = message.split(' ')[1].toLowerCase();
		let autoso = Boolean(message.split(' ')[2].toLowerCase());
		let output = message.split(' ').slice(3).join(' ');

		let result = await sql`SELECT * FROM raidmsg WHERE username=${String(channelName)};`;
		if (result.length > 0) {
			if (action == 'add') {
				return client.say(channel, `@${tags.username}, failed to add raid message event, it already exist.`);
			} else if (action == 'remove') {
				await sql`DELETE FROM raidmsg WHERE username=${String(channelName)};`;
				return client.say(channel, `@${tags.username}, raid message event successfully removed.`);
			}
		} else {
			if (action == 'add') {
				await sql`INSERT INTO raidmsg (username, message, autoso) VALUES (${String(channelName)}, ${String(output)}, ${autoso});`;

				return client.say(channel, `@${tags.username}, raid message event has been added successfully!`);
			} else if (action == 'remove') {
				return client.say(
					channel,
					`@${tags.username}, unable to remove raid message event as it does not exist, use the command \`!raidmsg add [message]\` to add a raid message event message.`
				);
			}
		}
	}
};
