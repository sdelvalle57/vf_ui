import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { Location } from "../../apollo/__generated__/graphql";


interface Props {
    locations: Array<Location>
}

const LocationsTable = ({locations}: Props) => {
    return (
        <TableContainer style={{ maxWidth: "80%", textAlign: "center", margin: "2em auto 2em auto" }}>
            <Table>
                <Thead>
                    <Tr>
                        <Th>Id</Th>
                        <Th>Name</Th>
                        <Th>Value</Th>
                    </Tr>
                </Thead>
                <Tbody>

                    {
                        locations.map(l => {
                            return (
                                <Tr key={l.id}>
                                    <Td>{l.id}</Td>
                                    <Td>{l.name}</Td>
                                    <Td>{l.value}</Td>
                                </Tr>
                            )
                        })
                    }
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default LocationsTable;