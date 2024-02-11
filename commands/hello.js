module.exports = {
	name: 'hello',
	description: 'replies with world',
	async execute(channel, tags, message, client, sql) {
		return client.say(channel, `world`);
	}
};
