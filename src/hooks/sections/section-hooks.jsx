import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {createSection, getSections, removeSection} from '../../api-calls/sections/section-calls.js';
import {API_ROUTE_CONST, TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useAdminContext, useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook at that retrieves sections based on the page.  If no page is provided, the
 * hook will return all available sections.
 *
 * @param {string} [page] - the page name, used as a query parameter
 * @return {ReactQuerySectionResObject}
 */
export const useGetSections = (page = '') => {
    const {bearerToken} = useAdminContext();
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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['createSection'],
        mutationFn: async ({sectionName}) =>
            createSection(sectionName, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')]
            }),
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            setToastMessage('Section created.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')]
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage(`Error creating section.  ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')]
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage('Error creating section.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};

/**
 * A hook that calls the api to remove an existing section
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useRemoveSection = () => {
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removeSection'],
        mutationFn: async ({id}) =>
            removeSection(id, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')]
            }),
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            setToastMessage('Section removed.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')]
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage(`Error removing section.  ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: [API_ROUTE_CONST.SECTIONS.replace('/', '')]
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage('Error removing section.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};