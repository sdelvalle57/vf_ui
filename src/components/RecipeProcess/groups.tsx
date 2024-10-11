import { Box, Grid, GridItem, Heading, Input, Select } from "@chakra-ui/react";
import { AgentLocation, AgentWithLocations, EconomicResourceWithSpec, FieldClass, FieldGroupClass, FieldType, RecipeFlowDataFieldInput, RecipeWithResources, useEconomicResourcesByAgentIdQuery, useGetAgentsWithLocationQuery } from "../../apollo/__generated__/graphql";
import { Group } from "./edit_process";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";

interface Props {
    recipe: RecipeWithResources,
    groups: Array<Group>
}

const GroupsComponent = ({ recipe, groups }: Props) => {








    const onChange = (dfId: string, value: string) => {


    }




    const renderResourceSpecification = (g: Group) => {
        const productDF = g.data_fields.find(df => df.fieldClass === FieldClass.ResourceSpecification) as RecipeFlowDataFieldInput;
        const quantityDF = g.data_fields.find(df => df.fieldClass === FieldClass.Quantity) as RecipeFlowDataFieldInput;

        const values: Array<SelectValue> = recipe.resourceSpecifications.map(r => {
            return {
                id: r.id,
                name: r.name
            }
        })
        return (
            <Box key={g.data.id} className="fields">
                <Heading size={"md"}>{`${g.data.name}`}</Heading>
                <div style={{ display: "inline-flex" }}>
                    <SelectComponent
                        defaultValue={productDF.defaultValue || ""}
                        field={productDF.field}
                        id={productDF.id}
                        note={productDF.note || ""}
                        fieldType={FieldType.Select}
                        required={productDF.required ? "*" : ""}
                        values={values}
                        onChange={onChange} />
                    <InputComponent
                        defaultValue={quantityDF.defaultValue || ""}
                        field={quantityDF.field}
                        id={quantityDF.id}
                        note={quantityDF.note || ""}
                        fieldType={FieldType.Number}
                        required={quantityDF.required ? "*" : ""}
                        values={[]}
                        onChange={onChange} />
                </div>
            </Box>
        )
    }



    const renderCustom = (g: Group) => {
        return <></>
    }

    const renderGroups = () => {
        return groups.map(g => {
            switch (g.data.groupClass) {
                case FieldGroupClass.ResourceSpecification: return renderResourceSpecification(g)
                case FieldGroupClass.EconomicResource: return <EconomicResource g={g} onChange={onChange} recipe={recipe} />
                case FieldGroupClass.Location: return <Location g={g} onChange={onChange} />
                case FieldGroupClass.Custom: return renderCustom(g)
            }
        })
    }

    return renderGroups()
}

export default GroupsComponent;

interface EconomicResourceProps {
    recipe: RecipeWithResources
    g: Group,
    onChange: (dfId: string, value: string) => void
}

const EconomicResource = ({ g, onChange, recipe }: EconomicResourceProps) => {
    const selectedAgent = useSelector((state: RootState) => state.selectedAgent.value);

    const { data: economicResourcesQuery } = useEconomicResourcesByAgentIdQuery({
        variables: { agentId: selectedAgent?.id || '' },  // Pass empty string or a default value if selectedAgent is null
        skip: !selectedAgent,
        pollInterval: 5000
    })

    const [economicResources, setEconomicResources] = useState<Array<EconomicResourceWithSpec> | null>(null)


    const productDF = g.data_fields.find(df => df.fieldClass === FieldClass.ResourceSpecification) as RecipeFlowDataFieldInput;
    const economicResourceDF = g.data_fields.find(df => df.fieldClass === FieldClass.EconomicResource) as RecipeFlowDataFieldInput;
    const quantityDF = g.data_fields.find(df => df.fieldClass === FieldClass.Quantity) as RecipeFlowDataFieldInput;


    const onResourceChange = (dfId: string, value: string) => {
        if (economicResourcesQuery?.economicResourcesByAgentId) {
            const economicResourcesByResource = economicResourcesQuery.economicResourcesByAgentId.filter(l => l.resourceSpecification.id === value) as Array<EconomicResourceWithSpec>;
            setEconomicResources(economicResourcesByResource);
            onChange(dfId, value)
        }
    }

    const resourceSpecificationValues: Array<SelectValue> = recipe.resourceSpecifications.map(r => {
        return {
            id: r.id,
            name: r.name
        }
    })

    const economicResourcesValues: Array<SelectValue> = (economicResources && economicResources.map(e => {
        return {
            id: e.id,
            name: e.referenceNumber.toString()
        }
    })) || []

    return (
        <Box key={g.data.id} className="fields">
            <Heading size={"md"}>{`${g.data.name}`}</Heading>
            <Grid templateColumns='repeat(3, 1fr)' gap={6}>
                <GridItem>
                    <SelectComponent
                        defaultValue={productDF.defaultValue || ""}
                        field={productDF.field}
                        id={productDF.id}
                        note={productDF.note || ""}
                        fieldType={FieldType.Select}
                        required={productDF.required ? "*" : ""}
                        values={resourceSpecificationValues}
                        onChange={onResourceChange} />
                </GridItem>

                <GridItem>
                    {economicResources && <SelectComponent
                        defaultValue={economicResourceDF.defaultValue || ""}
                        field={economicResourceDF.field}
                        id={economicResourceDF.id}
                        note={economicResourceDF.note || ""}
                        fieldType={FieldType.Select}
                        required={economicResourceDF.required ? "*" : ""}
                        values={economicResourcesValues}
                        onChange={onChange} />}
                </GridItem>

                <GridItem>
                    <InputComponent
                        defaultValue={quantityDF.defaultValue || ""}
                        field={quantityDF.field}
                        id={quantityDF.id}
                        note={quantityDF.note || ""}
                        fieldType={FieldType.Number}
                        required={quantityDF.required ? "*" : ""}
                        values={recipe.resourceSpecifications}
                        onChange={onChange} />
                </GridItem>

            </Grid>
        </Box>
    )


}


