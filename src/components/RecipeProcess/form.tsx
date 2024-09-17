import { Alert, Box, Button, FormControl, FormHelperText, FormLabel, Heading, Input, Select, Text } from "@chakra-ui/react";
import { ActionType, FieldClass, FieldType, Location, RecipeFlowDataField, RecipeProcessFlowResponse, ResourceSpecification, RoleType } from "../../apollo/__generated__/graphql";
import { useEffect, useState } from "react";

interface Props {
    processFlows: Array<RecipeProcessFlowResponse>,
    resources: Array<ResourceSpecification>,
    locations: Array<Location>,
    onFormSave: (processFlowDataFieldValues: Array<ProcessFlowWithDataFieldValues>) => Promise<boolean>
}

export interface ProcessFlowWithDataFieldValues {
    id: string,
    processFlowDataFieldValues: Array<DataFieldValue>
}

export interface DataFieldValue {
    id: string,
    value: string
}


const FormComponent = ({ processFlows, resources, locations, onFormSave }: Props) => {

    const [processFlowDataFieldValues, setProcessFlowDataFieldValues] = useState<Array<ProcessFlowWithDataFieldValues>>([]);

    useEffect(() => {
        const processFlowWithDataFieldValues: Array<ProcessFlowWithDataFieldValues> = []
        processFlows.map((p) => {
            const newDefaultValues: Array<DataFieldValue> = []
            p.dataFields.filter(df => !!df.defaultValue).map((df) => {
                newDefaultValues.push({
                    id: df.id,
                    value: df.defaultValue as string
                }) 
            });
            processFlowWithDataFieldValues.push({
                id: p.id,
                processFlowDataFieldValues: newDefaultValues
            })

        });
        setProcessFlowDataFieldValues(processFlowWithDataFieldValues)
    }, [processFlows]);

    console.log(processFlowDataFieldValues)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const saved = await onFormSave(processFlowDataFieldValues);

    }

    const handleChange = (
        pfId: string,
        data_field: RecipeFlowDataField,
        value: string
    ) => {
        const processFlow = processFlowDataFieldValues.find(pf => pf.id === pfId) as ProcessFlowWithDataFieldValues;
        const newDataFieldValues = processFlow.processFlowDataFieldValues.filter(df => df.id !== data_field.id);
        newDataFieldValues.push({
            id: data_field.id,
            value
        })
        processFlow.processFlowDataFieldValues = newDataFieldValues;


        const newProcessFlowDataFieldValues = processFlowDataFieldValues.filter(pf => pf.id !== pfId);
        newProcessFlowDataFieldValues.push(processFlow);

        setProcessFlowDataFieldValues(newProcessFlowDataFieldValues)
    }

    const renderSelectComponent = (pfId: string, df: RecipeFlowDataField, hideProduct?: boolean) => {
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
                        onChange={({ target }) => handleChange(pfId, df, target.value)}
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
                                onChange={({ target }) => handleChange(pfId, df, target.value)}
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

    const renderInputComponent = (pfId: string, df: RecipeFlowDataField) => {
        const required = df.required ? "*" : "";
        if (df.fieldClass === FieldClass.TrackingIdentifier) return null;
        return (
            <FormControl key={df.id} className="fields">
                <FormLabel>{`${df.field} ${required}`}</FormLabel>
                <FormHelperText>{df.note}</FormHelperText>
                <Input
                    required={df.required}
                    onChange={({ target }) => handleChange(pfId, df, target.value)}
                    type={df.fieldType.toLowerCase()}>
                </Input>
            </FormControl>
        )
    }

    const renderDisabledInputComponent = (pfId: string, df: RecipeFlowDataField, hideProduct?: boolean) => {
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


    const renderFields = (pf: RecipeProcessFlowResponse, hideProduct?: boolean) => {
        return pf.dataFields.map((f) => {
            if (f.defaultValue) return renderDisabledInputComponent(pf.id, f, hideProduct);
            if (f.fieldType === FieldType.Select) return renderSelectComponent(pf.id, f, hideProduct)
            else if (f.fieldType === FieldType.Number) return renderInputComponent(pf.id, f)
            else if (f.fieldType === FieldType.Date) return renderInputComponent(pf.id, f)
            else if (f.fieldType === FieldType.Text) return renderInputComponent(pf.id, f)
            return null
        })
    }

    return processFlows.map(pf => {
        let hideProduct = false;
        if (pf.action === ActionType.Modify) hideProduct = true;
        const title = pf.roleType === RoleType.Input ? "Input" : "Output"

        return (
            <div key={pf.id} className="fields">
                <Heading size={"sm"}>{title} Arguments</Heading>
                <form onSubmit={handleSubmit}>
                    {renderFields(pf, hideProduct)}
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