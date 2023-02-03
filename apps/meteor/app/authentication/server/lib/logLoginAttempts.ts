import { SystemLogger } from '../../../../server/lib/logger/system';
import { settings } from '../../../settings/server';
import type { ILoginAttempt } from '../ILoginAttempt';

export const logFailedLoginAttempts = (login: ILoginAttempt): void => {
	if (!settings.get('Login_Logs_Enabled')) {
		return;
	}

	let user = 'unknown';
	if (settings.get('Login_Logs_Username')) {
		user = login.methodArguments[0]?.user?.username || login.user?.username || 'unknown';
	}
	const { connection } = login;
	let { clientAddress } = connection;
	if (!settings.get('Login_Logs_ClientIp')) {
		clientAddress = '-';
	}
	let forwardedFor = connection.httpHeaders?.['x-forwarded-for'];
	let realIp = connection.httpHeaders?.['x-real-ip'];
	if (!settings.get('Login_Logs_ForwardedForIp')) {
		forwardedFor = '-';
		realIp = '-';
	}
	let userAgent = connection.httpHeaders?.['user-agent'];
	if (!settings.get('Login_Logs_UserAgent')) {
		userAgent = '-';
	}
	const type = login.type || 'unknown';
	SystemLogger.warn(
		`Failed login detected - Type[${type}] Username[${user}] ClientAddress[${clientAddress}] ForwardedFor[${forwardedFor}] XRealIp[${realIp}] UserAgent[${userAgent}]`,
	);
};

export const logLoginAttempts = (login: ILoginAttempt): void => {
	if (!settings.get('Login_Logs_Enabled')) {
		return;
	}

	if (login.type === 'resume') {
		//
		// `resume` occurs when session is regenerated, e.g. when user
		// reloads the page. We don't want to log on this event.
		//
		// TODO Unfortunately this also occurs when user logs in via
		// iframe.
		//
		return;
	}

	let user = 'unknown';
	if (settings.get('Login_Logs_Username')) {
		user = login.methodArguments[0]?.user?.username || login.user?.username || 'unknown';
	}
	const { connection } = login;
	let { clientAddress } = connection;
	if (!settings.get('Login_Logs_ClientIp')) {
		clientAddress = '-';
	}
	let forwardedFor = connection.httpHeaders?.['x-forwarded-for'];
	let realIp = connection.httpHeaders?.['x-real-ip'];
	if (!settings.get('Login_Logs_ForwardedForIp')) {
		forwardedFor = '-';
		realIp = '-';
	}
	let userAgent = connection.httpHeaders?.['user-agent'];
	if (!settings.get('Login_Logs_UserAgent')) {
		userAgent = '-';
	}
	const type = login.type || 'unknown';
	SystemLogger.warn(
		`Login attempt detected - Type[${type}] Username[${user}] ClientAddress[${clientAddress}] ForwardedFor[${forwardedFor}] XRealIp[${realIp}] UserAgent[${userAgent}]`,
	);
};
