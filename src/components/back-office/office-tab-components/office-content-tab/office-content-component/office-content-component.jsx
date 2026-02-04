import {useState} from 'react';

import {Field, Formik} from 'formik';
import {Accordion, Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import {object, string} from 'yup';

import OfficeContentRemoveComponentButton from './office-content-remove-component-button.jsx';
import {ROLES} from '../../../../../constants/constants.js';
import {useAuth} from '../../../../../hooks/auth/use-auth.jsx';
import {useCreateComponent, useGetComponents} from '../../../../../hooks/components/component-hooks.jsx';
import {toTitleCase} from '../../../../../utils/utils.js';
import OfficeAdditionButton from '../../../office-addition-button/office-addition-button.jsx';
import * as styles from '../office-content.module.scss';

const OfficeContentComponent = () => {
    const {
        data: componentData,
        isSuccess: componentSuccess
    } = useGetComponents();
    const {
        mutateAsync: createComponent,
        isPending: createComponentPending,
        isSuccess: createComponentSuccess
    } = useCreateComponent();
    const {roles} = useAuth();
    const [addedComponents, setAddedComponents] = useState([]);

    const components = componentSuccess ? componentData.data?.data : [];
    const componentNames = components.length > 0 ? components.map(({NAME}) => NAME.toLowerCase()) : [];

    if (!roles.includes(ROLES.SUPER)) {
        return null;
    }

    const initValues = addedComponents.reduce((values, {addedComponent}) => {
        values[`section_${addedComponent}`] = '';

        return values;
    }, {});

    const sectionFormValidation = object().shape(
        addedComponents.reduce((schema, {addedComponent}) => {
            schema[`section_${addedComponent}`] = string()
                .required('Section title is required')
                .min(3, 'Must be at least 3 characters.')
                .max(124, 'Cannot have more than 124 characters.')
                .test(
                    'not-in-existing',
                    'This section title already exists.',
                    (value) => !componentNames.includes(value?.toLowerCase())
                );
            return schema;
        }, {})
    );

    const handleFormSubmit = async (values, {resetForm}) => {
        const newSectionNames = Object.values(values).map(val => toTitleCase(val));

        await Promise.all(newSectionNames.map(name => createComponent({componentName: name})));
        resetForm();
        setAddedComponents([]);
    };

    const isPending = !createComponentSuccess && createComponentPending;

    return <Container className={`mt-5`}>
        <h3 className='text-start'>Components</h3>
        <Formik
            initialValues={initValues}
            validationSchema={sectionFormValidation}
            onSubmit={handleFormSubmit}
            enableReinitialize={true}
        >
            {
                ({
                     handleSubmit,
                     touched,
                     errors
                 }) =>
                    <Form
                        onSubmit={handleSubmit}
                    >
                        <Accordion className='mb-5'>
                            <Accordion.Item eventKey='11'>
                                <Accordion.Header>Component List</Accordion.Header>
                                <Accordion.Body>
                                    <h5
                                        className={`mt-3 text-start`}
                                    >
                                        Existing Components
                                    </h5>
                                    {
                                        components.map(
                                            ({NAME: name, ID: id}, index) => <div
                                                key={`${name}`}
                                                className={`mt-3 d-flex flex-row flex-sm-column flex-md-row w-100`}
                                            >
                                                <Form.Group
                                                    className={`ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100`}
                                                >
                                                    <Form.Label
                                                        className={`text-start`}
                                                        htmlFor={`${name}_${index}`}
                                                        column={true}
                                                    >
                                                        Component Name
                                                    </Form.Label>

                                                    <Form.Control
                                                        className={`rounded`}
                                                        id={`${name}_${index}`}
                                                        name={`${name}_${index}`}
                                                        type='input'
                                                        disabled={true}
                                                        defaultValue={name}
                                                    />
                                                </Form.Group>

                                                <OfficeContentRemoveComponentButton
                                                    componentId={id}
                                                />
                                            </div>
                                        )
                                    }

                                    {
                                        addedComponents.map(({addedComponent}) => {
                                            return (
                                                <div
                                                    key={addedComponent}
                                                    className='mt-3 ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'
                                                >
                                                    <Form.Label
                                                        className={`text-start`}
                                                        htmlFor={`section_${addedComponent}`}
                                                        column={true}
                                                    >
                                                        Component Name
                                                    </Form.Label>

                                                    <Field
                                                        as={Form.Control}
                                                        id={`section_${addedComponent}`}
                                                        name={`section_${addedComponent}`}
                                                        className='rounded'
                                                        type='input'
                                                        isInvalid={touched[`section_${addedComponent}`] && !!errors[`section_${addedComponent}`]}
                                                    />

                                                    {errors[`section_${addedComponent}`] && touched[`section_${addedComponent}`]
                                                        ? (
                                                            <div className={`${styles.error_text} text-start`}>
                                                                {errors[`section_${addedComponent}`]}
                                                            </div>
                                                        ) : null}
                                                </div>
                                            );
                                        })
                                    }

                                    <div className='mt-5 d-flex justify-content-between align-items-center'>
                                        <OfficeAdditionButton
                                            txt={'Add Component'}
                                            handleOnClick={() => {
                                                setAddedComponents(prev => {
                                                    if (addedComponents.length === 0) {
                                                        return [{addedComponent: 0}];
                                                    } else {
                                                        const prevNumber = addedComponents[addedComponents.length - 1]?.addedComponent;
                                                        const nextNumber = Number(prevNumber) + 1;
                                                        return [
                                                            ...prev,
                                                            {addedComponent: nextNumber}
                                                        ];
                                                    }
                                                });
                                            }}
                                        />

                                        <Button
                                            className='mt-3 mb-3 w-25'
                                            type='submit'
                                            disabled={isPending || Object.keys(errors).length > 0}
                                        >
                                            <div className='d-flex g-3 justify-content-center align-items-center'>
                                                <span>Submit Changes</span>
                                                {
                                                    isPending
                                                        ? <Spinner
                                                            className='ms-3'
                                                            animation='border'
                                                            role='statue'
                                                        />
                                                        : ''
                                                }
                                            </div>
                                        </Button>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Form>
            }
        </Formik>
    </Container>;
};

export default OfficeContentComponent;