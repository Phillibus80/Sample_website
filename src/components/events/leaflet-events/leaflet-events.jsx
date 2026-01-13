import PropTypes from 'prop-types';
import {Row} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import {FaAt} from 'react-icons/fa';
import {FiMapPin, FiPhone} from 'react-icons/fi';
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import * as styles from './leaflet-events.module.scss';
import {PLACEHOLDER_TEXT} from '../../../constants/constants.js';
import {formatPhoneNumber} from '../../../utils/utils.js';
import HexPattern from '../../hex-pattern/hex-pattern.jsx';

/**
 * Event list that shows the map from Leaflet for each event list item.
 *
 * @param {Array<EventObject>} events
 * @return {React.ReactNode | null}
 */
const LeafletEvents = ({events}) => {
    if (!events || events.length === 0) return null;

    /**
     * A utility function that generates the separate Leaflet maps.
     *
     * @return {Array<React.ReactNode> | null}
     */
    const generateMaps = () => events?.reduce((accum, event) => {
        event.event_title !== PLACEHOLDER_TEXT
        && accum.push(
            <Container
                className={`position-relative mt-5 mb-3 rounded-3 overflow-hidden ${styles.map}`}
                key={event.component_content_id}
            >
                <Row>
                    <h2 className={`p-3 mb-0 ${styles.map_title}`}>
                        <span className='fw-bold'>{event.event_title}</span>
                    </h2>
                </Row>

                <div className={`position-absolute ${styles.map_background}`}>
                    <div className='position-relative'>
                        <HexPattern rows={4}/>
                    </div>
                </div>

                <div className={`d-flex justify-content-md-between p-3 ${styles.map_content}`}>
                    <div className='w-100 pe-3'>
                        <h3 className={`text-start mb-3 ${styles.map_content_details}`}>Event Details:</h3>

                        <p className={`${styles.map_content_text} flex-grow-1 w-100`}>{event.event_description}</p>

                        <h4 className={`mt-3 ${styles.map_content_text} fw-bold`}>Location Details:</h4>
                        <div className={`${styles.map_content_text} d-flex align-items-center gap-2`}>
                            <FiMapPin size={16} style={{fill: 'white', fillOpacity: '25%'}}/>
                            {event.event_location}
                        </div>
                        <div className={`${styles.map_content_text} d-flex align-items-center gap-2 w-100`}>
                            {
                                event.event_time
                                && <FaAt size={16} style={{stroke: 'white', fillOpacity: '85%'}}/>
                            }
                            {new Date(event.event_time).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                        <div className={`${styles.map_content_text} w-100`}>{event.event_address}</div>
                        <div
                            className={`${styles.map_content_text} w-100`}>{`${event.event_city}, ${event.event_state} ${event.event_zip}`}</div>
                        <div className={`${styles.map_content_text} d-flex align-items-center gap-2 mb-sm-3 mb-md-0`}>
                            {event.event_telephone && <FiPhone size={16} style={{fill: 'white', fillOpacity: '25%'}}/>}
                            {formatPhoneNumber(event.event_telephone) ?? ''}
                        </div>
                    </div>

                    <div className={`rounded-3 overflow-hidden ${styles.map_content_container}`}>
                        <MapContainer
                            className={`${styles.leafletContainer}`}
                            center={[event.event_lat, event.event_lng]}
                            zoom={13}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                            />
                            <Marker position={[event.event_lat, event.event_lng]}>
                                <Popup>
                                    <div>{event.event_location}</div>
                                    <div>{event.event_address}</div>
                                    <div>{`${event.event_city}, ${event.event_state}`}</div>
                                    <div>{event.event_zip}</div>
                                    <div>{formatPhoneNumber(event.event_telephone) ?? ''}</div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>
            </Container>);

        return accum;
    }, []);

    return generateMaps();
};

LeafletEvents.propTypes = {
    events: PropTypes.arrayOf(PropTypes.shape({
        component_content_id: PropTypes.string,
        page_section_component_id: PropTypes.string,
        event_id: PropTypes.string.isRequired,
        event_title: PropTypes.string.isRequired,
        event_description: PropTypes.string.isRequired,
        event_location: PropTypes.string.isRequired,
        event_address: PropTypes.string.isRequired,
        event_city: PropTypes.string.isRequired,
        event_state: PropTypes.string.isRequired,
        event_zip: PropTypes.string.isRequired,
        event_telephone: PropTypes.string.isRequired,
        event_lat: PropTypes.number.isRequired,
        event_lng: PropTypes.number.isRequired,
        event_time: PropTypes.string.isRequired
    })).isRequired
};

export default LeafletEvents;