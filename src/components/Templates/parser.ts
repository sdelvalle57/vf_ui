import { z } from "zod";
import { ActionType, EventType, FieldType, FieldValue, RecipeFlowTemplateArg, RecipeFlowTemplateDataFieldArg, RecipeTemplateType, RoleType } from "../../apollo/__generated__/graphql";



interface EventValue {
    id: FieldValue;
    field: string;
    type: FieldType;
    description: string;
    "form-required": boolean;
    "regulation-required": boolean;
    "read-only": boolean;
}

interface Event {
    type: EventType;
    action: ActionType;
    role: RoleType;
    values: Array<EventValue>;
}

interface JsonSchema {
    type: RecipeTemplateType;
    name: string;
    events: Array<Event>;
}

// Zod schemas
const eventValueSchema = z.object({
    id: z.nativeEnum(FieldValue),
    field: z.string(),
    type: z.nativeEnum(FieldType),
    description: z.string(),
    "form-required": z.boolean(),
    "regulation-required": z.boolean(),
    "read-only": z.boolean(),
});

const eventSchema = z.object({
    type: z.nativeEnum(EventType),
    action: z.nativeEnum(ActionType),
    role: z.nativeEnum(RoleType),
    values: z.array(eventValueSchema),
});

const jsonSchema = z.object({
    type: z.nativeEnum(RecipeTemplateType),
    name: z.string(),
    events: z.array(eventSchema),
});

export const parseJson = (data: string): JsonSchema => {
    const result = jsonSchema.safeParse(JSON.parse(data));

    if (!result.success) {
        throw new Error("Unable To Parse Data: " + result.error.message);
    } else {
        return result.data;
    }
}

export const parseRecipeFlows = (values: Array<Event>): Array<RecipeFlowTemplateArg> => {
    const recipeFLowTemplateArgs: Array<RecipeFlowTemplateArg> = values.map(v => {
        return {
            action: v.action,
            eventType: v.type,
            roleType: v.role,
            dataFields: buildDataFields(v.values)
        }
    })
    return recipeFLowTemplateArgs
}

const buildDataFields = (values: Array<EventValue>): Array<RecipeFlowTemplateDataFieldArg> => {
    const recipeFlowTemplateDataFieldArgs: Array<RecipeFlowTemplateDataFieldArg> = values.map(v => {
        return {
            field: v.field,
            fieldType: v.type,
            fieldValue: v.id,
            note: v.description || "",
            required: v["form-required"],
        }
    })
    return recipeFlowTemplateDataFieldArgs
}   