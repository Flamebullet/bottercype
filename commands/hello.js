module.exports = {
	name: 'hello',
	description: 'replies with world',
	async execute(channel, tags, message, client, sql, authProvider, trClient, followerchannels) {
		return client.say(channel, `world`);
	}
};
