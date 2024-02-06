module.exports = {
	name: 'gay',
	description: 'return a random percentage of gay',
	async execute(channel, tags, message, self, client) {
		let min = 0;
		let max = 200;
		let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

		return client.say(channel, `@${tags.username}, you are ${randomNumber}% gay!`);
	}
};
