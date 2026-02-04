import {useState} from 'react';

import {Field, Formik} from 'formik';
import {Accordion, Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import {object, string} from 'yup';

import OfficeContentRemoveSectionButton from './office-content-remove-section-button.jsx';
import {ROLES} from '../../../../../constants/constants.js';
import {useAuth} from '../../../../../hooks/auth/use-auth.jsx';
import {useCreateSection, useGetSections} from '../../../../../hooks/sections/section-hooks.jsx';
import {toTitleCase} from '../../../../../utils/utils.js';
import OfficeAdditionButton from '../../../office-addition-button/office-addition-button.jsx';
import * as styles from '../office-content.module.scss';

const OfficeContentSection = () => {
    const {
        data: sectionData,
        isSuccess: sectionSuccess
    } = useGetSections();
    const {
        mutateAsync: createSection,
        isPending: createSectionPending,
        isSuccess: createSectionSuccess
    } = useCreateSection();
    const {roles} = useAuth();
    const [addedSections, setAddedSections] = useState([]);

    const sections = sectionSuccess ? sectionData.data?.data : [];
    const sectionNames = sections.length > 0 ? sections.map(({NAME}) => NAME.toLowerCase()) : [];

    if (!roles.includes(ROLES.SUPER)) {
        return null;
    }

    const initValues = addedSections.reduce((values, {addedSection}) => {
        values[`section_${addedSection}`] = '';

        return values;
    }, {});

    const sectionFormValidation = object().shape(
        addedSections.reduce((schema, {addedSection}) => {
            schema[`section_${addedSection}`] = string()
                .required('Section title is required')
                .min(3, 'Must be at least 3 characters.')
                .max(124, 'Cannot have more than 124 characters.')
                .test(
                    'not-in-existing',
                    'This section title already exists.',
                    (value) => !sectionNames.includes(value?.toLowerCase())
                );
            return schema;
        }, {})
    );

    const handleFormSubmit = async (values, {resetForm}) => {
        const newSectionNames = Object.values(values).map(val => toTitleCase(val));

        await Promise.all(newSectionNames.map(name => createSection({sectionName: name})));
        resetForm();
        setAddedSections([]);
    };

    const isPending = !createSectionSuccess && createSectionPending;

    return <Container className={`mt-5`}>
        <h3 className='text-start'>Sections</h3>
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
                                <Accordion.Header>Section List</Accordion.Header>
                                <Accordion.Body>
                                    <h5
                                        className={`mt-3 text-start`}
                                    >
                                        Existing Sections
                                    </h5>
                                    {
                                        sections.map(
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
                                                        Section Name
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

                                                <OfficeContentRemoveSectionButton
                                                    sectionId={id}
                                                />
                                            </div>
                                        )
                                    }

                                    {
                                        addedSections.map(({addedSection}) => {
                                            return (
                                                <div
                                                    key={addedSection}
                                                    className='mt-3 ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'
                                                >
                                                    <Form.Label
                                                        className={`text-start`}
                                                        htmlFor={`section_${addedSection}`}
                                                        column={true}
                                                    >
                                                        Section Title
                                                    </Form.Label>

                                                    <Field
                                                        as={Form.Control}
                                                        id={`section_${addedSection}`}
                                                        name={`section_${addedSection}`}
                                                        className='rounded'
                                                        type='input'
                                                        isInvalid={touched[`section_${addedSection}`] && !!errors[`section_${addedSection}`]}
                                                    />

                                                    {errors[`section_${addedSection}`] && touched[`section_${addedSection}`]
                                                        ? (
                                                            <div className={`${styles.error_text} text-start`}>
                                                                {errors[`section_${addedSection}`]}
                                                            </div>
                                                        ) : null}
                                                </div>
                                            );
                                        })
                                    }

                                    <div className='mt-5 d-flex justify-content-between align-items-center'>
                                        <OfficeAdditionButton
                                            txt={'Add Section'}
                                            handleOnClick={() => {
                                                setAddedSections(prev => {
                                                    if (addedSections.length === 0) {
                                                        return [{addedSection: 0}];
                                                    } else {
                                                        const prevNumber = addedSections[addedSections.length - 1]?.addedSection;
                                                        const nextNumber = Number(prevNumber) + 1;
                                                        return [
                                                            ...prev,
                                                            {addedSection: nextNumber}
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

export default OfficeContentSection;