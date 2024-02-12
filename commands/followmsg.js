module.exports = {
	name: 'followmsg',
	description: 'add a custom command to your channel',
	async execute(channel, tags, message, client, sql) {
		// check for broadcaster/mod permission
		if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
			return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to add command.`);
		}
		if (message.split(' ').length < 3) {
			return client.say(channel, `@${tags.username}, failed to add command due to lack of input.`);
		}
		if (message.split(' ')[1].toLowerCase() != 'add' && message.split(' ')[1].toLowerCase() != 'remove') {
			return client.say(channel, `@${tags.username}, failed to add command, unknown action used.`);
		}
		let channelName = channel.substring(1);
		let action = message.split(' ')[1];
		let output = message.split(' ').slice(2).join(' ');

		let result = await sql`SELECT * FROM followmsg WHERE username=${String(channelName)};`;
		if (result.length > 0) {
			if (action.toLowerCase() == 'add') {
				return client.say(channel, `@${tags.username}, failed to add follow message, it already exist.`);
			} else if (action.toLowerCase() == 'remove') {
				await sql`DELETE FROM followmsg WHERE username=${String(channelName)};`;
				return client.say(channel, `@${tags.username}, follow message successfully removed.`);
			}
		} else {
			if (action.toLowerCase() == 'add') {
				await sql`INSERT INTO followmsg (username, message) VALUES (${String(channelName)}, ${String(output)});`;

				return client.say(channel, `@${tags.username}, follow message has been added successfully!`);
			} else if (action.toLowerCase() == 'remove') {
				return client.say(
					channel,
					`@${tags.username}, unable to remove follow message as it does not exist, use the command \`!followmsg add [message]\` to add a follow message.`
				);
			}
		}
	}
};
