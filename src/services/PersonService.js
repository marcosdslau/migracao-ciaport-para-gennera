
const PersonRepository = require('../repository/PersonRepository');
const connection = require('../../database/database');

class PersonService {

    constructor(){

    }

    async RegistraPessoa(id_person, id_student, profile, type, name, social_name, legal_name, email, zipcode, street, street_number, city, state, country, complement, neighborhood, zone, birthdate, birthplace, birth_state, birth_country, nationality, gender, ethnicity, rg, rg_issuing_agency, rg_issuing_state, rg_issue_date, social_id, cpf, cnpj, civil_status, profession, religion, telephone_area_code, telephone_number, mobile_phone_area_code, mobile_phone_number, commercial_phone_area_code, commercial_phone_number, fax_area_code, fax_number, foreigner_document_issue_date, foreigner_document, foreigner_document_expiry_date, military_status, military_description, military_certificate, military_certificate_description, voter_document, voter_document_issue_date, voter_document_city, voter_document_state, voter_document_section, voter_document_zone, civil_certificate_term, civil_certificate_page, civil_certificate_book, civil_certificate_issue_date, civil_certificate_agency_state, civil_certificate_agency, civil_certificate_father, civil_certificate_mother, marriage_certificate_term, marriage_certificate_page, marriage_certificate_book, marriage_certificate_issue_date, marriage_certificate_agency_state, marriage_certificate_agency, identity, commercial_name, passport, academic_title, student_code_inep, academic_registration, conclusion_date, conclusion_educational_institution, conclusion_educational_city, conclusion_educational_uf, elementary_school_conclusion_date, elementary_school_conclusion_educational_institution, elementary_school_conclusion_educational_city, elementary_school_conclusion_educational_uf, higher_education_conclusion_date, higher_education_conclusion_institution, higher_education_conclusion_educational_city, higher_education_conclusion_educational_uf, higher_education_conclusion_course, higher_education_type_of_school, primary_school_conclusion_date, primary_school_conclusion_institution, primary_school_conclusion_educational_city, primary_school_conclusion_educational_uf, photo_person, functions, codigo_professor_INEP, type_of_school, elementary_school_type_of_school, hiring_regime, curriculum_URL){
        let beginTransaction = await connection.transaction();
        let personRepository = new PersonRepository(beginTransaction);
        try {
            let alreadExist = await personRepository.BuscarPessoaPeloIdPerson(id_person);
            if(!alreadExist) await personRepository.criarPessoa(id_person, id_student, profile, type, name, social_name, legal_name, email, zipcode, street, street_number, city, state, country, complement, neighborhood, zone, birthdate, birthplace, birth_state, birth_country, nationality, gender, ethnicity, rg, rg_issuing_agency, rg_issuing_state, rg_issue_date, social_id, cpf, cnpj, civil_status, profession, religion, telephone_area_code, telephone_number, mobile_phone_area_code, mobile_phone_number, commercial_phone_area_code, commercial_phone_number, fax_area_code, fax_number, foreigner_document_issue_date, foreigner_document, foreigner_document_expiry_date, military_status, military_description, military_certificate, military_certificate_description, voter_document, voter_document_issue_date, voter_document_city, voter_document_state, voter_document_section, voter_document_zone, civil_certificate_term, civil_certificate_page, civil_certificate_book, civil_certificate_issue_date, civil_certificate_agency_state, civil_certificate_agency, civil_certificate_father, civil_certificate_mother, marriage_certificate_term, marriage_certificate_page, marriage_certificate_book, marriage_certificate_issue_date, marriage_certificate_agency_state, marriage_certificate_agency, identity, commercial_name, passport, academic_title, student_code_inep, academic_registration, conclusion_date, conclusion_educational_institution, conclusion_educational_city, conclusion_educational_uf, elementary_school_conclusion_date, elementary_school_conclusion_educational_institution, elementary_school_conclusion_educational_city, elementary_school_conclusion_educational_uf, higher_education_conclusion_date, higher_education_conclusion_institution, higher_education_conclusion_educational_city, higher_education_conclusion_educational_uf, higher_education_conclusion_course, higher_education_type_of_school, primary_school_conclusion_date, primary_school_conclusion_institution, primary_school_conclusion_educational_city, primary_school_conclusion_educational_uf, photo_person, functions, codigo_professor_INEP, type_of_school, elementary_school_type_of_school, hiring_regime, curriculum_URL);
            else await personRepository.atualizarPessoa(id_person, id_student, profile, type, name, social_name, legal_name, email, zipcode, street, street_number, city, state, country, complement, neighborhood, zone, birthdate, birthplace, birth_state, birth_country, nationality, gender, ethnicity, rg, rg_issuing_agency, rg_issuing_state, rg_issue_date, social_id, cpf, cnpj, civil_status, profession, religion, telephone_area_code, telephone_number, mobile_phone_area_code, mobile_phone_number, commercial_phone_area_code, commercial_phone_number, fax_area_code, fax_number, foreigner_document_issue_date, foreigner_document, foreigner_document_expiry_date, military_status, military_description, military_certificate, military_certificate_description, voter_document, voter_document_issue_date, voter_document_city, voter_document_state, voter_document_section, voter_document_zone, civil_certificate_term, civil_certificate_page, civil_certificate_book, civil_certificate_issue_date, civil_certificate_agency_state, civil_certificate_agency, civil_certificate_father, civil_certificate_mother, marriage_certificate_term, marriage_certificate_page, marriage_certificate_book, marriage_certificate_issue_date, marriage_certificate_agency_state, marriage_certificate_agency, identity, commercial_name, passport, academic_title, student_code_inep, academic_registration, conclusion_date, conclusion_educational_institution, conclusion_educational_city, conclusion_educational_uf, elementary_school_conclusion_date, elementary_school_conclusion_educational_institution, elementary_school_conclusion_educational_city, elementary_school_conclusion_educational_uf, higher_education_conclusion_date, higher_education_conclusion_institution, higher_education_conclusion_educational_city, higher_education_conclusion_educational_uf, higher_education_conclusion_course, higher_education_type_of_school, primary_school_conclusion_date, primary_school_conclusion_institution, primary_school_conclusion_educational_city, primary_school_conclusion_educational_uf, photo_person, functions, codigo_professor_INEP, type_of_school, elementary_school_type_of_school, hiring_regime, curriculum_URL);

            await beginTransaction.commit();
        } catch (err) {
            console.log(err);
            await beginTransaction.rollback();
        }
    }

