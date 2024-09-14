import { Alert, Box, Button, Heading, Input, Select, Text } from "@chakra-ui/react";
import { ActionType, FieldClass, FieldType, Location, RecipeFlowDataField, RecipeProcessFlowResponse, ResourceSpecification, RoleType } from "../../apollo/__generated__/graphql";

interface Props {
    processFlows: Array<RecipeProcessFlowResponse>,
    resources: Array<ResourceSpecification>,
    locations: Array<Location>
}

//TODO: add form component


const FormComponent = ({processFlows, resources, locations}: Props) =>{

    const renderSelectComponent = (df: RecipeFlowDataField, hideProduct?: boolean) => {
        const required = df.required ? "*" : "";
        if (df.fieldClass === FieldClass.Product && !hideProduct) {
            return (
                <Box key={df.id} className="fields">
                    <Heading size={"md"}>{`${df.field} ${required}`}</Heading>
                    <Text size={"sm"}>{df.note}</Text>
                    <Select placeholder='Select Product' style={{ maxWidth: "20em" }} key={df.id}>
                        {
                            resources.map(p => {
                                return <option key={p.id} value={p.id}>{p.name}</option>
                            })
                        }
                    </Select>
                </Box>
            )
        } else if (df.fieldClass === FieldClass.AtLocation) {
            return (
                <Box key={df.id} className="fields">
                    <Heading size={"md"}>{`${df.field} ${required}`}</Heading>
                    <Text size={"sm"}>{df.note}</Text>
                    {
                        locations ? (
                            <Select placeholder='Select Address' style={{ maxWidth: "20em" }} key={df.id}>
                                {
                                    locations.map(p => {
                                        return <option key={p.id} value={p.id}>{p.name}</option>
                                    })
                                }
                            </Select>
                        ) : <Alert status="warning">No Locations found for Agent</Alert>
                    }
                </Box>
            )
        }
        return null;
    }

    const renderInputComponent = (df: RecipeFlowDataField) => {
        const required = df.required ? "*" : "";
        if (df.fieldClass === FieldClass.TrackingIdentifier) return null;
        return (
            <Box key={df.id} className="fields">
                <Heading size={"md"}>{`${df.field} ${required}`}</Heading>
                <Text size={"sm"}>{df.note}</Text>
                <Input
                    type={df.fieldType.toLowerCase()}>
                </Input>
            </Box>
        )
    }

    const renderDisabledInputComponent = (df: RecipeFlowDataField, hideProduct?: boolean) => {
        const required = df.required ? "*" : "";
        if (df.fieldClass === FieldClass.TrackingIdentifier) return null;
        if(df.fieldClass === FieldClass.Product && hideProduct) return null;
        if(!df.defaultValue) return null;

        let value = df.defaultValue;
        if(df.fieldClass === FieldClass.Product) {
            value = (resources.find(r => r.id === df.defaultValue) as ResourceSpecification).name;
        } else if(df.fieldClass === FieldClass.AtLocation && locations.length > 0) {
            value = (locations.find(l => l.id === df.defaultValue) as Location).name
        }
        return (
            <Box key={df.id} className="fields">
                <Heading size={"md"}>{`${df.field} ${required}`}</Heading>
                <Text size={"sm"}>{df.note}</Text>
                <Input
                    defaultValue={value}
                    disabled
                    type={df.fieldType.toLowerCase()}>
                </Input>
            </Box>
        )
    }


    const renderFields = (df: Array<RecipeFlowDataField>, hideProduct?: boolean) => {
        return df.map((f) => {
            if(f.defaultValue) return renderDisabledInputComponent(f, hideProduct);
            if (f.fieldType === FieldType.Select) return renderSelectComponent(f, hideProduct)
            else if (f.fieldType === FieldType.Number) return renderInputComponent(f)
            else if (f.fieldType === FieldType.Date) return renderInputComponent(f)
            else if (f.fieldType === FieldType.Text) return renderInputComponent(f)
            return null
        })
    }

    return processFlows.map(rf => {
        let hideProduct = false;
        if (rf.action === ActionType.Modify) hideProduct = true;
        const title = rf.roleType === RoleType.Input ? "Input" : "Output"
            
        return (
            <div key={rf.id} className="fields">
                <Heading size={"md"}>{title} Arguments</Heading>
                {renderFields(rf.dataFields, hideProduct)}
                <div style={{textAlign:"end"}}><Button colorScheme="teal">Save</Button></div>
            </div>
        )
    })
}

export default FormComponent;