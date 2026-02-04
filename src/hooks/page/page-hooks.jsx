import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {createPage, createPageSection, removePageSection} from '../../api-calls/pages/pages.js';
import {updatePageSection} from '../../api-calls/sections/section-calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {clearAuthFromSessionStorage} from '../../utils/utils.js';
import {useAuth} from '../auth/use-auth.jsx';
import {useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook used to create a new page.
 *
 * @return {import('@tanstack/react-query').UseMutationResult}
 */
export const useCreatePage = () => {
    const {bearerToken, csrfToken} = useAuth();

    return (
        useMutation({
            mutationKey: ['createPage'],
            mutationFn: ({pageName}) => createPage(pageName, bearerToken, csrfToken)
        })
    );
};

/**
 * A hook used to add a section to a page.
 *
 * @return {import('@tanstack/react-query').UseMutationResult}
 */
export const useCreatePageSection = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return (
        useMutation({
            mutationKey: ['createPageSection'],
            mutationFn: ({
                             pageName,
                             sectionName
                         }) => createPageSection(pageName, sectionName, true, bearerToken, csrfToken),
            onSuccess: async () => {
                await Promise.all([
                    queryClient.invalidateQueries({queryKey: ['sections']}),
                    queryClient.invalidateQueries({queryKey: ['pageContent']})
                ]);
                showToast({message: 'New section added to page.', type: TOAST_TYPES.PRIMARY});
            },
            onError: async (error) => {
                if (error?.status === 401) {
                    await queryClient.invalidateQueries({
                        queryKey: ['sections']
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    });
                    showToast({
                        message: `Error adding section from page.  ${error?.response?.data?.message}`,
                        type: TOAST_TYPES.ERROR
                    });
                    clearAuthFromSessionStorage();
                    navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
                } else {
                    await queryClient.invalidateQueries({
                        queryKey: ['sections']
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    });
                    showToast({message: 'Error adding section from page.', type: TOAST_TYPES.ERROR});
                }
            }
        })
    );
};

/**
 * A hook that calls the api to remove an existing page's section
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useRemovePageSection = () => {
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removePageSection'],
        mutationFn: async ({id}) =>
            removePageSection(id, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['sections']}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({message: 'Section removed.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            if (error?.status === 401) {
                await queryClient.invalidateQueries({
                    queryKey: ['sections']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                showToast({
                    message: `Error removing section.  ${error?.response?.data?.message}`,
                    type: TOAST_TYPES.ERROR
                });
                sessionStorage.removeItem('authToken');
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ['sections']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                showToast({message: 'Error removing section.', type: TOAST_TYPES.ERROR});
            }
        }
    });
};

/**
 * A hook that calls the api to update the metadata for the section
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useUpdatePageSection = () => {
    const queryClient = useQueryClient();
    const {bearerToken, csrfToken} = useAuth();
    const {showToast} = useToastContext();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updatePageSection'],
        mutationFn: async ({
                               pageSectionId,
                               requestBody
                           }) => updatePageSection(pageSectionId, requestBody, bearerToken, csrfToken),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ['pageContent', 'admin']}),
                queryClient.invalidateQueries({queryKey: ['pageContent']})
            ]);
            showToast({message: 'Section updated.', type: TOAST_TYPES.PRIMARY});
        },
        onError: async (error) => {
            if (error?.status === 401) {
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent', 'admin']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['sections']
                });
                showToast({
                    message: `Error updating the section.  ${error?.response?.data?.message}`,
                    type: TOAST_TYPES.ERROR
                });
                sessionStorage.removeItem('authToken');
                navigate(ROUTING_CONSTANTS.LOGIN.URL, {replace: true});
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent', 'admin']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                });
                await queryClient.invalidateQueries({
                    queryKey: ['sections']
                });
                showToast({message: 'Error updating the section.', type: TOAST_TYPES.ERROR});
            }
        }
    });
};

export const usePageSetup = () => {
    const {showToast} = useToastContext();
    const queryClient = useQueryClient();
    const {mutateAsync: createPage} = useCreatePage();
    const {mutateAsync: createPageSection} = useCreatePageSection();

    return useMutation({
        mutationKey: ['pageSetup'],
        mutationFn: async ({pageName, sections}) => {
            const page = await createPage({pageName});
            const pageSections = await Promise.allSettled(
                sections.map(([, sectionName]) =>
                    createPageSection({pageName, sectionName})
                )
            );

            const failed = pageSections?.filter((s) => s.status === 'rejected');
            if (failed.length) throw new Error(`${failed.length} sections failed.`);

            return {page, pageSections: pageSections?.map((s) => s.value)};
        },

        onSuccess: async (data, variables) => {
            const {pageSections} = data;
            const {pageName, resetForm} = variables;

            showToast({
                message: `Page "${pageName}" created with ${pageSections.length} section(s).`,
                type: TOAST_TYPES.PRIMARY
            });

            await queryClient.invalidateQueries({queryKey: ['pageContent']});
            await queryClient.invalidateQueries({queryKey: ['links']});
            resetForm();
        },

        onError: (error) => {
            showToast({
                message: error.message || 'Error creating page section.',
                type: TOAST_TYPES.ERROR
            });
        },
    });
};
