module.exports = {
	name: 'addcountercommand',
	description: 'add a custom command that counts to your channel',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
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

		// check if custom command already exists
		let result = await sql`SELECT output FROM commands WHERE username=${String(channelName)} AND command=${String(command)};`;
		result = result.concat(await sql`SELECT output FROM randcommands WHERE username=${String(channelName)} AND command=${String(command)}`);
		result = result.concat(await sql`SELECT output FROM countercommands WHERE username=${String(channelName)} AND command=${String(command)}`);

		if (client.commands.get(command) || result.length > 0) {
			return client.say(channel, `@${tags.username}, failed to add command, command already exist in command, randcommand or countercommand.`);
		}

		await sql`INSERT INTO countercommands (username, command, count, output) VALUES (${String(channelName)}, ${String(command)}, ${String('0')}, ${String(
			output
		)});`;

		return client.say(channel, `@${tags.username}, new command '${command}' has been added successfully!`);
	}
};
