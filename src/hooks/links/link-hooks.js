import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {
    createLink,
    getLinks,
    getLinksBySectionName,
    getPageLinks,
    removeLink,
    updateLink
} from '../../api-calls/links/link-calls.js';
import {API_ROUTE_CONST, TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useAdminContext, useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook that retrieves all links from the database.  Can be
 * filtered by the page arg.
 *
 * @param {string} [page] - an optional arg that will filter the results
 * based on page name (must match what is in the db).
 *
 * @return {ReactQueryLinkResObject}
 */
export const useGetSiteLinks = (page) => {
    return (
        useSuspenseQuery({
            queryKey: [API_ROUTE_CONST.LINKS.replace('/', '')],
            queryFn: () => getLinks(page)
        })
    );
};

/**
 * A hook that retrieves all page links from the database.
 *
 * based on page name (must match what is in the db).
 *
 * @return {ReactQueryLinkResObject}*/
export const useGetPageLinks = () => {
    return (
        useSuspenseQuery({
            queryKey: [API_ROUTE_CONST.LINKS.replace('/', '')],
            queryFn: () => getPageLinks()
        })
    );
};

/**
 * A hook that retrieves all links from the database based on Section Name.
 *
 * @param {string} sectionName - filters the results
 * based on the section name (must match what is in the db).
 *
 * @return {ReactQueryLinkResObject}*/
export const useGetSiteLinksBySectionName = (sectionName) => {
    return (
        useSuspenseQuery({
            queryKey: ['linksBySectionName'],
            queryFn: () => getLinksBySectionName(sectionName)
        })
    );
};

/**
 * A hook used to create new global links.
 *
 * @return {import('@tanstack/react-query').UseMutationResult}
 */
export const useCreateLink = () => {
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return (
        useMutation({
            mutationKey: ['createLink'],
            mutationFn: ({link_text, link_url}) => createLink(link_text, link_url, bearerToken, csrfToken),
            onSuccess: async () => Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['links']
                }),
                queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                }),
                setToastMessage('Link created.'),
                setToastType(TOAST_TYPES.PRIMARY),
                setShowToast(true)
            ]),
            onError: async (e) => {
                if (e?.status === 401) {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['links']
                        }),
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                        setToastMessage(`Error creating link. ${e?.response?.data?.message}`),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true),
                        navigate(ROUTING_CONSTANTS.LOGIN.URL)
                    ]);
                } else {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['links']
                        }),
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                        setToastMessage('Error creating link'),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true)
                    ]);
                }
            }
        })
    );
};

/**
 * A hook that calls the api to update an existing link
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useUpdateLink = () => {
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updateLink'],
        mutationFn: async ({id, updates}) =>
            updateLink(id, updates, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['links']
            }),
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            setToastMessage('Link updated.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (e) => {
            if (e?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['links']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage(`Error updating link.  ${e?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['links']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    setToastMessage('Error updating link.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};

/**
 * A hook that calls the api to remove an existing link
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useRemoveLink = () => {
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removeLink'],
        mutationFn: async ({id}) =>
            removeLink(id, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['links']
            }),
            setToastMessage('Link removed.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['links']
                    }),
                    setToastMessage(`Error removing link.  ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['links']
                    }),
                    setToastMessage('Error removing link.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};