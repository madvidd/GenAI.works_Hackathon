const contract = (name, properties) => ({ name: `traceharbor_${name}`, strict: true, schema: { type: 'object', properties, required: Object.keys(properties), additionalProperties: false } });
const choices = (values, minimum = 0, maximum = values.length) => ({ type: 'array', items: { type: 'string', enum: values }, minItems: minimum, maxItems: maximum, uniqueItems: true });
export const FOCUS_QUESTIONS = [
  'Check whether temperature observations support the reported status.',
  'Check whether valid calibration changes a temperature alarm.',
  'Check whether observation gaps prevent a supported conclusion.',
];
export const challengeText = recheck => ({
  calibration: 'Would the conclusion remain supported if calibration certificates were withheld?',
  coverage: 'Would the conclusion remain supported if the latest valid primary observation were missing?',
  source_conflict: 'Would the conclusion change if operator-note claims were withheld?',
})[recheck];

export function plannerSchema() {
  return contract('planner', {
    sources: { type: 'array', enum: [['manifest', 'telemetry'], ['manifest', 'telemetry', 'incidents'], ['manifest', 'telemetry', 'calibration']] },
    focus: { type: 'string', enum: FOCUS_QUESTIONS },
  });
}

export function criticSchema(missingSources, recheckOptions, citationIds) {
  return contract('critic', {
    retrieve_sources: missingSources.length ? choices(missingSources, 0, Math.min(2, missingSources.length)) : { type: 'array', maxItems: 0 },
    recheck: { type: 'string', enum: recheckOptions },
    citation_ids: choices(citationIds, 1, Math.min(3, citationIds.length)),
  });
}

export function synthesisSchema(result) {
  return contract('synthesis', {
    finding_ids: choices(result.findings.map(item => item.id), 1, Math.min(2, result.findings.length)),
    action_ids: choices(result.actions.map(item => item.id), 1, Math.min(2, result.actions.length)),
    citation_ids: choices(result.evidence.map(item => item.id), 1, Math.min(3, result.evidence.length)),
  });
}
