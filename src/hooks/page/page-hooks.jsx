import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

import {createPage, createPageSection, removePageSection} from '../../api-calls/pages/pages.js';
import {updatePageSection} from '../../api-calls/sections/section-calls.js';
import {TOAST_TYPES} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useAdminContext, useToastContext} from '../context/context-hooks.jsx';

/**
 * A hook used to create a new page.
 *
 * @return {import('@tanstack/react-query').UseMutationResult}
 */
export const useCreatePage = () => {
    const {bearerToken, csrfToken} = useAdminContext();

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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return (
        useMutation({
            mutationKey: ['createPageSection'],
            mutationFn: ({
                             pageName,
                             sectionName
                         }) => createPageSection(pageName, sectionName, true, bearerToken, csrfToken),
            onSuccess: async () => Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['sections']
                }),
                queryClient.invalidateQueries({
                    queryKey: ['pageContent']
                }),
                setToastMessage('New section added to page.'),
                setToastType(TOAST_TYPES.PRIMARY),
                setShowToast(true)
            ]),
            onError: async (error) => {
                if (error?.status === 401) {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['sections']
                        }),
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                        setToastMessage(`Error adding section from page.  ${error?.response?.data?.message}`),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true),
                        navigate(ROUTING_CONSTANTS.LOGIN.URL)
                    ]);
                } else {
                    return Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['sections']
                        }),
                        queryClient.invalidateQueries({
                            queryKey: ['pageContent']
                        }),
                        setToastMessage('Error adding section from page.'),
                        setToastType(TOAST_TYPES.ERROR),
                        setShowToast(true)
                    ]);
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
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['removePageSection'],
        mutationFn: async ({id}) =>
            removePageSection(id, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['sections']
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
                        queryKey: ['sections']
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
                        queryKey: ['sections']
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

/**
 * A hook that calls the api to update the metadata for the section
 *
 * @return {import('@tanstack/react-query').UseMutationResult} - the response from the API
 */
export const useUpdatePageSection = () => {
    const queryClient = useQueryClient();
    const {bearerToken, csrfToken} = useAdminContext();
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['updatePageSection'],
        mutationFn: async ({
                               pageSectionId,
                               requestBody
                           }) => updatePageSection(pageSectionId, requestBody, bearerToken, csrfToken),
        onSuccess: async () => Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['pageContent', 'admin']
            }),
            queryClient.invalidateQueries({
                queryKey: ['pageContent']
            }),
            setToastMessage('Section updated.'),
            setToastType(TOAST_TYPES.PRIMARY),
            setShowToast(true)
        ]),
        onError: async (error) => {
            if (error?.status === 401) {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent', 'admin']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['sections']
                    }),
                    setToastMessage(`Error updating the section.  ${error?.response?.data?.message}`),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true),
                    navigate(ROUTING_CONSTANTS.LOGIN.URL)
                ]);
            } else {
                return Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent', 'admin']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['pageContent']
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ['sections']
                    }),
                    setToastMessage('Error updating the section.'),
                    setToastType(TOAST_TYPES.ERROR),
                    setShowToast(true)
                ]);
            }
        }
    });
};

export const usePageSetup = () => {
    const {setToastMessage, setShowToast, setToastType} = useToastContext();
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

            setToastMessage(
                `Page "${pageName}" created with ${pageSections.length} section(s).`
            );
            setToastType(TOAST_TYPES.PRIMARY);
            setShowToast(true);

            await queryClient.invalidateQueries({queryKey: ['pageContent']});
            await queryClient.invalidateQueries({queryKey: ['links']});
            resetForm();
        },

        onError: (error) => {
            setToastMessage(error.message || 'Error creating page section.');
            setToastType(TOAST_TYPES.ERROR);
            setShowToast(true);
        },
    });
};
