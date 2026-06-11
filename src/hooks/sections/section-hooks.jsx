import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';

import {createSection, getSections, removeSection} from '../../api-calls/sections/section-calls.js';
import {API_ROUTE_CONST, TOAST_TYPES} from '../../constants/constants.js';
import {useAuth} from '../auth/use-auth.jsx';
import {useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook at that retrieves sections based on the page.  If no page is provided, the
 * hook will return all available sections.
 *
 * @param {string} [page] - the page name, used as a query parameter
 * @return {ReactQuerySectionResObject}
 */
export const useGetSections = (page = '') => {
    const {bearerToken} = useAuth();
    return (
        useSuspenseQuery({
            queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')],
            queryFn: () => getSections(page, bearerToken)
        })
    );
};

/**
 * A hook that calls the API endpoint to create a new Section to added to the application.
 *
 * @return {import('@tanstack/react-query').UseMutationResult}
 */
export const useCreateSection = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['createSection'],
        mutationFn: async ({sectionName}) =>
            createSection(sectionName, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')]}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({message: 'Section created.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')]}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({
                message: `Error creating section. ${error?.response?.data?.message ?? ''}`,
                type: TOAST_TYPES.ERROR
            });
        }
    });
};

/**
 * A hook that calls the api to remove an existing section
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useRemoveSection = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['removeSection'],
        mutationFn: async ({id}) =>
            removeSection(id, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')]}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({message: 'Section removed.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')]}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({
                message: `Error removing section. ${error?.response?.data?.message ?? ''}`,
                type: TOAST_TYPES.ERROR
            });
        }
    });
};
