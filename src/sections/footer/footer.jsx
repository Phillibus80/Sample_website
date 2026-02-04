import {Formik} from 'formik';
import {Spinner} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import {object, string} from 'yup';

import * as styles from './footer.module.scss';
import {sectionContentPropType} from '../../common/commonPropTypes.jsx';
import ContactUs from '../../components/contact-us/contact-us.jsx';
import SocialMediaGallery from '../../components/galleries/social-meida-gallery/social-media-gallery.jsx';
import HexPattern from '../../components/hex-pattern/hex-pattern.jsx';
import {COMPONENTS} from '../../constants/app-constants.js';
import {emailRegExp} from '../../constants/constants.js';
import {useSendEmail} from '../../hooks/api-hooks.js';
import {extractComponentsFromSection} from '../../utils/utils.js';

/**
 * The Footer section.  It displays contact, social media, and misc information with a
 * honeycomb background.
 *
 * @param {Section} content
 * @return {React.ReactNode|null}
 */
const Footer = ({content}) => {
    const {
        mutate: sendEmail,
        isPending
    } = useSendEmail();

    if (!content) return null;

    const emailFieldName = `contact_email`;

    const {textContent: titleTxtContent} = extractComponentsFromSection(content, COMPONENTS.TITLE, ['textContent']) ?? {textContent: []};
    const {text: titleText} = titleTxtContent?.at(0) ?? {text: ''};

    const {textContent: subTitleTxtContent} = extractComponentsFromSection(content, COMPONENTS.SUBTITLE, ['textContent']) ?? {textContent: []};
    const {text: subTitleText} = subTitleTxtContent?.at(0) ?? {text: ''};

    const {images: socialMediaImages, links: socialMediaLinks} =
    extractComponentsFromSection(content, COMPONENTS.SOCIAL_GALLERY, ['images', 'links']) ?? {images: [], links: []};

    const {textContent: btnTextContent} = extractComponentsFromSection(content, COMPONENTS.BUTTON, ['textContent']) ?? {textContent: []};
    const {text: btnText} = btnTextContent?.at(0) ?? {text: ''};

    const {
        textContent: contactTextContent,
        images: contactFieldImages
    } = extractComponentsFromSection(content, COMPONENTS.CONTACT_FIELD, ['textContent', 'images']) ?? {
        textContent: [],
        images: []
    };

    const hasEmailField = content?.components?.some(({component_name}) => component_name === COMPONENTS.EMAIL_FIELD);

    return (
        <section className={`position-relative overflow-hidden mt-3 p-3 p-md-4 p-lg-5 ${styles.footer}`}>
            <div className={`position-absolute ${styles.footer_background}`}>
                <div className='position-relative'>
                    <HexPattern rows={4}/>
                </div>
            </div>

            <Container className='position-relative'>
                <h2 className={`${styles.footer_subtitle} text-start mb-0`}>{subTitleText}</h2>
                {
                    hasEmailField &&
                    <Formik
                        enableReinitialize
                        initialValues={{[emailFieldName]: ''}}
                        validationSchema={object().shape({
                            [emailFieldName]: string().matches(emailRegExp, 'Please enter a valid email').required('Email cannot be blank.')
                        })}
                        onSubmit={(values, formikHelpers) => {
                            sendEmail(values.contact_email, {
                                onSuccess: () => formikHelpers.resetForm()
                            });
                        }}
                    >
                        {({
                              handleSubmit,
                              handleChange,
                              handleBlur,
                              touched,
                              errors
                          }) =>
                            <Form className='text-start mt-4' onSubmit={handleSubmit}>
                                <Form.Group className='mb-3' controlId='formBasicEmail'>
                                    <Form.Label
                                        className={`${styles.footer_form_label}`}
                                        column={true}
                                    >
                                        Email address
                                    </Form.Label>

                                    <Form.Control
                                        type='email'
                                        name={emailFieldName}
                                        placeholder='Enter your email'
                                        className={`${styles.footer_form_email} mt-1`}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched[emailFieldName] && !!errors[emailFieldName]}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        {`${errors[emailFieldName]}`}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button
                                    className={`${styles.footer_form_btn} mt-3`}
                                    variant='primary'
                                    type='submit'
                                    disabled={isPending || Object.keys(errors).length > 0}
                                >
                                    {btnText}
                                    {(isPending) ?
                                        <Spinner className='ms-3' animation='border' role='statue'/> : ''}
                                </Button>
                            </Form>
                        }
                    </Formik>
                }

                <ContactUs
                    titleText={titleText}
                    contactTextContent={contactTextContent}
                    contactFieldImages={contactFieldImages}
                />

                <SocialMediaGallery
                    socialMediaImages={socialMediaImages}
                    socialMediaLinks={socialMediaLinks}
                />
            </Container>
        </section>
    );
};

Footer.propTypes = sectionContentPropType;

export default Footer;