require('dotenv').config();
const LayoutService = require('../src/services/LayoutService');
const EnrollmentService = require('../src/services/EnrollmentService');
const EnrollmentSubjectService = require('../src/services/EnrollmentSubjectService');
const EnrollmentPosService = require('../src/services/EnrollmentPosService');
const PersonService = require('../src/services/PersonService');
const CourseService = require('../src/services/CourseService');
const CurriculoService = require('../src/services/CurriculoService');
const jsonDeParaIdCurriculum = require('../src/tipos/de-para-idCurriculum');
const jsonDeParaStatusMatricula = require('../src/tipos/de-para-status-de-matricula');
const dePara = require('../src/tipos/de-para-curso-modulo');
const connectionSQLServer = require('../database/database-migracao');

/**
 * A estrutura (curso/curriculo/modulo/disciplina) migra 2023 a 2026, mas as
 * matriculas so interessam do ano corrente. Trocar em .env (ANO_LETIVO_MIGRACAO).
 */
const ANO_LETIVO_MIGRACAO = process.env.ANO_LETIVO_MIGRACAO || '2026';

/**
 * As colunas do curso vem com alias proprio porque as queries fazem "Turmas".*,
 * e "Turmas" tambem tem "Nome", "CursoID" e "AnoLetivo".
 *
 * Curso marcado como "ignorar" no de-para NAO e pulado aqui: a matricula tem
 * de subir de qualquer forma, e o nome do curso/curriculo/modulo resolve para
 * o segmento que outro curso ja criou.
 */
function ResolverCursoDaTurma(linha){
    return dePara.ResolverCurso({
        CursoID: linha.CursoID,
        Nome: linha.NomeCurso,
        Sigla: linha.SiglaCurso,
        TipoCurso: linha.TipoCurso,
        SerieID: linha.SerieID,
    });
}

class MatriculaService{

    async Campanha(){
        if(process.env.PROCESS_AND_CSV_CAMPANHA == 1){

            console.log('INICIO GERANDO CSV CAMPANHAS');
            const coursesGennera = [{
                id_campaign: '71',
                id_academic_calendar: '71',
                name: '2025-2027',
                integration_type: '1',
                code: '1'
            }]
            const layoutService = new LayoutService('Campanhas-PréMatriculas');
            await layoutService.CreateFileManual(coursesGennera);
            console.log('FIM GERANDO CSV CAMPANHAS');
        }

        if(process.env.PROCESS_AND_CSV_CAMPANHA_PLANO == 1){

            console.log('INICIO GERANDO CSV CAMPANHAS x PLANOS');
            const ofertasModel = await connectionSQLServer.query(`
                SELECT
                    "GradeTurmas"."GradeID"
                    , "Turmas"."CursoID"
                    , "GradeCursos"."GradeCursoId"
                    , (CASE
		WHEN "Turmas"."TurmaID" IN (101,111,92) THEN '70'
		WHEN "Turmas"."TurmaID" IN (109, 110, 112) THEN '71'
		ELSE '73' END
	)AS "CalendarID"
                    ,"Turmas".*
                FROM "Turmas" 
                INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID"
                where "Situacao" = '-3'
                `);
            const ofertas = ofertasModel[0];
            let count = 1;
            let textConsole = '';
            let arrExport = [];
            if(true){
                for (let oferta of ofertas) {
                    console.log(`Processando ${count} de ${ofertas.length} `);
                    const {GradeCursoId, Nome, CalendarID } = oferta;
                    count++;
                    let idCurriculum = `${GradeCursoId}`;
                    let idModule = `${idCurriculum}`;
                    if(CalendarID != 71 ) continue;
                    arrExport.push({
                        id_campaign_plan: Date.now(),
                        id_campaign: '73',
                        id_curriculum_offer: idCurriculum,
                        id_module: idModule,
                        id_class: idModule,
                        start_date: '10/01/2021',
                        end_date: '10/02/2025',
                        type: '1',
                    })
                    await new Promise(resolve => setTimeout(resolve, 10));
                }

            }


            const layoutService = new LayoutService('Campanhas_Planos');
            await layoutService.CreateFileManual(arrExport);
            console.log('FIM GERANDO CSV CAMPANHAS x PLANOS');
        }

        if(false){

            console.log('INICIO PROCESSANDO TURMAS_DA_OFERTA');
            const ofertasModel = await connectionSQLServer.query(`
                SELECT
                    "GradeTurmas"."GradeID"
                    , "Turmas"."CursoID"
                    , "GradeCursos"."GradeCursoId"
                    ,"Turmas".*
                FROM "Turmas" 
                INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID"
                where "Situacao" = '-1'
                `);
            const ofertas = ofertasModel[0];
            let count = 1;
            let textConsole = '';
            let arrExport = [];
            if(true){
                for (let oferta of ofertas) {
                    console.log(`Processando ${count} de ${ofertas.length} `);
                    const {GradeCursoId, Nome } = oferta;
                    count++;
                    let idCurriculum = `${GradeCursoId}`;
                    let idModule = `${idCurriculum}`;

                    arrExport.push({
                        id_campaign_plan: Date.now(),
                        id_campaign: '73',
                        id_curriculum_offer: '',
                        id_module: '',
                        id_class: '',
                        start_date: '73',
                        end_date: '73',
                        type: '1',
                    })
                    await new Promise(resolve => setTimeout(resolve, 10));
                }

            }



            console.log('INICIO GERANDO CSV CAMPANHAS');
            const coursesGennera = await curriculumOfferClassesService.BuscaTodos();
            const layoutService = new LayoutService('Ofertas_Turmas_Disciplinas');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV CAMPANHAS');
        }
    }

