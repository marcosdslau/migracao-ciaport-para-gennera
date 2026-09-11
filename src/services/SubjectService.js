
const SubjectRepository = require('../repository/SubjectRepository');
const connection = require('../../database/database')

class SubjectService {

    constructor(){

    }

    async Registra(id_subject, name, index, credit, required, workload, remote_workload, code, extension, extension_attendance_workload, experience_workload, theory_workload, id_module, id_parent_subject, nomeCurso){
        let beginTransaction = await connection.transaction();
        let subjectRepository = new SubjectRepository(beginTransaction);
        try {
            let alreadExist = await subjectRepository.BuscarPeloId(id_subject);
            if(!alreadExist) await subjectRepository.criarRegistro(id_subject, name, index, credit, required, workload, remote_workload, code, extension, extension_attendance_workload, experience_workload, theory_workload, id_module, id_parent_subject, nomeCurso);
            else await subjectRepository.atualizarRegistro(id_subject, name, index, credit, required, workload, remote_workload, code, extension, extension_attendance_workload, experience_workload, theory_workload, id_module, id_parent_subject, nomeCurso);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodos(){
        let subjectRepository = new SubjectRepository();
        try {
            const dados = await subjectRepository.BuscarTodas();
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_subject){
        let subjectRepository = new SubjectRepository();
        try {
            const dados = await subjectRepository.BuscarPeloId(id_subject);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloIdModule(idModule){
        let subjectRepository = new SubjectRepository();
        try {
            const dados = await subjectRepository.BuscarPeloIdModule(idModule);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    //PreRequisitos
    async RegistraPreRequisite(id_subject, id_subject_prerequisite){
        let beginTransaction = await connection.transaction();
        let subjectRepository = new SubjectRepository(beginTransaction);
        try {
            let alreadExist = await subjectRepository.BuscarPreRequisitePeloId(id_subject, id_subject_prerequisite);
            if(!alreadExist) await subjectRepository.criarRegistroPreRequisite(id_subject, id_subject_prerequisite);
            else await subjectRepository.atualizarRegistroPreRequisite(id_subject, id_subject_prerequisite);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodosPreRequisitos(){
        let subjectRepository = new SubjectRepository();
        try {
            const dados = await subjectRepository.BuscarTodosPreRequisitos();
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloId(id_subject, id_subject_prerequisite){
        let subjectRepository = new SubjectRepository();
        try {
            const dados = await subjectRepository.BuscarPreRequisitePeloId(id_subject, id_subject_prerequisite);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPeloCode(code){
        let subjectRepository = new SubjectRepository();
        try {
            const dados = await subjectRepository.BuscarDisciplinaPeloCode(code);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    //Equivalencias
    async RegistraEquivalencia(id_subject, id_subject_equivalence){
        let beginTransaction = await connection.transaction();
        let subjectRepository = new SubjectRepository(beginTransaction);
        try {
            let alreadExist = await subjectRepository.BuscarEquivalenciaId(id_subject, id_subject_equivalence);
            if(!alreadExist) await subjectRepository.criarRegistroEquivalence(id_subject, id_subject_equivalence);
            else await subjectRepository.atualizarRegistroEquivalence(id_subject, id_subject_equivalence);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodosEquivalencias(){
        let subjectRepository = new SubjectRepository();
        try {
            const dados = await subjectRepository.BuscarTodosEquivalencias();
            return dados;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarEquivalenciaPeloId(id_subject, id_subject_equivalence){
        let subjectRepository = new SubjectRepository();
        try {
            const dados = await subjectRepository.BuscarEquivalenciaId(id_subject, id_subject_equivalence);
            return dados;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = SubjectService;