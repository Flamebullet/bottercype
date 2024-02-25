module.exports = {
	name: 'commands',
	description: 'Replies with list of commands, including custom commands',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		let output = 'Custom commands: ',
			commandlist = [],
			channelName = channel.substring(1);

		// add all commands into the array commandlist
		let result = await sql`SELECT * FROM commands WHERE username=${String(channelName)};`;
		result = result.concat(await sql`SELECT * FROM randcommands WHERE username=${String(channelName)};`);
		result = result.concat(await sql`SELECT * FROM countercommands WHERE username=${String(channelName)};`);

		if (result.length > 0) {
			for (let i = 0; i < result.length; i++) {
				commandlist.push(result[i].command);
			}
		}

		commandlist.sort();
		output += commandlist.join(', ');
		commandlist = [];

		output += `. Default commands: `;
		client.commands.forEach((key, value) => {
			commandlist.push(key.name);
		});
		commandlist.sort();
		output += commandlist.join(', ');
		commandlist = [];

		output += `. Use !help for guide on using the commands.`;

		let chunks = output.match(/.{1,500}/g);

		for (let i = 0; i < chunks.length; i++) {
			client.say(channel, chunks[i]);
		}

		return;
	}
};
