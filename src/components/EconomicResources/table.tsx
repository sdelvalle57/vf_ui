import { Box, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { EconomicResource } from "../../apollo/__generated__/graphql";
import moment from "moment";


interface EconomicResourcesProps {
    economicResources: Array<EconomicResource>
}


const EconomicResourcesTable = (props: EconomicResourcesProps) => {

    const { economicResources} = props

    return (
        <Box maxWidth="100%" overflowX="auto">
                <TableContainer>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Name</Th>
                                <Th>Note</Th>
                                <Th>Accounting Quantity</Th>
                                <Th>On Hand Quantity</Th>
                                <Th>Tracking Identifier</Th>
                                <Th>Current Location</Th>
                                <Th>Lot</Th>
                                <Th>Contained In</Th>
                                <Th>Created At</Th>
                                <Th>Reference Number</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {economicResources.map((resource) => (
                                <Tr key={resource.id}>
                                    <Td>{resource.id}</Td>
                                    <Td>{resource.name}</Td>
                                    <Td>{resource.note || 'N/A'}</Td>
                                    <Td>{resource.accountingQuantity}</Td>
                                    <Td>{resource.onHandQuantity}</Td>
                                    <Td>{resource.trackingIdentifier || 'N/A'}</Td>
                                    <Td>{resource.currentLocation || 'N/A'}</Td>
                                    <Td>{resource.lot || 'N/A'}</Td>
                                    <Td>{resource.containedIn || 'N/A'}</Td>
                                    <Td>{moment.unix(resource.createdAt).format("DD-MM-YYYY")}</Td>
                                    <Td>{resource.referenceNumber || 'N/A'}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>f
                </TableContainer>
            </Box>
    )
}

export default EconomicResourcesTable;