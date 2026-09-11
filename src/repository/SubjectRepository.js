const model = require('../models/SubjectModel');
const preRequisiteModel = require('../models/PreRequisiteModel');
const equivalenceModel = require('../models/EquivalenceModel');
class SubjectRepository {
    _transaction;
    constructor(transaction = null){
        this._transaction = transaction;
    }


    async BuscarPeloId(id_subject) {
        return await model.findOne({
            where:{id_subject: `${id_subject}`}
        });
    }
    async BuscarPeloIdModule(id_module) {
        return await model.findOne({
            where:{id_module: `${id_module}`}
        });
    }

    async BuscarPeloIdModuleEName(id_module, name) {
        return await model.findOne({
            where:{
                id_module: `${id_module}`,
                name
            }
        });
    }

    atualizarRegistroNewIdSubject(id_subject, new_id_subject) {
        return model.update({ 
            new_id_subject: new_id_subject
        },{
            where:{
                id_subject
            },
            transaction: this._transaction
        });
    }

    async BuscarTodas() {
        return await model.findAll();
    }

    
    /// setters
    criarRegistro(id_subject, name, index, credit, required, workload, remote_workload, code, extension, extension_attendance_workload, experience_workload, theory_workload, id_module, id_parent_subject, nomeCurso = '', blended = false, hybrid  = false, internship = false) {
        return model.create({ 
            id_subject, name, index, credit, required, workload, remote_workload, code, extension, extension_attendance_workload, experience_workload, theory_workload, id_module, id_parent_subject, blended, hybrid, internship, nomeCurso
        },{
            transaction: this._transaction
        });
    }
    atualizarRegistro(id_subject, name, index, credit, required, workload, remote_workload, code, extension, extension_attendance_workload, experience_workload, theory_workload, id_module, id_parent_subject, nomeCurso = '', blended = false, hybrid  = false, internship = false) {
        return model.update({ 
            id_subject, name, index, credit, required, workload, remote_workload, code, extension, extension_attendance_workload, experience_workload, theory_workload, id_module, id_parent_subject, blended, hybrid, internship, nomeCurso
        },{
            where:{
                id_subject
            },
            transaction: this._transaction
        });
    }

    //Pre-Requisitos
    async BuscarTodosPreRequisitos() {
        return await preRequisiteModel.findAll();
    }

    async BuscarPreRequisitePeloId(id_subject, id_subject_prerequisite) {
        return await preRequisiteModel.findOne({
            where:{
                id_subject: `${id_subject}`,
                id_subject_prerequisite: `${id_subject_prerequisite}`,
            }
        });
    }

    async BuscarDisciplinaPeloCode(code) {
        return await model.findOne({
            where:{
                code: `${code}`,
            }
        });
    }

    criarRegistroPreRequisite(id_subject, id_subject_prerequisite) {
        return preRequisiteModel.create({ 
            id_subject, id_subject_prerequisite
        },{
            transaction: this._transaction
        });
    }

    atualizarRegistroPreRequisite(id_subject, id_subject_prerequisite) {
        return preRequisiteModel.update({ 
            id_subject, id_subject_prerequisite
        },{
            where:{
                id_subject: `${id_subject}`,
                id_subject_prerequisite: `${id_subject_prerequisite}`
            },
            transaction: this._transaction
        });
    }

    //Equivalencias
    async BuscarTodosEquivalencias() {
        return await equivalenceModel.findAll();
    }

    async BuscarEquivalenciaId(id_subject, id_subject_equivalence) {
        return await equivalenceModel.findOne({
            where:{
                id_subject: `${id_subject}`,
                id_subject_equivalence: `${id_subject_equivalence}`,
            }
        });
    }

    criarRegistroEquivalence(id_subject, id_subject_equivalence) {
        return equivalenceModel.create({ 
            id_subject, id_subject_equivalence
        },{
            transaction: this._transaction
        });
    }

    atualizarRegistroEquivalence(id_subject, id_subject_equivalence) {
        return equivalenceModel.update({ 
            id_subject, id_subject_equivalence
        },{
            where:{
                id_subject: `${id_subject}`,
                id_subject_equivalence: `${id_subject_equivalence}`
            },
            transaction: this._transaction
        });
    }

}
module.exports = SubjectRepository;