    async ProcessarMatriculas(){
        const enrollmentService = new EnrollmentService();
        const personService = new PersonService();
        const courseService = new CourseService();
        const curriculoService = new CurriculoService();
        if(process.env.MATRICULA == 1){ /// .env
            console.log('INICIO PROCESSANDO MATRICULAS');
            const matriculasModel = await connectionSQLServer.query(`
                SELECT
                    "GradeTurmas"."GradeID"
                    , "Turmas"."CursoID"
                    , "GradeCursos"."GradeCursoId"
                    ,"TurmaAlunos"."AlunoID"
                    , (CASE WHEN "Contratos"."Situacao" = 1 THEN 'Ativo' ELSE 'Cancelado' END) AS "SituacaoMatricula"
                    ,"TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
                    , "Alunos"."Nome" AS "NomeAluno"
                    , "Alunos"."CPF"
                    , "Cursos"."Nome" AS "NomeCurso"
                    , "Cursos"."Sigla" || '-' || "Cursos"."CursoID" AS "SiglaCurso"
                    , "Cursos"."SerieID"
                    , "TiposCurso"."Descricao" AS "TipoCurso"
                    , "GradeCursos"."AnoLetivo" AS "AnoLetivoCurriculo"
                    , (Case
                        when "GradeCursos"."AnoLetivo" = 0 then "Grade"."Nome"
                        when "GradeCursos"."AnoLetivo" <> 0 then '('||"GradeCursos"."AnoLetivo"||') ' ||"Grade"."Nome"
                        else "Grade"."Nome" end
                    ) AS "NomeCurriculo"
                    ,"TurmaAlunos"."ContratoTurmaID"
                    , (CASE
                        WHEN "Turmas"."TurmaID" IN (101,111,92) THEN '70'
                        WHEN "Turmas"."TurmaID" IN (109, 110, 112) THEN '71'
                        ELSE '73' END
                    )AS "CalendarID"
                    ,"Turmas".*
                FROM "Turmas"
                INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID" AND "GradeCursos"."AnoLetivo" = "Turmas"."AnoLetivo"
                INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
                INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
				INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
				INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
                INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
                INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
                LEFT JOIN "TiposCurso" ON "TiposCurso"."TipoCursoID" = "Cursos"."TipoCursoID"
                where "Turmas"."AnoLetivo" = ${ANO_LETIVO_MIGRACAO}

            `);
            const matriculas = matriculasModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let matricula of matriculas) {
                    console.log(`Processando ${count} de ${matriculas.length} Matriculas`);
                    const {AlunoID, CursoID, CPF, idEnrollment, NomeCurriculo, Nome, SituacaoMatricula, CalendarID, AnoLetivoCurriculo  } = matricula;

                    // tb_enrollments referencia curso/curriculo/modulo por NOME,
                    // entao precisa usar exatamente os nomes gerados pelo de-para
                    const resolvido = ResolverCursoDaTurma(matricula);
                    const NomeCurso = resolvido.courseName;
                    const NomeCurriculoGennera = dePara.MontarNomeCurriculo(resolvido, AnoLetivoCurriculo, NomeCurriculo);
                    const NomeModulo = resolvido.moduleName;

                    let idStudent = AlunoID || '';

                    let cpf_clean = CPF;
                    if(cpf_clean){
                        cpf_clean = cpf_clean.replaceAll(' ', '');
                        cpf_clean = cpf_clean.replaceAll('.', '');
                        cpf_clean = cpf_clean.replaceAll('/', '');
                        cpf_clean = cpf_clean.replaceAll('-', '');
                    }

                    let cpfResponsavelAcademico = cpf_clean || '';
                    let cpfResponsavelFinanceiro = cpf_clean || '';
                    let academicCalendar = '';
                    let nomeCampanha = '';
                    let enrollmentStatus = SituacaoMatricula;
                    if(CalendarID == '70'){
                        academicCalendar ='Formações 2025'
                        nomeCampanha ='Profissionais'
                        if(['80', '78', '77', '63'].includes(CursoID)){
                            if(enrollmentStatus == 'Ativo') enrollmentStatus = 'Reservado';
                        }
                    } else if(CalendarID == '71'){
                        academicCalendar = '2025-2027'
                        nomeCampanha = '2025-2027'
                        if(['80', '78', '77', '63'].includes(CursoID)){
                            if(enrollmentStatus == 'Ativo') enrollmentStatus = 'Reservado';
                        }
                    } else {
                        academicCalendar =  'Calendário Sponte [Migração]';
                        nomeCampanha =  'Calendário Sponte [Migração]';
                    }

                    count++;

                    await enrollmentService.Registra(idStudent, idEnrollment, idEnrollment, cpfResponsavelAcademico || '', cpfResponsavelFinanceiro || '', academicCalendar, NomeCurso || '', NomeCurriculoGennera || '', NomeModulo || '', Nome || '', '', enrollmentStatus, CalendarID == '70' ? '' : CalendarID, nomeCampanha || '', '', '', '', '', '', '', '')
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO MATRICULAS')
        }
        if(process.env.CSVMATRICULA == 1){
            console.log('INICIO GERANDO CSV MATRICULAS');
            let coursesGennera = await enrollmentService.BuscaTodos();
            const layoutService = new LayoutService('Pré-Matriculas');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV MATRICULAS');
        }
        if (process.env.CSVMATRICULASBYSELECT == 1) {
            console.log('INICIO GERANDO CSV MATRICULAS by select');
            const connection = require('../database/database');

            let pessoas = await connection.query(`
            
                SELECT * FROM public.tb_enrollments
                    where id_student in (
                        '122', '143', '153', '168', '192', '237', '268', '366', '383', '410', '413', '498', '535', '623', '632', '712', '721', '728', '752', '768', '851', '860', '867', '872', '902', '904', '967', '1133', '1231', '1264', '1269', '1280', '1290', '1293', '1294', '1301', '1323', '1327', '1359', '1428', '1429', '1430', '1431', '1432', '1434', '1435', '1436', '1437', '1438', '1439', '1440', '1442', '1444', '1445', '1454', '1455', '1471', '1517', '1575', '1582', '1587', '1593', '1602', '1606', '1611', '1614', '1620', '1636', '1645', '1647', '1665', '1667', '1668', '1669', '1671', '1672', '1675', '1677', '1680', '1683', '1684', '1687', '1688', '1689', '1690', '1691', '1693', '1696', '1697', '1699', '1700', '1704', '1705', '1706', '1707', '1710', '1713', '1714', '1716', '1718', '1720', '1721', '1722', '1723', '1724', '1725', '1726', '1727', '1728', '1729', '1730', '1731', '1732', '1733', '1734', '1735', '1736', '1738', '1739'
                    ) AND course IN (
						'Workshop de Mindfulness', '05_Terapias Cognitivas de Casal e Sexualidade', '18_Terapia Cognitivo Comportamental', '13_Neuropsicologia Clinica', '02_Transtornos da Personalidade', '10_Infância e Adolescência'
					)


            `);

            if(pessoas[0].length) pessoas =pessoas[0];

            const layoutService = new LayoutService(`Pre-Matriculas`);
            await layoutService.CreateFileManual(pessoas);
            console.log('FIM GERANDO CSV MATRICULAS by select');
        }
    }

