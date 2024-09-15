import { Alert, Box, Button, FormControl, FormHelperText, FormLabel, Heading, Input, Select, Text } from "@chakra-ui/react";
import { ActionType, FieldClass, FieldType, Location, RecipeFlowDataField, RecipeProcessFlowResponse, ResourceSpecification, RoleType } from "../../apollo/__generated__/graphql";
import { useEffect, useState } from "react";

interface Props {
    processFlows: Array<RecipeProcessFlowResponse>,
    resources: Array<ResourceSpecification>,
    locations: Array<Location>
}

interface DataFieldValue {
    id: string,
    value: string
}


const FormComponent = ({ processFlows, resources, locations }: Props) => {

    const [dataFieldValues, setDataFieldValues] = useState<Array<DataFieldValue>>([]);

    useEffect(() => {
        const newDefaultValues: Array<DataFieldValue> = []
        processFlows.map((p) => {
            p.dataFields.filter(df => !!df.defaultValue).map((df) => {
                newDefaultValues.push({
                    id: df.id,
                    value: df.defaultValue as string
                }) 
            });
        });
        setDataFieldValues(newDefaultValues)
    }, [processFlows]);

    console.log(dataFieldValues)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        //TODO: handle save, execute process
    }

    const handleChange = (
        data_field: RecipeFlowDataField,
        value: string
    ) => {
        const newValues = dataFieldValues.filter(df => df.id !== data_field.id);
        newValues.push({
            id: data_field.id,
            value
        })
        setDataFieldValues(newValues)
    }

    const renderSelectComponent = (df: RecipeFlowDataField, hideProduct?: boolean) => {
        const required = df.required ? "*" : "";
        if (df.fieldClass === FieldClass.Product && !hideProduct) {
            return (
                <FormControl key={df.id} className="fields">
                    <FormLabel>{`${df.field} ${required}`}</FormLabel>
                    <FormHelperText>{df.note}</FormHelperText>
                    <Select
                        required={df.required}
                        placeholder='Select Product'
                        style={{ maxWidth: "20em" }}
                        onChange={({ target }) => handleChange(df, target.value)}
                        key={df.id}>
                        {
                            resources.map(p => {
                                return <option key={p.id} value={p.id}>{p.name}</option>
                            })
                        }
                    </Select>
                </FormControl>
            )
        } else if (df.fieldClass === FieldClass.AtLocation) {
            return (
                <FormControl key={df.id} className="fields">
                    <FormLabel>{`${df.field} ${required}`}</FormLabel>
                    <FormHelperText>{df.note}</FormHelperText>
                    {
                        locations ? (
                            <Select
                                required={df.required}
                                placeholder='Select Address'
                                onChange={({ target }) => handleChange(df, target.value)}
                                style={{ maxWidth: "20em" }}
                                key={df.id}>
                                {
                                    locations.map(p => {
                                        return <option key={p.id} value={p.id}>{p.name}</option>
                                    })
                                }
                            </Select>
                        ) : <Alert status="warning">No Locations found for Agent</Alert>
                    }
                </FormControl>
            )
        }
        return null;
    }

    const renderInputComponent = (df: RecipeFlowDataField) => {
        const required = df.required ? "*" : "";
        if (df.fieldClass === FieldClass.TrackingIdentifier) return null;
        return (
            <FormControl key={df.id} className="fields">
                <FormLabel>{`${df.field} ${required}`}</FormLabel>
                <FormHelperText>{df.note}</FormHelperText>
                <Input
                    required={df.required}
                    onChange={({ target }) => handleChange(df, target.value)}
                    type={df.fieldType.toLowerCase()}>
                </Input>
            </FormControl>
        )
    }

    const renderDisabledInputComponent = (df: RecipeFlowDataField, hideProduct?: boolean) => {
        const required = df.required ? "*" : "";
        if (df.fieldClass === FieldClass.TrackingIdentifier) return null;
        if (df.fieldClass === FieldClass.Product && hideProduct) return null;
        if (!df.defaultValue) return null;

        let value = df.defaultValue;
        if (df.fieldClass === FieldClass.Product) {
            value = (resources.find(r => r.id === df.defaultValue) as ResourceSpecification).name;
        } else if (df.fieldClass === FieldClass.AtLocation && locations.length > 0) {
            value = (locations.find(l => l.id === df.defaultValue) as Location).name
        }
        return (
            <FormControl key={df.id} className="fields">
                <FormLabel>{`${df.field} ${required}`}</FormLabel>
                <FormHelperText>{df.note}</FormHelperText>
                <Input
                    required={df.required}
                    defaultValue={value}
                    disabled
                    type={df.fieldType.toLowerCase()}>
                </Input>
            </FormControl>
        )
    }


    const renderFields = (df: Array<RecipeFlowDataField>, hideProduct?: boolean) => {
        return df.map((f) => {
            if (f.defaultValue) return renderDisabledInputComponent(f, hideProduct);
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
                <Heading size={"sm"}>{title} Arguments</Heading>
                <form onSubmit={handleSubmit}>
                    {renderFields(rf.dataFields, hideProduct)}
                    <div style={{ textAlign: "end" }}>
                        <Button
                            mt={4}
                            colorScheme="teal"
                            type="submit">Save
                        </Button>
                    </div>
                </form>

            </div>
        )
    })
}

export default FormComponent;