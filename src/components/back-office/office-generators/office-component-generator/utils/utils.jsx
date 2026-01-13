import {Accordion} from 'react-bootstrap';
import {object, string} from 'yup';

import {COMPONENTS} from '../../../../../constants/app-constants.js';
import {DEFAULT_CONTENT, PLACEHOLDER_TEXT} from '../../../../../constants/constants.js';
import OfficeAdditionButton from '../../../office-addition-button/office-addition-button.jsx';
import OfficeLocation from '../../../office-location/office-location.jsx';
import OfficeText from '../../../office-text/office-text.jsx';

/**
 * A utility function that takes the component response object and creates a list of
 * text field components: a typical text field and/or text area.
 *
 * @param {Component} component
 * @param {function} handleClick - Async call to create a new text content in the current page/section/component
 * @param {number} componentContentId - the page section component id
 * @param {string} [prefix] - Optional, can be added to the beginning of field names to namespace Fields
 *
 * @return {React.ReactNode}
 */
export const generateTextContent = (component, handleClick, componentContentId, prefix = '') => {
    if (!component?.textContent) {
        return <OfficeAdditionButton
            txt='Add text content'
            handleOnClick={async () => {
                const requestBody = {
                    text_content: PLACEHOLDER_TEXT
                };

                await handleClick({componentContentId: componentContentId, requestBody: requestBody});
            }}
        />;
    }

    /**
     *  A helper function that creates a list of office text objects.
     *
     * @param {Array<TextContentObject>} textContent
     * @return {Array<React.Element>|null}
     */
    const generateTextFields = textContent => {
        if (!textContent) return null;

        return textContent?.map((tc, index) => {
            return <div key={index}>
                <OfficeText
                    componentName={component.component_name}
                    fieldName={`text_${tc.component_content_id}`}
                    textComponent={tc}
                    prefix={prefix}
                />
            </div>;
        });
    };

    return generateTextFields(component.textContent);
};

/**
 * A utility function that takes an array of Location Component Objects taken from the
 * response object and creates an Accordion wrapped list of office location components.
 *
 * @param {Array<LocationObject>} locationContent
 * @param {function} handleClick - Async call to create a new link in the current page/section/component
 * @param {number|null} componentContentId - the page section component id
 * @param {boolean} isTextInputDisabled - handles the disabling of the link text input field
 * @param {string} prefix - Optional, used to differentiate between reused Fields
 * @param {boolean} showAddon - shows the add new content plus button
 * @return {React.ReactNode}
 */
