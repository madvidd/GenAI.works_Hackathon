import { createHash } from 'node:crypto';
import { WorldModel, externalId } from '../core/vendor/meterless-world-model/src/index.ts';
import { FEED_NAMES } from '../core/investigator.mjs';

export async function buildWorldContext(feeds, shipmentId, { directory, runId, storage = 'local' } = {}) {
  const world = new WorldModel({ namespace: 'traceharbor', storage, directory, conflictPolicy: 'source-priority', sourcePriority: ['deterministic-analysis', 'calibration', 'telemetry', 'incidents', 'manifest'] });
  const observations = [];
  for (const feed of FEED_NAMES) for (const row of feeds[feed].records) {
    const text = JSON.stringify(row);
    observations.push({ externalId: `${feed}:${row.row_id}`, type: 'evidence', title: `${feed} ${row.row_id}`, text,
      at: row.source_updated_at, source: { kind: feed, by: 'traceharbor-ingest', at: row.source_updated_at, checksum: createHash('sha256').update(text).digest('hex'), url: `data/${feed}.json#${row.row_id}`, runId },
      // Operational identifiers must not pass through fuzzy name resolution:
      // TH-1041 and TH-1042 are different shipments despite similar spelling.
      entities: [],
    });
  }
  const ingestReport = await world.ingest(observations);
  for (const manifest of feeds.manifest.records) {
    const entityId = externalId('shipment', 'traceharbor', manifest.shipment_id);
    const attrs = { route: manifest.route, primarySensorId: manifest.primary_sensor_id };
    const current = world.view('graph').entity(entityId);
    if (!current || Object.entries(attrs).some(([key, value]) => current.attrs[key] !== value)) await world.upsertEntity({ type: 'shipment', externalKey: { system: 'traceharbor', id: manifest.shipment_id }, name: manifest.shipment_id, attrs, source: { kind: 'manifest', at: manifest.source_updated_at, by: 'traceharbor-ingest', runId } });
    for (const feed of FEED_NAMES) for (const row of feeds[feed].records.filter(item => item.shipment_id === manifest.shipment_id)) await world.relate({
      from: externalId('evidence', 'ingest', `${feed}:${row.row_id}`), type: 'evidence_for', to: entityId,
      source: { kind: feed, at: row.source_updated_at, by: 'traceharbor-ingest', runId },
    });
  }
  // Runtime analysis consumes the queried world graph, not the original feed objects.
  const reconstructed = {};
  const selectedEntityIds = [];
  for (const feed of FEED_NAMES) {
    reconstructed[feed] = { ...feeds[feed], records: [] };
    for (const original of feeds[feed].records) {
      const entityId = externalId('evidence', 'ingest', `${feed}:${original.row_id}`);
      const entity = world.view('graph').entity(entityId);
      if (!entity || typeof entity.attrs.text !== 'string') throw new Error('World Model context retrieval failed.');
      reconstructed[feed].records.push(JSON.parse(entity.attrs.text));
      selectedEntityIds.push(entityId);
    }
  }
  return { world, feeds: reconstructed, ingestReport, contextTrace: { strategy: 'canonical-evidence-graph', shipmentId, selectedEntityIds, source: 'Meterless World Model graph view', storedAndConsumed: true, selectedCount: selectedEntityIds.length } };
}

export async function recordWorldVerdict(world, result, runId) {
  const source = { kind: 'manifest', by: 'manifest-system', at: result.shipment.source_updated_at, runId };
  const entity = await world.upsertEntity({ type: 'shipment', externalKey: { system: 'traceharbor', id: result.shipment.shipment_id }, name: result.shipment.shipment_id, attrs: { route: result.shipment.route }, source });
  await world.assertFact({ about: entity.id, predicate: 'investigation_status', value: result.shipment.reported_status, confidence: 0.4, source });
  await world.assertFact({ about: entity.id, predicate: 'investigation_status', value: result.outcome, confidence: result.confidence.score, source: { kind: 'deterministic-analysis', by: 'traceharbor-critic', at: new Date().toISOString(), runId } });
  return { entityId: entity.id, canonical: world.view('graph').entity(entity.id), facts: world.view('facts').about(entity.id) };
}
