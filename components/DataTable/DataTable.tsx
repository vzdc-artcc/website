'use client';
import React, {useEffect, useState} from 'react';
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {
    DataGrid,
    getGridStringOperators,
    GridColDef,
    GridFilterItem,
    GridFilterModel,
    GridPaginationModel,
    GridSortModel,
} from "@mui/x-data-grid";
import {toast} from "react-toastify";
import {Box} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";

export const equalsOnlyFilterOperator = getGridStringOperators().filter((operator) => operator.value === 'equals');
export const containsOnlyFilterOperator = getGridStringOperators().filter((operator) => operator.value === 'contains');

export default function DataTable<T>(
    {
        columns,
        initialPagination = {page: 0, pageSize: 10},
        pageSizeOptions = [5, 10, 20],
        initialFilter,
        initialSort,
        queryKey,
        fetchData
    }:
        {
            columns: GridColDef[],
            initialPagination?: GridPaginationModel,
            pageSizeOptions?: number[],
            initialFilter?: GridFilterItem,
            initialSort?: GridSortModel,
            /**
             * Cache key prefix under the table's domain, e.g. ["osmium", "loas", "table"],
             * so the domain's mutations (which invalidate ["osmium", "loas"]) refresh it.
             */
            queryKey: readonly unknown[],
            fetchData: (pagination: GridPaginationModel, sortModel: GridSortModel, filter?: GridFilterItem) => Promise<{
                data: T[],
                rowCount: number,
            }>,
        }
) {

    const searchParams = useSearchParams();
    const router = useRouter();
    const [pagination, setPagination] = useState<GridPaginationModel>(() => {
        const page = Number(searchParams.get('page')) || initialPagination.page;
        const pageSize = Number(searchParams.get('pageSize')) || initialPagination.pageSize;
        return {page, pageSize};
    });
    const [filter, setFilter] = useState<GridFilterItem | undefined>(() => {
        const filterField = searchParams.get('filterField');
        const filterValue = searchParams.get('filterValue');
        const filterOperator = searchParams.get('filterOperator');
        return filterField && filterValue && filterOperator ? {
            field: filterField,
            value: filterValue,
            operator: filterOperator
        } : initialFilter;
    });
    const [sortModel, setSortModel] = useState<GridSortModel>(() => {
        const sortField = searchParams.get('sortField');
        const sortDirection = searchParams.get('sortDirection');
        return sortField && sortDirection ? [{
            field: sortField,
            sort: sortDirection as 'asc' | 'desc'
        }] : initialSort || [];
    });

    const updateQueryParams = (params: Record<string, string>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            newParams.set(key, value);
        });
        router.push(`?${newParams.toString()}`);
    };

    const {data: result, isError} = useQuery({
        queryKey: [...queryKey, pagination, sortModel, filter],
        queryFn: () => fetchData(pagination, sortModel, filter),
        // Keep the current page on screen while the next one loads.
        placeholderData: keepPreviousData,
    });

    useEffect(() => {
        if (isError) toast('Failed to fetch data', {type: 'error'});
    }, [isError]);

    const handleFilterChange = (newFilters: GridFilterModel) => {
        if (newFilters.quickFilterValues?.join(',')) {
            const filterCol = columns.find((c) => {
                console.log(c.filterable);
                return c.filterable === undefined || c.filterable;
            });
            console.log(filterCol);
            if (!filterCol) return;

            setFilter({
                field: filterCol.field,
                operator: 'contains',
                value: newFilters.quickFilterValues.join(','),
            });

            updateQueryParams({
                filterField: filterCol.field,
                filterValue: newFilters.quickFilterValues.join(','),
                filterOperator: 'contains',
            });

            return;
        }

        const newFilter = newFilters.items[0];
        setFilter(newFilter);
        updateQueryParams({
            filterField: newFilter?.field || '',
            filterValue: newFilter?.value?.toString() || '',
            filterOperator: newFilter?.operator || '',
        });
    };

    const handlePaginationModelChange = (newPagination: GridPaginationModel) => {
        setPagination(newPagination);
        updateQueryParams({
            page: newPagination.page.toString(),
            pageSize: newPagination.pageSize.toString()
        });
    };

    const handleSortChange = (newSortModel: GridSortModel) => {
        setSortModel(newSortModel);
        if (newSortModel.length > 0) {
            updateQueryParams({
                sortField: newSortModel[0].field,
                sortDirection: newSortModel[0].sort || 'asc'
            });
        } else {
            updateQueryParams({
                sortField: '',
                sortDirection: ''
            });
        }
    };

    return (
        <Box sx={{boxSizing: 'border-box', width: '100%',}}>
            <DataGrid
                sx={{mt: 2,}}
                loading={!result}
                rows={result?.data ?? []}
                autoHeight
                columns={columns}
                pagination
                paginationMode="server"
                filterMode="server"
                sortingMode="server"
                paginationModel={pagination}
                rowCount={result?.rowCount ?? 0}
                onPaginationModelChange={handlePaginationModelChange}
                onFilterModelChange={handleFilterChange}
                sortModel={sortModel}
                onSortModelChange={handleSortChange}
                pageSizeOptions={pageSizeOptions}
                showToolbar
                disableRowSelectionOnClick
            />
        </Box>
    );
}