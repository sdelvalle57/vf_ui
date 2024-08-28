import { Box, Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import Link from 'next/link';
import moment from "moment";
import { ResourceSpecification } from "../../apollo/__generated__/graphql";

interface ResourceSpecificationsTableProps {
  resources: Array<ResourceSpecification>;
}

const ResourceSpecificationsTable = ({ resources }: ResourceSpecificationsTableProps) => {
  return (
    <Box maxWidth="80%" textAlign="center" margin="2em auto">
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Note</Th>
              <Th>Resource Type</Th>
              <Th>Unit of Measure</Th>
              <Th>Created At</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {resources.map((resource) => (
              <Tr key={resource.id}>
                <Td>{resource.id}</Td>
                <Td>{resource.name}</Td>
                <Td>{resource.note}</Td>
                <Td>{resource.resourceType}</Td>
                <Td>{resource.unitOfMeasure}</Td>
                <Td>{moment.unix(resource.createdAt).format("DD-MM-YYYY")}</Td>
                <Td>
                  <Link href={{
                    pathname: '/economic_resources',
                    query: { resource_id: resource.id },
                  }}
                    as={`/economic_resources/${resource.id}`}>
                    <Button as="a" colorScheme="teal" size="md">
                      Economic Resources
                    </Button>
                  </Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResourceSpecificationsTable