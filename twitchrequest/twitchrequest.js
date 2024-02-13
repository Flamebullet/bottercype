'use strict';
var __extends =
	(this && this.__extends) ||
	(function () {
		var extendStatics = function (d, b) {
			extendStatics =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function (d, b) {
						d.__proto__ = b;
					}) ||
				function (d, b) {
					for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
				};
			return extendStatics(d, b);
		};
		return function (d, b) {
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
		};
	})();
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function (thisArg, body) {
		var _ = {
				label: 0,
				sent: function () {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: []
			},
			f,
			y,
			t,
			g;
		return (
			(g = { next: verb(0), throw: verb(1), return: verb(2) }),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function () {
					return this;
				}),
			g
		);
		function verb(n) {
			return function (v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while (_)
				try {
					if (
						((f = 1),
						y && (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
exports.__esModule = true;
var events_1 = require('events');
var Request = require('request');
var constants_1 = require('./util/constants');
var isEmpty = function (str) {
	return str == '' || str == null || str == undefined || str.length == 0 || str.trim().length == 0 || str.trim() == '';
};
var isNotEmpty = function (response) {
	return response && response.data && response.data.length;
};
var Client = /** @class */ (function (_super) {
	__extends(Client, _super);
	function Client(options) {
		var _this = _super.call(this) || this;
		/**
		 * @private
		 */
		_this.liveListener = function () {
			return __awaiter(_this, void 0, void 0, function () {
				var token;
				var _this = this;
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							return [4 /*yield*/, this.getToken()];
						case 1:
							token = _a.sent();
							this.channel.forEach(function (ch) {
								return __awaiter(_this, void 0, void 0, function () {
									var response, e, res, r, ee, err_1;
									return __generator(this, function (_a) {
										switch (_a.label) {
											case 0:
												_a.trys.push([0, 6, , 7]);
												return [4 /*yield*/, this.getData('https://api.twitch.tv/helix/search/channels?query=' + ch.name, token)];
											case 1:
												response = _a.sent();
												if (!(response && response.data && response.data.length)) return [3 /*break*/, 5];
												// console.log(response.data);
												e = response.data.find(function (d) {
													return d.broadcaster_login === ch.name;
												});
												return [4 /*yield*/, this.getData('https://api.twitch.tv/helix/games?id=' + e.game_id, token)];
											case 2:
												res = _a.sent();
												if (!(res && res.data && res.data.length)) return [3 /*break*/, 5];
												this.emit(
													constants_1.TwitchRequestEvents.DEBUG,
													new StreamData(e, e.display_name, e.title, res.data[0].name, e.thumbnail_url, null, 0)
												);
												if (!(e && e.is_live && !ch.isLive())) return [3 /*break*/, 4];
												return [4 /*yield*/, this.getData('https://api.twitch.tv/helix/streams?user_login=' + ch.name, token)];
											case 3:
												r = _a.sent();
												if (r && r.data) {
													ee = r.data.find(function (d) {
														return d.user_name.toLowerCase() === ch.name;
													});
													if (r.data.length) {
														if (ee) {
															this.emit(
																constants_1.TwitchRequestEvents.LIVE,
																new StreamData(
																	e,
																	e.display_name,
																	e.title,
																	res.data[0].name,
																	e.thumbnail_url,
																	ee.thumbnail_url.replace('{width}', '440').replace('{height}', '248') +
																		'?r=' +
																		Math.floor(Math.random() * 999999),
																	ee.viewer_count
																)
															);
															ch._setLive();
															ch.liveSince = new Date();
														}
													}
												}
												return [3 /*break*/, 5];
											case 4:
												if (!e.is_live && ch.isLive() && new Date().getTime() - 60000 > ch.liveSince.getTime()) {
													this.emit(
														constants_1.TwitchRequestEvents.UNLIVE,
														new StreamData(e, e.display_name, e.title, res.data[0].name, e.thumbnail_url, null, 0)
													);
													ch._notLive();
													ch.liveSince = undefined;
												}
												_a.label = 5;
											case 5:
												return [3 /*break*/, 7];
											case 6:
												err_1 = _a.sent();
												console.log(err_1);
												return [3 /*break*/, 7];
											case 7:
												return [2 /*return*/];
										}
									});
								});
							});
							return [2 /*return*/];
					}
				});
			});
		};
		/**
		 * @private
		 */
		_this.followListener = function () {
			return __awaiter(_this, void 0, void 0, function () {
				var token;
				var _this = this;
				return __generator(this, function (_a) {
					switch (_a.label) {
						case 0:
							return [4 /*yield*/, this.getToken()];
						case 1:
							token = _a.sent();
							this.channel.forEach(function (ch) {
								return __awaiter(_this, void 0, void 0, function () {
									var userData, response, followedName, followedUserData, streamData, err_2;
									return __generator(this, function (_a) {
										switch (_a.label) {
											case 0:
												_a.trys.push([0, 8, , 9]);
												return [4 /*yield*/, this.getUser(ch.name)];
											case 1:
												userData = _a.sent();
												if (!userData) return [3 /*break*/, 7];
												return [4 /*yield*/, this.getData('https://api.twitch.tv/helix/users/follows?to_id=' + userData.id, token)];
											case 2:
												response = _a.sent();
												if (!(response && response.data && response.data.length)) return [3 /*break*/, 7];
												followedName = response.data[0].from_name;
												if (!!ch.isLoaded) return [3 /*break*/, 3];
												ch.follows = response.total;
												ch.isLoaded = true;
												ch.latest = followedName;
												return [3 /*break*/, 7];
											case 3:
												if (!(response.total > ch.follows && ch.latest !== followedName)) return [3 /*break*/, 6];
												ch.latest = followedName;
												ch.follows = response.total;
												return [4 /*yield*/, this.getUser(followedName.toLowerCase())];
											case 4:
												followedUserData = _a.sent();
												return [4 /*yield*/, this.getStream(ch.name)];
											case 5:
												streamData = _a.sent();
												if (followedUserData && streamData) {
													this.emit(constants_1.TwitchRequestEvents.FOLLOW, followedUserData, streamData);
												}
												return [3 /*break*/, 7];
											case 6:
												if (response.total < ch.follows) {
													ch.follows = response.total;
													ch.latest = followedName;
												}
												_a.label = 7;
											case 7:
												return [3 /*break*/, 9];
											case 8:
												err_2 = _a.sent();
												console.log(err_2);
												return [3 /*break*/, 9];
											case 9:
												return [2 /*return*/];
										}
									});
								});
							});
							return [2 /*return*/];
					}
				});
			});
		};
		/**
		 * Adds a channel to the client to listen to
		 * @param channel A Twitch channel name
		 */
		_this.addChannel = function (channel) {
			if (
				_this.channel.find(function (tch) {
					return tch.name === channel.toLowerCase();
				})
			)
				return;
			var twitchChannel = new TwitchChannel(channel.toLowerCase());
			_this.channel.push(twitchChannel);
		};
		/**
		 * Gets all the subscribed channels
		 * @returns {TwitchChannel[]}
		 */
		_this.allChannels = function () {
			return _this.channel;
		};
		/**
		 * Removes a channel from the client to listen to
		 * @param channel A Twitch channel name
		 */
		_this.removeChannel = function (channel) {
			if (
				!_this.channel.find(function (tch) {
					return tch.name === channel.toLowerCase();
				})
			)
				return;
			var twitchChannel = _this.channel.find(function (tch) {
				return tch.name === channel.toLowerCase();
			});
			var index = _this.channel.indexOf(twitchChannel);
			if (index !== -1) {
				_this.channel.splice(index, 1);
			}
		};
		/**
		 * Check if a channel is included in the client's lists
		 * @param channel A Twitch channel name
		 */
		_this.includesChannel = function (channel) {
			return _this.channel.find(function (tch) {
				return tch.name === channel.toLowerCase();
			})
				? true
				: false;
		};
		/**
		 *
		 * @param {string} username The username of the channel
		 * @returns {Promise<UserData>}
		 */
		_this.getUser = function (username) {
			return __awaiter(_this, void 0, void 0, function () {
				var _this = this;
				return __generator(this, function (_a) {
					return [
						2 /*return*/,
						new Promise(function (resolve, reject) {
							return __awaiter(_this, void 0, void 0, function () {
								var token, response, e, user, err_3;
								return __generator(this, function (_a) {
									switch (_a.label) {
										case 0:
											return [4 /*yield*/, this.getToken()];
										case 1:
											token = _a.sent();
											_a.label = 2;
										case 2:
											_a.trys.push([2, 4, , 5]);
											return [4 /*yield*/, this.getData('https://api.twitch.tv/helix/users?login=' + username.toLowerCase(), token)];
										case 3:
											response = _a.sent();
											if (!isNotEmpty(response)) {
												resolve(undefined);
											} else {
												e = response.data.find(function (d) {
													return d.display_name.toLowerCase() === username.toLowerCase();
												});
												if (e) {
													user = new UserData(
														e,
														e.display_name,
														e.description,
														e.id,
														e.profile_image_url,
														e.view_count,
														e.broadcaster_type
													);
													resolve(user);
												} else {
													resolve(undefined);
												}
											}
											return [3 /*break*/, 5];
										case 4:
											err_3 = _a.sent();
											console.log(err_3);
											return [3 /*break*/, 5];
										case 5:
											return [2 /*return*/];
									}
								});
							});
						})
					];
				});
			});
		};
		/**
		 * Get the total number of follows of a user
		 * @param username The username of the channel
		 */
		_this.getFollows = function (username) {
			return __awaiter(_this, void 0, void 0, function () {
				var promise;
				var _this = this;
				return __generator(this, function (_a) {
					promise = new Promise(function (resolve, reject) {
						return __awaiter(_this, void 0, void 0, function () {
							var token, userData, response;
							return __generator(this, function (_a) {
								switch (_a.label) {
									case 0:
										return [4 /*yield*/, this.getToken()];
									case 1:
										token = _a.sent();
										return [4 /*yield*/, this.getUser(username.toLowerCase())];
									case 2:
										userData = _a.sent();
										if (!userData) return [3 /*break*/, 4];
										return [4 /*yield*/, this.getData('https://api.twitch.tv/helix/users/follows?to_id=' + userData.id, token)];
									case 3:
										response = _a.sent();
										resolve(response.total);
										return [3 /*break*/, 5];
									case 4:
										console.log('[TwitchRequest] Error while fetching user follows! (User=' + username.toLowerCase() + ')');
										resolve(undefined);
										_a.label = 5;
									case 5:
										return [2 /*return*/];
								}
							});
						});
					});
					return [2 /*return*/, promise];
				});
			});
		};
		/**
		 *
		 * @param {string} username The username of the channel
		 * @returns {Promise<StreamData>}
		 */
		_this.getStream = function (username) {
			return __awaiter(_this, void 0, void 0, function () {
				var _this = this;
				return __generator(this, function (_a) {
					return [
						2 /*return*/,
						new Promise(function (resolve, reject) {
							return __awaiter(_this, void 0, void 0, function () {
								var token, response, e, res, ee, userData, stream, err_6;
								return __generator(this, function (_a) {
									switch (_a.label) {
										case 0:
											return [4 /*yield*/, this.getToken()];
										case 1:
											token = _a.sent();
											_a.label = 2;
										case 2:
											_a.trys.push([2, 9, , 10]);
											return [
												4 /*yield*/,
												this.getData('https://api.twitch.tv/helix/streams?user_login=' + username.toLowerCase(), token)
											];
										case 3:
											response = _a.sent();
											if (!!isNotEmpty(response)) return [3 /*break*/, 4];
											resolve(undefined);
											return [3 /*break*/, 8];
										case 4:
											e = response.data.find(function (d) {
												return d.user_name.toLowerCase() === username.toLowerCase();
											});
											if (!!e) return [3 /*break*/, 5];
											resolve(undefined);
											return [3 /*break*/, 8];
										case 5:
											return [
												4 /*yield*/,
												this.getData('https://api.twitch.tv/helix/search/channels?query=' + username.toLowerCase(), token)
											];
										case 6:
											res = _a.sent();
											ee = res.data.find(function (d) {
												return d.display_name.toLowerCase() === username.toLowerCase();
											});
											return [4 /*yield*/, this.getUser(username.toLowerCase())];
										case 7:
											userData = _a.sent();
											stream = new StreamData(
												e,
												e.user_name,
												e.title,
												e.game_name,
												ee.thumbnail_url,
												e.thumbnail_url.replace('{width}', '440').replace('{height}', '248') +
													'?r=' +
													Math.floor(Math.random() * 9999999),
												e.viewer_count,
												userData
											);
											resolve(stream);
											_a.label = 8;
										case 8:
											return [3 /*break*/, 10];
										case 9:
											err_6 = _a.sent();
											console.log(err_6);
											return [3 /*break*/, 10];
										case 10:
											return [2 /*return*/];
									}
								});
							});
						})
					];
				});
			});
		};
		/**
		 * @private
		 */
		_this.getToken = function () {
			return __awaiter(_this, void 0, void 0, function () {
				var _this = this;
				return __generator(this, function (_a) {
					return [
						2 /*return*/,
						new Promise(function (resolve, reject) {
							return __awaiter(_this, void 0, void 0, function () {
								var options;
								return __generator(this, function (_a) {
									options = {
										url: 'https://id.twitch.tv/oauth2/token',
										json: true,
										body: {
											client_id: this.clientid,
											client_secret: this.clientsecret,
											grant_type: 'client_credentials'
										}
									};
									Request.post(options, function (err, res, body) {
										if (err) {
											resolve(undefined);
										} else {
											resolve(res.body.access_token);
										}
									});
									return [2 /*return*/];
								});
							});
						})
					];
				});
			});
		};
		/**
		 * @private
		 * @param url URL
		 * @param token Token
		 */
		_this.getData = function (url, token) {
			return __awaiter(_this, void 0, void 0, function () {
				var _this = this;
				return __generator(this, function (_a) {
					return [
						2 /*return*/,
						new Promise(function (resolve, reject) {
							return __awaiter(_this, void 0, void 0, function () {
								var options;
								return __generator(this, function (_a) {
									options = {
										url: url,
										method: 'GET',
										headers: {
											'client-id': this.clientid,
											'Authorization': 'Bearer ' + token
										}
									};
									Request.get(options, function (err, res, body) {
										if (err) {
											resolve(undefined);
										} else {
											if (body.startsWith('{') && body.endsWith('}')) {
												resolve(JSON.parse(body));
											} else {
												resolve(undefined);
											}
										}
									});
									return [2 /*return*/];
								});
							});
						})
					];
				});
			});
		};
		_this.interval = options.interval * 1000 || 30000;
		_this.channel = [];
		options.channels.forEach(function (ch) {
			var twitchChannel = new TwitchChannel(ch.toLowerCase());
			_this.channel.push(twitchChannel);
		});
		_this.clientid = options.client_id || null;
		_this.clientsecret = options.client_secret || null;
		_this.emit(constants_1.TwitchRequestEvents.READY);
		_this.liveListener();
		_this.followListener();
		setInterval(_this.liveListener, _this.interval);
		setInterval(_this.followListener, _this.interval);
		return _this;
	}
	return Client;
})(events_1.EventEmitter);
var StreamData = /** @class */ (function () {
	function StreamData(r, n, t, g, pfp, tb, v) {
		/**
		 * @constant
		 */
		this.raw = r;
		this.name = n;
		this.title = t;
		this.game = g;
		this.profile = pfp;
		this.thumbnail = tb;
		this.date = new Date();
		this.viewers = v;
		if (!isEmpty(r.started_at)) {
			this.date = new Date(r.started_at);
		}
	}
	return StreamData;
})();
var UserData = /** @class */ (function () {
	function UserData(r, n, d, id, pfp, v, t) {
		this.raw = r;
		this.name = n;
		this.description = d;
		this.id = id;
		this.profile = pfp;
		this.views = v;
		this.type = t;
		if (!isEmpty(r.created_at)) {
			this.created = new Date(r.created_at);
		} else {
			this.created = undefined;
		}
	}
	return UserData;
})();
var TwitchChannel = /** @class */ (function () {
	function TwitchChannel(n) {
		this.name = n;
		this.live = false;
		this.follows = 0;
		this.isLoaded = false;
		this.latest = undefined;
		this.liveSince = undefined;
	}
	/**
	 * **DO NOT USE THIS METHOD OR IT WILL MESS UP THE CLIENT**
	 */
	TwitchChannel.prototype._setLive = function () {
		this.live = true;
	};
	/**
	 * **DO NOT USE THIS METHOD OR IT WILL MESS UP THE CLIENT**
	 */
	TwitchChannel.prototype._notLive = function () {
		this.live = false;
	};
	/**
	 * Check if the channel is live according to the client
	 */
	TwitchChannel.prototype.isLive = function () {
		return this.live;
	};
	return TwitchChannel;
})();
var isEmpty = function (str) {
	return str == '' || str == null || str == undefined || str.length == 0 || str.trim().length == 0 || str.trim() == '';
};
module.exports = {
	TRClient: Client,
	StreamData: StreamData,
	UserData: UserData,
	TwitchChannel: TwitchChannel
};