type PaginationProps = {
  page: number;
  totalPages: number;
};

export function Pagination({ page, totalPages }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Pagination"
      style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
    >
      <button className="button-secondary" disabled={page <= 1}>
        Previous
      </button>
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          className={pageNumber === page ? "button-primary" : "button-secondary"}
        >
          {pageNumber}
        </button>
      ))}
      <button className="button-secondary" disabled={page >= totalPages}>
        Next
      </button>
    </nav>
  );
}

