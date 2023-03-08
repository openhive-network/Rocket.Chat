import { QueryClientProvider } from '@tanstack/react-query';
import React, { FC, lazy, Suspense } from 'react';

import { queryClient } from '../../lib/queryClient';
import PageLoading from './PageLoading';

const ConnectionStatusBar = lazy(() => import('../../components/connectionStatus/ConnectionStatusBar'));
const MeteorProvider = lazy(() => import('../../providers/MeteorProvider'));
const BannerRegion = lazy(() => import('../banners/BannerRegion'));
const AppLayout = lazy(() => import('./AppLayout'));
const PortalsWrapper = lazy(() => import('./PortalsWrapper'));
const ModalRegion = lazy(() => import('../modal/ModalRegion'));

const AppRoot: FC = () => {
	window.addEventListener('storage', (e) => {
		console.log('storageEvent', e);
		const redirectToPathname = '/home';
		if (e.key === 'Meteor.userId') {
			if (e.newValue) {
				console.log('storageEvent login');
			} else {
				console.log('storageEvent logout');
				// TODO Post message to parent window, when we're in iframe.
			}
			console.log('storageEvent redirecting to', redirectToPathname);

			window.location.assign(redirectToPathname);
			// TODO it would be better to redirect using router.
		}
	});

	return (
		<Suspense fallback={<PageLoading />}>
			<QueryClientProvider client={queryClient}>
				<MeteorProvider>
					<ConnectionStatusBar />
					<BannerRegion />
					<AppLayout />
					<PortalsWrapper />
					<ModalRegion />
				</MeteorProvider>
			</QueryClientProvider>
		</Suspense>
	);
};

export default AppRoot;
