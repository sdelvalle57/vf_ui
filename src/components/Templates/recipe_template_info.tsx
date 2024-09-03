import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Card, CardBody, Heading, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { RecipeFlowTemplateWithDataFields, RecipeTemplateWithRecipeFlows } from "../../apollo/__generated__/graphql";

interface Props {
    recipeTemplate: RecipeTemplateWithRecipeFlows
}

const RecipeTemplateInfo = ({ recipeTemplate }: Props) => {

    const renderDataFields = (rf: RecipeFlowTemplateWithDataFields) => {
        return (
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr >
                            <Th>Name</Th>
                            <Th>Type</Th>
                            <Th>Note</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {rf.dataFields.map((df, i) => (
                            <Tr key={i} >
                                <Td>{df.field}</Td>
                                <Td>{df.fieldType}</Td>
                                <Td>{df.note}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        )
    }

    const renderItems = () => {
        return recipeTemplate.recipeFlows.map(rf => {
            return (
                <AccordionItem key={rf.id}>
                    <h2>
                        <AccordionButton>
                            <Box as='span' flex='1' textAlign='left'>
                                <strong>{`${rf.action} -> ${rf.roleType}`}</strong>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        {renderDataFields(rf)}
                    </AccordionPanel>
                </AccordionItem>
            )

        })
    }

    return (
        <Box>
            <Card style={{ margin: "2em auto", textAlign: "center" }} maxW='sm'>
                <CardBody>
                    <Stack mt='6' spacing='3'>
                        <Heading size='md'>{recipeTemplate.name}</Heading>
                        <Text>{recipeTemplate.recipeTemplateType}</Text>
                    </Stack>
                </CardBody>
            </Card>

            <Accordion style={{ maxWidth: "80%", margin: "auto" }} allowMultiple>
                {renderItems()}


            </Accordion>
        </Box>
    )
}

export default RecipeTemplateInfo;