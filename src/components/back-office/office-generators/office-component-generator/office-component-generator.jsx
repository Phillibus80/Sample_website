import {useRef} from 'react';

import {Formik} from 'formik';
import {Accordion, Row, Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import {
    extractMenuImageAndLink,
    generateYupSchema,
    getFormikInitialValues,
    getOnSubmit,
    getPageSectionComponentId
} from './utils/utils.jsx';
import {componentCommonPropType} from '../../../../common/commonPropTypes.jsx';
import {COMPONENTS} from '../../../../constants/app-constants.js';
import {
    useCreateComponentContent,
    useUpdateComponentContent
} from '../../../../hooks/component-content/component-content-hooks.js';
import OfficeEventList from '../../office-event/office-event-list.jsx';
import OfficeImageList from '../../office-image/office-image-list.jsx';
import OfficeLinkList from '../../office-link/office-link-list.jsx';
import OfficeMenuImageLink from '../../office-menu-image-link/office-menu-image-link.jsx';
import OfficeTextList from '../../office-text/office-text-list.jsx';

/**
 * A utility component that parses through the component response object
 * and displays the correct ui for the back office.
 *
 * @param {Component} component
 *
 * @return {React.ReactNode | null}
 */
const OfficeComponentGenerator = ({component}) => {
    const formRef = useRef(null);
    const pageSectionComponentIdRef = useRef(getPageSectionComponentId(component));
    const {
        mutateAsync: updateContent,
        isPending: updateContentIsPending
    } = useUpdateComponentContent();
    const {
        mutateAsync: createComponentContent
    } = useCreateComponentContent();

    if (!component) return null;

    const customPrefix = 'page';
    const pageSectionComponentId = pageSectionComponentIdRef.current;
    const initValues = getFormikInitialValues(component, customPrefix);

    const {
        menuImage,
        images,
        menuLink,
        links
    } = extractMenuImageAndLink(component);

    return (
        <>
            <h5>{component.component_name}</h5>
            <Row>
                <Formik
                    enableReinitialize
                    innerRef={formRef}
                    validateTouchedFieldsOnly={true}
                    initialValues={initValues}
                    validationSchema={generateYupSchema(initValues)}
                    onSubmit={(values, formikHelpers) =>
                        getOnSubmit(formRef, updateContent, customPrefix)(values, formikHelpers)
                    }
                >
                    {
                        ({handleSubmit, errors}) => (
                            <Accordion className='mb-5'>
                                <Accordion.Item eventKey='11'>
                                    <Accordion.Header>{component.component_name}</Accordion.Header>
                                    <Accordion.Body>
                                        <Form noValidate onSubmit={handleSubmit}>
                                            <OfficeTextList
                                                component={component}
                                                handleClick={createComponentContent}
                                                componentContentId={pageSectionComponentId}
                                                prefix={customPrefix}
                                            />
                                            <br/>
                                            <OfficeMenuImageLink
                                                imageObject={menuImage}
                                                linkObject={menuLink}
                                                prefix={customPrefix}
                                            />
                                            <br/>
                                            <OfficeLinkList
                                                component={component}
                                                linkContent={links}
                                                handleClick={createComponentContent}
                                                componentContentId={pageSectionComponentId}
                                                isLinkTextInputDisabled={true}
                                                isSelectDisabled={true}
                                                prefix={customPrefix}
                                                isMenu={component.component_name === COMPONENTS.MENU}
                                            />
                                            <br/>
                                            <OfficeImageList
                                                imageContent={images}
                                                handleClick={createComponentContent}
                                                componentContentId={pageSectionComponentId}
                                                isDisabled={true}
                                                isSelectDisabled={false}
                                                prefix={customPrefix}
                                            />
                                            <br/>
                                            <OfficeEventList
                                                eventContent={component.events}
                                                handleClick={createComponentContent}
                                                componentContentId={pageSectionComponentId}
                                                isTextInputDisabled={false}
                                                prefix={customPrefix}
                                            />

                                            <Button
                                                className='mt-3 mb-3'
                                                type='submit'
                                                disabled={updateContentIsPending || Object.keys(errors).length > 0}
                                            >
                                                <div className='d-flex g-3 justify-content-center align-items-center'>
                                                    <span>Submit</span>
                                                    {updateContentIsPending ?
                                                        <Spinner className='ms-3' animation='border'
                                                                 role='statue'/> : ''}
                                                </div>
                                            </Button>
                                        </Form>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        )}
                </Formik>
            </Row>
        </>
    );
};

OfficeComponentGenerator.propTypes = {
    component: componentCommonPropType
};

export default OfficeComponentGenerator;