import axios from 'axios';

import {API_ROUTE_CONST, apiURL} from '../../constants/constants.js';
import {urlBuilder} from '../utils.js';

/**
 * The API call to get a list of all the images in the system.
 *
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const getImages = async () => axios.get(
    urlBuilder(apiURL, `${API_ROUTE_CONST.IMAGES}`)
);

/**
 * The API call to add a new image to the database;
 *
 * @param {string} imageText
 * @param {string} alt
 * @param {File} uploadedFile
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const createImage = async (
    imageText,
    alt,
    uploadedFile,
    bearerToken,
    csrfToken
) => {
    const fd = new FormData();
    fd.append('imageFile', uploadedFile);
    const imageAsFormData = fd.get('imageFile');

    return axios(
        {
            method: 'post',
            url: urlBuilder(apiURL, API_ROUTE_CONST.IMAGES),
            data: {
                image_text: imageText,
                alt: alt,
                image_file: imageAsFormData
            },
            withCredentials: true,
            headers: {
                'content-type': 'multipart/form-data',
                'Authorization': `Bearer ${bearerToken}`,
                'X-CSRF-Token': csrfToken
            }
        }
    );
};

/**
 * The API call to update an image's record on the database;
 *
 * @param {number} id
 * @param {{image_text: string, alt: string}} updates
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const updateImage = async (
    id,
    updates,
    bearerToken,
    csrfToken
) => {
    return axios.patch(
        urlBuilder(apiURL, API_ROUTE_CONST.IMAGES, [id]),
        updates,
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        }
    );
};

/**
 * The API call to remove an image from the database.
 *
 * @param {number} imageId
 * @param {string} bearerToken
 * @param {string} csrfToken
 * @return {Promise<axios.AxiosResponse<any>>}
 */
export const removeImage = async (
    imageId,
    bearerToken,
    csrfToken
) => {
    return axios.delete(
        urlBuilder(apiURL, API_ROUTE_CONST.IMAGES, [imageId]),
        {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        }
    );
};