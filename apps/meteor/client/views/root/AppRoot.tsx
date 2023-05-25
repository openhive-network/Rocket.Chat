import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { lazy, Suspense } from 'react';

import { queryClient } from '../../lib/queryClient';
import OutermostErrorBoundary from './OutermostErrorBoundary';
import PageLoading from './PageLoading';

const MeteorProvider = lazy(() => import('../../providers/MeteorProvider'));
const AppLayout = lazy(() => import('./AppLayout'));

const AppRoot = (): ReactElement => {
	window.addEventListener('storage', (e) => {
		const redirectToPathname = '/home';
		if (e.key === 'Meteor.userId') {
			if (e.newValue) {
				console.log('storageEvent login');
				// TODO When user changes we're in trouble – user sees
				// doubled channels in Channels list in menu.
			}
			window.location.assign(redirectToPathname);
		}
	});
	return (
		<OutermostErrorBoundary>
			<Suspense fallback={<PageLoading />}>
				<QueryClientProvider client={queryClient}>
					<MeteorProvider>
						<AppLayout />
					</MeteorProvider>
				</QueryClientProvider>
			</Suspense>
		</OutermostErrorBoundary>
	);
};

export default AppRoot;
