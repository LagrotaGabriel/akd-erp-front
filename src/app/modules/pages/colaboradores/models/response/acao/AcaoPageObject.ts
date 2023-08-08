import { AcaoResponse } from "./AcaoResponse";

export class AcaoPageObject {
    content: AcaoResponse[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    sortDirection: string;
    size: number;
    totalElements: number;
    totalPages: number;

    constructor(item) {
        this.content = item?.content;
        this.empty = item?.empty;
        this.first = item?.first;
        this.last = item?.last;
        this.number = item?.number;
        this.numberOfElements = item?.numberOfElements;
        this.pageNumber = item?.pageNumber;
        this.pageSize = item?.pageSize;
        this.paged = item?.paged;
        this.unpaged = item?.unpaged;
        this.sortDirection = item?.sortDirection;
        this.size = item?.size;
        this.totalElements = item?.totalElements;
        this.totalPages = item?.totalPages;
    }

}