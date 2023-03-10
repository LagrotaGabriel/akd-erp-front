export interface ExclusaoCliente {
    id: number,
    dataExclusao: string,
    horaExclusao: string,
    excluido: boolean,
    idResponsavelExclusao: number
}