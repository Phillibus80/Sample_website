import {useEffect, useRef} from 'react';

import PropTypes from 'prop-types';

import styles from './page-generator.module.scss';
import {SECTIONS} from '../../constants/app-constants.js';
import {QUERY_STATUS} from '../../constants/constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {useGetPageContent} from '../../hooks/api-hooks.js';
import Benefits from '../../sections/benefits/benefits.jsx';
import EventList from '../../sections/events-list/events-list.jsx';
import Footer from '../../sections/footer/footer.jsx';
import Header from '../../sections/header/header.jsx';
import Hero from '../../sections/hero/hero.jsx';
import HoneycombPictureGallery from '../../sections/hex-picture-gallery/honeycomb-picture-gallery.jsx';
import Info from '../../sections/info/info.jsx';
import InfoPicture from '../../sections/info-picture/info-picture.jsx';
import HexPictureGallery from '../../sections/spaced-hex-gallery/hex-picture-gallery.jsx';
import ScrollTopButton from '../scroll-top-button/scroll-top-button.jsx';

/**
 * A component that builds the sections according to the page name provided.
 * @param {string} pageName
 * @return {React.ReactNode|null}
 */
const PageGenerator = ({pageName}) => {
    // Get all the page's headerContent
    const {status, data} = useGetPageContent(pageName);
    const sectionsRef = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.visible);
                    }
                });
            },
            {threshold: 0.1}
        );

        sectionsRef.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, [data]);

    // Utility function to generate the sections
    const generateSections = () => {
        const {sections} = data.data;

        if (!sections || sections.length === 0) throw Error;

        return sections
            ?.sort((a, b) => Number(a.priority) - Number(b.priority))
            ?.map((section, index) => {
                if (!section) return null;

                const {section_name: sectionName} = section;
                switch (sectionName) {
                    case SECTIONS.HEADER:
                        return <Header pageName={pageName} key={`${pageName}_${sectionName}_${index}`}/>;
                    case SECTIONS.HERO:
                        return <div
                            ref={el => {
                                sectionsRef.current[index] = el;
                            }}
                            className={styles.fadeInSection}
                            key={`$${pageName}_${sectionName}_${index}`}
                        >
                            <Hero content={section}/>
                        </div>;
                    case SECTIONS.HEX_PICTURE_GALLERY:
                        return <div
                            ref={el => {
                                sectionsRef.current[index] = el;
                            }}
                            className={styles.fadeInSection}
                            key={`${pageName}_${sectionName}_${index}`}
                        >
                            <HoneycombPictureGallery content={section}/>
                        </div>;
                    case SECTIONS.INFO:
                        return <div
                            ref={el => {
                                sectionsRef.current[index] = el;
                            }}
                            className={styles.fadeInSection}
                            key={`${pageName}_${sectionName}_${index}`}
                        >
                            <Info content={section}/>
                        </div>;
                    case SECTIONS.BENEFITS:
                        return <div
                            ref={el => {
                                sectionsRef.current[index] = el;
                            }}
                            className={styles.fadeInSection}
                            key={`${pageName}_${sectionName}_${index}`}
                        >
                            <Benefits content={section}/>
                        </div>;
                    case SECTIONS.FOOTER:
                        return <div
                            ref={el => {
                                sectionsRef.current[index] = el;
                            }}
                            className={styles.fadeInSection}
                            key={`${pageName}_${sectionName}_${index}`}
                        >
                            <Footer content={section}/>
                        </div>;
                    case SECTIONS.SPACED_HEX_GALLERY:
                        return <div
                            ref={el => {
                                sectionsRef.current[index] = el;
                            }}
                            className={styles.fadeInSection}
                            key={`${pageName}_${sectionName}`}
                        >
                            <HexPictureGallery content={section}/>
                        </div>;
                    case SECTIONS.INFO_PICTURE:
                    case SECTIONS.INFO_GALLERY:
                        return <div
                            ref={el => {
                                sectionsRef.current[index] = el;
                            }}
                            className={styles.fadeInSection}
                            key={`${pageName}_${sectionName}`}
                        >
                            <InfoPicture content={section}/>
                        </div>;
                    case SECTIONS.EVENTS:
                        return <div
                            ref={el => {
                                sectionsRef.current[index] = el;
                            }}
                            className={styles.fadeInSection}
                            key={`${pageName}_${sectionName}`}
                        >
                            <EventList content={section}/>
                        </div>;
                }
            });
    };

    return status === QUERY_STATUS.SUCCESS ? (
        <>
            {generateSections()}
                <ScrollTopButton/>
        </>
    ) : null;
};

PageGenerator.propTypes = {
    pageName: PropTypes.oneOf(Object.values(ROUTING_CONSTANTS).map(({URL}) => URL))
};

export default PageGenerator;