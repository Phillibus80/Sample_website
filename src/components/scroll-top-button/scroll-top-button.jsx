import {useEffect, useState} from 'react';

import {PiArrowFatUp} from 'react-icons/pi';

import * as styles from './scroll-top-button.module.scss';

const ScrollTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            const scrolled = window.scrollY;
            const quarterPageHeight = document.documentElement.scrollHeight / 4 - window.innerHeight;
            setIsVisible(scrolled > quarterPageHeight);
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    if (!isVisible) return null;
    return (
        <figure
            className={`${styles.honeycomb} mb-0`}
            onClick={scrollToTop}
        >
            <PiArrowFatUp/>
        </figure>
    );
};

export default ScrollTopButton;