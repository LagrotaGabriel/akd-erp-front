import { Telefone } from "src/app/shared/models/Telefone";

export class Parentesco {
    id: number;
    nome: string;
    dataNascimento: string;
    cpf: string;
    grauParentescoEnum: string;
    telefone: Telefone;
}