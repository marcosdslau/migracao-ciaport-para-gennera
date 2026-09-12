'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "tb_persons"
        ALTER COLUMN "id_person"  TYPE VARCHAR(255) USING "id_person"::varchar,
        ALTER COLUMN "id_student" TYPE VARCHAR(255) USING "id_student"::varchar;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "tb_persons"
        ALTER COLUMN "id_person"  TYPE INTEGER USING NULLIF("id_person",'')::integer,
        ALTER COLUMN "id_student" TYPE INTEGER USING NULLIF("id_student",'')::integer;
    `);
  }
};
