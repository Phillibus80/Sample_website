import React, {useState} from 'react';

import {Accordion, InputGroup, Spinner} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './sectionGenerator.module.scss';
import {componentContentWithEvents} from '../../../../common/commonPropTypes.jsx';
import {ROLES} from '../../../../constants/constants.js';
import {useAdminContext} from '../../../../hooks/context/context-hooks.jsx';
import {useRemovePageSection, useUpdatePageSection} from '../../../../hooks/page/page-hooks.jsx';
import OfficeComponentGenerator from '../office-component-generator/office-component-generator.jsx';

/**
 * A utility component used to generate the sections for the back office.
 *
 * @param {Section} section
 *
 * @return {React.ReactNode}
 */
const SectionGenerator = ({section}) => {
    const [shouldShowSection, setShouldShowSection] = useState(section?.show_section ?? true);
    const [priority, setPriority] = useState(section?.priority ?? 1);
    const {
        mutateAsync: updateSection,
        isPending: updatePending
    } = useUpdatePageSection();
    const {
        mutateAsync: removeSection,
        isPending: removePending
    } = useRemovePageSection();
    const {roles} = useAdminContext();

    if (!section) return null;

    const hasAdminRole = roles.includes(ROLES.ADMIN);
    const hasSuperRole = roles.includes(ROLES.SUPER);

    const areCallsPending = updatePending || removePending;

    const showSubtractCircle = () => {
        return !areCallsPending
            ? <GrSubtractCircle
                className={`ms-3 ${styles.subtractCircle}`}
                style={{fontSize: '1.5rem'}}
                onClick={async () => removeSection({id: section.page_section_id})}
            />
            : <Spinner style={{color: 'blue'}} animation='border' role='status'/>;
    };

    return (
        <Container className={`text-start ${styles.section}`}>
            <h2 className={`text-start ${styles.section_title}`}>Section:&nbsp;&nbsp;&nbsp;{section.section_name}</h2>
            <Accordion defaultActiveKey='121' className='mb-5'>
                <Accordion.Item eventKey='121'>
                    <Accordion.Header>{section.section_name}</Accordion.Header>
                    <Accordion.Body>
                        <Form className='mt-3 mb-3'>
                            <div className='d-flex align-items-center'>
                                <Form.Check
                                    type='switch'
                                    id={`${section.section_name}_${section.page_section_id}_switch`}
                                    label='Show Section'
                                    checked={shouldShowSection}
                                    onChange={async () => {
                                        const newShowSectionState = !shouldShowSection;

                                        setShouldShowSection(newShowSectionState);

                                        await updateSection({
                                            pageSectionId: section.page_section_id,
                                            requestBody: {
                                                show_section: newShowSectionState
                                            }
                                        });
                                    }}
                                />

                                {
                                    (hasSuperRole || hasAdminRole)
                                    && <InputGroup.Text style={{background: 'transparent', border: 'none'}}>
                                        {showSubtractCircle()}
                                        &nbsp; Remove Section
                                    </InputGroup.Text>
                                }
                            </div>

                            <Form.Label
                                htmlFor={`${section.section_name}_${section.page_section_id}_priority`}
                                className='mt-3'
                                column
                            >
                                <b>Priority</b>
                            </Form.Label>
                            <Form.Control
                                id={`${section.section_name}_${section.page_section_id}_priority`}
                                name={`${section.section_name}_${section.page_section_id}_priority`}
                                className='rounded w-25'
                                type='number'
                                value={priority}
                                onChange={async (e) => {
                                    const newPriority = e.target.value;
                                    setPriority(newPriority);

                                    if (newPriority && Number(newPriority) > 0) {
                                        await updateSection({
                                            pageSectionId: section.page_section_id,
                                            requestBody: {
                                                priority: newPriority
                                            }
                                        });
                                    }
                                }}
                                isInvalid={!priority || Number(priority) <= 0}
                            />
                            <Form.Control.Feedback type='invalid'>
                                Field must have a value greater than 0.
                            </Form.Control.Feedback>
                        </Form>
                        {
                            /**
                             * @type {Array<React.ReactNode>}
                             */
                            section.components.map((component, index) =>
                                <div key={`${component?.component_name}_${index}`}>
                                    <OfficeComponentGenerator component={component}/>
                                </div>)
                        }
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
};

SectionGenerator.propTypes = {
    section: componentContentWithEvents.isRequired
};

export default SectionGenerator;