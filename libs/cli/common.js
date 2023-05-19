const Media = require('../core/media');

async function gen_umd_table(umds, opts={}) {
  let resolved = [];
  let excluded = [];
  let unresolved = [];
  let deleted = [];
  let download = [];
  let durationTotal = 0;

  for (let umd of umds) {
    if (!umd?.uid) continue;

    if (umd.verifyMaterial())
      deleted.push(umd);

    if (umd.excluded) {
      excluded.push(umd);
      continue;
    }

    let adapted;
    for (const adapter of CONTEXT.MEDIA_ADAPTERS) {
      let media = new Media(umd.uid).toType(adapter);
      if (await media.search()) {
        adapted = media;
        break;
      }
    }

    if (adapted) {
      if (umd.materialized)
        resolved.push(umd);
      else {
        download.push(adapted);
        durationTotal += umd.duration || 120;
      }
    } else {
      unresolved.push(umd);
    }
  }

  let table = [];
  table.push(['^+^G In Sync (' + resolved.length + ' Total):^', '']);
  for (let umd of resolved) {
    table.push(['^G    ' + umd.title + '^', '^G' + umd.author + '^']);
  }
  table.push(['^+^- Excluded (' + excluded.length + ' Total):', '']);
  for (let umd of excluded) {
    table.push(['^-    ' + umd.title + '^', '^-' + umd.author + '^']);
  }
  table.push(['^+^r Unresolved (' + unresolved.length + ' Total):^', '']);
  for (let umd of unresolved) {
    table.push(['^r    ' + umd.title + '^', '^r' + umd.author + '^']);
  }
  table.push(['^+^R Deleted (' + deleted.length + ' Total):^', '']);
  for (let umd of deleted) {
    table.push(['^R    ' + umd.title + '^', '^R' + umd.author + '^']);
  }
  table.push([' To be downloaded (' + download.length + ' Total):^', '']);
  for (let adapted of download) {
    table.push(['    ' + adapted.umd.title + '', '' + adapted.umd.author + '']);
  }
  return {
    table: table,
    resolved: resolved,
    excluded: excluded,
    unresolved: unresolved,
    deleted: deleted,
    durationTotal: durationTotal,
    download: download
  };
}

module.exports = {
  gen_umd_table: gen_umd_table
};