export const generateLocationContent = (
    locationContent,
    handleClick,
    componentContentId,
    isTextInputDisabled = false,
    prefix = '',
    showAddon = true
) => {
    const addLocationHandler = async () => {

        /**
         * @type {CreateLocationContentRequestBody}
         */
        const requestBody = {
            name: PLACEHOLDER_TEXT,
            address: '',
            city: '',
            state: '',
            zip: '12345',
            telephone: '',
            lat: '0.0',
            lng: '0.0',
        };

        await handleClick({componentContentId: componentContentId, requestBody: requestBody});
    };

    if (!locationContent) return <OfficeAdditionButton
        txt='Add a new location'
        handleOnClick={addLocationHandler}
    />;

    /**
     * A helper function that creates a list of office location objects.
     *
     * @param {Array<LocationObject>} locationContent
     * @param {boolean} [isDisabled]
     * @return {Array<React.ReactNode>|null}
     */
    const generateLocations = (locationContent, isDisabled = false) =>
        locationContent
            .filter(location => location.location_name !== DEFAULT_CONTENT.LOCATIONS.LABEL)
            .map(
                (location) =>
                    <div
                        key={`${prefix ? prefix + '_' : ''}${location?.location_name}_${location?.component_content_id ?? location?.location_id}`}>
                        <OfficeLocation
                            locationObject={location}
                            isDisabled={location.location_name === PLACEHOLDER_TEXT ? false : isDisabled}
                            prefix={prefix}
                        />
                    </div>
            );

    return (
        <Accordion defaultActiveKey='0'>
            <Accordion.Item eventKey='0'>
                <Accordion.Header>Locations</Accordion.Header>
                <Accordion.Body>
                    {generateLocations(locationContent, isTextInputDisabled)}
                    {showAddon && <div className='mt-5'>
                        <OfficeAdditionButton
                            txt='Add a new Location'
                            handleOnClick={addLocationHandler}
                        />
                    </div>}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

export const generateYupSchema = initFormikValues => {
    const fileNamesKeys = Object.keys(initFormikValues);

    const schemaObj = fileNamesKeys.reduce((accum, current) => {
        accum[current] = string().required('This is field is required.');
        return accum;
    }, {});

    return object().shape(schemaObj);
};

/**
 * A utility function that generates all formik fields and initial values dynamically based on the
 * incoming component response object.
 *
 * @param {Component} component
 * @param {string} [prefix] - Optional, used to namespace fields (if needed)
 * @return {object}
 */
export const getFormikInitialValues = (component, prefix) => {
    if (!component) return {};

    const names = [];

    if (component.textContent) {
        component.textContent.map(tc => names.push({
            content_id: `${prefix ? `${prefix}_` : ''}text_${tc.component_content_id}`,
            content: {
                text: tc.text
            }
        }));
    }

    if (component.images) {
        component.images.map(image => names.push({
            content_id: `${prefix ? `${prefix}_` : ''}image_${image.component_content_id ?? image.image_id}`,
            content: {
                image_url: image.src,
                image_text: image.image_text,
                image_alt: image.alt
            }
        }));
    }

    if (component.links) {
        component.links.map(link => names.push({
            content_id: `${prefix ? `${prefix}_` : ''}link_${link.component_content_id ?? link.link_id}`,
            content: {
                link_url: link.link_url,
                link_text: link.link_text
            }
        }));
    }

    if (component.events) {
        component.events.map(event => names.push({
            content_id: `${prefix ? `${prefix}_` : ''}event_${event.component_content_id ?? event.event_id}`,
            content: {
                event_title: event.event_title,
                event_description: event.event_description,
                event_location: event.event_location,
                event_address: event.event_address,
                event_city: event.event_city,
                event_state: event.event_state,
                event_zip: event.event_zip,
                event_telephone: event.event_telephone,
                event_lat: event.event_lat,
                event_lng: event.event_lng,
                event_time: event.event_time
            }
        }));
    }

    if (component.locations) {
        component.locations.map(location => names.push({
            content_id: `${prefix ? `${prefix}_` : ''}location_${location.component_content_id ?? location.location_id}`,
            content: {
                location_name: location.location_name,
                location_address: location.location_address,
                location_city: location.location_city,
                location_state: location.location_state,
                location_zip: location.location_zip,
                location_telephone: location.location_telephone,
                location_lat: location.location_lat,
                location_lng: location.location_lng
            }
        }));
    }

    return names.reduce((accum, current) => {
        Object.entries(current.content).forEach(([key, val]) => {
            if (val) accum[`${current.content_id}_${key}`] = val;
        });

        return accum;
    }, {});
};

/**
 * An event handler for the submission of the generated office component form.
 *
 * @param {React.RefObject<import('formik').FormikProps<any>>} formRef
 * @param {(args: {componentContentId: string, requestBody: Object }) => Promise<any>} updateContent - http call to update the content
 * @param {string} [prefix] - Optional, a prefix used to differentiate form fields
 *
 * @return {(values: Object, formikHelpers: import('formik').FormikHelpers<Object>) => Promise<void>}
 */
export const getOnSubmit = (formRef, updateContent, prefix = '') =>
    async (values, formikHelpers) => {
        formikHelpers.setSubmitting(true);

        /**
         * @type {Array<{key: string, value: string}>} changeList
         */
        const changes = [];
        for (const valKey in formRef.current.initialValues) {
            if (
                !formRef.current.initialValues[valKey]
                || formRef.current.initialValues[valKey] !== values[valKey]
            ) {
                changes.push({key: valKey, value: values[valKey]});
            }
        }

        await Promise.all(
            changes.map(
                change => {
                    const splitKey = prefix
                        ? change.key.replaceAll(`${prefix}_`, '').split('_')
                        : change.key.split('_');

                    const componentContentId = splitKey.at(1);

                    const getComponentField = () => {
                        const fieldType = splitKey.at(2);
                        switch (fieldType) {
                            case 'text':
                                return splitKey.at(2)
                                    .replace('text', 'text_content');
                            default:
                                return [splitKey.at(2), splitKey.at(3)].join('_');
                        }
                    };

                    /**
                     * @type {'text_content' | 'link_url' | 'image_url' | 'event'}
                     */
                    const componentContentField = getComponentField();

                    const buildRequestBody = (fieldName) => {
                        switch (fieldName) {
                            case 'event_time':
                                return ({
                                    [fieldName]: new Date(new Date(change.value).getTime() - new Date(change.value).getTimezoneOffset() * 60000)
                                        .toISOString()
                                        .slice(0, 19)
                                        .replace('T', ' ')
                                });
                            default:
                                return ({
                                    [fieldName]: change.value
                                });
                        }
                    };

                    /**
                     * @type {UpateComponentContentRequestBody}
                     */
                    const requestBody = buildRequestBody(componentContentField);

                    return updateContent({componentContentId, requestBody});
                })
        );

        formikHelpers.setSubmitting(false);
        formikHelpers.resetForm();
    };

/**
 * A helper function that cycles through the component's arrays of images, links, and textContent.
 * It passes on the missing arrays and searches through the present array for the page section component id.
 * If multiple arrays are found, it will merely pick the fist present one, if none are present, then
 * it will return null.
 *
 * @param {Component} component
 *
 * @return {number|null}
 */
export const getPageSectionComponentId = (component) => {
    const possibleComponents = [component.images, component.links, component.textContent, component.events];
    const presentComponent = possibleComponents.find(comp =>
        Array.isArray(comp) && comp.length > 0);

    return presentComponent?.at(0)?.page_section_component_id ?? null;
};

/**
 * A helper function that extracts the first image, images, first link, and links from a component for the Menu component.
 * If the component is something other than MENU, it returns the component's images and links as is.
 *
 * @param {Component} component
 * @return {{menuImage: ImageObject|null, images: Array<ImageObject>, menuLink: LinkObject|null, links: Array<LinkObject>}}
 */
export const extractMenuImageAndLink = (component) => {
    let menuImage, menuLink = null;
    let images, links;

    if (component.component_name === COMPONENTS.MENU) {
        const [firstImage, ...restImages] = component.images || [];
        const [firstLink, ...restLinks] = component.links || [];

        menuImage = firstImage;
        images = restImages;

        menuLink = firstLink;
        links = restLinks;
    } else {
        images = component.images;
        links = component.links;
    }
    return {menuImage, images, menuLink, links};
};
