import PageGenerator from '../../components/page-generator/page-generator.jsx';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {toKebabCase} from '../../utils/utils.js';

const AboutUs = () => <PageGenerator pageName={toKebabCase(ROUTING_CONSTANTS.ABOUT_US.LABEL)}/>;

export default AboutUs;