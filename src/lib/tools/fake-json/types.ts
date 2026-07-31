export interface FakeJsonOptions {
    count: number;
    seed: string; // empty = non-reproducible (crypto-seeded); set = deterministic
    pretty: boolean;
}

export interface TemplateValidity {
    ok: boolean;
    message: string;
}

export interface FakeJsonResult {
    output: string;
    records: number;
    bytes: number;
    fields: number; // top-level key count of the template object (0 if not an object)
    ms: number;
    seedEcho: string; // the seed used, or "random"
}

export interface FakeJsonState {
    template: string;
    validity: TemplateValidity;
    result: FakeJsonResult | null;
    count: number;
    seed: string;
    pretty: boolean;
    isRunning: boolean;
    needsManual: boolean;
    error: string | null;
}

export const DEFAULT_STATE: FakeJsonState = {
    template: `{
  "id": "{{index1}}",
  "name": "{{name}}",
  "email": "{{email}}",
  "age": "{{int:18..65}}",
  "active": "{{bool}}",
  "score": "{{float:0..10}}",
  "role": "{{enum:admin|editor|viewer}}",
  "ip": "{{ipv4}}",
  "joined": "{{date:2021..2024}}",
  "bio": "{{sentence}}"
}`,
    validity: { ok: true, message: "" },
    result: null,
    count: 5,
    seed: "",
    pretty: true,
    isRunning: false,
    needsManual: false,
    error: null,
};