module.exports = {
	name: 'addcommand',
	description: 'add a custom command to your channel',
	async execute(channel, tags, message, client, sql) {
		// check for broadcaster/mod permission
		if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
			return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to add command.`);
		}
		if (message.split(' ').length < 3) {
			return client.say(channel, `@${tags.username}, failed to add command due to lack of input.`);
		}
		let channelName = channel.substring(1);
		let command = message.split(' ')[1];
		let output = message.split(' ').slice(2).join(' ');

		let result = await sql`SELECT output FROM commands WHERE username=${String(channelName)} AND command=${String(command)};`;
		if (client.commands.get(command) || result.length > 0) {
			return client.say(channel, `@${tags.username}, failed to add command, command already exist.`);
		}
		await sql`INSERT INTO commands (username, command, output) VALUES (${String(channelName)}, ${String(command)}, ${String(output)});`;

		return client.say(channel, `@${tags.username}, new command '${command}' has been added successfully!`);
	}
};
