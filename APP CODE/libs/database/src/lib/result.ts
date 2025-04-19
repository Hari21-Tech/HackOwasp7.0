import { QueryResult, QueryResultRow } from "pg";

export type DatabaseReturn<T extends QueryResultRow> = Promise<ResultT<QueryResult<T>>>

export type ResultT<T> = {
    success: true,
    result: T
} | {
    success: false,
    error: string
};

export async function Result<T>(targetFunction: () => Promise<T>): Promise<ResultT<T>> {
    try {
        return {
            success: true,
            result: await targetFunction()
        };
    } catch (err) {
        return {
            success: false,
            error: String(err)
        }
    }
}

export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};