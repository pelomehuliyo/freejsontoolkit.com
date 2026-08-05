// Two near-identical config files so "Load Sample" shows a real, illustrative
// diff: three changed values and one added line. Text (not JSON) on purpose —
// this is the tool for logs, configs, code, markdown, env files, SQL.
export const SAMPLE_A = `# service config
env = staging
replicas = 2
region = us-east-1
debug = true`;

export const SAMPLE_B = `# service config
env = production
replicas = 4
region = us-east-1
debug = false
log_level = info`;

export const MAX_INPUT_CHARS = 15_000_000;

// Live (as-you-type) diffing stops above this combined size so big pastes never
// hitch the UI; past it, the user presses Compare explicitly.
export const AUTO_DIFF_THRESHOLD = 300_000;