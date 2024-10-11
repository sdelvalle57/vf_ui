import { z } from "zod";
import {
  ActionType,
  EventType,
  FieldType,
  FieldClass,
  RecipeFlowTemplateArg,
  RecipeFlowTemplateDataFieldArg,
  RoleType,
  FlowThrough,
  FieldGroupClass
} from "../../apollo/__generated__/graphql";

interface FieldInheritance {
  id: string,
  field: string
}

// EventValue interface
interface EventValue {
  id: string;
  class: FieldClass;
  field: string;
  type: FieldType;
  description: string;
  "form-required": boolean;
  "flow-through"?: FlowThrough; 
  "accept-default": boolean,
  inherits?: FieldInheritance
}

// Group interface
interface Group {
  name: string;
  class: FieldGroupClass;
  fields: Array<string>;
}

// Event interface
interface Event {
  type: EventType;
  id: string,
  action: ActionType;
  role: RoleType;
  values: Array<EventValue>;
  groups?: Array<Group>; // Add groups array as optional
}

// JsonSchema interface
interface JsonSchema {
  name: string;
  id: string;
  fulfills?: string;
  commitment?: ActionType;
  trigger?: ActionType;
  events: Array<Event>;
}

// Zod schemas
const fieldInheritanceSchema = z.object({
  id: z.string(),
  field: z.string(),
})

// Schema for EventValue
const eventValueSchema = z.object({
  id: z.string(), // ID is a string (like "PRODUCT_1")
  class: z.nativeEnum(FieldClass), // Class should map to FieldClass enum
  field: z.string(),
  type: z.nativeEnum(FieldType),
  description: z.string(),
  "form-required": z.boolean(),
  "flow-through": z.nativeEnum(FlowThrough).optional(), 
  "accept-default": z.boolean(),
  inherits: fieldInheritanceSchema.optional()
});

// Schema for Group
const groupSchema = z.object({
  name: z.string(),
  class: z.nativeEnum(FieldGroupClass), // Class can be a string, e.g., "Product", "Location"
  fields: z.array(z.string()) // List of field IDs as strings
});

// Schema for Event
const eventSchema = z.object({
  type: z.nativeEnum(EventType),
  id: z.string(),
  action: z.nativeEnum(ActionType),
  role: z.nativeEnum(RoleType),
  inherits: z.boolean().optional(),
  values: z.array(eventValueSchema),
  groups: z.array(groupSchema).optional() // Groups array as optional
});

// Schema for the entire JSON
const jsonSchema = z.object({
  name: z.string(),
  id: z.string(),
  commitment: z.nativeEnum(ActionType).optional(),
  fulfills: z.string().optional(),
  trigger: z.nativeEnum(ActionType).optional(),
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
      identifier: v.id,
      dataFields: buildDataFields(v.values),
      groups: v.groups || []
    };
  });
  return recipeFlowTemplateArgs;
};

// Build Data Fields
const buildDataFields = (values: Array<EventValue>): Array<RecipeFlowTemplateDataFieldArg> => {
  const recipeFlowTemplateDataFieldArgs: Array<RecipeFlowTemplateDataFieldArg> = values.map((v: EventValue) => {
    return {
      fieldClass: v.class, // Use the class field from EventValue
      fieldIdentifier: v.id, // ID should be passed as fieldIdentifier
      field: v.field,  // Mapping field
      fieldType: v.type, // Mapping fieldType
      note: v.description || "", // Use description as note
      required: v["form-required"], // Required field
      flowThrough: v["flow-through"],
      acceptDefault: v["accept-default"],
      inherits: v.inherits && {
        field: v.inherits.field,
        identifier: v.inherits.id
      }
    };
  });
  return recipeFlowTemplateDataFieldArgs;
};
