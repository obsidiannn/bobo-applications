
/**
 * 分页计算
 * @param page 
 * @param limit 
 * @returns 
 */
export const pageSkip = (
    page: number | undefined,
    limit: number | undefined
): number => {
    if (page === null || page === undefined) {
        page = 1;
    }
    if (limit === null || limit === undefined) {
        limit = 10;
    }
    return (page - 1) * limit;
};

