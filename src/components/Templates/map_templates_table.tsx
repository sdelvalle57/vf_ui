import { Box, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { MapTemplateResponse } from "../../apollo/__generated__/graphql";
import { useRouter } from "next/router";

interface Props {
    mapTemplates: Array<MapTemplateResponse>
}

const MapTemplateTables = ({ mapTemplates }: Props) => {
    const router = useRouter();


    const onRowClick = (map_id: string) => {
        router.push({
            pathname: '/map_template',
            query: { map_id },
        }, `/map_template/${map_id}`);
    }

    return (
        <Box maxWidth="80%" textAlign="center" margin="2em auto">
            <TableContainer>
                <Table className="hover-table">
                    <Thead>
                        <Tr>
                            <Th>ID</Th>
                            <Th>Name</Th>
                            <Th>Type</Th>
                            <Th>Templates</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {mapTemplates.map((m) => (
                            <Tr onClick={() => onRowClick(m.map.id)} key={m.map.id} className="hover-pointer">
                                <Td>{m.map.id}</Td>
                                <Td>{m.map.name}</Td>
                                <Td>{m.map.type}</Td>
                                <Td>{m.templates.length}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    )

}

export default MapTemplateTables;

/* Hover and pointer CSS */
