# Claude Design prompt — Order search filter modal + results UX

> Prompt listo para pegar en Claude Design. Objetivo: agregar al proyecto de diseño del
> dashboard el modal de criterios de filtrado y la UX de manejo de resultados (loading,
> vacíos, errores, paginación), alineado 1:1 con el contrato real de
> `GET /api/orders/search`.

---

```
Add an "Order search" experience to the Merchant Dashboard design.

Context: a small merchant sales dashboard (light + dark, minimal system-ui aesthetic,
cards + a table). It talks to GET /api/orders/search, which accepts these filters and
returns a paginated result. Design the FILTER MODAL and the RESULTS UX around this exact
contract:

Filters (all optional):
- Customer email — free text; partial match (contains).
- Status — select (e.g. "Any", "completed", "pending", …).
- Type — segmented control / select: Any · Sale · Refund.
- Amount range — two money inputs (min / max), in dollars; integers ≥ 0; min ≤ max.
- Date range — from / to date pickers (inclusive of both days); from ≤ to.
- Sort — control for sort field (Date, Amount) + direction (Asc/Desc), default Date · Desc.

Response envelope: { data: Order[], pagination: { total, limit, offset } }.
An Order shows: date, customer email, type (sale/refund), status, amount.

Design these screens/states:
1. Filter modal: clear layout grouping the fields, primary "Apply filters" + secondary
   "Clear all". Inline field-level validation (e.g. "Max must be ≥ Min", "'To' must be
   after 'From'", "Enter a valid amount"). Accessible (labels, focus trap, ESC to close,
   keyboard-navigable).
2. Results table: columns Date, Customer, Type, Status, Amount. A summary line ("Showing
   1–50 of 123"). Pagination control (Prev/Next + page size) driven by limit/offset.
   Active-filter chips above the table with individual remove (×) and "Clear all".
3. Loading state: skeleton rows (not a spinner-only blank).
4. Empty state: friendly "No orders match these filters" with a "Clear filters" action.
5. Error state: "Couldn't load results" with a Retry button (for a failed request), and
   how a 400 validation error surfaces back on the offending field in the modal.
6. Responsive: modal → full-screen sheet on mobile; table → stacked cards on narrow widths.

Keep it consistent with the existing dashboard style, support light and dark, and produce
the modal + all five result states.
```
