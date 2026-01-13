import {StrictMode} from 'react';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {createRoot} from 'react-dom/client';

import './index.scss';
import App from './App.jsx';

import '@fontsource/pinyon-script';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <div className='content'>
                <App/>
            </div>
            <ReactQueryDevtools/>
        </QueryClientProvider>
    </StrictMode>
);
