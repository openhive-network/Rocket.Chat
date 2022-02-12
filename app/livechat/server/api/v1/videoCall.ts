import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Random } from 'meteor/random';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { Messages, Rooms } from '../../../../models/server/index';
import { settings as rcSettings } from '../../../../settings/server';
import { API } from '../../../../api/server';
import { findGuest, getRoom, settings } from '../lib/livechat';
import { OmnichannelSourceType } from '../../../../../definition/IRoom';
import { hasPermission, canSendMessage } from '../../../../authorization/server/index';
import { Livechat } from '../../lib/Livechat';
import { deprecationWarning } from '../../../../api/server/helpers/deprecationWarning';

API.v1.addRoute('livechat/video.call/:token', {
	async get() {
		check(this.urlParams, {
			token: String,
		});

		check(this.queryParams, {
			rid: Match.Maybe(String),
		});

		const { token } = this.urlParams;

		const guest = findGuest(token);
		if (!guest) {
			throw new Meteor.Error('invalid-token');
		}

		const rid = this.queryParams.rid || Random.id();
		const roomInfo = {
			jitsiTimeout: new Date(Date.now() + 3600 * 1000),
			source: {
				type: OmnichannelSourceType.API,
				alias: 'video-call',
			},
		};
		const { room } = await getRoom({ guest, rid, roomInfo });

		const businessUnit = '';
		const config = await settings({ businessUnit });
		if (!config.theme || !config.theme.actionLinks || !config.theme.actionLinks.jitsi) {
			throw new Meteor.Error('invalid-livechat-config');
		}

		Messages.createWithTypeRoomIdMessageAndUser('livechat_video_call', room._id, '', guest, {
			actionLinks: config.theme.actionLinks.jitsi,
		});
		let rname;
		if (rcSettings.get('Jitsi_URL_Room_Hash')) {
			rname = rcSettings.get('uniqueID') + rid;
		} else {
			rname = encodeURIComponent(room.t === 'd' ? room.usernames.join(' x ') : room.name);
		}
		const videoCall = {
			rid,
			domain: rcSettings.get('Jitsi_Domain'),
			provider: 'jitsi',
			room: rcSettings.get('Jitsi_URL_Room_Prefix') + rname + rcSettings.get('Jitsi_URL_Room_Suffix'),
			timeout: new Date(Date.now() + 3600 * 1000),
		};

		return API.v1.success(deprecationWarning({ videoCall }));
	},
});

API.v1.addRoute(
	'livechat/webrtc.call',
	{ authRequired: true },
	{
		async get() {
			check(this.queryParams, {
				rid: Match.Maybe(String),
			});

			if (!hasPermission(this.userId, 'view-l-room')) {
				return API.v1.unauthorized();
			}

			const room = canSendMessage(this.queryParams.rid, {
				uid: this.userId,
				username: this.user.username,
				type: this.user.type,
			});
			if (!room) {
				throw new Meteor.Error('invalid-room');
			}

			const webrtcCallingAllowed = rcSettings.get('WebRTC_Enabled') === true && rcSettings.get('Omnichannel_call_provider') === 'WebRTC';
			if (!webrtcCallingAllowed) {
				throw new Meteor.Error('webRTC calling not enabled');
			}

			const businessUnit = '';
			const config = await settings({ businessUnit });
			if (!config.theme || !config.theme.actionLinks || !config.theme.actionLinks.webrtc) {
				throw new Meteor.Error('invalid-livechat-config');
			}

			let { callStatus } = room;

			if (!callStatus || callStatus === 'ended' || callStatus === 'declined') {
				callStatus = 'ringing';
				await Rooms.setCallStatusAndCallStartTime(room._id, callStatus);
				await Messages.createWithTypeRoomIdMessageAndUser(
					'livechat_webrtc_video_call',
					room._id,
					TAPi18n.__('Join_my_room_to_start_the_video_call'),
					this.user,
					{
						actionLinks: config.theme.actionLinks.webrtc,
					},
				);
			}

			const videoCall = {
				rid: room._id,
				provider: 'webrtc',
				callStatus,
			};
			return API.v1.success({ videoCall });
		},
	},
);

API.v1.addRoute(
	'livechat/webrtc.call/:callId',
	{ authRequired: true },
	{
		async put() {
			check(this.urlParams, {
				callId: String,
			});

			check(this.bodyParams, {
				rid: Match.Maybe(String),
				status: Match.Maybe(String),
			});

			const { callId } = this.urlParams;
			const { rid, status } = this.bodyParams;

			if (!hasPermission(this.userId, 'view-l-room')) {
				return API.v1.unauthorized();
			}

			const room = canSendMessage(rid, {
				uid: this.userId,
				username: this.user.username,
				type: this.user.type,
			});
			if (!room) {
				throw new Meteor.Error('invalid-room');
			}

			const call = await Messages.findOneById(callId);
			if (!call || call.t !== 'livechat_webrtc_video_call') {
				throw new Meteor.Error('invalid-callId');
			}

			Livechat.updateCallStatus(callId, rid, status, this.user);

			return API.v1.success({ status });
		},
	},
);
