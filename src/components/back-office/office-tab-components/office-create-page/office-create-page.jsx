import {useState} from 'react';

import {Field, Formik} from 'formik';
import {ButtonGroup, InputGroup, Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import {object, string} from 'yup';

import * as styles from './create-page.module.scss';
import OfficeCreatePageContentList from './office-create-page-content-list.jsx';
import {handleCreatePageSubmit} from './utils.js';
import {FORM_ERROR_TEXT, PLACEHOLDER_TEXT} from '../../../../constants/constants.js';
import {usePageSetup} from '../../../../hooks/page/page-hooks.jsx';
import ScrollTopButton from '../../../scroll-top-button/scroll-top-button.jsx';
import OfficeAdditionButton from '../../office-addition-button/office-addition-button.jsx';

const OfficeCreatePage = () => {
    const [addedSections, setAddedSections] = useState([{sectionKey: 0}]);
    const {
        mutateAsync: createPage,
        isPending
    } = usePageSetup();
    const initValues = {
        pageName: '',
        sectionSelection0: PLACEHOLDER_TEXT
    };
    const yupSchema = object().shape({
        pageName: string().required(FORM_ERROR_TEXT.CREATE_PAGE_NAME_TEXT),
        sectionSelection0: string().required(FORM_ERROR_TEXT.CREATE_PAGE_SECTION_SELECTION_TEXT)
    });

    return (
        <Container className={`text-start rounded-3 ${styles.page}`}>
            <Formik
                initialValues={initValues}
                validationSchema={yupSchema}
                onSubmit={async (vals, {setErrors, resetForm}) =>
                    handleCreatePageSubmit(vals, setErrors, createPage, resetForm)}
            >
                {({
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      touched,
                      errors,
                      resetForm
                  }) =>
                    <Form className='mt-3 mb-3' onSubmit={handleSubmit}>
                        <InputGroup className='ms-sm-0 ms-lg-2 flex-grow-1 d-flex flex-column w-100'>
                            <Form.Label
                                htmlFor={`pageName`}
                                className='mt-3'
                                column
                            >
                                <b>Page Name</b>
                            </Form.Label>
                            <Field
                                as={Form.Control}
                                id={`pageName`}
                                name={`pageName`}
                                className={`rounded w-50`}
                                type='input'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched[`pageName`] && !!errors[`pageName`]}
                            />

                            <Form.Control.Feedback type='invalid'>
                                <span>{errors['pageName']}</span>
                            </Form.Control.Feedback>
                        </InputGroup>

                        <OfficeCreatePageContentList
                            sections={addedSections}
                            updateSectionList={setAddedSections}
                        />

                        {/*Add a section button*/}
                        <OfficeAdditionButton
                            txt='Add a new section'
                            handleOnClick={() => {
                                setAddedSections(prev => [
                                        ...prev,
                                        {sectionKey: (parseInt(prev[prev.length - 1].sectionKey) + 1)}
                                    ]
                                );
                            }}
                        />

                        <ButtonGroup
                            className='mt-5 ps-5 pe-5 d-flex flex-sm-column justify-content-sm-center flex-md-row justify-content-md-between'>
                            <Button
                                className='mb-sm-3 me-md-5 rounded'
                                variant='secondary'
                                onClick={() => {
                                    setAddedSections([{sectionKey: 0}]);
                                    resetForm();
                                }}
                            >
                                Clear Form
                            </Button>

                            <Button
                                className='mb-sm-3 ms-md-5 rounded'
                                variant='primary'
                                type='submit'
                                disabled={isPending}
                            >
                                <div className='d-flex g-3 justify-content-center align-items-center'>
                                    <span>Create Page</span>
                                    {
                                        isPending ?
                                            <Spinner className='ms-3' animation='border' role='statue'/>
                                            : ''
                                    }
                                </div>
                            </Button>
                        </ButtonGroup>
                    </Form>
                }
            </Formik>
            <ScrollTopButton/>
        </Container>
    );
};

export default OfficeCreatePage;