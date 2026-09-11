'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_enrollments_records', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      id_student: {
        type: Sequelize.STRING,
      },
      id_person: {
        type: Sequelize.STRING,
      },
      id_enrollment_record: {
        type: Sequelize.STRING,
      },
      id_enrollment_record_aux: {
        type: Sequelize.STRING,
      },
      id_enrollment: {
        type: Sequelize.STRING,
      },
      institution_name: {
        type: Sequelize.STRING,
      },
      index: {
        type: Sequelize.STRING,
      },
      institution_city: {
        type: Sequelize.STRING,
      },
      institution_state: {
        type: Sequelize.STRING,
      },
      course: {
        type: Sequelize.STRING,
      },
      module: {
        type: Sequelize.STRING,
      },
      academic_calendar: {
        type: Sequelize.STRING,
      },
      class: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      working_days: {
        type: Sequelize.STRING,
      },
      complementary_status: {
        type: Sequelize.STRING,
      },
      attendance: {
        type: Sequelize.STRING,
      },
      workload: {
        type: Sequelize.STRING,
      },
      shift: {
        type: Sequelize.STRING,
      },
      law: {
        type: Sequelize.STRING,
      },
      instructional_days: {
        type: Sequelize.STRING,
      },
      obs: {
        type: Sequelize.STRING,
      },
      finish_date: {
        type: Sequelize.STRING,
      },
      curriculum_name: {
        type: Sequelize.STRING,
      },
      id_course_level: {
        type: Sequelize.STRING,
      },
      id_course_type: {
        type: Sequelize.STRING,
      },
      mec_course_code: {
        type: Sequelize.STRING,
      },
      academic_grade: {
        type: Sequelize.STRING,
      },
      coordinator: {
        type: Sequelize.STRING,
      },
      coordinator_grade: {
        type: Sequelize.STRING,
      },
      recognition: {
        type: Sequelize.STRING,
      },
      secretary: {
        type: Sequelize.STRING,
      },
      secretary_subscription: {
        type: Sequelize.STRING,
      },
      modality: {
        type: Sequelize.STRING,
      },
      authorization: {
        type: Sequelize.STRING,
      },
      course_name_equivalence: {
        type: Sequelize.STRING,
      },
      curriculum_name_equivalence: {
        type: Sequelize.STRING,
      },
      start_date: {
        type: Sequelize.STRING,
      },
      certification_dispatch_date: {
        type: Sequelize.STRING,
      },
      graduation_date: {
        type: Sequelize.STRING,
      },
      admission: {
        type: Sequelize.STRING,
      },
      writing_score: {
        type: Sequelize.STRING,
      },
      average_educational_history: {
        type: Sequelize.STRING,
      },
      score_educational_history: {
        type: Sequelize.STRING,
      },
      ranking_educational_history: {
        type: Sequelize.STRING,
      },
      number_of_vacancies: {
        type: Sequelize.STRING,
      },
      admission_execution_date: {
        type: Sequelize.STRING,
      },
      reserveof_vacancies: {
        type: Sequelize.STRING,
      },
      entrant_status: {
        type: Sequelize.STRING,
      },
      exam_date: {
        type: Sequelize.STRING,
      },
      conclusion_date: {
        type: Sequelize.STRING,
      },
      certification_delivery_date: {
        type: Sequelize.STRING,
      },
      certification_dispatch_number_identification: {
        type: Sequelize.STRING,
      },
      certification_dispatch_institution_name: {
        type: Sequelize.STRING,
      },
      certification_dispatch_institution_emecCode: {
        type: Sequelize.STRING,
      },
      record_date: {
        type: Sequelize.STRING,
      },
      record_number_identification: {
        type: Sequelize.STRING,
      },
      record_book: {
        type: Sequelize.STRING,
      },
      certification_register_institution_name: {
        type: Sequelize.STRING,
      },
      certification_register_institution_emecCode: {
        type: Sequelize.STRING,
      },
      dou_info_publishing_date: {
        type: Sequelize.STRING,
      },
      final_project_name: {
        type: Sequelize.STRING,
      },
      final_project_grade: {
        type: Sequelize.STRING,
      },
      final_project_presentation_date: {
        type: Sequelize.STRING,
      },
      final_project_assessment: {
        type: Sequelize.STRING,
      },
      social_support: {
        type: Sequelize.STRING,
      },
      student_parfor: {
        type: Sequelize.STRING,
      },
      academic_mobility: {
        type: Sequelize.STRING,
      },
      financial_student: {
        type: Sequelize.STRING,
      },
      activity_extracurricular: {
        type: Sequelize.STRING,
      },
      monograph_advisor: {
        type: Sequelize.STRING,
      },
      
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tb_enrollments_records');
  }
};