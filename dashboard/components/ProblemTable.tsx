"use client";
import Link from "next/link";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProblemRecord } from "@codevault/shared";
import { useMemo, useState } from "react";

export function ProblemTable({ problems, compact = false }: { problems: ProblemRecord[]; compact?: boolean }) {
  const [page, setPage] = useState(0);
  const size = compact ? 5 : 10;
  
  const rows = useMemo(() => 
    [...problems]
      .sort((a, b) => +new Date(b.solvedAt) - +new Date(a.solvedAt))
      .slice(page * size, (page + 1) * size),
    [problems, page, size]
  );
  
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Problem</th>
            <th>Difficulty</th>
            <th>Language</th>
            <th className="optional">Solved</th>
            <th aria-label="Links" />
          </tr>
        </thead>
        <tbody>
          {rows.map((item, index) => (
            <tr key={`${item.id}-${item.folderName}-${item.language}-${index}`}>
              <td>
                <Link href={`/dashboard/problems/${item.folderName}?lang=${encodeURIComponent(item.language)}`}>
                  <b>#{String(item.id).padStart(4, "0")}</b> {item.title}
                </Link>
                <small>{item.topics.slice(0, 2).join(" · ")}</small>
              </td>
              <td>
                <span className={`badge ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
              </td>
              <td>{item.language}</td>
              <td className="optional">
                {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(item.solvedAt))}
              </td>
              <td>
                <Link aria-label={`View ${item.title}`} href={`/dashboard/problems/${item.folderName}?lang=${encodeURIComponent(item.language)}`}>
                  <ExternalLink size={15} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {problems.length > size && (
        <div className="pagination">
          <button disabled={!page} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={15} />
          </button>
          <span>{page + 1} / {Math.ceil(problems.length / size)}</span>
          <button disabled={(page + 1) * size >= problems.length} onClick={() => setPage(page + 1)}>
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
