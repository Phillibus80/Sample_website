import PropTypes from 'prop-types';
import {FiMapPin, FiPhone} from 'react-icons/fi';

import * as styles from './contact-us.module.scss';

/**
 * A container component that includes the contact phone number and address.
 *
 * @param {string} titleText
 * @param {Array<TextContentObject>} contactTextContent
 * @param {Array<ImageObject>} contactFieldImages
 * @return {React.ReactNode}
 */
const ContactUs = ({titleText, contactTextContent, contactFieldImages}) => {
    if (!contactTextContent || contactTextContent.length === 0) return null;

    return (
        <div className='text-start mt-5'>
            <h3 className={`${styles.title} text-start`}>{titleText}</h3>

            <ul className={`d-flex flex-column ${styles.contact_us}`}>
                {
                    contactTextContent?.map((content, index) =>
                        <li
                            className={`d-flex align-items-top ${styles.contact_us_row}`}
                            key={content?.component_content_id}
                        >
                            <div className={`pt-2 ${styles.contact_us_image}`}>
                                {
                                    contactFieldImages?.at(index)?.image_text === 'Map Pin Clip Art'
                                        ? <FiMapPin/>
                                        : <FiPhone/>
                                }
                            </div>

                            <div className={`ms-2 mt-2 ${styles.contact_us_item}`}>
                                {content.text}
                            </div>
                        </li>
                    )
                }</ul>
        </div>
    );
};

ContactUs.propTypes = {
    titleText: PropTypes.string.isRequired,
    contactTextContent: PropTypes.arrayOf(PropTypes.shape({
        page_section_component_id: PropTypes.string,
        text: PropTypes.string,
        text_content_id: PropTypes.string,
        component_content_id: PropTypes.string
    })).isRequired,
    contactFieldImages: PropTypes.arrayOf(PropTypes.shape({
        alt: PropTypes.string,
        image_id: PropTypes.string,
        image_text: PropTypes.string,
        page_section_component_id: PropTypes.string,
        src: PropTypes.string,
        component_content_id: PropTypes.string
    })).isRequired,
};

export default ContactUs;