    async ProcessarMatriculas_Disciplinas(){
        const enrollmentService = new EnrollmentSubjectService();
        if(process.env.MATRICULA_DISCIPLINA == 1){ /// .env
            console.log('INICIO PROCESSANDO MATRICULAS DISCIPLINAS');
            const matriculasModel = await connectionSQLServer.query(`
                SELECT
                    "GradeTurmas"."GradeID"
                    , "Turmas"."CursoID"
                    , "GradeCursos"."GradeCursoId"
                    , (CASE WHEN "Contratos"."Situacao" = 1 THEN 'Ativo' ELSE 'Cancelado' END) AS "SituacaoMatricula"
                    ,"TurmaAlunos"."AlunoID"
                    ,"TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
                    , "Alunos"."Nome" AS "NomeAluno"
                    , "Alunos"."CPF"
                    , "Cursos"."Nome" AS "NomeCurso"
                    , "Cursos"."Sigla" || '-' || "Cursos"."CursoID" AS "SiglaCurso"
                    , "Cursos"."SerieID"
                    , "TiposCurso"."Descricao" AS "TipoCurso"
                    , "GradeCursos"."AnoLetivo" AS "AnoLetivoCurriculo"
                    , (Case
                        when "GradeCursos"."AnoLetivo" = 0 then "Grade"."Nome"
                        when "GradeCursos"."AnoLetivo" <> 0 then '('||"GradeCursos"."AnoLetivo"||') ' ||"Grade"."Nome"
                        else "Grade"."Nome" end
                    ) AS "NomeCurriculo"
                    , "Disciplinas"."Nome" AS "NomeDisciplina"
                    ,"TurmaAlunos"."ContratoTurmaID"
                    ,"Turmas".*
                FROM "Turmas"
                INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID" AND "GradeCursos"."AnoLetivo" = "Turmas"."AnoLetivo"
                INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
                INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
				INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
				INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
                INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
                INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
                INNER JOIN "GradeDisciplinas" ON "GradeDisciplinas"."GradeID" = "GradeTurmas"."GradeID"
                INNER JOIN "Disciplinas" ON "Disciplinas"."DisciplinaID" = "GradeDisciplinas"."DisciplinaID"
                LEFT JOIN "TiposCurso" ON "TiposCurso"."TipoCursoID" = "Cursos"."TipoCursoID"
                where "Turmas"."AnoLetivo" = ${ANO_LETIVO_MIGRACAO}
            `);
            const matriculas = matriculasModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let matricula of matriculas) {
                    console.log(`Processando ${count} de ${matriculas.length} Matriculas_Disciplinas`);
                    const {AlunoID, CPF, idEnrollment, NomeCurriculo, Nome, NomeDisciplina, SituacaoMatricula, AnoLetivoCurriculo } = matricula;

                    // mesmos nomes gerados pelo de-para nos CSVs de estrutura
                    const resolvido = ResolverCursoDaTurma(matricula);
                    const NomeCurso = resolvido.courseName;
                    const NomeCurriculoGennera = dePara.MontarNomeCurriculo(resolvido, AnoLetivoCurriculo, NomeCurriculo);
                    const NomeModulo = resolvido.moduleName;

                    let id_enrollment = '';
                    let course = ""; 
                    let curriculum = ""; 
                    let module = ""; 
                    let subject = ""; 
                    let clazz = ""; 
                    let shift = ""; 
                    let type = ""; 
                    let status = ""; 
                    let cancellation_reason = ""; 
                    let credit = ""; 
                    let amount = ""; 
                    let polo = ""; 
                    let internship_start_date = ""; 
                    let internship_end_date = "";  

                    id_enrollment = idEnrollment;

                    course = NomeCurso;
                    curriculum = NomeCurriculoGennera;
                    module = NomeModulo;
                    subject = NomeDisciplina;
                    clazz = Nome;
                    status = SituacaoMatricula;
                    count++;

                    await enrollmentService.Registra(id_enrollment, course, curriculum, module, subject, clazz, shift, type, status, cancellation_reason, credit, amount, polo, internship_start_date, internship_end_date)
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO MATRICULAS DISCIPLINAS')
        }
        if(process.env.CSVMATRICULA_DISCIPLINA == 1){
            console.log('INICIO GERANDO CSV MATRICULAS DISCIPLINAS');
            let coursesGennera = await enrollmentService.BuscaTodos();
            const layoutService = new LayoutService('Matriculas_Disciplinas_Pré-matricula');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV MATRICULAS DISCIPLIANS');
        }
    }

