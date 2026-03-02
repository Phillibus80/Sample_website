import {useState} from 'react';

import PropTypes from 'prop-types';
import Accordion from 'react-bootstrap/Accordion';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

import {extractBaseRoute, formatBaseRoute} from '../../../../utils/utils.js';
import BarChart from '../../../bar-chart/bar-chart.jsx';
import DataTable from '../../../data-table/DataTable.jsx';
import LineChart from '../../../line-chart/line-chart.jsx';
import PieChart from '../../../pie-chart/pie-chart.jsx';

const LG_PER_ROW = 4;
const MD_PER_ROW = 3;

/** Column definitions for the audit-log data table. */
const LOG_TABLE_COLUMNS = [
    {key: 'endpoint', label: 'Endpoint', sortable: true},
    {key: 'level', label: 'Level', sortable: true},
    {key: 'username', label: 'Username', sortable: true},
    {key: 'message', label: 'Message', sortable: true},
    {key: 'created_on', label: 'Created On', sortable: true}
];

/** Column keys available for filtering in the data table. */
const LOG_TABLE_FILTER_COLUMNS = [
    'endpoint',
    'level',
    'username',
    'message',
    'created_on'
];


/**
 * Displays audit log data as:
 *  1. A line chart and bar chart of log activity, side-by-side on large screens.
 *  2. Pie charts grouped by endpoint (with search and route-filter controls).
 *  3. A sortable, paginated, filterable data table of all log records.
 *
 * @param {Array} logs - Array of log objects from the admin context.
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

    const allChartData = Object.entries(groupedByEndpoint).map(
        ([endpoint, levelCounts]) => ({
            endpoint,
            series: Object.entries(levelCounts).map(([label, value]) => ({
                label,
                value
            }))
        })
    );

    const allBaseRoutes = [
        ...new Set(allChartData.map((c) => extractBaseRoute(c.endpoint)))
    ].sort();

    const filteredChartData = allChartData.filter((chart) => {
        const matchesSearch = chart.endpoint
            .toLowerCase()
            .includes(searchText.toLowerCase());
        const matchesRoute = selectedRoute
            ? extractBaseRoute(chart.endpoint) === selectedRoute
            : true;
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

            <Row className='mb-4 g-3'>
                <Col xs={12} lg={6}>
                    <LineChart logs={logs} title='Log Activity Over Time'/>
                </Col>
                <Col xs={12} lg={6}>
                    <BarChart logs={logs} title='Log Counts by Endpoint'/>
                </Col>
            </Row>

            {allChartData.length === 0 ? (
                <p className='text-muted text-center'>No logs available.</p>
            ) : (
                <>
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
                        <p className='text-muted text-center'>
                            No results match your filters.
                        </p>
                    )}

                    {hasResults && (
                        <Accordion
                            alwaysOpen
                            defaultActiveKey={allBaseRoutes}
                            key={allBaseRoutes.join(',')}
                        >
                            {Object.entries(groupedByRoute).map(
                                ([baseRoute, charts]) => {
                                    const lgRemainder =
                                        charts.length % LG_PER_ROW;
                                    const mdRemainder =
                                        charts.length % MD_PER_ROW;

                                    return (
                                        <Accordion.Item
                                            eventKey={baseRoute}
                                            key={baseRoute}
                                        >
                                            <Accordion.Header>
                                                {formatBaseRoute(baseRoute)}
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Row>
                                                    {charts.map(
                                                        (chart, index) => {
                                                            const inLastLgRow =
                                                                lgRemainder >
                                                                0 &&
                                                                index >=
                                                                charts.length -
                                                                lgRemainder;
                                                            const inLastMdRow =
                                                                mdRemainder >
                                                                0 &&
                                                                index >=
                                                                charts.length -
                                                                mdRemainder;

                                                            const lgSize =
                                                                inLastLgRow
                                                                    ? Math.floor(
                                                                        12 /
                                                                        lgRemainder
                                                                    )
                                                                    : 3;
                                                            const mdSize =
                                                                inLastMdRow
                                                                    ? Math.floor(
                                                                        12 /
                                                                        mdRemainder
                                                                    )
                                                                    : 4;

                                                            return (
                                                                <Col
                                                                    key={
                                                                        chart.endpoint
                                                                    }
                                                                    xs={12}
                                                                    md={mdSize}
                                                                    lg={lgSize}
                                                                    className='mb-4'
                                                                >
                                                                    <PieChart
                                                                        series={
                                                                            chart.series
                                                                        }
                                                                        title={
                                                                            chart.endpoint
                                                                        }
                                                                    />
                                                                </Col>
                                                            );
                                                        }
                                                    )}
                                                </Row>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    );
                                }
                            )}
                        </Accordion>
                    )}
                </>
            )}

            <div className='mt-5'>
                <h5 className='mb-3'>Audit Log Records</h5>
                {logs.length === 0 ? (
                    <p className='text-muted text-center'>No logs available.</p>
                ) : (
                    <DataTable
                        data={logs}
                        columns={LOG_TABLE_COLUMNS}
                        sortable
                        paginated
                        pageSize={50}
                        filterable
                        filterColumns={LOG_TABLE_FILTER_COLUMNS}
                        selectable={false}
                        striped
                        bordered
                        hover
                        responsive
                    />
                )}
            </div>
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