import { z } from "zod";
import {
  ActionType,
  EventType,
  FieldType,
  FieldClass,
  RecipeFlowTemplateArg,
  RecipeFlowTemplateDataFieldArg,
  RecipeTemplateType,
  RoleType,
  FlowThrough
} from "../../apollo/__generated__/graphql";

// EventValue interface
interface EventValue {
  id: string;
  class: FieldClass;
  field: string;
  type: FieldType;
  description: string;
  "form-required": boolean;
  "flow-through"?: FlowThrough; // Add the flow-through field as an optional string
}

// Event interface
interface Event {
  type: EventType;
  action: ActionType;
  role: RoleType;
  values: Array<EventValue>;
}


// JsonSchema interface
interface JsonSchema {
  type: RecipeTemplateType;
  name: string;
  events: Array<Event>;
}

// Zod schemas

// Schema for EventValue
const eventValueSchema = z.object({
  id: z.string(), // ID is a string (like "PRODUCT_1")
  class: z.nativeEnum(FieldClass), // Class should map to FieldClass enum
  field: z.string(),
  type: z.nativeEnum(FieldType),
  description: z.string(),
  "form-required": z.boolean(),
  "flow-through": z.nativeEnum(FlowThrough).optional(), // Optional field, not present in the JSON
});

// Schema for Event
const eventSchema = z.object({
  type: z.nativeEnum(EventType),
  action: z.nativeEnum(ActionType),
  role: z.nativeEnum(RoleType),
  values: z.array(eventValueSchema),
});

// Schema for the entire JSON
const jsonSchema = z.object({
  type: z.nativeEnum(RecipeTemplateType),
  name: z.string(),
  events: z.array(eventSchema),
});

// Function to parse the JSON data
export const parseJson = (data: string): JsonSchema => {
  const result = jsonSchema.safeParse(JSON.parse(data));
  if (!result.success) {
    throw new Error("Unable To Parse Data: " + result.error.message);
  }
  return result.data;
};


// Parse Recipe Flows
export const parseRecipeFlows = (values: Array<Event>): Array<RecipeFlowTemplateArg> => {
  const recipeFlowTemplateArgs: Array<RecipeFlowTemplateArg> = values.map((v) => {
    return {
      action: v.action,
      eventType: v.type,
      roleType: v.role,
      dataFields: buildDataFields(v.values),
    };
  });
  return recipeFlowTemplateArgs;
};

// Build Data Fields
const buildDataFields = (values: Array<EventValue>): Array<RecipeFlowTemplateDataFieldArg> => {
  const recipeFlowTemplateDataFieldArgs: Array<RecipeFlowTemplateDataFieldArg> = values.map((v) => {
    return {
      fieldClass: v.class, // Use the class field from EventValue
      fieldIdentifier: v.id, // ID should be passed as fieldIdentifier
      field: v.field,  // Mapping field
      fieldType: v.type, // Mapping fieldType
      note: v.description || "", // Use description as note
      required: v["form-required"], // Required field
    };
  });
  return recipeFlowTemplateDataFieldArgs;
};
