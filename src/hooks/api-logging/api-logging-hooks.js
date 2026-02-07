import {useSuspenseQuery} from '@tanstack/react-query';

import {getLogs} from '../../api-calls/api-logs/api-logs.js';
import {useAuth} from '../auth/use-auth.jsx';

/**
 * A hook that retrieves all logs from the database.
 *
 * @return {import('@tanstack/react-query').UseSuspenseQueryResult}
 */
export const useGetLogs = () => {
    const {bearerToken} = useAuth();

    return useSuspenseQuery({
        queryKey: ['logging'],
        queryFn: () => getLogs(bearerToken)
    });
};
