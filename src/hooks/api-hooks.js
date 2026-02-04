import {useMutation, useQueries, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';

import {getPageContent, submitContactForm} from '../api-calls/calls.js';
import {TOAST_TYPES} from '../constants/constants.js';
import {useToastContext} from './context/context-hooks.jsx';

/**
 * A hook that calls the api to retrieve the page's headerContent
 *
 * @param {string} [page] - the page whose headerContent needs to be retrieved (leaving page empty return a list of Page Names and IDs)
 * @return {ReactQueryPageResObject} - the response from the API
 */
export const useGetPageContent = (page) => {
    return useSuspenseQuery({
        queryKey: ['pageContent', page],
        queryFn: async () => getPageContent(page)
    });
};

/**
 * A hook that returns all the content data for every page.
 *
 * @return {{data: object, isPending: boolean, isLoading: boolean, isFetching: boolean, error: object}}
 */
export const useGetAllPageContent = () => {
    const {data, isSuccess} = useGetPageContent();
    const pageQueries = data?.data?.pages
            ?.map(({NAME: pageName}) => ({
                queryKey: ['pageContent', pageName],
                queryFn: async () => getPageContent(pageName),
                enabled: !!pageName && isSuccess
            }))
        ?? [];

    return useQueries({
        queries: pageQueries,
        combine: (results) => ({
            data: results?.map(({data}) => data?.data),
            isPending: results?.some(({isPending}) => isPending),
            isLoading: results?.some(({isLoading}) => isLoading),
            isFetching: results?.some(({isFetching}) => isFetching),
            isSuccess: results?.every(({isSuccess}) => isSuccess),
            error: results?.find(({error}) => error)?.error
        })
    });
};

/**
 * A hook used to create a new user to add to the email list
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API */
export const useSendEmail = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToastContext();

    return useMutation({
        mutationKey: ['sending-email'],
        mutationFn: async newEmailToAdd => submitContactForm({email: newEmailToAdd}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['pageContent']
            });
            showToast({message: 'Email sent.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['pageContent']
            });
            showToast({message: 'Error sending email.', type: TOAST_TYPES.PRIMARY});
        }
    });
};