    async ProcessarMatriculasByQuery(){
        const enrollmentService = new EnrollmentService();
        const personService = new PersonService();
        if(process.env.MATRICULA1 == 1){ /// .env
            console.log('INICIO PROCESSANDO MATRICULAS');
            //const matriculasModel = await connectionSQLServer.query(`SELECT DISTINCT [CURS_Codigo], [ALUN_Matricula] FROM [FACTUAL] WHERE [ANOL_Codigo] = '2023.2' ORDER BY [ALUN_Matricula]`);
            const matriculas = [
                "SELECT DISTINCT T0.ALUN_Matricula, CURS.CURS_Codigo, CURR.CURR_Codigo, T0.STFA_Codigo, T0.ALAN_IN_Periodo, T0.FACTURM_TURM_Codigo FROM [FACALAN] T0 INNER JOIN FACCURS CURS On CURS.CURS_Codigo = T0.CURS_Codigo INNER JOIN FACCURR CURR On CURR.CURR_Codigo = T0.CURR_Codigo WHERE T0.[ANOL_Codigo] = '2023.2' AND T0.[CURS_Codigo] = '03' AND T0.[ALUN_Matricula] = '2011203075'",
                "SELECT DISTINCT T0.ALUN_Matricula, CURS.CURS_Codigo, CURR.CURR_Codigo, T0.STFA_Codigo, T0.ALAN_IN_Periodo, T0.FACTURM_TURM_Codigo FROM [FACALAN] T0 INNER JOIN FACCURS CURS On CURS.CURS_Codigo = T0.CURS_Codigo INNER JOIN FACCURR CURR On CURR.CURR_Codigo = T0.CURR_Codigo WHERE T0.[ANOL_Codigo] = '2023.2' AND T0.[CURS_Codigo] = '11' AND T0.[ALUN_Matricula] = '2023211180'",];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let matricula of matriculas) {
                    console.log(`Processando ${count} de ${matriculas.length} Matriculas`);
                    // const {CURS_Codigo, ALUN_Matricula } = matricula;
                    let curriculoMatriculaModel = await connectionSQLServer.query(` ${matricula}`);
                    let curriculo = curriculoMatriculaModel[0];
                    count++;
                    if(!curriculo.length) {
                        textConsole += `-----------------------------------------------------\nResultado não encontrado para a query abaixo, verificar.\n ${matricula}\n`
                        continue;
                    };
                    curriculo = curriculo[0];
                    const {CURS_Codigo, ALUN_Matricula, CURR_Codigo, STFA_Codigo, ALAN_IN_Periodo, FACTURM_TURM_Codigo} = curriculo;

                    let codigoCurriculum = '';
                    let idModule = '';

                    if(CURR_Codigo){
                        let idAux = jsonDeParaIdCurriculum[CURR_Codigo];
                        codigoCurriculum = `${CURS_Codigo}${idAux}`;
                        idModule = `${codigoCurriculum}${ALAN_IN_Periodo}`
                    }
                    let cpfResponsavelAcademico = '';
                    let personModel = await personService.BuscarPessoaPeloIdPerson(ALUN_Matricula);
                    if(personModel){
                        cpfResponsavelAcademico = personModel.dataValues.cpf;
                    }
                    let cpfResponsavelFinanceiro = '';
                    let alunoModel = await connectionSQLServer.query(`SELECT [ALUN_Matricula], [ALUN_NomeCredor], [ALUN_CPFCredor] FROM FACALUN WHERE ALUN_NomeCredor IS NOT NULL AND [ALUN_Matricula] = '${ALUN_Matricula}'`);
                    alunoModel = alunoModel[0];
                    if(alunoModel.length){
                        const {ALUN_CPFCredor} = alunoModel[0];
                        cpfResponsavelFinanceiro = (ALUN_CPFCredor != null && ALUN_CPFCredor.length == 11) ? ALUN_CPFCredor : cpfResponsavelAcademico;
                    } else{
                        cpfResponsavelFinanceiro = cpfResponsavelAcademico;
                    }
                    let nomeCurso = '';
                    let cursoModel = await connectionSQLServer.query(`SELECT [CURS_Descricao] FROM FACCURS WHERE [CURS_Codigo] = '${CURS_Codigo}'`);
                    cursoModel = cursoModel[0];
                    if(cursoModel.length){
                        nomeCurso = cursoModel[0].CURS_Descricao;
                    }

                    let nomeCurriculo = '';
                    let curriculoModel = await connectionSQLServer.query(`SELECT (CASE WHEN [CURR_Descricao] IS NULL THEN [CURR_Codigo] ELSE [CURR_Descricao] END) AS NOME_CURRICULO FROM FACCURR WHERE [CURS_Codigo] = '${CURS_Codigo}' AND [CURR_Codigo] = '${CURR_Codigo}'`);
                    curriculoModel = curriculoModel[0];
                    if(curriculoModel.length){
                        nomeCurriculo = curriculoModel[0].NOME_CURRICULO;
                    }

                    let nomeModulo = '';
                    if(ALAN_IN_Periodo == 0) nomeModulo = 'Módulo';
                    else nomeModulo = `${ALAN_IN_Periodo}° Módulo`;

                    let turno = '3';

                    let statusMatricula = 'Aberto';
                    if(STFA_Codigo){
                        statusMatricula = jsonDeParaStatusMatricula[`${STFA_Codigo}`];
                    }


                    await enrollmentService.Registra(ALUN_Matricula, ALUN_Matricula, ALUN_Matricula, cpfResponsavelAcademico || '', cpfResponsavelFinanceiro || '', '2023/2', nomeCurso || '', nomeCurriculo || '', nomeModulo || '', FACTURM_TURM_Codigo || '', turno || '', statusMatricula, 15, 'MIGRAÇÃO', '', '', '', '', '', '', '')
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO MATRICULAS')
        }
        if(process.env.CSVMATRICULA1 == 1){
            console.log('INICIO GERANDO CSV MATRICULAS');
            const coursesGennera = await enrollmentService.BuscaTodos();
            const layoutService = new LayoutService('Matriculas');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV MATRICULAS');
        }
    }

