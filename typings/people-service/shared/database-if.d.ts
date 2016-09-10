declare module DatabaseIF {

    type DatabaseID = string;
    type CreateCallback = (error: Error, result?: {}) => void;
    type ReadSingleCallback = (error: Error, result?: {}) => void;
    type UpdateSingleCallback = (error: Error, result?: {}) => void;
    type DeleteSingleCallback = (error?: Error) => void;
    type SearchCallback = (error: Error, results?: {}[]) => void;


    interface ObjectQuery {
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


    interface Database {
        create(typename: string, value: {}, done: CreateCallback): void
        read(id: DatabaseID, done: ReadSingleCallback): void
        update(value: {}, done: UpdateSingleCallback): void
        del(id: DatabaseID, done: DeleteSingleCallback): void
        search(query: ObjectQuery, done: SearchCallback): void
        test: {
            reset(): void
        }
    }

}