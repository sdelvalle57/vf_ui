import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import moment from "moment";
import { selectAgent } from "../../redux/selectedAgent";
import { Agent } from "../../apollo/__generated__/graphql";


interface AgentsTableProps {
    agents: Array<Agent>
}
const AgentsTable = (props: AgentsTableProps) => {
    const dispatch = useDispatch();
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);

    const renderSelectAgentButton = (a: Agent) => {
        if (selectedAgent && selectedAgent.id === a.id) return <Button disabled={true}>Selected</Button>
        return <Button colorScheme='blue' onClick={() => dispatch(selectAgent(a))}>Select</Button>
    }

    return (
        <TableContainer style={{ maxWidth: "80%", textAlign: "center", margin: "2em auto 2em auto" }}>
            <Table>
                <Thead>
                    <Tr>
                        <Th>Id</Th>
                        <Th>Name</Th>
                        <Th>Note</Th>
                        <Th>CreatedAt</Th>
                        <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>

                    {
                        props.agents.map(a => {
                            const date = moment.unix(a.createdAt).format("DD-MM-YYYY")
                            return (
                                <Tr key={a.id}>
                                    <Td>{a.id}</Td>
                                    <Td>{a.name}</Td>
                                    <Td>{a.note}</Td>
                                    <Td>{date}</Td>
                                    <Td>{renderSelectAgentButton(a)}</Td>
                                </Tr>
                            )
                        })
                    }
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default AgentsTable;