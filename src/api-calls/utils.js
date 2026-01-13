/**
 * Builds out the url to call the api
 * @param {string} url the api url
 * @param {string} path the api route
 * @param {Array<string>} pathParams an array of strings, each element
 * is a different path param
 * @param {Array<Object<{key: string, value: string}>>} queryParams - an array of query params
 * @returns {string} the constructed url for the api call
 */
export const urlBuilder = (
    url,
    path = '',
    pathParams = [],
    queryParams = []
) => {
    const urlRoute = path === '/' ? '' : path;
    const pathParameters = (!pathParams || pathParams?.length === 0) ? '' : `/${pathParams?.join('/')}`;
    const queryParameters = queryParams?.length >= 1 ?
        `?${queryParams
            .map(
                (param) => Object.values(param).join('='))
            .join('&')}`
        : '';
    return `${url}${urlRoute}${pathParameters}${queryParameters}`;
};
