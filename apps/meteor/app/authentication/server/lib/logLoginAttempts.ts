import { ILoginAttempt } from '../ILoginAttempt';
import { settings } from '../../../settings/server';
import { SystemLogger } from '../../../../server/lib/logger/system';

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
	let forwardedFor = connection.httpHeaders && connection.httpHeaders['x-forwarded-for'];
	let realIp = connection.httpHeaders && connection.httpHeaders['x-real-ip'];
	if (!settings.get('Login_Logs_ForwardedForIp')) {
		forwardedFor = '-';
		realIp = '-';
	}
	let userAgent = connection.httpHeaders && connection.httpHeaders['user-agent'];
	if (!settings.get('Login_Logs_UserAgent')) {
		userAgent = '-';
	}
	const type = login.type || 'unknown';
	const httpHeaders = JSON.stringify(connection.httpHeaders);
	SystemLogger.warn(
		`Failed login detected - Type[${type}] Username[${user}] ClientAddress[${clientAddress}] ForwardedFor[${forwardedFor}] XRealIp[${realIp}] UserAgent[${userAgent}] HttpHeaders[${httpHeaders}]`,
	);
};

export const logLoginAttempts = (login: ILoginAttempt): void => {
	if (!settings.get('Login_Logs_Enabled')) {
		return;
	}

	if (login.type === 'resume') {
		// `resume` occurs when session is regenerated, e.g. when user
		// reloads the page.
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
	let forwardedFor = connection.httpHeaders && connection.httpHeaders['x-forwarded-for'];
	let realIp = connection.httpHeaders && connection.httpHeaders['x-real-ip'];
	if (!settings.get('Login_Logs_ForwardedForIp')) {
		forwardedFor = '-';
		realIp = '-';
	}
	let userAgent = connection.httpHeaders && connection.httpHeaders['user-agent'];
	if (!settings.get('Login_Logs_UserAgent')) {
		userAgent = '-';
	}
	const type = login.type || 'unknown';
	const httpHeaders = JSON.stringify(connection.httpHeaders);
	SystemLogger.warn(
		`Login attempt detected - Type[${type}] Username[${user}] ClientAddress[${clientAddress}] ForwardedFor[${forwardedFor}] XRealIp[${realIp}] UserAgent[${userAgent}] HttpHeaders[${httpHeaders}]`,
	);
};
