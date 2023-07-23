import { TableOptions } from "./TableOptions";
import { TableTdCustomClass } from "./TableTdCustomClass";

export class TableTd {
    campo: string;
    hidden: string;
    maxLength: number;
    type: string;
    titleCase: boolean;
    tableTdCustomClasses: TableTdCustomClass[];
}