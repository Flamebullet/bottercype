module.exports = {
	name: 'hello',
	description: 'replies with world',
	async execute(channel, tags, message, self, client) {
		return client.say(channel, `world`);
	}
};
