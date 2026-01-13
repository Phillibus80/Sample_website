import {Image} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import styles from './navi.module.scss';
import {sectionContentPropType} from '../../common/commonPropTypes.jsx';
import {COMPONENTS} from '../../constants/app-constants.js';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {extractComponentsFromSection} from '../../utils/utils.js';
import CursiveTitle from '../typography/cursive-title/cursive-title.jsx';

/**
 * Navigation component
 *
 * @param {Section} headerContent
 * @return {React.ReactNode|null}
 */
const Navi = ({headerContent}) => {
    if (!headerContent) return null;

    const {
        images,
        textContent,
        links
    } = extractComponentsFromSection(headerContent, COMPONENTS.MENU, ['textContent', 'images', 'links']) ?? {
        textContent: [],
        images: [],
        links: []
    };

    const {src: image_url, alt: image_alt} = images?.at(0) ?? {src: '', alt: ''};
    const imageURL = `${image_url}`;

    const {text: txtContent} = textContent?.at(0) ?? {text: ''};

    const [logoLink, ...rest] = links;

    const routes = () =>
        rest?.map(
            ({
                 link_url: URL,
                 link_text: LABEL
             }, index) => {
                return LABEL !== ROUTING_CONSTANTS.ADMIN.LABEL && (
                    <div className='align-self-end' key={`${URL}_${index}`}>
                        <Nav.Link
                            href={`${URL}`}
                        >
                            {LABEL}
                        </Nav.Link>
                    </div>
                );
            }
        );

    return (
        <Navbar
            expand='lg'
            className={`bg-body-tertiary rounded-bottom shadow-sm ${styles.navi_background} ${styles.onTop}`}
        >
            <Container className='d-flex'>
                <Navbar.Brand href={logoLink?.link_url}>
                    <Image
                        className='object-fit-cover'
                        style={{width: '100%', maxHeight: '725px'}}
                        src={imageURL}
                        alt={image_alt}
                        fluid
                    />
                </Navbar.Brand>

                <div className={`d-block text-start`}>
                    <CursiveTitle strContent={txtContent}/>
                </div>

                <Navbar.Toggle aria-controls='basic-navbar-nav'/>
                <Navbar.Collapse id='basic-navbar-nav navbar-center'>
                    <Nav className='justify-content-end flex-lg-grow-1'>
                        {routes()}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

Navi.propTypes = sectionContentPropType;

export default Navi;