/** Lightweight process pathway diagram — CSS/SVG only, no client JS. */
export function PathwayDiagram() {
  const stages = [
    'Spreadsheet process',
    'Structured data',
    'Shared system',
    'Dashboard / portal',
  ]

  return (
    <div
      className="mt-10 overflow-x-auto"
      role="img"
      aria-label="Typical modernisation pathway from spreadsheet process to structured data, shared system, then dashboard or portal"
    >
      <div className="mx-auto flex min-w-[36rem] max-w-3xl items-center justify-center gap-2 sm:gap-3">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg border border-[#1a6b3c]/25 bg-white px-3 py-3 text-center text-xs font-semibold text-gray-800 sm:px-4 sm:text-sm">
              {stage}
            </div>
            {index < stages.length - 1 && (
              <svg
                className="h-4 w-6 shrink-0 text-[#1a6b3c]"
                viewBox="0 0 24 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M0 8h18M14 2l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
