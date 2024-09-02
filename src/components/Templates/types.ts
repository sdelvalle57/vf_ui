import { z } from "zod";

enum FormType {
    FDA = "FDA",
    Custom = "Custom"
}

enum Action {
    Cite = "Cite",
    Modify = "Modify",
    Produce = "Produce",
    Consume = "Consume",
    Transfer = "Transfer",
    Use = "Use",
    Load = "Load",
    Unload = "Unload"
}

enum EventType {
    EconomicEvent = "EconomicEvent"
}

enum Role {
    Output = "Output",
    Input = "Input"
}

enum DataFieldId {
    product = "product",
    quantity = "quantity",
    hasPointInTime = "hasPointInTime", 
    atLocation = "atLocation",
    note = "note",
}

enum DataFieldType {
    Text = "Text",
    Date = "Date",
    Number = "Number",
    Select = "Select"
}

interface EventValue {
    id: DataFieldId;
    field: string;
    type: DataFieldType;
    description: string;
    "form-required": boolean;
    "regulation-required": boolean;
    "read-only": boolean;
    "default-value": string | null;
}

interface Event {
    type: EventType;
    action: Action;
    role: Role;
    values: Array<EventValue>;
}

interface JsonSchema {
    type: FormType;
    name: string;
    events: Array<Event>;
}

// Zod schemas
const eventValueSchema = z.object({
    id: z.nativeEnum(DataFieldId),
    field: z.string(),
    type: z.nativeEnum(DataFieldType),
    description: z.string(),
    "form-required": z.boolean(),
    "regulation-required": z.boolean(),
    "read-only": z.boolean(),
    "default-value": z.string().nullable(),
});

const eventSchema = z.object({
    type: z.nativeEnum(EventType),
    action: z.nativeEnum(Action),
    role: z.nativeEnum(Role),
    values: z.array(eventValueSchema),
});

const jsonSchema = z.object({
    type: z.nativeEnum(FormType),
    name: z.string(),
    events: z.array(eventSchema),
});

export const parseJson = (data: string): z.infer<typeof jsonSchema> => {
    const result = jsonSchema.safeParse(JSON.parse(data));
    console.log(result)

    if (!result.success) {
        throw new Error("Unable To Parse Data: " + result.error.message);
    } else {
        return result.data;
    }
}
