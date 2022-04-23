const DEFAULT_PAGE_LIMIT = 0;
const DEFAULT_PAGE_NUMBER = 0;

export function getPagination(query: { limit?: string; page?: string }): {
	skip: number;
	limit: number;
} {
	const limit = query.limit ? Math.abs(+query.limit) : DEFAULT_PAGE_LIMIT;
	const page = query.page ? Math.abs(+query.page) : DEFAULT_PAGE_NUMBER;

	return {
		skip: limit * (page - 1),
		limit,
	};
}
