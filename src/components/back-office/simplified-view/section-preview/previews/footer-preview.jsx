import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import {FiMapPin, FiPhone} from 'react-icons/fi';

import {componentContentWithEvents} from '../../../../../common/commonPropTypes.jsx';
import * as contactStyles from '../../../../../components/contact-us/contact-us.module.scss';
import SocialMediaGallery from '../../../../../components/galleries/social-meida-gallery/social-media-gallery.jsx';
import HexPattern from '../../../../../components/hex-pattern/hex-pattern.jsx';
import {COMPONENTS} from '../../../../../constants/app-constants.js';
import * as footerStyles from '../../../../../sections/footer/footer.module.scss';
import EditableOverlay from '../../editable-overlay/editable-overlay.jsx';
import OrphanStrip from '../orphan-strip.jsx';
import {findComponent} from '../utils.js';

const HANDLED = [
    COMPONENTS.TITLE,
    COMPONENTS.SUBTITLE,
    COMPONENTS.BUTTON,
    COMPONENTS.CONTACT_FIELD,
    COMPONENTS.SOCIAL_GALLERY,
    COMPONENTS.EMAIL_FIELD
];

/**
 * Mirrors src/sections/footer/footer.jsx. The public ContactUs component
 * renders TITLE's text and CONTACT_FIELD's list as a single block, so that
 * structure is decomposed here (same classes from contact-us.module.scss) to
 * give each component its own overlay — same precedent as InfoPreview.
 *
 * EMAIL_FIELD is a structural marker with no editable content; the signup
 * form renders as an inert visual (disabled input, no Formik, no submit) so
 * ADMIN/USER can see the element exists. BUTTON sits inside the form visually
 * but is a separate component and gets its own overlay.
 *
 * @param {Section} section
 * @param {function} onEdit
 * @return {React.ReactNode}
 */
const FooterPreview = ({section, onEdit}) => {
    const title = findComponent(section, COMPONENTS.TITLE);
    const subtitle = findComponent(section, COMPONENTS.SUBTITLE);
    const button = findComponent(section, COMPONENTS.BUTTON);
    const contactField = findComponent(section, COMPONENTS.CONTACT_FIELD);
    const socialGallery = findComponent(section, COMPONENTS.SOCIAL_GALLERY);

    const titleText = title?.textContent?.at(0)?.text ?? '';
    const subTitleText = subtitle?.textContent?.at(0)?.text ?? '';
    const btnText = button?.textContent?.at(0)?.text ?? '';
    const contactTextContent = contactField?.textContent ?? [];
    const contactFieldImages = contactField?.images ?? [];
    const socialMediaImages = socialGallery?.images ?? [];
    const socialMediaLinks = socialGallery?.links ?? [];

    const hasEmailField = section?.components?.some(
        ({component_name}) => component_name === COMPONENTS.EMAIL_FIELD
    );

    return (
        <>
            <section className={`position-relative overflow-hidden p-3 p-md-4 p-lg-5 ${footerStyles.footer}`}>
                <div className={`position-absolute ${footerStyles.footer_background}`}>
                    <div className='position-relative'>
                        <HexPattern rows={4}/>
                    </div>
                </div>

                <Container className='position-relative'>
                    <EditableOverlay component={subtitle} onClick={onEdit}>
                        <h2 className={`${footerStyles.footer_subtitle} text-start mb-0`}>{subTitleText}</h2>
                    </EditableOverlay>

                    {hasEmailField && (
                        <div className='text-start mt-4'>
                            <Form.Group className='mb-3'>
                                <Form.Label className={footerStyles.footer_form_label} column={true}>
                                    Email address
                                </Form.Label>
                                <Form.Control
                                    type='email'
                                    placeholder='Enter your email'
                                    className={`${footerStyles.footer_form_email} mt-1`}
                                    disabled
                                />
                            </Form.Group>

                            <EditableOverlay component={button} onClick={onEdit}>
                                <Button className={footerStyles.footer_form_btn} variant='primary' type='button'>
                                    {btnText}
                                </Button>
                            </EditableOverlay>
                        </div>
                    )}

                    <div className='text-start mt-5'>
                        <EditableOverlay component={title} onClick={onEdit}>
                            <h3 className={`${contactStyles.title} text-start mb-0`}>{titleText}</h3>
                        </EditableOverlay>

                        <EditableOverlay component={contactField} onClick={onEdit}>
                            <ul className={`d-flex flex-column mb-0 ${contactStyles.contact_us}`}>
                                {contactTextContent.map((content, index) => (
                                    <li
                                        className={`d-flex align-items-top ${contactStyles.contact_us_row}`}
                                        key={content?.component_content_id}
                                    >
                                        <div className={`pt-2 ${contactStyles.contact_us_image}`}>
                                            {contactFieldImages?.at(index)?.image_text === 'Map Pin Clip Art'
                                                ? <FiMapPin/>
                                                : <FiPhone/>}
                                        </div>
                                        <div className={`ms-2 mt-2 ${contactStyles.contact_us_item}`}>
                                            {content.text}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </EditableOverlay>
                    </div>

                    <EditableOverlay component={socialGallery} onClick={onEdit}>
                        <SocialMediaGallery
                            socialMediaImages={socialMediaImages}
                            socialMediaLinks={socialMediaLinks}
                        />
                    </EditableOverlay>
                </Container>
            </section>

            <OrphanStrip section={section} handledNames={HANDLED} onEdit={onEdit}/>
        </>
    );
};

FooterPreview.propTypes = {
    section: componentContentWithEvents.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default FooterPreview;