    async ProcessarMatriculasPos(){
        const enrollmentService = new EnrollmentPosService();
        const personService = new PersonService();
        if(process.env.MATRICULAPOS == 1){ /// .env
            console.log('INICIO PROCESSANDO MATRICULAS POS');
            const turmasModel = await connectionSQLServer.query(`SELECT TURM_Codigo, CURS_Codigo FROM [FACTURM] WHERE (TURM_Encerramento > '2024-01-01' OR TURM_Encerramento IS NULL)  AND ANOL_Codigo = '0000' `);
            const turmas = turmasModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let turma of turmas) {
                    console.log(`Processando ${count} de ${turmas.length} Turmas`);
                    const {TURM_Codigo, CURS_Codigo } = turma;
                    
                    /// Daqui pra baixo verificar com o Gibas
                    
                    
                    let discipliasModel = await connectionSQLServer.query(`SELECT * FROM FACTUDI WHERE TURM_Codigo = '${TURM_Codigo}'`);
                    let disciplias = discipliasModel[0];
                    
                    count++;
                    if(!disciplias.length) {
                        textConsole += `-----------------------------------------------------\nResultado não encontrado para a query abaixo, verificar.\nSELECT * FROM FACTUDI WHERE TURM_Codigo = '${TURM_Codigo}'\n`
                        continue;
                    };

                    for(let turma of disciplias){
                        let {DISC_Codigo} = turma;
                        let alunosModel = await connectionSQLServer.query(`SELECT T1.CURR_Codigo, T1.ALUN_Nome, T0.ALUN_Matricula, T0.STDI_Codigo, T0.TURM_Codigo FROM FACTUAL T0 INNER JOIN FACALUN T1 ON T1.ALUN_Matricula = T0.ALUN_Matricula WHERE T0.CURS_Codigo = '${CURS_Codigo}' AND T0.TURM_Codigo = '${TURM_Codigo}' AND T0.DISC_Codigo = '${DISC_Codigo}' and T0.STDI_Codigo <> 'AP'`);
                        let alunos = alunosModel[0];

                        // alunos = alunos[0];
                        for(let aluno of alunos){
                            const {CURR_Codigo, ALUN_Nome, ALUN_Matricula, STDI_Codigo, ALAN_IN_Periodo, FACTURM_TURM_Codigo} = aluno;
        
                            if(ALUN_Matricula){

                                let cpfResponsavelAcademico = '';
                                let personModel = await personService.BuscarPessoaPeloIdPerson(ALUN_Matricula);
                                if(personModel){
                                    cpfResponsavelAcademico = personModel.dataValues.cpf;
                                }
                                let cpfResponsavelFinanceiro = '';
                                let alunoModel = await connectionSQLServer.query(`SELECT [ALUN_Matricula], [ALUN_NomeCredor], [ALUN_CPFCredor] FROM FACALUN WHERE ALUN_NomeCredor IS NOT NULL AND [ALUN_Matricula] = '${ALUN_Matricula}'`);
                                alunoModel = alunoModel[0];
                                if(alunoModel.length){
                                    const {ALUN_CPFCredor} = alunoModel[0];
                                    cpfResponsavelFinanceiro = (ALUN_CPFCredor != null && ALUN_CPFCredor.length == 11) ? ALUN_CPFCredor : cpfResponsavelAcademico;
                                } else{
                                    cpfResponsavelFinanceiro = cpfResponsavelAcademico;
                                }
                                let nomeCurso = '';
                                let cursoModel = await connectionSQLServer.query(`SELECT [CURS_Descricao] FROM FACCURS WHERE [CURS_Codigo] = '${CURS_Codigo}'`);
                                cursoModel = cursoModel[0];
                                if(cursoModel.length){
                                    nomeCurso = cursoModel[0].CURS_Descricao;
                                }
            
                                let nomeCurriculo = '';
                                let curriculoModel = await connectionSQLServer.query(`SELECT (CASE WHEN [CURR_Descricao] IS NULL THEN [CURR_Codigo] ELSE [CURR_Descricao] END) AS NOME_CURRICULO FROM FACCURR WHERE [CURS_Codigo] = '${CURS_Codigo}'`);
                                curriculoModel = curriculoModel[0];
                                if(curriculoModel.length){
                                    nomeCurriculo = curriculoModel[0].NOME_CURRICULO;
                                }
            
                                let nomeModulo = 'Módulo';
                                if(ALAN_IN_Periodo == 0) nomeModulo = 'Módulo';
                                else nomeModulo = `${ALAN_IN_Periodo}° Módulo`;
            
                                let turno = '3';
            
                                let statusMatricula = 'Aberto';
                                if(STDI_Codigo){
                                    statusMatricula = jsonDeParaStatusMatricula[`${STDI_Codigo}`];
                                }
            
            
                                await enrollmentService.Registra(ALUN_Matricula, ALUN_Matricula, ALUN_Nome || '', ALUN_Matricula, cpfResponsavelAcademico || '', cpfResponsavelFinanceiro || '', '2023/2', nomeCurso || '', nomeCurriculo || '', nomeModulo || '', FACTURM_TURM_Codigo || '', turno || '', statusMatricula, 15, 'MIGRAÇÃO', '', '', '', '', '', '', '')
                            }

                        }
                    }



                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO MATRICULAS POS')
        }
        if(process.env.CSVMATRICULAPOS == 1){
            console.log('INICIO GERANDO CSV MATRICULAS POS');
            const coursesGennera = await enrollmentService.BuscaTodos();
            const layoutService = new LayoutService('Matriculas_Pos');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV MATRICULAS POS');
        }
    }
}


module.exports = MatriculaService;