    async BuscaTodasPessoas(){
        let personRepository = new PersonRepository();
        try {
            const pessoas = await personRepository.BuscarTodasPessoas();
            return pessoas;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscaTodasPessoasMigradas(){
        let personRepository = new PersonRepository();
        try {
            const pessoas = await personRepository.BuscarTodasPessoasMigradas();
            return pessoas;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarTodasPessoasMigradasPorIdPersonQuery(){
        let personRepository = new PersonRepository();
        try {
            const pessoas = await personRepository.BuscarTodasPessoasMigradasPorIdPersonQuery();
            return pessoas;
        } catch (err) {
            console.log(err);
        }
    }
    
    async BuscarTodasPessoasMigradasPorQuery(){
        
        try {
            let  pessoas = await connection.query(`
                SELECT * FROM "tb_persons" WHERE "id_student" IN (
                    SELECT DISTINCT "id_student" FROM "tb_enrollments_records" where "id_enrollment_record" in (
                        SELECT DISTINCT "id_enrollment_record" FROM "tb_enrollments_records_subjects" WHERE "id_enrollment_subject_record" IN (
                            select "id_enrollment_subject_record" from tb_enrollments_records_subject_professors  where "professor_name" = '' --TODOS OS PROFESSORES
                        ) --TODOS OS HISTÓRICOS
                    )
                );

                `);
            pessoas = pessoas[0];
            return pessoas;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscaTodasPessoasQueEmailNaoEVazio(){
        let personRepository = new PersonRepository();
        try {
            const pessoas = await personRepository.BuscaTodasPessoasQueEmailNaoEVazio();
            return pessoas;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscaTodasPessoasQueCPFNaoEVazio(){
        let personRepository = new PersonRepository();
        try {
            const pessoas = await personRepository.BuscaTodasPessoasQueCPFNaoEVazio();
            return pessoas;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscaTodasPessoasQueCPFeEMAILeEVazio(){
        let personRepository = new PersonRepository();
        try {
            const pessoas = await personRepository.BuscaTodasPessoasQueCPFeEMAILeEVazio();
            return pessoas;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPessoaPeloIdPerson(id_person){
        let personRepository = new PersonRepository();
        try {
            const pessoa = await personRepository.BuscarPessoaPeloIdPerson(id_person);
            return pessoa;
        } catch (err) {
            console.log(err);
        }
    }

    async MarcarComoImportada(id_person){
        let personRepository = new PersonRepository();
        try {
            const pessoa = await personRepository.MarcarComoImportada(id_person);
            return pessoa;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPessoaPeloCPF(cpf){
        let personRepository = new PersonRepository();
        try {
            const pessoa = await personRepository.BuscarPessoaPeloCPF(cpf);
            return pessoa;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPessoaPeloEmail(email){
        let personRepository = new PersonRepository();
        try {
            const pessoa = await personRepository.BuscarPessoaPeloEmail(email);
            return pessoa;
        } catch (err) {
            console.log(err);
        }
    }

    async BuscarPessoaPeloNome(nome){
        let personRepository = new PersonRepository();
        try {
            const pessoa = await personRepository.BuscarPessoaPeloNome(nome);
            return pessoa;
        } catch (err) {
            console.log(err);
        }
    }

    RemovePessoasDuplicadasPeloIdPerson(arr){
        let listaUnica = [];
        arr.forEach((item) => {
            var duplicated  = listaUnica.findIndex(redItem => {
                return item.idPerson == redItem.idPerson;
            }) > -1;
        
            if(!duplicated) {
                listaUnica.push(item);
            }
        });
        return listaUnica;
    }

    RemovePessoasDuplicadasPeloEmail(arr){
        let listaUnica = [];
        arr.forEach((item) => {
            // sem e-mail não há chave para comparar: não é duplicata
            var duplicated  = item.email && listaUnica.findIndex(redItem => {
                return item.email == redItem.email;
            }) > -1;
        
            if(!duplicated) {
                listaUnica.push(item);
            }
        });
        return listaUnica;
    }
    RemovePessoasDuplicadasPeloCPF(arr){
        let listaUnica = [];
        arr.forEach((item) => {
            // sem CPF não há chave para comparar: não é duplicata
            var duplicated  = item.cpf && listaUnica.findIndex(redItem => {
                return item.cpf == redItem.cpf;
            }) > -1;
        
            if(!duplicated) {
                listaUnica.push(item);
            }
        });
        return listaUnica;
    }

    RemovePessoasDuplicadasPelo_id_Person(arr){
        let listaUnica = [];
        arr.forEach((item) => {
            var duplicated  = listaUnica.findIndex(redItem => {
                return item.id_person == redItem.id_person;
            }) > -1;
        
            if(!duplicated) {
                listaUnica.push(item);
            }
        });
        return listaUnica;
    }


}

module.exports = PersonService;