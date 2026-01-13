import {useState} from 'react';

import {Formik} from 'formik';
import PropTypes from 'prop-types';
import {ButtonGroup, Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import {GrSubtractCircle} from 'react-icons/gr';
import {object, string} from 'yup';

import OfficeTabAddSection from './office-tab-add-section.jsx';
import * as tabStyles from './office-tab.module.scss';
import {FORM_ERROR_TEXT, PLACEHOLDER_TEXT} from '../../../../constants/constants.js';
import {useAdminContext} from '../../../../hooks/context/context-hooks.jsx';
import {useCreatePageSection} from '../../../../hooks/page/page-hooks.jsx';
import {useGetSections} from '../../../../hooks/sections/section-hooks.jsx';
import {isEmpty} from '../../../../utils/utils.js';
import ScrollTopButton from '../../../scroll-top-button/scroll-top-button.jsx';
import OfficeAdditionButton from '../../office-addition-button/office-addition-button.jsx';
import SectionGenerator from '../../office-generators/office-section-generator/section-generator.jsx';
import * as styles from '../office-create-page/create-page.module.scss';

/**
 * Represents an OfficeTab component responsible for rendering and managing a page's sections
 * with functionality to dynamically add new sections, validate forms, and manage form state.
 *
 * @param {string} pageName
 *
 * @return {import('react').ReactNode}
 *
 * The component integrates with the admin context to retrieve page content,
 * validates form actions using a Yup schema, and leverages Formik for managing form state.
 * It provides UI elements for dynamically handling page sections and creating new content.
 */
const OfficeTab = ({pageName}) => {
    const {pageContent} = useAdminContext();
    const currentPageContent = pageContent.find(({page}) => page === pageName);
    const {
        mutateAsync: addSectionToPage,
        isPending: updatingSectionsPending,
        isSuccess: addingSectionSuccess
    } = useCreatePageSection();
    const {
        data: sectionData,
        isSuccess: sectionSuccess,
        isFetching,
        isPending: sectionIsPending,
        isLoading
    } = useGetSections();

    const [showNewSections, setShowNewSections] = useState(false);
    const [addedSections, setAddedSections] = useState([{sectionKey: 0}]);

    // Form Validation
    const initValues = {
        sectionSelection0: PLACEHOLDER_TEXT
    };
    const yupSchema = object().shape({
        sectionSelection0: string().required(FORM_ERROR_TEXT.CREATE_PAGE_SECTION_SELECTION_TEXT)
    });

    if (!pageName || !pageContent || pageContent.length === 0) return null;
    const isPending = isFetching || sectionIsPending || isLoading || updatingSectionsPending;
    const availableSections = !isPending ? sectionData?.data?.data : [];

    return (
        <div className={`w-100 text-black mt-5`}>
            {
                currentPageContent?.sections?.map(
                    /**
                     * @param {Section} section
                     * @param {number} index
                     */
                    (section, index) => {
                        const cardStyle = /** @type {React.CSSProperties} */ ({'--card-index': index});

                        return (
                            <div
                                key={section?.section_name}
                                className={tabStyles.cardStack}
                                style={cardStyle}
                            >
                                <SectionGenerator section={section}/>
                            </div>
                        );
                    }
                )
            }

            {/*Shows the section of the page that allows for the addition of sections*/}
            {
                !showNewSections
                && <OfficeAdditionButton
                    txt='Add new sections'
                    handleOnClick={() => setShowNewSections(true)}
                />
            }

            {
                (showNewSections && sectionSuccess)
                && <Container className={`text-start rounded-3 mb-5 ${styles.page}`}>
                    <Formik
                        initialValues={initValues}
                        validationSchema={yupSchema}
                        onSubmit={async (vals, formikHelpers) => {
                            const selectionErrors = Object.entries(vals).reduce(
                                (accum, [key, value]) => {
                                    if (!value || value === PLACEHOLDER_TEXT) {
                                        accum[key] = FORM_ERROR_TEXT.CREATE_PAGE_SECTION_SELECTION_TEXT;
                                    }

                                    return accum;
                                }, {}
                            );
                            if (isEmpty(selectionErrors)) {
                                await Promise.all(Object.values(vals).map(val => addSectionToPage({
                                    pageName,
                                    sectionName: val
                                })));

                                if (addingSectionSuccess) {
                                    formikHelpers.resetForm();
                                    setShowNewSections(false);
                                    setAddedSections([{sectionKey: 0}]);
                                }
                            } else {
                                formikHelpers.setErrors(selectionErrors);
                            }
                        }}
                    >
                        {({
                              handleSubmit,
                              resetForm,
                              setFieldValue
                          }) => (
                            <Form className='mt-3 mb-3' onSubmit={handleSubmit}>
                                {
                                    addedSections.map(
                                        /**
                                         * @param {{sectionKey: number}} newSection
                                         * @returns {React.ReactNode}
                                         */
                                        newSection =>
                                            <Container
                                                key={newSection.sectionKey}
                                                className={`d-flex align-items-center`}
                                            >
                                                <div
                                                    className={`rounded m-5 p-3 w-100 ${styles.section}`}
                                                >
                                                    <OfficeTabAddSection
                                                        addSectionNumber={newSection.sectionKey}
                                                        currentSections={currentPageContent.sections}
                                                        availableSections={availableSections}
                                                    />
                                                </div>

                                                {addedSections.length > 1 && <GrSubtractCircle
                                                    className={`ms-3 ${styles.subtractCircle}`}
                                                    style={{fontSize: '1.5rem'}}
                                                    onClick={() => {
                                                        setFieldValue(`sectionSelection${newSection.sectionKey}`, '')
                                                            .then(() =>
                                                                setAddedSections(prev => prev.filter(({sectionKey: prevKey}) => prevKey !== newSection.sectionKey))
                                                            );
                                                    }}
                                                />}
                                            </Container>
                                    )
                                }

                                {/*Add a section button*/}
                                <OfficeAdditionButton
                                    txt='Add section(s)'
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
                                            setShowNewSections(false);
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
                                            <span>Add Section(s)</span>
                                            {
                                                isPending ?
                                                    <Spinner className='ms-3' animation='border' role='statue'/>
                                                    : ''
                                            }
                                        </div>
                                    </Button>
                                </ButtonGroup>
                            </Form>
                        )}
                    </Formik>
                </Container>
            }
            <ScrollTopButton/>
        </div>
    );
};

OfficeTab.propTypes = {
    pageName: PropTypes.string.isRequired
};

export default OfficeTab;

