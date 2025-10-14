export function WarningBox({ children }: { children: React.ReactNode }) {
    return (
        <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 shadow-sm"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0 text-red-600"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
            >
                <path
                    d="M10 2.5l7.071 12.262A1 1 0 0 1 16.182 16H3.818a1 1 0 0 1-.889-1.238L10 2.5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M10 7.5v3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 13.5h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div className="flex-1">
                <div className="font-medium">Lưu ý:</div>
                <div className="mt-0.5">{children}</div>
            </div>
        </div>
    );
}
