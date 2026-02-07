import {useState} from 'react';

import PropTypes from 'prop-types';
import Accordion from 'react-bootstrap/Accordion';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

import PieChart from '../../../pie-chart/pie-chart.jsx';

const LOG_COLORS = {
    success: '#28a745',
    warning: '#ffc107',
    critical: '#dc3545'
};

const LG_PER_ROW = 4;
const MD_PER_ROW = 3;

/**
 * Extracts the base route name from a full endpoint string.
 * e.g. "PATCH /images/@image_id" -> "images"
 *
 * @param {string} endpoint
 * @return {string}
 */
const extractBaseRoute = (endpoint) => {
    const parts = endpoint.split(' ');
    if (parts.length < 2) return endpoint;
    const segments = parts[1].split('/').filter(Boolean);
    return segments[0] ?? endpoint;
};

/**
 * Formats a base route name for display.
 * e.g. "pages_sections" -> "Pages Sections"
 *
 * @param {string} route
 * @return {string}
 */
const formatBaseRoute = (route) =>
    route.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * A component that displays audit log data grouped by endpoint as pie charts,
 * with search filtering and base-route dropdown.
 *
 * @param {Array} logs - Array of log objects from the API.
 * @return {React.JSX.Element}
 */
const OfficeLogs = ({logs}) => {
    const [searchText, setSearchText] = useState('');
    const [selectedRoute, setSelectedRoute] = useState('');

    const groupedByEndpoint = logs.reduce((acc, log) => {
        const {endpoint, level} = log;
        if (!acc[endpoint]) {
            acc[endpoint] = {};
        }
        acc[endpoint][level] = (acc[endpoint][level] || 0) + 1;
        return acc;
    }, {});

    const allChartData = Object.entries(groupedByEndpoint).map(([endpoint, levelCounts]) => ({
        endpoint,
        series: Object.entries(levelCounts).map(([label, value]) => ({label, value}))
    }));

    if (allChartData.length === 0) {
        return (
            <Container className='mt-5'>
                <p className='text-muted text-center'>No audit logs available.</p>
            </Container>
        );
    }

    const allBaseRoutes = [...new Set(allChartData.map((c) => extractBaseRoute(c.endpoint)))].sort();

    const filteredChartData = allChartData.filter((chart) => {
        const matchesSearch = chart.endpoint.toLowerCase().includes(searchText.toLowerCase());
        const matchesRoute = selectedRoute ? extractBaseRoute(chart.endpoint) === selectedRoute : true;
        return matchesSearch && matchesRoute;
    });

    const groupedByRoute = filteredChartData.reduce((acc, chart) => {
        const baseRoute = extractBaseRoute(chart.endpoint);
        if (!acc[baseRoute]) {
            acc[baseRoute] = [];
        }
        acc[baseRoute].push(chart);
        return acc;
    }, {});

    const hasResults = Object.keys(groupedByRoute).length > 0;

    return (
        <Container className='mt-5'>
            <Row className='mb-4 g-2'>
                <Col xs={12} md={8}>
                    <Form.Control
                        type='text'
                        placeholder='Filter endpoints...'
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        aria-label='Filter endpoints'
                    />
                </Col>
                <Col xs={12} md={4}>
                    <Form.Select
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                        aria-label='Select route'
                    >
                        <option value=''>All Routes</option>
                        {allBaseRoutes.map((route) => (
                            <option key={route} value={route}>
                                {formatBaseRoute(route)}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {!hasResults && (
                <p className='text-muted text-center'>No results match your filters.</p>
            )}

            {hasResults && (
                <Accordion alwaysOpen defaultActiveKey={allBaseRoutes} key={allBaseRoutes.join(',')}>
                    {Object.entries(groupedByRoute).map(([baseRoute, charts]) => {
                        const lgRemainder = charts.length % LG_PER_ROW;
                        const mdRemainder = charts.length % MD_PER_ROW;

                        return (
                            <Accordion.Item eventKey={baseRoute} key={baseRoute}>
                                <Accordion.Header>{formatBaseRoute(baseRoute)}</Accordion.Header>
                                <Accordion.Body>
                                    <Row>
                                        {charts.map((chart, index) => {
                                            const inLastLgRow = lgRemainder > 0 && index >= charts.length - lgRemainder;
                                            const inLastMdRow = mdRemainder > 0 && index >= charts.length - mdRemainder;

                                            const lgSize = inLastLgRow ? Math.floor(12 / lgRemainder) : 3;
                                            const mdSize = inLastMdRow ? Math.floor(12 / mdRemainder) : 4;

                                            return (
                                                <Col key={chart.endpoint} xs={12} md={mdSize} lg={lgSize} className='mb-4'>
                                                    <PieChart
                                                        series={chart.series}
                                                        colors={LOG_COLORS}
                                                        title={chart.endpoint}
                                                    />
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            )}
        </Container>
    );
};

OfficeLogs.propTypes = {
    logs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            endpoint: PropTypes.string,
            level: PropTypes.string,
            username: PropTypes.string,
            message: PropTypes.string,
            created_on: PropTypes.string
        })
    ).isRequired
};

export default OfficeLogs;
