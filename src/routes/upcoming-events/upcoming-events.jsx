import PageGenerator from '../../components/page-generator/page-generator.jsx';
import {ROUTING_CONSTANTS} from '../../constants/routing-constants.js';
import {toKebabCase} from '../../utils/utils.js';

const UpcomingEvents = () => <PageGenerator
    pageName={toKebabCase(ROUTING_CONSTANTS.UPCOMING_EVENTS.URL).replace('/', '')}/>;

export default UpcomingEvents;