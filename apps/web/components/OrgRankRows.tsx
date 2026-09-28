import { Row, RowList } from "@/components/Row";
import { orgMeta } from "@/lib/org-meta";
import type { RankedOrg } from "@/lib/org-rank";

function rankValue(entry: RankedOrg): string {
  const parts: string[] = [];
  if (entry.main) parts.push(`${entry.main} main`);
  if (entry.side) parts.push(`${entry.side} side`);
  return parts.join(", ");
}

/**
 * "Who works here" (sub-area) / "Most active organisations" (layer) rows,
 * top N with a plain "Show all n" link (docs/design/05-panels-and-pages.md
 * "Show all"). Built as a server-rendered `<details>` rather than a client
 * expand-in-place, so it still works with no JavaScript, in the same spirit
 * as ProblemIndex.
 */
export function OrgRankRows({ list, limit }: { list: RankedOrg[]; limit: number }) {
  const shown = list.slice(0, limit);
  const rest = list.slice(limit);

  return (
    <>
      <RowList plain>
        {shown.map((entry) => (
          <Row
            key={entry.org.org_id}
            href={`/orgs/${entry.org.org_id}`}
            name={entry.org.name}
            sub={orgMeta(entry.org)}
            value={rankValue(entry)}
          />
        ))}
      </RowList>
      {rest.length ? (
        <details>
          <summary className="fm-show-all">Show all {list.length}</summary>
          <RowList plain>
            {rest.map((entry) => (
              <Row
                key={entry.org.org_id}
                href={`/orgs/${entry.org.org_id}`}
                name={entry.org.name}
                sub={orgMeta(entry.org)}
                value={rankValue(entry)}
              />
            ))}
          </RowList>
        </details>
      ) : null}
    </>
  );
}
