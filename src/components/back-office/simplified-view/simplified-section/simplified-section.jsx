import {useState} from 'react';

import {InputGroup, Spinner} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import {GrSubtractCircle} from 'react-icons/gr';

import * as styles from './simplified-section.module.scss';
import {componentContentWithEvents} from '../../../../common/commonPropTypes.jsx';
import {ROLES} from '../../../../constants/constants.js';
import {useAuth} from '../../../../hooks/auth/use-auth.jsx';
import {useRemovePageSection, useUpdatePageSection} from '../../../../hooks/page/page-hooks.jsx';
import ComponentEditorModal from '../component-editor-modal/component-editor-modal.jsx';
import SectionPreview from '../section-preview/section-preview.jsx';

/**
 * The simplified-view frame for a single page section. Mirrors the section
 * controls from SectionGenerator (Show switch, Remove button, Priority) with
 * identical hook payloads, then swaps the component accordion for a visual
 * preview plus a single-component editor modal.
 *
 * Modal target is tracked by component_name, not by object reference. When a
 * mutation inside the modal invalidates pageContent, the section prop
 * refreshes and the live component is re-derived from the new array — the
 * modal stays open and shows fresh data instead of a stale snapshot.
 *
 * @param {Section} section
 * @return {React.ReactNode|null}
 */
const SimplifiedSection = ({section}) => {
    const [shouldShowSection, setShouldShowSection] = useState(section?.show_section ?? true);
    const [priority, setPriority] = useState(section?.priority ?? 1);
    const [activeComponentName, setActiveComponentName] = useState(null);

    const {
        mutateAsync: updateSection,
        isPending: updatePending
    } = useUpdatePageSection();
    const {
        mutateAsync: removeSection,
        isPending: removePending
    } = useRemovePageSection();
    const {roles} = useAuth();

    if (!section) return null;

    const hasAdminRole = roles.includes(ROLES.ADMIN);
    const hasSuperRole = roles.includes(ROLES.SUPER);

    const areCallsPending = updatePending || removePending;

    // Re-derive on every render so the modal always sees post-mutation data.
    const activeComponent = activeComponentName
        ? section.components?.find(c => c.component_name === activeComponentName)
        : null;

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
            <h2 className={`text-start ${styles.sectionTitle}`}>Section:&nbsp;&nbsp;&nbsp;{section.section_name}</h2>

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

            <div className={`${styles.previewWrapper} ${!shouldShowSection ? styles.previewWrapperDimmed : ''}`}>
                {!shouldShowSection && <span className={styles.hiddenBadge}>Hidden</span>}
                <SectionPreview
                    section={section}
                    onEdit={(component) => setActiveComponentName(component.component_name)}
                />
            </div>

            <ComponentEditorModal
                component={activeComponent}
                show={activeComponentName !== null}
                onHide={() => setActiveComponentName(null)}
            />
        </Container>
    );
};

SimplifiedSection.propTypes = {
    section: componentContentWithEvents.isRequired
};

export default SimplifiedSection;
