const Sequelize = require('sequelize');
const connection = require('../../database/database');

const Model = connection.define('tb_persons', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    id_person: {
        type: Sequelize.STRING,
    },
    id_student: {
        type: Sequelize.STRING,
    },
    profile: {
        type: Sequelize.INTEGER,
        defaultValue: 2
    },
    type: {
        type: Sequelize.INTEGER,
        defaultValue: 2
    },

    name: {
        type: Sequelize.STRING,
    },
    social_name: {
        type: Sequelize.STRING,
    },
    legal_name: {
        type: Sequelize.STRING,
    },
    email: {
        type: Sequelize.STRING,
    },
    zipcode: {
        type: Sequelize.STRING,
    },
    street: {
        type: Sequelize.STRING,
    },
    street_number: {
        type: Sequelize.STRING,
    },
    complement: {
        type: Sequelize.STRING,
    },
    neighborhood: {
        type: Sequelize.STRING,
    },
    city: {
        type: Sequelize.STRING,
    },
    state: {
        type: Sequelize.STRING,
    },
    country: {
        type: Sequelize.STRING,
    },
    zone: {
        type: Sequelize.STRING,
    },
    birthdate: {
        type: Sequelize.STRING,
    },
    birthplace: {
        type: Sequelize.STRING,
    },
    birth_state: {
        type: Sequelize.STRING,
    },
    birth_country: {
        type: Sequelize.STRING,
    },
    nationality: {
        type: Sequelize.STRING,
    },
    gender: {
        type: Sequelize.STRING,
    },
    ethnicity: {
        type: Sequelize.STRING,
    },
    rg: {
        type: Sequelize.STRING,
    },
    rg_issuing_agency: {
        type: Sequelize.STRING,
    },
    rg_issuing_state: {
        type: Sequelize.STRING,
    },
    rg_issue_date: {
        type: Sequelize.STRING,
    },
    social_id: {
        type: Sequelize.STRING,
    },
    cpf: {
        type: Sequelize.STRING,
    },
    cnpj: {
        type: Sequelize.STRING,
    },
    civil_status: {
        type: Sequelize.STRING,
    },
    profession: {
        type: Sequelize.STRING,
    },
    religion: {
        type: Sequelize.STRING,
    },
    telephone_area_code: {
        type: Sequelize.STRING,
    },
    telephone_number: {
        type: Sequelize.STRING,
    },
    mobile_phone_area_code: {
        type: Sequelize.STRING,
    },
    mobile_phone_number: {
        type: Sequelize.STRING,
    },
    commercial_phone_area_code: {
        type: Sequelize.STRING,
    },
    commercial_phone_number: {
        type: Sequelize.STRING,
    },
    fax_area_code: {
        type: Sequelize.STRING,
    },
    fax_number: {
        type: Sequelize.STRING,
    },
    foreigner_document_issue_date: {
        type: Sequelize.STRING,
    },
    foreigner_document: {
        type: Sequelize.STRING,
    },
    foreigner_document_expiry_date: {
        type: Sequelize.STRING,
    },
    military_status: {
        type: Sequelize.STRING,
    },
    military_description: {
        type: Sequelize.STRING,
    },
    military_certificate: {
        type: Sequelize.STRING,
    },
    military_certificate_description: {
        type: Sequelize.STRING,
    },
    voter_document: {
        type: Sequelize.STRING,
    },
    voter_document_issue_date: {
        type: Sequelize.STRING,
    },
    voter_document_city: {
        type: Sequelize.STRING,
    },
    voter_document_state: {
        type: Sequelize.STRING,
    },
    voter_document_section: {
        type: Sequelize.STRING,
    },
    voter_document_zone: {
        type: Sequelize.STRING,
    },
    civil_certificate_term: {
        type: Sequelize.STRING,
    },
    civil_certificate_page: {
        type: Sequelize.STRING,
    },
    civil_certificate_book: {
        type: Sequelize.STRING,
    },
    civil_certificate_issue_date: {
        type: Sequelize.STRING,
    },
    civil_certificate_agency_state: {
        type: Sequelize.STRING,
    },
    civil_certificate_agency: {
        type: Sequelize.STRING,
    },
    civil_certificate_father: {
        type: Sequelize.STRING,
    },
    civil_certificate_mother: {
        type: Sequelize.STRING,
    },
    marriage_certificate_term: {
        type: Sequelize.STRING,
    },
    marriage_certificate_page: {
        type: Sequelize.STRING,
    },
    marriage_certificate_book: {
        type: Sequelize.STRING,
    },
    marriage_certificate_issue_date: {
        type: Sequelize.STRING,
    },
    marriage_certificate_agency_state: {
        type: Sequelize.STRING,
    },
    marriage_certificate_agency: {
        type: Sequelize.STRING,
    },
    identity: {
        type: Sequelize.STRING,
    },
    commercial_name: {
        type: Sequelize.STRING,
    },
    passport: {
        type: Sequelize.STRING,
    },
    academic_title: {
        type: Sequelize.STRING,
    },
    student_code_inep: {
        type: Sequelize.STRING,
    },
    academic_registration: {
        type: Sequelize.STRING,
    },
    conclusion_date: {
        type: Sequelize.STRING,
    },
    conclusion_educational_institution: {
        type: Sequelize.STRING,
    },
    conclusion_educational_city: {
        type: Sequelize.STRING,
    },
    conclusion_educational_uf: {
        type: Sequelize.STRING,
    },
    elementary_school_conclusion_date: {
        type: Sequelize.STRING,
    },
    elementary_school_conclusion_educational_institution: {
        type: Sequelize.STRING,
    },
    elementary_school_conclusion_educational_city: {
        type: Sequelize.STRING,
    },
    elementary_school_conclusion_educational_uf: {
        type: Sequelize.STRING,
    },
    higher_education_conclusion_date: {
        type: Sequelize.STRING,
    },
    higher_education_conclusion_institution: {
        type: Sequelize.STRING,
    },
    higher_education_conclusion_educational_city: {
        type: Sequelize.STRING,
    },
    higher_education_conclusion_educational_uf: {
        type: Sequelize.STRING,
    },
    higher_education_conclusion_course: {
        type: Sequelize.STRING,
    },
    higher_education_type_of_school: {
        type: Sequelize.STRING,
    },
    primary_school_conclusion_date: {
        type: Sequelize.STRING,
    },
    primary_school_conclusion_institution: {
        type: Sequelize.STRING,
    },
    primary_school_conclusion_educational_city: {
        type: Sequelize.STRING,
    },
    primary_school_conclusion_educational_uf: {
        type: Sequelize.STRING,
    },
    photo_person: {
        type: Sequelize.STRING,
    },
    function: {
        type: Sequelize.INTEGER,
    },
    codigo_professor_INEP: {
        type: Sequelize.STRING,
    },
    type_of_school: {
        type: Sequelize.STRING,
    },
    elementary_school_type_of_school: {
        type: Sequelize.STRING,
    },
    hiring_regime: {
        type: Sequelize.STRING,
    },
    curriculum_URL: {
        type: Sequelize.STRING,
    },
    isImported: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: Sequelize.DATE
    },
    updatedAt: {
        type: Sequelize.DATE
    },
});
Model.sync({ alter: true });
module.exports = Model;