interface LocationProps {
    g: Group,
    onChange: (dfId: string, value: string) => void
}

const Location = ({ g, onChange }: LocationProps) => {

    const agentDF = g.data_fields.find(df => df.fieldClass === FieldClass.Agent) as RecipeFlowDataFieldInput;
    const locationDF = g.data_fields.find(df => df.fieldClass === FieldClass.Location) as RecipeFlowDataFieldInput;
    const [agentLocations, setAgentLocations] = useState<Array<AgentLocation> | null>(null)
    const [agents, setAgents] = useState<Array<SelectValue>>([])

    const { data: locations } = useGetAgentsWithLocationQuery({
        pollInterval: 5000
    })

    useEffect(() => {
        if (locations) {
            const agents: Array<SelectValue> = locations.agentsWithLocation.map(l => {
                return {
                    id: l.id,
                    name: l.name
                }
            })
            setAgents(agents)
        }
    }, [locations])

    const onAgentChange = (dfId: string, value: string) => {
        if (locations?.agentsWithLocation) {
            const agentWithLocations = locations.agentsWithLocation.find(l => l.id === value) as AgentWithLocations;
            setAgentLocations(agentWithLocations.locations);
            onChange(dfId, value)
        }
    }

    return (
        <Box key={g.data.id} className="fields">
            <Heading size={"md"}>{`${g.data.name}`}</Heading>
            <div style={{ display: "inline-flex" }}>
                <SelectComponent
                    defaultValue={agentDF.defaultValue || ""}
                    field={agentDF.field}
                    id={agentDF.id}
                    note={agentDF.note || ""}
                    fieldType={FieldType.Select}
                    required={agentDF.required ? "*" : ""}
                    values={agents}
                    onChange={onAgentChange} />
                {agentLocations && <SelectComponent
                    defaultValue={locationDF.defaultValue || ""}
                    field={locationDF.field}
                    id={locationDF.id}
                    note={locationDF.note || ""}
                    fieldType={FieldType.Select}
                    required={locationDF.required ? "*" : ""}
                    values={agentLocations}
                    onChange={onChange} />}
            </div>
        </Box>
    )
}


interface SelectValue {
    id: string,
    name: string
}

interface ComponentProps {
    id: string,
    required: string,
    field: string,
    note: string,
    defaultValue: string,
    values: Array<SelectValue>,
    fieldType: FieldType,
    onChange: (id: string, value: string) => void
}


const SelectComponent = ({ id, required, field, note, defaultValue, values, onChange }: ComponentProps) => {
    return (
        <Box key={id} className="field-group">
            <Heading size={"xs"}>{`${field} ${required}`}</Heading>
            <small style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{note}</small>
            <Select
                onChange={({ target }) => onChange(id, target.value)}
                style={{ maxWidth: "20em" }}
                key={id}
                defaultValue={defaultValue || ""}
                placeholder="Default Value">
                {
                    values.map(v => {
                        return <option key={v.id} value={v.id}>{v.name}</option>
                    })
                }
            </Select>
        </Box>
    )
}

const InputComponent = ({ id, required, field, note, defaultValue, fieldType, onChange }: ComponentProps) => {
    return (
        <Box key={id} className="field-group">
            <Heading size={"xs"}>{`${field} ${required}`}</Heading>
            <small style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{note}</small>
            <Input
                onChange={({ target }) => onChange(id, target.value)}
                placeholder="Default Value"
                defaultValue={defaultValue || ""}
                type={fieldType.toLowerCase()}>
            </Input>
        </Box>
    )
}