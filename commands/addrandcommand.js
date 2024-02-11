module.exports = {
	name: 'addrandcommand',
	description: 'add a custom command that rolls a random number to your channel',
	async execute(channel, tags, message, client, sql) {
		// check for broadcaster/mod permission
		if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
			return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to add command.`);
		}
		if (message.split(' ').length < 5) {
			return client.say(channel, `@${tags.username}, failed to add command due to lack of input.`);
		}
		if (!Number.isInteger(parseInt(message.split(' ')[2])) || !Number.isInteger(parseInt(message.split(' ')[3]))) {
			return client.say(channel, `@${tags.username}, failed to add command due to min and/or max values not being integers.`);
		}

		let channelName = channel.substring(1);
		let command = message.split(' ')[1];
		let min = parseInt(message.split(' ')[2]);
		let max = parseInt(message.split(' ')[3]);
		let output = message.split(' ').slice(4).join(' ');
		let result = await sql`SELECT output FROM commands WHERE username=${String(channelName)} AND command=${String(command)}`;
		if (client.commands.get(command) || result.length > 0) {
			return client.say(channel, `@${tags.username}, failed to add command, command already exists.`);
		}

		await sql`INSERT INTO randcommands (username, command, min , max, output) VALUES (${String(channelName)}, ${String(command)}, ${min},${max}, ${String(
			output
		)});`;

		return client.say(channel, `@${tags.username}, new command '${command}' has been added successfully!`);
	}
};
