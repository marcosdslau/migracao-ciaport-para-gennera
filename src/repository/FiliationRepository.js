const model = require('../models/FiliationModel');
class FiliationRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarFiliacaoPeloIdPerson(id_person, id_student) {
        return await model.findOne({
            where:{id_person: `${id_person}`, id_student: `${id_student}`}
        });
    }

    async BuscarTodasFiliacaoes() {
        return await model.findAll();
    }

    
    /// setters
    criarFiliacao(id_person, id_student, relationship, is_financial_responsible = false) {
        return model.create({ 
            id_person, id_student, relationship, is_financial_responsible
        },{
            transaction: this._transaction
        });
    }
    atualizarFiliacao(id_person, id_student, relationship, is_financial_responsible = false) {
        return model.update({ 
            id_person, id_student, relationship, is_financial_responsible
        },{
            // id_person sozinho nao identifica a linha: um responsavel pode ter varios
            // alunos, e sem o id_student o update sobrescreve todas as filiacoes dele
            where:{
                id_person, id_student
            },
            transaction: this._transaction
        });
    }

}
module.exports = FiliationRepository;