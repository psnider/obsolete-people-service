export type DatabaseID = string;
export type CreateCallback = (error: Error, result?: {}) => void;
export type ReadSingleCallback = (error: Error, result?: {}) => void;
export type UpdateSingleCallback = (error: Error, result?: {}) => void;
export type DeleteSingleCallback = (error?: Error) => void;
export type SearchCallback = (error: Error, results?: {}[]) => void;


export interface ObjectQuery {
    element?: {
        [elementKey: string]: any;
        id?: string;
    }
    sort?: any
    // defaults to 0
    start_index?: number
    // defaults to 10
    count?: number
}


export interface Database {
    create(typename: string, value: {}, done: CreateCallback): void
    read(id: DatabaseID, done: ReadSingleCallback): void
    update(value: {}, done: UpdateSingleCallback): void
    del(id: DatabaseID, done: DeleteSingleCallback): void
    search(query: ObjectQuery, done: SearchCallback): void
    test: {
        reset(): void
    }
}

