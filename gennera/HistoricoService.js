require('dotenv').config();
const LayoutService = require('../src/services/LayoutService');
const EnrollmentRecordService = require('../src/services/EnrollmentRecordService');
const PersonService = require('../src/services/PersonService');
const EnrollmentRecordSubjectService = require('../src/services/EnrollmentRecordSubjectService');
const EnrollmentRecordSubjectProfessorService = require('../src/services/EnrollmentRecordSubjectProfessorService');
const EnrollmentRecordExtensionActivityService = require('../src/services/EnrollmentRecordExtensionActivityService');
const SubjectService = require('../src/services/SubjectService');

const jsonDeParaIdCurriculum = require('../src/tipos/de-para-idCurriculum');
const jsonDeParaStatusHistorico = require('../src/tipos/de-para-status-de-historico');
const connectionSQLServer = require('../database/database-sql-server');
const jsonDeParaIdSubject = require('../src/tipos/de-para-idSubject');
const axios = require('axios');
const {log} = require('../src/services/LogService');

class HistoricoService{
    #PegarSomenteNumeros(numeroString){
        let numero = '';
        let regexSomenteNumero = /\d+/g;
        numero = numeroString.match(regexSomenteNumero);
        if(numero.length) numero = numero.join('');
        return numero;
    }
    async ProcessarRegistrosAcademicos(){
        const enrollmentRecordService = new EnrollmentRecordService();
        const personService = new PersonService();
        if(process.env.REGISTROACADEMICO == 1){ /// .env
            console.log('INICIO PROCESSANDO HISTÓRICO');
            const historicoModel = await connectionSQLServer.query(`
                SELECT 
                    DISTINCT
                    HISTORICO.MATRICULA
                    , HISTORICO.CURSO
                    , HISTORICO.ANOLETIVO
                    , HISTORICO.SEMESTRE
                    , HISTORICO.SERIE
                    , HISTORICO.CUG_ANO_ADMISSAO
                    , HISTORICO.CTL_ANO_LETIVO
                    , PESSOA.PES_COD
                    , PESSOA.PES_IDALUNO
                FROM HISTESC HISTORICO
                INNER JOIN GEN_PESSOA AS PESSOA 
                        ON PESSOA.PES_IDALUNO = HISTORICO.MATRICULA 
                --WHERE 
                --MATRICULA = '05638'
            `);
            const historicos = historicoModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let historico of historicos) {
                    console.log(`Processando ${count} de ${historicos.length} Registros Academicos`);
                    const {MATRICULA, CURSO, ANOLETIVO, SEMESTRE, SERIE, CUG_ANO_ADMISSAO, CTL_ANO_LETIVO, PES_COD, PES_IDALUNO} = historico;
                    let idPerson = parseInt(PES_COD);
                    let idStudent = PES_IDALUNO ? parseInt(PES_IDALUNO) : idPerson;
                    if (typeof idStudent === 'number' && Number.isNaN(idStudent)) {
                        idStudent = idPerson;
                    } else {
                        idStudent = `${idPerson}${idStudent}`;
                        idStudent = parseInt(idStudent)
                    }


                    let id_enrollment_record = '';
                    id_enrollment_record = `${ANOLETIVO}${SEMESTRE}${SERIE}${CURSO}${MATRICULA}`;
                    let timestamp_ID = Date.now();
                    await new Promise(resolve => setTimeout(resolve, 10));
                    //Buscar na tabela de cursos a partir de  CURS_Codigo pra trazer o nome do curso;
            /*-->*/ let nomeCurso = '';
            /*-->*/ let law = '';
            /*-->*/ let id_course_level = '2';
            /*-->*/ let id_course_type = '';
            /*-->*/ let mec_course_code = '';
            /*-->*/ let academic_grade = '';
            /*-->*/ let coordinator = '';
            /*-->*/ let coordinator_grade = '';
            /*-->*/ let recognition = '';
            /*-->*/ let authorization = '';
                    let cursoModel = await connectionSQLServer.query(`SELECT
	NOME
	, IIF(CUG_MODALIDADE = 'P', 'Presencial', '') AS CUG_MODALIDADE
FROM CURSGEN WHERE CURSO = '${CURSO}'`);
                    cursoModel = cursoModel[0];
                    if(cursoModel.length){
                        nomeCurso = cursoModel[0].NOME ? cursoModel[0].NOME : '';

                        id_course_type = '13';

                        if(cursoModel[0].CUG_MODALIDADE){
                            academic_grade = cursoModel[0].CUG_MODALIDADE;
                        }
                    }

            /*-->*/ let nomeModulo = '';
                    if(SERIE == 0) nomeModulo = 'Período';
                    else nomeModulo = `${SERIE}° Período`;

            /*-->*/ let nomeTurma = '';

                    // pra trazer a carga horária, fazer um select na FACTUAL a partir do CURS_Codigo, ANOL_Codigo, ALUN_Matricula e CodDaTurma. Resgatar todos codigos de Disciplinas
                    // e apartir dos códigos de disciplinas, fazer um somatatorio dos resultados buscados na FACDISC
            /*-->*/ let cargaHorariaRegistro = 0;
                    let codigosDisciplinaModel = await connectionSQLServer.query(`
                        SELECT 
                            SUM(HISTORICO.CARGAHOR) AS TOTALCH
                        FROM HISTESC HISTORICO
                        WHERE 
                        MATRICULA = '${MATRICULA}'
                        AND CURSO = '${CURSO}'
                        AND ANOLETIVO = '${ANOLETIVO}'
                        AND SEMESTRE = '${SEMESTRE}'
                        AND SERIE = '${SERIE}'
                        `);
                        
                    codigosDisciplinaModel = codigosDisciplinaModel[0];
                    if(codigosDisciplinaModel.length){
                        cargaHorariaRegistro += parseInt(codigosDisciplinaModel[0].TOTALCH);
                    }
                    if (isNaN(cargaHorariaRegistro)){
                        cargaHorariaRegistro = 0;
                    }

            /*-->*/ let statusRegistro = 'Aprovado';

            /*-->*/ let finish_date = '';
            /*-->*/ let start_date = '';
            /*-->*/ let certification_dispatch_date = '';
            /*-->*/ let graduation_date = '';
            /*-->*/ let admission = 'Vestibular';
            /*-->*/ let conclusion_date = '';
            /*-->*/ let certification_delivery_date = '';
            /*-->*/ let certification_dispatch_number_identification = '';
            /*-->*/ let record_date = '';
            /*-->*/ let record_number_identification = '';
            /*-->*/ let record_book = '';
            /*-->*/ let final_project_name = '';
            /*-->*/ let final_project_grade = '';
            /*-->*/ let final_project_presentation_date = '';
            /*-->*/ let final_project_assessment = '';
            /*-->*/ let monograph_advisor = '';

            /*-->*/ let nomeCurriculo = CTL_ANO_LETIVO;

                    /*-->*/ let score_educational_history = '';
                    /*-->*/ let ranking_educational_history = '';
                    /*-->*/ let admission_execution_date = '';
                    /*-->*/ let entrant_status = '';
                    /*-->*/ let exam_date = '';

                    await enrollmentRecordService.Registra(idStudent, idPerson, timestamp_ID, id_enrollment_record, '', 'FAAr - Faculdades Associadas de Ariquemes', SERIE, '', '', nomeCurso, nomeModulo, `${ANOLETIVO}/${SEMESTRE}`, nomeTurma, statusRegistro, '', '', '', cargaHorariaRegistro, '', law,  '', '', finish_date, nomeCurriculo, id_course_level, id_course_type, mec_course_code, academic_grade, coordinator, coordinator_grade, recognition, '', '', '', authorization, nomeCurso, nomeCurriculo, start_date, certification_dispatch_date, graduation_date, admission, '', '', score_educational_history, ranking_educational_history, '', admission_execution_date, '', entrant_status, exam_date, conclusion_date, certification_delivery_date, certification_dispatch_number_identification, '', '', record_date, record_number_identification, record_book, '', '', '', final_project_name, final_project_grade, final_project_presentation_date, final_project_assessment, '', '', '', '', '', '');
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO HISTÓRICO')
        }
        if(process.env.CSVREGISTROACADEMICO == 1){
            console.log('INICIO GERANDO CSV HISTÓRICO');
            const data = await enrollmentRecordService.BuscaTodos();
            const layoutService = new LayoutService('Histórico');
            await layoutService.CreateFile(data, true);
            console.log('FIM GERANDO CSV HISTÓRICO');
        }
        if(process.env.REGISTROACADEMICOISIMPORTED == 1){
            console.log('INICIO Update ISImported EnrollmentRecords');
            const listIdEnrollments = require('../tmp/enrollmentRecordsImported');
            let count = 1;
            for(let idEnrollmentRecord of listIdEnrollments){
                console.log(`Processando ${count} de ${listIdEnrollments.length} Registros Academicos`);
                count++;
                await enrollmentRecordService.UpdateIsImported(`${idEnrollmentRecord}`, true);

            }
            console.log('FIM Update ISImported EnrollmentRecords');
        }
    }

    async ProcessarHistorico_Disciplinas(){
        const enrollmentRecordSubjectService = new EnrollmentRecordSubjectService();
        const enrollmentRecordService = new EnrollmentRecordService();

        if(process.env.HISTORICO_DISCIPLINAS == 1){ /// .env
            console.log('INICIO PROCESSANDO HISTÓRICO');
            const historicoModel = await connectionSQLServer.query(`
                SELECT 
                    ISNULL(HISTORICO.MATRICULA, '') AS MATRICULA,
    ISNULL(HISTORICO.CURSO, '') AS CURSO,
    ISNULL(HISTORICO.ANOLETIVO, 0) AS ANOLETIVO,
    ISNULL(HISTORICO.SEMESTRE, 0) AS SEMESTRE,
    ISNULL(HISTORICO.SERIE, '') AS SERIE,
    ISNULL(HISTORICO.CUG_ANO_ADMISSAO, 0) AS CUG_ANO_ADMISSAO,
    ISNULL(HISTORICO.CTL_ANO_LETIVO, 0) AS CTL_ANO_LETIVO,
    ISNULL(HISTORICO.DISCIPLINA, '') AS DISCIPLINA,
    ISNULL(HISTORICO.CARGAHOR, 0) AS CARGAHOR,
    ISNULL(HISTORICO.COD_DISC, '') AS COD_DISC,
    ISNULL(HISTORICO.COD_PROF, '') AS COD_PROF,
    ISNULL(HISTORICO.NOTA, 0) AS NOTA
	, ( CASE 
		WHEN (HISTORICO.SIT_DISC = '' OR HISTORICO.SIT_DISC = 'E') THEN 'Cursando' 
		WHEN (HISTORICO.SIT_DISC = '*' OR HISTORICO.SIT_DISC = '4' OR  HISTORICO.SIT_DISC = '5' OR HISTORICO.SIT_DISC = 'B' OR HISTORICO.SIT_DISC = 'H' OR HISTORICO.SIT_DISC = 'M' OR HISTORICO.SIT_DISC = 'P' OR HISTORICO.SIT_DISC = 'R' OR HISTORICO.SIT_DISC = 'W' OR HISTORICO.SIT_DISC = 'X' OR HISTORICO.SIT_DISC = 'Z') THEN 'Outro' 
		WHEN (HISTORICO.SIT_DISC = '0' OR HISTORICO.SIT_DISC = '1' OR HISTORICO.SIT_DISC = '2' OR HISTORICO.SIT_DISC = '3' OR HISTORICO.SIT_DISC = 'G') THEN 'Cancelado' 
		WHEN (HISTORICO.SIT_DISC = 'D' OR HISTORICO.SIT_DISC = 'F' OR HISTORICO.SIT_DISC = 'N') THEN 'Reprovado' 
		WHEN (HISTORICO.SIT_DISC = 'A' OR HISTORICO.SIT_DISC = 'C' OR HISTORICO.SIT_DISC = 'I' OR HISTORICO.SIT_DISC = 'L' OR HISTORICO.SIT_DISC = 'O' OR HISTORICO.SIT_DISC = 'Q' OR HISTORICO.SIT_DISC = 'S' OR HISTORICO.SIT_DISC = 'T' OR HISTORICO.SIT_DISC = 'U') THEN 'Aprovado' 
		ELSE 'Outro'END
	) AS SITUACAO_DISC
	,ISNULL(HISTORICO.SIT_DISC, '') AS SIT_DISC,
    ISNULL(HISTORICO.HIE_PERCENTFREQ, 0) AS HIE_PERCENTFREQ,
    ISNULL(PESSOA.PES_COD, '') AS PES_COD,
    ISNULL(PESSOA.PES_IDALUNO, '') AS PES_IDALUNO
                FROM HISTESC HISTORICO
                INNER JOIN GEN_PESSOA AS PESSOA 
                        ON PESSOA.PES_IDALUNO = HISTORICO.MATRICULA 
                --WHERE 
                --MATRICULA = '05638'
                --AND CURSO = '013'
                `);
            const historicos = historicoModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let historico of historicos) {
                    console.log(`Processando ${count} de ${historicos.length} Registros Academicos - DISCIPLINAS`);
                    const {MATRICULA, CURSO, ANOLETIVO, SEMESTRE, SERIE, CUG_ANO_ADMISSAO, CTL_ANO_LETIVO, DISCIPLINA, CARGAHOR, COD_DISC, COD_PROF, NOTA, SIT_DISC, SITUACAO_DISC, HIE_PERCENTFREQ, PES_COD, PES_IDALUNO} = historico;
                    let idPerson = parseInt(PES_COD);
                    let idStudent = PES_IDALUNO ? parseInt(PES_IDALUNO) : idPerson;
                    if (typeof idStudent === 'number' && Number.isNaN(idStudent)) {
                        idStudent = idPerson;
                    } else {
                        idStudent = `${idPerson}${idStudent}`;
                        idStudent = parseInt(idStudent)
                    }
                    let id_enrollment_recordAux = '';
                    id_enrollment_recordAux = `${ANOLETIVO}${SEMESTRE}${SERIE}${CURSO}${MATRICULA}`;
                    let enrollmentRecord = await enrollmentRecordService.BuscarPeloIdAux_retornoIdEnrollmentRecord(id_enrollment_recordAux);
                    let id_enrollment_record = '';
                    if(enrollmentRecord){
                        id_enrollment_record = enrollmentRecord.id_enrollment_record;
                        if(!enrollmentRecord.isImported) continue;
                    }

                    //isImported
                    let id_enrollment_subject_record_aux = `${id_enrollment_record}${COD_DISC}`;
                    let timestamp_ID = Date.now();
                    await new Promise(resolve => setTimeout(resolve, 10));
                    let id_enrollment_subject_record = `${timestamp_ID}`;
                    let subject_type = '';

                    let waiver = '';
                    let status = ''
                    status = SITUACAO_DISC;
                    let dismissed = false;

                    if(SIT_DISC == 'I' || SIT_DISC == 'L' || SIT_DISC == 'M' || SIT_DISC == 'S'){
                        dismissed = true;
                    }

                    let academic_calendar = `${ANOLETIVO}/${SEMESTRE}`;

                    let nameModuloEquivalente = `${SERIE}° Período`;

                    let frequencia = '';
                    if(HIE_PERCENTFREQ){
                        let aux = parseFloat(HIE_PERCENTFREQ);
                        frequencia = aux.toFixed(0);
                        frequencia = frequencia.toString();
                    }

                    let average = '';
                    if(NOTA){
                        average = NOTA.toString().replaceAll(',', '.').replaceAll('*', '');
                        if(average.includes('-')) average = '';
                    }

                    await enrollmentRecordSubjectService.Registra(id_enrollment_subject_record, id_enrollment_subject_record_aux, id_enrollment_record, DISCIPLINA, academic_calendar, '', subject_type, '', average, frequencia, CARGAHOR, '', '', waiver, dismissed ? NOTA.toString().replaceAll(',','.') : '', status, '', '', status, '', dismissed, '', '', '', '', '', '', false, '', '');
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO HISTÓRICO')
        }
        if(process.env.CSVHISTORICO_DISCIPLINAS == 1){
            console.log('INICIO GERANDO CSV HISTÓRICO');
            const data = await enrollmentRecordSubjectService.BuscaTodos();
            const layoutService = new LayoutService(`Histórico_Disciplinas`);
            await layoutService.CreateFile(data, true, 19000);
            console.log('FIM GERANDO CSV HISTÓRICO');
        }
    }

    async ProcessarHistorico_Disciplinas_Equivalencias(){
        const enrollmentRecordSubjectService = new EnrollmentRecordSubjectService();
        const enrollmentRecordService = new EnrollmentRecordService();

        if(process.env.HISTORICO_DISCIPLINASEQ == 1){ /// .env
            console.log('INICIO PROCESSANDO HISTÓRICO');
            const historicoModel = await connectionSQLServer.query(`
            SELECT
                T0.[ANOL_Codigo], T0.[CURS_Codigo] ,T0.[CURR_Codigo], T0.[ALAN_IN_Periodo],  T0.[ALUN_Matricula] ,
                T1.DISC_Codigo, ISNULL(T1.TUAL_Media, '') as TUAL_Media, T1.STDI_Codigo  
                , T2.DISC_Descricao, T2.TPDI_Codigo, T2.DISC_CargaHorario  
                , T3.CURS_Descricao --T3
                , ISNULL(T4.CURR_Descricao, T4.CURR_Codigo) AS CURR_Descricao 
                , ISNULL(T5.MTDI_Codigo, '') AS MTDI_Codigo, ISNULL(T5.DISP_Media, '') AS DISP_Media, ISNULL(T5.DISP_MediaConceito, '') AS DISP_MediaConceito, ISNULL(T5.DISP_Data, '') AS DISP_Data, ISNULL(T5.DISP_Descricao, '') AS DISP_Descricao 
            FROM [dbo].[FACTUAL] T1 
                INNER JOIN FACALAN T0 ON T1.ALUN_Matricula = T0.ALUN_Matricula AND T1.CURS_Codigo <> T0.CURS_Codigo AND T1.ANOL_Codigo = T0.ANOL_Codigo
                INNER JOIN FACDISC T2 ON T2.DISC_Codigo = T1.DISC_Codigo
                INNER JOIN FACCURS T3 ON T3.CURS_Codigo = T0.CURS_Codigo
                INNER JOIN FACCURR T4 ON T4.CURS_Codigo = T0.CURS_Codigo AND T4.CURR_Codigo = T0.CURR_Codigo
                LEFT JOIN FACDISP  T5 ON T5.CURS_Codigo = T0.CURS_Codigo AND T5.ANOL_Codigo = T0.ANOL_Codigo AND T5.DISC_Codigo = T2.DISC_Codigo AND T5.ALUN_Matricula = T0.ALUN_Matricula
            WHERE
                T1.STDI_Codigo <> 'RF'
            ORDER BY T1.DISC_Codigo
            ASC

                `);
            const historicos = historicoModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let historico of historicos) {
                    console.log(`Processando ${count} de ${historicos.length} Registros Academicos - DISCIPLINAS`);
                    const {ALAN_IN_Periodo, CURS_Codigo, ANOL_Codigo, ALUN_Matricula, CURR_Codigo, DISC_Codigo, DISP_MediaConceito, DISC_Descricao, TPDI_Codigo, TUAL_Media, DISC_CargaHorario, MTDI_Codigo, STDI_Codigo, DISP_Data, DISP_Descricao, CURS_Descricao, DISP_Media, CURR_Descricao } = historico;
                    let id_enrollment_record = '';
                    let id_enrollment_recordAux = `${CURS_Codigo}${CURR_Codigo}${ANOL_Codigo.replaceAll('.','')}${ALAN_IN_Periodo}${ALUN_Matricula}`;
                    id_enrollment_record = await enrollmentRecordService.BuscarPeloIdAux_retornoIdEnrollmentRecord(id_enrollment_recordAux);

                    let idConvertNumber = jsonDeParaIdSubject[`${DISC_Codigo}`];

                    let id_enrollment_subject_record_aux = `${id_enrollment_record}${CURS_Codigo}${CURR_Codigo}${ALAN_IN_Periodo}${idConvertNumber}`;
                    let timestamp_ID = Date.now();
                    await new Promise(resolve => setTimeout(resolve, 10));
                    let id_enrollment_subject_record = `${timestamp_ID}`;
                    let subject_type = '';
                    if(TPDI_Codigo){
                        if(TPDI_Codigo == '00003') subject_type = 'OPTATIVA';
                        else if(TPDI_Codigo == '01') subject_type = 'CURRICULAR';
                        else if(TPDI_Codigo == '02') subject_type = 'ELETIVA';
                    }

                    let waiver = '';
                    if(MTDI_Codigo){
                        if(MTDI_Codigo == '01') waiver = 'CURSOU EM OUTRA IES';
                        else if(MTDI_Codigo == '02') waiver = 'APROVEITAMENTO DE ESTUDO';
                        else if(MTDI_Codigo == '03') waiver = 'COMPLEMENTAÇÃO 1ª VA';
                        else if(MTDI_Codigo == '04') waiver = 'COMPLEMENTAÇÃO 2ª VA';
                        else if(MTDI_Codigo == '05') waiver = 'DISEPENSADA EM OUTRA IES';
                    }
                    let status = ''
                    if(STDI_Codigo){
                        if(STDI_Codigo == 'AF') status = 'Aprovado';
                        else if(STDI_Codigo == 'AP') status = 'Aprovado';
                        else if(STDI_Codigo == 'CA') status = 'Cancelado';
                        else if(STDI_Codigo == 'CP') status = 'Aprovado';
                        else if(STDI_Codigo == 'CT') status = 'Outro';
                        else if(STDI_Codigo == 'DP') status = 'Aprovado';
                        else if(STDI_Codigo == 'DS') status = 'Cancelado';
                        else if(STDI_Codigo == 'FA') status = 'Outro';
                        else if(STDI_Codigo == 'MA') status = 'Cursando';
                        else if(STDI_Codigo == 'MC') status = 'Cancelado';
                        else if(STDI_Codigo == 'MT') status = 'Cancelado';
                        else if(STDI_Codigo == 'NC') status = 'Outro';
                        else if(STDI_Codigo == 'NF') status = 'Outro';
                        else if(STDI_Codigo == 'PM') status = 'Outro';
                        else if(STDI_Codigo == 'RF') status = 'Reprovado';
                        else if(STDI_Codigo == 'RP') status = 'Reprovado';
                        else if(STDI_Codigo == 'RR') status = 'Reprovado';
                        else if(STDI_Codigo == 'TD') status = 'Cancelado';
                        else if(STDI_Codigo == 'TF') status = 'Cancelado';
                        else if(STDI_Codigo == 'TR') status = 'Cancelado';
                    }

                    let dismissed = false;
                    if(DISP_Data){
                        let dataString = DISP_Data.toISOString();
                        dataString = dataString.substring(0,10);
                        let [ano] = dataString.split('-');
                        // let auxxxx = `${dia}/${mes}/${ano}`;
                        if(ano != '1900') dismissed = true;
                    }

                    let nameModuloEquivalente = '';
                    if(ALAN_IN_Periodo){
                        if(ALAN_IN_Periodo == 0) nameModuloEquivalente = `Módulo`;
                        else nameModuloEquivalente = `${ALAN_IN_Periodo}º Módulo`
                    }

                    await enrollmentRecordSubjectService.Registra(id_enrollment_subject_record, id_enrollment_subject_record_aux, id_enrollment_record, DISC_Descricao, ANOL_Codigo, '', subject_type, '', TUAL_Media.toString().replaceAll(',', '.'), '', DISC_CargaHorario, '', '', waiver, DISP_Media.toString().replaceAll(',','.'), status, '', DISP_MediaConceito, status, '', dismissed, DISP_Descricao, '', CURS_Descricao, CURR_Descricao, nameModuloEquivalente, DISC_Descricao, false, '', '', true);
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO HISTÓRICO')
        }
        if(process.env.CSVHISTORICO_DISCIPLINASEQ == 1){
            console.log('INICIO GERANDO CSV HISTÓRICO');
            const data = await enrollmentRecordSubjectService.BuscaTodasDispensas();
            let obj = {};
            let index = 1;
            let count = 0;
            for(let i of data){
                if(count == 0) obj[`${index}`] = [];
                if(count < 99999){
                    obj[`${index}`].push(i);
                    count++;
                } else{
                    obj[`${index}`].push(i)
                    index++;
                    count = 0;
                }
            }
            for(let key in obj){
                const layoutService = new LayoutService(`Histórico_DisciplinasEQ_Parte-${key}_`);
                await layoutService.CreateFile(obj[`${key}`]);
            }
            console.log('FIM GERANDO CSV HISTÓRICO');
        }
    }

    async ProcessarHistorico_DisciplinasProfessor(){
        const enrollmentRecordSubjectService = new EnrollmentRecordSubjectService();
        const enrollmentRecordService = new EnrollmentRecordService();
        const enrollmentRecordSubjectProfessorService = new EnrollmentRecordSubjectProfessorService();

        if(process.env.HISTORICO_DISCIPLINAS_PROFESSORES == 1){ /// .env
            console.log('INICIO PROCESSANDO HISTÓRICO Disciplinas x Professor');
            const historicoModel = await connectionSQLServer.query(`
                
SELECT 
	ISNULL(HISTORICO.MATRICULA, '') AS MATRICULA,
    ISNULL(HISTORICO.CURSO, '') AS CURSO,
    ISNULL(HISTORICO.ANOLETIVO, 0) AS ANOLETIVO,
    ISNULL(HISTORICO.SEMESTRE, 0) AS SEMESTRE,
    ISNULL(HISTORICO.SERIE, '') AS SERIE,
    ISNULL(HISTORICO.CUG_ANO_ADMISSAO, 0) AS CUG_ANO_ADMISSAO,
    ISNULL(HISTORICO.CTL_ANO_LETIVO, 0) AS CTL_ANO_LETIVO,
    ISNULL(HISTORICO.DISCIPLINA, '') AS DISCIPLINA,
    ISNULL(HISTORICO.CARGAHOR, 0) AS CARGAHOR,
    ISNULL(HISTORICO.COD_DISC, '') AS COD_DISC,
    ISNULL(HISTORICO.COD_PROF, '') AS COD_PROF,
	ISNULL(PROFESSORES.NOME, '') AS NOME_PROFESSOR,
	ISNULL(PROFESSORES.QUALIFICA, '') AS PROFESSOR_QUALIFICA,
    ISNULL(HISTORICO.NOTA, 0) AS NOTA
	, ( CASE 
		WHEN (HISTORICO.SIT_DISC = '' OR HISTORICO.SIT_DISC = 'E') THEN 'Cursando' 
		WHEN (HISTORICO.SIT_DISC = '*' OR HISTORICO.SIT_DISC = '4' OR  HISTORICO.SIT_DISC = '5' OR HISTORICO.SIT_DISC = 'B' OR HISTORICO.SIT_DISC = 'H' OR HISTORICO.SIT_DISC = 'M' OR HISTORICO.SIT_DISC = 'P' OR HISTORICO.SIT_DISC = 'R' OR HISTORICO.SIT_DISC = 'W' OR HISTORICO.SIT_DISC = 'X' OR HISTORICO.SIT_DISC = 'Z') THEN 'Outro' 
		WHEN (HISTORICO.SIT_DISC = '0' OR HISTORICO.SIT_DISC = '1' OR HISTORICO.SIT_DISC = '2' OR HISTORICO.SIT_DISC = '3' OR HISTORICO.SIT_DISC = 'G') THEN 'Cancelado' 
		WHEN (HISTORICO.SIT_DISC = 'D' OR HISTORICO.SIT_DISC = 'F' OR HISTORICO.SIT_DISC = 'N') THEN 'Reprovado' 
		WHEN (HISTORICO.SIT_DISC = 'A' OR HISTORICO.SIT_DISC = 'C' OR HISTORICO.SIT_DISC = 'I' OR HISTORICO.SIT_DISC = 'L' OR HISTORICO.SIT_DISC = 'O' OR HISTORICO.SIT_DISC = 'Q' OR HISTORICO.SIT_DISC = 'S' OR HISTORICO.SIT_DISC = 'T' OR HISTORICO.SIT_DISC = 'U') THEN 'Aprovado' 
		ELSE 'Outro'END
	) AS SITUACAO_DISC
	,ISNULL(HISTORICO.SIT_DISC, '') AS SIT_DISC,
    ISNULL(HISTORICO.HIE_PERCENTFREQ, 0) AS HIE_PERCENTFREQ,
    ISNULL(PESSOA.PES_COD, '') AS PES_COD,
    ISNULL(PESSOA.PES_IDALUNO, '') AS PES_IDALUNO
FROM HISTESC HISTORICO
INNER JOIN GEN_PESSOA AS PESSOA 
        ON PESSOA.PES_IDALUNO = HISTORICO.MATRICULA 
INNER JOIN PROFESS PROFESSORES ON PROFESSORES.COD_PROF = HISTORICO.COD_PROF
WHERE 
HISTORICO.COD_PROF <> ''


            
                `);
            const historicos = historicoModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let historico of historicos) {
                    console.log(`Processando ${count} de ${historicos.length} Registros Academicos - DISCIPLINAS x Professores`);
                    const {MATRICULA, CURSO, ANOLETIVO, SEMESTRE, SERIE, CUG_ANO_ADMISSAO, CTL_ANO_LETIVO, DISCIPLINA, CARGAHOR, COD_DISC, COD_PROF, NOME_PROFESSOR, PROFESSOR_QUALIFICA, NOTA, SIT_DISC, SITUACAO_DISC, HIE_PERCENTFREQ, PES_COD, PES_IDALUNO} = historico;
                    let idPerson = parseInt(PES_COD);
                    let idStudent = PES_IDALUNO ? parseInt(PES_IDALUNO) : idPerson;
                    if (typeof idStudent === 'number' && Number.isNaN(idStudent)) {
                        idStudent = idPerson;
                    } else {
                        idStudent = `${idPerson}${idStudent}`;
                        idStudent = parseInt(idStudent)
                    }
                    let id_enrollment_recordAux = '';
                    id_enrollment_recordAux = `${ANOLETIVO}${SEMESTRE}${SERIE}${CURSO}${MATRICULA}`;
                    let enrollmentRecord = await enrollmentRecordService.BuscarPeloIdAux_retornoIdEnrollmentRecord(id_enrollment_recordAux);
                    let id_enrollment_record = '';
                    if(enrollmentRecord){
                        id_enrollment_record = enrollmentRecord.id_enrollment_record;
                        if(!enrollmentRecord.isImported) continue;
                    }

                    //isImported
                    let id_enrollment_subject_record_aux = `${id_enrollment_record}${COD_DISC}`;
                    let enrollment_subject_record = await enrollmentRecordSubjectService.BuscarPeloId(id_enrollment_subject_record_aux);
                    if(!enrollment_subject_record) continue;
                    
                    let id_enrollment_subject_record = enrollment_subject_record.id_enrollment_subject_record;
                    let id_enrollment_subject_record_professor_aux = `${id_enrollment_record}${COD_DISC}${COD_PROF}`;
                    let id_enrollment_subject_record_professor = Date.now();
                    await new Promise(resolve => setTimeout(resolve, 10));
                    let professor_name = NOME_PROFESSOR || '';
                    
                    
                    let academic_title = PROFESSOR_QUALIFICA || '';

                    await enrollmentRecordSubjectProfessorService.Registra(id_enrollment_subject_record_professor, id_enrollment_subject_record_professor_aux, id_enrollment_subject_record, professor_name, academic_title);
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO HISTÓRICO Disciplinas x Professor')
        }
        if(process.env.CSVHISTORICO_DISCIPLINAS_PROFESSORES == 1){
            console.log('INICIO GERANDO CSV HISTÓRICO Disciplinas x Professor');
            const data = await enrollmentRecordSubjectProfessorService.BuscaTodos();
            // let obj = {};
            // let index = 1;
            // let count = 0;
            // for(let i of data){
            //     if(count == 0) obj[`${index}`] = [];
            //     if(count < 99999){
            //         obj[`${index}`].push(i);
            //         count++;
            //     } else{
            //         obj[`${index}`].push(i)
            //         index++;
            //         count = 0;
            //     }
            // }
            // for(let key in obj){
            // } 99999
            const layoutService = new LayoutService(`Histórico_Disciplinas_x_Professor`);
            await layoutService.CreateFile(data, true, 19999);
            console.log('FIM GERANDO CSV HISTÓRICO Disciplinas x Professor');
        }
    }

    async ProcessarHistorico_AtividadesComplementares(){
        const enrollmentRecordSubjectService = new EnrollmentRecordSubjectService();
        const enrollmentRecordService = new EnrollmentRecordService();
        const enrollmentRecordSubjectProfessorService = new EnrollmentRecordSubjectProfessorService();
        const enrollmentRecordExtensionActivityService = new EnrollmentRecordExtensionActivityService();

        if(process.env.HISTORICO_ATIVIDADES_COMPLEMENTARES == 1){ /// .env
            console.log('INICIO PROCESSANDO HISTÓRICO x Atividades Complementares');
            const historicoModel = await connectionSQLServer.query(`
            SELECT 
                MAX(T0.[ANOL_Codigo]) AS ANOL_Codigo, T0.[ALUN_Matricula], T0.[CURS_Codigo], MAX(T0.[CURR_Codigo]) AS CURR_Codigo, MAX(T0.[ALAN_IN_Periodo]) AS ALAN_IN_Periodo, T1.[ACAL_DT_Data], T1.[ACAL_DT_DataFinal], CAST(T1.[ACAL_CR_CargoHoraria] AS int) ACAL_CR_CargoHoraria, T1.[ACEV_ST_Codigo], T2.[ACEV_ST_Descricao]
            FROM [dbo].[FACALAN] T0
                INNER JOIN [dbo].[FACACAL] T1 ON T1.[ALUN_Matricula] = T0.[ALUN_Matricula]
                INNER JOIN [dbo].[FACACEV] T2 ON T2.[ACEV_ST_Codigo] = T1.[ACEV_ST_Codigo]
            GROUP BY T0.[ALUN_Matricula], T0.[CURS_Codigo], T1.[ACAL_DT_Data], T1.[ACAL_DT_DataFinal], T1.[ACAL_CR_CargoHoraria], T1.[ACEV_ST_Codigo], T2.[ACEV_ST_Descricao]
                `);
            const historicos = historicoModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let historico of historicos) {
                    console.log(`Processando ${count} de ${historicos.length} Registros Academicos x Atividades Complementareses`);
                    const { ANOL_Codigo, ALUN_Matricula, CURS_Codigo, CURR_Codigo, ALAN_IN_Periodo, ACAL_DT_Data, ACAL_DT_DataFinal, ACAL_CR_CargoHoraria, ACEV_ST_Codigo, ACEV_ST_Descricao} = historico;



                    let id_enrollment_complementary_activity_record = '';
                    let id_enrollment_complementary_activity_record_aux = `${CURS_Codigo}${CURR_Codigo}${ANOL_Codigo.replaceAll('.','')}${ALAN_IN_Periodo}${ALUN_Matricula}${ACAL_DT_Data ? ACAL_DT_Data.toISOString().replaceAll(' ','') : ''}${ACAL_CR_CargoHoraria ? ACAL_CR_CargoHoraria : ''}${ACEV_ST_Codigo ? ACEV_ST_Codigo : ''}`;
                    
                    let id_enrollment_record = '';
                    if(count == 839){
                        console.log('achou')
                    }
                    let id_enrollment_recordAux = `${CURS_Codigo}${CURR_Codigo}${ANOL_Codigo.replaceAll('.','')}${ALAN_IN_Periodo}${ALUN_Matricula}`;
                    id_enrollment_record = await enrollmentRecordService.BuscarPeloIdAux_retornoIdEnrollmentRecord(id_enrollment_recordAux);
                    if(!id_enrollment_record){
                        console.log(`Não encontrado Histórico para o aluno ${ALUN_Matricula} no ano ${ANOL_Codigo} no curso de código ${CURS_Codigo} e curriculo ${CURR_Codigo} no período ${ALAN_IN_Periodo}`);
                        textConsole += `\nNão encontrado Histórico para o aluno ${ALUN_Matricula} no ano ${ANOL_Codigo} no curso de código ${CURS_Codigo} e curriculo ${CURR_Codigo} no período ${ALAN_IN_Periodo}`;
                        continue;
                    }
                    
                    let timestamp_ID = Date.now();
                    await new Promise(resolve => setTimeout(resolve, 10));
                    id_enrollment_complementary_activity_record = `${timestamp_ID}`;
                    
                    let start_date = '';
                    let end_date = '';
                    if(ACAL_DT_Data){
                        let dataString = ACAL_DT_Data.toISOString();
                        dataString = dataString.substring(0,10);
                        let [ano, mes, dia] = dataString.split('-');
                        start_date = `${dia}/${mes}/${ano}`;
                    }
                    if(ACAL_DT_DataFinal){
                        let dataString = ACAL_DT_DataFinal.toISOString();
                        dataString = dataString.substring(0,10);
                        let [ano, mes, dia] = dataString.split('-');
                        end_date = `${dia}/${mes}/${ano}`;
                    }
                    

                    await enrollmentRecordExtensionActivityService.Registra(id_enrollment_complementary_activity_record, id_enrollment_complementary_activity_record_aux, id_enrollment_record, 'Atividade Complementar', ACEV_ST_Descricao || 'Não Informado', ACEV_ST_Codigo || 'Não Informado', start_date, end_date, ACAL_CR_CargoHoraria || '0');
                    count++;
                }
            }
            console.log(`\n\n============================================== \n` + textConsole)
            console.log('\nFIM PROCESSANDO HISTÓRICO x Atividades Complementares')
        }
        if(process.env.CSVHISTORICO_ATIVIDADES_COMPLEMENTARES == 1){
            console.log('INICIO GERANDO CSV HISTÓRICO x Atividades Complementares');
            const dataGennera = await enrollmentRecordExtensionActivityService.BuscaTodos();
            const layoutService = new LayoutService('Históricos_Atividades_Complementares');
            await layoutService.CreateFile(dataGennera);
            console.log('FIM GERANDO CSV HISTÓRICO x Atividades Complementares');
        }
    }

    async UpdateViaApiEnrollmentRecords(){
        const tokenAPI = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywiaWRJc3N1ZXJVc2VyIjoxMjgxOTk1NCwibW9kZSI6InByb2QiLCJpYXQiOjE3MDk0ODE3NzEsImlzcyI6Imh0dHBzOi8vYXBwcy5nZW5uZXJhLmNvbS5iciIsInN1YiI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciJ9.mt83H7H03gGiEv9MvV6uelzSBxOwfDdpCmOJL6491aReJmff6_yFEydgmzDqYgnKsyTdz6Iph6Fw-s6EtcsRONuVDLlGDD6Wc7RS4vBM9KPH1B6FRvBb867cS7GQo1Q5saiB1rbc7GweC8cQBwPzg6G_RjUZiQ94SXJWa0-8UR8gi5NLP_Wu6jsNjDM8AV94qpgq9CkKMbpJeKggh4UdHwfl8c75QRYtZMzNoZZu6Zan6H1Srpi4nOSMF1yGaMt4N5qbJCISSxc97iHQ1Nww1x8Rtrx3EE0VGhJ1T_o-tUYvXFZRAgVo8Ir3OTueBDG04ScLKNFPTwTI8i3hlPvXw2wEypIh3PYWIgD_jVCN5459KqLE1rGfLMdlQ2TaSgrQn3thN5WpFEaREhRU1cC0auFPojAPAb_qWtufx7XNNI0SVq5qatMsSJgWoBVIGxqJcSER8BYcHCNYlxtIGIYlkqKOBWUVTQufQqE0O3YzBi9P4Qafis8Brg-KkqXulphmZL-Md0J-7tISVe4OsILc7qnC6Nd82_tOK8rBU_2UlI0JL1M3nae3iRYSN4PR5MACPkgSUIvtzPQ_PYsIY3YXmqnT1z6dXRhSY4QnlpaeBzzScLOokMTaXNVDW3oG1ziuHkvCy4pcXdMOu_GQR0mS68j5fXXdWr70B31UuPnsYRA`;
        const tokenUser = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywibW9kZSI6InByb2QiLCJpYXQiOjE3MDkzMjgxNTQsImV4cCI6MTcwOTc2MDE1NCwiaXNzIjoiaHR0cHM6Ly9hcHBzLmdlbm5lcmEuY29tLmJyIiwic3ViIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIn0.YE9SZ8iB47s_PnmVvlYdckm_7coyLG7fxZyBrbksOl69BNB0WXpM2CQuzaIX7mGMt60IxYlqBJS33A6uFhahiG1Zf5aWQywpxXED9Q0uJxvMS_krdzpT7oa1KOFwfAXtnZH3Oa3GUmSabTtNcgMW7-7hCmAAK-OaXqb6ywsICOqpyY8O-xPdiPHmIWvnurDOR5ODahihiJnux6zDuRY9_b1oACTZlHPlOmmG6vgopKhaziQehRj5E8ShkN9sZYuMAz6ttjBT2ZxOC1nubDKcvwJcq1yyvGP95hpTQT1CoojlyPofsuviGWVuCSGit2NIoYgWQ8sETqAoeUfQk59JC6abbWV1esyzHOrZF71L5BDuGRtNyR9iEN0RYAQncAEPx8syy3p8bBWmGOzASApvI1knsBAj9ujFS0wJ7N_fWLTyK_H0z8PXPoopeWocuj9RvTgxHlA_UFk84YeV8LQmGrrsBy4WnXkuSE8NOKiJvLPSIegcAr88BzovUZZhq6aw3-b1Xs5eoL45VkJxqh2b-YYzhkQZCAQOlZP0i_QqpKKgYvp1XaBTNqEaHVN_ey1vnXW8WQTFY7lrFACOjtorYQ8hwgXTEI6jo92klcEWSCYtjyE0q0b9k1ue0vsLHqtH507veaUbbJqsw1mZP0LcF9wa4pfcnQRFkyKdpQevZ4s`;

        const httpGenneraAPI = axios.create({
            baseURL: 'https://api2.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenAPI
            }
        });

        const httpGenneraUsuario = axios.create({
            baseURL: 'https://enrollment.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenUser
            }
        });

        let resp = await httpGenneraAPI.get('/persons');
        let TodasPessoasDoGennera = resp.data;
        const personService = new PersonService();
        let TodasPessoasMigradas = await personService.BuscaTodasPessoasMigradas();

        //TodasPessoasDoGennera = TodasPessoasDoGennera.filter(h => h.name == 'WAGNER ALEXANDRE OLIVEIRA DE ARAUJO');

        let PessoasVerificarHistorico = [];
        TodasPessoasMigradas.forEach(p =>{
            let PessoaGenneraEncontrada = TodasPessoasDoGennera.find(person => person.name == p.name);
            if(PessoaGenneraEncontrada) {
                PessoaGenneraEncontrada['idPessoaBancoMigracao'] = p.id_person;
                PessoaGenneraEncontrada['idStudentBancoMigracao'] = p.id_student;
                
                PessoasVerificarHistorico.push(PessoaGenneraEncontrada);
            }
        });


        //PessoasVerificarHistorico = PessoasVerificarHistorico.filter(h => h.idPerson == 2529930);
        const enrollmentRecordService = new EnrollmentRecordService();
        let count = 1;
        let textError = '';
        for(let person of PessoasVerificarHistorico){
            try {
                console.log(`Processando ${count} de ${PessoasVerificarHistorico.length} | Nome: ${person.name}`);
                log(`Processando ${count} de ${PessoasVerificarHistorico.length} | Nome: ${person.name}`);
                count++;
                // if(count < 4565) continue;
                //log(person);
                let historicosModel = await enrollmentRecordService.BuscarPeloIdStudent(person.idStudentBancoMigracao);
                if(!historicosModel.length) continue;
    
                let respHist = await httpGenneraUsuario.get(`enrollmentRecords?idPerson=${person.idPerson}`);
                let historicosNoGennera = respHist.data || [];
                historicosNoGennera = historicosNoGennera.filter(h => h.institutionName == 'FIS');
    
                
                for(let historico of historicosNoGennera){
                    try {
                        let historicoEncontrado = historicosModel.find(h => h.module == historico.moduleName);
                        if(!historicoEncontrado ) continue;
                        historico.metadata.admission = historicoEncontrado.admission;
                        delete historico.subjects;
                        await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}`, historico);
                    } catch (err) {
                        textError += `Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`
                        console.log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`)
                        log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`)
                    }
                }
            } catch (err) {
                textError += `\n\n ####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.\n\n`;
                console.log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
                log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
            }
            
        }
        console.log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)
        log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)

    }

    async RPA_HotFixHistorico(){
        const tokenAPI = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiUHJvamV0byBJbnRlZ3JhdGUiLCJ1c2VybmFtZSI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciIsImhhc2giOiJ0eEZPM0c2RDhpQTFSQ2t2TkxnM2NSTjNiNEVYR1NVTGFBcXVKZktqIiwiaWRVc2VyIjoxNDI5MTEyMiwiaWRDb3VudHJ5IjozMiwiaWRMYW5ndWFnZSI6MiwibGFuZ3VhZ2VDb2RlIjoicHQiLCJpZFRpbWV6b25lIjoxOTcsImlkQ3VzdG9tZXIiOjE4MDUsImlkSXNzdWVyVXNlciI6MTYwNjM4OSwibW9kZSI6InByb2QiLCJpYXQiOjE3MzEzMjA2NzYsImlzcyI6Imh0dHBzOi8vYXBwcy5nZW5uZXJhLmNvbS5iciIsInN1YiI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciJ9.e9d86upTlbSnDsYWKhNxZIKSXvAfoShj5rBv0VE-q4VTWWCxmXw2AEzipDfS49uGIiqVTwXyKEL_mkAL4mgvEMbYDQp3DKuhB-TMPsrIUUgl8J5itMlhb51P1qwiEcRjVbpyxaJcCWKphZyU_vLbCcC2_THuEZe6IX54i12aE008itz2fhRk56_dL41qh3DZ9the2IGYD60HpXkqXSM8AYooi4PXHQhksTnQgk28zwUqhialY7nooOvpJ658HdtTV2s32AXKPFhgCJjqXlPnXArUCqZXYPwzguHj5dFGfEFYRdH76TOhfnk_xSnj4Yo0wEjhdDKS7qnp_KA123baJyq6ed_2LU1cbJY26-IVGRMNbI_b0xm0LOaihjuyqgQW02e1jJFcTaQEztcNzyEKi2erO3fgAUpGCNf481KTknqwWuuA8mkgsSCjaxw0OkjMk_n01d4CDjOkbMfh7QZMuxDHrTPMLwKqbMSUruQLX9joMVtxop-LQ6z5swcZ4M3pcUGCzz1_E189Ni1J6iKV9Se7fTrNEFRxlkQFFI9zuBQTbIBOtgPpugI4CRc7Gy6-IbOBd9xGDlBD6l61_JKt8DJKxhDy73JPrKlhySO7WsmcXv34Yhuau4Ll1TGoWR0vO98it5O_pZCZqFrW_bQLjFcOI0rxnKyqE7-5UB9H-TU`;

        
        const tokenUser = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiUHJvamV0byBJbnRlZ3JhdGUiLCJ1c2VybmFtZSI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciIsImhhc2giOiJ0eEZPM0c2RDhpQTFSQ2t2TkxnM2NSTjNiNEVYR1NVTGFBcXVKZktqIiwiaWRVc2VyIjoxNDI5MTEyMiwiaWRDb3VudHJ5IjozMiwiaWRMYW5ndWFnZSI6MiwibGFuZ3VhZ2VDb2RlIjoicHQiLCJpZFRpbWV6b25lIjoxOTcsImlkQ3VzdG9tZXIiOjE4MDUsIm1vZGUiOiJwcm9kIiwiaWF0IjoxNzMxMzIwMTAwLCJleHAiOjE3MzE3NTIxMDAsImlzcyI6Imh0dHBzOi8vYXBwcy5nZW5uZXJhLmNvbS5iciIsInN1YiI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciJ9.jlXN6WXutfYWlvD3yocKJNJ3JIcX-AGd9CX2fWJVMdiOXC2UosU-MozTN4tknnkFCqEBaOjl_hXcX0J0hxZY3lft99P03g1if2eMR5DrG-kdc7W7HdhbQK4oeFfil-IUKQ4Xols6EftWvwyVDoFa3t__Ph2OETzYRLt1R-4TVDCGNw_j0dF-vEl9gFnucY_mFo0kKppDJaDTWPQDG8s83kOIbHnZyLzqhOfjB5IwZr4cAH56KIy53-rUnan9hFYg9UbpSNh0NndQlhFelNNVbuadA5BB7Wn4e8AC7XVYXwQJ6e1RPC4zPtmrJ28n5SCRjRmSpl6m1LvQWjqv02mL3k_F8ippN1T5PpyfYehE_Q2PliHn8qVBKfS6y7OIf_XvaGcz_cqgsltTGhxL5dBt9b-wjsODE8d-zu0UXQUOUaWuLOwZc72_9-DqgrQ_IBc1D5s7vkJiougU_xj3d-Wdh3a8DXIs9zVDKl18Qm48Nyz2_iKfy1D7WN-ULbSyvTNHfFiox0nxGviSIeOfbXWIP6Sk1V1KIo9UXvB7OCaNjdhWtFmLBbnK52LzR0m3y8mrfQSyd6Dgz9OBSxneOOIsklSEofrTh3ZhTFERz-qVyfmnWuS9e3vp4JE7oBjB9nsxNGHb7ub9EQzIOT3r9kwr4oOs39Shu9lvGNZKbFL07Q0`;
        
        const httpGenneraAPI = axios.create({
            baseURL: 'https://api2.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenAPI
            }
        });

        const httpGenneraUsuario = axios.create({
            baseURL: 'https://enrollment.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenUser
            }
        });

        let respCursos = await httpGenneraAPI.get('/courses');
        let CursosGennera = respCursos.data || [];
        // CursosGennera = CursosGennera.filter(c => c.name == 'ODONTOLOGIA');
        let i = 0;
        let TODASDISCIPLINAS = [];
        for(let curso of CursosGennera){
            console.log(`Processando Curso ${i} de ${CursosGennera.length}`);
            i++;
            curso['curriculums'] = [];
            //if(!curso.name.includes('DIREITO')) continue;
            let respCurriculo = [];
            let curriculo = true;
            let curriculoCount = 0;
            while(curriculo){
                try {
                    respCurriculo = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums`);
                    curriculo = false;
                    curso.curriculums = respCurriculo.data || [];
                    let x =1;
                    for(let curriculo of curso.curriculums){
                        console.log(`Processando Curso ${i}. Currículo ${x} de ${curso.curriculums.length}`);
                        x++;
                        curriculo['modules'] = [];
                        curriculo['subjects'] = [];

                        let modulos = true;
                        let modulosCount = 0;
                        while(modulos){
                            try {
                                let respModules = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums/${curriculo.idCurriculum}/modules`);
                                curriculo.modules = respModules.data || [];
                                modulos = false;
                                let y=1;
                                for(let module of curriculo.modules){
                                    console.log(`Processando Curso ${i}. Currículo ${x}. Múdulo ${y} de ${curriculo.modules.length}`);
                                    y++;
                                    // module['subjects'] = [];
                                    let disciplinas = true;
                                    let disciplinasCount = 0;
                                    while(disciplinas){
                                        try {
                                            let respSubjects = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums/${curriculo.idCurriculum}/modules/${module.idModule}/subjects`);
                                            let arr = respSubjects.data || [];
                                            curriculo.subjects = curriculo.subjects.concat(arr);
                                            TODASDISCIPLINAS = TODASDISCIPLINAS.concat(arr);
                                            disciplinas = false
                                        } catch (err) {
                                            disciplinasCount++;
                                            if(err.message == 'read ECONNRESET'){
                                                console.log(`Nova Tentativa ${disciplinasCount}.`);
                                            }
                                            if(disciplinasCount >= 5){
                                                disciplinas = false;
                                                throw err;
                                            }
                                        }
                                    }

                                }
                            } catch (err) {
                                modulosCount++;
                                if(err.message == 'read ECONNRESET'){
                                    console.log(`Nova Tentativa ${modulosCount}.`);
                                }
                                if(modulosCount >= 5){
                                    modulos = false;
                                    throw err;
                                }
                            }
                        }
                    }
                } catch (error) {
                    curriculoCount++;
                    if(error.message == 'read ECONNRESET'){
                        console.log(`Nova Tentativa ${curriculoCount}.`);
                    }
                    if(curriculoCount >= 5){
                        curriculo = false;
                        throw error;
                    }
                }
            }
        }

        let resp = [];
        let pessoas = true;
        let pessoaTentativas = 0;
        while(pessoas){
            try {
                resp = await httpGenneraAPI.get('/persons');
                pessoas = false
            } catch (err) {
                pessoaTentativas++;
                if(err.message == 'read ECONNRESET'){
                    console.log(`Nova Tentativa ${pessoaTentativas}.`);
                }
                if(pessoaTentativas >= 5){
                    pessoas = false;
                    throw err;
                }
            }
        }

        let TodasPessoasDoGennera = resp.data;
        const personService = new PersonService();
        // let TodasPessoasMigradas = await personService.BuscaTodasPessoasMigradas();
        let TodasPessoasMigradas = await personService.BuscaTodasPessoasMigradas();

        // TodasPessoasDoGennera = TodasPessoasDoGennera.filter(h => h.name == 'JÚLIA MARIA SANTOS OLIVEIRA');
        // TodasPessoasMigradas = TodasPessoasMigradas.filter(h => h.name == 'JÚLIA MARIA SANTOS OLIVEIRA');

        TodasPessoasDoGennera.forEach(p =>{
            p['addAlista'] = false;
        })

        let PessoasVerificarHistorico = [];
        TodasPessoasMigradas.forEach(p =>{
            let PessoaGenneraEncontrada = TodasPessoasDoGennera.find(person => (person.name == p.name || person.socialName == p.name) && !person.addAlista);
            if(PessoaGenneraEncontrada) {
                PessoaGenneraEncontrada['idPessoaBancoMigracao'] = p.id_person;
                PessoaGenneraEncontrada['idStudentBancoMigracao'] = p.id_student;
                PessoaGenneraEncontrada['addAlista'] = true;
                PessoasVerificarHistorico.push(PessoaGenneraEncontrada);
            }
        });


        //PessoasVerificarHistorico = PessoasVerificarHistorico.filter(h => h.idPerson == 2529930);
        const enrollmentRecordService = new EnrollmentRecordService();
        let count = 1;
        let textError = '';
        for(let person of PessoasVerificarHistorico){
            try {
                console.log(`Processando ${count} de ${PessoasVerificarHistorico.length} | Nome: ${person.name}`);
                log(`Processando ${count} de ${PessoasVerificarHistorico.length} | Nome: ${person.name}`);
                count++;
                // if(count < 4565) continue;
                //log(person);
                let historicosModel = []
                let buscaHistorico = true;
                let buscaHistoricoTentativas = 0;
                while(buscaHistorico){
                    try {
                        historicosModel = await enrollmentRecordService.BuscarPeloIdStudent(person.idStudentBancoMigracao);
                        buscaHistorico = false;
                    } catch (err) {
                        buscaHistoricoTentativas++;
                        if(err.message == 'read ECONNRESET'){
                            console.log(`Nova Tentativa ${buscaHistoricoTentativas}.`);
                        }
                        if(buscaHistoricoTentativas >= 5){
                            buscaHistorico = false;
                            throw err;
                        }
                    }
                }
                if(!historicosModel.length) continue;
                
                // INICIO Somente em Registros do Curso de ADM
                // let registroEncontrado = historicosModel.filter(r => r.course == 'ODONTOLOGIA')
                // if(registroEncontrado.length){
                //     historicosModel = [...registroEncontrado];
                // } else{
                //     continue;
                // }
                // FIM Somente em Registros do Curso de ADM
    
                let respHist = [];

                let buscaHistoricoGenn = true;
                let buscaHistoricoGennTentativas = 0;
                while(buscaHistoricoGenn){
                    try {
                        respHist = await httpGenneraUsuario.get(`enrollmentRecords?idPerson=${person.idPerson}`);
                        buscaHistoricoGenn = false;
                    } catch (err) {
                        buscaHistoricoGennTentativas++;
                        if(err.message == 'read ECONNRESET'){
                            console.log(`Nova Tentativa ${buscaHistoricoGennTentativas}.`);
                        }
                        if(buscaHistoricoGennTentativas >= 5){
                            buscaHistoricoGenn = false;
                            throw err;
                        }
                    }
                }


                let historicosNoGennera = respHist.data || [];
                if(!historicosNoGennera.length) {
                    let buscaHistoricoGennbyName = true;
                    let buscaHistoricoGennbyNameTentativas = 0;
                    while(buscaHistoricoGennbyName){
                        try {
                            historicosNoGennera = await this.VerificaDemaisCadastroDePessoas(httpGenneraUsuario, person.name);
                            buscaHistoricoGennbyName = false;
                        } catch (err) {
                            buscaHistoricoGennbyNameTentativas++;
                            if(err.message == 'read ECONNRESET'){
                                console.log(`Nova Tentativa ${buscaHistoricoGennbyNameTentativas}.`);
                            }
                            if(buscaHistoricoGennbyNameTentativas >= 5){
                                buscaHistoricoGennbyName = false;
                                throw err;
                            }
                        }
                    }
                }
                // historicosNoGennera = historicosNoGennera.filter(h => h.institutionName == 'FIS');
                historicosNoGennera = historicosNoGennera.filter(h => !h.idEnrollment);
    
                
                for(let historico of historicosNoGennera){
                    try {
                        let numeroModulo = this.#PegarSomenteNumeros(historico.moduleName);
                        let historicoEncontrado = historicosModel.find(h => h.module.includes(numeroModulo));
                        // let historicoEncontrado = historicosModel.find(h => h.module == historico.moduleName);
                        if(!historicoEncontrado ) continue;

                        if(!historico.idEnrollment){
                            let respDisciplinasHist = [];

                            let buscaHistoricoGennDispciplinas = true;
                            let buscaHistoricoGennDispciplinasTentativas = 0;
                            while(buscaHistoricoGennDispciplinas){
                                try {
                                    respDisciplinasHist = await httpGenneraUsuario.get(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects`);
                                    buscaHistoricoGennDispciplinas = false;
                                } catch (err) {
                                    buscaHistoricoGennDispciplinasTentativas++;
                                    if(err.message == 'read ECONNRESET'){
                                        console.log(`Nova Tentativa ${buscaHistoricoGennDispciplinasTentativas}.`);
                                    }
                                    if(buscaHistoricoGennDispciplinasTentativas >= 5){
                                        buscaHistoricoGennDispciplinas = false;
                                        throw err;
                                    }
                                }
                            }




                            let disciplinasNoHistorico = respDisciplinasHist.data || [];
                            let somatorioCargaHoraria = 0;
                            let isUpdateRegistro = false;
                            for(let disciplinaHist of disciplinasNoHistorico){
                                somatorioCargaHoraria += disciplinaHist.workload;
                                try {
                                    let isUpdate = false;
                                    // Aqui vai buscar o curso e etc pra fazer a equivalencia;
                                    if(!disciplinaHist.idSubject){
                                        // idSubject
                                        // Se for contabilidade, ou diretiro, fazer dupla checkagem
                                        let isDireito = false;
                                        let isContabil = false;
                                        if(historico.courseName.includes('DIREITO')){
                                            isDireito = true;
                                        }
                                        if(historico.courseName.includes('CIÊNCIAS CONTÁBEIS')){
                                            isContabil = true;
                                        }
                                        let cursoEncontrado = CursosGennera.find(c => c.name == historico.courseName);
                                        if(!cursoEncontrado){
                                            if(isDireito){
                                                cursoEncontrado = CursosGennera.find(c => c.name == historico.courseName + ' 013');
                                                if(!cursoEncontrado){
                                                    cursoEncontrado = CursosGennera.find(c => c.name == historico.courseName + ' 003');
                                                }
                                            }
                                            if(isContabil) cursoEncontrado = CursosGennera.find(c => c.name == historico.courseName + ' 019');
                                        }
                                        if(cursoEncontrado){
                                            let curriculoEncontrado = cursoEncontrado.curriculums.find( c => c.name == historico.curriculumName);
                                            if(curriculoEncontrado){
                                                let disciplinaEncontrada = curriculoEncontrado.subjects.find(s => s.name == disciplinaHist.subjectName);
                                                if(disciplinaEncontrada){
                                                    disciplinaHist.idSubject = disciplinaEncontrada.idSubject;
                                                    isUpdate = true;
                                                } else {
                                                    disciplinaEncontrada = TODASDISCIPLINAS.find(s => s.name == disciplinaHist.subjectName);
                                                    if(disciplinaEncontrada){
                                                        disciplinaHist.idSubject = disciplinaEncontrada.idSubject;
                                                        isUpdate = true;
                                                        console.log("OLHO TODAS DISCIPLINAS...")
                                                    }
                                                }
                                                
                                                // let numeroPeriodo = historico.moduleName.replace(/[^0-9]/g,'');
                                                // if(numeroPeriodo){
                                                //     let moduloEncontrado = curriculoEncontrado.modules.find(m => m.name.includes(`${numeroPeriodo}º`) || m.name.includes(`${numeroPeriodo}°`) || m.name.includes(`${numeroPeriodo}º`))
                                                //     if(moduloEncontrado){
                                                        
                                                //     }
                                                // }
                                            }
                                        }
                                    }
                                    //também vai verificar se a disciplina é status cursando pra marcar como cancelada
                                    // if(disciplinaHist.status == 'IN PROGRESS'){
                                    //     disciplinaHist.status = 'CANCELLED';
                                    //     disciplinaHist.idCancellationReason = 2738;
                                    //     isUpdate = true;
                                    // }
                                    // disciplinaHist.attendance
                                    // if(!disciplinaHist.attendance){
                                    //     disciplinaHist.attendance = 100;
                                    //     isUpdate = true;
                                    // }
                                    if(isUpdate){
                                        let AtualizaHistoricoGennDispciplinas = true;
                                        let AtualizaHistoricoGennDispciplinasTentativas = 0;
                                        while(AtualizaHistoricoGennDispciplinas){
                                            try {
                                                await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects/${disciplinaHist.idEnrollmentSubjectRecord}`, disciplinaHist);
                                                AtualizaHistoricoGennDispciplinas = false;
                                            } catch (err) {
                                                AtualizaHistoricoGennDispciplinasTentativas++;
                                                if(err.message == 'read ECONNRESET'){
                                                    console.log(`Nova Tentativa ${AtualizaHistoricoGennDispciplinasTentativas}.`);
                                                }
                                                if(AtualizaHistoricoGennDispciplinasTentativas >= 5){
                                                    AtualizaHistoricoGennDispciplinas = false;
                                                    throw err;
                                                }
                                            }
                                        }
                                    }
                                } catch (err) {
                                    textError += `Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`;
                                    console.log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`);
                                    log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`);
                                }
                            }
                            if(historico.workload != somatorioCargaHoraria){
                                historico.workload = somatorioCargaHoraria;
                                isUpdateRegistro = true;
                            }
                            if(historico.status == 'IN PROGRESS'){
                                historico.status = 'APPROVED';
                                isUpdateRegistro = true;
                            }
                            if(isUpdateRegistro){
                                delete historico.subjects;
                                let AtualizaHistoricoGenn = true;
                                let AtualizaHistoricoGennTentativas = 0;
                                while(AtualizaHistoricoGenn){
                                    try {
                                        await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}`, historico);
                                        AtualizaHistoricoGenn = false;
                                    } catch (err) {
                                        AtualizaHistoricoGennTentativas++;
                                        if(err.message == 'read ECONNRESET'){
                                            console.log(`Nova Tentativa ${AtualizaHistoricoGennTentativas}.`);
                                        }
                                        if(AtualizaHistoricoGennTentativas >= 5){
                                            AtualizaHistoricoGenn = false;
                                            throw err;
                                        }
                                    }
                                }
                            }
                            // historico.metadata.admission = historicoEncontrado.admission;
                        }
                    } catch (err) {
                        textError += `Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`;
                        console.log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`);
                        log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`);
                    }
                }
            } catch (err) {
                textError += `\n\n ####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.\n\n`;
                console.log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
                log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
            }
            
        }
        console.log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)
        log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)

    }

    async RPA_HotFixHistoricoCargaHoraria(){
        const tokenAPI = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywiaWRJc3N1ZXJVc2VyIjoxMjgxOTk1NCwibW9kZSI6InByb2QiLCJpYXQiOjE3MDk0ODE3NzEsImlzcyI6Imh0dHBzOi8vYXBwcy5nZW5uZXJhLmNvbS5iciIsInN1YiI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciJ9.mt83H7H03gGiEv9MvV6uelzSBxOwfDdpCmOJL6491aReJmff6_yFEydgmzDqYgnKsyTdz6Iph6Fw-s6EtcsRONuVDLlGDD6Wc7RS4vBM9KPH1B6FRvBb867cS7GQo1Q5saiB1rbc7GweC8cQBwPzg6G_RjUZiQ94SXJWa0-8UR8gi5NLP_Wu6jsNjDM8AV94qpgq9CkKMbpJeKggh4UdHwfl8c75QRYtZMzNoZZu6Zan6H1Srpi4nOSMF1yGaMt4N5qbJCISSxc97iHQ1Nww1x8Rtrx3EE0VGhJ1T_o-tUYvXFZRAgVo8Ir3OTueBDG04ScLKNFPTwTI8i3hlPvXw2wEypIh3PYWIgD_jVCN5459KqLE1rGfLMdlQ2TaSgrQn3thN5WpFEaREhRU1cC0auFPojAPAb_qWtufx7XNNI0SVq5qatMsSJgWoBVIGxqJcSER8BYcHCNYlxtIGIYlkqKOBWUVTQufQqE0O3YzBi9P4Qafis8Brg-KkqXulphmZL-Md0J-7tISVe4OsILc7qnC6Nd82_tOK8rBU_2UlI0JL1M3nae3iRYSN4PR5MACPkgSUIvtzPQ_PYsIY3YXmqnT1z6dXRhSY4QnlpaeBzzScLOokMTaXNVDW3oG1ziuHkvCy4pcXdMOu_GQR0mS68j5fXXdWr70B31UuPnsYRA`;
        const tokenUser = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywibW9kZSI6InByb2QiLCJpYXQiOjE3MTY1NTIzMDUsImV4cCI6MTcxNjk4NDMwNSwiaXNzIjoiaHR0cHM6Ly9hcHBzLmdlbm5lcmEuY29tLmJyIiwic3ViIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIn0.E2Px_eS3aWbM3_wSTpjzox5dPWbwnZIwHvJ5xok6WskWVdBhvzgQ1-_Jvg7KgL1C4uCc7pZqtiVq3QtMrH47FAkbUs2w0ycxLrzwgysZmZOd397tzCzK0JWm0q28r1v_z6q3uzOaxjA5C1U4vT-njTzaAr_6QpBl6z5VvpgZWW5JfNYI7I7uYGfaQLdTJwVhrdDGqH00CHAnTb92gCMLldmd2fadvNdRZHI6Dko6Azkfmi2uSPrc33MtSBziN_iL4fqnj7UXEa0I1pQIsG9WqzFfXVIEi6A5mMrhq6f8hvwNwBqLAugC1nQMsOC7EtYZ2I6qTdwZnuorTWpBLu1t4XMfzH772mspxDi_1qVdPdEVnxjG-drvzepq0tLXY60SIPVwBr4YIgu7fn3iOj85WSptse1Q8i1aCVSZg469WE0-yopWYE00_kETylPzUmH4p74q1WzHuQzW886nYokKxBsnUUEIkBW-ad9nMJhyUFNwe0VoovxxJBG7XZK_BZdBERePUsJx6-rBcewXvFGdjAQMAHxCUvwup0Tr4nbhFSl5FAax5Hgmfvs14yi_OsmnX0iI5VX1GZNC9xqX2y_L0Dhc9x1-QWaW0L8jghSOwi3v-68DVy5RFSb8t0kjU5a09Ir6chdprK5Zq_HGmUqGc3CgMKMAoUKSZlp1CYKBH9g`;

        
        const httpGenneraAPI = axios.create({
            baseURL: 'https://api2.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenAPI
            }
        });

        const httpGenneraUsuario = axios.create({
            baseURL: 'https://enrollment.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenUser
            }
        });

        // let respCursos = await httpGenneraAPI.get('/courses');
        // let CursosGennera = respCursos.data || [];
        // // CursosGennera = CursosGennera.filter(c => c.name == 'ODONTOLOGIA');
        // let i = 0;
        // for(let curso of CursosGennera){
        //     console.log(`Processando Curso ${i} de ${CursosGennera.length}`);
        //     i++;
        //     curso['curriculums'] = [];
        //     let respCurriculo = [];
        //     let curriculo = true;
        //     let curriculoCount = 0;
        //     while(curriculo){
        //         try {
        //             respCurriculo = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums`);
        //             curriculo = false;
        //             curso.curriculums = respCurriculo.data || [];
        //             let x =1;
        //             for(let curriculo of curso.curriculums){
        //                 console.log(`Processando Curso ${i}. Currículo ${x} de ${curso.curriculums.length}`);
        //                 x++;
        //                 curriculo['modules'] = [];
        //                 curriculo['subjects'] = [];

        //                 let modulos = true;
        //                 let modulosCount = 0;
        //                 while(modulos){
        //                     try {
        //                         let respModules = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums/${curriculo.idCurriculum}/modules`);
        //                         curriculo.modules = respModules.data || [];
        //                         modulos = false;
        //                         let y=1;
        //                         for(let module of curriculo.modules){
        //                             console.log(`Processando Curso ${i}. Currículo ${x}. Múdulo ${y} de ${curriculo.modules.length}`);
        //                             y++;
        //                             // module['subjects'] = [];
        //                             let disciplinas = true;
        //                             let disciplinasCount = 0;
        //                             while(disciplinas){
        //                                 try {
        //                                     let respSubjects = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums/${curriculo.idCurriculum}/modules/${module.idModule}/subjects`);
        //                                     let arr = respSubjects.data || [];
        //                                     curriculo.subjects = curriculo.subjects.concat(arr);
        //                                     disciplinas = false
        //                                 } catch (err) {
        //                                     disciplinasCount++;
        //                                     if(err.message == 'read ECONNRESET'){
        //                                         console.log(`Nova Tentativa ${disciplinasCount}.`);
        //                                     }
        //                                     if(disciplinasCount >= 5){
        //                                         disciplinas = false;
        //                                         throw err;
        //                                     }
        //                                 }
        //                             }

        //                         }
        //                     } catch (err) {
        //                         modulosCount++;
        //                         if(err.message == 'read ECONNRESET'){
        //                             console.log(`Nova Tentativa ${modulosCount}.`);
        //                         }
        //                         if(modulosCount >= 5){
        //                             modulos = false;
        //                             throw err;
        //                         }
        //                     }
        //                 }
        //             }
        //         } catch (error) {
        //             curriculoCount++;
        //             if(error.message == 'read ECONNRESET'){
        //                 console.log(`Nova Tentativa ${curriculoCount}.`);
        //             }
        //             if(curriculoCount >= 5){
        //                 curriculo = false;
        //                 throw error;
        //             }
        //         }
        //     }
        // }

        // let resp = [];
        // let pessoas = true;
        // let pessoaTentativas = 0;
        // while(pessoas){
        //     try {
        //         resp = await httpGenneraAPI.get('/persons');
        //         pessoas = false
        //     } catch (err) {
        //         pessoaTentativas++;
        //         if(err.message == 'read ECONNRESET'){
        //             console.log(`Nova Tentativa ${pessoaTentativas}.`);
        //         }
        //         if(pessoaTentativas >= 5){
        //             pessoas = false;
        //             throw err;
        //         }
        //     }
        // }

        let TodasPessoasDoGennera = [
            'JANNIERES DARC DA SILVA', 'CLAUDIANA ANA DA SILVA', 'Jessica da Silva Siqueira ', 'MAICON DEYVISON NUNES DAS NEVES', 'Thaís da Silva Rezende', 'Lucas Viana de Araújo Pereira ', 'LUCIANA ÂNGELO BEZERRA', 'Carlos Renan Lopes', 'MOACIR MARQUES LEANDRO', 'Mirtes Iasmim Alves de Gois', 'Jéfferson Diêgo de Carvalho', 'JOYCE LEITE DA SILVA', 'KAIQUE SOARES ALMEIDA', 'TIAGO EMANUEL GOMES FERREIRA', 'Lívia de Souza Silva', 'ARMANDO LIMA JUNIOR', 'ANA INGREDY RIOS', 'EMERSON MOURATO CRUZ', 'MÁRCIO CLEITON DA SILVA', 'João Matheus da Silva Carvalho', 'JOSÉ ERLISON DO NASCIMENTO SIQUEIRA', 'Monike Marques de Souza', 'ANA CLAUDIA DE LIMA LEAL', 'SELMA ROSALVA BEZERRA ALVES', 'JORGE LUIZ NOVAES DE SÁ', 'SEBASTIÃO PÂNTA DA SILVA JUNIOR', 'JOSÉ DOUGLAS DA SILVA', 'KARLA THAYSA DA COSTA ANJOS', 'JOÃO VITOR ALVES OLIVEIRA', 'Danilo Vagner Feitosa', 'CILENE MARIA DA SILVA', 'Horácio Dativo Tavares Filho', 'Maria Aparecida Caetano da Silva', 'Andreza Jaqueline Pereira Siqueira', 'Márcio José Pereira Virgínio', 'ZENILDA RAYANE FIGUEIRÔA BURGOS', 'Edson Fontes de Lima', 'Beatriz Leite dos Santos', 'MANOEL GERALDINO DOS SANTOS NETO', 'ADRIANO GOMES TIMOTEO', 'Tássia Isis de Sá Barbosa', 'ROSIMERE DA SILVA LIMA', 'MARIANA ALVES DE ANDRADE', 'Rita de Cássia Conceição', 'MARIA LINDACI FERREIRA DOS SANTOS', 'ALÊSSY GOMES DE SÁ NASCIMENTO', 'JAÍNE MARCOLINO FEITOSA', 'FÁTIMA ELIANA DE CARVALHO BARBOSA', 'CARLA PATRÍCIA MARQUES DA SILVA', 'RENATA JÉSSICA DE OLIVEIRA SANTOS', 'JULIANA RAQUEL FONTES ', 'Aléxia Priscilla Santos Nascimento', 'Marina Gomes Araujo Silva', 'ADRIANO LEANDRO DA SILVA', 'JULIANA DE ANDRADE PEREIRA', 'Tayomara Dantas Carvalho', 'Cicera Karinna da Silva', 'Yalle Emanuella Alves da Silva', 'ADRIANO MANOEL DA SILVA', 'Tatiane Leite dos Santos ', 'CHIRLEIDE PEREIRA BEZERRA', 'Petrucio Alves de Carvalho', 'Ana Levina Pereira de Carvalho Nunes', 'ANTONIO FLAVIO DE LIMA', 'Kátia Kalline de Melo Marques Lima', 'JEFFERSON MACENA DA SILVA', 'VIRGILIO PEREIRA JUNIOR', 'NATHALYA DE SOUSA SANTOS', 'Jose Rodrigo da Silva', 'ADÃO EDEILSON DOS SANTOS', 'GEOVANI LOPES GOMES DE SÁ', 'Pedro Vinícius da Silva Queiroz', 'JÉFFERSON RUMMENIGGE ALVES PEREIRA', 'Layara Rayanne de Sousa Andrade', 'ADRIANO MARIANO DA SILVA', 'Victor Emanuel de Sousa Silva', 'SAMARA OLIVEIRA DE MAGALHÃES', 'FÁBIO LUIZ DE PONTES', 'MARIA CECÍLIA VIEIRA KRUEGER', 'Rita Jackeline de Brito', 'Isabel Cristina Souza Gusmão de Freitas', 'RODRIGO RODRIGUES LIMA CAVALCANTI NOVAES', 'Weverton Ramos Moura', 'Alysson Kelver Santos Amaral', 'GEZIEL LIMA DO AMARAL', 'OSCAR EDSON DE ARAÚJO TEOTONIO', 'ÉLIDA LASTORINE RABÊLO COSME', 'JAMILLY CAVALCANTE DE LIMA ALVES', 'ARTUR LEITE DE CALDAS NETO', 'ROMERO LEITE DE ARAUJO', 'LUCAS DE SOUZA AMARAL', 'MIRIAN NOGUEIRA GOMES', 'Matheus Lopes Melo', 'OLGA CAMÊLO DANTAS', 'ÍVINA CAVALCANTI ARAÚJO', 'ADRIANO DA SILVA LOPES', 'ADRIANO NUNES REGINO', 'ANDERSON ADAM QUEIROZ LIMA', 'Aparecida Bezerra de Andrada Magalhães', 'HYAN DICKERSON MOURA CARDOSO', 'BRUNA FIAMA GOMES DE CARVALHO', 'Jalison Alves da Silva', 'George Raniere Neves Campos Júnior', 'TAYNÁ BASTOS FREIRE MARTINS CÂNDIDO', 'ADRIANO OLIVEIRA BARBOSA', 'Isabela Ferreira da Silva Costa', 'GABRIELLA OLIVEIRA SOUZA', 'ANA GYSELE RODRIGUES TORRES', 'OHANA IRACEMA CESAR FERREIRA', 'FABRICIO BARBOSA DA SILVA', 'ALEX DE SOUZA MAGALHÃES', 'DIOGO DOS SANTOS SILVA', 'JORGE MIRON DE FREITAS', 'AUGUSTO BENTO DA SILVA NETO', 'Géssica Nayana Lopes da Silva', 'Jairon Machado Ferraz', 'CARLA MARQUES LIMA', 'JOSÉ FELIX LANDIM ALVES', 'Natália Pereira Magalhães', 'Daniela da Silva Santos', 'DÉBORA RUTTY DE SÁ VIEIRA SOUZA', 'Ana Carla Freire da Silva', 'JANAIRES FERREIRA DE REZENDE', 'Dryelle Daianne do Nascimento Pereira', 'WESILLYANE CÁSSIA DANIEL DE OLIVEIRA', 'Julia Yone da Silva Pereira', 'Amanda Vieira dos Santos', 'Dariana Paula da Silva', 'MARCÍLIO DANIEL BARROS', 'Maria Francieli dos Santos', 'Glaucia Cleide Maria de Oliveira Guedes', 'Rafaela Ramos dos Santos', 'MEIRIELLY CRUZ DOS SANTOS', 'ADRIANO REZENDE DE MELO', 'KAIQUE TALLES BELO VERAS', 'Ana Karen Gondim', 'DIÊGO JOSÉ FEITOZA CORDEIRO', 'Erikson Murilo dos Santos', 'ADRIENE LUIZA SENA DO MONTE', 'Ayana Darlla Pereira da Silva Gonçalves', 'Laís Rodrigues Viégas', 'Renato Eloi da Silva', 'LARISSA CAVALCANTI DO AMARAL ALMEIDA', 'Carla Paula Araújo Cavalcanti', 'Maria Lúcia Henrique Ramos', 'Allana Dark de Freitas Ramalho Pereira de Siqueira', 'FERNANDA DE SOUZA LIMA NUNES', 'ADRIANO VIANA BERNARDO', 'Maria Janice Ribeiro', 'LEONARDO PAULINO DE LIMA', 'GLAUCE EVANIÉLA RABÊLO COSME', 'NILZA MARIA DA SILVA GERMANO', 'THIAGO QUEIROZ FERNANDES NUNES', 'Aldenira Alves Brasil Godoy', 'TATIANE DA SILVA SÁ', 'WASHINGTON JOSÉ ALVES DINIZ', 'ELVIRA VERÔNICA PIRES DE MELO MORAES', 'Maiana Maria da Silva', 'JOSÉ VINÍCIUS DA SILVA LIMA', 'GEYBSON GUTTENBERG FERREIRA DA SILVA SIQUEIRA', 'TAÍZA NOGUEIRA BARROS', 'IARA LILA MARTINS AMARAL', 'CREITON IGO PEREIRA DA SILVA', 'Nadson Henrique Lucas Batista', 'CICERO MATHEUS DE LIMA SANTOS', 'JAÍNE ANDRESSA CÂNDIDO LEONARDO', 'DANIEL PEDRO ALVES DOS SANTOS', 'EVANDRO SILVA ALVES DE SOUZA', 'BRUNA DE SIQUEIRA BARBOSA', 'YURI PATRICK GOMES SILVA', 'Leyla Cristina Nicacio Borges', 'JAINY LARISSA ALCÂNTARA MENDES DE ALMEIDA', 'ELIABI ANTAS MARQUES CORDEIRO', 'Maria da Glória Pereira de Morais', 'Monalisa Aparecida da Silva', 'AMAURY SOARES DE BRITO', 'CARLA KALLYNE SANTOS NUNES', 'NATAN RODRIGUES FERREIRA', 'CRISTIANE DA COSTA FREIRE', 'Carlos Alberto Lima Barros', 'ADSON FRANÇA DA SILVA', 'Taynan Luiz Quinto dos Santos ', 'LÚCIO FLÁVIO SIQUEIRA LÉDO', 'Ariele de Melo Silva', 'MAYCOOL VITOR ALVES DE MELO', 'ADUILSON SOUZA DE OLIVEIRA', 'RUY SUZUKI PINTO RABÊLO', 'FABIANA CLÉCIA DA SILVA BARROS', 'JHEFERSON VINICIUS VÉRAS CRISTOVÃO FREIRE', 'Eduardo José Arruda Carneiro', 'WILLIANE BEZERRA LEITE', 'Jackson David de Brito Panta', 'ISRAEL MATIAS SILVA', 'JEFFERSON VICTOR GOMES RODRIGUES', 'Alan Avely Guabiraba da Silva', 'GEAN KLEBER CORDEIRO BEZERRA', 'João Vítor Lopes Bezerra', 'AÉCIO FLÁVIO ANGELO DE BARROS', 'FABRICIA RAYANE PEREIRA ARAÚJO', 'GABRIEL GOMES DE CARVALHO', 'Maria das Dores da Silva Cézar', 'Claudielani Tenório Valeriano da Silva', 'Mariane Queiroz Amaral', 'BRUNA EDUARDA ALVES LEAL DE SOUZA', 'João Batista Rocha de Lima', 'AÉCIO MORAIS BEZERRA ', 'Diego Gomes de Souza', 'MATHEUS SOARES SANTOS', 'Débora Oliveira Lacerda', 'LUCAS FRANCISCO RIBEIRO DA SILVA', 'Maria do Bom Conselho Batista da Silva', 'MARIA FRANCIANY PEREIRA DE LIMA', 'KEDYLA MIRIAN GENÉSIO NICÁCIO VIANA', 'Vaniely Sobreira de Lima', 'JOSEMIR RAMALHO DA SILVA JUNIOR', 'Lara Alice Antunes Catunda', 'JOÃO PAULO DA SILVA TEIXEIRA', 'Rhevilla Tayna Ferreira e Silva', 'Rayllane Ingrid Andrade Silva', 'AERCIO NUNES DE GOUVEIA', 'Amanda Alves Simão', 'AMANDA CAROLINE DE LIMA MELO', 'JULIANE DE SIQUEIRA BRASIL', 'GABRIELI INÁCIO BARBOSA', 'Elizabeth Cristina de Sousa Santos ', 'Fabrícia Freire Calaça de Sá', 'AUGUSTO DE MELO LIMA NETO', 'AFITONIO ANGELO DE LIMA', 'Jussara Belo Damaso', 'Joanny Karenn Alves Magalhães', 'RYAN BRITO BARBALHO', 'Paloma Danuska Bezerra e Silva de Souza', 'Bruna Maria Pereira Matias', 'Ana Paula Vieira Macedo', 'Síndel Stephany Araujo da Fonsêca', 'AFONSO ALEXANDRE DE CARVALHO', 'GILMARIA BEZERRA DA SILVA', 'LARYSSA TENÓRIO DINIZ', 'Hemylly Mycaelly Leandro Nunes', 'Jhully Souza dos Santos', 'Gustavo da Silva Cândido', 'MÁRCIA MALAQUIAS FREIRES XAVIER', 'Lívia Soares Lira', 'AFONSO ALVES DE ALMEIDA ', 'JAIFLÁVIO JAIME LIMA', 'TÂNIA PATRICIA LIMA PAIVA', 'Vinícius Gabriel Silva Morato', 'PEDRO EMANUEL DO NASCIMENTO BEZERRA', 'Ana Karolina Lisbôa Fontes', 'ROBERTA NATANIELLY SILVA CAVALCANTE', 'Renato Airton Vitório de Oliveira', 'MARIA EDUARDA BARROS GODOY', 'LEIDILÚCIA ALMEIDA DINIZ', 'JULIANA BENVENUTO MADEIRO MOURA', 'AFONSO ARCÔNCIO DE MAGALHÃES', 'Renata Vitória de Sousa Aguiar', 'ELLYSON PATRICK AFONSO DE SOUZA OLIVEIRA', 'FELIPE FERREIRA DE ALMEIDA CRUZ', 'BRUNA FERNANDA DOS SANTOS', 'AFONSO BRASILINO DA SILVA', 'BRUNA FILGUEIRA MATIAS', 'ANA CAROLINE ANGELO DE SOUZA', 'Ana Lúcia Ferreira dos Santos Teixeira', 'Carlos Bruno de Lima Nascimento', 'AFONSO FERREIRA NUNES', 'Francilene Fidelis Galdino de Sousa', 'ÉRICA RAOANE DE SOUZA SILVA', 'Paulo Cesar Nunes do Nascimento Junior', 'CHARLES VICTOR DE SOUSA', 'AFONSO GOMES NOVÃES', 'GABRIEL MENEZES NOGUEIRA', 'CÍNTHIA ADRIELY GOMES DE LIMA', 'Guilherme Henrique de Queiroz', 'Aiany Simone de Melo Moura', 'AFONSO JOÃO DE FLORA', 'VÍTOR HUGO BEZERRA DE SOUZA', 'ÍNGRID LAÍSY MEDEIROS DE LIMA OLIVEIRA', 'Matheus do Nascimento Rabelo', 'João Lucas Nascimento Leão Fagundes', 'AFONSO JOAQUIM DOS SANTOS', 'Brenda Aurélia de Lima Figueirêdo Laranjeira', 'NAYARA RICHELLY BARBOSA BEZERRA', 'JEAN PATRÍCIO DE SOUZA VIEIRA', 'PAMELA WALESKA COSTA GOMES', 'Juliany Bezerra dos Santos', 'JOSÉ HENRIQUE BATISTA DA SILVA', 'José Gabriel Gomes Pereira', 'ANA LETÍCIA FEITOSA NEVES', 'Santiago Barbosa Sampaio', 'ADAILTO SIQUEIRA CORDEIRO', 'GUSTAVO HENRYQUE DE ASSIS LIMA', 'KÁTYA SUELY PATRIOTA DE MEDEIROS', 'Isadora Cristina Rodrigues de Medeiros', 'LUIZ CARLOS FERREIRA DE BARROS JÚNIOR', 'WANESSA MARÍLIA BEZERRA PEREIRA SOUZA', 'GLAUBER ROBSON PIRES DE CARVALHO LIMA', 'ABELARDO DE CARVALHO CERQUEIRA', 'JEFFERSON DE MELO VIEIRA', 'Matheus Cavalcanti Bastos', 'Isabel Vitória de Araújo Costa', 'SARA VANESSA NOGUEIRA FEITOSA', 'ABIDIAS FRANCISCO DE MELO', 'MATHEUS NUNES BEZERRA ALVES', 'Thiago Pires Mourato', 'GABRIEL VICTOR CARVALHO SOUZA', 'José Elias Bezerra dos Santos', 'ANTONIO JEORGE GOMES DA SILVA', 'Vanessa Souza Ferreira', 'BRUNNA EMYLLY SANTOS SIQUEIRA', 'ABILDO SALVADOR DE ANDRADE', 'JAQUELINE FERREIRA DE LIMA', 'Antonio de Lisboa de Andrade', 'NAILSON PACELLI NUNES DE OLIVEIRA', 'Bruna Dinara Nazário Véras Pires Teotônio', 'ZULEIDE MARIA NAZÁRIO VÉRAS PIRES TEOTONIO', 'ELTON VALÉRIO PRAXEDES', 'Emannuel Victor de Marins Soares', 'ABIMELEQUE PEREIRA DE OLIVEIRA', 'Plácido Emanoel Severo Barbosa dos Santos', 'Clariana Oliveira Diniz', 'Yara Cavalcanti Freire Alves', 'ANICLESIA ALVES DOS SANTOS SILVA', 'ABRAHAO GODIM DANTAS ', 'THIAGO GONÇALVES DE OLIVEIRA', 'KÉDYSON RAYR ALVES COSTA', 'LALUCHA STÉFANNA MORAIS MENEZES ', 'ANA PAULA DA SILVA XAVIER', 'MAX LUIZ DOS SANTOS NUNES', 'FLÁVIO ANDRÉ PEREIRA LIMA', 'ÂNDERSON VINICIUS DE ARAUJO LIMA', 'Willian Digiorgio Moura de Carvalho', 'Renata Aparecida Rodrigues da Silva', 'Vitoria Regina Ferreira Campos', 'ABSOLON FERREIRA LUCAS', 'Julia Grazyella Rodrigues Magalhães', 'JULIANA MARIA DE LIMA', 'MONALISA OLIVEIRA DA SILVA', 'AMANDA VANESSA MOURA LINS', 'CAIO VICTOR DE LIMA LOPES', 'Ana Carla Campos Torres', 'Marialyce Alves de Oliveira', 'MARIA LEOSNANDA DA SILVA GUERRA', 'JOSE MARIO GUERRA DE LIMA', 'PEDRO RUAN MARQUES SIQUEIRA', 'Maria Eduarda Beserra Neves', 'Kamila Leonísia de Siqueira Ramos', 'Silke Ayane de Sá Souza', 'ACIDÉBIO DE ARAÚJO MARQUES', 'MARIA RAQUEL CAVALCANTE SIQUEIRA', 'ARLENE FERREIRA CALISTO SIQUEIRA', 'GUSTAVO DE SOUZA NOVAES', 'Natália Maria da Silva', 'Mylena Fabrícia Vieira Barbosa', 'Tatiana de Oliveira Albuquerque Lira', 'Victória Régia Souza e Silva', 'LUANA BEATRIZ RODRIGUES COELHO ', 'ACIDÉGIO DE ARAÚJO MARQUES', 'Mayra Darlene Morato da Silva', 'Vanessa Alves Queiroz', 'Kariny Mirelly Xavier Diniz', 'Bárbara Emilayne Pereira de Lima Santos', 'ADAELSON CARNEIRO AMARAL', 'Jackson José Sergio Vilela', 'Rafaello Fernandes de Lima', 'CARLOS ARMANDO ARRUDA CRUZ', 'EVERALDO CORDEIRO DA SILVA JUNIOR', 'Ramon Matheus Freitas Teotônio ', 'GIZELLE GALDINO BRANDÃO', 'HUMBERTO LUIZ CORREIA DE MEDEIROS', 'Milena Emanuela Nascimento Lima', 'Valdiene Alves Santos', 'DAIANY ALVES DE SOUSA ROCHA ', 'Maely Esteffane Guedes dos Santos', 'JOICY DAYANE MORATO PESSOA', 'MARCOS ANTONIO SARAIVA AMARAL', 'FRANCISCO VALDECY RODRIGUES NASCIMENTO', 'ALEX HENRIQUE DE OLIVEIRA BRITO', 'DENISE DA SILVA SOUZA ', 'JOANE CARNEIRO DE SOUZA', 'Aline Maria Simão Gomes da Silva', 'Regina Céli de Oliveira Pires', 'Laysa Regina da Silva Cabral', 'GUILHERME HENRIQUE FERREIRA DOS SANTOS CAMPOS', 'EDMILSON AMARAL HILARIO', 'Francisca Diony Pereira Simão', 'MARIA CLARA ACIOLY JACINTO', 'ANDRESSA KARINE TEIXEIRA LIMA ', 'Rita de Káscia Alves de Moraes', 'ELUIZ PEREIRA DE SOUZA', 'JULIA FERREIRA LIMA', 'Maria Thereza dos Santos Dantas', 'Laryssa Candida Viana', 'Luiz Paulo Nunes de Lima Júnior', 'JULIANA RODRIGUES PAIVA SILVA', 'Lucivania Bezerra Nunes da Silva', 'MARIA MILENA LOPES DE OLIVEIRA', 'PAULO ALVES DO NASCIMENTO', 'ADNAIARA AUGUSTA CAMPOS FLORENTINO', 'Eduarda Mendes Lopes', 'ABDIAS DIODATO LIMA', 'CARLOS RENAN PULÇA CARDOSO', 'Martinho Henrique Ramos da Silva', 'LORENA RAFAELA FERNANDES PALITOT', 'Ítalo Inacio Pereira de Menezes', 'SILBERTO LUIZ FERREIRA FORTUNATO', 'KLEBERTY KLÊMERY BARROS NUNES NOGUEIRA', 'JEEFFERSON CORDEIRO DE MELO', 'ABDIAS NUNES NOGUEIRA', 'BRENO XAVIER ARAÚJO', 'Cleytson Antonio Alves de Vasconcelos', 'JOSÉ PAULO ANTUNES NOVAES CAVALCANTI', 'JONAS FAUSTINO SOARES SANTOS', 'Arthur Medeiros Carlos', 'LAVOSIÊR MEDEIROS CARDOSO', 'AILTON DA COSTA MOURA FILHO', 'DOUGLAS WALLACE MUNIZ DE MELO', 'GEFFERSON ELTON DE CALDAS GALDINO', 'Sérgio Rodrigues dos Santos ', 'Kleyton Luis de Moraes Silva ', 'TIAGO ANTONIO DE CARVALHO', 'RODRIGO CLEIDSON NETO ', 'PEDRO HENRIQUE LIMA SANTOS', 'JOSÉ DE JESUS OLIVEIRA CALDAS JÚNIOR', 'Leocássia de Sousa Santos', 'ABDON DOS SANTOS NÉTO', 'Hermógenes Barros Gomes Júnior', 'Almir Rodrigues de Sousa', 'Josinaldo Leandro Barbosa', 'AMANDA TAVARES DA SILVA', 'LEONARDO SANTANA DE SOUZA', 'LEVI MIRANDA CAMPOS', 'Mikael Cristian Rosa e Lima', 'EDUARDO ALLEANDRO CARVALHO BENTO', 'Micael Wesley Medeiros de Moraes ', 'LAURA ARAÚJO FERRAZ DE MOURA MANIÇOBA MARQUES CRUZ ', 'Hugo Leonardo Leopoldo do Nascimento', 'ABEDIAS LUIS DA SILVA', 'Felipe Gabriel dos Santos Siqueira', 'FRANCISCO FERNANDES DA SILVA NETO', 'MATEUS RIBEIRO DINIZ MACIEL', 'EDNALDO EMILIO FERRAZ', 'Ariane Ângelo Guedes', 'Ana Beatriz Cordeiro da Costa e Silva ', 'Ítalo Ernando da Costa Moraes', 'LUCAS ALBINO DE SIQUEIRA SANTOS ', 'ABEL ALVES SOBRINHO', 'Maria Naiane Ferreira de Araújo', 'MAX HENRIQUE DA SILVA', 'CARLOS ALBERTO DA COSTA ', 'Gabriel Alcantara dos Santos ', 'JOÃO VICTOR FREITAS ALVES', 'Michele Gomes da Silva', 'Nayara Aline de Barros Lira', 'Paulo Suelyton Alves de Lima', 'JOSÉ OLEGÁRIO DE LIMA FILHO', 'IGO SOARES DO NASCIMENTO', 'ISAAC BARROS PEREIRA', 'CHARLLES REKSON BARBOZA DE LIMA', 'Valdeci Henrique Cavalcante dos Anjos', 'ABEL ANTÔNIO DE SOUZA', 'MARCYLA DE BRITO FERREIRA', 'Cláudio de Souza Menezes Filho', 'EVANDRO JOSE DA SILVA FILHO', 'RODRIGO LEAL DE SOUZA MENEZES MARTINS', 'WALLICE DA ROCHA PEIXOTO', 'ANTÔNIO NICÁCIO DE ANDRADE JÚNIOR', 'Ilana Maria de Menezes Ramos Freire', 'MATHEUS THÁLYSON TORRES MARQUES FREIRE', 'Luana Duarte Leite', 'HÉLIDA LARISSA CAVALCANTE ROLIM', 'Cintia Pereira dos Santos', 'WAGNER LOPES DE LIMA', 'JOSE MARIA BARBOZA', 'FLÁVIO GOMES DE SÁ', 'Maria de Lourdes dos Santos', 'Mayla Ariene Lopes de Barros', 'FABIANO EVANGELISTA DA SILVA', 'Weslley Rodrigues Nogueira', 'WEVERTON DIOGO GOMES RODRIGUES', 'FELIPE ALVES', 'Jaqueline de Sousa Lima ', 'VICTOR RAMON BERNARDINO NUNES', 'Tássio Wesley Lima Souza', 'MARIA WILLIANE LAÍS DE SOUZA ', 'Mônica Pires de Siqueira', 'Eliane de Caldas Pereira Lima', 'KERLA MARIA FREIRE DE OLIVEIRA', 'MARIA ELOÍSA SANTOS OLIVEIRA', 'Vitória Farias de Oliveira', 'Tatyanny Fidélix Epaminondas', 'Carla Larissa da Silva Nunes', 'ABEL MOREIRA DE ALMEIDA', 'ERBERT CLEBER MORENO BEZERRA JUNIOR', 'Ronailde da Silva', 'Flaviana Cecília Nunes de Oliveira', 'Anne Gabrielly Beserra de Almeida', 'ABEL NICÁCIO FERNANDES', 'Duana Angelo de Souza Santana', 'Taynara Guirra Melo ', 'Carla Roberta Gomes ', 'Maria de Lourdes Carvalho', 'AFONSO JUNIOR SOARES DA SILVA', 'Larissa Gabrielle Torres Príncipe', 'CLAUDJANE PATRIOTA GONÇALVES', 'Camila Gomes de Sá Ferreira', 'Nayara Kelly Rocha do Nascimento', 'AFONSO MARTINS DE SOUSA', 'Maria Aparecida da Silva', 'ANDRESA GABRIELA SILVA', 'Cristiano Hélio de Magalhães', 'ANDRESA FRANCYELLE NUNES SOUZA', 'Jérssica Vasconcelos de Queiroz Tenório', 'Deysiane Henrique de Carvalho', 'NATHÁLIA MEDEIROS DE SIQUEIRA CAMPOS', 'AFONSO NUNES DOS SANTOS', 'KATYANE KÉSSIA GONDIM DO CARMO', 'Larissa Miranda Vasconcelos de Sá Siqueira', 'Jefferson Jailson da Silva', 'Caroline Henriqueta Pires de Sá Torres', 'ANA VÍVIAN RIBEIRO FERRAZ', 'MARCU VINÍCIUS CAMPOS DA FONSÊCA E SILVA', 'Camila Cristina Magalhães Falcão', 'AFONSO SANTOS HOLANDA', 'Maria Isabel Alves Pereira Lima', 'Katy Thuanny Pereira de Sousa', 'HELTON VIANA GALDINO', 'GERCIANE BEZERRA DA SILVA', 'JÂMISON FERREIRA ALVES', 'ROMILDO FERRAZ JUNIOR', 'Damião Bruno Medeiros de Azevedo', 'Marcondes Melo da Silva', 'ROMUALDO DE CARVALHO FALCAO', 'DEISY FABIANA GOMES', 'Débora Alcantara Santos', 'RAFAELA DA SILVA NASCIMENTO', 'BRUNA WERIKA DE ARAÚJO ALMEIDA', 'Cláudia Limeira dos Santos', 'Patricia Maria Patriota Santos', 'ALANY JOYCE DE ALBUQUERQUE NÁRIO', 'THIAGO ARAUJO MARTINIANO', 'AFONSO SOARES LOREDO', 'FRANCISCO DE ASSIS DINIZ SANTOS JUNIOR', 'Inamara Adriana Diniz Santos', 'DANIELA RAYANE FLORENTINO MARIZ', 'MARIANA SOBREIRA RODRIGUES TAVARES', 'AGAEUDES SAMPAIO GONDIM', 'ARISTOTELES LIMA DA SILVA', 'SÍLVIO ANDRADE DE AMORIM', 'RAQUEL EMILIA DE LUCENA HENRIQUES', 'Gabriel Alves da Silva', 'Lucas Alves da Silva', 'CÉFAS MURILO MARTINS MOURATO', 'Alex André da Silva ', 'AGAMENON MENEZES DE SÁ', 'ANA PAULA DE SOUZA BARROS ALVES', 'MICAEL GONÇALVES FERREIRA', 'ANDRÉA FERREIRA DE SOUSA', 'Maria Eduarda Siqueira Lopes de Moura', 'AGASSIS ALMEIDA DA SILVA', 'JOYCE KERLAKYANN SILVA GOMES DE BRITO', 'HERMANO HENRIQUE FERREIRA DE CARVALHO', 'CICERO PEDRO DA SILVA', 'Caroline Kellinton da Silva Lima', 'BÁRBARA CAROLINY DOS SANTOS LIMA', 'JOSÉ BATISTA FILHO', 'Zaira Hellida Nunes de Souza', 'RENATA POLIANA DE LIMA ', 'JAIR GUSTAVO DO NASCIMENTO CIRINO', 'ERICK MATHEUS CAVALCANTE ALVES', 'AGENILIO CÍCERO DE SÁ', 'JAÍLA LINDAINÊS DE LIMA', 'Danielly Xavier Barros', 'Eva Lucília Patriota de Sá Jurubeba', 'JOSEANNE MARIANO ROCHA MACHADO', 'Nathália Vieira de Lima', 'LARISSA DE QUEIROZ NEVES ', 'Priscila Tatiane Freires Diniz', 'NATÁLIA LOPES DE CARVALHO', 'Yuri César Nascimento Dias', 'Keule Richele Alves dos Santos', 'ÉLISSON GOMES DE SOUZA', 'CAMILA FREIRE NOVAES', 'MAÍSA SALES DE SOUZA', 'VANESSA RAQUEL QUIRINO BEZERRA CARDOSO', 'EDUARDO FILIPE ALVES DE SÁ', 'VINÍCIUS EDUARDO FERREIRA GARÇÊZ', 'Verlaine Souza Nogueira', 'LUEDJA ESTIMA CAVALCANTI', 'DANIELLE MAYARA DA SILVA SOUZA', 'Letícia Gabriely Pereira da Silva ', 'AGENILIO SISERO DE SÁ', 'MARIA PAULA MODESTO VALÕES GOMES DE ARAÚJO', 'Jullyana Maria Martins da Silva Soares', 'SAMOEL JOSE DE SANTANA', 'MARCUS VINICIUS DA SILVA SÁ', 'Jéssica Maria Fragoso Cavalcante', 'EVERTON RODRIGUES DOS SANTOS', 'NAIARA LARISSA FREIRE DE MELO', 'ANDERSON HENRIQUE DA SILVA GOMES', 'Gabriel Alves de Barros', 'Eriton Gustavo Clementino', 'AGENOR ANTONIO DA SILVA', 'LEANDRO HENRIQUE MENDES BARBOSA DE SOUZA', 'ÉVERTON ÍTALO BEZERRA DA SILVA', 'HELBY RESENDE SANTOS', 'ROSINALDO MEDEIROS FREITAS', 'AGENOR BEZERRA DA SILVA', 'Idalina Bezerra Ferreira', 'MATHEUS LEAL DE LIMA', 'Rafael Batista Silva', 'Flámesom de Lima Florêncio', 'AGENOR CLAUDINO DA PENHA', 'CÍCERO BERNARDO DE LIMA', 'Ravelane de Oliveira Silva', 'Thales Henrique Rodrigues Amaral', 'WAGNER HENRIQUE FREIRE DE LIMA', 'WISLA VERNEANNY DA SILVA CARVALHO', 'JANAINA DOS SANTOS MORAES ', 'João Batista Nunes da Costa', 'Maurílio Gonçalves de Araújo Segundo', 'RAIMUNDO DE CARVARLHO DE SÁ NETO', 'VALLÉRYA CRISTINNA CARVALHO NOGUEIRA', 'Ana Raquel Ferreira de Souza', 'LEANDRO ALVES FRAZÃO BEZERRA ', 'Édson de Sousa Lima Júnior', 'AGENOR DE MELO LIMA', 'Lucas Ferraz Diniz', 'MATEUS AUGUSTO PEREIRA VARELLA', 'WAGNER DE FREITAS LYRA', 'ANTONIO GOMES DA SILVA JUNIOR', 'AGENOR DJALMA DO NASCIMENTO', 'HYGGOR DOS SANTOS VASCONCELOS', 'Geruza Izabele Gomes da Silva', 'GUILHERME LACERDA', 'CLÍSTENES GOMES DE OLIVEIRA', 'Adiel Silva Gomes', 'ANDRÉ FELLIPE GONÇALVES FERRAZ', 'Larissa Pereira Cardoso', 'Erick Matheus Siqueira Lima', 'Maria Hellen Silva Santos', 'Maria Isabella da Silva Moura', 'AGENÔR FRANCISCO DE MOURA', 'Thiago Freitas Ferreira', 'Bruna Maria Siqueira Morato', 'DIEGO INACIO DE MARIZ', 'Cícera Maria de Oliveira', 'MARIA ADEILDA GONÇALVES DOS SANTOS', 'Maria Laura Mendes Fernandes', 'MÔNICA FERRAZ PARANHOS BRAGA', 'MARCOS GLEYSON GOMES DE SÁ JÚNIOR ', 'Wellisson Rocha de Araújo', 'Rilton Rodrigues de Sá Souza', 'Jacianny dos Santos Pedrosa', 'Cícera Valéria Pereira Gomes', 'LUCAS SILVA PEREIRA MUNIZ', 'Mariana Gomes da Silva', 'JAMILY THAYNA LOPES DOS SANTOS', 'ANDERSON CARLOS DA SILVA', 'MARIA RONYADJA SOUZA LIMA', 'TALITHA SANTOS LIMA', 'THAINARA CALINE GOMES', 'Jefferson Leite Ferraz', 'ANDRIELLE SILVEIRA FONSÊCA', 'YONNE ARCELINA JURUBEBA RODRIGUES', 'Aprisla Kelly Vitorino de Lima', 'RENNAN VINICIUS FERREIRA DA SILVA', 'VIVIANE FERREIRA DE OLIVEIRA', 'Maisy Marry Nogueira Vitorio', 'Maria Wêgila Matias da Silva', 'PALOMA PEIXOTO BRASIL', 'Josenilda Gusmão da Silva', 'Jéssica Tatiane Bezerra Leite', 'ANA LUIZA DANTAS VICENTE', 'WESLEY DE MENEZES LEITE', 'Wanessa Willianny Freire de Lima', 'ECTON RAY LEITE DE MOURA XAVIER', 'AGENOR RAIMUNDO DE MELO', 'Maria Gorete da Silva Patriota', 'Lizandra Serafim Pereira', 'JOFFYLI VANDENBERG MORAIS RODRIGUES', 'Sara Natany Reis', 'EDUARDA TORRES GOIANA', 'Kamilla Bezerra de Souza Ferraz', 'HUMBERTO NERY MENDES BEZERRA', 'Elian da Silva Paixão', 'Shuênia Alécia Silva de Menezes Ribeiro', 'José Édson de Oliveira Vieira Filho', 'JAILSON JOSÉ DE SOUZA SOBRINHO', 'AGENOR SIMPLICIO DE GOIS', 'Maria Eloiza Pereira de Souza', 'IZABEL CRISTINA SANTOS FRANÇA', 'ANNY STELLA LOPES SANTANA', 'SUELENE LEAL DO AMARAL QUEIROZ BRASIL', 'Mirian Lopes Vieira Dantas', 'Ana Clécia de Sá Silva Santos', 'MARIA ISABELLA FERREIRA BEZERRA', 'ANA KAROLLINY BARROS E SILVA', 'Mariza Beserra dos Santos', 'CAIO VICTOR MENEZES CIRINO', 'MARIA CLARA DE SOUZA BOMFIM', 'Poliana de Souza Medeiros Santos de Carvalho', 'EMMANUELLE THAMARA BEZERRA DE OLIVEIRA', 'Wellington José Araujo de Lima', 'AGENOR TEODORO DE LIMA', 'KAYANY ELLEN DE SOUZA PEREIRA', 'Beatriz Siqueira de Menezes', 'Stela Fernanda Gomes dos Santos', 'CELIO DINIZ MACHADO NETO', 'LIVIA MARIA DA SILVA', 'CLARA HAVENA BARROS LEITÃO', 'Karolaine Fablícia Oliveira Brito', 'LARA HANA BATISTA DE ARAÚJO ', 'Edpo Rodrigo Leite de Moura Xavier', 'OTONI CANTARELLI DE CARVALHO', 'GUILHERME BARBOSA DE FRANÇA', 'MARIA BEATRIZ MENDES DE LIMA', 'DANIEL LUCAS ARAÚJO SANTOS ', 'Jâmerson Diogo Alves Alexandrino', 'JUNIANO ANGELO DA SILVA', 'ALLISSON AUGUSTO DINIZ BARROS', 'José Mateus dos Santos Tenório', 'MIKAELLY LOPES DA SILVA', 'Ádalo Rhuann Barbosa de Sousa Melo', 'DIEGO MOURA SOARES', 'MARIA SIMPLICIO DE ASSIS', 'João Victor de Melo Lima', 'VICTOR SÁ DE MELO', 'VANESSA DAIANE DA SILVA BESERRA', 'FERNANDA MICAELY DUARTE SANTOS', 'MATSON DOS SANTOS MACEDO CYSNEIROS', 'HELDER HENRIQUE RAMOS TORQUATO FERNANDES', 'José Gabriel Silva Souza', 'EDSON NUNES ROCHA JÚNIOR', 'Emilly Sarah da Silva Nascimento', 'MARIA CRISTINA DE MORAIS PEREIRA', 'Marcos da Silva Mendes', 'Lucas Ferreira da Silva', 'AGEU DE SOUZA GUERRA', 'Jéfferson da Silva Lima', 'Sarah Silvério Teixeira da Rocha', 'MARIANA ANTONIA CAMPOS DA SILVA', 'Emmanuele Raquel Araújo Muniz', 'AGEU DUARTE MONTEIRO', 'João Caio Pereira Rodrigues Melo', 'MARIA DE FÁTIMA CYSNEIROS DE CARVALHO', 'Caio Vinícius de Sousa Soares', 'PRISCILA NASCIMENTO DUARTE FERRAZ', 'AGEU MARINHO DA SILVA', 'DÁRIO FERREIRA DE ARAÚJO JÚNIOR', 'Raquel Siqueira Carlos Andrade', 'Lucas Maurizan Gonçalves Magalhães', 'LUCAS EMANUEL ALVES DA SILVA SANTOS', 'Marcos José do Amaral Souza', 'Cinthia Dalynne Silva Rezende', 'JOSÉ GABRIEL BEZERRA DA SILVA', 'AGEU RODRIGUES LIMA', 'Aldilânio Clevirson Nunes de Sousa', 'Hígor Nogueira Santos', 'AMANDA CRISTIANE SOUZA MOURA SILVA', 'Brenda dos Santos Tenório', 'AGMÁRIO CÉSAR ALVES DE SOUSA', 'ANTONIO VÍCTOR MAGALHÃES DE SOUZA', 'ANA MARIA CORREA DOS SANTOS', 'DAIANA DOS SANTOS SILVA', 'Isvaldo de Sá e Silva Júnior', 'LARA BEATRIZ SILVA SOUZA', 'GUSTAVO NUNES MONTEIRO', 'MARIA BRASILIANA DE ARAUJO SILVA NETA', 'Anna Caroliny Pereira Medeiros', 'Jamille Ellem de Siqueira Ferreira', 'JEANE KARLA DE MENDONÇA MOTA', 'CRISTINA GLÓRIA DE FREITAS ARAUJO', 'JOELDER SUELIO BRITO DE VASCONCELOS', 'Murilo Inacio de Melo', 'José Alexandre Alves Lopes', 'LÍVYA ANDREZA PEREIRA MOURA', 'PEDRO REGIS SILVA ALMEIDA', 'Tarcianne Rafaelle Bezerra Rodrigues Martins', 'AGNALDO ALVES DA SILVA', 'RÁKLEI RAFAEL FERREIRA LIMA', 'Jhennyfer Emmanuele Isabela Pereira Dias', 'Andressa Gabrielle Alves de Souza', 'NATÁLIA DOMINGUES DA SILVA', 'Bruna André de Almeida Alves', 'JOSÉ ANDERSON LOPES DINIZ', 'VITÓRIA LARISSA DE OLIVEIRA DIAS ', 'ÊNIO DANIEL LACERDA DO NASCIMENTO', 'Fabíola Capistrano Dias', 'ALYSSON CRISTIAN DE SOUZA BRASIL', 'MANOEL LOPES DA SILVA FILHO', 'MARIA SUMARLE DE LIMA CARVALHO', 'MAXCILENE DA SILVA MEDEIROS', 'MAYCON DOS SANTOS VIEIRA CLEMENTINO', 'CLAIANNY JHULIA QUEIROZ DA CRUZ', 'EMANUEL NUNES DA SILVA ', 'ROGÉRIA NUNES BELO DA SILVA', 'JESSE KELLY DA SILVA CANDIDO', 'RAQUEL VIRGÍNIA DE SOUZA', 'ADALVA DE MELO LIMA', 'MARIA LÍVIA DE SOUZA CRUZ', 'VITÓRIA EMMANUELLE LEANDRO DE SOUZA', 'LAIRTON DA SILVA ANDRADE', 'LAERCIO FERNANDO DA SILVA SANTOS', 'VANESSA TEODOSIO DA COSTA SANTOS', 'MARIA GABRIELA EFIGÊNIO ALVES', 'Brenda Camilly Santos Ribeiro', 'Johnson Kléber da Silva', 'PEDRO VITOR NUNES COSTA', 'LUISA RAQUEL LOPES ARRUDA', 'SILVANO GOMES DA SILVA', 'GISELLE CABRAL DOS SANTOS', 'ALECXANDRA CRUZ PEREIRA DE SÁ', 'JOSLEMBERG AUGUSTINHO DA SILVA', 'MARIA VITÓRIA MARQUES VIANA', 'ANDRÉ SANTOS DE ALMEIDA', 'RIVANEIDE LEANDRO DA SILVA ', 'MARIA EDUARDA BEZERRA DA SILVA', 'Priscila Kelly Néres de Araújo', 'RAÍSSA LACERDA AMANDO ALENCAR', 'WILLIAN GEORGE BRITO SANTOS', 'Luciano B.dos Santos-Restituição de Imposto de serviço de D.A.M', 'BRUNA NOVAES FERRAZ', 'FÁBIO MELO DA SILVA', 'CLARISSE RAPHAELA ALVES GUSTAVO', 'FERNANDA NATHASCHA PEREIRA DA SILVA', 'MAYRA LAÍS DO NASCIMENTO ROQUE', 'ANA LETICYA NEVES DOS SANTOS', 'JOÃO ANTONIO SOBREIRA DE LIMA', 'Aline Mourato Lima', 'GISELE DOS SANTOS LIMA', 'Emylaine Queiroz Dos Santos', 'MICAELA MARIA GOIS DA SILVA', 'DILMA MARIA DOS SANTOS SILVA ', 'JAYRARA CARLA DE SOUZA SIQUEIRA', 'MARISA CRISTINA DA SILVA SOUZA', 'ÁGDA MARÍLIA CARVALHO DE FREITAS', 'JOÃO CARLOS RITHELLY BARBOZA DE OLIVEIRA', 'Karla Suélen Lourenço Ferreira', 'MARIA ELIZÂNGELA FERREIRA DE SOUZA', 'THALIA SIMÕES VIANA', 'ERIKA ELLEM AQUINO ALVES', 'KARLYANNE SABRINE CIPRIANO DOS SANTOS', 'VITÓRIA DOS SANTOS MESQUITA', 'ADRIANO PEREIRA CAMPOS DE CARVALHO', 'LUCAS FERNANDES PIRES', 'MIRIAN HILDA DE LIMA GUERRA', 'IRLA MAIARA DE LIMA SANTOS ', 'POLIANA SHIRLEY AMARAL CARVALHO PINTO', 'ALEXANDRE HACAMONNE RODRIGUES BARBOSA ', 'RUANA AMERQUIDIA LOPES DE CARVALHO ', 'Rita de Cássia Gôde Melo', 'MARIA FERNANDA DA SILVA PEREIRA LOPES', 'EDSON SOARES DOS SANTOS', 'KAMILLA MONIK DE LIMA', 'ALESSANDRA DE MENEZES SOUZA SILVA', 'JAILSON CLECIO DE SOUZA', 'João Victor Zenaide Vieira Jurubeba Almeida', 'MARIA DA GLORIA GOMES DO NASCIMENTO', 'ANA LEOCADIA XAVIER VIDAL', 'LEILANE CÂNDIDO MARIZ MOREIRA', 'DANIELE DE SOUSA PEREIRA SANTOS', 'EMANUELA SOUSA DA SILVA', 'ANDRÉ FELIPE RODRIGUES DE MAGALHÃES', 'VICTOR RODRIGO FALCÃO RODRIGUES', 'YARA TALLYTTA DE SÁ', 'PÂMERA CORDEIRO DOS SANTOS FLOR', 'EDISLAYNE JISELLY DE SOUZA ALVES', 'CLAUDIANE LIMA DOS SANTOS', 'EDSON DE ANDRADE CABOCLO', 'MARIA APARECIDA GOMES DA SILVA', 'FERNANDO OTAVIO DOS SANTOS NETO', 'JAYRLAN JANILSON DA SILVA', 'JOSÉ ÍTALLO SEVERINO NUNES DALTRO', 'LUIZ GUILHERME AZEVEDO DE SOUZA', 'JOSÉ LUCAS REZENDE RODRIGUES ALEIXO', 'MARIA LUANA GUEDES FERREIRA', 'JONADES MEDEIROS DUARTE', 'EMYLAINE WILLYANA GOMES DOS SANTOS', 'MARTHA RAFAELLA MARINHO ACIOLY', 'VANESSA HELLEN GOMES DE CALDAS', 'THAÍS BARBOSA DO AMARAL ', 'MARIA HELLEN FERNANDES PAZ GOMES', 'THALIA MAYRA LEITE DOS SANTOS', 'YOHANNA STÉFPHANE HENRIQUES DA SILVA', 'KÁTIA VIVIANE DE ANDRADE CABOCLO', 'GABRIELLA BASÍLIO ROZA', 'CARMEM LÚCIA MAGALHÃES FERRAZ', 'LUAN DIÓGENES SILVA', 'HAVANNY LAYANNY SILVA SOUSA', 'MARIA ESTERFFANY FERREIRA GONÇALVES', 'MARIA LAURA BRASIL DA SILVA', 'CÍCERA DAIANE RODRIGUES DOS SANTOS', 'NATHÁLIA MENEZES CARVALHO ARCOVERDE DA ROSA', 'IOLANDA OLIVEIRA CAMPOS LIMA', 'ELOISA MARIA ALVES DA SILVA SANTOS', 'LEON RODRIGUES PEREIRA', 'JÉSSICA RAABE BARBOZA AZEVÊDO', 'EDNALDO LEÃO LOPES', 'MARIA JEANE CRUZ DA SILVA', 'LAYSSA DANTAS DE ANDRADE', 'IGOR RANIERY LIMA SIMÃO', 'BEATRIZ PEREIRA DOS SANTOS', 'MARIA VERONICE PEREIRA SOUZA', 'MATHEUS DUARTE DE SANTANA', 'MIKHAEL JOHAB DOS SANTOS AMARO', 'ÊMILY MAGALHÃES SILVA', 'GIORGIA CAROLINA ALBUQUERQUE GOMES', 'JOSÉ EMERSON MORATO LIMA DA SILVA', 'RAINARA CAVALCANTE TOMÉ', 'MARIA VITORIA DE LIMA RODRIGUES', 'KALLINE MAYARA DE SÁ SANTOS', 'EILSON GOMES NOVAIS', 'PRISCILA XÊNIA VÉRAS DA SILVA CAVALCANTE', 'DAVI BARROS CONSERVA BARROS', 'PEDRO HENRIQUE LUCIANO BEZERRA ', 'BIANCA VALDELICE SILVA COSTA', 'CARLOS EDUARDO FERREIRA MACIEL', 'ANTONIO GUSTAVO DA SILVA', 'LUIZA MOURA DE SOUSA NETA', 'LUÍS GUSTAVO DOS SANTOS LIMA NUNES NOGUEIRA', 'JOÃO ARTHUR KNIBEL MENDES DOS SANTOS', 'LAURA LISBOA GUEDES', 'JÉSSICA MENEZES SILVA ', 'JOSÉ RONALDO GONÇALVES FERREIRA', 'ANA CARLA ESTEVAM RAMOS', 'ADILSON SILVA GOMES', 'ESTER LAFAYETTE SIMÕES', 'ISAIAS ANDRÉ DE LIMA BEZERRA', 'FERNANDA PEREIRA DA COSTA', 'LARISSA STEPHANIE LIMA DE SOUZA', 'MARIA GRAZIELLY DE LIMA SANTOS', 'JÁFTA HELLANY COSTA E SILVA', 'JOÃO GABRIEL FERREIRA LIMA', 'TIÊ ESTEVÃO DOS SANTOS ALVES', 'MARCOS ANTONIO DE SÁ CANTARELLI', 'MARIA LUIZA GUERRA BASTOS SANTANA', 'NADILANE CARNEIRO DA SILVA RODRIGUES', 'JOSYVÂNIA VANESSA DE SOUZA LIMA FREIRE', 'LAYLA MYRIAN DE SOUZA MELO', 'JOÃO VITOR PEREIRA SANTOS', 'MARIA NICOLE DE ARAÚJO LIMA', 'QUERINO LUCIANO DE LIMA E SOUSA', 'ALBERT DEYLON DE SÁ TIBURTINO', 'EDUARDO DE JESUS SIQUEIRA NOVAES', 'INGRID GISELE E SOUZA SANTOS', 'JACONIAS LIMA DE QUEIROZ ', 'MAINÁ FERREIRA ALVES', 'PEDRO VINICIUS FARIAS DE OLIVEIRA', 'MARIA DA PENHA DE BARROS OLIVEIRA', 'FRANCISCA JACIANE DE SOUSA LIMA', 'MAYSA EDUARDA LIMA DE SOUZA', 'MARCÍLIO LIMA FERREIRA', 'DAILANE TÂMARA FERREIRA LOPES', 'MYLENA SAMYLI CANTARELLI TORRES', 'CELYANNE THAIS LACERDA DA SILVA', 'GEOVANA PEREIRA FERREIRA DE CARVALHO', 'MICHEL SILVA LOPES', 'LUCIANO SANTANA DOS SANTOS JUNIOR', 'FÁBIO RODRIGO FERREIRA LEITE SOUZA', 'CARLOS MAGNO NUNES GOMES', 'MANOEL GOMES DO AMARAL NETO', 'CARLOS CLEYTIANO DA COSTA', 'Joelyton José de Souza', 'LUCINEIDE VITO LOPES GAMBARRA', 'LUKAS FELIPE ALVES DE LIMA MOURATO', 'LUIZ HENRIQUE LACERDA DE SIQUEIRA', 'DJANEY FERREIRA VERAS', 'ADRINY ALVES DA SILVA', 'ANA CLARA FIGUEIRÔA DE VASCONCELOS', 'MICAELY RODRIGUES DE SOUZA AQUINO', 'LUIZ FELIPE SIQUEIRA ESTIMA', 'MARIA EDUARDA PINTO SIMÕES LEITE', 'MARIA VICTORIA PINTO SIMÕES LEITE', 'JANILSON JOÃO ALVES DE ANDRADE', 'ADRIÉLE MEDEIROS DE FREITAS', 'MARIA ELAIDE GONÇALVES DA ROCHA', 'FRANCISCO GONCALVES LOPES', 'ANA CRISTINA BARBOSA DA SILVA FERRAZ', 'ANA VITÓRIA DA SILVA DOS SANTOS', 'FERNANDA NAYRA TAVARES BEZERRA RABELO', 'DÉBORA SIQUEIRA PEREIRA VALÕES', 'CARLOS DOMINGOS DE ANDRADE', 'IURI JORDAN FREIRE', 'DANIELLE CAMILLE DINIZ DA SILVA', 'IRIS DIANDRA DA SILVA FERREIRA', 'LÍVIA GUEDES MOREIRA SANDES', 'ANA CECÍLIA BEZERRA', 'SKARLETY DE FIGUEIREDO PEREIRA', 'SARA VITÓRIA SILVA PEREIRA', 'DÉCIO PETRÔNIO DE LIMA FLORENTINO', 'VANESSA RANNA BARBOSA DINIZ', 'LÍVIA SUENNY DE LIMA MEDEIROS', 'CINTIA DE MEDEIROS SOUZA', 'ADAGENOU INÁCIO ALVES', 'MARIA KERLANE FERREIRA ALVES SIQUEIRA', 'CAMILA ÍSIS VIEIRA DA SILVA', 'HELEN REBECA FONSECA SILVA', 'VALÉRIA FERRAZ ARAUJO', 'ANA CLAUDIA DE MORAES SILVA', 'KAYLANE FREITAS DUARTE', 'MARIA LIVIA CAMPOS PEREIRA', 'ADRIANA KARLA GOMES DE OLIVEIRA', 'Mariza Rodrigues da Silva', 'MARIA TAYNARA LINO', 'MARIA ISABEL DE CARVALHO REFERINO', 'PEDRO AURÉLYO LYRA BARRETO', 'JAILMA QUARESMA DE SOUSA', 'MARIA NAELY DOS SANTOS MOURA', 'CÉLTON FRANKLIN MARTINS MOURATO', 'LÍGIA MARIA ALVES DE SANTANA', 'NATALIA PEREIRA FONTES', 'ERVELYN CRISLAINE FERREIRA DE MELO LIMA', 'LUÍS GUSTAVO RODRIGUES DE MORAIS', 'HELLEN CAROLINE SIQUEIRA SANTOS', 'BEATRIZ PEREIRA BARBOSA', 'JASNA JANYELLY DA SILVA', 'MARIA JÉSSICA BEZERRA DA SILVA', 'MARIA NATALIA DA SILVA LIMA', 'EVELLYN VITÓRIA DOS SANTOS SALES', 'AILTON FERRAZ DE LIMA', 'DÉBORA NATHÁLIA MORAES DE LIMA', 'MARIANA XAVIER DOS SANTOS TENORIO', 'MARCOS JOSÉ ALVES TELES', 'KLEIVERTH RHODRYGO ANDRADA SANTOS', 'AILTON FERREIRA DA SILVA', 'MARIA VITÓRIA GOIS FERREIRA DE SIQUEIRA', 'WELLEN PRSICILA DA SILVA DINIZ', 'Jakson Fabricio de Melo Silva', 'THIAGO CORDEIRO NUNES', 'AILTON FIAMMA NUNES DE OLIVEIRA', 'GRAZIELLE PEREIRA DA SILVA', 'JÉSSICA APARECIDA DOS SANTOS LIMA', 'ANA LUIZA PEREIRA MENDONÇA', 'ANA PAULA PEDRO DA SILVA', 'AILTON GOMES DA SILVA', 'GISLAINE REGINA DE LIMA MOURA', 'LUCAS GABRIEL RIBEIRO SANTOS', 'CLEYCE YNNARA ALEXANDRE MARQUES', 'DYNARA KYUSE BARBOSA PEREIRA', 'JANAINA LEITE SOARES DE MOURA', 'CARLOS AUGUSTO SOUTO BARROS', 'HAELYTON MAX CABRAL DA SILVA', 'SILVANA BARROS BEZERRA', 'IASMIN MARIA DA CONCEIÇÃO SILVA', 'ERICKA MARIA DOS SANTOS LIMA', 'ADAILSON LEOPODINO DE LIMA', 'ALIDA KELLY ROCHA DO NASCIMENTO', 'STHEFANY MARQUES DE LIMA', 'BRUNA LUEDJA OLIVEIRA DE MELO', 'MARIA HELLEN SANTOS LIMA', 'BÁRBARA ANTUNES MARCOLINO DO NASCIMENTO', 'THAYNA DOS SANTOS IZIDIO', 'MARIA GABRIELLY ALCANTARA DA SILVA', 'MANUELLY DA SILVA SANTOS', 'PATRÍCIA GONÇALVES MAIA', 'GIVALDO RODRIGUES DE MORAIS ', 'VANESSA PINHEIRO DE SOUSA', 'MARIA ILDA ANDRADE SILVA', 'RÚBEN CÉSAR DE MOURA FEITOSA BEZERRA ', 'MARIANA ALICE ALVES DE SOUSA ROCHA', 'WILLIADJA MARIA DE SOUZA SIQUEIRA', 'JOANA TAINARA MUNIZ', 'Ana Luisa Alves Lucena', 'THAYNNARA ALICE QUEIROZ PESSÔA', 'DHÉOVANA DE SÁ BARRETO LIMA', 'WESLEYANNE SOARES SANTANA', 'ANA CAROLINA LEAL SANTOS', 'MARIA EDUARDA BARROS PEREIRA', 'FABIAN KAROLINE FERREIRA LOPES', 'ADAILSON LEOPOLDINO DE LIMA', 'MARCOS VINÍCIUS FEITOSA DOS SANTOS', 'FELIPE SIQUEIRA DE MOURA', 'LETÍCIA DOS SANTOS SILVA', 'ANDERSON EMANOEL DE SÁ SILVA', 'RAYSLA MARIA RODRIGUES COSTA', 'PEDRO LUCAS DA SILVA COSTA', 'RAYSSA SUELLEN SOBREIRA BESERRA', 'ADAILSON PIRES DA SILVA', 'ANTONIO BEZERRA DA SILVA NETO', 'FAUSTINO FREIRE NETO', 'JESSICA MILENA ALENCAR BEZERRA', 'ÁGUEDA KAYLLA SILVA SOUZA', 'ADAILTO DE SOUZA FERRAZ', 'ANTONIO MATHEUS BEZERRA DE ANDRADE', 'ÊMILLY VITÓRIA OLIVEIRA DO NASCIMENTO', 'THAYLANNE AMANDA LYPP DA SILVA', 'KARLLA JACIELLY BARBOSA DINIZ', 'ADAILTON BARROS', 'MARIA FERNANDA DA SILVA SANTANA', 'AURISNEYDE RODRIGUES CHAVES', 'MANOELA DO NASCIMENTO RODRIGUES', 'PABLO EMANNUEL DE REZENDE FERREIRA ZUZA', 'AYRLLA VITÓRIA ALVES FREIRE DA SILVA', 'TATIANNE PAULINO DA SILVA SOUSA', 'MARIA TAINARA RAMOS LIMA', 'Nycolas José Brasiliano de Rezende Souza', 'JOSÉ NAILTON DA SILVA SANTOS', 'RAFAEL ALVES DA SILVA', 'ADAILTON BESERRA DA SILVA', 'HELOISA DA SILVA CORDEIRO', 'MARÍLIA DE SOUZA LEITE', 'MURILO COSTA BEZERRA ', 'ANDERSON DAVID DA SILVA LIMA', 'ERISON ELUIZ PEREIRA SOUZA', 'ISLANIO SALVIANO DA CRUZ', 'MARIA VITÓRIA PIRES DA SILVA', 'WILLIANE DANÚBIA OLIVEIRA GALVÃO', 'GABRIEL BEZERRA DA SILVA', 'ELTON BARBOSA DE SÁ', 'THAINARA THAILANNY NERYS FERREIRA', 'AILTON HENRIQUE DA SILVA', 'IZADORA PEREIRA LIMA', 'THIAGO DE SÁ BEZERRA DOS SANTOS', 'LUÃ CÉSAR GOMES GADELHA', 'GELYANE MEIRA TORRES', 'DANILLA BARBOSA DA SILVA', 'ELLEN EDUARDA GONÇALVES VASCONCELOS SOUSA SILVA', 'RAISSA MICAELY BARBOSA DINIZ', 'NAYDSON CARLOS DA SILVA SANTOS', 'ANA PAULA DE SOUZA', 'ÁDRIA FERNANDA ALVES DO NASCIMENTO', 'ALESSANDRA NAIANE  DINIZ DA SILVA', 'MAIRA BEATRIZ GONÇALVES DA CRUZ', 'ANA BEATRIZ PEREIRA DA SILVA', 'NATALIA DOS SANTOS SOUZA ', 'ANNA RAQUEL NOGUEIRA DA COSTA SOUZA', 'RAQUEL DE OLIVEIRA SILVA', 'FELIPE NATHAN MELO EPAMINONDAS', 'ADAILTON FERREIRA DA SILVA', 'CLARA CIBELE VIEIRA SILVA', 'MARIA FERNANDA GOIS FERREIRA DE SIQUEIRA', 'LUCIELE DOS SANTOS SILVA', 'THALITA RODRIGUES DE LIMA', 'MARIA REGINA GOMES DE LIMA', 'JOÃO VITOR SILVA MOURA FERREIRA', 'ÍTALO DE SOUZA FERRAZ', 'KAYKE OLIVEIRA ARAUJO', 'ANDRESSA GABRIELY DE MORAES SOUZA', 'BRUNNA THAMMY VALÕES MACIEL', 'IARA MARIA BEZERRA DA SILVA', 'ELEN IASMYN BARBOSA DE FRANÇA', 'DÉBORA CAMPOS DA COSTA', 'ADAILTON GOMES DE SOUZA', 'ANA BEATRIZ TAVARES DE LIMA', 'LAÍS ALVES SABINO', 'CECÍLIA SUÉLEN ARAÚJO DA SILVA', 'VANESSA BARBOSA DE LIMA', 'ADAILTON JOÃO DA SILVA', 'DANIEL GERMANO DE SOUSA SILVA', 'ISAAC ANTONIO HONORATO NUNES', 'EDUARDA MAREZZI PEREIRA RIBEIRO', 'ILÁRIA VITÓRIA DE SOUZA FREIRE', 'ADAILTON JOSÉ JUVINO PEREIRA', 'TASSIANA ARAÚJO DA SILVA', 'GIOVANA SIMÕES GISOLFI', 'VITÓRIA EDWIGES SARAIVA AMARAL', 'ERMANO JOSÉ DE SOUZA', 'GÉSSICA FABIANY DOS SANTOS PEREIRA', 'ADAILTON LAURINDO NUNES', 'ALINE LUEDJA GOMES BARBOSA', 'ANA RAQUEL MONTEIRO SOUZA', 'JANNE KEILLA DE SOUSA CARVALHO', 'ITAMAR CASSIANO MORAIS DE SOUSA', 'GIRLENE ROSILDA DE ALMEIDA REZENDE', 'KALINE DA SILVA MARTINS', 'JENNIFER LORRANY GOMES DOS SANTOS', 'MARIANA EVARISTO COSME', 'RENATA DE SOUSA E SILVA', 'ELIETE DE SOUSA MARTINS NICOLAU', 'CARLO GIOVANNI SIMONI FILHO', 'AMANDA CAROLINE SILVA MORAIS', 'MARIA REGINA NUNES FERREIRA', 'HUGO BERNARDINO NUNES', 'MARIA MARCELINA DOS SANTOS FERRAZ', 'ELAINE VITÓRIA ALVES DE OLIVEIRA SANTOS', 'BRUNO ERNANDO DOS SANTOS SOUZA', 'HELAINE DA SILVA CORDEIRO', 'ISABELLE BEATRIZ MIGUEL DOS SANTOS', 'KENNEDY DAVI SILVA SOUSA', 'DÉBORA CRISTINA GONÇALVES', 'AURYANY IASMIN DE SOUZA TELES', 'JULIO CESAR MONTEIRO PINTO DE CARVALHO', 'ELBER FREDISON SIMÕES DE LIMA', 'GISELY CARDOZO TIMOTEO DA SILVA', 'CAIO HENRIQUE QUIDUTE NUNES', 'LUIZ ANDRÉ DE SOUSA GENESIO', 'LAÍS GABRIELE DINIZ LIMA', 'LEONARDO DOS SANTOS FERREIRA', 'ALEXSSANDRA DA SILVA NASCIMENTO', 'JOSÉ MATHEUS FERREIRA DE QUEIROZ', 'LÚCIO MATHEUS DOS SANTOS SILVA', 'JOSÉ HERBERT FEITOZA AMARAL', 'JOSÉ BERNARDINO JÚNIOR', 'ANA BEATRIZ RABELO REZENDE', 'JOSÉ LUIS BEZERRA MARTINS', 'VICTÓRIA CAROLINE SANTOS RIBEIRO', 'ALVARO DENILSON FREIRES DE LIMA', 'ADAILTON NOGUEIRA DE SOUZA', 'JOSÉ ALLAN NEVES SANTANA', 'KAMILY MARINHO PEREIRA DA SILVA', 'ANNA JULIA GUIMARÃES GOMES', 'SIBELY STÉFANY DA SILVA', 'LILIAN DE SIQUEIRA ALMEIDA', 'RAISSA BARROS DA SILVA', 'FLÁVIA ALICE MIGUEL DOS SANTOS', 'ADAILTON PAULO DE LIMA', 'JESSÉ RODRIGUES DE ARAUJO MOREIRA', 'BIANCA DE AQUINO BATISTA DA SILVA', 'JAQUELINE RODRIGUES FERREIRA', 'EVELINE DA SILVA PEREIRA', 'MARIA LUÍZA VIEIRA DE MELO', 'LUCAS MESSIAS FARIAS LIMA', 'FRANCILENE RAMIRE DE SOUZA FERRAZ', 'MARIA GERLANE NICÁCIO', 'MÉRCIA BARBOSA RAMOS', 'ARLENE BERNARDINO LIMA', 'THAINALI LIMA DINIZ', 'EDYMARA RODRIGUES SANTOS', 'MILLENA ESTHÉFANY GOMES DE ALMEIDA', 'ADAILTON PEREIRA DE SOUZA', 'VANESSA NUNES DE LIMA', 'ARIANE DANIELI GOMES LINS', 'VITÓRIA EVELYN FREIRES DE MELO', 'MARIA JAKELINE DE MOURA SOUZA', 'CÍCERA CLEITIANE DE LIMA', 'CAMILA CRISTINA DA SILVA', 'KELLY BEATRIZ BARBOSA LIMEIRA', 'ADAIR FREIRE DO NASCIMENTO', 'JULIANA BARBOSA BEZERRA', 'CHAYANE GOMES DE BRITO', 'ANNY IALLY DE LIMA RODRIGUES', 'MARIA CAROLINE RODRIGUES ALVES', 'VANUZA GODEIA DA SILVA FERREIRA', 'MANOEL FERREIRA DA CRUZ JÚNIOR', 'MARIANA OLIVEIRA DOS SANTOS', 'LUÍSA GABRIELA DA SILVA', 'ALÍCIA  MARCELA RABELO AMARAL', 'GIRLEIDE DE JESUS OLIVEIRA', 'ADAIR JOSÉ DA SILVA', 'MARIA THEREZA DE FREITAS RODRIGUES OLIVEIRA', 'OZANA DINIZ DE LIMA', 'LÍVIA FABIAN ALVES DA SILVA', 'JULIANNY MIRELY SOUZA MARIANO', 'LUCAS HENRIQUE CLEMENTE PEREIRA', 'LUIZ HENRICK BATISTA MIGUEL', 'ILA JAKELINE MARQUES LIMA', 'SEBASTIANA JÚLIA NUNES CORDEIRO', 'LUCAS MICAEL DA SILVA SOUZA', 'GUSTAVO AUGUSTO CORDEIRO CONSTANTINO DOS SANTOS', 'ADAIR PEREIRA DO NASCIMENTO', 'GUSTAVO RAMOS FELIX', 'PEDRO EDUARDO PEREIRA MIGUEL', 'ALMIR JOSÉ DA SILVA FILHO', 'WELLYTHON PIRES DE SOUZA', 'MARCOS LUCIANO DE SOUZA RIBEIRO', 'VITÓRIA IMACULADA SANTOS GONÇALVES', 'MARIA ALICE NOÉ SANDES', 'JOSEANE VENTURA DA SILVA', 'ALCIR MIGUEL SOUZA E SILVA', 'Maria Larissa da Silva Nogueira', 'ELLEN COSTA DE SIQUEIRA', 'lucas nogueira souto maior', 'ANA LÍVIA QUIDUTE DO NASCIMENTO', 'ANNY KAROLINE VICENTE LEAL', 'TELMA TAYANNA DE SOUSA IZIDORIO', 'AMANDA VITÓRIA DOS SANTOS', 'KARINA PEREIRA GONÇALVES', 'ADALBERON FERREIRA DE LIMA', 'MATEUS AFONSO RIBEIRO DA SILVA', 'LUIZ EDUARDO FERREIRA CAMPOS', 'PEDRO HENRIQUE MACIEL SOARES ANDRADE', 'JOSE ERNANE PEREIRA DE SOUZA', 'ADALBERTO ALVES', 'JOHN CARLOS SANTANA DE MELO', 'MARIA LUIZA MOURA CAMPOS', 'KÁTIA DAYANE ALVES GOMES', 'NEYLA LARISSA ALVES DE LIMA', 'LÍVIA MARIA PEREIRA DE SÁ', 'TIAGO TELES DE LIMA', 'MAURILIO FABRICIO SIMÕES BEZERRA', 'MARIA BEATRIZ GUIMARÃES LIMA FERREIRA', 'RODRIGO SILVA E SILVA', 'EVELINE SOUZA LOPES DE BARROS', 'JOÃO CARLOS PEREIRA CARDOSO LIMA', 'KARINA MARIANNY DOS SANTOS LIMA', 'ALINE TAYANE GOMES DA SILVA', 'CLODOALDO FRANCISCO DA SILVA', 'FILIPE MATEUS FERREIRA GUERRA', 'ELISABETH DE FÁTIMA MATIAS PEREIRA', 'TAINARA DE CARVALHO SANTOS', 'JOSÉ SAULLO DA SILVA BARROS', 'CLARISSA RODRIGUES ALVES', 'ARIELI RODRIGUES FREIRE', 'ANA BEATRIZ PEREIRA DE MELO', 'ANNA VITÓRIA ALVES DOS SANTOS LIMA', 'ANA JÚLIA SANTOS DE ALBUQUERQUE', 'JOSÉ WICTOR GOMES DO NASCIMENTO SOUZA', 'BEATRIZ PEREIRA MOURATO', 'JÚLIA ARAÚJO SILVA', 'MATHEUS DE ALMEIDA GOMES', 'PRISCILA APARECIDA PEREIRA ARAÚJO', 'LÍVIA ESTER ALCÂNTARA REIS', 'MARIA SAMARA MEDEIROS DE MAGALHÃES', 'ADALBERTO ALVES FERREIRA', 'RAFAELA ROSA RODRIGUES PASSOS', 'ALANNA MICHELLE MAGALHÃES BARBOSA', 'TALYTA PAZ DA COSTA CARVALHO', 'LUÍS HENRIQUE MONTEIRO DE SOUZA GOIS', 'SILMARA NÉSIO DOS SANTOS', 'NÁJLA LEOBINO PERONIO', 'MILLANY EDUARDA MEDEIROS DE SOUZA', 'JESSICA GABRIELLY LEITE LEAL', 'MARIA LEONARDA GREGORIO SOUSA', 'ELSON JOSEVAN ALVES DE LIMA', 'JOSÉ FELIPE SANTOS DA SILVA', 'RAYANE LARISSA PEREIRA SANTOS', 'INGRIDD GABRIELLE OLIVEIRA TENORIO', 'EMANUELY CAVALCANTE FERREIRA', 'INGRID KAYLLANE SIQUEIRA DE ALMEIDA', 'DÉBORA STÉFANY DE MELO RODRIGUES', 'LUCAS CASSIANO DA SILVA LIMA', 'ADALBERTO CARLOS DOS SANTOS', 'JOÃO VITOR SIMÕES DE LIMA', 'CAIO HENRIQUE ALEXANDRE VALENÇA', 'MARIA EDUARDA ROSA GOMES', 'LARA DIAS NUNES', 'Rayanne Lorena Menezes Albuquerque', 'CAIO JOAN DE CARVALHO ALVES', 'LEIDINALDO AGENOR DE MELO', 'ALEX RODOLFO DA SILVA FEITOZA', 'GELSON DE SÁ LIRA FILHO', 'MAGNO ALVES DA SILVA VIEIRA', 'JULIA MOURA  FEITOSA', 'PEDRO EMANUEL DE MEDEIROS SANTOS', 'JANDERLAN JANILSON DA SILVA', 'DANIELL HENRIQUE QUEIROZ DE LIMA', 'ITATIANO SALVIANO DA CRUZ', 'RAWÂN PABLO FREIRE CAVALCANTE', 'WARNER MASUETO ZACHARIAS DE SIQUEIRA', 'ALLESON MICHAEL DE ALENCAR MOURA', 'VITÓRIA MIRANDA QUEIROZ', 'EDUARDO BORGES PEREIRA PRIMO', 'JOSÉ ALISON DA SILVA MELO', 'IVANILDO NUNES DA SILVA JÚNIOR', 'IVANALDO JOSÉ DA SILVA', 'ANA CARLA ALVES DE MOURA', 'WESLEY THYAGO FERREIRA JARDIM', 'JOSÉ EDSON DA SILVA CORDEIRO', 'TARCÍSIO CÁNARIO DA CRUZ', 'ANA BEATRIZ CARVALHO MACHADO', 'ANA BEATRIZ MUNIZ DE BARROS AMARAL', 'STÉFANNY VICTÓRIA FERNANDES DOS SANTOS', 'VANESSA DE FARIAS TIBURCIO SANTANA', 'ADALBERTO GOMES DA SILVA', 'ANA BEATRIZ DE LIMA VALÕES', 'VIVIANE GOMES CAVALCANTE', 'MARIA RAYSSA DE SANTANA CAMPOS', 'NATHAN MARCELL ANTUNES TEODORO E SILVA', 'JOÃO MARCOS FERRAZ BARBALHO', 'JÚLYA SILVA BEZERRA DE LIMA', 'JÚLIA VITÓRIA LIMA RODRIGUES', 'MAYRA GABRIELE ALVES DE MELO', 'SABRINA STHEFFANY RABELO GERONIMO', 'MARIA VITTÓRYA ALVES PEREIRA', 'ADALBERTO JOSÉ DE CARVALHO', 'NATHÁLIA GABRIELY DO NASCIMENTO ALMEIDA', 'JOSÉ SOARES DA SILVA NETO', 'PEDRO AUGUSTO GOMES BARBOSA DE ANDRADE', 'PEDRO GUILHERME LIMA PIRES', 'ADALBERTO JOSE DE LIMA', 'MARIA CECÍLIA MENESES ARAGÃO', 'KLEIDISON IGÔR ROSA E LIMA', 'EMANUEL ROBSON DE MAGALHÃES GAIA', 'Glenda Kailany Carvalho Fonseca', 'ADALBERTO JOSÉ DE LIMA', 'ISABELA TEREZA RODRIGUES DE MEDEIROS', 'GUILHERME HENRIQUE PEREIRA DE MELO', 'ADRIANO DA SILVA MONTEIRO', 'YSTEFANY CAROLAINE DE LIMA', 'JOSÉ EDUARDO RODRIGUES DOS SANTOS', 'DAVID MAX ALVES SOARES', 'MARIA URSULLA SILVA CAVALCANTE FERRAZ', 'Benedito Menezes Alves Diniz Ferraz', 'MIQUÉIAS DAVI REIS PEREIRA DE SOUZA', 'CAMILA MENDES PRAXEDES', 'ANA LUIZA DE LIMA E SILVA', 'MARIA ANTONIA NASCIMENTO NOGUEIRA', 'CECÍLIA NUNES DA SILVA', 'JOÃO PAULO RODRIGUES DA SILVA', 'IRAN JOSÉ NUNES FRANCISCO SOBRINHO', 'MAÍSA EDUARDA ALVES ANDRADE', 'ADALBERTO JOSE OLEGÁRIO DE LIMA', 'VITÓRIA MAYANE RODRIGUES DA SILVA', 'AURICÉLIA DA SILVA ALVES', 'DANIELA LOPES GUIMARÃES', 'ANA CAROLINE DE SOUZA BARROS', 'MARIA AUGUSTA TORRES VIRGINIO', 'DANIELA DA SILVA LEANDRO', 'KÁTIA SWELLEM DE LIMA', 'LAYSA BARBOSA DOS SANTOS', 'ANA CLARA CORREIA DE CARVALHO', 'BRENDA LARYSSA DO NASCIMENTO CANDIDO', 'ADALBERTO LEANDRO LIRA', 'TAYNARA VICTÓRIA DE SOUSA IZIDORIO', 'ABÍLIO FERREIRA DA SILVA NETO', 'GIOVANNA MARIA DA CRUZ CAMPOS LIMA', 'CAMILA MICHELLE DA SILVA', 'ADALBERTO LUIZ DE OLIVEIRA', 'RAYANE MIRELLE  DE ALBUQUERQUE MEDEIROS', 'MARCOS WILLIAN FERREIRA DA SILVA', 'MARCOS ALBERTO PEREIRA', 'ALYNE VICTORIA ALCANTARA SILVA', 'SARA PRISCILA DOS SANTOS NOGUEIRA', 'BIANCA ALVES DE SOUZA', 'RAYZA ESMERALDA PEREIRA BARBOZA', 'NÚBIA MARIA FERREIRA DA SILVA', 'YARITZA MARIA DE LOURDES VIEIRA DA SILVA', 'EVELINY DAISY PEREIRA ROMÃO', 'MATHEUS GUSTAVO LINA DE OLIVEIRA', 'JOSÉ ALEX DA COSTA SERAFIM', 'ADALBERTO MARTINS DA SILVA', 'EDCLEBYSON LUCAS DO NASCIMENTO PADUA', 'SABRINA PEREIRA DA SILVA', 'ISLAIANE TAMIRES DE LIMA', 'AMANDA GABRIELLY BRITO RAMOS', 'ADALBERTO MOACI GOMES', 'VITÓRIA GABRIELA BRITO RAMOS', 'GIVANILDO NUNES DE BARROS', 'CARLOS JAIRDYSON LIMA FERREIRA', 'MATEUS CICERO BEZERRA DA SILVA', 'ADALBERTO NOGUEIRA GOMES', 'JHONANTAN CUSTÓDIO DO AMARAL', 'FRANCIMERIO FRANCISCO DA SILVA', 'WELLINGTON PEREIRA SANTOS', 'ED-ERBSON LOPES DOS SANTOS', 'LUANA FERNANDA BEZERRA GOMES', 'YURI KAWAN SALES DOS SANTOS', 'ALYSON CARLOS HENRIQUE SALES', 'ADALBERTO PEREIRA DE SOUZA', 'NATÁLIA BATISTA DE FRANÇA', 'RAFAELA LEITE BARROS DE LIMA', 'JOYCE DE LIMA SILVA', 'IRLA CLEMENTE GONÇALVES', 'EMYLLENE PEREIRA SANTOS', 'FLAVIA PORTO PEREIRA DE VASCONCELOS', 'LARA STEFFANY DE MÉLO SILVA', 'VALÉRIA AMARAL ARAUJO', 'LUCAS VIANA LIMA DE MACEDO', 'KELYANE FERREIRA COSTA DA SILVA', 'THAYANE NUNES FERNANDES', 'BRUNA FEITOSA DE BRITO ', 'MARIANA DE LIMA ATAÍDE DA CRUZ', 'CYNARA FERREIRA SOUZA ALMEIDA', 'SARA MACEDO DOS REIS', 'GISELLE DE SOUZA COSTA', 'DHOMINI GUSTAVO RAMALHO SIQUEIRA', 'MARIA ESTELA ALVES DOS SANTOS', 'BIANCA CAROLINE FAUSTINO DE OLIVEIRA', 'RAYANA NAYARA BATISTA DE MELO ', 'JOSÉ ANDSON QUEIROZ DE MORAES', 'LAÉRCIO VICENTE  DA SILVA JÚNIOR', 'JEZREL DOS SANTOS SIQUEIRA', 'LUIZ FERNANDO LIMA BARBOSA ', 'ARTHUR HENRIQUE DE SÁ FERRAZ MELLO', 'MARIA EDUARDA DA SILVA SOARES', 'DOUGLAS EMANUEL ALVES DE REZENDE', 'MARIA CLARA FRANCISCO DE ANDRADE', 'DIÊGO  EDUARDO GOMES DA SILVA FREIRE', 'DAYANE MATIAS LOPES', 'THALYTTA CRISTTINA ROQUE DA SILVA', 'Janaína Limeira Soares', 'BRUNA ELOISA DA SILVA', 'ANA ESTER PEREIRA MEDEIROS SANTOS', 'SAMIRA ELEOTERIO DA SILVA', 'FRANCISCO JONAS PAULINO BEZERRA', 'ARIANE BEZERRA DOS SANTOS', 'RENATA GEISE ALVES LOPES', 'JOÃO LUCAS MUNIZ CORDEIRO', 'MARIA ELOIZA PEREIRA DE LIMA', 'ADRÍCIA DE ARAUJO EVANGELISTA', 'JADIAEL FERREIRA DANTAS', 'PATRÍCIA DE MENEZES BARBOSA', 'ANNA LUIZA ALVES DE ASSIS', 'LEANDRA FREIRE DA SILVA', 'LÍGIA CASSIANA LEÔNCIO COSTA', 'KESLEY CAIQUE LEÔNCIO COSTA', 'MARIA CLARA DA SILVA SILVEIRA', 'ADALGENOR GOMES DA SILVA', 'LUZIA VANESSA VITORINO ISIDRO', 'LILIANE MARIA TEIXEIRA DA SILVA', 'JAEDNA MARIA SIQUEIRA QUEIROZ DA SILVA', 'STEFANY LOPES DOS SANTOS', 'IDA CAROLLINA GAZEL SOARES', 'LAYANNE OLIVEIRA GOMES DE LIMA', 'ROBERT RODRIGUES DE MARIZ', 'ANALIA HENRIQUE ALVES', 'ELEN NAIARA FERRAZ FONTES', 'JOSEFA ESTÉFANI PEREIRA GUIMARÃES', 'ADALMI FREIRES DE ALENCAR', 'PEDRO MYCAEL REMÍGIO MORAIS', 'MARCUS VINICIUS DA SILVA CALADO', 'LUCIEUDO PEREIRA FLORENTINO', 'SHANGELA DE SÁ CARNEIRO', 'ADALMIR FREIRES DE ALENCAR', 'ALANE FELIZARDO VANDERLEI', 'MARIA FERNANDA EPAMINONDAS DE CARVALHO RIBEIRO', 'ANA PAULA ALVES BEZERRA                          ', 'JAMYLLE ANDRIELLY ALVES MUNIZ', 'ADALMIR LEITE CARVALHO', 'ANA MEL GONÇALVES LEITE', 'RAYANE MARIA NUNES VITÓRIO', 'MARIA FERNANDA XAVIER OLEGÁRIO', 'MANOEL KAIQUE LOURENÇO DE LIRA', 'LUCIENE DOS SANTOS ALVES', 'LUMA RAYSSA FERREIRA GOMES', 'CYRO GUTEMBERG ALVES DINIZ DE CARVALHO', 'JOCIEL WAGNO DOS SANTOS', 'ISADORA DE LIMA TELES', 'YASMIN ALMEIDA DE PÁDUA', 'Lívia Siqueira Ribeiro', 'MARIA GABRIELE ALVES FERREIRA', 'MYKAELLY LORRANA ALVES DA SILVA', 'NÚBIA MARÍLIA PINHEIRO VÉRAS DIAS', 'KAUANY KELLY LEITE DE ALMEIDA', 'BRUNA MARIA FIDELIS', 'TAYS IALLEN SOUSA DE CARVALHO', 'PAMELLA ANTONELLA DA SILVA COSTA', 'KAMILLY FERREIRA MOURATO', 'DANILO PEREIRA DA SILVA RIBEIRO', 'HERICLES TAYLLOM NUNES SILVA', 'IAGO MOURA DOS SANTOS SIMÕES', 'DEYVIDSON MATHEUS MARIANO DA SILVA', 'CAIO DO AMARAL LOPES', 'DEIVID EVERTON SEVERO DE SOUSA', 'AYLTON KELLYTON  DOS SANTOS TEODÓSIO', 'ELIELSON GABRIEL DE SÁ SANTOS', 'RAYANE ALVES DA SILVA', 'THAIS GEOVANNA DE ALMEIDA SILVA', 'ANDRESA MARIA DE SÁ SILVA ', 'VICTOR GOMES DE ARAÚJO', 'TAÍSLA MARIA PINHEIRO DA SILVA', 'JUSSARA MARIA DA SILVA NUNES', 'KAEDSON RANYELLY DOS SANTOS ALMEIDA', 'RUAN LEONARDO ANTAS', 'THIAGO MIGUEL DOS SANTOS CABRAL', 'JOSÉ ADRIANO ALVES OLIVEIRA SOBRINHO', 'GABRIEL SOUSA QUEIROZ', 'ADAMILTO SOBRAL CORDEIRO', 'PABLO CHRISTIAN LOPES DE SIQUEIRA', 'AFONSO ARAÚJO HOLANDA', 'MATHEUS AUGUSTO GOMES GONÇALVES', 'ANA MARIA SANTOS PERAZZO GÓES ', 'AMANDA DO NASCIMENTO PAZ', 'KATHLEEN DE OLIVEIRA CAVALCANTE PIRES', 'EWERTON ELLIAN SOUSA RABÊLO', 'NICOLLY MARTINS DUARTE', 'ISADORA RODRIGUES GUERRA', 'JOSÉ RENAN CLEMENTE PEREIRA', 'BRUNA MIKAELLY NUNES BASTOS SANTANA', 'LETÍCIA VIEIRA DA SILVA', 'DIEGO DE SÁ FERREIRA', 'ARIELE LORRANE DE SÁ SANTOS', 'LAIS NUNES DO NASCIMENTO', 'GUILHERME GASPAR LARANJEIRA', 'CLAUDIANA BARBOSA DA SILVA', 'DAYANE XAVIER DE SOUZA FRANÇA', 'JANE FERNANDES DE AQUINO', 'FERNANDA VALÉRIA DE SOUSA', 'EDINALDO CORDEIRO DE SIQUEIRA', 'PEDRO LUCAS LACERDA CAMPOS', 'JOÃO PEDRO DE SOUZA GUEDES', 'PEDRO HENRIQUE VITORINO GOMES', 'JÚLIO CÉSAR DA SILVA SANTOS', 'ELLEN FLÁVIA DE MELO SILVA', 'LARISSA LIMA AMARAL', 'THOMAS OLIVEIRA DE BRITO GOMES', 'MANUELA NUNES DE LIMA', 'YHALLE LUISA BARBOSA DE MORAIS SILVA', 'LUCAS CARVALHO ALVES', 'ARYANA SOUSA DA SILVA', 'SONEIDE LOPES GUEDES', 'AMANDA BENVENUTO VIEIRA', 'ANA RAQUEL VERAS MARINHO CORDEIRO', 'LUZIA GOMES DE LIRA', 'ALEX SANTOS DO NASCIMENTO', 'ADAMILTON FARIAS DA SILVA', 'ÁRILA KETHYLLE MARQUES LIMA', 'IARA GABRIELE MAGALHÃES RAMOS', 'ISADORA KAILANNY FERREIRA DE SOUSA', 'TAYNÁ DE LIMA SILVA', 'ADAMIR ALVES', 'ERICK MATEUS PEREIRA MARQUES', 'ANA BEATRIZ XAVIER BELARMINO', 'EMANUEL AZEVÊDO BEZERRA', 'FABIANA MARIA DA SILVA', 'ADÃO BARBOSA DOS SANTOS', 'LAYLA CAROLINE LINO DA SILVA', 'ANA ROSA PEREIRA DE ALMEIDA ESTIMA', 'ADRIANA DA SILVA LIMA', 'MICAELLA CHAVES ANDRELINO', 'DAYSIELLE MARIA DE LIMA', 'MARIA SUZILENE NUNES DE LIMA', 'SIMARA SOUZA SILVA', 'MARIA LUIZA SOBREIRA GOUVÉIA', 'GREYCYELA MARIA TORRES DA SILVA', 'MARLI BELARMINO BELIZÁRIO DE LIMA', 'SUENE CÂNDIDO MEDEIROS LEANDRO', 'MARIA JOSÉ NUNES DE SOUSA', 'CRISLANE XAVIER ALVES', 'PÂMELLA RODRIGUES DOS SANTOS', 'HELEN MILENA  BARROS DE LIMA', 'JANIÊ CAVALCANTE BISERRA FIRMINO', 'MARIA APARECIDA MAGALHÃES DE SOUZA', 'AYLLA GOMES CANTARELLI', 'ALLYSON RUAN DE OLIVEIRAFERREIRA', 'DIEGO MONTEIRO CONSERVA DE SOUZA', 'DENISE VIANA ANDRADE SILVA', 'TATIELY DE ALMEIDA BELARMINO', 'ALINE CAROLINE BEZERRA DE REBOUÇAS', 'MARYA ANYEDYA DE OLIVEIRA', 'THIAGO ROBERTO CAMPOS DE LIMA', 'DANILO DOMINGOS LEITE', 'JÚLIO CÉSAR DOS SANTOS BARROS', 'ANA BEATRIZ MACHADO DO NASCIMENTO', 'LUCAS EMANUEL LIMA QUEIROZ', 'LUIZ HENRIQUE MORAIS DE QUEIROZ', 'WESLEY ALENCAR DA SILVA', 'LUIS EDUARDO BEZERRA DA SILVA', 'IANA LARA RODRIGUES CERQUEIRA', 'EDSON BARBOSA DE ARAÚJO NETO', 'LUANA CRISTINA VALÕES DE SOUZA', 'KALINE OLEGÁRIO DE OLIVEIRA FERREIRA', 'ADÃO CLEMENTE NETO', 'ISABEL DE SOUZA CAVALCANTE', 'HENRIQUE RODRIGUES BARROS', 'RENATA MARIA DE SOUZA', 'ADRIELE MELO DE VASCONCELOS', 'ANDRÉ LOPES DE OLIVEIRA JÚNIOR', 'JOSÉ FILIPE LOPES DE ANDRADE', 'HELOISA ELAYNE DA SILVA', 'ADÃO DE BRITO PEREIRA', 'DANIELLE ARAÚJO NASCIMENTO NUNES', 'FRANCISCO DIEGO PEREIRA SANTOS', 'LARISSA PAULINA GOMES PEREIRA', 'JOANA MIRELLY ALVES DE OLIVEIRA', 'GABRIELA MAGALHÃES DE ALMEIDA', 'GLECIANA ANA DA SILVA', 'WELLINGTON NASCIMENTO AMARAL', 'WILLIANA SARA LIMA BARBOSA AMARAL', 'YASMIM RODRIGUES ARAÚJO', 'LETÍCIA TAYNÁ FERNANDES OLIVEIRA', 'VICTÓRIA SOARES VIANA', 'LETÍCIA CRISTINA DA SILVA MAGALHÃES', 'JOANNA CAROLINY ALVES DE ARAUJO', 'ADÃO DOMINGOS GUIMARÃES', 'IARA MARIA DAVI NUNES', 'JAIANE BEZERRA DE SOUZA', 'MARIA EDUARDA NICACIO VIEIRA', 'ANNE CAROLLYNE GOMES LOPES', 'ANA CLARA RODRIGUES BEZERRA DE SOUZA', 'NICOLLY NAYARA LIMA SILVA', 'LUCIANA OLIVEIRA DA SILVA PEREIRA', 'ADRIANO BATISTA MOTA RIBEIRO', 'LUCAS RYAN CARVALHO DE MEDEIROS', 'ANA CECILIA LOPES SIQUEIRA', 'MILENA SOARES SANTOS', 'Silvângela Morato Fernandes', 'JÉSSICA ANNE NUNES NONATO DA SILVA', 'PAULO VÍTOR DA SILVA LIMA', 'RAYSSA DAYANA ROSAS RODRIGUES', 'SAMILY EVILLYN MARQUES DE SOUSA', 'ANA KARLA NUNES LIMA', 'LUDMYLLA MONTEIRO GOMES ', 'MARIA EDUARDA DO NASCIMENTO MORAES', 'ESHILEY NUNES MEDEIROS', 'YASMIN FREITAS DOS SANTOS', 'MATHEUS COSTA DE CAMPOS', 'RENATO DE LIMA RIBEIRO', 'EDICASIA DA SILVA BRITO SOUZA', 'GABRIEL ANTONIO BEZERRA RODRIGUES', 'AMANDA LIMA DE SÁ', 'KAÍKE RIBEIRO LIMA', 'MARIA CLARA BEZERRA DE SOUZA', 'ADÃO GOMES DE SOUSA', 'MARIA EDUARDA DE SOUZA SILVA', 'ANA LÍVIA MARCOLINO SILVA', 'LAYZA RAQUEL OLIVEIRA SILVA', 'JOSÉ VIEIRA RODRIGUES JÚNIOR', 'ADÃO LUIZ DE ALMEIDA', 'KARLA MIRELLY INÁCIO MAGALHÃES', 'EVELLYN ANDRÉA DA SILVA SOUZA', 'MARIA EDUARDA DA SILVA', 'LAURA VICTÓRIA SANTOS ROSA', 'ADAUTO ALVES DE CARVALHO NUNES', 'BEATRIZ VITÓRIA ALVES SILVA', 'ELINEZ CECÍLIA TELES SIQUEIRA', 'EMILLY INÁCIO DE GÓES', 'JADSON CAIK OLIVEIRA DE DEUS', 'Maria Oneide Bezerra Lima', 'Natanaelly Vitória da Silva Bento', 'GABRIEL CARVALHO NUNES PEREIRA FERRAZ', 'ADAUTO ARTUR DOS SANTOS', 'JOÃO CIRILO NUNES BASTOS DA SILVA', 'ANA LAURA BASTOS GONÇALVES ROSA', 'JOSÉ LIDSON FERREIRA DA SILVA', 'HANNAH NATIVIDADE SIQUEIRA LIMA', 'ADAUTO BARBOSA DA SILVA NETO', 'JOSÉ GUILHERME RIBEIRO DA SILVA', 'ISAAC PEDRO DA SILVA LIRA', 'JOSÉ MARCELO GOIS GUIMARÃES DOS SANTOS', 'ELTON JERCIONE PEREIRA GOMES', 'ADAUTO DE SOUSA VITOR', 'FRANCISCO JOSÉ DE CARVALHO FALCÃO', 'ARNALD RYAN ALCANTARA DE SOUZA', 'maria cecillya do nascimento freire', 'SALETE VITÓRIA ALVES DA SILVA', 'ADAUTO FERREIRA CAVALCANTI', 'YURI GABRIEL DE MELO MAGALHÃES', 'THAUAN FÁBIO MARQUES MAGALHÃES', 'NADYNE PEREIRA DE CARVALHO NETO', 'ROANA CATHARINA DUARTE DE ARAÚJO RODRIGUES', 'ADAUTO LUCAS BEZERRA', 'SÂMARA CARVALHO DINIZ', 'GISLAYNE MARTINS DE LIMA', 'JANICLEIDE LOPES PEREIRA', 'ALANNY JOYCE DOS SANTOS GUERRA', 'ADECILDO PEREIRA DE BARROS', 'KÉSSIA VITÓRIA DA SILVA CLEMENTINO', 'ARTHUR VINÍCIUS ALMEIDA SILVA', 'DANIEL DE SOUSA OLIVEIRA', 'BRUNO CELSO SABINO LEITE', 'FERDINANDA REGINA SILVA BERNARDO', 'CAMILA ANTONIA PEREIRA SOUSA', 'LUIZ LEONARDO SOARES FILHO', 'MARIA JOSEANE FREIRE DOS SANTOS', 'IZABELLY CRISTINA DE LIMA SOUZA', 'LUCAS EMANUEL RODRIGUES AMORIM', 'MARIA HELOÍSA CHAGAS VIANA', 'MARIANA CONCEIÇÃO SILVA', 'LILIANE DA SILVA FREIRE', 'Maria Cibelli do Nascimento Ramos', 'MARYLIA GABRIELLA DE FREITAS BENEVIDES', 'VINICIUS JONATHAN BARROS DE CARVALHO', 'ANNE MÉLLANIE QUEIROZ DE PAIVA SANTANA', 'FLÁVIA ALESSANDRA BEZERRA', 'GIOVANNA COSTA DE GOUVEIA MENEZES', 'ADECIO DOMINGOS DE ANDRADE', 'JULIA DA SILVA ALEXANDRE', 'MARIA CLARA BRASIL FERRAZ', 'MARIA ISLANE LIMA SANTOS', 'MARIA EDUARDA DA SILVA ARAÚJO', 'ADECIO GOMES ALMEIDA', 'JÚLIO CÉSAR LOPES MAGALHÃES', 'SAMARA DA SILVA SANTANA', 'LUANA DA SILVA ALVES', 'JOSIVÂNIA BARROS DA SILVA', 'ADEILDO BARBOSA DA SILVA', 'PEDRO HENRIQUE PEREIRA DA SILVA', 'VITÓRIA IORANNA DA SILVA', 'MARIA DE LOURDES DA SILVA', 'RAYANNE VALERIANO GOMES RAFAEL', 'MARIANY TAYSSA FERREIRA DE OLIVEIRA', 'TAINARA BEZERRA VASCO', 'THIAGO JOSÉ HONÓRIO VERAS', 'IZADORA CALIXTO DA SILVA PEREIRA', 'VÍVIAN DINIZ DANTAS', 'DEBORA LOPES FURTADO FERREIRA', 'ROOSEVELT DA SILVA PEREIRA', 'JÚLIO CÉSAR JUSTO SANTOS', 'ADEILDO BEZERRA DE LIMA', 'LÍVIA YOHANNA VANDERLEI DE ANDRADE', 'GRAZIELA DE CARVALHO RESENDE', 'ALEX SANDRO CIPRIANO DA SILVA FILHO', 'RENAN JHON ALVES DE SOUZA', 'LHAYS RODRIGUES DE MORAIS', 'EMANUEL HENRIQUE OLIVEIRA COSTA', 'DEIVISSON CRISTIAN DA SILVA LIMA', 'GUSTAVO SOUZA BARROS', 'THIAGO WILLIANS PEREIRA DA SILVA', 'AURICELIO LUIZ DE MOURA JÚNIOR', 'ADEILDO JOSIAS DOS SANTOS', 'YASMIM MARIA DE GÓIS SILVA', 'JANDSON VANKARLES SOUSA SILVA', 'RYAN LEITE DE MORAIS', 'EDVALDO DA SILVA BRITO NETO', 'JACKSON RENAN LEMOS NOGUEIRA', 'MARCELO AUGUSTO LIMA MELO', 'VITÓRIA HELENA DA SILVA SANTOS', 'ADEILDO LEANDRO PEDROSA', 'LAURA RIBEIRO FERREIRA SILVA', 'MARIANA NASCIMENTO NOGUEIRA', 'HENRIQUE CÉSAR MENEZES SOUZA GRANJA', 'VITÓRIA LOUIZE XAVIER PEREIRA LIMA', 'THAIS MICAELY RODRIGUES DOS SANTOS', 'ARTHUR HENRIQUE TORRES DINIZ', 'MARIANA DOS SANTOS SILVA ALENCAR', 'ANDRESSA KAROLLAYNE NUNES LIMA', 'ADEILDO LEANDRO PEREIRA', 'ANA BEATRIZ DUARTE DE MEDEIROS', 'ANDRIW EDUARDO DE ALMEIDA SANTOS', 'OTAVIO HENRIQUE ARAÚJO NOVAES TORRES', 'MARIA EDUARDA DE SOUZA GOMES', 'WENDEL XAVIER BEZERRA', 'MARIA LETÍCIA CARVALHO GOMES', 'JAMILLY ALVES MANGUEIRA DE SOUSA', 'ADEILDO MANOEL DA SILVA', 'Bianca nogueira da Silva', 'RODRIGO DA SILVA LIMA', 'MATHEUS LUIS SILVA VIEIRA DE LORENA E SÁ', 'LUIZ FELIPE PEREIRA FIGUERÔA', 'FELIPE MATHEUS TORRES RIALVA', 'TIAGO DA SILVA LIMA', 'MARCOS VINÍCIUS PEREIRA ANDRADE', 'EMANUELA DA SILVA SANTOS', 'IDELBRANDO FIDELIS DOS SANTOS FILHO', 'WESLAYNE FERREIRA DA SILVA', 'MARIA VICTÓRIA MAGALHÃES TERTO', 'DAVID LEANDRO ALVES DE MORAIS', 'JULIANA SANTOS PEREIRA', 'JOÃO EVERTON DOS SANTOS', 'JEAN PIERRE BERNARDINO DA SILVA', 'VITÓRIA VALÉRIA DE MOURA LIMA', 'ANA CAROLINA LIRA CAMPOS', 'ADEILDO NUNES BEZERRA', 'KARLA MAYSA SILVA COSTA', 'MANOELLA VITÓRYA DE SOUZA LEITE', 'RAINÁ HELEN  DE OLIVEIRA MATIAS', 'BRUNNO KAUÊ DE SIQUEIRA SILVA', 'KÍRIA ANIKI LINS CAVALCANTI', 'ANA CAROLINA DA SILVA SOUZA', 'Maria Fernanda da Silva Godoy', 'ADEILDO PEREIRA DINIZ', 'JOÃO AUGUSTO SOUSA DUARTE RODRIGUES', 'MARIA EDUARDA DA SILVA SÁ MENEZES', 'ANA BEATRIZ RODRIGUES DA SILVA', 'EMILLY TENÓRIO DA SILVA', 'ADEILSON ALVES FEITOSA ', 'JÉSSICA NUNES NOGUEIRA', 'DANIELE BEATRIZ LUIZ', 'VINICIUS PEREIRA GUERRA', 'JANIKECIA TAMIRES DE QUEIROZ', 'ANA BEATRIZ GOMES DA SILVA', 'LAURA ALVES PEREIRA DE LIMA', 'WILLIAMYS FERREIRA MARTINS', 'JOSÉ VINÍCIUS MORATO DE QUEIROZ', 'JETSON TELES DA SILVA', 'MAYKON DOUGLAS REZENDE DA SILVA', 'ADEILSON ANTONIO PEREIRA', 'JOSÉ HENRIQUE BARBOSA DA SILVA', 'MARLLON JOSÉ MEDEIROS FLORENTINO', 'JOSÉ ALÍSSON PEREIRA GOIS', 'JOSÉ VÍTOR FELICIANO ALVES DA SILVA', 'EDUARDO HENRIQUE RODRIGUES DA SILVA', 'LUCILA SOUZA ROSA LIRA DE SÁ', 'ELLEN LUIZA MORATO SANTOS', 'DANIEL LEMOS DA SILVA NOGUEIRA', 'ANDRÉ LUCAS DA SILVA FREITAS', 'CICERO GUILHERME DA SILVA JÚNIOR', 'ADEILSON BARBOSA DA SILVA', 'VANESSA RAYSSA MOURA SANTOS', 'MARTA WILIANE DA SILVA DINIZ', 'MARIA LETÍCIA ROZENO DE OLIVEIRA BARROS', 'MARIA VITÓRIA RODRIGUES MENDONÇA', 'YASMIN STÉFANNY VANDERLEY NÓBREGA', 'DEYVIDSON CAMILO ALVES DE LIMA', 'Adrícia Lara Pereira Alves de Sá', 'ADEILSON DA SILVA BEZERRA', 'IASMIM RIBEIRO ROCHA SILVA', 'JOSÉ ALISSON TENÓRIO DE MELO', 'CÁSSIA CABRAL DA SILVA', 'NATALY FAYANE DOS SANTOS SILVA', 'THAMIRES CARVALHO LIMA E SILVA', 'IALLE CAZER DE BARROS', 'ANA CLARA BARBOZA FREIRES DE SÁ', 'MARINA RODRIGUES GOMES', 'MARIA EDUARDA TORRES DE SIQUEIRA', 'GIOVANNA EMANUELLI DA SILVA MELO', 'ADEILSON ELENO DA SILVA', 'MARIA EDUARDA LOPES SALES', 'BRUNA CAVALCANTI FERREIRA', 'JOÃO GUILHERME DA SILVA MAGALHÃES', 'IZABELE VITÓRIA PEREIRA DA SILVA', 'ANA RAISSA FERREIRA DA SILVA', 'HELLEN DO NASCIMENTO GOMES DE SOUSA', 'VITÓRIA HEMILLY PEREIRA DA SILVA', 'KAMILLE ÂNGELO DA SILVA', 'LUCIALLY DE BARROS PEREIRA', 'EMILI YASMIN DOS SANTOS SILVA ', 'EDSON DA SILVA TEIXEIRA VERAS', 'ISABELA GAMA DE BARROS ', 'KARLA MANUELY DA SILVA ', 'ALINE LIMA DA GAMA ', 'KÊNEDY RYAN GOMES TERTO', 'JALYSON ALEXSANDER SILVA', 'GABRIELLE STEPHANI DA SILVA QUEIROZ', 'LUAN MARCONDES PRÍNCIPE DOS SANTOS', 'KÁTIA VIVIANE PEREIRA DE SOUZA', 'SABRINA LIMA DE CARVALHO', 'ADEILSON JOSÉ LEAL', 'BIANCA EDUARDA DE SOUZA ', 'MAEVE MARIA DE ANDRADE RÊGO', 'RAYRA RENALLY FIGUEIREDO', 'ÉRIKA JAMILLE LIMA', 'GUTEMBERG SOARES BARBOSA', 'MARIANA SIQUEIRA CAMPOS MAIA', 'CAMILY VITÓRIA DUARTE', 'MARIA ALICE LIMA ANDRADE', 'ÍNGRIDY GABRIELY MARQUES DE OLIVEIRA', 'ELLEN MARIA ALVES ALMEIDA', 'ARTHUR CRISTIAN BARBOSA DE SOUSA', 'RAFAELA BEZERRA MEDEIROS', 'EDIEDSON DA SILVA SOUZA', 'JOSENILDA ALVES DE LIMA', 'MARIA FERNANDA PEREIRA DOS SANTOS', 'WENDYO MOURA DINIZ', 'ADEILSON MARQUES DOS SANTOS', 'LUIZ HELENO ALVES FERREIRA', 'JOÃO PAULO LIBERAL LINS SIQUEIRA DUARTE', 'JAMES FLORENTINO DINIZ FILHO', 'LANNA VITÓRIA TARGINO DE VASCONCELOS', 'ANTONIA KLÉCIA NUNES DE MELO', 'SAMARA KETLEN DE ALMEIDA ALVES', 'YANE VICTORIA CORDEIRO FREIRE', 'ADEILSON RAMOS GUSMÃO', 'MARIA LETÍCIA SIQUEIRA CAMPOS', 'SAMUEL ALVES DE CARVALHO GOMES', 'MARANÍ SANAUÁ SANTOS TERTO', 'NAARA PEREIRA PASTOR DA SILVA', 'EDUARDA LORRANY DA SILVA MACEDO', 'ANDRÉ ALIPIO DO NASCIMENTO LEÃO FAGUNDES', 'ADEILSON SOARES FEITOSA', 'FLAVIA LUANNY ESPÍNDOLA ALVES DOS SANTOS', 'VANESSA JACIRA COSTA DE FARIAS', 'VINICIUS HENRY COSTA DE FARIAS', 'BRUNO FERNANDO DE QUEIROZ', 'ADEILSON VITOR DE MELO', 'WEMILLY VITÓRIA PAULINO LÚCIO DOS SANTOS', 'MARIÂNGELA RODRIGUES DOS ANJOS', 'JOSÉ ÍCARO ALVES DE SOUZA', 'SABRINA RODRIGUES MAGALHÃES', 'ADEILTO ELOI DA SILVA', 'MARIA ADRIELLY BEZERRA DA SILVA', 'EDINAIELLY ECHILLEY DO NASCIMENTO', 'EMANUELA PEREIRA DOS SANTOS', 'AMANDA CAMILLA AMARAL DOS SANTOS', 'CARLOS HUGO MAGALHÃES E SILVA', 'GIOVANA LIMA FREIRE MARIZ', 'LARISSA ALENCAR DE SOUSA PEREIRA ', 'ISABELY PINHEIRO MENDES', 'CAMILA DE SIQUEIRA SILVA', 'DÉBORA SERAFIM BARROS', 'MARIA CLARA BERNARDES DE SOUZA', 'ANA BEATRIZ NOVAES E SILVA', 'SAULO ALCÂNTARA SANTOS', 'ADEILTON MARIANO DE SÁ', 'CATARINA ARCANJO RODRIGUES FONSÊCA', 'RAIANNY PEREIRA DO NASCIMENTO', 'NICOLE NORONHA DE MORAIS', 'MARIA CLARA BARBOSA SANTANA', 'MARIA DAS DORES CONCEIÇÃO ALMEIDA', 'JOICE GABRIELE GONÇALVES RODRIGUES', 'EDUARDO JOSUÉ CAVALCANTE RODRIGUES DE ALMEIDA', 'ILCA KARINNA NUNES BASTOS PEREIRA', 'MARIA RITA RABÊLO BARBOSA DE SOUSA', 'MARIANA STEFFANIE LOPES DE SÁ NUNES', 'CÍNTHIA MYLENA MENEZES DO NASCIMENTO', 'MONIQUE MIRANDA DOS SANTOS GOMES', 'MILENA NAYRA DOS SANTOS FERREIRA', 'ANNA JÚLIA DE SOUZA COÊLHO', 'ANA VITÓRIA CORDEIRO REZENDE', 'Mayara Luana Rodrigues de Lima sousa', 'ADEILZO LEITE DA SILVA', 'IONARA YARA SIMÕES DA SILVA', 'THAYNARA FABRÍCIA DERIO ROSENDO SILVA', 'MARIA ISABELLY SANTOS VENÂNCIO', 'ANA PATRICIA DO NASCIMENTO SABINO', 'JOSÉ CARLOS CRISPIM BARBOSA JÚNIOR', 'LUCAS LEITE DA SILVA', 'João Gabriel Batista Silva', 'CÉSAR AUGUSTO DIAS LIMA BRITO', 'CRISTIANO GOMES NICÁCIO', 'RAUL MACHADO DA SILVA', 'EWERTON COSTA FERRAZ', 'ANA PAULA DA SILVA FARIAS', 'NAELY FERREIRA DOS SANTOS SILVA', 'VINÍCIUS RAFAEL SEVERO DE SOUZA', 'IRIS FERNANDA MENEZES FREIRE', 'MARIA EUGÊNIA ANDRADE DE LIMA CALDAS', 'MARIA ITAÍS DOS SANTOS BERNARDINO', 'ANA CLARA DA CRUZ FIGUEIREDO MELO ', 'EDNAYARA NADJA MOREIRA ALVES', 'TAINÁ DAIANE PEREIRA DA SILVA', 'KEYNIS CANDIDO DE SOUTO', 'JOÃO FERREIRA DA SILVA JUNIOR', 'MARCOS ERICO DE ARAUJO SILVA', 'INALDO DIONISIO NETO', 'KELLY CORDEIRO ANTAS', 'ROSIMAR RAMOS DE FONTES OLIVEIRA', 'MARIA LIVÂNIA DANTAS DE VASCONCELOS', 'MABEL CRISTINE NOGUEIRA SOUSA', 'GERALDO SEVERINO DE LIMA', 'DAVID JORGE PEREIRA ALVES', 'LUCIANO DA SILVA', 'KATHERINE LAGES CONTASTI BANDEIRA', 'REVELINO CARDOSO DOS SANTOS', 'MARIA ROBERTA BEZERRA DA SILVA', 'BRASILIANA SULAMITA BATISTA CAVALCANTE', 'JOSÉ CARVALHO DE ARAGÃO NETO', 'ANDERSON MÁRCIO DE OLIVEIRA', 'CLODOALDO JOSE DE LIMA', 'SEVERINA SILVA AMARAL', 'MARIA MICHELE FERREIRA FIGUEIREDO', 'MARCIAL DUARTE COELHO', 'BERNADETE DE LOURDES DE ARAÚJO SILVA', 'LUIS PEREIRA DE MELO JUNIOR', 'AMANDA SANTOS SOARES', 'TATYANE GUIMARÃES DE OLIVEIRA', 'FELIPE SAINT CLAIR MONTEIRO DA SILVA', 'MARÔNIO MONTEIRO DO RÊGO', 'ANYFRANCIS ARAÚJO DA SILVA', 'SUZANA KARLA RODRIGUES DE MELO LIMA', 'LUIZA DANTAS DE SOUSA LIMA', 'RODOLFO RODRIGO SANTOS FEITOSA', 'LUIZ BARBOSA FILHO', 'FLAVIO AUGUSTO FEITOSA BARBOSA GOMINHO', 'ANSUMANE SAMBU', 'EDDIE RAONI DE LIMA MARQUES', 'FARNÉSIO DE SOUSA CAVALCANTE', 'ROBERTO LEONARDO DA SILVA RAMOS', 'HERSÍLIA MONTEIRO CADENGUE DE OLIVEIRA', 'CARLA REGINA DA SILVA BEZERRA', 'MICHELINE CORREIA DE SOUZA', 'JOÃO ROGERIO VILAR DA SILVA', 'MATOS DA SILVA ', 'FRANCINEIDE BORGES DE LIMA', 'JAQUELINE DINIZ BARROS', 'JULIANA PEDROSA LUNA OLIVEIRA', 'LEONARDO HENRIQUE MONTEIRO DE CARVALHO', 'FERNANDA DAS CHAGAS ÂNGELO DA SILVA', 'JACIANA DOS SANTOS AGUIAR', 'MOACYR BARRETO DE MELO RÊGO JÚNIOR', 'GABRIELA SOUTO VIEIRA DE MELLO', 'GUSTAVO HENRIQUE CORDEIRO GALVÃO DE SOUZA', 'JOÃO LUIZ QUIRINO DA SILVA FILHO', 'ISMAEL GOMES BARRETO', 'ANA PAULA ANTUNES NOVAES CAVALCANTI', 'BRENA DE MELO FREITAS', 'FABRICIA MARTINS GODIM', 'ANDREIA DA SILVA SANTOS', 'RENATO COELHO ANGELIM', 'FABRICIA SILVA DANTAS', 'DAVID DE OLIVEIRA MONTEIRO', 'MARIA DO SOCORRO CORDEIRO DE BRITO PEREIRA', 'WELMA EMÍDIO DA SILVA', 'KÉCIA ALESSANDRA DE LIMA MELO', 'LARISSA RAPOSO DINIZ', 'JEANE UILMA GALINDO JARDIM', 'JOSÉ DE CASTRO SOUZA NETO JUNIOR', 'JONAS TADEU RIBEIRO PAIVA', 'VALDENILSON JOSE VITAL DIAS', 'KLÉBIA DORIANY CONRADO WEBER', 'ALBERTO RODRIGUES DE OLIVEIRA', 'ANA MARIS ALVES TOMÓTEO', 'RILDO FEITOSA DE SOUZA', 'SOFIA SÂMELA DE SOUSA BRANDÃO', 'WEVERTTON MARLLON ANSELMO', 'VINÍCIUS GOMES MACHADO', 'MARCELA CAVALCANTI MOREIRA', 'LARISSA DA COSTA MELO', 'CICERO LOPES DA SILVA', 'GEORGIA DE SOUSA FERREIRA SOARES ', 'RONMILSON ALVES MARQUES', 'FERNANDA MIGUEL DE ANDRADE', 'MARLA MONIRA SOUZA RODRIGUES', 'PAULA HONÓRIO DE MELO MARTIMIANO', 'GLEYMERSON VIEIRA LIMA DE ALMEIDA', 'JOÃO MARCUS PEREIRA LIMA E SILVA', 'FELIPO PEREIRA BONA', 'CARLOS ANTONIO GUIMARÃES SILVA ', 'CLECIO JOSÉ DE LACERDA LIMA', 'SIMONE MARIA DOS SANTOS', 'JOEDY MAYARA SANTA ROSA DE SOUZA', 'LÍDIA PINHEIRO DA NOBREGA', 'ALEXANDRE HUGO PEREIRA DE CARVALHO RODRIGUES', 'GABRIELA CAVALCANTE DA SILVA', 'THIAGO DO NASCIMENTO SILVA', 'EMANUEL LUCENA FERNANDES', 'GEVANIO BEZERRA DE OLIVEIRA FILHO', 'RAFAELA FERREIRA DOS SANTOS', 'IGOR ARAUJO NUNES DE SOUZA', 'ANA PAULA INACIO', 'EVERTON RODRIGUES BEZERRA', 'MARIA CÉLIA DANTAS PEREIRA', 'MARCO AURELIO LIRA DE AMORIM', 'ISABEL CAVALCANTI CABRAL', 'RENATO CAMPOS PORDEUS', 'MARCOS ALBERTO DE CARVALHO SILVA ', 'JUSSARA CLARISSA ALVES DE LIMA OLIVEIRA', 'JHONATTA ALEXANDRE BRITO DIAS', 'LUZIA  BRECREENFELD AMIRATI', 'CRISTIANE DUPERRON BARBOSA INACIO DE OLIVEIRA', 'ELISABETH NASCIMENTO SILVA', 'LUANDSON JOSÉ DA SILVA E SILVA', 'GINA GOUVEIA PIRES DE CASTRO', 'FLAVIA FERNANDA DA SILVA MOURA', 'JOSE EDSON DE SOUZA SILVA', 'VINICIUS GABRIEL BARROS FLORENTINO', 'RENAN DO NASCIMENTO BARBOSA', 'ÍTALO WESLEY PAZ DE OLIVEIRA LIMA', 'WELISON ARAÚJO SILVEIRA', 'EUGENIO PACELLI DE VERAS SANTOS', 'PRISCILA BRAZ DO MONTE', 'LARISSA GOMES DE FREITAS', 'DAIANA DA SILVA CARVALHO', 'LARISSA DE BRITO MEDEIROS', 'NEUSA LYGIA VILARIM PEREIRA', 'PAULO ANDRÉ GOMES BARROS', 'THIAGO MEDEIROS CAVALCANTI', 'ICARO FERNANDO DINIZ ARAUJO', 'PALOMA SILVA SILVEIRA', 'CAIO CESAR CARNEIRO SILVA', 'HAENDEL LOPES VIRGULINO DE MEDEIROS', 'JEFFERSON HERÁCLITO ALVES DE SOUZA', 'KAMILLA HELLEN RODRIGUES CAPISTRANO', 'TAMIRES ALCANTARA DOURADO GOMES MACHADO', 'LUANNA GRASIELY DA SILVA ANDRADE ARAÚJO', 'LUISA MARIANNA VIEIRA DA CRUZ', 'LUANA REIS METTA', 'WIDEMAR FERRAZ DA SILVA', 'BRUNO ALLYF BEZERRA LIMA', 'ARTHUR DIEGO DE GODOY BARBOSA', 'IVANDRO PINTO DE MENEZES', 'MONALIZA ARAUJO PARNAIBA', 'DAIANE NONATO DE LIMA', 'LIANE SORAYA VIANA DA SILVA', 'RAIMUNDO PAULO DA SILVA JUNIOR', 'RAEMA CÂNDIDO FONSECA', 'ISAURA CAROLINE ABRANTES SILVA', 'ADRIANO REFERINO DA SILVA SOBRINHO', 'JOSELMA ERUNDINA DE LIMA CORDEIRO', 'CILENE REJANE INÁCIO DE MAGALHÃES LIRA', 'ANDRESA LIRA SILVA ', 'FLAVIANE MÉRCIA SILVA CABRAL ', 'WESLEY KAYKE DE SOUZA ', 'ALDECI TIMOTEO', 'ALDECIR BATISTA DA SILVA', 'ALDECY ALVES DOS SANTOS', 'ALDECY ALVES DOSSANTOS', 'ALDECY JOSÉ DOS REIS', 'ALDEMAR NUNES DA SILVA JÚNIOR', 'ALDEMIR ANTONIO DE LIMA', 'ALDENI BARBOSA DA SILVA', 'ALDENI ESPEDITO BARBOSA', 'ALDENI FERREIRA NUNES', 'ALDENI PEREIRA DE SOUZA', 'ALDENIO PATRÍCIO DE SOUZA', 'ALDENIR JOSÉ DE ANDRADE', 'ALDENIR JOSÉ DOS SANTOS', 'ALDENIR LOURENÇO DE SOUSA', 'ALDENIR SOBREIRA DA SILVA', 'ALDENOR ALEXANDRE DOS SANTOS', 'ALDENOR MOREIRA DA SILVA', 'ALDERICO DOS SANTOS CALADO', 'ALDERLEY ALVES DO AMARAL', 'ALDERNEY ALVES DE MENEZES ', 'ALDEZIRO VIDAL CUNHA', 'ALDIR MARINHO DE MELO', 'ALDO ALAN MOURA FERREIRA', 'ALDO APARECIDO NUNES DE LIMA', 'ALDO BEZERRA  SANTANA ', 'ALDO DE SOUZA NOGUEIRA', 'ALDO GOMES DA CUNHA', 'ALDO JOSÉ CARVALHO LUCAS', 'ALDO JOSÉ DO NASCIMENTO', 'ALDO LÁERCIO GOMES DA SILVA', 'ALDO LUIZ EPAMINONDAS DE CARVALHO', 'ALÉCIO LUCIANO TIMÓTEO MACÊDO ', 'ALENCAR ALVES GONDIN', 'ALEQUES SANDRO AMADOR', 'ALESSANDRO DA SILVA MARQUES', 'ALESSANDRO DE SIQUEIRA SANTOS', 'ALESSANDRO LOPES MENEZES BARROS', 'ALESSANDRO NUNES FRAZÃO', 'ALESSANDRO SIQUEIRA BARBOSA', 'ALESSANDRO VELOSO DE SIQUEIRA', 'ALEX GOMES DE LIMA', 'ALEX LEITÃO CIRINO', 'ALEX SANDRO CIPRIANO DA SILVA', 'ALEX SANDRO MAURICIO DA SILVA', 'ALEXANDRE CÉSAR CAMPOS DA FONSECA', 'ALEXANDRE DE ASSIS', 'ALEXANDRE FERNANDES', 'ALEXANDRE FERREIRA DA SILVA ', 'ALEXANDRE GOMES NOVAES', 'ALEXANDRE JORGE DE SOUZA CAMPOS', 'ALEXANDRE LIMA', 'ALEXANDRE MAGNO DOS SANTOS', 'ALEXANDRE MARCELO BARRETO', 'ALEXANDRE MELO LIMA', 'ALEXANDRE NETO DE MENEZES', 'ALEXANDRE NONATO DE LIMA', 'ALEXANDRE NUNES DA SILVA', 'ALEXANDRE NUNES DE OLIVEIRA ', 'ALEXANDRE SOARES DIAS DA SILVA', 'ALEXANDRINO DE SOUZA LIMA', 'ALEXANDRO BATISTA LIMA', 'ALEXANDRO DE CARVALHO DE SÁ ', 'ALEXANDRO GÓES DE QUEIROZ', 'ALEXANDRO HONORATO DA SILVA', 'ALEXANDRO VICENTE', 'ALEXINO DE ALMEIDA LIMA', 'ALEXSANDRO ARAÚJO DA SILVA', 'ALEXSANDRO BEZERRA DE LIMA', 'ALEXSANDRO DE LIMA CRUZ', 'ALEXSANDRO GOMES RAFAEL', 'ALEXSSANDRO ARAÚJO DA SILVA', 'ALFREDO ALVES DO AMARAL', 'ALFREDO ESTIMA ALMEIDA', 'ALFREDO MANOEL BARBOSA', 'ALÍCIO JOSÉ DOS SANTOS', 'ALIOM AR LUCIANO FLORENTINO  FERRAZ', 'ALISEU VIANA DE MAGALHÃES', 'ALISON PEREIRA PASSOS', 'ALLAN DA FONSECA BRITO', 'ALMI PIRES DE CARVALHO', 'ALMIE DE OLIVEIRA MELO', 'ALMIR CORDEIRO DOS SANTOS', 'ALMIR DE SOUZA BRITO', 'ALMIR FREIRE DOS SANTOS', 'ALMIR JOSÉ DA SILVA', 'ALMIR LIMA DA SILVA', 'ALMIR LUIZ DOS SANTOS', 'ALMIRO COELHO DE ALENCAR', 'ALMIRO COÊLHO DE ALENCAR', 'ALOÍSIO ALVES DE MEDEIROS', 'ALOISIO ALVES PEREIRA', 'ALOISIO LISBOA SILVA', 'ALOÍSIO LOPES DA SILVA', 'ALOISIO SERAFIM DA SILVA', 'ALOISO ALVES PEREIRA', 'ALOIZO JACINTO PEREIRA', 'ALTAIR GOMES LINS', 'ALTAMIRO AMARANTE DA SILVA', 'ALTANIR AFONSO PEREIRA DA SILVA', 'ALTEMAR PEREIRA DOS SANTOS', 'ALTERSANDRO RIBEIRO SILVA', 'ALTIERES FERNANDO ALVES ', 'ALUISIO BANDEIRA DA SILVA', 'ALUISIO DOS SANTOS LACERDA', 'ALUISIO MEDEIROS BARBOSA', 'ALUISIO NUNES DA SILVA', 'ALUISIO RAMOS SIQUEIRA FILHO', 'ALUISIO RODRIGUES DE LIMA', 'ALUIZ FERNANDES DOS SANTOS', 'ALUIZIO ANTONIO DOS SANTOS', 'ALUIZIO BERNARDO DA SILVA', 'ALUIZIO GOMES DE SOUZA', 'ALUIZIO JOSÉ DE MOURA', 'ALUíZIO PEREIRA ALVES', 'ALUIZIO PEREIRA DINIZ', 'ALUIZIO RAIMUNDO DOS SANTOS', 'ALUIZIO RODRIGUES DA SILVA JÚNIOR', 'ALVANIR ALVES BEZERRA ', 'ALVARO ARAUJO DOS SANTOS', 'ÁLVARO ARAÚJO DOS SANTOS', 'ALVARO AYRES FERRAZ ', 'ALVARO CORREIA DE ALMEIDA', 'ALVARO LUIZ PEREIRA DE SÁ', 'ALVERI MENDES DE ALMEIDA', 'ALVINO JOSÉ NETO', 'ALVINO PEREIRA DA SILVA', 'ALZIRO DE VASCONCELOS REIS', 'AMADEILSON PEREIRA', 'AMADEU DA CRUZ NEVES', 'AMADEU DE SOUZA FERRAZ FILHO', 'AMADEU FERREIRA DA SILVA', 'AMARILIO RODRIGUES DA SILVA', 'AMARÍLIO RODRIGUES DA SILVA', 'AMARO CELESTINO PEREIRA FILHO', 'AMARO OTAVIANO DE SOUZA', 'AMAURI AMARO DE LIMA', 'AMAURI BENVENUTO DE CARVALHO', 'AMAURI CORREIA DE AZEVEDO', 'AMAURI HENRIQUE DE ANDRADE ', 'AMAURI LEÃO FAGUNDES', 'AMAURI NOGUEIRA NUNES', 'AMAURI PIRES DE CARVALHO', 'AMAURILIO CAVALCANTE SANTOS', 'AMÉRICO FERREIRA DA SILVA', 'AMÉRICO RODRIGUES ITABAIANA', 'AMILTON SILVA MATOS', 'ANACLETO ANTONIO DOS SANTOS', 'ANACLETO RAIMUNDO DA SILVA', 'ANAEL ALVES DE CARVALHO', 'ANAILTON SILVA BEZERRA SANTOS', 'ANANIAS FERREIRA LIMA', 'ANANIAS RODRIGUES CHAVES', 'ANANIAS SOLON PEREIRA DE MAGALHÃES', 'ANASTÁCIO FERREIRA DE CARVALHO', 'ANASTACIO MORATO LIMA', 'ANASTÁCIO MORATO LIMA', 'ANASTÁCIO VALGUEIRO FERRAZ', 'ANCELMO RODRIGUES DO NASCIMENTO', 'JOÃO NUNES DE QUEIRÓZ', 'JOÃO OLINTHO DIAS', 'JOÃO OLIVEIRA FERRAZ', 'JOÃO OSVALDO FERRAZ DE LIMA', 'JOÃO PAULO FLORENTINO DE SOUZA', 'JOÃO PAULO LINS SIQUEIRA DUARTE', 'JOÃO PAZ CALADO', 'JOÃO PEDRO FILHO', 'JOÃO PEREIRA DA SILVA', 'JOÃO PEREIRA DE CARVALHO', 'JOÃO PEREIRA DE OLIVEIRA', 'JOÃO PEREIRA DOS SANTOS JUNIOR', 'JOÃO PEREIRA FIRMINO', 'JOÃO PEREIRA GAMA JÚNIOR', 'JOÃO PEREIRA LIMA', 'JOÃO PEREIRA SOBRINHO', 'JOÃO PIRES SOBRINHO', 'JOÃO QUARESMA SILVA', 'JOÃO RAIMUNDO DA SILVA', 'JOÃO RAMOS DOS SANTOS', 'JOÃO RESIÉLIO DA SILVA', 'JOÃO RICARDO DA SILVA', 'JOÃO RODRIGUES DA CRUZ', 'JOÃO RODRIGUES DA SILVA', 'JOÃO RODRIGUES DE LIMA', 'JOÃO RODRIGUES DE MEDEIROS', 'JOÃO RODRIGUES DE SOUZA', 'JOÃO RODRIGUES DOS SANTOS', 'JOÃO RODRIGUES MAGALHÃES', 'JOÃO ROFINO DE SOUSA', 'JOÃO ROMERO DE LIMA', 'JOÃO RONALDO ARAUJO LUCAS', 'JOÃO RONALDO ARAÚJO LUCAS', 'JOÃO ROSA FILHO', 'JOÃO SALUSTIANO DA SILVA', 'JOÃO SALUSTINO ZOME', 'JOÃO SANTOS DE SENA', 'JOÃO SEVERINO DA SILVA', 'JOÃO SEVERO NETO', 'JOÃO SIDINEI DOS SANTOS SILVA', 'JOÃO SIQUEIRA AMARAL', 'JOÃO SOARES DE LIMA', 'JOÃO SOARES PIRES BENTO', 'JOÃO TAVARES DE SOUSA FILHO', 'JOÃO TEIXEIRA PINTO FILHO', 'JOÃO TEODOSIO DA COSTA', 'JOÃO TEOTONIO FILHO', 'JOÃO TORRES BARBOSA', 'JOÃO ULISSES DE SÁ', 'JOÃO UMBELINO DA SILVA', 'JOÃO VALERIANO DA SILVA', 'JOÃO VIANEY DA SILVA', 'JOÃO VIANEY DO NASCIMENTO ', 'JOÃO VIANEY NUNES DE ARAUJO', 'JOÃO VIANEY PEREIRA DOS SANTOS', 'JOÃO VIANEY QUEIROZ', 'JOÃO VIANEZ DE OLIVEIRA', 'JOÃO VIANEZ FILHO', 'JOÃO VIANNEY BORGES DE LIMA', 'JOAO VIANNEY DA SILVA', 'JOÃO VIANNEY DE SOUZA ', 'JOÃO VIANNEY DOS REIS', 'JOÃO VIANNEY QUEIROZ DE BRITO', 'JOÃO VIEIRA PEIXOTO', 'JOÃO VIRGINIO DE SIQUEIRA', 'JOÃO XAVIER DE SALES', 'JOÃOZITO RODRIGUES DE MOURA', 'JOAQUIM  ANTONIO GONDIM ', 'JOAQUIM ALVES DA SILVA', 'JOAQUIM ALVES ROCHA', 'JOAQUIM ANTONIO NETO', 'JOAQUIM ANTONIO SE DE AQUINO', 'JOAQUIM AQUINO PEREIRA', 'JOAQUIM CAMILO FERREIRA', 'JOAQUIM CRISTIANO GOMES VERAS', 'JOAQUIM DA SILVA FILHO', 'JOAQUIM DANTAS DE SOUZA', 'JOAQUIM DE ALMEIDA MELO', 'JOAQUIM DE SOUSA LIMA', 'JOAQUIM DE SOUZA MARINHO', 'JOAQUIM DOS SANTOS DINIZ NETO', 'JOAQUIM ELIAS FERREIRA', 'Joaquim Eraclito da Silva ', 'JOAQUIM ESTEVÃO DE BRITO ', 'JOAQUIM FERNANDES DE AQUINO', 'JOAQUIM GOMES DE SOUZA', 'JOAQUIM GOMES SOBRINHO', 'JOAQUIM GONÇALVES DOS SANTOS', 'JOAQUIM GUILHERME DA SILVA', 'JOAQUIM HONORIO JANUÁRIO', 'JOAQUIM JOÃO NETO ', 'JOAQUIM JOSÉ DE SOUZA', 'JOAQUIM JOSÉ DO NASCIMENTO', 'JOAQUIM JOSÉ PEREIRA', 'JOAQUIM JUSTINO DE SOUZA FILHO', 'JOAQUIM LEANDRO DE MORAIS', 'JOAQUIM LEOPOLDO NETO', 'JOAQUIM MACIEL DE BRITO', 'JOAQUIM MANOEL DE SÁ', 'JOAQUIM MANOEL DO AMARAL ', 'JOAQUIM MARIANO DA CRUZ', 'JOAQUIM MARIANO DA SILVA JUNIOR', 'JOAQUIM MAURICIO DA SILVA', 'JOAQUIM MOREIRA DOS SANTOS FILHO', 'JOAQUIM MORENO DA SILVA', 'JOAQUIM NETO FRANCO', 'JOAQUIM NETO PAIVA DINIZ', 'JOAQUIM NOVAES BEZERRA', 'JOAQUIM NUNES COELHO', 'JOAQUIM PEREIRA NETO', 'JOAQUIM REINALDO FILHO', 'JOAQUIM RIBEIRO DA COSTA', 'JOAQUIM SILVA DE LUCENA', 'JOAQUIM TAVARES VITAL', 'JOBEÁ ALEIXO DE SOUZA', 'JOCÉLIO DA SILVA BARBOSA', 'JOCELIO JOSÉ DE SOUZA', 'JOCÉLIO JOSÉ DE SOUZA', 'JOCÉLIO SALVIANO DE SOUSA', 'JOCELLIO ALVES VASCONCELOS', 'JOCENILDO PEREIRA DA GAMA', 'JOCENILTON PEREIRA DA SILVA', 'JOCIVALDO FREIRE DE OLIVEIRA', 'JOE WEYDER GOMES DE ARAÚJO COSTA', 'JOECIL DE SOUSA MARTINS NICOLAU', 'JOEL ALVES MACHADO', 'JOEL BEZERRA NETO', 'JOEL LIMEIRA NUNES', 'JOEL NUNES DA SILVA', 'JOEL PEREIRA DA SILVA', 'JOELMA MACHADO DO NASCIMENTO', 'JOELSON GOMES DO NASCIMENTO', 'JOELSON JOÃO DOS SANTOS', 'JOERCIO REGIS DE MENEZES', 'JOESI ELOI DA SILVA', 'JOHN GIUZEPPE DE FREITAS FERRAZ', 'JOHN KENNEDY PEREIRA MOURATO', 'JOILSON BARBOSA CERQUEIRA', 'JOILSON CAETANO DE SOUZA', 'JONAIR DE SÁ BARROS', 'JONAS BATISTA DE OLIVEIRA', 'JONAS ELOI HENRIQUE DA SILVA', 'JONAS HIPOLITO DE MELO', 'JONAS LINO DA SILVA', 'JONAS PEDRO DA SILVA', 'JONAS PEREIRA DA SILVA', 'JONAS RODRIGUES DOS SANTOS', 'JONAS VALETIM DE SOUZA FERRAZ', 'JONAS VICENTE DE CASTRO', 'JONY DE MEDEIROS CORREIA FILHO', 'JORDÃO JERMANO DO NASCIMENTO', 'JORGE ADELCINO DA SILVA', 'JORGE ALVES SOBRINHO', 'JORGE ANTENOR DE LIMA GOMES', 'JORGE AOLÔNIO MARTINS', 'JORGE APOLÔNIO MARTINS', 'JORGE ARAÚJO DOS SANTOS', 'JORGE ARRUDA DOS SANTOS', 'JORGE BENTO DE LIMA', 'JORGE CAITANO DA SILVA', 'JORGE DE ARAÚJO SILVA', 'JORGE FRANCISCO DOS SANTOS', 'JORGE GOMINHO NOVAES', 'JORGE HENRIQUE MOREIRA DOS SANTOS', 'JORGE IZIDORO NETO', 'JORGE JANCARTER GONÇALVES PEREIRA', 'JORGE JOSÉ DA SILVA', 'JORGE LUÍS PESSÔA SATURNINO', 'JORGE LUIZ DE SOUZA SOLTINHO', 'JORGE LUIZ DESOUZA CERQUEIRA', 'JORGE LUIZ RODRIGUES DA SILVA', 'JORGE MÁRIO DA NÓBREGA FIGUEIRÊDO', 'JORGE MONTEIRO DA SILVA', 'JORGE VEIGA SILVA COSTA', 'JORGELUÍS DE MENEZES LEAL', 'JOSAETE ROCHA MACIEL', 'JOSAFÁ FURTADO DE SÁ', 'JOSAFÁ MANOEL DOS SANTOS', 'JOSAFÁ MIGUEL MARCOLINO', 'JOSAFA NUNES ALVES', 'JOSÉ  ADELMO RODRIGUES', 'JOSÉ  BERNARDINO JUNIOR', 'JOSE ABEL ROSA', 'JOSÉ ABENILDO DA SILVA', 'JOSÉ ADAILSON DE LIMA', 'JOSÉ ADALILSON APOLINÁRIO DO NASCIMENTO', 'JOSÉ ADEILDO BEZERRA', 'JOSÉ ADEILDO CARLOS', 'JOSÉ ADEILDO DE OLIVEIRA', 'JOSE ADEILDO MORENO DA SILVA', 'JOSE ADELMO ALVES', 'JOSÉ ADELMO ALVES FERREIRA', 'JOSÉ ADELMO ALVES PEREIRA', 'JOSÉ ADELMO ANTAS', 'JOSE ADELMO ANTAS DE LIMA', 'JOSÉ ADELMO BERNARDINO DOS SANTOS', 'JOSÉ ADELMO DE OLIVEIRA', 'JOSÉ ADELMO DE SOUZA ', 'JOSE ADELMO DO NASCIMENTO', 'JOSÉ ADELMO DO NASCIMENTO', 'JOSÉ ADELMO DOS SANTOS', 'JOSE ADELMO GONÇALVES DE QUEIROZ', 'JOSÉ ADELMO SALVADOR DE ALCÂNTARA', 'JOSÉ ADEMI CRISTIANO DA SILVA', 'JOSÉ ADEMILSON NOBRE VERAS', 'JOSÉ ADENI DE SOUZA', 'JOSÉ ADILSON DA SILVA', 'JOSÉ ADILSON MOREIRA LIRA', 'JOSÉ ADINALDO DE LIMA', 'JOSÉ ADINILDO DO NASCIMENTO', 'JOSÉ ADRIANO DA SILVA', 'JOSÉ ADRIANO DO NASCIMENTO', 'JOSÉ ADRIANO GONÇALVES DE LIMA', 'JOSÉ ADRIANO NETO', 'JOSE AFONSO DE OLIVEIRA', 'JOSÉ AFONSO DE OLIVEIRA ', 'JOSÉ AFONSO TORRES', 'JOSÉ AFRÂNIO ALVES DE SOUZA', 'JOSÉ AGILDO DA SILVA', 'JOSÉ AGUINALDO HONORATO DE OLIVEIRA', 'JOSÉ AILSON GUIMARÃES DE LIMA', 'JOSÉ AILTON ALVES DE BARROS', 'JOSÉ AILTON CORDEIRO DOS SANTOS', 'JOSÉ AILTON DA SILVA ', 'JOSÉ AILTON DE BRITO SANTOS', 'JOSÉ AILTON GOMES TEODÓSIO', 'JOSÉ AILTON NUNES CAMPOS', 'JOSÉ AILTON PEREIRA DE AQUINO', 'JOSÉ AILTON SILVA GUIMARÃES', 'JOSÉ AILTON VIRGULINO DE MORAIS', 'JOSÉ AIRTON PEREIRA DE MORAIS', 'JOSE ALAESON DE SIQUEIRA', 'JOSE ALBERICO DE FREITAS', 'JOSE ALBERTO BARBOSA DA SILVA', 'JOSÉ ALBERTO CARDOSO RODRIGUES', 'JOSÉ ALBERTO DA SILVA', 'JOSÉ ALBERTO INOSOJA GALINDO', 'JOSÉ ALBERTO LIMA GONÇALVES', 'JOSE ALBERTO PEREIRO MELO', 'JOSÉ ALBERTO RAMALHO QUIRINO', 'JOSÉ ALBERTO SILVESTRE DE LIMA', 'JOSÉ ALBERTO VELOSO DE LIMA', 'JOSÉ ALBINO DOS SANTOS', 'JOSÉ ALBINO SATURNINO', 'JOSE ALDENIR DE LIMA', 'JOSÉ ALDO SANTOS', 'JOSÉ ALEIXO DA SILVA', 'JOSÉ ALENCAR ALVES DE SOUZA', 'JOSE ALEXANDRE DA SILVA', 'JOSÉ ALEXANDRE DE MORAES COSTA', 'JOSÉ ALEXANDRE NETO', 'JOSÉ ALEXANDRINO SOBRINHO', 'JOSÉ ALFREDO ALVES', 'JOSÉ ALLAN ALENCAR ROZA', 'JOSÉ ALMAR DE FREITAS ', 'JOSÉ ALMEIDA MACIEL', 'JOSÉ ALMIR DE SOUZA SILVA', 'JOSÉ ALTAMIRO DA SILVA', 'JOSÉ ALTINO GONÇALVES', 'JOSÉ ALVARENGA DA SILVA', 'JOSÉ ALVES BEZERRA DE LIMA', 'JOSÉ ALVES DA SILVA', 'JOSE ALVES DE AQUINO', 'JOSE ALVES DE LIMA', 'JOSÉ ALVES DE MEDEIROS', 'JOSE ALVES DE SIQUEIRA', 'JOSÉ ALVES DE SIQUEIRA', 'JOSÉ ALVES DE SOUZA', 'JOSE ALVES DE VASCONCELOS', 'JOSE ALVES DO NASCIMENTO', 'JOSÉ ALVES DOS SANTOS', 'JOSÉ ALVES DOS SANTOS FILHO', 'JOSÉ ALVES DOS SANTOS SOUZA', 'JOSÉ ALVES NUNES', 'JOSÉ ALVES PEREIRA', 'JOSÉ ALVES SIQUEIRA', 'JOSÉ ALVES SOBRINHO', 'JOSE ALVES XAVIER', 'JOSÉ AMARAL DA SILVA', 'JOSÉ AMARO SOBRINHO', 'JOSÉ AMAURI FERREIRA NASCIMENTO', 'JOSÉ AMAURI MARQUES PRAXEDES ', 'JOSÉ AMAURÍLIO DE SOUSA', 'JOSÉ AMILTON DA SILVA', 'JOSÉ ANAILTON ROSA DE LIMA', 'JOSÉ ANCHIENTA DE SOUZA', 'JOSÉ ANCHIETA BESERRA COIMBRA', 'JOSÉ ANCHIÊTA BESERRA COIMBRA', 'JOSÉ ANCHIETA DA SILVA', 'JOSE ANCHIETA DA SILVA CRUZ', 'JOSÉ ANCHIETA GUALTER', 'JOSE ANCHIETA SOBREIRA', 'JOSÉ ANCHIETA SOBREIRA', 'JOSÉ ANCHIETA VIEIRA SALVADOR', 'JOSÉ ANDELSO DA SILVA', 'JOSÉ ANDERSON GONÇALVES CABRAL', 'JOSÉ ANDRADE GOMES', 'JOSE ANGELO BATISTA', 'JOSÉ ANGELO DA SILVA', 'JOSÉ ANGELO IRMÃO', 'JOSÉ ANILSON DOS SANTOS FREIRE', 'JOSE ANTONIO DA CONCEIÇÃO ', 'JOSÉ ANTONIO DA SILVA', 'JOSÉ ANTÔNIO DA SILVA', 'JOSÉ ANTONIO DE ALMEIDA', 'JOSÉ ANTONIO DE ALMEIDA SANTOS', 'JOSÉ ANTÔNIO DE CARVALHO NETO', 'JOSÉ ANTONIO DE FRANÇA FILHO', 'JOSÉ ANTONIO DINIZ SANTOS', 'JOSÉ ANTÔNIO DO NASCIMENTO', 'JOSÉ ANTONIO DOS SANTOS ', 'JOSÉ ANTÔNIO DOS SANTOS', 'JOSÉ ANTONIO FLORENCIO', 'JOSÉ ANTÔNIO MOREIRA', 'JOSÉ ANTUNES BEZERRA', 'JOSÉ AOPARECIDO FONTES', 'JOSÉ APARECIDO BATISTA DOS SANTOS', 'JOSÉ APARECIDO DE LIMA', 'JOSÉ APARECIDO FONTES', 'JOSÉ APARECIDO LEANDRO', 'JOSÉ APARECIDO PEREIRA DE GOIS', 'JOSÉ APARECIDO RODRIGUES DE FREITAS', 'JOSE ARANALDO FRANCISCO DOS ANJOS', 'JOSÉ ARAÚJO DE SOUZA', 'JOSE ARAUJO LIMA FILHO', 'JOSÉ ARAÚJO LIMA FILHO', 'JOSÉ ARCÊNIO CAMPOS DOS SANTOS', 'JOSÉ ARIBERTO PEREIRA DOS SANTOS', 'JOSÉ ARIMATEIA DE SÁ SOUZA', 'JOSÉ ARIMATEIA JUSTINO DOS SANTOS', 'JOSÉ ARIMATEIRA SOBRINHO', 'JOSÉ ARIOSVALDO DA SILVA', 'JOSE ARLINDO BEZERRA DA SILVA', 'JOSÉ ARLONÇO DE LIMA', 'JOSÉ ARMANDO DA SILVA', 'JOSÉ ARMANDO MOURA MORAES', 'JOSÉ ARNALDO ADRIANO DOS SANTOS', 'JOSÉ ARNALDO ANICETO FERREIRA', 'JOSÉ ARNALDO CORDEIRO DA SILVA', 'JOSÉ ARNALDO DA SILVA', 'JOSÉ ARNALDO DE LIMA', 'JOSÉ ARNALDO DE MELO', 'JOSÉ ARNALDO DO NASCIMENTO', 'JOSÉ ARNALDO FELIZ DA SILVA', 'JOSÉ ARNALDO PEREIRA NETO', 'JOSE ARNALDO SIQUEIRA', 'JOSÉ AUGUSTO CAMILO DA SILVA', 'JOSÉ AUGUSTO DA SILVA', 'JOSÉ AUGUSTO DE LACERDA FERRAZ', 'JOSE AUGUSTO DE LIMA', 'JOSÉ AUGUSTO DE MACEDO MAIA', 'JOSÉ AUGUSTO DE MOURA FILGUEIRA DUARTE', 'JOSÉ AUGUSTO JUNIOR', 'JOSÉ AUGUSTO SIQUEIRA DE LIRA', 'JOSÉ AUMAIR FERREIRA CAVALCANTE', 'JOSÉ AURELIO LARANJEIRA', 'JOSÉ AURICÉLIO TELES', 'JOSÉ AUSTECLÍNIO DOS SANTOS', 'JOSÉ AVANILTON OLIVEIRA MIRANDA', 'JOSÉ AVELAR FERNANDES LOPES', 'JOSÉ AVELAR RODRIGUES', 'JOSÉ AVELINO DOS SANTOS', 'JOSÉ BALBINO DE SIQUEIRA', 'JOSÉ BARBOSA DA SILVA', 'JOSÉ BARBOSA DE BARROS ', 'JOSÉ BARBOSA DE LIMA', 'JOSE BARBOSA DE SÁ', 'JOSÉ BARBOSA DOS SANTOS', 'JOSÉ BARBOZA DE MATOS', 'JOSÉ BARNABÉ DA SILVA FILHO', 'JOSÉ BARNABÉ SANTOS DE OLIVEIRA', 'JOSÉ BARREIROS SOBRINHO', 'JOSÉ BARRETO FILHO', 'JOSÉ BARRO FILHO', 'JOSÉ BARTOLOMEU DA ROCHA', 'JOSÉ BATISTA', 'JOSÉ BATISTA DA SILVA', 'JOSÉ BATISTA DE ARRUDA', 'JOSÉ BATISTA DE LIMA', 'JOSÉ BELARMINO DA CRUZ', 'JOSÉ BENEILDO DE MEDEIROS', 'JOSÉ BENÍCIO TORRES', 'JOSÉ BENTO DA SILVA', 'JOSÉ BERNARDINO NETO', 'JOSÉ BERNARDO DA SILVA NETO', 'JOSE BERNARDO DE MEDEIROS', 'JOSE BERNRDINO JUNIOR', 'JOSÉ BERTO DA SILVA', 'JOSE BESERRA NETO', 'JOSÉ BEVENUTO DOS SANTOS', 'JOSE BEZERRA DE CARVALHO', 'JOSÉ BEZERRA DE MASCENA', 'JOSÉ BEZERRA DOS SANTOS', 'JOSE BEZERRA MELO', 'JOSÉ BEZERRA NÁRIO', 'JOSÉ BIZERRA DOS SANTOS FILHO', 'JOSÉ BONIFACIO DANTAS DE ARAÚJO', 'JOSÉ BRAZ DO NASCIMENTO', 'JOSÉ BRITO DE SIQUEIRA', 'JOSÉ CABLOCO NETO', 'JOSÉ CABOCLO NETO', 'JOSÉ CADETE DA SILVA', 'JOSÉ CALÚDIO ALVES DE SIQUEIRA', 'JOSÉ CAMPOS OLIVEIRA', 'JOSÉ CÂNDIDO DA SILVA IRMÃO', 'JOSÉ CANDIDO DE BARROS', 'JOSÉ CÂNDIDO DUARTE', 'JOSÉ CARDOSO NETO', 'JOSE CARLOS ALVES DA SILVA', 'JOSÉ CARLOS ANTONIO SILVA', 'JOSÉ CARLOS ANTUNES LIMA', 'JOSÉ CARLOS AZEVEDO', 'JOSÉ CARLOS BARBOSA DINIZ', 'JOSÉ CARLOS CAMPOS CANTARELLI', 'JOSÉ CARLOS CARVALHO', 'JOSÉ CARLOS CAVALCANTE NOGUEIRA', 'JOSÉ CARLOS CONVERTIDO DA SILVA', 'JOSÉ CARLOS CRISPIM BARBOSA', 'JOSE CARLOS DA SILVA', 'JOSÉ CARLOS DE ARAÚJO', 'JOSÉ CARLOS DE LIMA', 'JOSÉ CARLOS DE LIMA ROSA', 'JOSÉ CARLOS DE SOUZA', 'JOSÉ CARLOS DINIZ DOS SANTOS', 'JOSE CARLOS DO NASCIMENTO', 'JOSÉ CARLOS FERNANDES NUNES', 'JOSÉ CARLOS FERREIRA BEZERRA', 'JOSÉ CARLOS FERREIRA FIGUEIREDO', 'JOSÉ CARLOS FILHO', 'JOSÉ CARLOS GONÇALVES DA SILVA', 'JOSÉ CARLOS LEITE MARIANO', 'JOSÉ CARLOS MATIAS', 'JOSE CARLOS MOURATO DA CRUZ', 'JOSÉ CARLOS MOURATO DA CRUZ', 'JOSÉ CARLOS NOGUEIRA', 'JOSÉ CARLOS NUNES', 'JOSÉ CARLOS OLIVEIRA DA COSTA', 'JOSE CARLOS PEREIRA BASTOS', 'JOSÉ CARLOS PEREIRA BASTOS', 'JOSÉ CARLOS PEREIRA DA SILVA', 'JOSE CARLOS PEREIRA DE SOUZA', 'JOSÉ CARLOS PEREIRA MAGALHÃES', 'JOSÉ CARLOS PESSÔA', 'JOSÉ CARLOS SILVA', 'JOSÉ CARLOS VIDAL LEITE', 'JOSÉ CARLOS VIEIRA', 'JOSÉ CARMELO DE FARIAS', 'JOSÉ CASSIMIRO DOS SANTOS', 'JOSÉ CAVALCANTE DE LIMA JÚNIOR', 'JOSÉ CAVALCANTE DE SOUZA', 'JOSÉ CAZER DE LIMA', 'JOSE CÉLIO PEREIRA', 'JOSÉ CELSO ALVES', 'JOSÉ CHAGAS DE ALMEIDA BRITO', 'JOSE CICERO ALVES', 'JOSÉ CÍCERO ALVES', 'JOSÉ CICERO ALVES FEITOZA', 'JOSÉ CÍCERO ALVES FEITOZA', 'JOSÉ CICERO DA SILVA', 'JOSÉ CÍCERO DA SILVA', 'JOSÉ CÍCERO DE LIMA', 'JOSÉ CICERO DE SÁ NETO', 'JOSÉ CÍCERO DE SÁ NETO', 'JOSÉ CÍCERO DE SOUZA', 'JOSÉ CICERO DO AMARAL', 'JOSÉ CÍCERO DOS SANTOS', 'JOSE CICERO LAURENTINO', 'JOSÉ CICERO MACHADO DE MELO', 'JOSE CICERO MONTEIRO CAVALCANTI', 'JOSÉ CÍCERO PEREIRA DE SÁ', 'JOSE CICIERO BEZERRA ', 'JOSÉ CIRILO DA SILVA', 'JOSÉ CIRILO DE MELO', 'JOSÉ CIRINO GONÇALVES', 'JOSÉ CIRO DE SOUSA', 'JOSÉ CLAUDEMIR DE BRITO QUEIROZ', 'JOSÉ CLAUDINO LEITE NETO', 'JOSÉ CLAUDIO ALVES DE SOUZA', 'JOSE CLAUDIO CLAUDINO', 'JOSÉ CLÁUDIO RODRIGUES DE MORAIS', 'JOSÉ CLEMENTE SIMÃO DA SILVA', 'JOSÉ CLEMENTINO RODRIGUES DOS SANTOS', 'JOSE CLEYTON BEZERRA', 'JOSÉ CONSTANTINO DOS SANTOS FILHO', 'JOSÉ CORDEIRO DE REZENDE FILHO', 'JOSÉ CORDEIRO DE SIQUEIRA', 'JOSÉ CORDEIRO SOBRINHO', 'JOSÉ CORDO DE ARAUJO', 'JOSE CORREIA SOBRINHO', 'JOSE COSTA NERES', 'JOSÉ DA CONCEIÇÃO', 'JOSÉ DA COSTA MONTEIRO', 'JOSÉ DA SILVA MELO', 'JOSÉ DA SILVA ROCHA', 'JOSÉ DALÍCIO BRANDÃO', 'JOSE DALTON DA ROCHA ', 'JOSÉ DALTON TEIXEIRA DA ROCHA', 'JOSÉ DAMIÃO CÂNDIDO DUARTE', 'JOSE DAMIÃO DA SILVA', 'JOSÉ DAMIÃO DA SILVA', 'JOSÉ DAMIÃO PEREIRA LIMA', 'JOSÉ DANIEL  CAMPOS DE MAGALHÃES', 'JOSÉ DANIEL SOBRINHO', 'JOSÉ DÁRIO DE AZEVEDO', 'JOSÉ DE ACENO FREIRES ', 'JOSÉ DE ALBUQUERQUE QUEIROZ', 'JOSÉ DE ALMEIDA BARROS', 'JOSÉ DE ALMEIDA PIRES NETO', 'JOSÉ DE ANCHIETA BARBOZA', 'JOSÉ DE ANCHIETA DA SILVA', 'JOSÉ DE ANCHIETA DA SILVA CRUZ', 'JOSE DE ANCHIETA SILVA NUNES', 'JOSE DE ARAÚJO CAVALCANTE', 'JOSE DE ARAUJO SILVA', 'JOSÉ DE ASSIS FREIRE', 'JOSÉ DE CARVALHO FLORêNCIO', 'JOSÉ DE CARVALHO ROSA', 'JOSÉ DE FRANÇA FERREIRA FILHO', 'JOSÉ DE JESUS OLIVEIRA CALDAS', 'JOSÉ DE LIMA FILHO', 'JOSÉ DE LIMA SANTOS', 'JOSÉ DE MELO LIMA', 'JOSÉ DE PAIVA FILHO', 'JOSÉ DE SANTANA RAMOS', 'JOSÉ DE SIQUEIRA SILVA', 'JOSÉ DE SOUSA BARROS', 'JOSÉ DE SOUSA FERRAZ JUNIOR', 'JOSE DE SOUZA BARROS', 'JOSÉ DE SOUZA BARROS', 'JOSÉ DE SOUZA GUERRA FILHO', 'JOSE DE SOUZA LIMA', 'JOSÉ DE SOUZA LIMA', 'JOSÉ DE SOUZA MELO', 'JOSÉ DÉCIO DA SILVA', 'JOSÉ DELMIRO DOS SANTOS', 'JOSÉ DEOCLECIANO DOS SANTOS', 'JOSÉ DIAS ARAÚJO', 'JOSÉ DIAS REIS', 'JOSÉ DILCO', 'JOSÉ DILSON DE BARROS', 'JOSE DINIZ ARAUJO CAMPOS ', 'JOSÉ DINIZ CARVALHO', 'JOSE DINIZ DO NASCIMENTO', 'JOSÉ DINIZ MANOEL DA SILVA', 'JOSE DINO  NETO', 'JOSÉ DIOMÉZIO DE SOUZA ALVES', 'JOSE DIONIZIO DE ARUJO', 'JOSÉ DIRCEU DE ARAUJO LIMA', 'JOSÉ DJALMA FERNANDES', 'JOSÉ DJALMA GUEDES DE BRITO', 'JOSÉ DO CARMO FILHO', 'JOSÉ DO CARMO SOUZA', 'JOSÉ DO NASCIMENTO PÊLO', 'JOSE DOMINGOS DE ANDRADE', 'JOSÉ DOMINGOS RODRIGUES', 'JOSÉ DOS SANTOS', 'JOSÉ DOS SANTOS BARBOSA', 'JOSÉ DOS SANTOS FILHO', 'JOSÉ DOUGLAS DE CARVALHO', 'JOSÉ DUSTAN CAVALCANTE FERRAZ', 'JOSÉ EDEILDO DE SOUZA AZEVÊDO', 'JOSÉ EDILDO DUARTE DOS SANTOS', 'JOSÉ EDILSON ALMEIDA ALVES', 'JOSÉ EDILSON DE BRITO', 'JOSÉ EDILSON SILVEIRA DA SILVA', 'JOSÉ EDIMILSON DA SILVA', 'JOSÉ EDIMILSON LIMA', 'JOSE EDIMUNDO FERNANDES', 'JOSÉ EDINALDO DOS SANTOS', 'José Edison da Silva', 'JOSE EDIVALDO DO NASCIMENTO  CRUZ', 'JOSÉ EDIVALDO FERREIRA GOIS', 'JOSÉ EDJAILSON DE MEDEIROS', 'JOSÉ EDMAR BEZERRA JUNIOR', 'JOSÉ EDMILSON DE LIMA', 'JOSÉ EDMILSON DE SANTANA MACENA', 'JOSÉ EDMILSON DE SOUZA', 'JOSÉ EDMILSON FERREIRA TERTO', 'JOSÉ EDNALDO FERREIRA GUIMARÃES ', 'JOSÉ EDNALDO TEOTONIO DO NASCIMENTO', 'JOSÉ EDSON ALVES DOS SANTOS', 'JOSÉ EDSON AUGUSTO BELARMINO', 'JOSÉ EDSON BARRETO', 'JOSÉ EDSON CORDEIRO', 'JOSÉ ÉDSON DE OLIVEIRA VIEIRA', 'JOSÉ EDSON FELIPE RAMALHO', 'JOSE EDSON FERREIRA DE LIMA ', 'JOSÉ EDSON FERREIRA DE LIMA ', 'JOSÉ EDSON GOMES DE LIMA', 'JOSÉ ÉDSON GOMES DO AMARAL', 'JOSÉ EDSON PEREIRA DE MORAES', 'JOSÉ EDSON QUEIROZ DOS SANTOS', 'JOSÉ EDSON RODRIGUES', 'JOSÉ EDSON RODRIGUES CAMPOS', 'JOSÉ EDSON VASCONCELOS LEITE', 'JOSÉ EDVALDO TORRES', 'JOSÉ EDVONALDO BEZERRA', 'JOSÉ EDVONALDO DOS SANTOS', 'JOSE EGYPTO VIEIRA  SOARES NETO', 'JOSÉ EILTON PEREIRA', 'JOSÉ ELCIO ALVES DA SILVA', 'JOSÉ ELDO DE SOUZA MOURA', 'JOSÉ ELIDÁRIO PEREIRA LEITE', 'JOSÉ ELIO FERREIRA LOPIS', 'JOSÉ ELVIS MIRANDA ALVES', 'JOSÉ EPAMINONDAS DA SILVA', 'JOSÉ ERALDO ALVES BEZERRA', 'JOSÉ ERALDO PEREIRA DINIZ', 'JOSÉ ERALDO SERAFIM', 'JOSÉ ERIBERTO DOS ANJOS', 'JOSÉ ERIVALDO DA SILVA', 'JOSÉ ERIVALDO DE ALMEIDA', 'JOSÉ ERIVALDO DE ANDRADE', 'JOSÉ ERIVALDO SILVA', 'JOSÉ ERIVAN RODRIGUES DOS SANTOS ', 'JOSÉ ERIVONALDO LIMA ALVES', 'JOSÉ ERIVONALDO NETO', 'JOSÉ ERIVONALDO QUEIROZ', 'JOSÉ ERMANO DOS SANTOS', 'JOSÉ ERMILSON GOMES SAMPAIO', 'JOSÉ ERMIRIO NUNES DA SILVA', 'JOSÉ ERNANDO DE SOUZA', 'JOSÉ ESMERALDO SAMPAIO BRITO', 'JOSE ESPEDITO DA SILVA', 'JOSÉ ESPEDITO DA SILVA', 'JOSÉ ESPEDITO DE BARROS', 'JOSÉ ETISON ALVES AMÂNCIO', 'JOSÉ EUCLIDES DE LIMA', 'JOSÉ EUDES ALVES DE LIMA', 'JOSÉ EUDES DA SILVA ', 'JOSÉ EUDES DE LIMA E SÁ', 'JOSÉ EUDES DE SOUZA PEREIRA', 'JOSÉ EUDES DOS SANTOS', 'JOSÉ EUDES FREIRE DO NASCIMENTO', 'JOSÉ EUFRASIO DE LIMA', 'JOSE EUFRAZIO FILHO', 'JOSÉ EULAMPIO DO NASCIMENTO', 'JOSÉ EUMAR ALENCAR DA ROCHA', 'JOSÉ EURICO PEREIRA DE OLIVEIRA', 'JOSÉ EUZÉBIO LOPES RABÊLO', 'JOSÉ EVALDO MARQUES DA SILVA', 'JOSÉ EVANDRO DA SILVA', 'JOSÉ EVANDRO DE LIMA CALDAS', 'JOSÉ EVANDRO VIRGINIO', 'JOSE EVANILDO NOGUEIRA DE SOUZA', 'JOSÉ EVARISTO DE SOUZA', 'JOSÉ EVERALDO CARDOSO GONDIN', 'JOSÉ EVERALDO GOMES', 'JOSÉ EVERALDO NOGUEIRA DE LIMA', 'JOSÉ EVERALDO PEREIRA ANTAS', 'JOSÉ EVERALDO RODRIGUES PATRIOTA', 'JOSÉ EVERARDO GOMES', 'JOSE EXPEDITO DA SILVA', 'JOSÉ EXPEDITO DE ARAÚJO', 'JOSE EXPEDITO QUEIROZ DA SILVA', 'JOSÉ EXPEDITO QUEIROZ DA SILVA', 'JOSÉ EZAU DA SILVA PEREIRA', 'JOSÉ EZEQUIAS LEAL', 'JOSÉ FEITOSA DE LIMA', 'JOSÉ FELIX DE AMORIM', 'JOSÉ FÉLIX DE ARAÚJO', 'JOSÉ FELIX DE LIMA', 'JOSÉ FELIX MORENO', 'JOSÉ FERNANDES DE ARAÚJO', 'JOSÉ FERNANDES FILHO', 'JOSÉ FERNANDES RABÊLO', 'JOSÉ FERNANDO ALVES BARROS', 'JOSÉ FERNANDO DA SILVA', 'JOSÉ FERNANDO SILVA', 'JOSÉ FERREIRA CAVALCANTI NETO', 'JOSÉ FERREIRA DA LUZ', 'JOSE FERREIRA DA SILVA', 'JOSÉ FERREIRA DA SILVA', 'JOSÉ FERREIRA DA SILVA FILHO', 'JOSÉ FERREIRA DE FARIAS', 'JOSÉ FERREIRA DE SOUZA', 'JOSE FERREIRA DELFINO', 'JOSE FERREIRA DOS ANJOS', 'JOSÉ FERREIRA DOS ANJOS', 'JOSÉ FERREIRA DOS SANTOS', 'JOSÉ FERREIRA FILHO', 'JOSÉ FERREIRA MARQUES', 'JOSE FILHO DOS SANTOS', 'JOSÉ FILHO FEITOZA DOS SANTOS', 'JOSE FILHO GOMES DOS SANTOS', 'JOSÉ FLOR DA SILVA', 'JOSÉ FLORENTINO', 'JOSÉ FLORENTINO DA SILVA', 'JOSÉ FLORENTINO DOS SANTOS', 'JOSÉ FLORIANO CAVALCANTE', 'JOSE FLOTENTINO DOS SANTOS', 'JOSÉ FRANCELINO DA SILVA', 'JOSÉ FRANCELINO NETO', 'JOSE FRANCISCO BRANDAO FILHO', 'JOSÉ FRANCISCO BRANDÃO FILHO', 'JOSE FRANCISCO DA SILVA', 'JOSÉ FRANCISCO DA SILVA', 'JOSÉ FRANCISCO DE CARVALHO', 'JOSÉ FRANCISCO DE OLIVEIRA', 'JOSÉ FRANCISCO DOS SANTOS', 'JOSE FRANCISCO FILHO', 'JOSÉ FRANCISCO FILHO', 'JOSÉ FRANCISCO GOIS DOS SANTOS', 'JOSE FRANCISCO GOMES DE MELO', 'JOSÉ FRANCISCO QUEIROZ', 'JOSÉ FRANK SINATRA RAMOS', 'JOSÉ FRANQUILINO DA SILVA', 'JOSÉ FRAZÃO DE MEDEIROS', 'JOSÉ FRAZÃO DE MEDEIROS NETO', 'JOSÉ FREDSON BARBOSA BARROS', 'JOSÉ FREIRA MARIZ FILHO', 'JOSE FREIRE GONDIM', 'JOSÉ FREIRE MARIZ FILHO', 'JOSE GABRIEL DA SILVA', 'JOSÉ GABRIEL DOS SANTOS ', 'JOSE GAIA NETO', 'JOSÉ GALDINO XAVIER', 'JOSÉ GALVÃO DA SILVA', 'JOSÉ GARCIA DE MOURA', 'JOSE GARCIA DOS SANTOS', 'JOSÉ GENILDO DA SILVA', 'JOSÉ GENIVALDO MOREIRA DA SILVA', 'JOSÉ GERALDO DE ARAÚJO', 'JOSÉ GERALDO DE OLIVEIRA', 'JOSÉ GERALDO DE SANTANA LEITE', 'José Geraldo Silva de Sousa', 'JOSÉ GERLANDE BESERRA', 'JOSE GERVASIO DE LACERDA', 'JOSÉ GERVÁSIO DE LACERDA', 'JOSÉ GIL RODRIGUES GALINDO ', 'JOSÉ GILBERTO ARAUJO PRINCIPE ', 'JOSÉ GILDO DA SILVA', 'JOSÉ GILDO DE SOUZA BARROS', 'JOSÉ GILSON DO NASCIMENTO', 'JOSÉ GILSON FLORENCIO DE ALMEIDA', 'JOSÉ GILSON MALAQUIAS', 'JOSE GILVAN DOS SANTOS', 'JOSÉ GILVAN PEREIRA MAGALHÃES', 'JOSÉ GILVAN PEREIRA SANTOS', 'JOSE GOMES DA SILVA', 'JOSÉ GOMES DE CAMPOS ', 'JOSE GOMES DE CARVALHO', 'JOSÉ GOMES DE CARVALHO', 'JOSE GOMES DE LIMA', 'JOSÉ GOMES DE MAGALHÃES ', 'JOSÉ GOMES DE MENEZES NETO', 'JOSÉ GOMES DE SÁ', 'JOSÉ GOMES DE SOUZA', 'JOSÉ GOMES DOS SANTOS', 'JOSÉ GOMES IRMÃO', 'JOSÉ GOMES TEIXEIRA', 'JOSE GOMES VICTOR ', 'JOSÉ GONÇALVES DA SILVA', 'JOSÉ GONÇALVES DE MORAIS', 'JOSÉ GONÇALVES DOS SANTOS', 'JOSÉ GONÇALVES FILHO', 'JOSE GONZAGA  DA SILVA', 'JOSÉ GONZAGA DA SILVA', 'JOSÉ GRACIEL GOMES', 'JOSÉ GREGORIO FILHO', 'JOSÉ GUARDIATO DOS SANTOS', 'JOSE GUILERME LEITE CAVALCANTE', 'JOSÉ HALDSON  FIGUEIREDO SANTOS', 'JOSÉ HELENO GOMES', 'JOSÉ HELENO RODRIGUES DE FIGUEIRÔA', 'JOSÉ HÉLIO CAVALCANTE DA SILVA', 'JOSÉ HÉLIO DE BARROS', 'JOSÉ HÉLIO DE REZENDE', 'JOSE HELIO LEAL', 'JOSÉ HÉLIO LEAL', 'JOSÉ HÉLIO LEITE', 'JOSE HELIO PIRES DE SA', 'JOSÉ HÉLIO PIRES DE SÁ', 'JOSÉ HÉLIO RUFINO', 'JOSÉ HÉLIO RUFINO ALVES', 'JOSÉ HENRIQUE NETO', 'JOSÉ HENRIQUES CORDEIRO', 'JOSÉ HERCULANO FERREIRA', 'JOSÉ HERMENEGILDO MEDEIROS MORATO', 'JOSÉ HILDO DA SILVA', 'JOSÉ HILDO DE LIMA SALVIANO', 'JOSE HILDO DO NASCIMENTO', 'JOSÉ HILDO GOMES DE BARROS', 'JOSÉ HILTON DA SILVA', 'JOSÉ HOMERO CAMPOS DE CARVALHO', 'JOSE HORACIO BRAZ FILHO', 'JOSÉ HUMBERTO ALVES DE SIQUEIRA ', 'JOSÉ HUMBERTO CORDEIRO SANTOS', 'JOSÉ HUMBERTO DA SILVA', 'JOSÉ HUMBERTO DE SOUZA', 'JOSÉ HUMBERTO PEREIRA MAGALHÃES', 'JOSÉ IDELFONSO SOARES FIRMINO', 'JOSÉ ILDO CARNEIRO DE OLINDA', 'JOSÉ ILDO DA SILVA', 'JOSÉ ILDO FERREIRA SILVA', 'JOSÉ ILDO LOPES DE LIMA', 'JOSÉ ILSON SIMÃO', 'JOSÉ INÁCIO DE OLIVEIRA', 'JOSÉ INÁCIO DE SOUZA NETO', 'JOSÉ INALDO CAMPOS DA SILVA', 'JOSÉ INALDO FERREIRA DE FREITAS', 'JOSÉ INANILDO DE SANTANA', 'JOSÉ INILDO GOMES DINIZ', 'JOSÉ IRAN DE OLIVEIRA BARROS', 'JOSÉ ISAIAS DE LIMA', 'JOSÉ ISAVAN DE OLIVEIRA', 'JOSÉ ISINALDO DA SILVA', 'JOSÉ ISMAR RODRIGUES DE LIMA', 'JOSÉ IVALDO DE LIMA', 'JOSÉ IVAN ANDRELINO', 'JOSÉ IVAN DA SILVA', 'JOSÉ IVANDIR ALVES DE OLIVEIRA', 'JOSÉ IVANEIDE DE LIMA', 'JOSÉ IVANILDO ARAÚJO', 'JOSÉ IVANILDO DE OLIVEIRA', 'JOSÉ IVANILDO SOBRINHO', 'JOSE IVO DE LIMA', 'JOSÉ IVO DE LIMA', 'JOSÉ IVO DUARTE DOS SANTOS', 'JOSÉ IVONALDO DA SILVA', 'JOSÉ IZIDORIO DOS SANTOS', 'JOSÉ JACINTO TORRES', 'JOSÉ JAILSON HIPÓLITO', 'JOSÉ JAILSON RIBEIRO', 'JOSÉ JAILTON MARTINIANO DA SILVA', 'JOSÉ JAIME DE OLIVEIRA ', 'JOSÉ JANILSON NOGUEIRA SILVA', 'JOSÉ JARED DE CARVALHO', 'JOSÉ JARMILDO ARRUDA CAMPOS', 'JOSÉ JERONIMO DA SILVA ', 'JOSÉ JESUS DA SILVA', 'JOSÉ JESUS DE SOUZA BEZERRA', 'JOSÉ JOÃO DE AMORIM', 'JOSÉ JOÃO DE MELO', 'JOSE JOÃO DE SANTANA', 'JOSÉ JOÃO DOS SANTOS', 'JOSÉ JOÃO FERREIRA', 'JOSÉ JOAQUIM DO NASCIMENTO', 'JOSÉ JOÉLIO FERREIRA DE CARVALHO', 'JOSÉ JORGE', 'JOSÉ JORGE DE ALMEIDA MELO', 'JOSÉ JORGE SOBRINHO', 'JOSE JOSEILDO DA SILVA', 'JOSÉ JOSIANO RODRIGUES DE MORAIS', 'JOSÉ JOSIAS FONTES', 'JOSE JOSIVAL DE SOUZA', 'JOSÉ JOSIVAL NEVES', 'JOSÉ JOSIVALDO DOS SANTOS', 'JOSÉ JOSY DUARTE', 'JOSÉ JUNIOR FILHO', 'JOSÉ JÚNIOR GOMES TENÓRIO', 'JOSÉ JÚNIOR PATRICIO DE ARAUJO', 'JOSE JURACI DE ALMEIDA CORDEIRO', 'JOSÉ JURACI DE ALMEIDA CORDEIRO', 'JOSÉ JURANDIR PIRES TEOTONIO', 'JOSE JUVENAL DE LIMA', 'JOSE JUVINO DE SIQUEIRA  ', 'JOSÉ LAELSON RODRIGUES DE MELO', 'JOSE LAERCIO DINIZ', 'JOSÉ LAERCIO SEVERO DA SILVA', 'JOSÉ LAERSON BERNARDINO', 'JOSÉ LAURENTINO DO NASCIMENTO NETO', 'JOSÉ LAURINDO DE SANTANA', 'JOSÉ LAURINDO DOS SANTOS', 'JOSÉ LAVOR DE SANTANA', 'JOSÉ LEANDRO BARBOSA ', 'JOSÉ LEANDRO PEDROSA ', 'JOSÉ LEÃO DUARTE FILHO', 'JOSÉ LEITE DA COSTA', 'JOSÉ LEITE FILHO', 'JOSÉ LEITE JÚNIOR', 'JOSÉ LEITE NAZARIO', 'JOSE LEITE NOGUEIRA', 'JOSÉ LEITE PADILHA FILHO', 'JOSE LENICIO LOPES', 'JOSÉ LENILDO MENDES QUEIROZ', 'JOSÉ LENILSON LOPES', 'JOSÉ LEOMARQUES SIQUEIRA DE DEUS', 'JOSÉ LEONARDO FILHO', 'JOSE LEÔNCIO CABRAL ', 'JOSÉ LEÔNCIO CABRAL', 'JOSE LIMA DE CAMPOS BARROS', 'JOSÉ LIMA DE CAMPOS BARROS', 'JOSÉ LIMA DIZI', 'JOSÉ LINDSON BELEM LIMA', 'JOSÉ LOPES DA SILVA', 'JOSÉ LOPES DA SILVA FILHO', 'JOSÉ LOPES DAVI', 'JOSE LOPES DE LIMA', 'JOSÉ LOPES FILHO', 'JOSÉ LOPES NOGUEIRA', 'JOSÉ LOPES SOBRINHO', 'JOSÉ LOURINALDO DE ANDRADE', 'JOSÉ LOURIVAL DOS ANJOS SILVA', 'JOSÉ LUCIANO ALVES', 'JOSÉ LUCIANO BEZERRA FILHO', 'JOSÉ LUCIANO DA CONCEIÇÃO', 'JOSÉ LUCIANO DE LIRA', 'JOSE LUCIANO DE MELO BATISTA', 'JOSÉ LUCIMÁRIO GOMES DA SILVA', 'JOSÉ LUIS PEREIRA', 'JOSÉ LUIZ DA SILVA', 'JOSÉ LUIZ DA SILVA FILHO', 'JOSÉ LUIZ DE FRANÇA', 'JOSÉ LUIZ DE MELO', 'JOSÉ LUIZ DE SANTANA ', 'JOSÉ LUIZ DE VASCONCELOS', 'JOSÉ LUIZ DOS SANTOS', 'JOSÉ LUIZ LIMA DE OLIVEIRA', 'JOSÉ LUIZ NOGUEIRA', 'JOSÉ LUIZ PEREIRA FILHO', 'JOSÉ LUMERIANO DO NASCIMENTO', 'JOSE MACELMO DE SOUZA MELO', 'JOSÉ MACHADO BENEVIDES', 'JOSÉ MACHADO DA SILVA', 'JOSÉ MACIEL PATRIOTA DA SILVA', 'JOSÉ MACIEL PEREIRA DE BRITO', 'JOSÉ MADEIRO FILHO', 'JOSE MANOEL DA SILVA', 'JOSÉ MANOEL DA SILVA', 'JOSÉ MANOEL DAMOS', 'JOSE MANOEL DANTAS', 'JOSÉ MANOEL DE FRANÇA', 'JOSÉ MANOEL DE LIMA', 'JOSÉ MANOEL DE SÁ', 'JOSÉ MANOEL DE SOUSA', 'JOSÉ MANOEL DE SOUZA', 'JOSÉ MANOEL DO AMARAL', 'JOSÉ MARCELINO DA SILVA', 'JOSÉ MARCELO MAGALHÃES CANTUNDA', 'JOSÉ MARCELO MAGALHÃES CATUNDA', 'JOSÉ MARCIO BEZERRA FERRAZ', 'JOSÉ MARCONE GONÇALVES', 'JOSÉ MARCONE RAMOS DE OLIVEIRA', 'JOSÉ MARCOS CAVALCANTE DE SOUZA', 'JOSÉ MARCOS DE SIQUEIRA', 'JOSÉ MARCOS DE VASCONCELOS CARVALHO', 'JOSÉ MARCOS LEMOS PADILHA', 'JOSÉ MARCOS RODRIGUES VIRGINIO ', 'JOSÉ MARIA  DOS SANTOS', 'JOSÉ MARIA CAVALCANTE DE MELO', 'JOSÉ MARIA FRANCO DA CRUZ', 'JOSE MARIA LEITE FERREIRA', 'JOSÉ MARIA NETO', 'JOSE MARIA PASSOS', 'JOSÉ MARIA PEREIRA', 'JOSÉ MARIA SIQUEIRA', 'JOSÉ MARIANO JUNIOR', 'JOSE MARINHO DE LIMA', 'JOSE MARIO CORDEIRO', 'JOSE MARIO DA SILVA', 'JOSÉ MARIO RAMOS DA SILVA', 'JOSÉ MÁRIO RAMOS DA SILVA', 'JOSÉ MARIO RAMOS DE CARVALHO', 'JOSÉ MARIO SANTOS ARAÚJO', 'JOSE MARLON PEREIRA DA SILVA ', 'JOSÉ MARLON PEREIRA DA SILVA', 'JOSÉ MARQUES DE FREITAS', 'JOSÉ MARQUES IRMÃO', 'JOSÉ MARTILIANO DA SILVA', 'JOSÉ MARTINS DOS SANTOS', 'JOSÉ MARTINS NETO', 'JOSÉ MATEUS DE FONTES NETO', 'JOSÉ MATIAS DOS SANTOS ', 'JOSÉ MATIAS JÚNIOR', 'JOSÉ MAURO CLEMENTE', 'JOSÉ MAURO DE MORAIS', 'JOSÉ MAURO MORAIS', 'JOSÉ MAX RODRIGUES SOARES', 'JOSÉ MAXIMO BEZERRA', 'JOSÉ MAXWELL NUNES CAMPOS ', 'JOSE MEDEIROS DE SIQUEIRA', 'JOSÉ MEDEIROS DE SOUZA', 'JOSÉ MEDEIROS LÚCIO', 'JOSE MENDES DA SILVA', 'JOSÉ MENDES DA SILVA', 'JOSÉ MENDES DOS SANTOS', 'JOSÉ MENEZES DE CARVALHO GODOY', 'JOSÉ MESSIAS DA ROCHA', 'JOSÉ MESSIAS DA SILVA', 'JOSE MIGUEL DOS SANTOS', 'JOSÉ MILTON FERREIRA DOS SANTOS', 'JOSE MIRANDA LUCENA', 'JOSÉ MITONIO MAGALHÃES', 'JOSÉ MOISÉS DA SILVA', 'JOSE MORENO DE SOUZA', 'JOSÉ MOURA DA SIlLA', 'JOSÉ MOURA DA SILVA', 'JOSE MOURA DE SIQUEIRA', 'JOSÉ MULATIM DA SILVA', 'JOSÉ NADILSON DA SILVA', 'JOSÉ NADILSON FERREIRA DE SIQUEIRA', 'JOSÉ NAELBON BEZERRA DA SILVA', 'JOSE NEIDE RODRIGUES DOS SANTOS', 'JOSÉ NEIDE RODRIGUES DOS SANTOS', 'JOSÉ NEILSON MARQUES VERAS', 'JOSÉ NESTOR DA SILVA', 'JOSE NETO DA SILVA', 'JOSÉ NETO HENRIQUE RIBEIRO', 'JOSÉ NETO LIMA', 'JOSÉ NETO NUNES DE LIMA', 'JOSÉ NEWTON DA SILVA', 'JOSÉ NICULAU DO NASCIMENTO', 'JOSÉ NILDO ALVES DO AMARAL', 'JOSE NILDO ALVES DOS REIS', 'JOSÉ NILDO ALVES DOS REIS', 'JOSÉ NILDO DE PAIVA', 'JOSÉ NILDO DO NASCIMENTO', 'JOSE NILDO FERREIRA DA SILVA', 'JOSÉ NILDO GOMES', 'JOSÉ NILDO LAURENTINO DOS SANTOS', 'JOSÉ NILDO MANOEL DE MELO', 'JOSÉ NILDO MARIANO FREIRE', 'JOSÉ NILDO RODRIGUES PESSOA', 'JOSÉ NILDO ROQUE DA SILVA', 'JOSE NILSON BARBOSA', 'JOSÉ NILSON BARBOSA', 'JOSÉ NILSON DA SILVA', 'JOSE NILSON DE OLIVEIRA', 'JOSÉ NILSON MARINHO DE LIMA', 'JOSÉ NILSON PEREIRA DE SOUSA', 'JOSÉ NILSON TORRES', 'JOSE NILTO DA SILVA', 'JOSÉ NILTON ALVES DE CARVALHO', 'JOSÉ NILTON BELO', 'JOSÉ NILTON DA SILVA FILHO', 'JOSÉ NILTON DE SOUZA JUNIOR', 'JOSÉ NILTON DOS SANTOS', 'JOSE NILTON LOPES DA SILVA', 'JOSÉ NILTON LOPES OLIVEIRA', 'JOSÉ NILTON NUNES', 'JOSE NIUDO MANOEL DE MELO', 'JOSÉ NIVALDO DE LIMA', 'JOSÉ NIVALDO DE MEDEIROS', 'JOSÉ NIVALDO DE MEDEIROS FRANCISCO ', 'JOSÉ NIVALDO DE SÁ', 'JOSÉ NIVALDO GALDINO DA SILVA', 'JOSÉ NOGUEIRA ALVES', 'JOSÉ NOGUEIRA DA SILVA', 'JOSÉ NOGUEIRA DE BARROS', 'JOSÉ NOGUEIRA DE CARVALHO FILHO', 'JOSÉ NOGUEIRA DE SOUZA', 'JOSÉ NOGUEIRA FILHO', 'JOSÉ NORMANDO LUCAS', 'JOSÉ NOVAS DE SÁ', 'JOSÉ NUNES BARBOSA', 'JOSÉ NUNES DE BARROS', 'JOSÉ NUNES DE CARVALHOI NETO', 'JOSÉ NUNES DE MAGALHÃES NETO', 'JOSÉ NUNES FILHO', 'JOSE NUNES MAGALHAES', 'JOSÉ NUNES NETO', 'JOSÉ NUNES PATRIOTA', 'JOSÉ ODIVAN COSTA MONTEIRO', 'JOSÉ OLEGARIO BISPO', 'JOSÉ OLEGÁRIO PIRES', 'JOSE OLIMPIO DA SILVA', 'JOSÉ OLIVEIRA DE LIMA', 'JOSÉ ORLANDO CAMPOS PEREIRA', 'JOSÉ ORLANDO DE MELO RODRIGUES', 'JOSÉ ORLANDO FERRAZ DE LIMA', 'JOSÉ ORLANDO FILHO', 'JOSÉ ORLANDO NOVAES FERRAZ', 'JOSÉ ORLANDO PEIXOTO DE BARROS', 'JOSÉ ORLANDO PEREIRA', 'JOSÉ OTACILIO DOS SANTOS', 'JOSE OTAVIANO DE BARROS', 'JOSÉ OTAVIANO DE BARROS', 'JOSÉ PACHECO DE LIMA', 'JOSÉ PACIFICO DE ANDRADE FILHO', 'JOSÉ PAIVA FILHO', 'JOSÉ PATRIOTA DE MEDEIROS', 'JOSÉ PAULINO DE AMORIM', 'JOSÉ PAULO DA SILVA', 'JOSÉ PAULO DE CAMPOS', 'JOSÉ PAULO DE LIMA ALVES', 'JOSÉ PAULO DE OLIVEIRA', 'JOSÉ PAULO DO MONTE', 'JOSÉ PAULO DO NASCIMENTO', 'JOSÉ PAULO FERREIRA DE MOURA', 'JOSE PAULO GOMES FLÔR', 'JOSÉ PAULO LEITE', 'JOSÉ PAULO PEREIRA DOS SANTOS', 'JOSÉ PAULO VIEIRA FILHO', 'JOSÉ PEDRO CAVALCANTE', 'JOSÉ PEDRO DA COSTA', 'JOSÉ PEDRO DA COSTA JÚNIOR', 'JOSÉ PEDRO DA SILVA', 'JOSÉ PEDRO DE SÁ', 'JOSE PEDRO DE SOUZA NETO', 'JOSÉ PEDRO DE SOUZA NETO', 'JOSÉ PEDRO DOS SANTOS', 'JOSÉ PEDRO GOMES DA COSTA', 'JOSÉ PEIXOTO DE ALBUQUERQUE', 'JOSÉ PEIXOTO DOS SANTOS FILHO', 'JOSÉ PEIXÔTO DOS SANTOS FILHO', 'JOSÉ PEQUENO DE MENEZES', 'JOSÉ PEREIRA DA LUZ', 'JOSÉ PEREIRA DA SILVA', 'JOSÉ PEREIRA DA SILVA LINS', 'JOSÉ PEREIRA DE ARRUDA', 'JOSE PEREIRA DE CARVALHO', 'JOSÉ PEREIRA DE CARVALHO IRMÃO', 'JOSÉ PEREIRA DE LIMA', 'JOSE PEREIRA DE MEDEIROS', 'JOSE PEREIRA DE SILVA SOUZA', 'JOSE PEREIRA DE SOUZA', 'JOSÉ PEREIRA DE SOUZA', 'JOSÉ PEREIRA FERRAZ', 'JOSÉ PEREIRA FILHO', 'JOSE PEREIRA LIMA', 'JOSE PEREIRA MARQUES', 'JOSÉ PEREIRA NICOLAU NETO ', 'JOSÉ PEREIRA NUNES', 'JOSE PEREIRA SOARES FILHO', 'JOSÉ PEREIRA VIEIRA', 'JOSÉ PILE CAVALCANTE', 'JOSÉ PINHEIRO DE BARROS', 'JOSÉ PINHEIRO DO MONTE', 'JOSÉ PINTO DE MEDEIROS FILHO', 'JOSÉ PINTO DE MENDONÇA FILHO', 'JOSÉ PINTO NETO', 'JOSÉ PLÍNIO VIEIRA DE SOUSA', 'JOSÉ PRAXEDES DA SILVA', 'JOSÉ PROCÓPIO DA SILVA', 'JOSÉ PROFIRO VILELA', 'JOSÉ QUEIROZ BARBOZA', 'JOSÉ QUEIROZ DE LIMA', 'JOSÉ QUINTINO GUIMARÃES NETO', 'JOSÉ QUIXABEIRA DA SILVA', 'JOSÉ RAFAEL DO NASCIMENTO ', 'JOSÉ RAFAEL VIEIRA COSTA', 'JOSÉ RAIMUNDO DA COSTA', 'JOSE RAIMUNDO DA SILVA FILHO', 'JOSE RAIMUNDO DE SOUZA', 'JOSE RAIMUNDO FILHO', 'JOSÉ RAMALHO', 'JOSÉ RAMALHO DE SOUZA', 'JOSÉ RAMOS DE CARVALHO', 'JOSÉ RAMOS SILVA', 'JOSÉ RANGEL DE SOUSA', 'JOSÉ REFERINO DE SOUSA NETO ', 'JOSÉ REGINALDO DA SILVA', 'JOSÉ REGINALDO MARQUES NOGUEIRA', 'JOSÉ REGINALDO MENDONÇA LEAL', 'JOSÉ RENILDO POSSIDÔNIO', 'JOSE RENILSON DO NASCIMENTO', 'JOSÉ RENÓRIO DE MORAES', 'JOSÉ RIBAMAR DE SOUZA OLIVEIRA', 'JOSÉ RIBAMAR MEDEIROS DE QUEIROZ', 'JOSÉ RIBAMAR PEREIRA LIMA', 'JOSÉ RICARDO DE GOIS NETO', 'JOSÉ RILDO CORDEIRO', 'JOSÉ RILDO DE ALMEIDA', 'JOSÉ RINALDO DE SÁ LEAL', 'JOSÉ RINALDO FERREIRA DE SOUSA', 'JOSÉ RINALDO OLIVEIRA SILVA', 'JOSÉ RINALDO PIRES BEZERRA', 'JOSÉ RIVALDO DAMIÃO DA SILVA', 'JOSÉ RIVALDO PEREIRA DE CARVALHO', 'JOSÉ RIVALDO RODRIGUES', 'JOSÉ RIVANADO LIMEIRA DOS SANTOS', 'JOSÉ ROBÉRIO DE OLIVEIRA SILVA ', 'JOSÉ ROBERTO ANDRADE ARAÚJO', 'JOSÉ ROBERTO BEESERRA DA SILVA', 'JOSÉ ROBERTO BEZERRA DA FONSÊCA', 'JOSÉ ROBERTO CHAVES DINIZ', 'JOSÉ ROBERTO COELHO DO AMARAL', 'JOSÉ ROBERTO CORDEIRO DA SILVA', 'JOSÉ ROBERTO DE SÁ', 'JOSÉ ROBERTO DE SOUZA', 'JOSÉ ROBERTO DO AMARAL NICÁCIO', 'JOSÉ ROBERTO DO NASCIMENTO', 'JOSÉ ROBERTO FRANCISCO BAIO', 'JOSÉ ROBERTO GONÇALVES CABRAL', 'JOSÉ ROBERTO MARIANO DA SILVA', 'JOSÉ ROBERTO MARIANO FIGUERÔA', 'JOSÉ ROBERTO MARQUES DA SILVA', 'JOSÉ ROBERTO PARENTE PEREIRA', 'JOSÉ ROBERTO QUEIROZ DA SILVA', 'JOSÉ ROBERTO RIBEIRO', 'JOSÉ ROBERTO VIEIRA FERREIRA', 'JOSE ROBERTO XAVIER DE QUEIROZ', 'JOSÉ RODRIGUES DE ANDRADE', 'JOSÉ RODRIGUES DE CARVALHO', 'JOSÉ RODRIGUES DE MEDEIROS', 'JOSÉ RODRIGUES DE MELO', 'JOSÉ RODRIGUES DOS SANTOS', 'JOSÉ RODRIGUES FERREIRA', 'JOSÉ RODRIGUES FILHO', 'JOSÉ RODRIGUES SOBRINHO', 'JOSE ROGERIO DE LIMA', 'JOSÉ ROLIM DA SILVA ', 'JOSE ROMARIO DIAS', 'JOSÉ ROMÉLIO NUNES', 'JOSÉ ROMÉRIO DA SILVA', 'JOSÉ ROMÉRIO DE OLIVEIRA', 'JOSÉ ROMÉRIO MENDES DA SILVA', 'JOSÉ ROMERO MUNIZ ARRUDA', 'JOSÉ ROMILDO ALVES SIQUEIRA', 'JOSÉ ROMILDO BARBOSA', 'JOSÉ ROMILDO RODRIGUES DE AQUINO', 'JOSE ROMULO SEVERO DE LIMA', 'JOSÉ RONALDO DA COSTA LIMA', 'JOSÉ RONALDO DE ARAUJO MOREIRA', 'JOSÉ RONALDO DE SIQUEIRA LOPES', 'JOSÉ RONALDO DO NASCIMENTO', 'JOSÉ RONALDO FERREIRA DA SILVA', 'JOSÉ RONALDO PEREIRA DINIZ', 'JOSÉ RONALDO TIMOTEO LACERDA', 'JOSÉ RONALDO XAVIER DE MOURA ALVES', 'JOSE RONIVALDO DE LIMA', 'JOSÉ RONIVALDO DE LIMA', 'JOSE RONOLFO DODATO', 'JOSÉ ROQUE DA PENHA ', 'JOSÉ ROQUE DE SOUZA', 'JOSÉ ROSIEL VITOR DOS SANTOS', 'JOSÉ ROSINALDO DE MELO FREITAS', 'JOSÉ ROSINALDO XAVIER DE MAURA ALVES', 'JOSÉ RUFINO DE BARROS', 'JOSÉ SABASTIÃO DA SILVA', 'JOSÉ SABASTIÃO DE LIMA', 'JOSE SAMPAIO DE OLIVEIRA', 'JOSÉ SAMPAIO DE OLIVEIRA NETO', 'JOSÉ SAMUEL MARINHO DA SILVA', 'JOSÉ SANTANA  DE LIMA', 'JOSÉ SANTANA DE LIMA', 'José Santana dos Santos', 'JOSÉ SANTOS DE SOUZA', 'JOSE SEBASTIÃO DE SOUZA FILHO', 'JOSÉ SELSO BARBOSA HERCULANO', 'JOSÉ SENHOR GOMES NETO', 'JOSÉ SERAFIM BARBOSA', 'JOSÉ SERGIO IRAN DA SILVA', 'JOSE SERGIO VIEIRA CARVALHEDO', 'JOSE SEVERINO DA SILVA', 'JOSÉ SEVERINO DA SILVA', 'JOSE SEVERINO DE LIMA', 'JOSÉ SEVERINO DO NASCIMENTO', 'JOSÉ SEVERINO DOS SANTOS ', 'JOSÉ SEVERINO DUARTE', 'JOSE SEVERO DE LIMA', 'JOSÉ SEVERO NETO', 'JOSÉ SIDNEY BARBOSA LOPES', 'JOSE SILDO PEREIRA DA SILVA', 'JOSÉ SILDO PEREIRA DA SILVA', 'JOSÉ SILVA DO CARMO', 'JOSÉ SILVIO FERNANDES', 'JOSÉ SIMÃO DA SILVA', 'JOSÉ SIMÃO RAMOS', 'JOSÉ SIMÕES DE MOURA FILHO', 'JOSÉ SINALDO LEITE DE MELO', 'JOSÉ SINVAL DE LACERDA', 'JOSÉ SIQUEIRA DA SILVA', 'JOSÉ SIRLANDO SIQUEIRA', 'JOSÉ SITÔNIO DE CARVALHO', 'JOSE SITONIO RODRIGUES', 'JOSÉ SOARES CAVALCANTI', 'JOSÉ SOARES DA SILVA', 'JOSE SOARES DA SILVA FILHO', 'JOSÉ SOARES DA SILVA JÚNIOR', 'JOSÉ SOARES DE LIMA ', 'JOSÉ SOARES DE MORAIS', 'JOSÉ SOARES SOBRINHO', 'JOSÉ SOBREIRA LIMA', 'JOSÉ SOUZA BARROS', 'JOSÉ SOUZA FERRAZ', 'JOSÉ TADEU ALVES DE SOUZA', 'JOSÉ TADEU DANTAS CORDEIRO', 'JOSÉ TADEU DE LIMA', 'JOSÉ TARCISIO DE ARAÚJO', 'JOSÉ TELES NETO', 'JOSÉ TEMOTEO BRAZIL', 'JOSÉ TENÓRIO DO AMARAL', 'JOSÉ TEÓFILO DA SILVA', 'JOSÉ TEONE DOS SANTOS', 'JOSÉ TIBURCIO DA SILVA ', 'JOSE TIMOTEO DE LIMA', 'JOSÉ TINÉ SOBRINHO', 'JOSÉ TORQUATO DE SOUSA', 'JOSÉ TÔRRES  LOPES FILHO', 'JOSÉ UBIRAJARA ALVES', 'JOSE UBIRAJARA GOMES JUCA', 'JOSÉ UÉLLINGTON FERREIRA DE LIMA', 'JOSÉ UMBELINO NICÁCIO DA SILVA', 'JOSÉ UMBERTO ALVES DE SIQUEIRA', 'JOSÉ UMBERTO SOUZA DE OLIVRIRA', 'JOSE VALDECI DE SOUZA', 'JOSÉ VALDELIO DA SILVA', 'JOSÉ VALDEMAR AMARAL DA SILVA', 'JOSÉ VALDEMICIO GERALDO BARBOSA', 'JOSÉ VALDEMILSON DE SOUZA', 'JOSÉ VALDENILDO DE MORAES', 'JOSE VALDIR XAVIER DE QUEIROZ', 'JOSÉ VALDO PEREIRA DE VALÕES', 'JOSÉ VALEMTIM DE SOUZA', 'JOSÉ VALENTIM DE SOUZA', 'JOSÉ VALERIANO DE LIMA', 'JOSÉ VALMIR', 'JOSÉ VALMIR FERRAZ', 'JOSE VALTER LEANDRO DE LIMA', 'JOSÉ VALTER PEREIRA', 'JOSÉ VANALDO DE SOUZA', 'JOSÉ VANDERLEI FEITOSA', 'JOSE VANDERLUCIO DE AZEVEDO LIMA', 'JOSÉ VANDUY DA COSTA', 'JOSÉ VANILDO PEREIRA', 'JOSÉ VANILDO VITAL DE LIMA', 'JOSÉ VANZEILDO CIPRIANO ARAUJO', 'JOSÉ VENANCIO NOGUEIRA', 'JOSÉ VENCESLAU TOMÉ', 'JOSÉ VENILSON LEANDRO DA SILVA', 'JOSÉ VENTURA DA SILVA', 'JOSE VENTURA DE ANDRADE JUNIOR', 'JOSÉ VENTURA FERREIRA DA SILVA', 'JOSÉ VERNANDO RAMOS', 'JOSÉ VERONILDO NOGUEIRA', 'JOSÉ VIANA DE MOURA', 'JOSÉ VIANA PATRIOTA FILHO', 'JOSÉ VIANEI DE ARAÚJO', 'JOSÉ VIANEY NOGUEIRA', 'JOSÉ VICENTE DE ARAUJO', 'JOSÉ VICENTE DE SOUZA', 'JOSE VICENTE NETO', 'JOSÉ VICENTE NETO', 'JOSÉ VICENTE VIEIRA', 'JOSÉ VIEIRA DOS SANTOS', 'JOSÉ VIEIRA FILHO', 'JOSÉ VIEIRA GUABIRABA', 'JOSÉ VIEIRA RODRIGUES', 'JOSÉ VITAL BARBOSA DE LIMA', 'JOSE VITORINO DO CARMO', 'JOSÉ VITORINO DOS SANTOS', 'JOSE VITORINO NETO', 'JOSÉ WANDERLEY DE SOUZA SANTOS', 'JOSÉ WANDERLEY DO NASCIMENTO', 'JOSÉ WANDERLEY NETO', 'JOSE WELLINGTON FREITAS', 'JOSÉ WELLINGTON SAMPAIO FILHO', 'JOSÉ WHELITON RODRIGUES DE ALMEIDA', 'JOSÉ WILAMY CAMPOS', 'JOSÉ WILLANES JANUARIO', 'JOSE WILLIAMS ZACARIAS DE LIMA', 'JOSÉ WILSON DA SILVA QUEIROZ', 'JOSÉ WILSON PEREIRA DE AGUIAR', 'JOSÉ WILSON VIEIRA LIMA', 'JOSE XAVIER DE LIMA', 'JOSÉ XAVIER DOS REIS', 'JOSÉ ZENILSON RODRIGUES DE MELO', 'JOSE ZITO BARBOSA', 'JOSÉ ZUZA DE LUCENA', 'JOSEALDO GONZAGA DA CONCEIÇÃO', 'JOSEAN LEITE DE OLIVEIRA', 'JOSEANO BENTO DE AQUINO', 'JOSECI ALVES CABRAL', 'JOSEFA FERNANDES DE OLIVEIRA', 'JOSEFRAN TEIXEIRA SAMPAIO', 'JOSEILDES RODRIGUES DE CARVALHO', 'JOSEILDO ALVES DE CARVALHO', 'JOSEILDO BEZERRA DA SILVA', 'JOSEILDO FERREIRA DE CARVALHO', 'JOSEILDO FREIRE GOMES', 'JOSEILDO SERAFIM DE DEUS', 'JOSEILDO SIQUEIRA LIBERAL', 'JOSEILTON ALVES DE LIMA', 'JOSEILTON GOMES DE OLIVEIRA', 'JOSELE DOMINGOS DA SILVA', 'JOSELHO BATISTA DINIZ', 'JOSELINO VIEIRA', 'JOSÉLIO ALVES DA SILVA', 'JOSÉLIO CARDOSO ESTIMA', 'JOSÉLIO PEREIRA DE SOUSA', 'JOSELIO PEREIRA MARINHO', 'JOSELITO NOGUEIRA DO NASCIMENTO', 'JOSELITO PEREIRA DA SILVA', 'JOSELITO RAMALHO DA SILVA', 'JOSELITO SILVA SIQUEIRA', 'JOSELITO VERISSÍMO DA SILVA', 'JOSEMAR ANTONIO DE LIMA', 'JOSEMAR DOS SANTOS ', 'JOSEMAR FERREIRA DE SOUZA ', 'JOSEMAR JOSÉ ANTÔNIO DO CARMO', 'JOSEMAR MENDES RODRIGUES', 'JOSEMAR SILVA CONCEIÇÃO', 'JOSEMÁRIO DE LIMA ALVES', 'JOSEMARYSON DAMASCENA BEZERRA', 'JOSÉMIGUEL DE BRITO IRMÃO', 'JOSEMIR PEREIRA SOARES', 'JOSENAIDE SIQUEIRA DE OLIVEIRA', 'JOSENALDO ALVES DE SOUZA', 'JOSENALDO BATISTA DOS SANTOS ', 'JOSENALDO NUNES PEREIRA', 'JOSENI JOÃO DE LIMA', 'JOSENILDO ANTONIO DE LIMA', 'JOSENILDO AVELINO DA SILVA', 'JOSENILDO BEZERRA LACERDA', 'JOSENILDO DA SILVA', 'JOSENILDO GOMES DE PÁDUA', 'JOSENILDO LEONILTON NOGUEIRA SILVA', 'JOSENILDO PEREIRA DE LIMA', 'JOSENILDO SILVA DE GOES', 'JOSENILDO SIQUEIRA LIMA', 'JOSENILDO SOARES DO NASCIMENTO', 'JOSENILTON ALVES DE SOUZA', 'JOSENILTON SIMÕES DE MEDEIROS', 'JOSENIR RODRIGUES DA SILVA', 'JOSENITO JOSÉ REZENDE DA SILVA', 'JOSÉR MIGUEL CORDEIRO', 'JOSERLÂNDIO ALVES DA SILVA', 'JOSESMAR GOMES DUARTE ', 'JOSETE RODRIGUES DE OLIVEIRA', 'JOSEVALDO GOMES DUARTE ', 'JOSEVALDO MENDES DE SIQUEIRA', 'JOSEVAN PINHEIRO DA SILVA', 'JOSEZITO FLORENTINO DE OLIVEIRA', 'JOSIANO DE SOUSA SIMÕES', 'JOSIAS ALEXANDRINO FILHO ', 'JOSIAS FERREIRA DE FREITAS', 'JOSIAS FLORO GOMES DA SILVA', 'JOSIAS PEREIRA DA SILVA ', 'JOSIAS PEREIRA DE CARVALHO', 'JOSIBERTO SOARES ALVES ', 'JOSIEL RODRIGUES DOS SANTOS', 'JOSILSON JOSÉ DE LIMA', 'JOSIMAR ALVES DE LIMA', 'JOSIMAR BERNARDO VITAL', 'JOSIMAR DOS SANTOS LEITE', 'JOSIMAR MIGUEL RAIMUNDO', 'JOSIMAR PEREIRA LEITE', 'JOSIMAR PEREIRA SIDRIM FILHO', 'JOSIMAR PIRES DA SILVA', 'JOSIMAR ROBERTO BEZERRA DE SÁ', 'JOSIMAR RUMÃO BARBOZA', 'JOSIMAR VIEIRA SALVADOR', 'JOSIMÁRIO CORDEIRO FLORENTINO', 'JOSINALDO BRASILIANO SOARES', 'JOSINALDO FERRAZ DINIZ', 'JOSINALDO FLORENTINO DOS SANTOS', 'JOSINALDO INÁCIO ALVES', 'JOSINALDO PEREIRA DE SOUZA', 'JOSINALDO RODRIGUES DA SILVA', 'JOSINETE LIMA DE OLIVEIRA', 'JOSINO HENRIQUE SOBRINHO', 'JOSINO JANUARIO DA SILVA', 'JOSINO JOSÉ DOS SANTOS', 'JOSIVALDO CORDEIRO DE MELO', 'JOSIVALDO DE SOUZA', 'JOSIVALDO FERNANDES DA CUNHA', 'JOSIVALDO NUNES DE OLIVEIRA', 'JOSIVALDO NUNES DE SIQUEIRA', 'JOSIVALDO OLINDO DE LIMA', 'JOSIVALDO SIMPLICIO NUNES', 'JOSIVAN BARBOSA DINIZ ', 'JOSIVAN CORREIA DE MELO', 'JOSIVAN joSÉ DE RESENDE', 'JOSIVAN PEREIRA DO AMARAL', 'JOSSE ALVES DA SILVA', 'JOSSIMAR CORREIA DE MELO', 'JOSUE DE LIRA', 'JOSUÉ FERREIRA PAIVA', 'JOSUÉ MATIAS LEITE', 'JOSUE PEDRO DE SOUZA ', 'JOSUEL BEZERRA DA SILVA', 'JOSUELDO LOPES MACEDO', 'JOSUILTON LEITE DE SOUZA', 'JOTANILTON CICERO BEZERRA', 'JOTANILTON CÍCERO BEZERRA', 'JOVELINO BISPO DO NASCIMENTO', 'JOZANILDO JOÃO DE SOUZA', 'JOZENILDO DE FRANÇA BARBOSA', 'JOZIMAR ARAÚJO DA CRUZ', 'JOZINALDO DE FRANÇA BARBOZA', 'JOZUETE JACINTO DE LIMA', 'JUACÍ ALVES DA SILVA', 'JUAREZ BARBOSA DE OLIVEIRA', 'JUAREZ FERREIRA DE FREITAS', 'JUAREZ FILGUEIRA SAMPAIO', 'JUAREZ FLORENTINO DE CARVALHO', 'JUAREZ MARQUES DE CARVALHO', 'JUAREZ MARQUES DE LIMA', 'JUAREZ PEREIRA DE SIQUEIRA', 'JUAREZ VITOR DOS SANTOS', 'JUBERVALDO CABRAL', 'JUBIRITAN MOREIRA DE LEMOS', 'JUCEILDO AUGUSTO DA SILVA', 'JUCIMAR ALVES EVANGELISTA', 'JUDAS JOSÉ DE SOUZA GUERRA', 'JUDAS TADEU DE MENEZES', 'JUDAS TADEU ROSAS MAGALHÃES', 'JUDIVAN AVELINO NETO', 'JUDIVAN PAES SILVA', 'JULIAN FRANCO DE BRITO FERREIRA', 'JULIANO CLÁUDIO DE GÓIS LIMA', 'JULIÃO RAIMUNDO DE FARIAS', 'JULIDARY RODRIGUES DE SOUZA', 'JULIE BENICIO DE OLIVEIRA', 'JULIO ALVES GUIMARÃES ', 'JÚLIO CÉSAR PEREIRA DA SILVA', 'JULIO DA SILVA FERREIRA', 'JULIO DEA SILVA FERREIRA', 'JULIO FERNANDES TELES', 'JULIO FERREIRA DOS SANTOS', 'JULIO FRANCISCO FILHO ', 'JÚNIOR INÁCIO DA SILVA', 'JÚNIOR MACENA DA SILVA', 'JUNIOR MANOEL DE CAMPOS', 'JUNY BARBOSA DOS SANTOS', 'JURACI ALVES DE SOUSA', 'JURACI ANTONIO DE SIQUEIRA', 'JURACÍ BEZERRA DA SILVA ', 'JURACI BEZERRA LEITE', 'JURACI DANTAS DO NASCIMENTO', 'JURACI MONTEIRO', 'JURACY VASCINCELOS GALDINO', 'JURANDI ALVES DA SILVA FILHO', 'JURANDI ANTONIO DA SILVA', 'JURANDI BARROS DA SILVA', 'JURANDÍ BARROS DA SILVA', 'JURANDI BATISTA DE SOUZA', 'JURANDI BERNADO DA SILVA', 'JURANDI NOGUEIRA DE MENEZES', 'JURANDI RODRIGUES VIEIRA', 'JURANDIR ÂNGELO RODRIGUES', 'JURANDIR BESERRA DA SILVA', 'JURANDIR FELIX DA SILVA', 'JURANDIR JARDIM MORAES', 'JURANDIR MARIANO DA SILVA', 'JURANDIR MORAES DOS SANTOS', 'JURANDIR RODRIGUES DE LIMA', 'JURANDY SIMÕES JERRY', 'JURANDYECKON JOSE VIEIRA DOS SANTOS', 'JURANDYECKSON JOSÉ VIEIRA DOS SANTOS', 'JUSCELINO MARQUES DE LIMA', 'JUSCELINO PEREIRA DE SOUZA', 'JUSCELINO PIRES DE SOUZA', 'JUSCIANO MIGUEL DOS SANTOS', 'JUSIÉ BARBOSA', 'JUSILEUDO TAVARES DE LIMA', 'JUSSIÊ BATISTA DA SILVA', 'JUSTINO MEDEIROS NETO', 'JUSTO DE SOUZA MAGALHÃES', 'JUSTO JOÃO DE ARAUJO', 'JUSTO LACERDA', 'JUVANEIS GOMES DUARTE', 'JUVANI ANTONIO DE OLIVEIRA', 'JUVENAL ALVES DO NASCIMENTO', 'JUVENAL ANTONIO DE SÁ', 'JUVENAL PEREIRA DA SILVA', 'JUVENAL PEREIRA DE ARAUJO', 'JUVENAL TELES PEREIRA', 'JUVENCIO DA SILVA SIMÕES', 'JUVENIL FERREIRA DA SILVA', 'JUVENILDO MIGUEL DOS SANTOS', 'JUZIVAN NUNES DE MAGALHÃES', 'KARLOS CHRISTOPHER ALVES ALVES NOGUEIRA', 'KENNEDY GLEISSIANO ALVES NOGUEIRA', 'KERGINALDO DINIZ NOVAES CARVALHO', 'Kildares Gomes Farias', 'KLEBER BEZERRA BARROS', 'KLEBER JOSÉ MOURA LINS', 'KLERISTON PEREIRA DA SILVA', 'LAÉCIO ALVES CAVALCANTI', 'LAEDSON GOMES DOS SANTOS', 'LAÉRCIO ALVES DE SOUSA', 'LAERCIO ARRUDA FERRAZ', 'LAERCIO CLEMENTINO LEITE DE SÁ', 'LAÉRCIO CLEMENTINO LEITE DE SÁ', 'LAÉRCIO VICENTE DA SILVA', 'LAERTE PAIVA DA SILVA', 'LAESTE ALVES MELO', 'LAIRES PAIVA DA SILVA', 'LAÍRES PAIVA DA SILVA', 'LAUDIÉCIO ANTONIO DE LIMA', 'LAUDIÉCIO ANTÔNIO DE LIMA', 'LAUREANO LOPES DA SILVA', 'LAURINALDO DE SOUSA DUTRA', 'LAURINDO  VITO LOPES', 'LAURINDO ALVES DE SOUZA', 'LAURINDO DE SOUSA NETO', 'LAURINDO LEANDRO DA SILVA', 'LAURINDO PEREIRA LIMA', 'LAURINDO VITO GAMBARRA', 'LAURISMAR NUNES DE MOURA', 'LAYDSON BEZERRA CABRAL LIMA', 'LÁZARO ROBERTO DOS SANTOS', 'LEANDRO FONSECA DA SILVA', 'LÉCIO APARECIDO FERRAZ DE ARAUJO', 'LÉCIO APARECIDO FERRAZ DE ARAÚJO', 'LEDMARCOS SOUSA NOGUEIRA', 'LEDMARCOS SOUZA NOGUEIRA', 'LEDVANILSON LUCINDO DE LIMA ', 'LEIDVAN CRISTOVAM SOUZA NOGUEIRA', 'LEINAD ED SALERTSE LEMOS CAVALCANTI', 'LEJEUNE JOSÉ BARBOSA', 'LENDINALDO DE OLIVEIRA SOUSA', 'LENICIO ELIAS DOS SANTOS', 'LENILTON ROSA DE SÁ', 'LENIVALDO LEITE DE SOUSA', 'LENIVALDO LEITE DE SOUZA', 'LENIVALDO LETE SOUSA', 'LENIVALDO RODRIGUES DA SILVA', 'LEOMAX ROBERTO DE SANTANA', 'LEONARDO DE SIQUEIRA CAMPOS', 'LEONARDO LOURENÇO DE SOUZA', 'LEONARDO PETERSON HIPOLITO DE OLIVEIRA', 'LEONARDO RODRIGUES DE  MOURA', 'LEONARDO RODRIGUES DOS SANTOS', 'LEONARDO SILVA CORREIA', 'LEONCIO BARBOSA DA SILVA', 'LEONEL ALVES SOBRINHO', 'LEONIDAS FERREIRA RABELO', 'LEONIDAS MARIANO DE SOUZA', 'LEONIDAS PEREIRA DE MENESES', 'LEONIDAS SABINO DE SOUSA', 'LEONILDO VIEIRA', 'LEONILSON  ISIDIO DOS SANTOS', 'LEONILZIO CARVALHO DA SILVA', 'LEONIZIO BEZERRA DE BRITO', 'LEONÍZIO HERMINIO DA SILVA', 'LERACIO NOBRE DE VERAS', 'LEUDRIANO DE LIMA SILVA', 'LEYDSON HENRY VIANA BATISTA', 'LIBÓRIO DA SILVA', 'LIBORIO MARIANO RAMOS', 'LICARIÃO ALVES FREIRE', 'LIMDEMBERG DE CARVALHO BARBOSA', 'LINALDO ANTONIO DOS SANTOS', 'LINALDO GOMES BEZERRA ', 'LINALDO PEREIRA DE SOUZA', 'LINCOLIN TORRES BANDEIRA', 'LINDALBERTO BRUNO GOMES DA SILVA', 'LINDEMBERG DE CARVALHO BARBOSA', 'LINDEMBERG GALDINO NEVES', 'LINDEMBERG JORDÃO MONTEIRO', 'LINDEMBERGUE DE OLIVEIRA', 'LINDIVAL LEITE CARVALHO', 'LINDOLFO DE OLIVEIRA PIMENTEL', 'LINDOLFO FERRAZ DA SILVA', 'LINDOMAR ALVES DE LIMA', 'LINDOMAR ANDRÉ CARNEIRO', 'LINDOMAR AUGUSTO DE LIMA', 'LINDOMAR BERNARDINO SANTANA', 'LINDOMAR INÁCIO DE SOUZA', 'LINDOMAR RODRIGUES MAGALHÃES', 'LINDOMAR TELES DA SILVA', 'LINDOMAR TELES DE SILVA', 'LINDON JONHSON ALVES', 'LINDOVAL ANTONIO DA SILVA', 'LINO NICOLAU DE OLIVEIRA', 'LIOZIPIO DE SOUZA NETO', 'LISARB BEZERRA DO NASCIMENTO', 'LISDÊNIO LEÔNIDAS DA SILVA', 'LISNAILTON ANTONIO DOS SANTOS', 'LIUZ CARLOS FERREIRA', 'LIZ CARLOS VIEIRA MARINHO', 'LÔRIVALDO REIS DIAS', 'LOURENÇO DO NASCIMENTO FEITOSA', 'LOURINALDO ALVES DE BARROS', 'LOURINALDO ARAUJO DA SILVA', 'LOURINALDO BARBOSA DA SILVA', 'LOURINALDO DE SOUSA DUTRA', 'LOURINALDO FERREIRA DE ARAUJO', 'LOURINALDO FERREIRA DE ARAÚJO', 'LOURINALDO PEREIRA DA SILVA', 'LOURINALDO PIRES DE CARVALHO', 'LOURINALDO TELES PEREIRA LIMA', 'LOURIVAL ALEXANDRE SIMÕES', 'LOURIVAL BARBOSA OLIVEIRA', 'LOURIVAL BEZERRA FILHO', 'LOURIVAL DE SOUZA RAMALHO', 'LOURIVAL FEITOSA ALVES', 'LOURIVAL GOMES BARBOSA', 'LOURIVAL GOMES DE LIMA', 'LOURIVAL LOPES FILHO', 'LOURIVAL NUNES DA SILVA', 'LOURIVAL PEREIRA DA COSTA JUNIOR', 'LOURIVAL PIRES DE SOUZA', 'LOURIVAL SEBASTIÃO DE MEDEIROS ', 'LOURIVAL TOME DA SILVA', 'LOURY JAMES DOS SANTOS PRADO', 'LUCAS BARBOSA LEITE', 'LUCAS COELHO DE GOIS', 'LUCENILDO PEREIRA DA SILVA', 'LUCIANO AFONSO DE ASSIS', 'LUCIANO ALCÂNTARA REIS', 'LUCIANO ALVES DOS SANTOS', 'LUCIANO AURÉLIO DE MAGALHÃES SOUZA', 'LUCIANO CARLOS DOS SANTOS', 'LUCIANO CHARLES DE CARVALHO CAVALCANTI', 'LUCIANO DA SILVA', 'LUCIANO DE ARAÚJO MENEZES', 'LUCIANO DE SIQUEIRA CAMPOS', 'LUCIANO DE SOUZA SOARES ', 'LUCIANO DOS SANTOS SILVA ', 'LUCIANO ERIVANALDO FERREIRA', 'LUCIANO FERNANDES DE SOUSA', 'LUCIANO GOMES DOS REIS ', 'LUCIANO JORGE RIBEIRO DE BARROS', 'LUCIANO JOSÉ DE MORAIS', 'LUCIANO MARQUES DE SOUZA', 'LUCIANO MENEZES DA SILVA', 'LUCIANO NUNES  DOS SANTOS', 'LUCIANO PAZ DE BRITO', 'LUCIANO PEREIRA DA SILVA', 'LUCIANO PEREIRA DE CARVALHO', 'LUCIANO RICARDO DA SILVA', 'LUCIANO ROBERTO VIANA', 'LUCIANO RODRIGUES DE BRITO', 'LUCIANO SANTANA DOS SANTOS', 'LUCIANO SEVERINO DA SILVA', 'LUCIANO TAVARES DE CARVALHO', 'LUCIANO VICENTE DE LIMA', 'LUCIANO VITAL VANDERLEY BRASIL', 'LUCILDO LOPES MAGALHÃES', 'LUCILIO JOSE DE SANTANA', 'LUCINALDO EMANOEL DE MELO', 'LUCINALDO FEITOSA VENTURA', 'LUCINALDO MAGALHÃES DE LIMA', 'LUCINDO MARQUES DE SOUZA', 'LUCINILDO ROQUE DA SILVA', 'LÚCIO ANDRÉ VERAS DE ALMEIDA', 'LUCIONE RODRIGUES DINIZ ', 'LUCIVAL PINHEIRO DA SILVA', 'LUCIVALDO DE VASCONCELOS LEITE', 'LUCIVAN CARLOS ALVES DE ALMEIDA', 'LUCIVAN CARLOS RODRIGUES DE ALMEIDA', 'LUCRÉCIO MÁRCIO MOURA DE AQUINO ANGELIM', 'LUILTON AURELIANO LIRA DE SÁ', 'LUIS ALVES DOS SANTOS', 'LUIS ANTONIO LOURENÇO', 'LUIS BARBOSA DOS SANTOS SILVA', 'LUIS BARBOSA LIMA', 'LUIS BARRETO DE SOUZA', 'LUÍS BEZERRA NETO', 'LUIS CLARINDO DESIQUEIRA ', 'LUIS DANIEL NETO', 'LUIS DEJANETE DE MEDEIROS', 'LUIS DOMINGOS DE SOUSA', 'LUÍS FERREIRA DE MORAIS', 'LUIS FERREIRA FRADE', 'LUIS FRANCISCO DE LIMA', 'LUIS GILTON DE ARAUJO SOUTO', 'LUIS GOMES DA SILVA', 'LUÍS GOMES DA SILVA', 'LUIS GONZAGA ANDRADE DE LIRA', 'LUIS GONZAGA CAVALCANTE DE SOUZA', 'LUÍS HONÁRIO DE FARIAS ', 'LUIS LAURENCIO FILHO', 'LUIS MATIAS SOBRINHO', 'LUIS MOURATO DA CRUZ', 'LUÍS NOBERTO ROQUE DOS SANTOS', 'LUIS NUNES DE MENÊZES', 'LUIS PEREIRA DE BARROS', 'LUIS PEREIRA LIMA', 'LUIS RINALDO DOS SANTOS', 'LUIS RODRIGUES DE LIMA', 'LUIS SOARES DE MELO', 'LUIS VICENTE FILHO', 'LUIS VIEIRA DE ALBUQUERQUE', 'LUIZ  CAMPOS NUNES  DA SILVA', 'LUIZ  REGINALDO INÁCIO LACERDA', 'LUIZ AILDO DE LIMA', 'LUIZ ALBERTO DE SOUZA LOPES', 'LUIZ ALBERTO PEREIRA DUARTE', 'LUIZ ALMEIDA DE ANDRADE', 'LUIZ ALMIR AQUINO VIÉGAS', 'LUIZ ALVES BRASIL', 'LUIZ ALVES DA SILVA', 'LUIZ ALVES DE LIMA', 'LUIZ ALVES DE OLIVEIRA', 'LUIZ ALVES DE SOUZA', 'LUIZ ALVES DO NASCIMENTO', 'LUIZ ALVES DOS SANTOS', 'LUIZ AMÂNCIO', 'LUIZ ANDRADE SILVA ', 'LUIZ ANDRÉ NUNES', 'LUIZ ANTONIO APIVA', 'LUIZ ANTONIO DA SILVA', 'LUIZ ANTONIO DE ARRUDA', 'LUIZ ANTONIO DE MOURA SANTANA', 'LUIZ ANTONIO FLORENTINO', 'LUIZ ANTONIO PEREIRA', 'LUIZ APOLINARIO SILVA', 'LUIZ ATAIDE DA SILVA', 'LUIZ BARBOSA', 'LUIZ BARBOSA NETO', 'LUIZ BELARMINO DOS SANTOS', 'LUIZ BELARMINO DOS SANTOS FILHO', 'LUIZ BEZERRA DA CRUZ', 'LUIZ BEZERRA DE MELO', 'LUIZ BEZERRA DINIZ', 'LUIZ BEZERRA DO NASCIMENTO', 'LUIZ CABRAL DA SILVA', 'LUIZ CAMPOS NUNES DA SILVA', 'LUIZ CARLOS BATISTA DE MACEDO', 'LUIZ CARLOS DA SILVA ', 'LUIZ CARLOS DE BARROS XAVIER', 'LUIZ CARLOS DOS SANTOS', 'LUIZ CARLOS FERREIRA DE BARROS', 'LUIZ CARLOS FIGUERÔA DA SILVA', 'LUIZ CARLOS FIGUERÔADA SILVA', 'LUIZ CARLOS MARTINS DA SILVA', 'LUIZ CARLOS MOURATO DA SILVA', 'LUIZ CARLOS PIRES DA SILVA', 'LUIZ CARLOS RODRIGUES DA SILVA', 'LUIZ CARLOS TADEU DE SÁ SAMPAIO', 'LUIZ CAVALCANTI NOVAES', 'LUIZ CELSO BARROS DE OLIVEIRA', 'LUIZ CIPRIANO RODRIGUES LIMA', 'LUIZ CLAUDINO LEITE', 'LUIZ CLAUDIO  LOPES MAGALHÃES', 'LUIZ CLAUDIO JACINTO', 'LUIZ CLAUDIO LOPES MAGALHÃES', 'LUIZ CLEMENTINO DA SILVA', 'LUIZ CORDEIRO DE AQUINO', 'LUIZ DA ROCHA SILVA ', 'LUIZ DA SILVA', 'LUIZ DARIO LUSTOSA CABRAL', 'LUIZ DE ALMEIDA LIMA', 'LUIZ DE SÁ RIBEIRO', 'LUIZ DE SIQUEIRA', 'LUIZ DOS SANTOS LEITE', 'LUIZ ELOY DE SOUSA', 'LUIZ EVERALDO ALVES FERRAZ', 'LUIZ FAUSTINO GOMES', 'LUIZ FAUSTO DA SILVA', 'LUIZ FEBRONIO DE ALMEIDA', 'LUIZ FELICIANO FERREIRA', 'LUIZ FELIX DA SILVA', 'LUIZ FERNANDO ALVES DE ANDRADE', 'LUIZ FERNANDO DE SOUZA ', 'LUIZ FERRAZ ALVES', 'LUIZ FERREIRA DA ROCHA NETO', 'LUIZ FERREIRA DE ARAÚJO ', 'LUIZ FERREIRA DE MAGALHÃES ', 'LUIZ FLORIANO DOS SANTOS', 'LUIZ FRANCISCO DA SILVA', 'LUIZ FRANCISCO DE LIMA', 'LUIZ FRANCISCO DE SOUZA ', 'LUIZ FREIRE DA SILVA', 'LUIZ GOMES DE LIMA', 'LUIZ GOMES DE SOUSA', 'LUIZ GOMES DE SOUZA', 'LUIZ GOMES FARIAS', 'LUIZ GONAGA DA SILVA', 'LUIZ GONSAGA DE CARVALHO  MOURA', 'LUIZ GONSAGA DE CARVALHO MOURA', 'LUIZ GONSAGA DOS SANTOS', 'LUIZ GONSAGA TÔRRES', 'LUIZ GONZAGA', 'LUIZ GONZAGA ALVES', 'LUIZ GONZAGA ALVES DE CARVALHO', 'LUIZ GONZAGA CALISTO', 'LUÍZ GONZAGA COSTA LIMA', 'LUIZ GONZAGA DA SILVA', 'LUIZ GONZAGA DE CARVALHO', 'LUIZ GONZAGA DE OLIVEIRA', 'LUIZ GONZAGA DE SANTANA', 'LUIZ GONZAGA DE SOUSA', 'LUIZ GONZAGA DIAS DE OLIVEIRA', 'LUIZ GONZAGA DO NASCIMENTO', 'LUIZ GONZAGA DO NASCIMENTO FILHO', 'LUIZ GONZAGA DOS SANTOS', 'LUIZ GONZAGA FREIRE', 'LUIZ GONZAGA MELO', 'LUIZ GONZAGA NUNES', 'LUIZ GONZAGA RODRIGUES', 'LUIZ GUEDES DA SILVA', 'LUIZ HORÁCIO DO AMARAL', 'LUIZ INÁCIO LEITE', 'LUIZ JOÃO DOS SANTOS', 'LUIZ JOAQUIM DE ANDRADE', 'LUIZ JOSÉ ALVES', 'LUIZ JOSÉ DA SILVA', 'LUIZ JOSÉ DE REZENDE', 'LUIZ JOSÉ DE SOUZA', 'LUIZ JOSÉ DOS SANTOS', 'LUIZ JÚNIOR VIANA', 'LUIZ LAURIANO CAVALCANTI', 'LUIZ LEITE DA SILVA', 'LUÍZ LEÍTE DA SILVA', 'LUIZ LEONARDO BEZERRA', 'LUIZ LEONARDO SOARES', 'LUIZ LOPES DA SILVA', 'LUIZ MAIA DE MEDEIROS', 'LUIZ MANOEL DA SILVA', 'LUIZ MANOEL DE MELO', 'LUIZ MANUEL DA SILVA', 'LUIZ MARIANO DE OLIVEIRA', 'LUIZ MARQUES DOS SANTOS', 'LUIZ MARQUES VIANA', 'LUIZ MARTINS DA SILVA', 'LUIZ MARTINS DE MORAIS', 'LUIZ MIGUEL DA SILVA', 'LUIZ MOURATO SUBRINHO', 'LUIZ NETO DA PAZ', 'LUIZ NICODEMOS DE SOUSA', 'LUIZ NUNES DE LIMA', 'LUIZ OLEGÁRIO BEZERRA', 'LUIZ PAULO BEZERRA', 'LUIZ PAULO NUNES DE LIMA', 'LUIZ PAZ DE ALMEIDA ', 'LUIZ PEDRO DA COSTA ', 'LUIZ PEREIRA DA SILVA', 'LUIZ PEREIRA DE SOUZA ', 'LUIZ PEREIRA FILHO', 'LUIZ PEREIRA GAMA', 'LUIZ PEREIRA GOMES', 'LUIZ PIRES DA PENHA', 'LUIZ POLICARPO CAMPOS', 'LUIZ PRATA DE BARROS', 'LUIZ QUEIROZ DE AZEVEDO', 'LUIZ QUEIROZ DE BRITO ', 'LUIZ ROBERIO ALVES DE ALMEIDA', 'LUIZ ROBERTO DE LIMA ', 'LUIZ ROBERTO FERREIRA DINIZ', 'LUIZ ROBERTO TELES DA SILVA', 'LUIZ ROBERTO VIANA', 'LUIZ RODRIGUES DA SILVA ', 'LUIZ RODRIGUES DO NASCIMENTO', 'LUIZ ROSA SOBRINHO', 'LUIZ SATURNINO SILVA', 'LUIZ SEBASTIÃO VITURINO', 'LUIZ SERGIO MIRANDA', 'LUIZ SEVERINO DA SILVA', 'LUIZ SIQUEIRA CAMPOS', 'LUIZ SOARES FILHO', 'LUIZ SOARES LIMA', 'LUIZ TAVARES PEREIRA', 'LUIZ TEMISTOCLES DE BARROS', 'LUIZ TEODOZIO DE LIMA', 'LUIZ TOMÉ DE SOUZA', 'LUIZ VAGNO DE SOUZA DANTAS', 'LUIZ VICENTE DE OLIVEIRA', 'LUIZ VICENTE SOBRINHO', 'LUIZ WANDERLEY GOMES DA SILVA ', 'LUIZ WILSON DA SILVA', 'LUSIMAR BATISTA DA SILVA', 'LUSMÁ BEZERRA DOS SANTOS', 'LUZENILDO PAULINO DE ASSIS', 'LUZIMARIO ALVES DE MELO', 'MAÇAL RODRIGUES DE MELO', 'MACIEL FERNANDES DA SILVA', 'MACIEL ROBERTO FERREIRA LIMA', 'MACIONEDIO JESUS TORRES', 'MAGNO ANTONIO GOMES DA SILVA', 'MÁGNO LUIZ BESERRA DE MELO', 'MANASÉS BARBOSA GALVÃO', 'MANEOL TORQUATO NETO', 'MANOEL ALEXANDRE DE SÁ', 'MANOEL ALVES DA SILVA', 'MANOEL ALVES DA SILVA NETO', 'MANOEL ALVES DE CARVALHO', 'MANOEL ALVES DE LIMA', 'MANOEL ALVES DE QUEIROZ', 'MANOEL ALVES DINIZ', 'MANOEL ALVES FERREIRA', 'MANOEL ALVES FILHO', 'MANOEL ALVES GALDINO', 'MANOEL ALVES PEREIRA', 'MANOEL ANDRADA MAGAHÃES', 'MANOEL ANTÔNIO LOPES', 'MANOEL ANTÔNIO PEREIRA', 'MANOEL AVELINO DOS SANTOS', 'MANOEL BARBOSA DOS SANTOS', 'MANOEL BARBOSA LIMA', 'MANOEL BARBOSA NETO', 'MANOEL BARROS DA SILVA', 'MANOEL BELARMINO SOBRINHO', 'MANOEL BELIZÁRIO SOBRINHO', 'MANOEL BELO E SILVA', 'MANOEL BENEDITO MELO', 'MANOEL BERNRDO DA SILVA', 'MANOEL BEZERRA NOVAES', 'MANOEL CABRAL DA SILVA', 'MANOEL CAMILO NETO', 'MANOEL CÂNDIDO MARTINS', 'MANOEL CARDOZO VERDEGÉ', 'MANOEL CARLOS ARRUDA RABÊLO', 'MANOEL CASSIANO FILHO', 'MANOEL CASUSA FILHO', 'MANOEL CAVALCANTE NOGUEIRA', 'MANOEL CAVALCANTI RIBEIRO FILHO', 'MANOEL CECILIO SOBRINHO', 'MANOEL CIRINO NUNES', 'MANOEL CORDEIRO DE SIQUEIRA', 'MANOEL CORDEIRO FLORENTINO', 'MANOEL CUNHA DA SILVA', 'MANOEL DAMIÃO DA SILVA', 'MANOEL DAMIÃO FERREIRA', 'MANOEL DE LIRA FILHO', 'MANOEL DE SÁ', 'MANOEL DE SOUSA CABRAL', 'MANOEL DE SOUSA GOMES', 'MANOEL DE SOUSA LIMA ', 'MANOEL DE SOUZA GUERRA NETO', 'MANOEL DIAS FILHO', 'MANOEL DIOMÁRIO GONÇALVES ', 'MANOEL DOROTEU NETO', 'MANOEL DOS SANTOS RODRIGUES', 'MANOEL DOS SANTOS SILVA', 'MANOEL ELIÉZIO CAVALCANTI DA SILVA', 'MANOEL ELISIO MOLTA FEITOSA', 'MANOEL ELOI DA SILVA', 'MANOEL EVANGIVALDO FERREIRA', 'MANOEL EXPEDITO SOBRINHO', 'MANOEL EZIUDO BRINGEL ', 'MANOEL FASTINO FERREIRA', 'MANOEL FERNANDES DE LIMA', 'MANOEL FERRAZ NOGUEIRA TORRES', 'MANOEL FERREIRA DA CRUZ NETO', 'MANOEL FERREIRA DE LIMA', 'MANOEL FERREIRA DE LUCENA', 'MANOEL FERREIRA DOS SANTOS', 'MANOEL FERREIRA JERÔNIMO', 'MANOEL FIRMINO PEREIRA', 'MANOEL FIRMINO SOBRINHO ', 'MANOEL FLORENTINO DINIZ FILHO', 'MANOEL FRANCISCO ANTONIO', 'MANOEL FRANCISCO DE LIMA', 'MANOEL FRANCISCO DOS SANTOS', 'MANOEL FRANCISCO DOS SANTOS NETO', 'MANOEL FREIRE FILHO', 'MANOEL FREIRE NOVAES', 'MANOEL FREIRE SINÉ', 'MANOEL GIVODEILSON SARAIVA', 'MANOEL GODEIA SOBRINHO', 'MANOEL GOMES DA CRUZ', 'MANOEL GOMES DA SILVA', 'MANOEL GOMES DE CARVALHO', 'MANOEL GOMES DE MELO NETO', 'MANOEL GOMES DE SÁ', 'MANOEL GOMES NOVAES FILHO', 'MANOEL GREGÓRIO LOPES', 'MANOEL HERCULANO DA SILVA', 'MANOEL INACIO DE OLIVEIRA NETO', 'MANOEL ISIDORO NETO', 'MANOEL JOÃO TORRES', 'MANOEL JOÃO TORRÊS', 'MANOEL JOAQUIM DA SILVA FILHO', 'MANOEL JOAQUIM DE LIMA', 'MANOEL JOAQUIM DO NASCIMENTO', 'MANOEL JOAQUIM DOS SANTOS', 'MANOEL JOSÉ DA SILVA', 'MANOEL JOSÉ DE ARAÚJO', 'MANOEL JOSÉ DE LIMA', 'MANOEL JOSÉ DO NASCIMENTO', 'MANOEL JOSÉ DOS SANTOS', 'MANOEL JOSÉ FRANQUILINO', 'MANOEL JOSÉ GUABIRABA', 'MANOEL JOSÉ NETO', 'MANOEL LAÉRCIO PINTO DA SILVA', 'MANOEL LEITE DE OLIVEIRA', 'MANOEL LEITE DE SÁ FILHO', 'MANOEL LEITE DOS SANTOS NETO', 'MANOEL LOPES DA SILVA ', 'MANOEL LOPES NETO', 'MANOEL LUCAS BEZERRA', 'MANOEL LUCAS DO NASCIMENTO', 'MANOEL LUÍS DOS SANTOS', 'MANOEL MACIEL LOPES DA SILVA', 'MANOEL MAGALHÃES RODRIGUES', 'MANOEL MALAQUIAS FREIRES XAVIER', 'MANOEL MALQUIAS FREIRES FILHO', 'MANOEL MARCOLINO', 'MANOEL MARIANO CORDEIRO', 'MANOEL MARQUES DE SOUSA', 'MANOEL MARQUES DOS SANTOS', 'MANOEL MECIAS NUNES DE SOUZA', 'MANOEL MENEZES DE SÁ', 'MANOEL MESSIAS ADRIANA DE LIMA', 'MANOEL MESSIAS ADRIANO DE LIMA', 'MANOEL MESSIAS AMARO DA SILVA', 'MANOEL MESSIAS BARBOSA', 'MANOEL MESSIAS BLANDINO DOS SANTOS', 'MANOEL MESSIAS DA SILVA FERREIRA', 'MANOEL MESSIAS DE FARIAS ', 'MANOEL MESSIAS DE LIMA', 'MANOEL MESSIAS GONÇALVES DOS SANTOS', 'MANOEL MESSIAS LEANDRO DE MORAES', 'MANOEL MESSIAS PAULINO DE PÁDUA', 'MANOEL MESSIAS PAULINO PADUA', 'MANOEL MISSIAS ALVES DE LIMA', 'MANOEL MISSIAS DE MOURA', 'MANOEL MORENO LEITE', 'MANOEL NETO DE MELO', 'MANOEL NETO TORRES', 'MANOEL NOGUEIRA DA COSTA ', 'MANOEL NOVAES GUIMARÃES', 'MANOEL NUNES DOS SANTOS', 'MANOEL NUNES NOGUEIRA FILHO', 'MANOEL NUNES SOARES', 'MANOEL OLEGÁRIO DE SOUZA', 'MANOEL OLLIMPIO DE SIQUEIRA', 'MANOEL PEDRO BEZERRA', 'MANOEL PEREIRA DA COSTA', 'MANOEL PEREIRA DE AGUIAR', 'MANOEL PEREIRA DE MEDEIROS', 'MANOEL PEREIRA DE MENESES ', 'MANOEL PEREIRA DE MORAES', 'MANOEL PEREIRA DE SOUSA', 'MANOEL PEREIRA FLORENTINO', 'MANOEL PEREIRA JUNIOR', 'MANOEL PEREIRA LIMA', 'MANOEL PEREIRA LOPES', 'MANOEL PEREIRA NETO', 'MANOEL PEREIRA SILVA', 'MANOEL PESSOA DA SILVA', 'MANOEL PINTO DE SOUZA', 'MANOEL PRINCIPE DE LIMA NETO', 'MANOEL QUEIROZ DE AQUINO FILHO', 'MANOEL RAIMUNDO DA SILVA', 'MANOEL RODRIGUES DE MELO', 'MANOEL ROMÃO DA SILVA', 'MANOEL ROMÃO FERREIRA DA SILVA', 'MANOEL ROQUE DE SOUZA', 'MANOEL SABINO DA SILVA', 'MANOEL SENHOR RODRIGUES DA SILVA', 'MANOEL SEVERINO  DA SILVA', 'MANOEL SEVERINO DA SILVA', 'MANOEL SILVESTRE MELO', 'MANOEL SIMÃO LUNGUINHO PEREIRA', 'MANOEL SOARES DE SOUZA', 'MANOEL TELES DA SILVA', 'MANOEL TEOTONIO SOBRINHO', 'MANOEL VALENTIM DE SOUZA NASCIMENTO', 'MANOEL VALENTIM NETO ', 'MANOEL VALERIO FILHO', 'MANOEL VICENTE DOS SANTOS', 'MANOEL VIEIRA DA SILVA', 'MANOEL VIEIRA NETO', 'MANOEL WELLGNTON VITURINO DA SILVA', 'MANOEL WELLIGNTON VITURINO', 'MANOEL WELLIGTON COSTA ', 'MANOEL XAVIER DE SIQUEIRA ', 'MANUEL ALVES DE NORONHA', 'MANUEL ANGELO BARBOSA', 'MANUEL EXPEDITO SOBRINHO', 'MANUEL GOMES DE CARVALHO PIRES', 'MANUEL LOPES DA SILVA METO', 'MANUEL LOPES DA SILVA NETO', 'MANUEL MARIANO DA CRUZ', 'MANUEL VIEIRA DA SILVA', 'MARCAL BERNARDINO DOS SANTOS', 'MARÇAL JOSÉ DA SILVA', 'MARÇAL JOSÉ DE LIMA', 'MARÇAL RODRIGUES DE MELO', 'MARCEL CORDEIRO DA SILVA', 'MARCELINO JOSÉ DE SOUZA', 'MARCELLO RANNIÉRE GOMES DE ARAUJO', 'MARCELO ALVES DA SILVA', 'MARCELO ALVES DE LIMA DE SIQUEIRA', 'MARCELO ALVES FEITOSA', 'MARCELO AQUINO DE OLIVEIRA', 'MARCELO CARVALHO DA SILVA', 'MARCELO DA SILVA', 'MARCELO DANTAS DOS SANTOS', 'MARCELO GABRIELA DANTAS DOS SANTOS', 'MARCELO GOMES DA SILVA', 'MARCELO JOSE BEZERRA PEREIRA', 'MARCELO JOSÉ BEZERRA PEREIRA', 'MARCELO JOSÉ DE LIMA', 'MARCELO NUNES', 'MARCELO NUNES MAGALHÃES', 'MARCELO NUNES VIEIRA', 'MARCELO ORLANDO FREIRES DE MEDEIROS', 'MARCELO RABELO DE GÓIS', 'MARCELO SANTOS DE ARRUDA', 'MARCELO SILVA FIEL', 'MARCELO SIQUEIRA DE MORAIS', 'MARCELO SOUZA PAIVA', 'MARCELO VIDAL DA SILVA', 'MARCIANO ARAÚJO LUCAS', 'MARCIANO PEDRO DA SILVA', 'MARCIDALIA XAVIER LIRA MEDEIROS ', 'MARCIEL SIQUEIRA FONTES', 'MARCILIO CARPEGIANI  DE SOUZA SIMÕES', 'MARCÍLIO LEITE DE OLIVEIRA', 'MARCÍLIO MARQUES DA SILVA ', 'MARCÍLIO NUNSE SANTANA', 'MARCILIO PEREIRO BEZERRA', 'MARCINO MARQUES DE SÁ', 'MÁRCIO ALEX CABRAL', 'MÁRCIO ALEXANDRE MEDEIROS DE SIQUEIRA', 'MARCIO AUGUSTO DE ALBUQUERQUE MELO', 'MÁRCIO AUGUSTO DE ALBUQUERQUE MELO', 'MÁRCIO CORDEIRO DE RESENDE', 'MARCIO CORDEIRO DE REZENDE', 'MARCIO DE SOUZA BRITO', 'MÁRCIO FERNANDO DOS SANTOS', 'MARCIO FERNANDO NUNES NOGUEIRA', 'MÁRCIO GEOVANI DA SILVA', 'MÁRCIO JERÔNIMO DA SILVA FERRAZ', 'MÁRCIO JOSÉ DE LIRA', 'MÁRCIO JOSÉ NUNES SIQUEIRA', 'MARCIO MATIAS DE SOUZA', 'MÁRCIO MENDES BRANDÃO', 'MÁRCIO OLIVEIRA MENDES DA SIVA ', 'MARCIO ROBERIO ROCHA DE OLIVEIRA', 'MARCIO ROGERIO VIEIRA TORRES', 'MARCO ALEXANDRE DA SILVA', 'MARCO ANTONIO LOPES MOURA', 'MARCO AURÉLIO FERRAZ ARAGÃO', 'MARCO AURELIO HAMURA', 'MARCO LUIZ DE BARROS', 'MARCO MACIEL DAVI TORRES', 'MARCO VALÉRIO DE MELO PIRES', 'MARCONDES CONSTANTINO DO NASCIMENTO', 'MARCONDES DA SILVA ALVES', 'MARCONDES DE MOURA RODRIGUES', 'MARCONDES FABRICIO DE MORAIS SANTOS', 'MARCONDES FABRÍCIO DE MORAIS SANTOS', 'MARCONDES FERREIRA DE SOUZA ', 'MARCONDES REFERINO DE SOUZA', 'MARCONDES SILVA DOS SANTOS', 'MARCONDES SOUSA E SILVA', 'MARCONE DA SILVA LIMA', 'MARCONE ROMERO FRAZÃO DE MORAIS', 'MARCONES  ÉDSON DA SILVA GALDINO', 'MARCONI DE OLIVEIRA FERREIRA', 'MARCONI EDSON DE SOUZA', 'MARCONI JOSE BARBALHO FALCAO', 'MARCONI JOSÉ BARBALHO FALCÃO', 'MARCONILDE SIMOA OLIVEIRA', 'MARCÔNIO EDSON DO AMARAL', 'MARCOS ANDRÉ DOS SANTOS', 'MARCOS ANTAS CORDEIRO', 'MARCOS ANTONIO ALEXANDRE DA SILVA', 'MARCOS ANTONIO BEZERRA DA SILVA', 'MARCOS ANTONIO BEZERRA DE ANDRADA MAGALHÃES', 'MARCOS ANTÔNIO BEZERRA DE SÁ', 'MARCOS ANTONIO CAMPOS DA FONSECA', 'MARCOS ANTONIO CAMPOS DA FONSÊCA ', 'MARCOS ANTÔNIO CAMPOS DA FONSECA', 'MARCOS ANTÔNIO CHATEAUBRIAND FILHO', 'MARCOS ANTONIO DA SILVA', 'MARCOS ANTÔNIO DA SILVA BARROS ', 'MARCOS ANTÔNIO DE ARAÚJO', 'MARCOS ANTONIO DE BRITO ALVES', 'MARCOS ANTONIO DE LIMA', 'MARCOS ANTONIO DE SÁ', 'MARCOS ANTONIO DE SOUZA', 'MARCOS ANTONIO DOS SANTOS', 'MARCOS ANTONIO FERREIRA DA SILVA', 'MARCOS ANTONIO FREIRE MARIZ', 'MARCOS ANTONIO GALDINO DA SILVA ', 'MARCOS ANTONIO LYRA', 'MARCOS ANTONIO MENDEONÇA BARROS', 'MARCOS ANTONIO MORATO', 'MARCOS ANTONIO SIQUEIRA ', 'MARCOS ANTONIO SOUTO CHATEAUBRIAND', 'MARCOS ANTÔNIO TEODÓSIO SILVA', 'MARCOS ANTONIO VERAS DE MOAIS FILHO', 'MARCOS ANTONIO VIANA SILVA', 'MARCOS ANTONIO VITOR DA SILVA', 'MARCOS AURELIO BARBOSA SOARES', 'MARCOS AURELIO CORDEIRO DE SIQUEIRA', 'MARCOS AURELIO DA SILVA LEANDRO', 'MARCOS AURÉLIO DE QUEIROZ', 'MARCOS AURÉLIO DO NASCIMENTO BARBOSA', 'MARCOS AURÉLIO GONÇALVES DE AQUINO', 'MARCOS CÉSAR VIEIRA DE LACERDA', 'MARCOS CIPRIANO DA SILVA FILHO', 'MARCOS DE ALMEIDA SANTOS', 'MARCOS DE OLIVEIRA SANTOS', 'MARCOS DE SOUZA RAFAEL', 'MARCOS EUCLIDES DE SÁ', 'MARCOS FERNANDO ARAÚJO DE SOUZA', 'MARCOS GLEYSON GOMES DE SÁ', 'MARCOS IRINEU ALVES NOGUEIRA', 'MARCOS IRINEU ALVES NOGUEIRA DE SOUZA', 'MARCOS IZIDIO DE SIQUEIRA', 'MARCOS JÂNIO FERREIRA SILVA', 'MARCOS JOSE DE LIMA', 'MARCOS JOSÉ DOS SANTOS', 'MARCOS JOSÉ FERREIRA', 'MARCOS JOSE PACHÊCO', 'MARCOS JOSÉ SOARES DE ARAÚJO ', 'MARCOS LUIZ BEZERRA DE VASCONCELOS ALVES', 'MARCOS MANOEL LIMA SOARES', 'MARCOS PESSOA JÚNIOR', 'MARCOS RIBEIRO FERREIRA SILVA', 'MARCOS ROBÉRIO DE ALMEIDA', 'MARCOS ROBERTO BEZERRA DA SILVA', 'MARCOS ROBERTO DA SILVA MALTEZ', 'MARCOS SOARES DE MELO', 'MARCOS VENICIUS DA SILVA ROCHA', 'MARCOS VINICIUS DA SILVA', 'MARCUS ANDRÉ PEREIRA DE MOURA', 'MARCUS AURELIO ALVES LEITE', 'MARCUS AURELIO NOGUEIRA BIBEIRO E SILVA', 'MARCUS JOSÉ MAGALHÃES FERREIRA', 'MARCUS VINÍCIUS DE SIQUEIRA CABÚS', 'MARDÔNIO BEZERRA MAIA', 'MARIA GRACIETE ÂNGELO GUEDES ', 'MARIA MARTHA MOREIRA RODRIGUES DA SILVA', 'MARIANO BARBOSA DA SILVA NETO', 'MARIANO FRUTUOSO DOS SANTOS', 'MARIANO GOMES DA SILVA', 'MARIANO JACINTO DE OLIVEIRA', 'MARIANO LUIZ DA SILVA', 'MARIANO PEREIRA DE BARROS', 'MARINALDO LUIZ DA COSTA ', 'MARINALDO MENDONÇA MARTINS', 'MARINALVA VIEIRA DOS SANTOS', 'MARIO ALBERTO PATRIOTA', 'MARIO ALVES DE GOES', 'MARIO BARBOSA FERRAZ', 'MÁRIO BARBOSA FERRAZ', 'MARIO CELIO GONÇALVES DA SILVA', 'MARIO CÉLIO GONÇALVES DA SILVA', 'MÁRIO CESAR JÚNIOR', 'MARIO CEZAR AUGUSTO DE ALMEIDA BEZERRA', 'MARIO DA CRUZ NOGUEIRA', 'MARIO DANTAS', 'MARIO DE SOUZA LIMA', 'MÁRIO FERRAZ CORNÉLIO', 'MARIO FERREIRA FILHO', 'MÁRIO FERREIRA FILHO', 'MARIO JOAQUIM DA SILVA', 'MARIO JORGE LIBERAL SOARES', 'MÁRIO JORGE LIBERAL SOARES', 'MÁRIO JUNIO DE LIMA', 'MARIO LASELDA', 'MÁRIO LÚCIO SÁ LÉDO', 'MARIO LUIZ LEITE', 'MÁRIO LYCON LOPES MOURA', 'MÁRIO LYNCON LOPES MOURA', 'MARIO MANOEL DA SILVA', 'MÁRIO MATIAS DANTAS', 'MÁRIO OLIMPIO CAVALCANTE NETO', 'MARIO ROBERIO FERREIRA DA SILVA', 'MÁRIO ROGÉRIO NUNES DE SOUZA', 'MÁRIO SERGIO DE SÁ MENEZES', 'MÁRIO SÉRGIO DE SÁ MENEZES', 'MARIOZAN DAVI TORRES', 'MARIVALDO  FERREIRA BARBOZA', 'MARIVALDO ALVES DE CARVALHO', 'MARIVALDO JOÃO ALVES', 'MARIVALDO LEMOS DO NASCIMENTO', 'MARLON DAVID MELO', 'MARLON JOSÉ PESSÔA DE PAIVA SANTANA', 'MARLONDEIS FERREIRA DE ARAUJO', 'MARLONDEIS FERREIRA DE ARAÚJO', 'MAROS FERRAZ CORNELIO', 'MARTIM RAIMUNDO GONDIM', 'MARTIN ANGELO CABRAL', 'MARTIN RAIMUNDO GONDIM', 'MARTINHO CORREIA DA SILVA', 'MARTINS ANTONIO DOS ANJOS', 'MARTINS CARVALHO LUCAS', 'MARTINS HENRIQUE PEREIRA DE LIRA', 'MATIAS MOREIRA NETO', 'MAURICIO ALVES MARTINS', 'MAURICIO ALVES VASCONCELOS ', 'MAURICÍO BESERRA FILHO', 'MAURICIO CAVALCANTE LACERDA', 'MAURICIO FERREIRA NEVES FILHO', 'MAURÍCIO FREIRE DE CARVALHO', 'MAURICIO GASPAR DA SILVA', 'MAURICIO GOMES DE SOUZA', 'MAURÍCIO JOSÉ DE SOUSA', 'MAURICIO LAÉRCIO BESERRA DE MELO', 'MAURICIO MOURA CAVALCANTI', 'MAURÍCIO NUNES DA SILVA ', 'MAURICIO NUNES QUEIROZ', 'MAURICIO RAIMUNDO DE SOUSA', 'MAURICIO TEÓFILO DA SILVA', 'MAURÍCIO TIMÓTEO PEIXOTO ', 'MAURICIO ZINAILDO BARBOSA', 'MAURÍCIO ZINAILDO BARBOSA', 'MAURÍCIO ZINALDO BARBOSA', 'MAURILIO BEZERRA DE LIMA', 'MAURILIO HELENO ALEIXO DE SOUZA', 'MAURÍLIO HELENO ALEIXO DE SOUZA', 'MAURILIO MORAES DE SÁ ', 'MAURÍLIO MORAES DE SÁ', 'MAURILIO RODRIGUES DE SOUZA', 'MAURION GALVÃO BRITO', 'MAURO CAVALCANTI BASTOS', 'MAURO CÉSAR MAGALHÃES DE CARVALHO', 'MAURO GABRIEL DE SANTANA', 'MAURO NUNES DOS SANTOS', 'MAURO RAMOS SOARES', 'MAURO SERGIO MOURA FERREIRA', 'MAXIMINO SANTOS DE LIMA', 'MAXWELL CARVALHO DANTAS', 'MAYCON DAVI REIS PEREIRA DE SOUZA', 'MAYRO CESAR MAGALHÃES DE CARVALHO', 'MAZIM SOARES SANTANA', 'MELQUISEDEQUE PORFÍRIO DE SIQUEIRA', 'METODIO GOMES DA SILVA', 'MICHAEL JACKSON DA SILVA', 'MIERLANDE DAVI TORRES', 'MIGUEL  VIRGOLINO PATRICIO', 'MIGUEL ALVES DE SOUZA', 'MIGUEL ALVES DOS SANTOS', 'MIGUEL ARCANJO DE ALMEIDA', 'MIGUEL ARCANJO RODRIGUES FILHO', 'MIGUEL ARCANJO VIANA SILVA', 'MIGUEL ARTUR DE LIMA', 'MIGUEL AUGUSTO AMARAL NETO', 'MIGUEL BATISTA RAMALHO', 'MIGUEL CORDEIRO NETO', 'MIGUEL DE SOUZA JÚNIOR', 'MIGUEL FERREIRA DE SOUSA', 'MIGUEL GOMES JURUBEBA', 'MIGUEL GOMES NETO', 'MIGUEL HILDO AQUINO', 'MIGUEL HILDO DE AUINO', 'MIGUEL JOÃO DA SILVA', 'MIGUEL MACEL FERREIRA ', 'Miguel Nicácio da Silva', 'MIGUEL PEREIRA DE SOUZA', 'MIGUEL PEREIRA DOS ANJOS', 'MIGUEL PEREIRADE SOUZA', 'MIGUEL REGINALDO DE FIGUEIREDO', 'MIGUEL ROBÉRIO ALVES DE MELO', 'MIGUEL ROBERTO FERREIRA DE OLIVEIRA', 'MIGUEL RODRIGUES DE MAGALHÃES', 'MIGUEL RODRIGUES DOS SANTOS', 'MIGUEL TELES DOS SANTOS', 'MIGUEL VIRGOLINO PATRÍCIO', 'MILITÃO GOMES DE SOUZA', 'MILSON CALADO BATISTA', 'MILSON PEREIRA NETO', 'MILTON MIGUEL DE SOUSA', 'MILTON SEVERINO DO AMARAL', 'MILTON SIMÕES RABELO', 'MIRINALVO BARROS E SÁ', 'MISSIAS ALVES DE CARVALHO ', 'MOACI LEAL', 'MOACIR BARROS DA SILVA', 'MOACIR CARLOS DE SOUZA UMBUZEIRO', 'MOACIR GODOFRÊDO LUCKWU', 'MOACIR GOMES DUARTE', 'MOACIR VIANA SOUTO', 'MOARCIR TELES BEZERRA', 'MOISÉS BATISTA GOMES JUNIOR', 'MOISES CIPRIANO DE OLIVEIRA', 'MOISÉS DAVID ANDRADE', 'MOISÉS DIONÍSIO DA SILVA', 'MOISES LUNA DE ARAUJO SILVA', 'MOIZES NECY DE MELO', 'MOIZES XAVIER LIRA', 'MOIZÉS XAVIER LIRA ', 'MONOEL NOGUEIRA DE MELO', 'MORCOS DOS SANTOS FERREIRA', 'MOZART LEITE DE LIMA', 'MURILO DE MEDEIROS', 'NADIEL SILVA DE SÁ', 'NAÉCIO OLIVEIRA DE LIMA', 'NAGBE JOSÉ DA SILVA', 'NALDIMAR GOMES DA SILVA', 'NÃO DECLARADO', 'NÃO INFORMADO', 'NAPIERRE VALGUEIRO BARROS', 'NAPOLEÃO CARNEIRO DE SOUZA', 'NAPOLEÃO FRANCO DA CRUZ NEVES', 'NAPOLEÃO INÁCIO DE OLIVEIRA NETO', 'NAPOLEÃO ROBERTO DE GODOY CARVALHO', 'NAPOLEÃO SIMÕES FILHO', 'NARCIZO COSTA QUEIROZ', 'NATALICIO MARTINS DOS SANTOS', 'NATALÍCIO VIANA DA SILVA', 'NATANAEL GOMES TAVARES', 'NATANAEL HENRIQUE DA SILVA', 'NATANAEL JOSÉ DE LIMA', 'NATANAEL PEREIRA DE SOUZA', 'NATANAEL RODRIGUES DA SILVA', 'NATANAGILDO GOMES DE QUEIROZ', 'NATELSON DE ARRUDA MOURA', 'NATONIO DA SILVA FRANÇA', 'NAZARENO NUNES DE OLIVEIRA', 'NECILIO ALVES DE SÁ', 'NECIVALDO LOPES DE LIMA', 'NEI JUNIO ALCANTARA DE MEDEIROS', 'NEILSON RODRIGUES DE MORAIS ', 'NEILTON JOÃO DOS SANTOS', 'NEILTON RIBEIRO RODRIGUES', 'NEISON RODRIGUES DE AQUINO', 'NELIO SANTOS CRUZ', 'NELITO FERREIRA DOS SANTOS', 'NELSON CANÁRIO DOS SANTOS', 'NELSON CORNÉLIO DE CARVALHO DINIZ', 'NELSON CORREIA ALVES ', 'NELSON EDUARDO DA SILVA', 'NELSON GOMES DOS SANTOS', 'NELSON GOMMES DOS SANTOS', 'NELSON JOSÉ DE ARAÚJO', 'NELSON JUVENAL DA SILVA', 'NELSON MANOEL DA SILVA', 'NELSON MANOEL DO NASCIMENTO', 'NELSON MARQUES DA SILVA', 'NELSON PEREIRA DE CARVALHO', 'NELSON VALERIANO BEZERRA', 'NENESIO ALFREDINO DE JESUS', 'NEOMEDES MORAES REGO FILHO', 'NERIBEL FERREIRA LIMA', 'NERICELIO FREIRES E SILVA', 'NERINO FERREIRA DE LIMA', 'NERIVALDO ANTONIO RAIMUNDO SILVA ', 'NERIVANIO MONTEIRO DA SILVA', 'NESIVALDO LUIS DA SILVA', 'NEUBISON WAGNER SILVA VICENTE', 'NEUDIRAN RODRIGUES DE MEDEIROS ', 'NEUDO MACIEL DA SILVA', 'NEWTON CARLOS FERRAZ', 'NEWTON VALGUEIRO BARROS', 'NEY BARBOSA DE MEDEIROS', 'NICIDENES FERREIRA DE ARAUJO', 'NICODEMOS ALVES DA CRUZ', 'NICODENES FERREIRA DE ARAUJO', 'NICODENIS FERREIRA DE ARAUJO', 'NICOMEDES BRASILIANO  DE SOUZA', 'NICOMEDES BRASILIANO DE SOUZA', 'Nildo Inacio de Oliveira', 'NILDO INÁCIO DE OLIVEIRA', 'NILDO JOSÉ DA SILVA', 'NILDO MELO DE LIMA', 'NILDO PEREIRA DE SOUSA', 'NILDOMAR DIAS PEREIRA', 'NILO FERREIRA DE ARAÚJO', 'NILSON ALEIXO DE SOUSA', 'NILSON APARECIDO DE URZENO', 'NILSON ARAÚJO DE SOUZA', 'NILSON DA SILVA GUEDES JUNIOR', 'NILSON DA SILVA GUEDES JÚNIOR', 'NILSON NERY DE SOUZA', 'NILSON RODRIGUES SIQUEIRA', 'NILTON CÉSAR DA SILVA', 'NILTON CÉSAR GOMES DE SOUZA', 'NILTON FERREIRA DE ARAÚJO', 'NILTON JOSÉ DA SILVA', 'NILTON ROBERTO CAVALCANTE SILVA ', 'NILTON SAMPAIO VIEIRA ', 'NILVO BEZERRA DE LIMA', 'NIRAILTON DA SILVA FERREIRA', 'NIVALDO ALEIXO DE SOUZA', 'NIVALDO ALMEIDA DOS SANTOS', 'NIVALDO ALVES DA COSTA', 'NIVALDO ALVES DE LIMA', 'NIVALDO BEM DE MEDEIROS', 'NIVALDO CARIRI DE LIMA', 'NIVALDO CÉSAR DE OLIVEIRA', 'NIVALDO CESÁRIO DE LIMA', 'NIVALDO DE OLIVEIRA MARQUES', 'NIVALDO DE REZENDE', 'NIVALDO ELIAS DA SILVA', 'NIVALDO FAUSTINO FERREIRA ', 'NIVALDO FEITOSA FERRAZ', 'NIVALDO FRUTUOSO DOS SANTOS', 'NIVALDO GETRO DE SANTANA ', 'NIVALDO HIPOLITO DA SILVA FILHO', 'NIVALDO JOSÉ DE LIMA', 'NIVALDO MORENO DA SILVA', 'NIVALDO PEREIRA', 'NIVALDO PONCIANO DE SOUSA', 'NIVALDO RAIMUNDO DE MELO', 'NIVALDO SERAFIM VIANA', 'NOBEL BEZERRA DE SOUZA', 'NOBERTO ALVES DE CARVALHO NETO', 'NOBERTO FERREIRA ANDRADE ', 'NOBERTO GOMES DE SÁ', 'NOBERTO LIMA DE MOURA', 'NOÉ ALVES FEITOSA NETO', 'NOÉ JOSÉ DE ARAÚJO', 'NOEL JOSÉ DA SILVA', 'NOEL OLIVEIRA FIGUEIREDO', 'NORBERTO GOMES DE SÁ', 'NORMANDO DE OLIVEIRA FERREIRA ', 'NOVAL BEZERRA FERRAZ', 'ODAIR JOSÉ DE MEDEIROS', 'ODAIR VIANA DE LIMA', 'ODÁLIO JOSÉ DA SILVA', 'ODENA FERREIRA ROCHA', 'ODILON DA SILVA TAVARES', 'ODILON FREIRE DA SILVA', 'ODILON NUNES NETO', 'ODILON SEVERO DA SILVA', 'ODILON SIQUEIRA DO NASCIMENTO', 'ODON DE SOUZA SITÔNIO JÚNIOR', 'ODONEIDE MARQUES FERREIRA', 'ODORICO PEDRO DA SILVA', 'ODWAN CAVALCANTE XAVIER', 'OLAVIO LEITE DO NASCIMENTO', 'OLAVO MARTINS LIMA', 'OLAVO VINA DOS SANTOS', 'OLÍMPIO GOMES ALVES', 'OLIMPIO GONÇALVES DOS SANTOS', 'OLIMPIO JOSÉ DA SILVA', 'OLÍMPIO MANOEL DE LIMA', 'OLIMPIO MARINHO CORDEIRO', 'OLÍMPIO MARINHO CORDEIRO', 'OLINDO DAMIÃO DOS SANTOS', 'OLIVEIRA SEBASTIÃO DA SILVA', 'OLUZIO FERREIRA DA SILVA', 'OMAR KHHAYYAM RÉGIS BATISTA', 'ONIAS ALDO MARQUES SIQUEIRA', 'ONILDO DE SOUZA FERRAZ', 'ONOFRE COSTA FERREIRA', 'ONOFRE JOÃO DO NASCIMENTO', 'ONOFRE LUIZ LAURENTINO', 'OPTATO JACKSON DE OLIVEIRA', 'ORACILDO BATISTA DE BRITO ', 'ORESTES GOMES DA CRUZ', 'ORIEL LOPES SIQUEIRA', 'ORIVLDO CAVALCANTI DE LIMA', 'ORLANDO ALVES DE SOUZA', 'ORLANDO DE MELO MAGALHÃES', 'ORLANDO DE SÁ  NOGUEIRA', 'ORLANDO DIAS PEREIRA DA SILVA', 'ORLANDO FURTADO DE SÁ', 'ORLANDO FURTADO LEITE', 'ORLANDO JOELCIO CRUZ ANGELIM', 'ORLANDO JOSÉ DOS SANTOS', 'ORLANDO JOSÉ GOMES', 'ORLANDO LUIZ DE SOUSA SILVA', 'ORLANDO MATEUS DA SILVA', 'ORLANDO MENEZES DA SILVA', 'ORLANDO OSMINDO DA SILVA', 'ORLANDO PINTO CABRAL', 'ORLANDO SÁVIO PEREIRA DA SILVA', 'ORLANDO TELES PEREIRA LIMA', 'OSCAR ALVES PEREIRA', 'OSCAR FERREIRA ROCHA', 'OSCARLINDO PEREIRA FILHO', 'OSEAS FIRMINO OLIVEIRA JUNIOR', 'OSÉAS FONTE DE MOURA', 'OSELVI DE SÁ FERRAZ', 'OSMAN MONTEIRO DA SILVA SANTOS', 'OSMAN RAMOS FREIRE DE ANDRADE', 'OSMANO MORAIS MASCENA VERAS', 'OSMAR DE SOUZA SÁ', 'OSMAR DO NASCIMENTO PAES BARRETO', 'OSMAR FREIRE DE SOUZA', 'OSMAR JOSÉ BRASIL', 'OSMAR JOSÉ PIRES DE SOUZA', 'OSMAR RAMOS DA SILVA', 'OSMARIM JOAQUIM PEREIRA', 'OSMILDO JOSÉ DA SILVA', 'OSNI FERNANDES DE MELO', 'OSSEAN TORRES DA SILVA', 'OSVALDO AFRO DE SOUZA', 'OSVALDO AIANNE DE MOURA RODRIGUES', 'OSVALDO CICERO DA SILVA', 'OSVALDO CÍCERO DA SILVA', 'OSVALDO JOAQUIM XAVIER', 'OSVALDO JOSE DA SILVA', 'OSVALDO JUNIOR CAVALCANTE XAVIER', 'OSVALDO LUIZ LIMA E SILVA', 'OSVALDO MANOEL DO NASCIMENTO', 'OSVALDO MARIANO DA CRUZ', 'OSVALDO NUNES DE BARROS', 'OSVALDO RODRIGUES DA SILVA', 'OSVALDO RODRIGUES DE SIQUEIRA', 'OSVALDOJOSÉ DOS ANJOS', 'OTACILIO ANTONIO DE MELO', 'OTACÍLIO ARAÚJO COSTA', 'OTACILIO CARLOS DA COSTA', 'OTACISO GOIS AQUINO', 'OTAILSON FERREIRA ROCHA', 'OTAIR JOÃO DA SILVA ', 'OTAVIANO ALVES DA SILVA', 'OTAVIANO BARROS DA SILVA', 'OTAVIANO NUNES CAVALCANTE', 'OTAVIANO RODRIGUES DA SILVA', 'OTAVIO ALEIXO MONTEIRO', 'OTÁVIO ALEIXO MONTEIRO', 'OTAVIO DOS SANTOS HONORIO', 'OTONI MARTINS DE OLIVEIRA', 'OTONIEL ALVES DE HOLANDA', 'OZAEL JOSE DE ALMEIDA', 'OZAILTON ARAUJO DE LIMA', 'OZAIR DE SOUZA LIMA', 'OZAIR GERALDO DE SOUZA', 'OZEMBERG HONORIO DA SILVA', 'OZENILDO CLEITON LACERDA DE ARAÚJO', 'PABLO FERNANDO DE MOURA BARROS', 'PABLO PAPIANO ALBUQUERQUE GUIMARÃES', 'PABLO SEVERIANO DOS SANTOS', 'PATRÍCIO DE MORAIS SILVA', 'PATRÍCIO JOSÉ DE CARVALHO', 'PATROCINO ALVES DINIZ', 'PAUÇO FRANCISCO DOS SANTOS', 'PAULA FRANCINETE FONSECA CARVALHO', 'PAULINO NOGUEIRA DOS SANTOS', 'PAULINO NOGUEIRA NETO', 'PAULO ALBERTO BRAZ CAVALCANTE', 'PAULO ALEXANDRE DO NASCIMENTO SILVA', 'PAULO ALVES DA SILVA', 'PAULO ALVES DOS SANTOS', 'PAULO ALVES MARIM', 'PAULO ALVES QUEIROZ', 'PAULO ANDRÉ SANTOS GENESIO', 'PAULO ANDRELINO DE OLIVEIRA', 'PAULO ANTAS FLORENTINO CABRAL', 'PAULO ANTÔNIO BEZERRA DE SÁ LOPES', 'PAULO ANTONIO DE OLIVEIRA', 'PAULO ANTÔNIO DE OLIVEIRA', 'PAULO APRIGIO DA SILVA', 'PAULO ARAÚJO CAMPOS', 'PAULO BARBOSA DO NASCIMENTO', 'PAULO BATISTA DE LIMA', 'PAULO BELARMINO DE SOUSA', 'PAULO BERNARDO GOMES FONSECA', 'PAULO BEZERRA DA SILVA', 'PAULO BRITO MONTEIRO FILHO', 'PAULO CANÁRIO DOS SANTOS', 'PAULO CANÁRIO SANTOS', 'PAULO CAVALCANTI BEZERRA', 'PAULO CELESTINO DA SILVA', 'PAULO CÉSAR ANTUNES LIMA', 'PAULO CESAR DA SILVA', 'PAULO CÉSAR DA SILVA', 'PAULO CESAR DE BRITO', 'PAULO CÉSAR FERREIRA DA SILVA', 'PAULO CÉSAR LIMA DO NASCIMENTO', 'PAULO CESAR PEREIRA GRANJA', 'PAULO CESAR VALÉRIO', 'PAULO CLEMENTINO DA SILVA', 'PAULO CLEMENTINO DE MOURA', 'PAULO CORDEIRO DE ALMEIDA', 'PAULO COSTA DE SANTANA', 'PAULO DEJAIR DE SÁ OLIVEIRA', 'PAULO DO NASCIMENTO DE SOUZA', 'PAULO DOS SANTOS VIDAL', 'PAULO EDSON RAMOS DE CARVALHO', 'PAULO EDSON ZACARIAS SILVA', 'PAULO ELIAS DA SILVA', 'PAULO EPAMINONDAS DA SILVA', 'PAULO ERNANDO DE SOUZA', 'PAULO EUCLIDES DE LIMA', 'PAULO FAUSTINO DOS SANTOS', 'PAULO FÉLIX DE SOUSA', 'PAULO FELIZARDO DOS ANJOS', 'PAULO FERNANDES DA SILVA', 'PAULO FERNANDO BARBOZA DA SILVA', 'PAULO FERNANDO DE MOURA BARROS', 'PAULO FERNANDO DE SOUSA MELO', 'PAULO FERNANDO NOVAES CAVALCANTI', 'PAULO FERREIRA DE SOUSA', 'PAULO FRANCISCO GOLMES PINHO', 'PAULO FREITAS DE ALMEIDA', 'PAULO GENILSON DE SIQUEIRA', 'PAULO GERALDO DE ANDRADE MENEZES ', 'PAULO GOMES', 'PAULO GOMES DA SILVA', 'PAULO GOMES DE LIMA', 'PAULO GOMES DE SOUZA', 'PAULO ITAMAR LEITE LIMA', 'PAULO JOÃO DOS SANTOS', 'PAULO JOAQUIM DO NASCIMENTO', 'PAULO JORGE PEREIRA', 'PAULO JOSÉ DA SILVA NASCIMENTO', 'PAULO JOSÉ DA SILVA RIBEIRO', 'PAULO JOSÉ DE MELO', 'PAULO JOSÉ DO NASCIMENTO', 'PAULO JOSE RAMALHO LOPES', 'PAULO JOSÉ RODRIGUES', 'PAULO LINO DA SILVA', 'PAULO LOURENÇO CORDEIRO', 'PAULO LUIZ FERREIRA', 'PAULO LUIZ GERMANO', 'PAULO MANOEL DA SILVA', 'PAULO MARCOS DO NASCIMENTO', 'PAULO MARCOS NERES DE MIRANDA', 'PAULO MARQUES DA SILVA', 'PAULO MENDES DA SILVA', 'PAULO MIGUEL BEZERRA', 'PAULO NOGUEIRA', 'PAULO OLIMPIO DE SÁ MENEZES', 'PAULO OLINTO DE LIMA', 'PAULO PEREIRA DA SILVA', 'PAULO PEREIRA DE LIMA', 'PAULO PINTO RODRIGUES', 'PAULO POLICARPO CAMPOS', 'PAULO REGERIO FERRAZ', 'PAULO REJANE DE ARAÚJO', 'PAULO RIBAMAR TEIXEIRA DA SILVA', 'PAULO ROBERTO ALENCAR DE VALÕES', 'PAULO ROBERTO ALVES', 'PAULO ROBERTO DE ARAUJO GRIMALDI', 'PAULO ROBERTO DE BARROS', 'PAULO ROBERTO DE SOUZA SANTOS', 'PAULO ROBERTO DO NASCIMENTO', 'PAULO ROBERTO DOS SANTOS', 'PAULO ROBERTO DUARTE FERRAZ', 'PAULO ROBERTO HONORATO MUNIZ', 'PAULO RODRIGUES DE QUEIROZ', 'PAULO RODRIGUES MACEDO', 'PAULO ROGERIO FERRAZ', 'PAULO ROMERO CAVALCANTE DA SILVA', 'PAULO ROMERO DA SILVA', 'PAULO ROMERO NUNES DA SILVA', 'PAULO ROQUE DE SOUZA', 'PAULO SANTANA DA SILVA', 'PAULO SEBASTIÃO DA SILVA', 'PAULO SERAFIM DE LIMA', 'PAULO SERGIO DANTAS DA CRUZ', 'PAULO SÉRGIO DE SIQUEIRA NASCIMENTO', 'PAULO SÉRGIO QUEIROZ DA SILVA', 'PAULO SERGIO TENORIO AMARAL', 'PAULO SIMÕES DE MORAIS', 'PAULO SIQUEIRA MAIA', 'PAULO SOARES NUNES', 'PAULO TEIXEIRA DA SILVA', 'PAULO VIEIRA ARAÚJO JUNIOR', 'PAULO VIEIRA DE LIMA', 'PAULO WERTON JOAQUIM DOS SANTOS', 'PEDRO ALVES DA CRUZ', 'PEDRO ALVES DE CRUZ', 'PEDRO ALVES DE SOUZA', 'PEDRO AMARAL DO NASCIMENTO', 'PEDRO APOSTOLO MANGABEIRA', 'PEDRO ARTUR DE MENEZES LEAL', 'PEDRO AUGUSTO DE SIQUEIRA ', 'PEDRO AUGUSTO MONTEIRO', 'PEDRO BARBOSA DOS ANJOS', 'PEDRO BARROS FERNANDES ', 'PEDRO BATISTA DA SILVA', 'PEDRO BEZERRA DUNGA', 'PEDRO BONIFÁCIO DE PAIVA', 'PEDRO CALMON DO NASCIMENTO', 'PEDRO CARLOS BEZERRA BATISTA DE SOUSA', 'PEDRO CLEMENTINO PEREIRA', 'PEDRO DA SILVA FEITOZA', 'PEDRO DA SILVA LOPES', 'PEDRO DA SILVA SOBRINHO', 'PEDRO DANTAS FILHO ', 'PEDRO DE SOUZA DA SILVA ', 'PEDRO ELIZEU DA SILVA', 'PEDRO ELIZEU SILVA', 'PEDRO FERNANDO DOS SANTOS', 'PEDRO FERREIRA FILHO ', 'PEDRO FLORÊNCIO DE SOUSA', 'PEDRO FLORINDO DE SIQUEIRA', 'PEDRO FLORINDO DE SIQUEIRA LIRA', 'PEDRO FRANCISCO DE OLIVEIRA', 'PEDRO FRANCISCO DE SÁ', 'PEDRO FRANCISCO DO RÊGO NETO', 'PEDRO FREIRE DE CARVALHO ', 'PEDRO GAUDIOSO LADISLAU', 'PEDRO GENÉSIO CAMPOS', 'PEDRO HENRIQUE NOVAES DE SOUSA LIRA', 'PEDRO IZIDORIO DA SILVA', 'PEDRO JOAQUIM DE SOUZA', 'PEDRO JOSÉ GONDIM', 'PEDRO JOSÉ JACINTO', 'PEDRO JOSÉ RODRIGUES DA SILVA', 'PEDRO JUNIOR GOMES DO NASCIMENTO', 'PEDRO LUIZ DA SILVA ', 'PEDRO LUIZ MATIAS DA SILVA', 'PEDRO MAGNO DA SILVA', 'PEDRO MAIA JACINTO', 'PEDRO MANOEL DE SOUZA', 'PEDRO MARCULINO DA SILVA FILHO', 'PEDRO MARINHO DOS SANTOS', 'PEDRO MARTINS DE OLIVEIRA NETO', 'PEDRO MEDEIROS', 'PEDRO NASARIO GOMES', 'PEDRO NETO DE OLIVEIRA', 'PEDRO NETO DO NASCIMENTO', 'PEDRO NETO DOS SANTOS', 'PEDRO NUNES  DA SILVA', 'PEDRO NUNES DE BARROS', 'PEDRO NUNES DE LIMA', 'PEDRO PAULINO TORRES', 'PEDRO PAULO DE SANTANA ', 'PEDRO PEREIRA DE SIQUEIRA', 'PEDRO PEREIRA NETO', 'PEDRO PEREIRA TARGINO', 'PEDRO PEREIRADE SIQUEIRA ', 'PEDRO PIERRE DA CRUZ', 'PEDRO PIRES DE CARVALHO', 'PEDRO PIRES DOS SANTOS BARROS', 'Samara Rodrigues de Souza Pádua', 'AUGUSTO JOSE NUNES DE BARROS', 'ISABELA NAYRA MENEZES DA SILVA', 'WILTON KLEBSON DA SILVA', 'ABEL MANOEL FERREIRA DE SOUSA', 'Silvia Rayanna Rodrigues Freitas', 'ALAN BRUNO LIMA MARTINS', 'AURELIANO BEZERRA BECO', 'JOSEMIR DE SIQUEIRA WANDERLEY', 'PAULO HENRIQUE OLIVEIRA PRÍNCIPE DE LIMA', 'MARCIA VANESSA DE MELO SILVA', 'BRUNO RAFAEL DOS SANTOS MARTINS', 'WASHINGTON LUIZ OLIVEIRA NUNES', 'AURELIO CORDEIRO DOS SANTOS', 'LOUSYANE PESSOA PIRES', 'José Leonildo da Silva', 'Ana Caroline Pereira de Oliveira', 'ERICK SLAYCK AGOSTINHO SIMÕES DE LIMA', 'MARIANA FERNANDES DE SOUZA LIMA', 'AURÊNIO DE OLIVEIRA BARROS', 'LAIANE DE OLIVEIRA SILVA', 'NATHALIA KEILA LEITE DE SOUSA', 'ANDERSON KLEYTON FERRAZ DOS SANTOS', 'AMANDA ROMÃO OLIVEIRA GOMES DA SILVA', 'Robson Severino da Silva', 'AURICLÉCIO DO CARMO LIMA', 'Évely Mayara de Magalhães', 'Natália Céli Campos Barros', 'Élyson Geovane Santos Florentino', 'ISAELA GOMES DE MACÊDO', 'LISANDRW ANDRYEL TELES PEREIRA NOGUEIRA', 'AVERALDO BARROS DA SILVA', 'TAYNARA NUNES LACERDA', 'JAYANE CRISTINA LIMA PATRIOTA', 'JONATAS FREIRE ANGELIM', 'LUANA ANDREZA DE MORAES ALVES', 'MARCOS PHYLIPE RÉGIS SILVA', 'BARTOLOMEU CALAÇA DE SÁ', 'JOSÉ ADELMO SALVADOR DE ALCÂNTARA JÚNIOR', 'VINICIOS LUIZ DOS SANTOS', 'ANA VIRGINIA FERREIRA SAMPAIO', 'Sthefany Camilla Leite Rocha', 'MÍDSON JÔNATHAS RÉGIS SILVA', 'BARTOLOMEU JOSÉ DOS SANTOS SILVA', 'FRADIKI FRANCISCO LOPES PEREIRA', 'Thiago Otávio Santos Angelim', 'José Renato Godê Ramos Filho', 'ANTONIO HENRIQUE DA SILVA NETO', 'LUCIANA MATILDE MATIAS DE SÁ ALVES', 'BEJAMIN JOSÉ NUNES FILHO', 'BRUNO RAFAEL FREIRE DOS SANTOS', 'EUGÊNIA DA SILVA SANTOS', 'MARKLÂNYA BARBOSA DA SILVA', 'LARISSA EMANUELE DE CARVALHO PAIVA', 'MAYLSON LEYSON LOPES DOS SANTOS SILVA', 'BENEDITO BARBOSA DOS SANTOS', 'TAYNÁ BRINGEL NOVAES', 'PRICILA MARIANY DE ANDRADE SILVA', 'BARBRA STREISAND DA SILVA RODRIGUES', 'KEELL MASTTERSON SILVA ELIZEU', 'DANIELLA SOBREIRA BARBOSA', 'BENEDITO RODRIGUES MAGALHÃES', 'BRUNA MARÍLIA SOUZA E SILVA', 'CARLA PATRÍCIA ALVES DE SOUZA', 'THAYSA FÁTIMA PEREIRA DE CARVALHO', 'Vanessa Nayara de Souza Ferraz', 'MILLENA DAYANNE DE SOUZA PEREIRA', 'BENILSON BARBOSA DA SILVA', 'João Paulo Sobreira de Almeida Alcides', 'Rodolfo de Carvalho Rafael Nogueira', 'ERIC GOMES DE OLIVEIRA', 'IRENE BEZERRA DO NASCIMENTO', 'Carlos André Alves Pinto', 'BENONE GOMES DA SILVA', 'Robson Thiago Carlos de Souza', 'Marcos Emanoel Terto Gama', 'Helder Matheus Mendonça Beserra', 'JORGE ALVES FILHO', 'Thaís Gomes Alves', 'BERNARDINO ANTONIO LIMA', 'Rogerio de Lima Gomes', 'Jéssica Maria Bezerra Lima', 'NADJA RAYANE GALVÃO FELICIANO', 'BRUNO FELIPE DE SOUZA FERRAZ', 'Leydianne Alves de Souza', 'BONIFÁCIO GOVEIA DE ALMEIDA', 'Ramaiana Julia Pereira de Arruda Pagliary', 'Jéssica Mayara da Silva Ramos', 'MARIA EDUARDA ALVES DA CRUZ', 'ÂNGELA NAIANY GOMES DE LIMA', 'MARIA DA CONCEIÇÃO DOURO DE SIQUEIRA', 'BRAULIO ALVES DE ALMEIDA', 'GABRIELA SWAMI DE ALBUQUERQUE NEIVA', 'RAMOM VICTOR DE SIQUEIRA SARAIVA', 'Raylane Crateú Fernandes', 'Juliana Moraes Ferreira ', 'ANA REGINA CARINHANHA DA SILVA', 'BRAZ JOSE DO NASCIMENTO', 'CÍCERA EGLEUMA CAMPOS DA SILVA', 'Tauana Guirra Melo', 'GLEYCIANNE CANÁRIO RODRIGUES DE OLIVEIRA', 'GILCEANE NATHÁLIA MARTINS RODRIGUES', 'DEYSE DE SOUSA OLIVEIRA', 'BRUNO JOSE SOUZA E SILVA ', 'TATYANE ROBERTO BATISTA MENDES', 'Flávia Priscila Lima Macena', 'André Ricardo Sousa e Silva', 'Aparecida Joednna da Silva Santos', 'Davi Almeida de Queiroz', 'CANTIDIANO VALGUEIRO DE CARVALHO BARROS', 'Edgleison Aquino da Costa ', 'ELOISE GABRIELA BEZERRA DE REZENDE', 'WENDY LAYANNE PEREIRA DE FRANÇA', 'LUCIANO RODRIGUES GOIS', 'JOSINALDO GERALDO DA SILVA', 'CARLOS ADELMO BATISTA NUNES', 'MARCOS AURÉLIO LIMA FARIAS', 'FABIANA FERRAZ DOS SANTOS', 'FERNANDO HENRIQUE DE ALBUQUERQUE', 'MARIA POLLYANNA DA SILVA ARAUJO', 'JOSÉ RAILDO PEIXOTO CORDEIRO', 'CARLOS ALBERTO DA CUNHA', 'Cibele Teles de Araujo', 'ADRÍCIA EMANUELLY GÓES DO AMARAL GUIMARÃES', 'Hittuyara Tadéya Kuidute Ferreira', 'FERNANDO NOGUEIRA CAVALCANTI FILHO', 'SERGIO DA CRUZ FERRAZ ALVINO', 'CARLOS ALBERTO DE MEDEIROS MAIA', 'Michele Aline da Silva Siqueira ', 'Aline Kelly da Silva Ferreira', 'Mônica Cecília Ferreira Faustino', 'FRANCISCO DE ASSIS DOS SANTOS NUNES', 'CARLOS VICTOR NERY NUNES DE BARROS', 'ALEX SANDRO MIRTIS NOBREGA AZEVEDO', 'MARIA IRIS DA SILVA RODRIGUES', 'JOAQUIM MARQUES DE LIMA NETO', 'IHAGO KAIQUE DE MELO FRANÇA TÔRRES', 'Joseildo Rodrigues de Medeiros', 'CARLOS ALBERTO NOGUEIRA DA SILVA', 'JÚLIO CÉSAR TORRES NOGUEIRA', 'SUYANE CRUZ LEAL NOVAES', 'LUEDJA FLÁVIA PEREIRA VALÕES', 'JOÃO PEDRO CÂNDIDO FREIRE', 'KAMILA VALERIANO DE SOUZA', 'CARLOS ALDI SILVA', 'WANNO KLEBER FERREIRA DE BRITO', 'JOSÉ ADEYLTON DE SOUSA FARIAS', 'CICERO BERNARDO DE LIMA JUNIOR', 'ANA PAULA ALVES RAMOS', 'MÁRCIO APARECIDO GABRIEL DA SILVA', 'CARLOS ANDRÉ COSTA DINIZ', 'ACÁCIO NUNES REGINO', 'BRUNA STERFANY MARIANO LEITE', 'ISAAC SOUZA DE OLIVEIRA', 'Bruno Pereira Carvalho Lima', 'CAROLINE STTEFANNY BEZERRA ARAUJO', 'CARLOS ANTONIO DE MENEZES', 'JANEALY FLÁVIA PEREIRA DE VALÕES', 'YASMIM MARQUES DE ALMEIDA', 'Marcos Gabriel da Silva', 'ANA CAROLINE GOMES GUERRA', 'STOLBERG JOAQUIM NETO BARBOSA BRITO', 'CARLOS ANTONIO LOPES', 'THALITA SILVA BARRETO', 'WENY MAYLANE RODRIGUES DA SILVA', 'LOUISE MARIA DA FONSECA CARVALHO ', 'Ernando de Lima Siqueira', 'Dejailma Alves de Melo Lima', 'CARLOS AURÉLIO DE SÁ', 'Allison Antônio Goés Marinho', 'Denys Zenaide Stropp Arruda', 'MARJORIE THAYNNAN PEREIRA DA SILVA', 'John Walker Miguel de Santana', 'STEPHANIE RAFAELLE LEITE DE SÁ', 'CARLOS FERDINANDO MARTINS CANDIDO', 'Poliana Keila de Souza de Oliveira', 'Eilton Bruno Bezerra Pereira', 'Ândrey Micheline Queiroz da Silva', 'Clebson Israel da Silva', 'Larissa Emanuela Faustino Antas', 'CARLOS FRANCISCO DE SOUSA', 'Thais Nunes Machado', 'RISOCLEIDE BEZERRA COIMBRA', 'JAMERSON DA SILVA NOBRE', 'Crislaine Bezerra dos Santos ', 'Diorges Guedes Veras', 'CARLOS INÁCIO DE OLIVEIRA', 'ALANA PATRICIA FERREIRA DA LUZ', 'MARIA PAULINA GOMES DE LIMA', 'MARGARIDA PAULA VITÓRIO GOMES NOVAES', 'Mykaelly Kalinne Pereira de Sousa', 'CARLOS MANOEL DE PAIVA FALCÃO', 'CARLA ANDRÉA PEREIRA DA SILVA', 'IANCA ISABELA DE MOURA SOUZA RODRIGUES GUIMARÃES', 'Josefa Adriane Laryssa Silva', 'Lindolfo Pimentel de Oliveira', 'JARMESON DE SOUZA CAVALCANTE FILHO', 'CARLOS OLANDO PEREIRA DA SILVA', 'Wyrlla Barbosa Canário', 'ALEX BEZERRA GOMES', 'Mario Célio Gonçalves da Silva Júnior', 'Priscilla Mayara Alcantara de Oliveira Lima', 'Raylla Lucas de Barros Vidal', 'CARLOS RICELLY GUIMARÃES CAVALCANTE', 'Taynara Leal de Souza Menezes Martins ', 'TAISE DA CONCEIÇÃO LUCENA', 'Jeissy Adrielly da Silva Valões ', 'RAYZA RAYANNY MEDEIROS DE SOUSA', 'Haline Clea Andrade Freire', 'CARLOS SÍLVIO PAULINO DA CUNHA', 'ANTONIO DE PÁDUA VIANA MORAIS', 'GILBERGUES SANTOS SOARES', 'DANIEL BARBOSA SILVA', 'Cristiano Teixeira Dantas', 'Víctor Melo da Silva', 'CELIA MARIA LEANDRO FERREIRA', 'ALEX RODRIGUES GONÇALVES', 'Clenilda Rodrigues de Andrade', 'VICTOR RODRIGUES DE LIMA', 'Marco Aurélio Cordeiro Rocha ', 'MAXUEL MAGNO NOGUEIRA VITÓRIO', 'CELSO BEZERRA DE SOUZA', 'EDVÂNIA MARIA DA SILVA', 'Cibele Hellena Alves de Araujo Andrade', 'RENATO VICTOR DE SOUSA AGUIAR', 'MATEUS BEZERRA PEREIRA DANTAS', 'SANDRA REJANE DE LIMA SIQUEIRA', 'CERIACO LOPES DE LIMA', 'ANDRÊSA RODRIGUES DE BARROS', 'CRISTIANO HIPÓLITO DE OLIVEIRA NETO', 'DANILO GONÇALVES MACIEL', 'LEILA DANIELA DOS SANTOS SIQUEIRA', 'ANTONIO DA SILVA LIMA', 'CESAR ROMERO LOURENÇO DE VASCONCELOS', 'Dayllon Souza Lima', 'ANA BEATRIZ GUEDES RAMOS', 'ADRIELLE DA SILVA PEREIRA DO NASCIMENTO', 'LARYSSA KARLA MODESTO VIANA DA COSTA', 'ANDRESSA MAYANNE DE SOUZA CARNEIRO', 'CHARLLES REKSOIN BARBOSA DE LIMA', 'HIGOR SOARES PIRES DE SÁ', 'JÉFFERSON LEÃO FERNANDES DA SILVA', 'EMANUELLY MIKAELLY NUNES DE MELO', 'ÉVERTON PABLLO FIDÉLIX EPAMINONDAS', 'Elzir Ferreira da Silva', 'CICERO ADEILDO ALVES DE LIMA', 'MARCOS ANTONIO SOUTO CHATEAUBRIAND FILHO', 'Ana Karine Souza Castro', 'Wellen de Lima Cavalcanti Lacerda', 'RUANE LARISSA DOS SANTOS MORAES', 'Andyara Marjorie Gomes', 'CÍCERO ALVES PEREIRA ', 'LIVIA LIMA GOMES', 'JACKELINE RAYANA DE LIMA SANTOS', 'REYDIÉVILA SILVA DE CARVALHO', 'Maria Verônica Brasiliano de Rezende Severo', 'CICERO ANTONIO PEREIRA', 'Evelyn Noronha Soares', 'CLARCSON SANTANA MAIA DE MEDEIROS', 'Laércio Gomes dos Santos', 'Sidicley Luiz dos Santos', 'GISELA RAMOS DOS SANTOS', 'CÍCERO AUGUSTO DE SOUZA', 'Patricia Evellyn Pereira Bezerra', 'Josicléia Neuza da Silva', 'MARIA THAÍS MATIAS GONÇALVES', 'ALINE PEREIRA DOS SANTOS GOMES', 'ANNA ELIZABETH DE JESUS ALVES', 'CÍCERO BATISTA DA SILVA', 'Stephanie Virgínia Siqueira Gomes', 'THAÍS PEREIRA DE CARVALHO', 'IAGO DE LIMA BARROS', 'QUEREN HAPUQUE FERREIRA DE SANTANA', 'NATHALIA DE BARROS PEIXOTO', 'CÍCERO BEZERRA DINIZ', 'Ayanne Danielle Almeida de Medeiros', 'VANESSA DE SÁ SILVA', 'Felipe Vinícius de Brito Pires Batista ', 'MARCOS VINICIUS SILVA BARBOSA', 'CICERO CARLOS OLIVEIRA NASCIMENTO', 'Junielson Cicero do Nascimento Melo Lima', 'FÁTIMA RAELY FERREIRA SIQUEIRA RODRIGUES ', 'Kawane Daelly Barbosa Ferreira', 'José Eduardo Rabêlo Rezende', 'Isaac Souza de Macedo', 'CÍCERO CORDEIRO BEZERRA', 'MARCIO AUGUSTO FIGUEIREDO INÁCIO DE OLIVEIRA', 'Valdeilson Medeiros de Sousa', 'GILVÂNIA RIBEIRO LEITE', 'HIANCA MICAELA ALVES SANTOS', 'Clara Tailane de Souza Santos', 'CÍCERO DE SÁ VIEIRA', 'MARIA DO SOCORRO FREITAS', 'ANIELY INÁCIO VANDERLEI DE OLIVEIRA', 'Sara Tavares Marques', 'UDINADIA MARTINS DA COSTA', 'Paula Crislaine Leite da Silva', 'CICERO DE SOUSA LIMA', 'JANAINA KELLY VIEIRA DE SOUZA', 'Ítala Karoline Morais Silva do Nascimento', 'Maria Graciete Ângelo Guedes ', 'Andréia Laís de Lima Feitosa', 'Francielly Dayse Tiburtino da Silva', 'TÂMARA RAYONARA DE SÁ SILVA', 'Maria Nildeires Ramos Leite', 'Héryca Nycársia Norões de Oliveira', 'IGOR LUIZ BRITO DE SÁ', 'Flávio José Alencar Carvalho ', 'CÍCERO DOS SANTOS FERRAZ', 'MARIA DO SOCORRO DA SILVA FERRAZ ', 'Osaneide Maria da Silva', 'Marcilene Rayanne de Souza ', 'LUCICLEA BEZERRA ALVES DE SÁ', 'EMANOEL FELIPE DA SILVA CORDEIRO DE SIQUEIRA', 'CICERO FERNANDES DA SILVA', 'ANDERSON LIMA DE PÁDUA', 'ALINE DE ARAÚJO LIMA', 'HUGO RAFAEL SANTOS SIQUEIRA CAJUEIRO DE ALBUQUERQUE', 'Alane Clécia de Andrade', 'MARIA EVERLANE DA SILVA LIMA', 'CICERO FERREIRA MATIAS ROCHA', 'ANA CRISTINA NUNES DE SOUZA', 'NÚBIA JACIARA BATISTA MARTINS NASCIMENTO ', 'LUIZ ANTONIO LOPES', 'CRISTIANO DO NASCIMENTO LIMA', 'Lucílio Diego da Silva e Silva', 'CÍCERO GEDIVANHO BENEVIDES DE MELO', 'FELIPE FERREIRA DOS SANTOS', 'Francisco Breno da Silva Monteiro', 'GILSON FÉLIX DOS SANTOS JÚNIOR', 'Irglêdson Adrício de Souza Lima Júnior', 'CÍCERO GOMES RODRIGUES', 'MARIA AUGUSTA LOPES GOMES SILVA', 'ANTONIO MARIANO DE BRITO FILHO', 'CARLOS ANTONIO DA SILVA', 'Daniel Vasconcelos Florentino', 'Luiz Afonso Bezerra Alípio', 'CÍCERO JOAQUIM BENÍCIO', 'JAILSON ALVES MACHADO', 'JOSSENY KENY RAMOS DA COSTA', 'JOSÉ WELLINGTON TAVARES DE OLIVEIRA', 'ABIGAIL INGRID RIBEIRO MELO', 'Wedja Nonata da Silva Ferreira', 'CÍCERO JOSÉ DE MOURA', 'MARCOS JOSE LUNA DE ARAUJO SILVA', 'JOÃO VÍCTOR MARINHO FERREIRA', 'LICELLE CAROLINA DINIZ PEREIRA DE SÁ', 'LUCIA DE FÁTIMA ALVES DE SOUZA MAGALHÃES', 'LUCIANO JOSÉ GONÇALVES BEZERRA', 'CÍCERO JOSÉ NEVES', 'FERNANDA DINIZ FALCÃO REIS CAVALCANTI', 'Adriana Maria dos Santos Polycarpo', 'Kesiane de Andrade Santos', 'RAFAELA GONÇALVES DURAND ', 'JOSÉ ARMANDO MOURA MORAES JUNIOR', 'ANNY LOYSE DA SILVA MORAIS', 'DANIELA SIMÕES DALTRO DE MOURA NUNES', 'WAGNER JOSÉ DE SOUZA', 'Jaqueline Leite Angelo', 'CÍCERO LEANDRO LIMA', 'ALAN BRUNO DA SILVA GOMES', 'ANA PAULA FERNANDES CAVALCAMTI BEZERRA ', 'Alexssa Anielly Araujo de Lima Bastos', 'Ilana Elen Rodrigues dos Santos', 'SAVANNAH MASTRANTONIO MACCULLOUGH VALHALHA BORGES FERREIRA SOUZA', 'CÍCERO LUIS ALVES', 'Thaynara Flosi Silva', 'ELLEN KARINY GALVÃO ALMEIDA', 'Renato Soares Resende', 'Joann Gustavo de Almeida Ferreira', 'Cleison Alves da Silva', 'ENEIDA DE CARVALHO BARBOSA SOUZA', 'MARIA DE LOURDES DA SILVA', 'Camila Patrícia Leopoldo de Assis Nunes', 'Nafra Nazirrê Cirino Lima', 'Marcia Adriana de Siqueira Leite', 'CÍCERO LUIZ', 'Ewerton Eduardo dos Santos Tenório', 'Mayara Januaria Alves Pereira', 'Kaio Fernando de Souza Santos', 'WELLINGTON FERREIRA VIEIRA GUIMARÃES', 'Israel Gomes Siqueira', 'CICERO LUIZ MENDES', 'Italo Fernando Vicente de Castro', 'VICTOR VINICIUS BEZERRA PEREIRA', 'Eliete Nunes da Silva ', 'Raniere da Silva Lima', 'Thamyres Custódio de Lira', 'CÍCERO MANOEL SEBASTIÃO', 'Clarissa Carla Queiroz de Almeida', 'ANA MARIA DE MAGALHÃES PEREIRA', 'Ivaldo Gercino de Carvalho Pires Belfort Júnior', 'ESTHEFANY DE SOUZA FERRAZ', 'ARELY INÁCIO DA SILVA SOUZA', 'DEBORA ARAÚJO DOS SANTOS', 'Nielma Viviane Alves Pereira', 'Jéssica Gabrielle Siqueira Estima', 'MARIO MÁRCIO NOGUEIRA FERRAZ', 'Marli dos Santos Damasceno', 'CÍCERO MARIANO DE MOURA', 'Rilene Michelle de Lima Nascimento Santos', 'RENATO BARROS MORAES', 'João Pedro de Menezes Novaes Ferraz Silva', 'MEDSON CÍDNE DE SOUZZA RODRIGUES', 'ÉRICA PATRÍCIA FELIX DE SOUZA', 'CÍCERO MEDEIROS DE SANTANA', 'Anne Caroline Bezerra da Silva Barros', 'EDUARDO HENRIQUE RIBEIRO LOPES', 'ÁTALO CAIO MAGALHÃES DE SOUZA', 'VERALUCIA PEREIRA DE SÁ', 'Marcos Víttor Francelino Queiroz', 'CICERO NOGUEIRA DE ALMEIDA', 'PRISCILA LIMA DANTAS DE QUEIROZ TORRES', 'ROBSON WILLIANS DE SOUSA SANTOS', 'Julianny Fernanda Santos de Albuquerque', 'Maria Vivyanni Gomes de Brito', 'JHONATA CAIO SOUZA MARINHO', 'CICERO PAULINO DE LIMA', 'Irena Maria Leonardo Cardoso ', 'Valdicléa Ferreira da Silva', 'Maria Elaine do Nascimento Honorio', 'DAVI DE SOUZA LEITE MELO MOURA', 'Wagner Gois de Siqueira ', 'CÍCERO PEREIRA DE LIMA', 'LUAN FABRICIO SILVA ALVES', 'MARIA JUCILENE LEITE DA SILVA', 'Maria Gabriela Salustriano de Oliveira Clementino', 'LUCIANA MARIA DE MORAES SILVA', 'PAULO GERMANO BARBOSA', 'CICERO RAIMUNDO DO NASCIMENTO', 'MARIA YARA BRAZ DA SILVA', 'Priscila Raquel Torres Cipriano da Silva', 'CANTIDIANO SOUZA VALGUEIRO DE CARVALHO BARROS', 'Jefferson Angelo Aires Nogueira ', 'Maria Zélia Pereira', 'THAYNA FREIRE DA SILVA SANTOS', 'FABIANO GOMES DE CARVALHO SÁ', 'José Renato Godê Ramos', 'Wilson Alves Barros', 'CICERO ROBERTO CAMPOS DA FONSÊCA', 'Joana D´arc Pereira da Silva', 'MARIA JOSÉ MORAIS BEZERRA BARBOSA', 'Laelly Catarina Lima Diniz Carvalho', 'LAISA DE CARVALHO RODRIGUES', 'SANDRA HELENA DA CONCEIÇÃO CAMPOS', 'CÍCERO RODRIGUES DE MELO', 'CAIUS CAESAR JOSEPHI DE MENEZES SILVA', 'Vagner Antonio dos Santos Silva', 'Rayane Mayara de Lima', 'DÉBORA JAYLE SANTOS NUNES', 'CARLOS HENRIQUE VIEIRA MARQUES', 'CÍCERO RODRIGUES SANTOS', 'Jálison Eziel de Medeiros Soares', 'Layla Miryella Feitosa Ferreira Diniz Ventura', 'Alexandre Bittencourt Santos', 'Jadilson de Souza Barros', 'ANA RAQUEL DA SILVA VIANA', 'CICERO SOARES DA SILVA', 'Maria Antonia dos Santos', 'Gehoston Tharly da Silva Brito', 'ANNY ALINE VIEIRA DE LIMA', 'WESLEY DE ALMEIDA LIMA', 'THAISE CARVALHO LIMA E SILVA', 'CICERO TORRES LIMA', 'Allan Francisco da Silva', 'Ana Gabriella Silva Pereira', 'GABRIEL CIRINO MONTEIRO', 'SUZANEIDE ALVES DE SIQUEIRA', 'Bruna Isabelly de Sousa Lima', 'CÍCERO VIEIRA DOS SANTOS', 'Paulo Henrique de Sa Silva', 'Crishna Santana Maia de Medeiros', 'CHAIANE BARBOSA DA SILVA', 'Viviane Maria de Souza Ferraz', 'Mariza Barbosa Canário dos Santos', 'CIDICLEY RABÊLO ALVES', 'LARISSA MAYARA DE SOUZA OLIVEIRA', 'ATHALIA CORDEIRO FLORENTINO ', 'Marcos Vinícius Alves dos Santos', 'Cayk Dennyson da Costa Cerqueira', 'Damião Inácio da Silva', 'GUILHERME HENRIQUE PEREIRA DA SILVA SIMÕES', 'Victor Angelo Gomes Alves', 'Edson Pereira Barboza', 'CÍRERO VIEIRA DOS SANTOS LIMA', 'Rodrigo Siqueira Lima e Silva', 'Lucas Bezerra Campos ', 'PEDRO DAVI VIEIRA ARAGÃO', 'Valdi Antas de Almeida Junior', 'Janaina Lima Silva', 'CLALDEMIR DA COSTA', 'Maria de Lourdes Imaculada Miguel', 'Erica Fernanda Pereira da Silva', 'ANDERSON BRUNO INACIO DE GOES', 'Elias Victor Menezes Lima', 'Marcilia Layce Augusto Silva', 'CLAUDEMIR NOGUEIRA GOMES', 'MARIA EMILIA LIMA DE CARVALHO', 'Afonso Vinícius de Sousa Nunes', 'Mayara de Moura Souza Ferreira', 'Amanda Kely Cavalcante Cordeiro', 'MANNUELA SANTANA DE SOUZA VIEIRA', 'CLAUDENÍ BELARMINO DOS SANTOS', 'LAÍS CAVALCANTI MAIA', 'Darla Bezerra Siqueira', 'Iara Driely Rodrigues da Silva', 'Elaine Gabriele Bezerra de Paiva ', 'EDNEIDE DELMONDES DA SILVA', 'BEATRIZ RODRIGUES DE MOURA GÓIS', 'JOSE ARISTOTELES GALDINO BRANDAO', 'JOÃO VICTOR ALVINO DE MOURA CAVALCANTE', 'Maria Luana dos Santos Lima Ferraz', 'CLAUDIANOR FERNANDES DE ARAÚJO', 'IGOR GABRIEL BEZERRA LUIGI RAMOS', 'Iállysson Vinícius Araújo de Oliveira ', 'Thaísa Lacerda Barboza', 'Patrícia Soares da Silva ', 'Tiago Menezes de Queiroz ', 'LETÍCIA ALVES DAVID DE CARVALHO', 'Manoel Pereira Zuza Neto', 'Taís Araújo de Góis', 'ELENILSON NOBRE VERAS', 'AMANDA MAIARA BEZERRA ALVES', 'CLAUDIO BEZERRA DE SOUZA', 'MAYARA LOPES BEZERRA DE MENEZES', 'Pedro da Silva Siqueira', 'ÂNDERSON MATHEUS TEIXEIRA LIMA', 'MATHEUS FELIPE ALVES AMADOR', 'ANA PAULA CASTOR BATISTA', 'CLÁUDIO DE SOUZA MENEZES', 'Maria Luíza Nunes Moreira ', 'LUCIANO SÁVIO SOARES DE SOUZA', 'Jéssyca Mayara Lima Duarte', 'JOBSON JOSÉ DA SILVA', 'Suzete de Souza Barros ', 'CLAÚDIO JOSÉ INÁCIO MIRANDA DO AMARAL', 'EDVALDO FEITOSA FERRAZ', 'Rodrigo Oliveira dos Santos da Silva', 'RUSLAN PEREIRA DA SILVA', 'EMANUEL FERNANDES ALENCAR VALÕES', 'TIMÓTEO LOPES DOS SANTOS', 'CLAUDIO PAES DE SOUZA', 'Zailda Melo da Silva', 'Fabiano Torres Lins Gomes', 'NATHÁLIA PEREIRA DINIZ', 'Isadora Fiamma Nunes Oliveira Pereira de França', 'AFLÂNIA DANTAS DINIZ DE LIMA', 'CLAUDIO SÉRGIO DE SOUZA', 'George Luis da Silva Souza ', 'ELITON MICHAEL OLIVEIRA BARBOZA DE LIMA', 'Hêmily Wanneza de Sá Padilha', 'NÁDYA MARIA GOMES ALVES DE SÁ', 'Filipe dos Santos Silva', 'CLAUDIUS CAESAR JOSEPHI LIMA E SILVA', 'Monique Suelen Araújo Porfírio', 'CAROLINE PEREIRA NUNES DE ASSIS', 'Thallyta Nayan Campos Pereira', 'Andriele Madalena de Melo Silva ', 'Fábio Herculano Antas Florentino ', 'Maria Neuma do Nascimento e Silva ', 'Shirleyde Pereira Expedito ', 'Franciele de Lima Moura ', 'Lydja Rayhanne Dário Ferreira ', 'CLAYTON ERIK DE LIMA MELO', 'Raddíbi Antas Marques Cordeiro ', 'Aline Micaele Alves Barros Lima ', 'Catarinne Francis Nunes de Magalhães ', 'LUCÉLIA FREIRES DOS SANTOS', 'MARIA DO SOCORRO PEREIRA DOS SANTOS', 'CLEIDSON DE CARVALHO NUNES', 'LARISSA RUAMMA DE SENA LIMA', 'GENECY SILVA DE LIMA JÚNIOR', 'Thaise Tâmara Pessoa Santos ', 'JOSÉ LEONARDO ALVES BARBOSA', 'ALTIVÂNIA MOURA PIRES', 'CLERBSON GREYKYANO CAVALCANTE DE AQUINO', 'Matheus Pereira Viana Santos', 'Bruno Lopes Cruz', 'DAYANE CARLA CARNEIRO DE SOUZA PEREIRA AMARAL', 'LUIZ FELIPE PEREIRA DE OLIVEIRA', 'Alana Kaline Ferreira de Souza', 'CLEUTON CÉLIO LUSTOSA ANGELIM', 'SUZANE KELI DE SOUZA SANTOS', 'Tamíres Eduvirgem das Dores', 'Marthus Além Pereira Bringel', 'Danielle Santana de Rezende', 'Rafaela Kaline Santana Pereira', 'CLODOALDO TOMÉ DA SILVA', 'ÉRICA REGINA SIMÃO DA SILVA LIMA', 'Willma Rafaela Morais de Vasconcelos', 'Rosimere Batista da Silva', 'SABRINA CAROLINE NUNES COSTA', 'Thays Cristina Leandro Gomes Siqueira', 'CLODOALDO VITAL DE MELO', 'Marcos Antonio Martins dos Santos', 'Karla Emmanuele Silva', 'Georgeana Silva Santos', 'Ana Cristina de Barros Lima', 'Waleska Jayne da Costa Sousa', 'CLOVES RONALDO SIQUEIRA BRITO', 'MANOELA SOUZA VIEIRA', 'Álvaro Carlos de Sá Lima', 'AISLANHA DA SILVA SANTOS', 'Adricia Tenório Diniz', 'Simone Fideles de Sá', 'CLOVIS ALEKSANDRO DE LIMA', 'Roney Célio Simões Vieira', 'ISAAC GOMES', 'Jônatan David Santos Pereira', 'Paulo Roberto de Araújo Grimaldi Júnior', 'Rafaías Pereira de Siqueira ', 'JÚLIO ANDRADA FERRAZ', 'Mariana Diniz Bezerra ', 'ALEXSANDRO JOSÉ DOS SANTOS', 'VENANCIO JUNIOR DA SILVA NOGUEIRA', 'KLEYDSON LOPES RODRIGUES DOS SANTOS', 'CLOVIS NUNES DE SOUZA', 'MATHEUS CARDOSO DE FREITAS', 'Matheus Henrique de Souza Oliveira', 'Esiel Santos Braziliano Filho', 'NAYARA SANTOS BRASIL', 'KRYSTHYAN RAPHAEL SANTOS PEREIRA VALÕES', 'CONSTANTINO GOMES DE SÁ', 'RAFAEL BESERRA RAMOS', 'Paulo Ricardo Sampaio de Sousa', 'Joaquim Lucas Pereira Novais ', 'Jamime Laís de Medeiros Bezerra', 'WINÍCIOS KENNEDY DA SILVA NASCIMENTO', 'COSME ALVES DOS PRAZERES', 'Anderson Gomes Bezerra', 'JOSÉ PAULO ALVES DA SILVA', 'Yanca Karolayne de Araújo Fernandes', 'Isabelle Ribeiro da Silva ', 'Mayara Caroline Bezerra dos Santos', 'COSME ANTONIO BEZERRA', 'ANGELA MARIA DOS SANTOS SCHEPP', 'ELISÂNGELA BARROS DE SIQUEIRA', 'Geny Paula de Almeida e Silva', 'Wémerson de Lira Teotônio', 'Ana Beatriz de Sá Silva', 'COSMO BARBOSA NOGUEIRA', 'Susan Sabrina Pereira Nogueira ', 'CÍCERO RANNYELLY DA SILVA CAVALCANTE', 'KEPLER MICHAELL LACERDA RODRIGUES GONZAGA DA SILVA', 'ANDRÉ DA SILVA MATOS', 'FABRÍCIA PEREIRA NOGUEIRA', 'CREONILDO ATANÁZIO PESSOA', 'Kaio Cézar Martins dos Santos', 'WYLLEY MATHEUS LEITE LEANDRO', 'RENAN NOGUEIRA VIDAL', 'ALICE CAROLINA DE SOUZA LEAL SÁ', 'MARIA GIZELMA SILVA PEREIRA MAGALHÃES', 'CRISTIANO GOMES DOS SANTOS', 'Joice Rafaela de Souza Silva ', 'EDEIWES MARQUES PEREIRA DE BARROS', 'Inan Kaleu da Silva Pereira ', 'Fátima Paloma Pereira Lopes', 'SAMUEL DE MEDEIROS SANTOS', 'CRISTÓVÃO LUIZ DA SILVA', 'Miguel Fernando Amaral Ramos de Morais', 'ENYA LUIZA VALERIANO BRASILEIRO', 'RAYANNE STEPHANIE RODRIGUES MARQUES', 'Thamires Alvaro Lima de Magalhães', 'MARCELYSON NOVAIS DAMASCENA BEZERRA', 'DAMIÃO ANTAS CORDEIRO', 'AMANDA PEREIRA DE ALMEIDA NÉ', 'Débora Siqueira Carlos de Andrade', 'Bárbara Bruna Gondim Pereira da Silva', 'Leonara Batista de Sousa ', 'CAMILA EMILY OLIVEIRA SANTOS', 'DAMIÃO CRISTOVÃO FERREIRA ALVES', 'JOSÉ CÉSAR SOUZA VASCONCELOS', 'Maria de Lourdes Nunes de Sousa Lima ', 'MARIA WEDNA TALITA FERRAZ DE LIMA', 'MARIA EDUARDA NOGUEIRA RODRIGUES', 'FRANCISCA RAQUEL CAVALCANTI CESAR DE SOUZA', 'Adriano César de Oliveira Pinto', 'João Batista Gomes Cavalcanti', 'Taynã dos Santos Oliveira ', 'Viviane Andresa dos Santos', 'DAMIÃO DIAS DA SILVA', 'Carolayne Fernandes de Souza Pereira', 'Alexandro Pereira Leite', 'JEFFERSON ALEXANDRE FREITAS', 'AQUILLES HERMOGENES PADILHA DUTRA', 'Thaís Elvira Nogueira de Almeida', 'DAMIÃO FELIX DA SILVA', 'Lara Rafaela Silva Sá', 'CIANNE NÁTHALLY DE SIQUEIRA MOURA', 'Maria Aparecida Freire de Sá Brito', 'MARIA HELENA DE MORAIS NETA', 'DAMIÃO GOMES DE SÁ', 'Bruno José da Silva Bezerra', 'Donismar Pereira', 'JÉSSICA GOMES DE SIQUEIRA', 'Elioneide Maria de Moraes', 'Menberson Santana Souza Lôredo', 'DAMIÃO JOÃO SIMÃO', 'MARIA AUGUSTA LEÃO BRASIL DA SILVA', 'Nicolly Márcia Nunes da Silva', 'Rayane Ayara Ferraz Xavier Silva', 'Ingrid dos Santos Freires', 'Josielly Danielly Vasconcelos Soares', 'DAMIÃO LIMA DE CARVALHO', 'Annielton Magno Carvalho de Andrada', 'Thaisa Cristtiny Matos Jacob', 'Severino Moreno da Silva', 'Eliene Pires de Sá', 'Gicelma Cavalcanti da Silva', 'Natália Sônia de Sá', 'EDJANIO LUIZ BARBOSA', 'Kryjsther Ramminny Melo de Carvalho', 'NATÁLIA BRUNA DE SOUZA REZENDE ', 'ANA CAROLINA NUNES FERRAZ CAVALCANTI', 'DAMIÃO MEDEIROS LEITE DA SILVA', 'SARA KAROLINE RODRIGUES DE CARVALHO', 'RAÍZZA BARBOSA ELOI MENDES', 'Girliane Pereira Virginio Freire', 'ANA LUIZA PEREIRA DANTAS', 'JAMYLE MAXSAYLA SILVA LEITE', 'DAMIÃO PEREIRA BRITO', 'MARIA GREGORIANA DE SOUZA FERRAZ', 'Andrêssa Caroline de Souza Santos Siqueira', 'ANA LUIZA DAVI DE SOUZA PIRES', 'EVLYNN VANESSA DE ALMEIDA SOUZA', 'MÔNICA DE ALMEIDA SOUZA', 'DAMIÃO RIBEIRO SANTOS', 'MARIA JOSIVANIA DOS SANTOS MARCOLINO', 'Bruno Alexandre Maniçoba Leite dos Santos', 'Verônica Izaabel Pereira Silva', 'Aliny Alves da Silva Ribeiro', 'MARIA EDUARDA QUEIROZ COUTINHO CARVALHO FREITAS', 'DANIEL ALVES NORONHA', 'MARKLEISON JOSÉ ALVES GOMES', 'Caio Henrique Lacerda Ribeiro', 'ERICA BEATRIZ MENDES ROBERTO', 'Ana Luíza Bezerra da Silva', 'Maria do Socorro de Oliveira Clementino ', 'DANIEL PEREIRA LOPES DA SILVA', 'Thaís Morgana Bequiman Silva', 'Marília Lúcia Leal Rodrigues Soares', 'BRUNA MARIA DOS SANTOS', 'Layane Gonçalves Almeida', 'MARINA SOUZA SILVA', 'Geovana Carla Alves de Carvalho', 'Danielle Maria Queiroz de Lima', 'RENATA MAGALHÃES RAMOS', 'Pedro Dantas de Oliveira Neto', 'Laís Queiroz Veras de Brito', 'DANÚBIO WAGNER VIEIRA DE AZEVÊDO', 'Emiliano Maciel Mendes Medeiros', 'Herycka Lopes da Silva Mariano', 'FRANCILENE DA SILVA PEREIRA', 'Guilherme Heverton Lima e Silva', 'JOSÉ ROSIVALDO DE MOURA LIMA', 'DARCIO FERREIRA DE ARAÚJO', 'WILLIANNE MARILIA PINTO GOIS', 'JAMILLY KELLY ALVES MAGALHÃES', 'Igor Matheus de Queiroz', 'MARIA PRISCILA NUNES NASCIMENTO', 'TATIANE SILVA LIMA', 'DARIO DA SILVA RODRIGUES', 'Paulo Ilo Nogueira Alves', 'DANIEL VICTOR CAMPOS ARAÚJO', 'JOSÉ HIGOR MELO JÚNIOR', 'Rônio Menezes da Silva', 'SAMMUEL HONÓRIO CARVALHO SILVA', 'DARLOS JOSÉ DE SIQUEIRA SOUZA', 'JANICLÉA DINIZ PEREIRA', 'Jaíne Raquel  dos Santos  Silva', 'Welington Vila Nova Júnior', 'Alcione Silvestre Pereira', 'LARISSA GUERRA PESTANA', 'DAVID DA MATA PEDROSO', 'Alanne Jessica Simões e Silva', 'Itagive José Soares Cordeiro e Silva', 'MARIA APARECIDA DE OLIVEIRA', 'José Joacaz Vieira Lima', 'ROMÁRIO LEITE DA SILVA', 'DAVID RODRIGUES NETO', 'JOSEANE DA SILVA FERREIRA', 'Suziana Fernandes de Lima', 'ALEXANDRE LIMA DE SOUZA', 'Marcos Emanuell Gomes Victor', 'MICALANE CORDEIRO BEZERRA', 'DEJAIR ULISSES DE MEDEIROS', 'GABRIELLA DOS SANTOS DINIZ', 'MARIA CAROL RAMOS SOUZA  FERREIRA', 'Pedro Augusto de Oliveira Medeiros', 'Paloma Chiana Nunes Nogueira de Sá', 'MARILISI APARECIDA DE SÁ', 'DENILSON ALVES DOS SANTOS', 'Karen Cavalcanti Rodrigues', 'SAFIRA CORINA DA SILVA BARBOSA', 'Glauciana Novaes Lopes Duarte', 'NADIANE DOS SANTOS NUNES', 'EUTALIA MARIA CLEMENTINO DE QUEIROZ', 'DENILSON DE SOUZA NOVAES', 'Leticia dos Santos Freitas', 'NIKAEL PEDRO DE SOUZA ARAÚJO', 'EILSON DO CARMO LIMA', 'ELVIS ARI DE SIQUEIRA LEITE', 'Hellen Carvalho Terto', 'DENNIS FRANCISCO BARBOSA OLIVEIRA', 'JOSEPH CESAR NATHAN HENRIQUES NOBREGA DO NASCIMENTO', 'Amanda de Alencar Coelho', 'ARCANJO GABRIEL PEREIRA BARBOSA', 'HUDSON FABBIO FERRAZ FEITOZA', 'RENATO ARAUJO BELO', 'DERMIVAL MANOEL DOS SANTOS', 'EMYLLE NATHALIA DOS SANTOS LIMA', 'WILMA PEREIRA BATISTA', 'Paula Gisele do Nascimento', 'EDIVANIA MARIA DA SILVA NUNES', 'Jonathan Lucas Rodrigues de Barros', 'Mayra de Alcantara Alves Feitosa', 'Ana Rosa Soares Leal ', 'Jaciane Maria Candido dos Santos', 'Renato Teles Pereira Lopes', 'DEUSIMAR MARTINS DOS SANTOS', 'Marcus Vinicius de Melo Souza', 'VICTORIA GOMES SANTOS', 'MARIANE CRUZ DE SOUSA', 'JOSÉ RODRIGUES DA SILVA NETO', 'SHARLES DE OLIVEIRA SIQUEIRA', 'DIJAVAN LOURO DA COSTA', 'GABRIELA NUNES MAGALHÃES', 'WEUDRY DARLAN GUIMARÃES RODRIGUES', 'Wendson Novaes de Sá', 'ADRIANA CHEILA SALVADOR DA SILVA', 'LOURIVAL ALEXANDRE SIMOES', 'DINIZ ASSIS DE FARIAS JÚNIOR', 'JOSE CARLOS VIEIRA DE OLIVEIRA', 'Iara Nunes da Silva', 'NUBIA LAUDELINA NOVAES CAMPOS', 'JOÃO VICTOR RODRIGUES DE LIMA', 'Tayná Paz da Costa Carvalho', 'DIOMÍNIO ALVES DE OLIVEIRA', 'Tássio Matheus Ramalho Ferraz', 'GERALDO LUIZ LEITE', 'ELIEL FRAGOSO DA SILVA', 'LAÍS RAFAELLY AMARAL CIRINO', 'LARYSSA ALANA TELES PEREIRA NOGUEIRA', 'DIONIZIO QUEIROZ RODRIGUES', 'ANDRESSA MARIA BARROS DE LIMA', 'DIOGO LUCAS FERRAZ', 'Alana Karine Lopes Ferraz', 'JONATHANYA MARQUES SILVA', 'ÊNIO HEMERSON SANTOS COSTA', 'DJAILSON JOSÉ DE LIMA', 'Lívia Emiliane da Silva Barros', 'Edinalda Maria da Cruz Nunes', 'FABRÍCIA DE MOURA PEREIRA CAMPOS', 'Jakeline Batista de Oliveira Silva ', 'PAULA DE FREITAS FERNANDES', 'DJAIR LUIZ CAVALCANTE', 'Fagner Barbosa Nogueira', 'GILMARA RAIMUNDA DA SILVA', 'Marina Samilla de Sá Leal ', 'Viviane da Silva Lima', 'MARIA GABRIELLY CORDEIRO NASCIMENTO', 'DJALMA AUGUSTO DA SILVA', 'Andiara de Aquino Nascimento', 'Maria Aparecida Rodrigues Alves', 'Luzia Victória Bezerra Rodrigues de Morais', 'Maria do Socorro Gomes de Lima', 'Joana Paula da Silva', 'DJALMA SERAFIM', 'Nádia Aline Pereira Rodrigues', 'JOAQUIM ANTUNES BEZERRA NETO', 'Maria Gabriela Ferreira de Sá', 'Ravanelli Vicente de Siqueira Lima', 'KENIO MÁRCIO DE CARVALHO SILVA', 'DOMINGOS BEZERRA DOS SANTOS', 'Paulo Ricardo Novaes de Sá', 'DÉBORA MARIA RODRIGUES MEDEIROS', 'MARCOS VINÍCIUS SOUSA OLIVEIRA', 'PAULO ALEXANDRE DA SILVA PEREIRA', 'JOSÉ LUIZ GOMES DE CARVALHO MOURATO', 'DOMINGOS RODRIGUES NUNES', 'Kelly Laise Gomes', 'LARISSA LOPES DE LIMA BEZERRA', 'TAISA MORGANA LEITE BARBOSA', 'LUIZ ANTÔNIO ALVES DO AMARAL', 'DIEGO DA SILVA NASCIMENTO', 'DOMINGOS SÁVIO DA SILVA', 'MARCOS ANTÔNIO DE LIMA SANTOS', 'INGRIDY SUELLY ALVES BRANDÃO', 'José Vinícius Justino', 'ELIORGENES PUEBLO LEITE SANTOS', 'Daniel Rodrigues de Souza', 'DOMINGOS SAVIO FERRAZ ', 'Vinicius Ramon Lima Dias', 'CÁSSIA LAYSE TOMÉ DA SILVA', 'EDUARDO ROBERTO DE SOUZA', 'CHARLES MACHAEL DA SILVA SÁ', 'WESLEY CLEYTON DA SILVA BEZERRA', 'DOMINGOS SÁVIO PEREIRA DE CARVALHO', 'Wiliana Yara de Freitas Santos', 'ANA ELIZABETH DE SOUSA SANTOS', 'Hugo Renato Alves', 'VALÉRIA XAVIER DA SILVA ', 'Luana de Lima Santos', 'DORGIVAL ARAÚJO MELO', 'BÁRBARA TORRES TEIXEIRA BRASILEIRO', 'Rita de Cassia Oliveira de Lima', 'JOÃO GUSTAVO DA SILVA GARCÊZ', 'LUCAS MATEUS LOPES AGOSTINHO', 'NATHÁLIA VITÓRIA MARIA BARBOSA DE FREITAS', 'DORIVAL SOARES DA SILVA', 'LÍVIA MAGALHÃES SILVA', 'ÁLYSON FRANKLIN MATIAS LIMA', 'Joscelly Louise Gomes Menezes', 'PEDRO EDUARDO SILVA ACIOLY', 'MARIA ALLANA SEVERO DE MELO', 'DULCIDARIO SABINO DA SILVA', 'Tatiane de Lima Silva', 'Aprigio de Lima Calado', 'Hamerson Carlos da Silva', 'LUAN HENRIQUE DE LIMA ALVES ', 'Daniel Álison de Sousa da Silva Barbosa', 'ED ALVES DE ARAUJO', 'MARIA ISABEL DA COSTA DE CARVALHO GODOY', 'Bruna Layane Machado dos Santos', 'Ana Talita da Silva Gualter', 'Tamires Almeida Agapto', 'Elizandra Ferreira de Brito Lima', 'EDEMILSON GOMES DE MENEZES', 'Maria Viviane Mariano Terto', 'MARIA HELENA ARAÚJO TIMÓTEO', 'Juceliana Belo Damasco', 'VIVIANE DA SILVA ALMEIDA', 'Ana Carolina Freire Silva', 'EDESEL ALVES DE SOUSA', 'DAIANE MATIAS DO NASCIMENTO', 'Kely Daiane de Sousa Soares', 'Carla Mirelle Figueredo Silva ', 'TAMIRYS DA SILVA PEREIRA', 'FERNANDO HENRIQUE FARIA SILVA', 'EDEZIO SANTANA BARBOSA', 'Ana Clara Rodrigues Alves', 'ALEXANDRA MIKAELE TEXEIRA COSTA', 'Roberto Daniel Lucena Nunes', 'Ivana Maria Leonardo Cardoso', 'Larissa Cristina da Silva', 'EDGARD JOSE VIEIRA ', 'Francisca Maria Moura da Cruz Sousa', 'Estefany Beatriz Sobreira de Carvalho', 'Lais Tenorio Cavalcante de Melo', 'THIAGO HENRIQUE DE SOUSA RIBEIRO', 'Saulo Lucas Ferreira Fortunato', 'Julianna Silva Sá Pereira Lima', 'MARIA VITORIA LIRA MEDEIROS', 'Pedro Antonio Maciel de Arruda', 'Ana Ívidy de Souza Silva', 'DANILO GUILHERME DE SOUZA MARCULINO', 'EDILSON BENTO DE ALMEIDA', 'ALEXINO CARDOZO DE ALMEIDA LIMA', 'Eduarda Ramos Leopoldo Fonsêca ', 'MARIA LUIZA GONÇALVES DE MOURA VITORINO', 'João Arlindo de Souza Costa', 'EDILSON DE SOUZA ', 'Gabriel Lucius Gonçalves Ferreira Torres', 'Wandson Talis Silva', 'Marcos Vinícius Sampaio Ramos', 'MÔNICA SUELEM GONSALO BARROS', 'Nadilson César Marques Jurubeba de Andrada', 'MAIARA CARLA NUNES BEZERRA ALVES', 'Caio Henrique Lima Vieira', 'Gustavo Cavalcante Maciel', 'DANIELLA BEZERRA CORDEIRO', 'MARIA DAS GRAÇAS SILVA BATISTA', 'EDILSON LOPES DA SILVA', 'ALANA BEATRIZ RODRIGUES DE OLIVEIRA', 'João Pedro de Souza Santos', 'DANIEL NOGUEIRA DOS SANTOS', 'KÉSYA RAQUEL NUNES DOS SANTOS', 'IGO EUGÊNIO SANTOS COSTA', 'EDILSON RODRIGUES PESSOA', 'Thales Henrique de Souza Teles', 'LUCAS PEREIRA SOUZA DA SILVA', 'Sidney Quaresma da Cruz', 'Thalia Ingrid Arruda Campos', 'FRANCISCA TALINE DA SILVA ', 'EDILTON JOSE DA SILVA', 'ADRIANO TEIXEIRA DA SILVA', 'Francisco Diego Freire Rodrigues Vieira', 'MATHEUS NUNES GONÇALVES DA SILVA', 'MICHERLANIA ROSALINA DA HORA LIMA', 'PAULA FERNANDA TORRES PEREIRA', 'EDIMERIO TELES DO NASCIMENTO', 'Djenyfer Raquel Teixeira dos Santos', 'Pedro Henrique da Silva Lira ', 'LÚCIO DIÊGO EPAMINONDAS RODRIGUES', 'THACYANA LEÃO BRASIL ALVES', 'JACKSON MIGUEL DE ANDRADE MEDEIROS', 'EDIMILSON LOPES DA SILVA', 'Leticia Danielly Tenório Silva', 'Damaris Scarleth Alves de Rezende', 'Jamilly Katharina do Nascimento', 'NATHALIA LETÍCIA SILVA SOUZA ', 'Émilly Suelen Queiroz Silva', 'THAÍS LEANDRO DE MEDEIROS', 'Thainá Simões Viana', 'JOSÉ WILCK DE SOUZA BARROS', 'Monick Daniela Ferreira Faustino', 'Marcos Antonio Galdino da Silva Júnior', 'EDINALDO ALVES DA SILVA', 'Nayara Jayne Cintra Gueiros de Gois', 'Yuri Cleiton Francelino Barreto', 'Maria Gleicielly Gomes da Silva', 'JONATAS PEREIRA DA SILVA ', 'Mariana Marla de Medeiros Alves', 'EDINALDO GOMES MENESES', 'Ellen Eduarda Ramalho Pereira da Silva ', 'SANDY TORRES LEANDRO DA SILVA', 'MAÍZA BEATRIZ DOS SANTOS SOUZA', 'Felipe Vinícius Pires Virginio Lopes', 'Letícia Valeska Rael Santana de Menezes', 'EDINALDO MANOEL DE REZENDE', 'Wildslayne Mykaella da Silva Amorim ', 'CRISTIANA NUNES DE MAGALHÃES', 'AMANDA CRISTINA MOURA NASCIMENTO', 'Mikaely Belo dos Santos', 'Yasmin Beserra da Silva', 'EDIR CAVALCANTE DE LIMA', 'Mayla Rodrigues de Andrade', 'Marcos Matheus Tenório Cavalcante Brito', 'YURI ALMEIDA SOARES ALVES', 'Acalabe Alves de Barros', 'TIAGO MORATO DOS SANTOS', 'Aquin Vinícius Lima Martins', 'DAYVISON PAULINO COSMO', 'ÍTALO JOSÉ DE FREITAS AMARAL', 'CHARLLES REKSON BARBOSA DE LIMA JUNIOR', 'EDISIO FIRMINO DOS SANTOS', 'Bruno Leal Menezes Feitosa ', 'João Paulo Barbosa Costa', 'JOSINEWTON MAGALHÃES PEREIRA DA SILVA ', 'ANDERSON JONATHAN XAVIER DA SILVA', 'IAGO RAPHAEL SIQUEIRA SANTOS BARBOSA', 'EDISON VIRGULINO DE MEDEIROS', 'FLÁVIA MARIA CHAVES DINIZ', 'JANDSON FURTADO NOGUEIRA', 'Elizeu Marcio de Souza', 'Gabriella Ramos de Melo', 'JEFERSON DE SOUSA CABRAL', 'ALEX REYDSON DO NASCIMENTO LOPES', 'JEFFTHER SALLES NUNES GONÇALVES', 'Antonio Pereira da Silva Júnior', 'Matheus Filipe Cordeiro de Lima', 'EDIVALDO ANTONIO DA SILVA', 'JOSÉ MATHEUS EMANUEL FERREIRA RIBEIRO', 'Francisca Eveline Alves Pinto', 'DOUGLAS DE LIMA GOMES SILVA', 'Luiz Antonio de Sá Santos Freire', 'DANILO DIEGO LIMA SANTOS', 'EDIVALDO DOS SANTOS SIQUEIRA', 'HIGOR JOSÉ MELO SOBREIRA ', 'INGRID AMANDA DOS SANTOS CARVALHO', 'Allan Filipe Mendes Angelim', 'José Luan Rodrigues de Lima', 'GUILHERME VITOR DA SILVA CARVALHO', 'EDIVALDO JOSÉ DOS SANTOS', 'MAURICIO MENDES MENEZES ', 'RAQUEL MAGALHÃES RAMOS', 'Illgner Freires e Silva', 'PATRÍCIA ÉVELYN MONTEIRO DOS SANTOS', 'Jéssica Gregorio Sousa', 'EDIVAN  ALVES DE LIMA', 'CHARLE DE LIMA FREIRE', 'IGOR ANTONIO LIRA GOMES', 'Joelma Gomes da Costa Oliveira', 'Rogério dos Santos Lima', 'Maria Lucicleide Barbosa dos Santos', 'Aléxia Fernanda Rodrigues Ferreira ', 'AMAURI ALLAN DE SOUSA SILVA', 'MICHELLE RAMALHO NASCIMENTO OLIVEIRA', 'Hélia Maria Corte Lima Gusmão', 'Mayara Gonçalves da Silva ', 'ANDERSON PEREIRA DE LIMA', 'AYRLLA JUCIELE HONÓRIO DANTAS', 'EDJALMA DE MELO BATISTA', 'Maria Eduarda da Silva Leite Santos', 'Diomício Ferreira Leandro Neto', 'Samuel José de Medeiros', 'MAGNO DUARTE NETO', 'José Carlos Leite Torres', 'EDMICIO LUIZ DA SILVA', 'HAMILTON MARIANO DA CRUZ FILHO', 'JOSICLÉIA TEIXEIRA DA SILVA', 'GABRIELA SILVA SOUZA', 'Lidiane dos Santos Silva', 'Vitória Mayane Amorim Roque', 'EDMILSON DO NASCIMENTO CAMPOS', 'Vitoriana Karem Freire Marinho de Almeida', 'GABRIELA OLIVEIRA DA SILVA', 'Dione Cléia da Silva Oliveira', 'Alan de Souza Batista', 'Emerson Vasco Barbosa', 'EDMILSON LARANJEIRA DA SILVA', 'Valenthina Fernanda Martins Santos', 'Jaiane Kelly da Silva Santos', 'FRANCIELY PEREIRA DOS SANTOS ', 'BRENDA SAIENNE DA SILVA BARROS', 'Luana Keit Damasceno Souza', 'EDMILSON MORATO DA SILVA', 'LUCAS VINICIUS DOS SANTOS ALVES DE LIMA ', 'RONALDO TEIXEIRA SANTOS ', 'HOSANA GOMES DE LIMA', 'LUIZ HENRIQUE SANTOS SIQUEIRA', 'EDNALDO  JOSÉ DA SILVA', 'Lívia Maria Sá Oliveira Barros', 'Pedro Paullo Batista Beserra', 'MARCIO ROMULO FERREIRA ROCHA', 'Dimítria Melissa Marques Rodrigues', 'Maria Andréia Santos Araújo', 'EDNALDO BRITO DE OLIVEIRA', 'Mônica Isabelly Cacimiro Xavier', 'Grêsse Bernardo de Vasconcelos Reis', 'Emilly Victória Corte Nogueira', 'MARIA EDUARDA DOS SANTOS SILVA', 'Natália Sousa Firmino de Oliveira', 'MARCIO CORDEIRO DA SILVA', 'ALEXA LAVÍNNIA ANDRADE DA SILVA', 'ANDERSON MANOEL SILVA REMIGIO', 'ANNYE SELLES MAGALHÃES NUNES', 'Amanda Diniz Santos', 'EDNALDO FERREIRA DA SILVA', 'Taís Silva Melo', 'Renata Barbosa do Nascimento', 'GEORGE CLEYTON BARROS DE AGUIAR', 'Daiane Cristina Viana do Nascimento', 'CÍCERO BEZERRA DE LIMA', 'EDNALDO GUILHERME DOS SANTOS', 'ELAINY CRISTINA CAMPOS BARBOSA DE LIMA', 'Elourram Feitosa Barbosa de Melo', 'JOÃO VICTOR DE QUEIROZ', 'Nyvea Maria de Souza Matias', 'NIEDJA DARCI DE SOUZA ARAUJO', 'EDNALDO IZIDORIO NETO', 'Luana dos Santos Viana', 'Josefa Nicole Arruda Gomes de Sá', 'Wildson César da Silva Leite', 'ÂNDERSON DE SOUZA LIMA', 'Sthefany Ellen de Araújo Nascimento', 'EDNALDO OSMAR DA SILVA', 'Thais de Oliveira', 'Anna Virgínia Nascimento da Costa', 'WILLIANY CAROLINY DA SILVA LIMA', 'IRANEIDE DOS SANTOS SILVA ', 'Débora Renata da Silva Santos', 'EDNALDO PEREIRA DA SILVA', 'JOÃO LUCAS ALVES DE SIQUEIRA COSTA', 'EUDES ALVES DE LIMA', 'JARLENE CRISTINA DE MELO WALTER ', 'João Victor do Nascimento Nunes', 'Alessa Kivia Lopes de Moura', 'EDNON CACHOEIRA DA SILVA', 'Sílvia Roberta da Silva Brandão Siqueira', 'Pedro Victor Tenório Lima', 'Luis Gustavo de Almeida Lustosa Cabral', 'MARCÍLIO LIMÔNICA MAGALHÃES DE OLIVEIRA', 'ADAUTO PATRICK CRUZ COSTA ', 'Matheus Rodrigues Lira', 'Samuel Tavares da Silva', 'AURICELIO CERQUEIRA DA SILVA', 'TATIANA PEREIRA DA SILVA SOUZA', 'MATHEUS RAMOS DE LIMA', 'EDSON AZEVEDO PEREIRA', 'ANDERSON RENER PEREIRA DA SILVA ', 'CAIO OLIVEIRA SIQUEIRA ', 'João Wellyton Silva Bezerra', 'José Leonardo Andrade Santos', 'ROGENES WUARLEN ANDRADA FERRAZ ', 'EDSON GALDINO DE FREITAS', 'Maria das Dores Ivana da Silva', 'THAILANE FIGUERÊDO SILVA', 'Aldair Teotônio Ramos', 'Josimária Rofino da Silva ', 'AYLON DE LIMA SOUZA', 'EDSON MARIANO DE BRITO', 'Mirelly de Magalhães  Lima', 'NÁTALIA BRUNA DA SILVA SANTOS', 'LUCAS VINÍCIUS DE BRITO LEITE', 'JOSÉ ALYSSON RODRIGUES DA SILVA', 'Pablo Manuel de Souza Santos', 'EDSON NUNES ROCHA', 'IARA RAQUEL PEREIRA SOBREIRA', 'BRENO EVERTON GOMES LIMA', 'Thaís Maria dos Santos Sá', 'IANA ALMEIDA DE CARVALHO', 'Denise Laís Alves Albuquerque', 'Thaynara Barbosa Santos', 'WESLEY PEREIRA GOMES', 'Jucilene Maria da Silva Melo', 'RAÊNNY ARISTÓFANES SILVA SANTOS', 'JOELMA CíCERA MATIAS', 'EDSON RODRIGUES ALVAREZ', 'MARIA TAÍS NOGUEIRA CAVALCANTE', 'Arthur Renan Brandão Rafael', 'DANILO BARROS DO NASCIMENTO', 'Jéfferson Mateus Ferreira Lopes', 'ANA MARIA MARINHO VIEIRA', 'EDSON SOUZA BEZERRA', 'EDYNAR CHARLES DOS SANTOS XAVIER', 'Isaura Ramos da Silva', 'Anna Karla Nunes Campos da Fonsêca Queiroz', 'JOSÉ DE ANCHIETA SILVA NUNES FILHO', 'Maria Heloyse Morais Silva', 'EDUARDO CÉSAR ALVES TERTO', 'RICARDO TORRES DE BARROS', 'NAYDIANE GUIMARÃES FERRAZ', 'Alexandre Pereira de Carvalho', 'FAGNER DOS SANTOS RODRIGUES', 'CLÉCIO NUNES PEREIRA', 'EDUARDO JORGE LEITE DA SILVA', 'ALEX CARLOS LOPES SILVA', 'Allexya Ghabryelli Barbosa Carvalho', 'Juliana de Pádua Leite ', 'Luiz Henrique Lopes Gomes Clemente', 'Flávia Cristina Leles Bastos Lopes', 'EDVAL MORATO DA SILVA', 'TAINÁ FERNANDA DE SOUZA MOURA', 'KALIANE INGRID FONSECA PRAXEDES', 'Aline Gomes Patriota de Oliveira', 'Ana Flávia Soares de Lima Alves', 'Maria Eloísa Fonseca da Silva', 'EDVALDO BASTOS FREIRE', 'Bruno Renan Nunes da Silva', 'Jércia Maria Gomes de Sousa', 'Élem Joice de Melo Barros', 'Ana Clara Gama Beserra ', 'Ana Sibele Pereira Santos', 'Larissa Thaís dos Santos Melo ', 'MARKIZHIA YZIS MAGALHÃES DE SIQUEIRA', 'Gicélia Antas Madeiro', 'PATRÍCIA BARBOSA CORDEIRO', 'WENDEL DINIZ LEITE', 'EDVALDO DE MAGALHÃES SILVA', 'JHORÁNATTA SHELY RODRIGUES DE CARVALHO', 'JOSÉ CARLOS ALBERTO VIEIRA DOS SANTOS', 'ANDREIA NAYANE DA SILVA ARAÚJO GONÇALVES', 'ACSA PEREIRA ALVES DOS SANTOS', 'Robert Renner Souza Nascimento', 'EDVALDO FRANCISCO DA SILVA', 'Ana Beatriz Caldeira da Silva', 'ANÁLIA SALVADOR PEREIRA', 'THALITA GISELY BRANDÃO NOGUEIRA', 'THIAGO ALEXANDRE DA FONSECA ALCANFOR', 'MARIA VITÓRIA PEREIRA DA SILVA', 'EDVALDO HENRIQUE DE MORAES', 'Vitória Regina dos Santos Lima', 'Regina Menezes da Costa Silva', 'ELLEM LAYANE DA SILVA MOURA', 'José Roberto Bezerra Barboza', 'TADEU ARISTÓTELLYS CORDEIRO FERREIRA', 'EDVALDO LOPES DE SIQUEIRA', 'GRAZIELLY CAVALCANTE NOGUEIRA FARIAS', 'DIOGENES GABRIEL FIGUERÊDO SILVA', 'ANDREZA DE ASSIS NOGUEIRA', 'Maria Elena de Magalhães Gaia', 'José Milton Ferreira dos Santos Júnior', 'EDVALDO PEREIRA DE LIMA', 'PEDRO HENRIQUE DE LISBOA ANDRADE LIMA', 'HÊMERSON KRYSTANY SILVA PEREIRA DE SOUZA', 'Laila Grasyele da Silva Alves', 'JOÃO VÍCTOR SOUZA SANTOS', 'Auany Karolayny Rodrigues de Lima Bernardo', 'EDVAM CÂNDIDO DA SILVA', 'Ivyd Karynne Lacerda de Pádua', 'JOSÉ ALEXANDRE VIEIRA DE LIMA', 'Aléxia Gertrudes Meiremberg da Cruz Carvalho', 'GABRIEL ANSELMO DE JESUS', 'LUANNA CARLA BARBOSA DE OLIVEIRA RODRIGUES', 'EDVAN ALVES DE LIMA', 'Shirlley Laís Barbosa Cabral', 'Dvânia Alves Bezerra', 'Larissa Gabrielly Melo Duarte', 'BIANCA MARIANE DA SILVA NOGUEIRA', 'KAIANNY DA COSTA FELIX', 'EDVAN NOGUEIRA ALBUQUERQUE SILVA', 'Paulo Enrique Queiroz de Oliveira', 'MARIA EDUARDA RODRIGUES BATISTA ', 'Denize Ellen Mariano Davi de Carvalho', 'GABRIEL LIMA DE CAMPOS BARROS', 'Diego Felipe Soares da Silva', 'EDVANILDO XAVIER DE ANDRADE', 'BIANCA PINTO MARTINS LEITE', 'LAURA VANESSA DE SOUSA ANDRADE', 'FABRÍCIO MENEZES DE SOUSA MELO', 'Jeikyson Cordeiro de Melo', 'Renan Walisson de Andrade', 'EDVANIO ROBERTO DA SILVA', 'Jamile Leal Rodrigues Soares', 'João Lucas Marques Felix', 'Maria Marcela de Brito Ferreira', 'ALEXSANDRO QUIXABEIRA DA SILVA FILHO', 'LUCAS DUARTE LIMA DE SOUZA', 'EDVONALDO AZEVEDO BARBOSA', 'MARIA ELOYSA FERREIRA NERI DE SIQUEIRA', 'MARIA DE LOURDES AMANDA MATIAS DA SILVA', 'THAYNÁ MIRELLES DA SILVA LIRA', 'Maria Eduarda Martins de Araújo', 'ADJAILTON ALVES DA SILVA', 'EDVONALDO MANOEL DE LIMA', 'MARCOS VINÍCIUS TERTO DOS SANTOS ', 'Bianca Leal Rodrigues Gomes Vilarim', 'ABEL ARMISTON FERNANDES MELO', 'Évelyn do Nascimento Gomes de Sousa', 'Vitor Guilherme Cordeiro Rodrigues', 'EGIDIO ALVES FEITOSA', 'IONALDO MATHEUS FRANCISCO DE ANDRADE', 'Bruna Racquel Lima de Siqueira', 'ROBERT ANDERSON SOUZA DA SILVA', 'MARIA IZABEL DE ARAÚJO TAVARES', 'ARIEL SILVA GOMES', 'ELÁDIO FERREIRA DOS SANTOS', 'CHARLINGTON ALVES GOMES', 'Cleomara Mendes de Medeiros', 'Maria Jéssica Nogueira Alves', 'JOÃO VICTOR ALVES DE LIMA', 'Ariane de Melo Silva', 'ELENO GOMES DE ARAUJO', 'Ana Karoline Lopes de Alencar', 'André Hélder de Andrade Cordeiro', 'WEDJA DA SILVA VIEIRA', 'MARIA EULINA DE SOUSA', 'Júlia Fernanda de Sousa Magalhães', 'ELIAS ALVES LIMEIRA', 'Estefânea Lopes Leão Barros', 'Yuane Letícia Cavalcanti Freire', 'Marcos Antonio da Silva', 'Jeniffer Isamara Peixoto Batista de Lima', 'NAIDIANE DA SILVA SANTOS', 'ELIAS BARBOSA DA SILVA', 'Lucivânio de Souza Oliveira', 'Dayse Isabele Ferreira de Almeida Ramos', 'Edeilson Júnior Amaral Cardoso', 'Maria Vitória Alves dos Santos', 'YLANA FRANCISCA DE SOUZA NASCIMENTO', 'ELIAS DE MELO LIMA', 'VICTORIA DULCE DE SIQUEIRA SARAIVA', 'Rodrigo Alves Lucena', 'CAROLINY LALLESCA BARROS CRUZ', 'MOANY PASTORA NUNES BEZERRA', 'Maria Thaisla Silva Costa', 'ELIAS JOSÉ DO NASCIMENTO', 'PAULO EDSON ZACARIAS SILVA FILHO', 'FERNANDA KELY SANTOS NEVES', 'JOSÉ LUÍS RIBEIRO DOS SANTOS', 'Larissa Mirelly Lacerda Pereira', 'Fernanda Freire Calaça de Sá', 'ELIAS LEITE DE SIQUEIRA', 'BRUNA GEYZIANNA DE MOURA MELO', 'GABRIELLA MARQUES BARBOSA', 'JANIÉVERTON MOURATO DE LIMA', 'LAYANE DE ALMEIDA LIMA', 'Wanyelle Rejane dos Santos', 'ELIAS MENDES DOS SANTOS', 'Willyane Barbosa Raymundo', 'WIVIANNY DA SILVA FLORIANO SERAFIM', 'VINICIUS SANTOS GONÇALVES TORRES', 'THAMYRES FERREIRA BARBOSA', 'Alysson Natanael Pereira Mourato', 'ELIJALDE ALVES DE SOUZA', 'João Fernando Sampaio Novaes Júnior', 'RUBENS PEDRO PEREIRA DE SOUZA ', 'João Pedro Clementino de Oliveira', 'HENRIQUE MANOEL DE SÁ SOUZA ', 'Gabriella Adelaide de Oliveira Silva', 'ELIOSMAR ALVES DA SILVA', 'RUAN MATHEUS DA SILVA OLIVEIRA COIMBRA', 'LARISSA DE MORAIS SILVA', 'Alana Rosa de Sá Braga', 'Jonailson Ferreira de Carvalho', 'Renata Gabrielly Santana Lira Gomes Galdino', 'ELIVALDO FERNANDES LIMA', 'IGOR SEVERO BARBOSA ', 'Brenda Ewellin de Paiva Leite Barboza', 'Igor Hítalo Pereira Gomes', 'KALYNKA KEYTH DE GOMES SILVA ', 'Rogéria Kerliane Carvalho Marques', 'Josyélida Matias Pereira Lucena', 'Cristiana Ferreira da Silva Walter ', 'RAQUEL MAIARA DOS SANTOS SILVA', 'Ana Raquel Carlos Epaminondas da Silva', 'Audiane Ricarte Linhares de Lucena', 'ELOI DE SENA BRASIL', 'TAÍS NAYANE DA SILVA', 'IANDRA JEMIMA SEIXAS NOGUEIRA', 'Gustavo Clístines Matias Santana', 'Mirelly Alves Vasconcelos', 'Marilya Dayfne Pereira Xandú Campos', 'ELRY LUIZ DA SILVA', 'WESLEY AMARAL BARBOSA', 'ANDERSON DA SILVA ANDRADE', 'ELAINE LIMA LEITE', 'EVERTON MANOEL ANGELO GOMES', 'ADJALMY VINICIO DE MELO RAMALHO', 'ELTON GONÇALVES DA SILVA', 'Victor Hugo Torres Diniz', 'João Antônio Menezes de Brito Teotônio', 'JOÃO VÍTOR FERRAZ SOUZA', 'JOSÉ DE MOURA OLIVEIRA', 'JOSÉ ALEX XAVIER DA SILVA', 'EMANUEL DOMINGOS SAVIO DUARTE', 'MARIA EDUARDA DE CARVALHO REFERINO', 'ANTONIO HENRIQUE BISPO SANTOS', 'ERICLES RIFFONI COSTA TAVARES', 'Daniel Vitor Carvalho de Oliveira', 'RENAN EMANUEL BARBOSA DE OLIVEIRA', 'EMÍDIO PEREIRA FILHO', 'WILLIAN LOPES DE MOURA', 'KAUÊ DA SILVA VASCONCELOS', 'Raquel Lima Ferreira', 'Gustavo José Siqueira Morato', 'JOSÉ VINICIUS SOBREIRA SALES', 'EMILTON ANDRÉ DA COSTA', 'Marcus Luiz Alves dos Santos Costa', 'VINÍCIUS DE MORAIS DANTAS', 'JEFERSON MACÓLIN DE MATOS SILVA ', 'NATHAN NUNES NOGUEIRA DE CARVALHO', 'EDUARDO MARLEY COSTA DOS SANTOS', 'DIOGO DE SÁ SAMPAIO', 'EDGLE JUSTINO DE SOUSA', 'JOÃO PEDRO DE LIMA LACERDA', 'JOÃO VICTOR DOS SANTOS LIMA NUNES NOGUEIRA', 'PEDRO VÍCTOR DE CARVALHO TIMOTEO', 'MÁRIO JAMESSON CORDEIRO FREITAS', 'BIANCA EDUARDA SOARES DA SILVA RODRIGUES', 'Marília Eduarda Alcântara Oliveira', 'LUCAS THÁRSIS MENEZES DE MACÊDO ', 'ENELSON PEREIRA', 'GABRIEL PEREIRA NUNES', 'TITO GABRIEL TEIXEIRA CAJUEIRO DE ALBUQUERQUE', 'RICARDO CLEOMATSON BARBOSA DA SILVA', 'Danilo Cordeiro Nunes', 'IARA MARIA DOS SANTOS', 'ENILSON CICERO DE MELO', 'MYLENA LAYSE LEITE DE LIMA', 'Wyllian Kailon da Silva Oliveira', 'Manoel José dos Santos', 'EDERLÂNDIO FLÁVIO MENÊZES DA SILVA', 'GABRIEL MESQUITA GOMES', 'ENIVALDO ANIZIO DE FRANÇA', 'JOÃO VÍCTOR ARAUJO DE ACIOLI', 'FERNANDA LORENA LUCENA GOMES E SILVA', 'Cecília Jaciela Menezes da Silva', 'MYLENA VASCONCELOS DE BRITO CAITANO', 'Victória Valesca Pereira Epaminondas', 'Karen Nayara Xavier Ferreira', 'Laryssa Nayam Carvalho de Araújo', 'ABIMAEL BEZERRA DE LIRA', 'Thainá dos Santos Virginio'    
        ]
        //resp.data;
        // const personService = new PersonService();
        // let TodasPessoasMigradas = await personService.BuscaTodasPessoasMigradas();
        // let TodasPessoasMigradas = await personService.BuscaTodasPessoasMigradas();

        // TodasPessoasDoGennera = TodasPessoasDoGennera.filter(h => h.name == 'JÚLIA MARIA SANTOS OLIVEIRA');
        // TodasPessoasMigradas = TodasPessoasMigradas.filter(h => h.name == 'JÚLIA MARIA SANTOS OLIVEIRA');

        // TodasPessoasDoGennera.forEach(p =>{
        //     p['addAlista'] = false;
        // })

        let PessoasVerificarHistorico = TodasPessoasDoGennera;
        // TodasPessoasMigradas.forEach(p =>{
        //     let PessoaGenneraEncontrada = TodasPessoasDoGennera.find(person => (person.name == p.name || person.socialName == p.name) && !person.addAlista);
        //     if(PessoaGenneraEncontrada) {
        //         PessoaGenneraEncontrada['idPessoaBancoMigracao'] = p.id_person;
        //         PessoaGenneraEncontrada['idStudentBancoMigracao'] = p.id_student;
        //         PessoaGenneraEncontrada['addAlista'] = true;
        //         PessoasVerificarHistorico.push(PessoaGenneraEncontrada);
        //     }
        // });


        //PessoasVerificarHistorico = PessoasVerificarHistorico.filter(h => h.idPerson == 2529930);
        // const enrollmentRecordService = new EnrollmentRecordService();
        let count = 1;
        let textError = '';
        for(let person of PessoasVerificarHistorico){
            try {
                console.log(`Processando ${count} de ${PessoasVerificarHistorico.length} | Nome: ${person}`);
                log(`Processando ${count} de ${PessoasVerificarHistorico.length} | Nome: ${person}`);
                count++;
                // if(count < 4565) continue;
                //log(person);
                // let historicosModel = []
                // let buscaHistorico = true;
                // let buscaHistoricoTentativas = 0;
                // while(buscaHistorico){
                //     try {
                //         historicosModel = await enrollmentRecordService.BuscarPeloIdStudent(person.idStudentBancoMigracao);
                //         buscaHistorico = false;
                //     } catch (err) {
                //         buscaHistoricoTentativas++;
                //         if(err.message == 'read ECONNRESET'){
                //             console.log(`Nova Tentativa ${buscaHistoricoTentativas}.`);
                //         }
                //         if(buscaHistoricoTentativas >= 5){
                //             buscaHistorico = false;
                //             throw err;
                //         }
                //     }
                // }
                // if(!historicosModel.length) continue;
                
                // INICIO Somente em Registros do Curso de ADM
                // let registroEncontrado = historicosModel.filter(r => r.course == 'ODONTOLOGIA')
                // if(registroEncontrado.length){
                //     historicosModel = [...registroEncontrado];
                // } else{
                //     continue;
                // }
                // FIM Somente em Registros do Curso de ADM
    
                let respHist = [];

                // let buscaHistoricoGenn = true;
                // let buscaHistoricoGennTentativas = 0;
                // while(buscaHistoricoGenn){
                //     try {
                //         respHist = await httpGenneraUsuario.get(`enrollmentRecords?idPerson=${person.idPerson}`);
                //         buscaHistoricoGenn = false;
                //     } catch (err) {
                //         buscaHistoricoGennTentativas++;
                //         if(err.message == 'read ECONNRESET'){
                //             console.log(`Nova Tentativa ${buscaHistoricoGennTentativas}.`);
                //         }
                //         if(buscaHistoricoGennTentativas >= 5){
                //             buscaHistoricoGenn = false;
                //             throw err;
                //         }
                //     }
                // }


                let historicosNoGennera = respHist.data || [];
                if(!historicosNoGennera.length) {
                    let buscaHistoricoGennbyName = true;
                    let buscaHistoricoGennbyNameTentativas = 0;
                    while(buscaHistoricoGennbyName){
                        try {
                            historicosNoGennera = await this.VerificaDemaisCadastroDePessoas(httpGenneraUsuario, person);
                            buscaHistoricoGennbyName = false;
                        } catch (err) {
                            buscaHistoricoGennbyNameTentativas++;
                            if(err.message == 'read ECONNRESET'){
                                console.log(`Nova Tentativa ${buscaHistoricoGennbyNameTentativas}.`);
                            }
                            if(buscaHistoricoGennbyNameTentativas >= 5){
                                buscaHistoricoGennbyName = false;
                                throw err;
                            }
                        }
                    }
                }
                // historicosNoGennera = historicosNoGennera.filter(h => h.institutionName == 'FIS');
                historicosNoGennera = historicosNoGennera.filter(h => !h.idEnrollment);
    
                
                for(let historico of historicosNoGennera){
                    try {
                        // let numeroModulo = this.#PegarSomenteNumeros(historico.moduleName);
                        // let historicoEncontrado = historicosModel.find(h => h.module.includes(numeroModulo));
                        // let historicoEncontrado = historicosModel.find(h => h.module == historico.moduleName);
                        // if(!historicoEncontrado ) continue;

                        if(!historico.idEnrollment){
                            let respDisciplinasHist = [];

                            let buscaHistoricoGennDispciplinas = true;
                            let buscaHistoricoGennDispciplinasTentativas = 0;
                            while(buscaHistoricoGennDispciplinas){
                                try {
                                    respDisciplinasHist = await httpGenneraUsuario.get(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects`);
                                    buscaHistoricoGennDispciplinas = false;
                                } catch (err) {
                                    buscaHistoricoGennDispciplinasTentativas++;
                                    if(err.message == 'read ECONNRESET'){
                                        console.log(`Nova Tentativa ${buscaHistoricoGennDispciplinasTentativas}.`);
                                    }
                                    if(buscaHistoricoGennDispciplinasTentativas >= 5){
                                        buscaHistoricoGennDispciplinas = false;
                                        throw err;
                                    }
                                }
                            }

                            let disciplinasNoHistorico = respDisciplinasHist.data || [];
                            let somatorioCargaHoraria = 0;
                            let isUpdateRegistro = false;
                            for(let disciplinaHist of disciplinasNoHistorico){
                                somatorioCargaHoraria += disciplinaHist.workload;
                                try {
                                    let isUpdate = false;
                                    //também vai verificar se a disciplina é status cursando pra marcar como cancelada
                                    if(disciplinaHist.status == 'IN PROGRESS'){
                                        disciplinaHist.status = 'CANCELLED';
                                        disciplinaHist.idCancellationReason = 2738;
                                        isUpdate = true;
                                    }
                                    // disciplinaHist.attendance
                                    if(!disciplinaHist.attendance){
                                        disciplinaHist.attendance = 100;
                                        isUpdate = true;
                                    }
                                    if(isUpdate){
                                        let AtualizaHistoricoGennDispciplinas = true;
                                        let AtualizaHistoricoGennDispciplinasTentativas = 0;
                                        while(AtualizaHistoricoGennDispciplinas){
                                            try {
                                                await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects/${disciplinaHist.idEnrollmentSubjectRecord}`, disciplinaHist);
                                                AtualizaHistoricoGennDispciplinas = false;
                                            } catch (err) {
                                                AtualizaHistoricoGennDispciplinasTentativas++;
                                                if(err.message == 'read ECONNRESET'){
                                                    console.log(`Nova Tentativa ${AtualizaHistoricoGennDispciplinasTentativas}.`);
                                                }
                                                if(AtualizaHistoricoGennDispciplinasTentativas >= 5){
                                                    AtualizaHistoricoGennDispciplinas = false;
                                                    throw err;
                                                }
                                            }
                                        }
                                    }
                                } catch (err) {
                                    textError += `Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`;
                                    console.log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`);
                                    log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`);
                                }
                            }
                            if(historico.workload != somatorioCargaHoraria){
                                historico.workload = somatorioCargaHoraria;
                                isUpdateRegistro = true;
                            }
                            if(historico.status == 'IN PROGRESS'){
                                historico.status = 'APPROVED';
                                isUpdateRegistro = true;
                            }
                            if(isUpdateRegistro){
                                delete historico.subjects;
                                let AtualizaHistoricoGenn = true;
                                let AtualizaHistoricoGennTentativas = 0;
                                while(AtualizaHistoricoGenn){
                                    try {
                                        await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}`, historico);
                                        AtualizaHistoricoGenn = false;
                                    } catch (err) {
                                        AtualizaHistoricoGennTentativas++;
                                        if(err.message == 'read ECONNRESET'){
                                            console.log(`Nova Tentativa ${AtualizaHistoricoGennTentativas}.`);
                                        }
                                        if(AtualizaHistoricoGennTentativas >= 5){
                                            AtualizaHistoricoGenn = false;
                                            throw err;
                                        }
                                    }
                                }
                            }
                            // historico.metadata.admission = historicoEncontrado.admission;
                        }
                    } catch (err) {
                        textError += `Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`;
                        console.log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`);
                        log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`);
                    }
                }
            } catch (err) {
                textError += `\n\n ####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.\n\n`;
                console.log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
                log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
            }
            
        }
        console.log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)
        log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)

    }

    async RPA_HotFixHistoricoDisciplinaDispensa(){
        const tokenAPI = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywiaWRJc3N1ZXJVc2VyIjoxMjgxOTk1NCwibW9kZSI6InByb2QiLCJpYXQiOjE3MDk0ODE3NzEsImlzcyI6Imh0dHBzOi8vYXBwcy5nZW5uZXJhLmNvbS5iciIsInN1YiI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciJ9.mt83H7H03gGiEv9MvV6uelzSBxOwfDdpCmOJL6491aReJmff6_yFEydgmzDqYgnKsyTdz6Iph6Fw-s6EtcsRONuVDLlGDD6Wc7RS4vBM9KPH1B6FRvBb867cS7GQo1Q5saiB1rbc7GweC8cQBwPzg6G_RjUZiQ94SXJWa0-8UR8gi5NLP_Wu6jsNjDM8AV94qpgq9CkKMbpJeKggh4UdHwfl8c75QRYtZMzNoZZu6Zan6H1Srpi4nOSMF1yGaMt4N5qbJCISSxc97iHQ1Nww1x8Rtrx3EE0VGhJ1T_o-tUYvXFZRAgVo8Ir3OTueBDG04ScLKNFPTwTI8i3hlPvXw2wEypIh3PYWIgD_jVCN5459KqLE1rGfLMdlQ2TaSgrQn3thN5WpFEaREhRU1cC0auFPojAPAb_qWtufx7XNNI0SVq5qatMsSJgWoBVIGxqJcSER8BYcHCNYlxtIGIYlkqKOBWUVTQufQqE0O3YzBi9P4Qafis8Brg-KkqXulphmZL-Md0J-7tISVe4OsILc7qnC6Nd82_tOK8rBU_2UlI0JL1M3nae3iRYSN4PR5MACPkgSUIvtzPQ_PYsIY3YXmqnT1z6dXRhSY4QnlpaeBzzScLOokMTaXNVDW3oG1ziuHkvCy4pcXdMOu_GQR0mS68j5fXXdWr70B31UuPnsYRA`;
        const tokenUser = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywibW9kZSI6InByb2QiLCJpYXQiOjE3MTY3MjMwMTksImV4cCI6MTcxNzE1NTAxOSwiaXNzIjoiaHR0cHM6Ly9hcHBzLmdlbm5lcmEuY29tLmJyIiwic3ViIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIn0.L3vBohl3Qh5IbEFBFDaT3zFeLdvC9F-1CUAb5mfB4kvnjYEWIqauu366z8U72e9Jl25Lz2L4oc0pG-c-KoSZWjjwA4V7Oibsfmi77hX7OtZArOJdIgnW2_mpvZAeN2dAaw-FxPqH760U28_iGKD6Re2DmJKasWf9hN9J9U1S4zsQYhLMwabHXOQ9NRgzfVQdKhgflR50jDePKwotcY0BW9OkbdrJ6aW9hwJMbupzHe-bzs1YFKeGy91TbWFka9IuQzY-Z70N4GlmL7lRasFncElf3oicNHOYylM05sSOVAYjg_0sYBIM5wD1HfWN6YZRrL5Vilh90j2D_M7qz2n_fqrkzUywb8Fms5wuaV5i43vBMovaVDiLkvyfB7z53y3wWGYXXVlylf4UC4Fxfzysfn9vaFRLeomo-6epQ_M4d4n_gs3BTeXK1Vii1_lln0CpMWn7BuFnIN_9arBUkqqdG8Z_EYNyqKsZ_jVfM7udkQAz7ynukeIvCNs-3QvzV7Jc55YgDoABF0guuYb7-YWWMxaCCaL7p4nXrI3IGU1a_4agRgW4hQ-LWFW-YhzDxgaoOvOlIdmbG49h9YmA4hGjQyjjl7TISFatG_AJFlpT3UW6vsZiQmx3ebhkY_19j4O5eF4ZXyACgUnEEYYs8lfPdhU3jKgEVihPH_60x664WXo`;

        const httpGenneraAPI = axios.create({
            baseURL: 'https://api2.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenAPI
            }
        });

        const httpGenneraUsuario = axios.create({
            baseURL: 'https://enrollment.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenUser
            }
        });

        // let respCursos = await httpGenneraAPI.get('/courses');
        // let CursosGennera = respCursos.data || [];
        // // CursosGennera = CursosGennera.filter(c => c.name == 'ODONTOLOGIA');
        // let i = 0;
        // for(let curso of CursosGennera){
        //     console.log(`Processando Curso ${i} de ${CursosGennera.length}`);
        //     i++;
        //     curso['curriculums'] = [];
        //     let respCurriculo = [];
        //     let curriculo = true;
        //     let curriculoCount = 0;
        //     while(curriculo){
        //         try {
        //             respCurriculo = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums`);
        //             curriculo = false;
        //             curso.curriculums = respCurriculo.data || [];
        //             let x =1;
        //             for(let curriculo of curso.curriculums){
        //                 console.log(`Processando Curso ${i}. Currículo ${x} de ${curso.curriculums.length}`);
        //                 x++;
        //                 curriculo['modules'] = [];
        //                 curriculo['subjects'] = [];

        //                 let modulos = true;
        //                 let modulosCount = 0;
        //                 while(modulos){
        //                     try {
        //                         let respModules = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums/${curriculo.idCurriculum}/modules`);
        //                         curriculo.modules = respModules.data || [];
        //                         modulos = false;
        //                         let y=1;
        //                         for(let module of curriculo.modules){
        //                             console.log(`Processando Curso ${i}. Currículo ${x}. Múdulo ${y} de ${curriculo.modules.length}`);
        //                             y++;
        //                             // module['subjects'] = [];
        //                             let disciplinas = true;
        //                             let disciplinasCount = 0;
        //                             while(disciplinas){
        //                                 try {
        //                                     let respSubjects = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums/${curriculo.idCurriculum}/modules/${module.idModule}/subjects`);
        //                                     let arr = respSubjects.data || [];
        //                                     curriculo.subjects = curriculo.subjects.concat(arr);
        //                                     disciplinas = false
        //                                 } catch (err) {
        //                                     disciplinasCount++;
        //                                     if(err.message == 'read ECONNRESET'){
        //                                         console.log(`Nova Tentativa ${disciplinasCount}.`);
        //                                     }
        //                                     if(disciplinasCount >= 5){
        //                                         disciplinas = false;
        //                                         throw err;
        //                                     }
        //                                 }
        //                             }

        //                         }
        //                     } catch (err) {
        //                         modulosCount++;
        //                         if(err.message == 'read ECONNRESET'){
        //                             console.log(`Nova Tentativa ${modulosCount}.`);
        //                         }
        //                         if(modulosCount >= 5){
        //                             modulos = false;
        //                             throw err;
        //                         }
        //                     }
        //                 }
        //             }
        //         } catch (error) {
        //             curriculoCount++;
        //             if(error.message == 'read ECONNRESET'){
        //                 console.log(`Nova Tentativa ${curriculoCount}.`);
        //             }
        //             if(curriculoCount >= 5){
        //                 curriculo = false;
        //                 throw error;
        //             }
        //         }
        //     }
        // }

        let resp = [];
        let pessoas = true;
        let pessoaTentativas = 0;
        while(pessoas){
            try {
                resp = await httpGenneraAPI.get('/persons');
                pessoas = false
            } catch (err) {
                pessoaTentativas++;
                if(err.message == 'read ECONNRESET'){
                    console.log(`Nova Tentativa ${pessoaTentativas}.`);
                }
                if(pessoaTentativas >= 5){
                    pessoas = false;
                    throw err;
                }
            }
        }

        let TodasPessoasDoGennera = resp.data;
        const personService = new PersonService();
        // let TodasPessoasMigradas = await personService.BuscaTodasPessoasMigradas();
        let TodasPessoasMigradas = await personService.BuscarTodasPessoasMigradasPorIdPersonQuery();

        // TodasPessoasDoGennera = TodasPessoasDoGennera.filter(h => h.name == 'JÚLIA MARIA SANTOS OLIVEIRA');
        // TodasPessoasMigradas = TodasPessoasMigradas.filter(h => h.name == 'JÚLIA MARIA SANTOS OLIVEIRA');

        let PessoasVerificarHistorico = [];
        TodasPessoasMigradas.forEach(p =>{
            let PessoaGenneraEncontrada = TodasPessoasDoGennera.find(person => person.name == p.name || person.socialName == p.name);
            if(PessoaGenneraEncontrada) {
                PessoaGenneraEncontrada['idPessoaBancoMigracao'] = p.id_person;
                PessoaGenneraEncontrada['idStudentBancoMigracao'] = p.id_student;
                
                PessoasVerificarHistorico.push(PessoaGenneraEncontrada);
            }
        });


        //PessoasVerificarHistorico = PessoasVerificarHistorico.filter(h => h.idPerson == 2529930);
        const enrollmentRecordService = new EnrollmentRecordService();
        let count = 1;
        let textError = '';
        for(let person of PessoasVerificarHistorico){
            try {
                console.log(`Processando ${count} de ${PessoasVerificarHistorico.length} DISPENSAS | Nome: ${person.name}`);
                log(`Processando ${count} de ${PessoasVerificarHistorico.length} DISPENSAS | Nome: ${person.name}`);
                count++;
                // if(count < 4565) continue;
                //log(person);
                let historicosModel = []
                let buscaHistorico = true;
                let buscaHistoricoTentativas = 0;
                while(buscaHistorico){
                    try {
                        historicosModel = await enrollmentRecordService.BuscarPeloIdStudent(person.idStudentBancoMigracao);
                        buscaHistorico = false;
                    } catch (err) {
                        buscaHistoricoTentativas++;
                        if(err.message == 'read ECONNRESET'){
                            console.log(`Nova Tentativa ${buscaHistoricoTentativas}.`);
                        }
                        if(buscaHistoricoTentativas >= 5){
                            buscaHistorico = false;
                            throw err;
                        }
                    }
                }
                if(!historicosModel.length) continue;
                
                // INICIO Somente em Registros do Curso de ADM
                // let registroEncontrado = historicosModel.filter(r => r.course == 'ODONTOLOGIA')
                // if(registroEncontrado.length){
                //     historicosModel = [...registroEncontrado];
                // } else{
                //     continue;
                // }
                // FIM Somente em Registros do Curso de ADM
    
                let respHist = [];

                let buscaHistoricoGenn = true;
                let buscaHistoricoGennTentativas = 0;
                while(buscaHistoricoGenn){
                    try {
                        respHist = await httpGenneraUsuario.get(`enrollmentRecords?idPerson=${person.idPerson}`);
                        buscaHistoricoGenn = false;
                    } catch (err) {
                        buscaHistoricoGennTentativas++;
                        if(err.message == 'read ECONNRESET'){
                            console.log(`Nova Tentativa ${buscaHistoricoGennTentativas}.`);
                        }
                        if(buscaHistoricoGennTentativas >= 5){
                            buscaHistoricoGenn = false;
                            throw err;
                        }
                    }
                }


                let historicosNoGennera = respHist.data || [];
                if(!historicosNoGennera.length) {
                    let buscaHistoricoGennbyName = true;
                    let buscaHistoricoGennbyNameTentativas = 0;
                    while(buscaHistoricoGennbyName){
                        try {
                            historicosNoGennera = await this.VerificaDemaisCadastroDePessoas(httpGenneraUsuario, person.name);
                            buscaHistoricoGennbyName = false;
                        } catch (err) {
                            buscaHistoricoGennbyNameTentativas++;
                            if(err.message == 'read ECONNRESET'){
                                console.log(`Nova Tentativa ${buscaHistoricoGennbyNameTentativas}.`);
                            }
                            if(buscaHistoricoGennbyNameTentativas >= 5){
                                buscaHistoricoGennbyName = false;
                                throw err;
                            }
                        }
                    }
                }
                // historicosNoGennera = historicosNoGennera.filter(h => h.institutionName == 'FIS');
                historicosNoGennera = historicosNoGennera.filter(h => !h.idEnrollment);
    
                
                for(let historico of historicosNoGennera){
                    try {
                        //Aqui pode ser um possível ponto de falha, estudar colocar expressão regular pra pegar somente números e testar com includes dentro do find
                        let numeroModulo = this.#PegarSomenteNumeros(historico.moduleName);
                        let historicoEncontrado = historicosModel.find(h => h.module.includes(numeroModulo));
                        if(!historicoEncontrado ) continue;
                        let idEnrollmentRecords = [];
                        historicosModel.forEach(e =>{
                            idEnrollmentRecords.push(e.id_enrollment_record);
                        })
                        const enrollmentRecordSubjectService = new EnrollmentRecordSubjectService();
                        let disciplinasHistoricoModel = await enrollmentRecordSubjectService.BuscarPeloIdsEnrollmentRecord(idEnrollmentRecords);
                        disciplinasHistoricoModel = disciplinasHistoricoModel.filter(s=> s.dismissed);

                        if(!historico.idEnrollment){
                            let respDisciplinasHist = [];

                            let buscaHistoricoGennDispciplinas = true;
                            let buscaHistoricoGennDispciplinasTentativas = 0;
                            while(buscaHistoricoGennDispciplinas){
                                try {
                                    respDisciplinasHist = await httpGenneraUsuario.get(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects`);
                                    buscaHistoricoGennDispciplinas = false;
                                } catch (err) {
                                    buscaHistoricoGennDispciplinasTentativas++;
                                    if(err.message == 'read ECONNRESET'){
                                        console.log(`Nova Tentativa ${buscaHistoricoGennDispciplinasTentativas}.`);
                                    }
                                    if(buscaHistoricoGennDispciplinasTentativas >= 5){
                                        buscaHistoricoGennDispciplinas = false;
                                        throw err;
                                    }
                                }
                            }




                            let disciplinasNoHistorico = respDisciplinasHist.data || [];
                            disciplinasNoHistorico = disciplinasNoHistorico.filter( d => d.dismissed);
                            let somatorioCargaHoraria = 0;
                            let isUpdateRegistro = false;
                            for(let disciplinaHist of disciplinasNoHistorico){
                                somatorioCargaHoraria += disciplinaHist.workload;
                                try {
                                    let isUpdate = false;
                                    // Aqui vai buscar o curso e etc pra fazer a equivalencia;
                                    // if(!disciplinaHist.idSubject){
                                    //     // idSubject
                                    //     let cursoEncontrado = CursosGennera.find(c => c.name == historico.courseName);
                                    //     if(cursoEncontrado){
                                    //         let curriculoEncontrado = cursoEncontrado.curriculums.find( c => c.name == historico.curriculumName);
                                    //         if(curriculoEncontrado){
                                    //             let disciplinaEncontrada = curriculoEncontrado.subjects.find(s => s.name == disciplinaHist.subjectName);
                                    //             if(disciplinaEncontrada){
                                    //                 disciplinaHist.idSubject = disciplinaEncontrada.idSubject;
                                    //                 isUpdate = true;
                                    //             }
                                    //             // let numeroPeriodo = historico.moduleName.replace(/[^0-9]/g,'');
                                    //             // if(numeroPeriodo){
                                    //             //     let moduloEncontrado = curriculoEncontrado.modules.find(m => m.name.includes(`${numeroPeriodo}º`) || m.name.includes(`${numeroPeriodo}°`) || m.name.includes(`${numeroPeriodo}º`))
                                    //             //     if(moduloEncontrado){
                                                        
                                    //             //     }
                                    //             // }
                                    //         }
                                    //     }
                                    // }
                                    //também vai verificar se a disciplina é status cursando pra marcar como cancelada
                                    if(disciplinaHist.status == 'IN PROGRESS'){
                                        disciplinaHist.status = 'CANCELLED';
                                        disciplinaHist.idCancellationReason = 2738;
                                        isUpdate = true;
                                    }
                                    // disciplinaHist.attendance
                                    // if(!disciplinaHist.attendance){
                                    //     disciplinaHist.attendance = 100;
                                    //     isUpdate = true;
                                    // }
                                    
                                    if(disciplinasHistoricoModel.length){
                                        let disciplinasHistoricoModelEncontrada = disciplinasHistoricoModel.find(dm => dm.subject == disciplinaHist.subjectName);

                                        if(disciplinasHistoricoModelEncontrada){
                                            const enrollmentRecordSubjectProfessorService = new EnrollmentRecordSubjectProfessorService();
                                            let disciplinasModel = await enrollmentRecordSubjectProfessorService.BuscarPeloIdRPA(disciplinasHistoricoModelEncontrada.id_enrollment_subject_record);
                                            if(disciplinasModel){
                                                let professor = {
                                                    "name": disciplinasModel.professor_name,
                                                    "academicTitle": disciplinasModel.academic_title || ''
                                                }
                                                if(disciplinaHist.professors){
                                                    if(disciplinaHist.professors.professors){
                                                        if(!disciplinaHist.professors.professors.length){
                                                            disciplinaHist.professors.professors.push(professor);
                                                            isUpdate = true;
                                                        }
                                                    }
                                                } else{
                                                    disciplinaHist['professors'] = {};
                                                    disciplinaHist.professors['professors'] = [];
                                                    disciplinaHist.professors.professors.push(professor);
                                                    isUpdate = true;
                                                }
                                            } else{
                                                console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [0]`);
                                                log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [0]`);
                                            }
                                        } else{
                                            console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [1]`);
                                            log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [1]`);
                                        }
                                    } else{
                                        console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [2]`);
                                        log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [2]`);
                                    }
                                    if(isUpdate){
                                        let AtualizaHistoricoGennDispciplinas = true;
                                        let AtualizaHistoricoGennDispciplinasTentativas = 0;
                                        while(AtualizaHistoricoGennDispciplinas){
                                            try {
                                                await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects/${disciplinaHist.idEnrollmentSubjectRecord}`, disciplinaHist);
                                                AtualizaHistoricoGennDispciplinas = false;
                                            } catch (err) {
                                                AtualizaHistoricoGennDispciplinasTentativas++;
                                                if(err.message == 'read ECONNRESET'){
                                                    console.log(`Nova Tentativa ${AtualizaHistoricoGennDispciplinasTentativas}.`);
                                                }
                                                if(AtualizaHistoricoGennDispciplinasTentativas >= 5){
                                                    AtualizaHistoricoGennDispciplinas = false;
                                                    throw err;
                                                }
                                            }
                                        }
                                    }
                                } catch (err) {
                                    textError += `Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`;
                                    console.log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`);
                                    log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`);
                                }
                            }
                            // if(historico.workload != somatorioCargaHoraria){
                            //     historico.workload = somatorioCargaHoraria;
                            //     isUpdateRegistro = true;
                            // }
                            if(historico.status == 'IN PROGRESS'){
                                historico.status = 'APPROVED';
                                isUpdateRegistro = true;
                            }
                            if(isUpdateRegistro){
                                delete historico.subjects;
                                let AtualizaHistoricoGenn = true;
                                let AtualizaHistoricoGennTentativas = 0;
                                while(AtualizaHistoricoGenn){
                                    try {
                                        await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}`, historico);
                                        AtualizaHistoricoGenn = false;
                                    } catch (err) {
                                        AtualizaHistoricoGennTentativas++;
                                        if(err.message == 'read ECONNRESET'){
                                            console.log(`Nova Tentativa ${AtualizaHistoricoGennTentativas}.`);
                                        }
                                        if(AtualizaHistoricoGennTentativas >= 5){
                                            AtualizaHistoricoGenn = false;
                                            throw err;
                                        }
                                    }
                                }
                            }
                            // historico.metadata.admission = historicoEncontrado.admission;
                        }
                    } catch (err) {
                        let message = err.message || '';
                        if(message == "Cannot read properties of null (reading 'length')"){
                            continue;
                        }
                        textError += `Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`;
                        console.log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`);
                        log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`);
                    }
                }
            } catch (err) {
                textError += `\n\n ####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.\n\n`;
                console.log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
                log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
            }
            
        }
        console.log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)
        log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)

    }

    async RPA_HotFixHistoricoDisciplinaDispensaCleanProfessorNull(){
        const tokenAPI = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywiaWRJc3N1ZXJVc2VyIjoxMjgxOTk1NCwibW9kZSI6InByb2QiLCJpYXQiOjE3MDk0ODE3NzEsImlzcyI6Imh0dHBzOi8vYXBwcy5nZW5uZXJhLmNvbS5iciIsInN1YiI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciJ9.mt83H7H03gGiEv9MvV6uelzSBxOwfDdpCmOJL6491aReJmff6_yFEydgmzDqYgnKsyTdz6Iph6Fw-s6EtcsRONuVDLlGDD6Wc7RS4vBM9KPH1B6FRvBb867cS7GQo1Q5saiB1rbc7GweC8cQBwPzg6G_RjUZiQ94SXJWa0-8UR8gi5NLP_Wu6jsNjDM8AV94qpgq9CkKMbpJeKggh4UdHwfl8c75QRYtZMzNoZZu6Zan6H1Srpi4nOSMF1yGaMt4N5qbJCISSxc97iHQ1Nww1x8Rtrx3EE0VGhJ1T_o-tUYvXFZRAgVo8Ir3OTueBDG04ScLKNFPTwTI8i3hlPvXw2wEypIh3PYWIgD_jVCN5459KqLE1rGfLMdlQ2TaSgrQn3thN5WpFEaREhRU1cC0auFPojAPAb_qWtufx7XNNI0SVq5qatMsSJgWoBVIGxqJcSER8BYcHCNYlxtIGIYlkqKOBWUVTQufQqE0O3YzBi9P4Qafis8Brg-KkqXulphmZL-Md0J-7tISVe4OsILc7qnC6Nd82_tOK8rBU_2UlI0JL1M3nae3iRYSN4PR5MACPkgSUIvtzPQ_PYsIY3YXmqnT1z6dXRhSY4QnlpaeBzzScLOokMTaXNVDW3oG1ziuHkvCy4pcXdMOu_GQR0mS68j5fXXdWr70B31UuPnsYRA`;
        const tokenUser = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywibW9kZSI6InByb2QiLCJpYXQiOjE3MTY3MjMwMTksImV4cCI6MTcxNzE1NTAxOSwiaXNzIjoiaHR0cHM6Ly9hcHBzLmdlbm5lcmEuY29tLmJyIiwic3ViIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIn0.L3vBohl3Qh5IbEFBFDaT3zFeLdvC9F-1CUAb5mfB4kvnjYEWIqauu366z8U72e9Jl25Lz2L4oc0pG-c-KoSZWjjwA4V7Oibsfmi77hX7OtZArOJdIgnW2_mpvZAeN2dAaw-FxPqH760U28_iGKD6Re2DmJKasWf9hN9J9U1S4zsQYhLMwabHXOQ9NRgzfVQdKhgflR50jDePKwotcY0BW9OkbdrJ6aW9hwJMbupzHe-bzs1YFKeGy91TbWFka9IuQzY-Z70N4GlmL7lRasFncElf3oicNHOYylM05sSOVAYjg_0sYBIM5wD1HfWN6YZRrL5Vilh90j2D_M7qz2n_fqrkzUywb8Fms5wuaV5i43vBMovaVDiLkvyfB7z53y3wWGYXXVlylf4UC4Fxfzysfn9vaFRLeomo-6epQ_M4d4n_gs3BTeXK1Vii1_lln0CpMWn7BuFnIN_9arBUkqqdG8Z_EYNyqKsZ_jVfM7udkQAz7ynukeIvCNs-3QvzV7Jc55YgDoABF0guuYb7-YWWMxaCCaL7p4nXrI3IGU1a_4agRgW4hQ-LWFW-YhzDxgaoOvOlIdmbG49h9YmA4hGjQyjjl7TISFatG_AJFlpT3UW6vsZiQmx3ebhkY_19j4O5eF4ZXyACgUnEEYYs8lfPdhU3jKgEVihPH_60x664WXo`;

        const httpGenneraAPI = axios.create({
            baseURL: 'https://api2.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenAPI
            }
        });

        const httpGenneraUsuario = axios.create({
            baseURL: 'https://enrollment.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenUser
            }
        });

        

        let resp = [];
        let pessoas = true;
        let pessoaTentativas = 0;
        while(pessoas){
            try {
                resp = await httpGenneraAPI.get('/persons');
                pessoas = false
            } catch (err) {
                pessoaTentativas++;
                if(err.message == 'read ECONNRESET'){
                    console.log(`Nova Tentativa ${pessoaTentativas}.`);
                }
                if(pessoaTentativas >= 5){
                    pessoas = false;
                    throw err;
                }
            }
        }

        let TodasPessoasDoGennera = resp.data;
        const personService = new PersonService();
        // let TodasPessoasMigradas = await personService.BuscaTodasPessoasMigradas();
        let TodasPessoasMigradas = await personService.BuscarTodasPessoasMigradasPorIdPersonQuery();

        // TodasPessoasDoGennera = TodasPessoasDoGennera.filter(h => h.name == 'MIKELLY LUANY DA SILVA LIMA');
        // TodasPessoasMigradas = TodasPessoasMigradas.filter(h => h.name == 'JÚLIA MARIA SANTOS OLIVEIRA');

        let PessoasVerificarHistorico = [];
        TodasPessoasMigradas.forEach(p =>{
            let PessoaGenneraEncontrada = TodasPessoasDoGennera.find(person => person.name == p.name || person.socialName == p.name);
            if(PessoaGenneraEncontrada) {
                PessoaGenneraEncontrada['idPessoaBancoMigracao'] = p.id_person;
                PessoaGenneraEncontrada['idStudentBancoMigracao'] = p.id_student;
                
                PessoasVerificarHistorico.push(PessoaGenneraEncontrada);
            }
        });


        //PessoasVerificarHistorico = PessoasVerificarHistorico.filter(h => h.idPerson == 2529930);
        const enrollmentRecordService = new EnrollmentRecordService();
        let count = 1;
        let textError = '';
        for(let person of PessoasVerificarHistorico){
            try {
                console.log(`Processando ${count} de ${PessoasVerificarHistorico.length} DISPENSAS | Nome: ${person.name}`);
                log(`Processando ${count} de ${PessoasVerificarHistorico.length} DISPENSAS | Nome: ${person.name}`);
                count++;
                // if(count < 4565) continue;
                //log(person);
                let historicosModel = []
                let buscaHistorico = true;
                let buscaHistoricoTentativas = 0;
                while(buscaHistorico){
                    try {
                        historicosModel = await enrollmentRecordService.BuscarPeloIdStudent(person.idStudentBancoMigracao);
                        buscaHistorico = false;
                    } catch (err) {
                        buscaHistoricoTentativas++;
                        if(err.message == 'read ECONNRESET'){
                            console.log(`Nova Tentativa ${buscaHistoricoTentativas}.`);
                        }
                        if(buscaHistoricoTentativas >= 5){
                            buscaHistorico = false;
                            throw err;
                        }
                    }
                }
                if(!historicosModel.length) continue;
                
                // INICIO Somente em Registros do Curso de ADM
                // let registroEncontrado = historicosModel.filter(r => r.course == 'ODONTOLOGIA')
                // if(registroEncontrado.length){
                //     historicosModel = [...registroEncontrado];
                // } else{
                //     continue;
                // }
                // FIM Somente em Registros do Curso de ADM
    
                let respHist = [];

                let buscaHistoricoGenn = true;
                let buscaHistoricoGennTentativas = 0;
                while(buscaHistoricoGenn){
                    try {
                        respHist = await httpGenneraUsuario.get(`enrollmentRecords?idPerson=${person.idPerson}`);
                        buscaHistoricoGenn = false;
                    } catch (err) {
                        buscaHistoricoGennTentativas++;
                        if(err.message == 'read ECONNRESET'){
                            console.log(`Nova Tentativa ${buscaHistoricoGennTentativas}.`);
                        }
                        if(buscaHistoricoGennTentativas >= 5){
                            buscaHistoricoGenn = false;
                            throw err;
                        }
                    }
                }


                let historicosNoGennera = respHist.data || [];
                if(!historicosNoGennera.length) {
                    let buscaHistoricoGennbyName = true;
                    let buscaHistoricoGennbyNameTentativas = 0;
                    while(buscaHistoricoGennbyName){
                        try {
                            historicosNoGennera = await this.VerificaDemaisCadastroDePessoas(httpGenneraUsuario, person.name);
                            buscaHistoricoGennbyName = false;
                        } catch (err) {
                            buscaHistoricoGennbyNameTentativas++;
                            if(err.message == 'read ECONNRESET'){
                                console.log(`Nova Tentativa ${buscaHistoricoGennbyNameTentativas}.`);
                            }
                            if(buscaHistoricoGennbyNameTentativas >= 5){
                                buscaHistoricoGennbyName = false;
                                throw err;
                            }
                        }
                    }
                }
                // historicosNoGennera = historicosNoGennera.filter(h => h.institutionName == 'FIS');
                historicosNoGennera = historicosNoGennera.filter(h => !h.idEnrollment);
    
                
                for(let historico of historicosNoGennera){
                    try {
                        //Aqui pode ser um possível ponto de falha, estudar colocar expressão regular pra pegar somente números e testar com includes dentro do find
                        let numeroModulo = this.#PegarSomenteNumeros(historico.moduleName);
                        let historicoEncontrado = historicosModel.find(h => h.module.includes(numeroModulo));
                        if(!historicoEncontrado ) continue;
                        let idEnrollmentRecords = [];
                        historicosModel.forEach(e =>{
                            idEnrollmentRecords.push(e.id_enrollment_record);
                        })
                        const enrollmentRecordSubjectService = new EnrollmentRecordSubjectService();
                        let disciplinasHistoricoModel = await enrollmentRecordSubjectService.BuscarPeloIdsEnrollmentRecord(idEnrollmentRecords);
                        disciplinasHistoricoModel = disciplinasHistoricoModel.filter(s=> s.dismissed);

                        if(!historico.idEnrollment){
                            let respDisciplinasHist = [];

                            let buscaHistoricoGennDispciplinas = true;
                            let buscaHistoricoGennDispciplinasTentativas = 0;
                            while(buscaHistoricoGennDispciplinas){
                                try {
                                    respDisciplinasHist = await httpGenneraUsuario.get(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects`);
                                    buscaHistoricoGennDispciplinas = false;
                                } catch (err) {
                                    buscaHistoricoGennDispciplinasTentativas++;
                                    if(err.message == 'read ECONNRESET'){
                                        console.log(`Nova Tentativa ${buscaHistoricoGennDispciplinasTentativas}.`);
                                    }
                                    if(buscaHistoricoGennDispciplinasTentativas >= 5){
                                        buscaHistoricoGennDispciplinas = false;
                                        throw err;
                                    }
                                }
                            }




                            let disciplinasNoHistorico = respDisciplinasHist.data || [];
                            disciplinasNoHistorico = disciplinasNoHistorico.filter( d => d.dismissed);
                            let somatorioCargaHoraria = 0;
                            let isUpdateRegistro = false;
                            for(let disciplinaHist of disciplinasNoHistorico){
                                somatorioCargaHoraria += disciplinaHist.workload;
                                try {
                                    let isUpdate = false;
                                    
                                    if(disciplinasHistoricoModel.length){
                                        let disciplinasHistoricoModelEncontrada = disciplinasHistoricoModel.find(dm => dm.subject == disciplinaHist.subjectName);

                                        if(disciplinasHistoricoModelEncontrada){
                                            const enrollmentRecordSubjectProfessorService = new EnrollmentRecordSubjectProfessorService();
                                            let disciplinasModel = await enrollmentRecordSubjectProfessorService.BuscarPeloIdRPA(disciplinasHistoricoModelEncontrada.id_enrollment_subject_record);
                                            if(disciplinasModel){
                                                if(disciplinaHist.professors){
                                                    if(disciplinaHist.professors.professors){
                                                        if(disciplinaHist.professors.professors.length){
                                                            for(let i = 0; i < disciplinaHist.professors.professors.length; i++){
                                                                let prof = disciplinaHist.professors.professors[i];
                                                                if(!prof.name){
                                                                    disciplinaHist.professors.professors.splice(i, 1);
                                                                    // .splice(index, 1);
                                                                    isUpdate = true;
                                                                } 
                                                            }
                                                            // disciplinaHist.professors.professors.push(professor);
                                                        }
                                                    }
                                                }
                                            } else{
                                                console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [0]`);
                                                log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [0]`);
                                            }
                                        } else{
                                            console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [1]`);
                                            log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [1]`);
                                        }
                                    } else{
                                        console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [2]`);
                                        log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [2]`);
                                    }
                                    if(isUpdate){
                                        let AtualizaHistoricoGennDispciplinas = true;
                                        let AtualizaHistoricoGennDispciplinasTentativas = 0;
                                        while(AtualizaHistoricoGennDispciplinas){
                                            try {
                                                await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects/${disciplinaHist.idEnrollmentSubjectRecord}`, disciplinaHist);
                                                AtualizaHistoricoGennDispciplinas = false;
                                            } catch (err) {
                                                AtualizaHistoricoGennDispciplinasTentativas++;
                                                if(err.message == 'read ECONNRESET'){
                                                    console.log(`Nova Tentativa ${AtualizaHistoricoGennDispciplinasTentativas}.`);
                                                }
                                                if(AtualizaHistoricoGennDispciplinasTentativas >= 5){
                                                    AtualizaHistoricoGennDispciplinas = false;
                                                    throw err;
                                                }
                                            }
                                        }
                                    }
                                } catch (err) {
                                    textError += `Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`;
                                    console.log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`);
                                    log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`);
                                }
                            }
                            // if(historico.workload != somatorioCargaHoraria){
                            //     historico.workload = somatorioCargaHoraria;
                            //     isUpdateRegistro = true;
                            // }
                            if(historico.status == 'IN PROGRESS'){
                                historico.status = 'APPROVED';
                                isUpdateRegistro = true;
                            }
                            if(isUpdateRegistro){
                                delete historico.subjects;
                                let AtualizaHistoricoGenn = true;
                                let AtualizaHistoricoGennTentativas = 0;
                                while(AtualizaHistoricoGenn){
                                    try {
                                        await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}`, historico);
                                        AtualizaHistoricoGenn = false;
                                    } catch (err) {
                                        AtualizaHistoricoGennTentativas++;
                                        if(err.message == 'read ECONNRESET'){
                                            console.log(`Nova Tentativa ${AtualizaHistoricoGennTentativas}.`);
                                        }
                                        if(AtualizaHistoricoGennTentativas >= 5){
                                            AtualizaHistoricoGenn = false;
                                            throw err;
                                        }
                                    }
                                }
                            }
                            // historico.metadata.admission = historicoEncontrado.admission;
                        }
                    } catch (err) {
                        let message = err.message || '';
                        if(message == "Cannot read properties of null (reading 'length')"){
                            continue;
                        }
                        textError += `Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`;
                        console.log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`);
                        log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`);
                    }
                }
            } catch (err) {
                textError += `\n\n ####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.\n\n`;
                console.log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
                log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
            }
            
        }
        console.log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)
        log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)

    }

    async VerificaDemaisCadastroDePessoas(httpGenneraUsuario, nomePessoa, TodasPessoasDoGennera = []){
        // let PessoaGenneraEncontrada = TodasPessoasDoGennera.filter(person => person.name == nomePessoa);
        let respPessoa = await httpGenneraUsuario.get(`https://enrollment.gennera.com.br/institutions/930/filters?resource=enrollmentRecordPersons&idInstitution=880&name=${nomePessoa}`);
        let resultados = respPessoa.data || [];
        if(resultados.length){
            let idPerson = resultados[0].idPerson;
            let respHist = await httpGenneraUsuario.get(`enrollmentRecords?idPerson=${idPerson}`);
            let historicosNoGennera = respHist.data || [];
            return historicosNoGennera;
        }
        return [];
    }

    async ProcessarHistorico_Disciplinas_Dispensadas(){
        const enrollmentRecordSubjectService = new EnrollmentRecordSubjectService();
        const enrollmentRecordService = new EnrollmentRecordService();
        const subjectService = new SubjectService();

        if(process.env.HISTORICO_DISCIPLINAS_DISPENSADAS == 1){ /// .env
            console.log('INICIO PROCESSANDO HISTÓRICO DISCIPLINAS DISPENSADAS');
            const historicoModel = await connectionSQLServer.query(`
            SELECT 
                T0.[CURS_Codigo], T0.[ANOL_Codigo],  T0.[ALUN_Matricula], T0.[CURR_Codigo], T0.[ALAN_IN_Periodo], T3.[CURS_Descricao], T4.[CURR_Descricao]
            FROM [dbo].[FACALAN] T0 
            INNER JOIN [dbo].[FACALUN] T1 ON T1.[ALUN_Matricula] = T0.[ALUN_Matricula]
            INNER JOIN FACCURS T3 ON T3.CURS_Codigo = T0.CURS_Codigo
            INNER JOIN FACCURR T4 ON T4.CURS_Codigo = T0.CURS_Codigo AND T4.CURR_Codigo = T0.CURR_Codigo
            `);
            // WHERE T0.[ALUN_Matricula] = '2023104105'
            const historicos = historicoModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let historico of historicos) {
                    console.log(`Processando ${count} de ${historicos.length} Registros Academicos`);
                    const { CURS_Codigo, CURR_Codigo, ANOL_Codigo, ALAN_IN_Periodo, ALUN_Matricula, CURS_Descricao, CURR_Descricao} = historico;
                    let id_enrollment_record = '';
                    let id_enrollment_recordAux = `${CURS_Codigo}${CURR_Codigo}${ANOL_Codigo.replaceAll('.','')}${ALAN_IN_Periodo}${ALUN_Matricula}`;
                    id_enrollment_record = await enrollmentRecordService.BuscarPeloIdAux_retornoIdEnrollmentRecord(id_enrollment_recordAux);

                    const dispensasModel = await connectionSQLServer.query(`
                    SELECT [CURS_Codigo], [ANOL_Codigo] ,[DISC_Codigo] ,[ALUN_Matricula] ,[DISP_Media] ,[DISP_CargaHoraria] ,[DISP_QtdCreditos]
                        ,[MTDI_Codigo] ,[INST_Codigo] ,[DISP_Data] ,[DISP_Observacao] ,[USUA_LastUpdate] ,[USUA_Sequencial]
                        ,[DISP_Descricao] ,[DISP_DocenteNome] ,[TPTI_ST_Codigo] ,[DISP_MediaConceito] ,[DISP_TipoAvaliacao]
                    FROM [dbo].[FACDISP]
                    WHERE [CURS_Codigo] = '${CURS_Codigo}' AND [ANOL_Codigo] = '${ANOL_Codigo}' AND [ALUN_Matricula] = '${ALUN_Matricula}'
                    `);
                    const dispensas = dispensasModel[0];
                    for(let dispensa of dispensas){
                        let { DISC_Codigo, MTDI_Codigo, DISP_Media, DISP_MediaConceito, DISP_Descricao } = dispensa;
                        let idConvertNumber = jsonDeParaIdSubject[`${DISC_Codigo}`];

                        let DISC_Descricao = '';
                        let DISC_CargaHorario = '';
                        let subjectModel = await subjectService.BuscarPeloCode(DISC_Codigo);
                        if(subjectModel) {
                            DISC_Descricao = subjectModel.name;
                            DISC_CargaHorario = subjectModel.workload;
                        }

                        let id_enrollment_subject_record_aux = `${id_enrollment_record}${CURS_Codigo}${CURR_Codigo}${ALAN_IN_Periodo}${idConvertNumber}`;
                        let timestamp_ID = Date.now();
                        await new Promise(resolve => setTimeout(resolve, 10));
                        let id_enrollment_subject_record = `${timestamp_ID}`;
                        let subject_type = 'Regular';
    
                        let waiver = '';
                        if(MTDI_Codigo){
                            if(MTDI_Codigo == '01') waiver = 'CURSOU EM OUTRA IES';
                            else if(MTDI_Codigo == '02') waiver = 'APROVEITAMENTO DE ESTUDO';
                            else if(MTDI_Codigo == '03') waiver = 'COMPLEMENTAÇÃO 1ª VA';
                            else if(MTDI_Codigo == '04') waiver = 'COMPLEMENTAÇÃO 2ª VA';
                            else if(MTDI_Codigo == '05') waiver = 'DISEPENSADA EM OUTRA IES';
                        }
                        let status = 'Aprovado'
    
                        let dismissed = true;
    
                        let nameModuloEquivalente = '';
                        if(ALAN_IN_Periodo){
                            if(ALAN_IN_Periodo == 0) nameModuloEquivalente = `Módulo`;
                            else nameModuloEquivalente = `${ALAN_IN_Periodo}º Módulo`
                        }
                            
                        await enrollmentRecordSubjectService.Registra(id_enrollment_subject_record, id_enrollment_subject_record_aux, id_enrollment_record, DISC_Descricao, ANOL_Codigo, '', subject_type, '', DISP_Media ? DISP_Media.toString().replaceAll(',', '.') : '', '', DISC_CargaHorario, '', '', waiver, "", status, '', DISP_MediaConceito, '', '', dismissed, DISP_Descricao, '', CURS_Descricao, CURR_Descricao, nameModuloEquivalente, DISC_Descricao, false, '', '', true);
                    }
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO HISTÓRICO DISCIPLINAS DISPENSADAS')
        }
        if(process.env.CSVHISTORICO_DISCIPLINAS_DISPENSADAS == 1){
            console.log('INICIO GERANDO CSV HISTÓRICO DISCIPLINAS DISPENSADAS');
            const data = await enrollmentRecordSubjectService.BuscaTodasDispensas();
            let obj = {};
            let index = 1;
            let count = 0;
            for(let i of data){
                if(count == 0) obj[`${index}`] = [];
                if(count < 99999){
                    obj[`${index}`].push(i);
                    count++;
                } else{
                    obj[`${index}`].push(i)
                    index++;
                    count = 0;
                }
            }
            for(let key in obj){
                const layoutService = new LayoutService(`Histórico_Disciplinas_Dispensas_Parte-${key}_`);
                await layoutService.CreateFile(obj[`${key}`]);
            }
            console.log('FIM GERANDO CSV HISTÓRICO DISCIPLINAS DISPENSADAS');
        }
    }

    async RPA_HotFixHistoricoDisciplinaDispensa_CursadasEmOutroCurso(){
        const tokenAPI = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywiaWRJc3N1ZXJVc2VyIjoxMjgxOTk1NCwibW9kZSI6InByb2QiLCJpYXQiOjE3MDk0ODE3NzEsImlzcyI6Imh0dHBzOi8vYXBwcy5nZW5uZXJhLmNvbS5iciIsInN1YiI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciJ9.mt83H7H03gGiEv9MvV6uelzSBxOwfDdpCmOJL6491aReJmff6_yFEydgmzDqYgnKsyTdz6Iph6Fw-s6EtcsRONuVDLlGDD6Wc7RS4vBM9KPH1B6FRvBb867cS7GQo1Q5saiB1rbc7GweC8cQBwPzg6G_RjUZiQ94SXJWa0-8UR8gi5NLP_Wu6jsNjDM8AV94qpgq9CkKMbpJeKggh4UdHwfl8c75QRYtZMzNoZZu6Zan6H1Srpi4nOSMF1yGaMt4N5qbJCISSxc97iHQ1Nww1x8Rtrx3EE0VGhJ1T_o-tUYvXFZRAgVo8Ir3OTueBDG04ScLKNFPTwTI8i3hlPvXw2wEypIh3PYWIgD_jVCN5459KqLE1rGfLMdlQ2TaSgrQn3thN5WpFEaREhRU1cC0auFPojAPAb_qWtufx7XNNI0SVq5qatMsSJgWoBVIGxqJcSER8BYcHCNYlxtIGIYlkqKOBWUVTQufQqE0O3YzBi9P4Qafis8Brg-KkqXulphmZL-Md0J-7tISVe4OsILc7qnC6Nd82_tOK8rBU_2UlI0JL1M3nae3iRYSN4PR5MACPkgSUIvtzPQ_PYsIY3YXmqnT1z6dXRhSY4QnlpaeBzzScLOokMTaXNVDW3oG1ziuHkvCy4pcXdMOu_GQR0mS68j5fXXdWr70B31UuPnsYRA`;
        const tokenUser = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywibW9kZSI6InByb2QiLCJpYXQiOjE3MTgwMjUyODUsImV4cCI6MTcxODQ1NzI4NSwiaXNzIjoiaHR0cHM6Ly9hcHBzLmdlbm5lcmEuY29tLmJyIiwic3ViIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIn0.KslIJ4XEZurD4nKFZxz6wreeAu_r2wmOuxw1zlYSERIz9HTzIdenHf6hI9JxwdxuqrUqIkmo67fwZWP2lI5BzpValdpjpsJ6g-BjUx_awo5LH5Bl11arUzBi_R8cXM4eMWEJJq1R0NbhZ3CaXm0cAzmDkJx-NBpoX-DkP380upPMzP2--kz-Xk7R1z7oLmkYTRBh2_uuCkDpFmrMwAqjNg_KYGnzIg66dXQhu41Rc56C1IA9pV4bZ1RQzZCY4StdoZD2rA44FEKc6FcWLnoyzzeYP98D3JAS7DCoRmD6DPQhJqnbMqfO0RJMptI9TXq_LZhnarCbcGYp5mwxxjIFeN95vEDxc3bSd-NPP3hQKxfDiq2pEVdRetFIeFGtFwNJrgLqBq1qSoJ7ZVhqCWLHn5SGEWndNqbqunadVZQaJ_e6OWa9Uu8kSx1xeGWR4sWXpMkUfiLrRPVd0K9bR9sqSbWQ4GWlecvmiYYbsJtJrHmnBoJatfb_ibC_4o__eRIQyxNkom8og4b8MgmUFupL7twEftXbQ59vUtCm1lPhToAVK86HJtTu3NWBMo_5fJzfFcIL_Kbuc_hvifS4obAfPZdMrc4Ac1p5gdD2S7BDqqIHwyNvy8gHISp2JN3g9zXYQMgymQlj4kbwN7NMRJLB9YiC2QFFmayQZxyOrPpqR3s`;

        const httpGenneraAPI = axios.create({
            baseURL: 'https://api2.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenAPI
            }
        });

        const httpGenneraUsuario = axios.create({
            baseURL: 'https://enrollment.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenUser
            }
        });

        let respCursos = await httpGenneraAPI.get('/courses');
        let CursosGennera = respCursos.data || [];
        // CursosGennera = CursosGennera.filter(c => c.name == 'ODONTOLOGIA');
        let i = 0;
        for(let curso of CursosGennera){
            console.log(`Processando Curso ${i} de ${CursosGennera.length}`);
            i++;
            curso['curriculums'] = [];
            let respCurriculo = [];
            let curriculo = true;
            let curriculoCount = 0;
            while(curriculo){
                try {
                    respCurriculo = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums`);
                    curriculo = false;
                    curso.curriculums = respCurriculo.data || [];
                    let x =1;
                    for(let curriculo of curso.curriculums){
                        console.log(`Processando Curso ${i}. Currículo ${x} de ${curso.curriculums.length}`);
                        x++;
                        curriculo['modules'] = [];
                        curriculo['subjects'] = [];

                        let modulos = true;
                        let modulosCount = 0;
                        while(modulos){
                            try {
                                let respModules = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums/${curriculo.idCurriculum}/modules`);
                                curriculo.modules = respModules.data || [];
                                modulos = false;
                                let y=1;
                                for(let module of curriculo.modules){
                                    console.log(`Processando Curso ${i}. Currículo ${x}. Múdulo ${y} de ${curriculo.modules.length}`);
                                    y++;
                                    // module['subjects'] = [];
                                    let disciplinas = true;
                                    let disciplinasCount = 0;
                                    while(disciplinas){
                                        try {
                                            let respSubjects = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums/${curriculo.idCurriculum}/modules/${module.idModule}/subjects`);
                                            let arr = respSubjects.data || [];
                                            curriculo.subjects = curriculo.subjects.concat(arr);
                                            disciplinas = false
                                        } catch (err) {
                                            disciplinasCount++;
                                            if(err.message == 'read ECONNRESET'){
                                                console.log(`Nova Tentativa ${disciplinasCount}.`);
                                            }
                                            if(disciplinasCount >= 5){
                                                disciplinas = false;
                                                throw err;
                                            }
                                        }
                                    }

                                }
                            } catch (err) {
                                modulosCount++;
                                if(err.message == 'read ECONNRESET'){
                                    console.log(`Nova Tentativa ${modulosCount}.`);
                                }
                                if(modulosCount >= 5){
                                    modulos = false;
                                    throw err;
                                }
                            }
                        }
                    }
                } catch (error) {
                    curriculoCount++;
                    if(error.message == 'read ECONNRESET'){
                        console.log(`Nova Tentativa ${curriculoCount}.`);
                    }
                    if(curriculoCount >= 5){
                        curriculo = false;
                        throw error;
                    }
                }
            }
        }

        let resp = [];
        let pessoas = true;
        let pessoaTentativas = 0;
        while(pessoas){
            try {
                resp = await httpGenneraAPI.get('/persons');
                pessoas = false
            } catch (err) {
                pessoaTentativas++;
                if(err.message == 'read ECONNRESET'){
                    console.log(`Nova Tentativa ${pessoaTentativas}.`);
                }
                if(pessoaTentativas >= 5){
                    pessoas = false;
                    throw err;
                }
            }
        }

        let TodasPessoasDoGennera = resp.data;
        const personService = new PersonService();
        // let TodasPessoasMigradas = await personService.BuscaTodasPessoasMigradas();
        let TodasPessoasMigradas = await personService.BuscarTodasPessoasMigradasPorIdPersonQuery();

        TodasPessoasDoGennera = TodasPessoasDoGennera.filter(h => h.name == 'JÉSSICA SILVA BORGES DE ARAÚJO');
        TodasPessoasMigradas = TodasPessoasMigradas.filter(h => h.name == 'JÉSSICA SILVA BORGES DE ARAÚJO');

        let PessoasVerificarHistorico = [];
        TodasPessoasMigradas.forEach(p =>{
            let PessoaGenneraEncontrada = TodasPessoasDoGennera.find(person => person.name == p.name || person.socialName == p.name);
            if(PessoaGenneraEncontrada) {
                PessoaGenneraEncontrada['idPessoaBancoMigracao'] = p.id_person;
                PessoaGenneraEncontrada['idStudentBancoMigracao'] = p.id_student;
                
                PessoasVerificarHistorico.push(PessoaGenneraEncontrada);
            }
        });


        //PessoasVerificarHistorico = PessoasVerificarHistorico.filter(h => h.idPerson == 2529930);
        const enrollmentRecordService = new EnrollmentRecordService();
        let count = 1;
        let textError = '';
        for(let person of PessoasVerificarHistorico){
            try {
                console.log(`Processando ${count} de ${PessoasVerificarHistorico.length} DISPENSAS | Nome: ${person.name}`);
                log(`Processando ${count} de ${PessoasVerificarHistorico.length} DISPENSAS | Nome: ${person.name}`);
                count++;
                // if(count < 4565) continue;
                //log(person);
                let historicosModel = []
                let buscaHistorico = true;
                let buscaHistoricoTentativas = 0;
                while(buscaHistorico){
                    try {
                        historicosModel = await enrollmentRecordService.BuscarPeloIdStudent(person.idStudentBancoMigracao);
                        buscaHistorico = false;
                    } catch (err) {
                        buscaHistoricoTentativas++;
                        if(err.message == 'read ECONNRESET'){
                            console.log(`Nova Tentativa ${buscaHistoricoTentativas}.`);
                        }
                        if(buscaHistoricoTentativas >= 5){
                            buscaHistorico = false;
                            throw err;
                        }
                    }
                }
                if(!historicosModel.length) continue;
                
                // INICIO Somente em Registros do Curso de ADM
                // let registroEncontrado = historicosModel.filter(r => r.course == 'ODONTOLOGIA')
                // if(registroEncontrado.length){
                //     historicosModel = [...registroEncontrado];
                // } else{
                //     continue;
                // }
                // FIM Somente em Registros do Curso de ADM
    
                let respHist = [];

                let buscaHistoricoGenn = true;
                let buscaHistoricoGennTentativas = 0;
                while(buscaHistoricoGenn){
                    try {
                        respHist = await httpGenneraUsuario.get(`enrollmentRecords?idPerson=${person.idPerson}`);
                        buscaHistoricoGenn = false;
                    } catch (err) {
                        buscaHistoricoGennTentativas++;
                        if(err.message == 'read ECONNRESET'){
                            console.log(`Nova Tentativa ${buscaHistoricoGennTentativas}.`);
                        }
                        if(buscaHistoricoGennTentativas >= 5){
                            buscaHistoricoGenn = false;
                            throw err;
                        }
                    }
                }


                let historicosNoGennera = respHist.data || [];
                if(!historicosNoGennera.length) {
                    let buscaHistoricoGennbyName = true;
                    let buscaHistoricoGennbyNameTentativas = 0;
                    while(buscaHistoricoGennbyName){
                        try {
                            historicosNoGennera = await this.VerificaDemaisCadastroDePessoas(httpGenneraUsuario, person.name);
                            buscaHistoricoGennbyName = false;
                        } catch (err) {
                            buscaHistoricoGennbyNameTentativas++;
                            if(err.message == 'read ECONNRESET'){
                                console.log(`Nova Tentativa ${buscaHistoricoGennbyNameTentativas}.`);
                            }
                            if(buscaHistoricoGennbyNameTentativas >= 5){
                                buscaHistoricoGennbyName = false;
                                throw err;
                            }
                        }
                    }
                }
                // historicosNoGennera = historicosNoGennera.filter(h => h.institutionName == 'FIS');
                historicosNoGennera = historicosNoGennera.filter(h => !h.idEnrollment);
    
                
                for(let historico of historicosNoGennera){
                    try {
                        //Aqui pode ser um possível ponto de falha, estudar colocar expressão regular pra pegar somente números e testar com includes dentro do find
                        let numeroModulo = this.#PegarSomenteNumeros(historico.moduleName);
                        let historicoEncontrado = historicosModel.find(h => h.module.includes(numeroModulo));
                        if(!historicoEncontrado ) continue;
                        let idEnrollmentRecords = [];
                        historicosModel.forEach(e =>{
                            idEnrollmentRecords.push(e.id_enrollment_record);
                        });
                        const enrollmentRecordSubjectService = new EnrollmentRecordSubjectService();
                        let disciplinasHistoricoModel = await enrollmentRecordSubjectService.BuscarPeloIdsEnrollmentRecord(idEnrollmentRecords);
                        //disciplinasHistoricoModel = disciplinasHistoricoModel.filter(s=> s.dismissed);
                        for(let hist of disciplinasHistoricoModel){
                            hist.dataValues.subject = hist.dataValues.subject.toUpperCase();
                        }

                        if(!historico.idEnrollment){
                            let respDisciplinasHist = [];

                            let buscaHistoricoGennDispciplinas = true;
                            let buscaHistoricoGennDispciplinasTentativas = 0;
                            while(buscaHistoricoGennDispciplinas){
                                try {
                                    respDisciplinasHist = await httpGenneraUsuario.get(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects`);
                                    buscaHistoricoGennDispciplinas = false;
                                } catch (err) {
                                    buscaHistoricoGennDispciplinasTentativas++;
                                    if(err.message == 'read ECONNRESET'){
                                        console.log(`Nova Tentativa ${buscaHistoricoGennDispciplinasTentativas}.`);
                                    }
                                    if(buscaHistoricoGennDispciplinasTentativas >= 5){
                                        buscaHistoricoGennDispciplinas = false;
                                        throw err;
                                    }
                                }
                            }




                            let disciplinasNoHistorico = respDisciplinasHist.data || [];
                            //disciplinasNoHistorico = disciplinasNoHistorico.filter( d => d.dismissed);
                            let somatorioCargaHoraria = 0;
                            let isUpdateRegistro = false;
                            for(let disciplinaHist of disciplinasNoHistorico){
                                somatorioCargaHoraria += disciplinaHist.workload;
                                try {
                                    let isUpdate = false;
                                    // Aqui vai buscar o curso e etc pra fazer a equivalencia;
                                    if(!disciplinaHist.idSubject){
                                    //     // idSubject
                                        let cursoEncontrado = CursosGennera.find(c => c.name == historico.courseName);
                                        if(cursoEncontrado){
                                            let curriculoEncontrado = cursoEncontrado.curriculums.find( c => c.name == historico.curriculumName);
                                            if(curriculoEncontrado){
                                                let disciplinaAux = disciplinaHist.subjectName + ' I';
                                                disciplinaAux = disciplinaAux.toUpperCase();
                                                let disciplinasCurriculoEncontrado = [];
                                                for(let dis of curriculoEncontrado.subjects){
                                                    dis.name = dis.name.toUpperCase();
                                                    disciplinasCurriculoEncontrado.push(dis);
                                                }
                                                if(disciplinaAux == 'BIOQUÍMICA  I' || disciplinaHist.subjectName == 'BIOQUÍMICA'){
                                                    console.log('Achou')
                                                }
                                                let disciplinaEncontrada = disciplinasCurriculoEncontrado.find(s => s.name == disciplinaHist.subjectName || s.name == disciplinaAux);
                                                
                                                if(disciplinaEncontrada){
                                                    disciplinaHist.idSubject = disciplinaEncontrada.idSubject;
                                                    isUpdate = true;
                                                }
                                                // let numeroPeriodo = historico.moduleName.replace(/[^0-9]/g,'');
                                                // if(numeroPeriodo){
                                                 //     let moduloEncontrado = curriculoEncontrado.modules.find(m => m.name.includes(`${numeroPeriodo}º`) || m.name.includes(`${numeroPeriodo}°`) || m.name.includes(`${numeroPeriodo}º`))
                                                //     if(moduloEncontrado){
                                                        
                                                //     }
                                                // }
                                            }
                                        }
                                    }
                                    //também vai verificar se a disciplina é status cursando pra marcar como cancelada
                                    if(disciplinaHist.status == 'IN PROGRESS'){
                                        disciplinaHist.status = 'CANCELLED';
                                        disciplinaHist.idCancellationReason = 2738;
                                        isUpdate = true;
                                    }
                                    // disciplinaHist.attendance
                                    if(!disciplinaHist.attendance){
                                        disciplinaHist.attendance = 100;
                                        isUpdate = true;
                                    }
                                    
                                    if(disciplinasHistoricoModel.length){
                                        let disciplinaAux = disciplinaHist.subjectName + ' I';
                                        disciplinaAux = disciplinaAux.toUpperCase();
                                        
                                        //let disciplinasHistoricoModelEncontrada = disciplinasHistoricoModel.find(dm => dm.dataValues.subject == disciplinaHist.subjectName || dm.dataValues.name.toUpperCase() == disciplinaAux.toUpperCase());
                                        let disciplinasHistoricoModelEncontrada = disciplinasHistoricoModel.find(dm => dm.dataValues.subject == disciplinaHist.subjectName || dm.dataValues.name == disciplinaAux);

                                        if(disciplinasHistoricoModelEncontrada){
                                            const enrollmentRecordSubjectProfessorService = new EnrollmentRecordSubjectProfessorService();
                                            let disciplinasModel = await enrollmentRecordSubjectProfessorService.BuscarPeloIdRPA(disciplinasHistoricoModelEncontrada.id_enrollment_subject_record);
                                            if(disciplinasModel){
                                                let professor = {
                                                    "name": disciplinasModel.professor_name,
                                                    "academicTitle": disciplinasModel.academic_title || ''
                                                }
                                                if(disciplinaHist.professors){
                                                    if(disciplinaHist.professors.professors){
                                                        if(!disciplinaHist.professors.professors.length){
                                                            disciplinaHist.professors.professors.push(professor);
                                                            isUpdate = true;
                                                        }
                                                    }
                                                } else{
                                                    disciplinaHist['professors'] = {};
                                                    disciplinaHist.professors['professors'] = [];
                                                    disciplinaHist.professors.professors.push(professor);
                                                    isUpdate = true;
                                                }
                                            } else{
                                                console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [0]`);
                                                log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [0]`);
                                            }
                                        } else{
                                            console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [1]`);
                                            log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [1]`);
                                        }
                                    } else{
                                        console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [2]`);
                                        log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [2]`);
                                    }
                                    if(isUpdate){
                                        let AtualizaHistoricoGennDispciplinas = true;
                                        let AtualizaHistoricoGennDispciplinasTentativas = 0;
                                        while(AtualizaHistoricoGennDispciplinas){
                                            try {
                                                await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects/${disciplinaHist.idEnrollmentSubjectRecord}`, disciplinaHist);
                                                AtualizaHistoricoGennDispciplinas = false;
                                            } catch (err) {
                                                AtualizaHistoricoGennDispciplinasTentativas++;
                                                if(err.message == 'read ECONNRESET'){
                                                    console.log(`Nova Tentativa ${AtualizaHistoricoGennDispciplinasTentativas}.`);
                                                }
                                                if(AtualizaHistoricoGennDispciplinasTentativas >= 5){
                                                    AtualizaHistoricoGennDispciplinas = false;
                                                    throw err;
                                                }
                                            }
                                        }
                                    }
                                } catch (err) {
                                    textError += `Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`;
                                    console.log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`);
                                    log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`);
                                }
                            }
                            if(historico.workload != somatorioCargaHoraria){
                                historico.workload = somatorioCargaHoraria;
                                isUpdateRegistro = true;
                            }
                            if(historico.status == 'IN PROGRESS'){
                                historico.status = 'APPROVED';
                                isUpdateRegistro = true;
                            }
                            if(isUpdateRegistro){
                                delete historico.subjects;
                                let AtualizaHistoricoGenn = true;
                                let AtualizaHistoricoGennTentativas = 0;
                                while(AtualizaHistoricoGenn){
                                    try {
                                        await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}`, historico);
                                        AtualizaHistoricoGenn = false;
                                    } catch (err) {
                                        AtualizaHistoricoGennTentativas++;
                                        if(err.message == 'read ECONNRESET'){
                                            console.log(`Nova Tentativa ${AtualizaHistoricoGennTentativas}.`);
                                        }
                                        if(AtualizaHistoricoGennTentativas >= 5){
                                            AtualizaHistoricoGenn = false;
                                            throw err;
                                        }
                                    }
                                }
                            }
                            // historico.metadata.admission = historicoEncontrado.admission;
                        }
                    } catch (err) {
                        let message = err.message || '';
                        if(message == "Cannot read properties of null (reading 'length')"){
                            continue;
                        }
                        textError += `Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.\n`;
                        console.log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`);
                        log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.idStudentBancoMigracao}) ${person.name}.`);
                    }
                }
            } catch (err) {
                textError += `\n\n ####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.\n\n`;
                console.log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
                log(`####ERRO na Pessoa (${person.idStudentBancoMigracao}) ${person.name} | ${err.message || err}.`);
            }
            
        }
        console.log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)
        log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)

    }

    async RPA_HotFixHistoricoDisciplinaDispensa_professor(){
        const tokenAPI = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywiaWRJc3N1ZXJVc2VyIjoxMjgxOTk1NCwibW9kZSI6InByb2QiLCJpYXQiOjE3MDk0ODE3NzEsImlzcyI6Imh0dHBzOi8vYXBwcy5nZW5uZXJhLmNvbS5iciIsInN1YiI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciJ9.mt83H7H03gGiEv9MvV6uelzSBxOwfDdpCmOJL6491aReJmff6_yFEydgmzDqYgnKsyTdz6Iph6Fw-s6EtcsRONuVDLlGDD6Wc7RS4vBM9KPH1B6FRvBb867cS7GQo1Q5saiB1rbc7GweC8cQBwPzg6G_RjUZiQ94SXJWa0-8UR8gi5NLP_Wu6jsNjDM8AV94qpgq9CkKMbpJeKggh4UdHwfl8c75QRYtZMzNoZZu6Zan6H1Srpi4nOSMF1yGaMt4N5qbJCISSxc97iHQ1Nww1x8Rtrx3EE0VGhJ1T_o-tUYvXFZRAgVo8Ir3OTueBDG04ScLKNFPTwTI8i3hlPvXw2wEypIh3PYWIgD_jVCN5459KqLE1rGfLMdlQ2TaSgrQn3thN5WpFEaREhRU1cC0auFPojAPAb_qWtufx7XNNI0SVq5qatMsSJgWoBVIGxqJcSER8BYcHCNYlxtIGIYlkqKOBWUVTQufQqE0O3YzBi9P4Qafis8Brg-KkqXulphmZL-Md0J-7tISVe4OsILc7qnC6Nd82_tOK8rBU_2UlI0JL1M3nae3iRYSN4PR5MACPkgSUIvtzPQ_PYsIY3YXmqnT1z6dXRhSY4QnlpaeBzzScLOokMTaXNVDW3oG1ziuHkvCy4pcXdMOu_GQR0mS68j5fXXdWr70B31UuPnsYRA`;
        const tokenUser = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywibW9kZSI6InByb2QiLCJpYXQiOjE3MTg5MTYzNTYsImV4cCI6MTcxOTM0ODM1NiwiaXNzIjoiaHR0cHM6Ly9hcHBzLmdlbm5lcmEuY29tLmJyIiwic3ViIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIn0.F24DDFGmVwyGvdnIm8-MzYJMsmHT3wpgLzvzPP_gPq4XRiqFIBTlCRS5nZMkD9rD5fYridwU9nO90BwrLSyv0MoM88SqdAemBq98doOefoUX3_tUtMUoRAFfOzdw1B5SBPZZ0SVlvSsmNZJm6bkWGBYwdH87BlFh5tUDPS6f9w1utwLlSc2ZkhXTWAvI78D-ysaHmNd3pRnuq63EpPc8WcAidKuMsi2ktWiU93gjibx2BYI-gKnv-qlMQ7RFTaQNcTG5DYzfC2YXurnLXHc6Zmh9cbodJ9yW0zFCFqCx_qDBqhDQhR2WHnXT9TJ_94RgDvu7hhAYyRAkUPQVHH0AhrEDWpoWE6yFpcDCY_2_66EajU3nBmCJ6W0Rb-hsXOMTy-1cuvEuil5C9kGYGdgadoZBNdNG3yZe6Tq55zCDjYN_aJpxZcJPElEp6Nwlfz2bZXR7-m517hvvbIOP9jZ3qcd8jYRzNDMkUvP425HPS4-d55egCG0nyrqudB60KgMNxquDXnL3pvkl0hQTgFa5_ZbBPxTMI0tTM19ar9F4Gj60ehbHImTC-2C9ylwu_i13AklZqVQOMe4XMgOMTsQEpBgPU1v_BmMXYWpCWWVEcWy9ujV6q04pgt8ZKvU83dTuFXy4zraqdScKrjiBXClWb92VknnnoiMgFqJ2e5I7obA`;

        const httpGenneraAPI = axios.create({
            baseURL: 'https://api2.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenAPI
            }
        });

        const httpGenneraUsuario = axios.create({
            baseURL: 'https://enrollment.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenUser
            }
        });

        // let TodasPessoasDoGennera = resp.data;
        const personService = new PersonService();
        // let TodasPessoasMigradas = await personService.BuscaTodasPessoasMigradas();
        let TodasPessoasMigradas = await personService.BuscarTodasPessoasMigradasPorQuery();

        //TodasPessoasMigradas = TodasPessoasMigradas.filter(h => h.name == 'MIKELLY LUANY DA SILVA LIMA');

        let PessoasVerificarHistorico = TodasPessoasMigradas;

        //PessoasVerificarHistorico = PessoasVerificarHistorico.filter(h => h.idPerson == 2529930);
        const enrollmentRecordService = new EnrollmentRecordService();
        let count = 1;
        let textError = '';
        for(let person of PessoasVerificarHistorico){
            try {
                console.log(`Processando ${count} de ${PessoasVerificarHistorico.length} DISPENSAS | Nome: ${person.name}`);
                log(`Processando ${count} de ${PessoasVerificarHistorico.length} DISPENSAS | Nome: ${person.name}`);
                count++;
                // if(count < 4565) continue;
                //log(person);
                let historicosModel = []
                let buscaHistorico = true;
                let buscaHistoricoTentativas = 0;
                while(buscaHistorico){
                    try {
                        historicosModel = await enrollmentRecordService.BuscarPeloIdStudent(person.id_student);
                        buscaHistorico = false;
                    } catch (err) {
                        buscaHistoricoTentativas++;
                        if(err.message == 'read ECONNRESET'){
                            console.log(`Nova Tentativa ${buscaHistoricoTentativas}.`);
                        }
                        if(buscaHistoricoTentativas >= 5){
                            buscaHistorico = false;
                            throw err;
                        }
                    }
                }
                if(!historicosModel.length) continue;
                
    
                let respHist = [];


                let historicosNoGennera = respHist.data || [];
                if(!historicosNoGennera.length) {
                    let buscaHistoricoGennbyName = true;
                    let buscaHistoricoGennbyNameTentativas = 0;
                    while(buscaHistoricoGennbyName){
                        try {
                            historicosNoGennera = await this.VerificaDemaisCadastroDePessoas(httpGenneraUsuario, person.name);
                            buscaHistoricoGennbyName = false;
                        } catch (err) {
                            buscaHistoricoGennbyNameTentativas++;
                            if(err.message == 'read ECONNRESET'){
                                console.log(`Nova Tentativa ${buscaHistoricoGennbyNameTentativas}.`);
                            }
                            if(buscaHistoricoGennbyNameTentativas >= 5){
                                buscaHistoricoGennbyName = false;
                                throw err;
                            }
                        }
                    }
                }
                // historicosNoGennera = historicosNoGennera.filter(h => h.institutionName == 'FIS');
                historicosNoGennera = historicosNoGennera.filter(h => !h.idEnrollment);
    
                
                for(let historico of historicosNoGennera){
                    try {
                        //Aqui pode ser um possível ponto de falha, estudar colocar expressão regular pra pegar somente números e testar com includes dentro do find
                        let numeroModulo = this.#PegarSomenteNumeros(historico.moduleName);
                        let historicoEncontrado = historicosModel.find(h => h.module.includes(numeroModulo));
                        if(!historicoEncontrado ) continue;
                        let idEnrollmentRecords = [];
                        historicosModel.forEach(e =>{
                            idEnrollmentRecords.push(e.id_enrollment_record);
                        });
                        const enrollmentRecordSubjectService = new EnrollmentRecordSubjectService();
                        let disciplinasHistoricoModel = await enrollmentRecordSubjectService.BuscarPeloIdsEnrollmentRecord(idEnrollmentRecords);
                        //disciplinasHistoricoModel = disciplinasHistoricoModel.filter(s=> s.dismissed);
                        for(let hist of disciplinasHistoricoModel){
                            hist.dataValues.subject = hist.dataValues.subject.toUpperCase();
                        }

                        if(!historico.idEnrollment){
                            let respDisciplinasHist = [];

                            let buscaHistoricoGennDispciplinas = true;
                            let buscaHistoricoGennDispciplinasTentativas = 0;
                            while(buscaHistoricoGennDispciplinas){
                                try {
                                    respDisciplinasHist = await httpGenneraUsuario.get(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects`);
                                    buscaHistoricoGennDispciplinas = false;
                                } catch (err) {
                                    buscaHistoricoGennDispciplinasTentativas++;
                                    if(err.message == 'read ECONNRESET'){
                                        console.log(`Nova Tentativa ${buscaHistoricoGennDispciplinasTentativas}.`);
                                    }
                                    if(buscaHistoricoGennDispciplinasTentativas >= 5){
                                        buscaHistoricoGennDispciplinas = false;
                                        throw err;
                                    }
                                }
                            }




                            let disciplinasNoHistorico = respDisciplinasHist.data || [];
                            //disciplinasNoHistorico = disciplinasNoHistorico.filter( d => d.dismissed);
                            let somatorioCargaHoraria = 0;
                            let isUpdateRegistro = false;
                            for(let disciplinaHist of disciplinasNoHistorico){
                                //somatorioCargaHoraria += disciplinaHist.workload;
                                try {
                                    let isUpdate = false;
                                    //também vai verificar se a disciplina é status cursando pra marcar como cancelada
                                    if(disciplinaHist.status == 'IN PROGRESS'){
                                        disciplinaHist.status = 'CANCELLED';
                                        disciplinaHist.idCancellationReason = 2738;
                                        isUpdate = true;
                                    }
                                    // disciplinaHist.attendance
                                    if(!disciplinaHist.attendance){
                                        disciplinaHist.attendance = 100;
                                        isUpdate = true;
                                    }
                                    
                                    if(disciplinasHistoricoModel.length){
                                        let disciplinaAux = disciplinaHist.subjectName + ' I';
                                        disciplinaAux = disciplinaAux.toUpperCase();
                                        if(disciplinaHist.subjectName == 'HISTOLOGIA'){
                                            console.log("achei debug")
                                        }
                                        
                                        //let disciplinasHistoricoModelEncontrada = disciplinasHistoricoModel.find(dm => dm.dataValues.subject == disciplinaHist.subjectName || dm.dataValues.name.toUpperCase() == disciplinaAux.toUpperCase());
                                        let disciplinasHistoricoModelEncontrada = disciplinasHistoricoModel.find(dm => dm.dataValues.subject == disciplinaHist.subjectName || dm.dataValues.name == disciplinaAux);

                                        if(disciplinasHistoricoModelEncontrada){
                                            const enrollmentRecordSubjectProfessorService = new EnrollmentRecordSubjectProfessorService();
                                            let disciplinasModel = await enrollmentRecordSubjectProfessorService.BuscarPeloIdRPA(disciplinasHistoricoModelEncontrada.id_enrollment_subject_record);
                                            if(disciplinasModel){
                                                let professor = {
                                                    "name": disciplinasModel.professor_name,
                                                    "academicTitle": disciplinasModel.academic_title || ''
                                                }
                                                if(disciplinaHist.professors){
                                                    if(disciplinaHist.professors.professors){
                                                        if(!disciplinaHist.professors.professors.length){
                                                            if(!professor.name){
                                                                disciplinaHist.professors.professors.push(professor);
                                                                isUpdate = true;
                                                            }
                                                            
                                                        } else if(disciplinaHist.professors.professors.length == 1){
                                                            let professorAux = disciplinaHist.professors.professors[0];
                                                            if(!professorAux.name){
                                                                disciplinaHist.professors['professors'] = [];
                                                                isUpdate = true;
                                                            } else{
                                                                if(!professor.name){
                                                                    disciplinaHist.professors['professors'] = [];
                                                                    isUpdate = true;
                                                                }
                                                            }
                                                        }
                                                    }
                                                } else{
                                                    disciplinaHist['professors'] = {};
                                                    disciplinaHist.professors['professors'] = [];
                                                    disciplinaHist.professors.professors.push(professor);
                                                    isUpdate = true;
                                                }
                                            } else{
                                                console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [0]`);
                                                log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [0]`);
                                            }
                                        } else{
                                            console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [1]`);
                                            log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [1]`);
                                        }
                                    } else{
                                        console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [2]`);
                                        log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [2]`);
                                    }
                                    if(isUpdate){
                                        let AtualizaHistoricoGennDispciplinas = true;
                                        let AtualizaHistoricoGennDispciplinasTentativas = 0;
                                        while(AtualizaHistoricoGennDispciplinas){
                                            try {
                                                await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects/${disciplinaHist.idEnrollmentSubjectRecord}`, disciplinaHist);
                                                AtualizaHistoricoGennDispciplinas = false;
                                            } catch (err) {
                                                AtualizaHistoricoGennDispciplinasTentativas++;
                                                if(err.message == 'read ECONNRESET'){
                                                    console.log(`Nova Tentativa ${AtualizaHistoricoGennDispciplinasTentativas}.`);
                                                }
                                                if(AtualizaHistoricoGennDispciplinasTentativas >= 5){
                                                    AtualizaHistoricoGennDispciplinas = false;
                                                    throw err;
                                                }
                                            }
                                        }
                                    }
                                } catch (err) {
                                    textError += `Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.id_student}) ${person.name}.\n`;
                                    console.log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.id_student}) ${person.name}.\n`);
                                    log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.id_student}) ${person.name}.\n`);
                                }
                            }
                            // if(historico.workload != somatorioCargaHoraria){
                            //     historico.workload = somatorioCargaHoraria;
                            //     isUpdateRegistro = true;
                            // }
                            // if(historico.status == 'IN PROGRESS'){
                            //     historico.status = 'APPROVED';
                            //     isUpdateRegistro = true;
                            // }
                            // if(isUpdateRegistro){
                            //     delete historico.subjects;
                            //     let AtualizaHistoricoGenn = true;
                            //     let AtualizaHistoricoGennTentativas = 0;
                            //     while(AtualizaHistoricoGenn){
                            //         try {
                            //             await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}`, historico);
                            //             AtualizaHistoricoGenn = false;
                            //         } catch (err) {
                            //             AtualizaHistoricoGennTentativas++;
                            //             if(err.message == 'read ECONNRESET'){
                            //                 console.log(`Nova Tentativa ${AtualizaHistoricoGennTentativas}.`);
                            //             }
                            //             if(AtualizaHistoricoGennTentativas >= 5){
                            //                 AtualizaHistoricoGenn = false;
                            //                 throw err;
                            //             }
                            //         }
                            //     }
                            // }
                            // historico.metadata.admission = historicoEncontrado.admission;
                        }
                    } catch (err) {
                        let message = err.message || '';
                        if(message == "Cannot read properties of null (reading 'length')"){
                            continue;
                        }
                        textError += `Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.id_student}) ${person.name}.\n`;
                        console.log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.id_student}) ${person.name}.`);
                        log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.id_student}) ${person.name}.`);
                    }
                }
            } catch (err) {
                textError += `\n\n ####ERRO na Pessoa (${person.id_student}) ${person.name} | ${err.message || err}.\n\n`;
                console.log(`####ERRO na Pessoa (${person.id_student}) ${person.name} | ${err.message || err}.`);
                log(`####ERRO na Pessoa (${person.id_student}) ${person.name} | ${err.message || err}.`);
            }
            
        }
        console.log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)
        log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)

    }

    #removeAcento(text) {       
        text = text.toLowerCase();                                                         
        text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'a');
        text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'e');
        text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'i');
        text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'o');
        text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'u');
        text = text.replace(new RegExp('[Ç]','gi'), 'c');
        return text;                 
    }

    async RPA_HotFixHistoricoDisciplina_EquivalenciaDisciplina(){
        const tokenAPI = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywiaWRJc3N1ZXJVc2VyIjoxMjgxOTk1NCwibW9kZSI6InByb2QiLCJpYXQiOjE3MDk0ODE3NzEsImlzcyI6Imh0dHBzOi8vYXBwcy5nZW5uZXJhLmNvbS5iciIsInN1YiI6InByb2pldG9AaW50ZWdyYXRlLmFwcC5iciJ9.mt83H7H03gGiEv9MvV6uelzSBxOwfDdpCmOJL6491aReJmff6_yFEydgmzDqYgnKsyTdz6Iph6Fw-s6EtcsRONuVDLlGDD6Wc7RS4vBM9KPH1B6FRvBb867cS7GQo1Q5saiB1rbc7GweC8cQBwPzg6G_RjUZiQ94SXJWa0-8UR8gi5NLP_Wu6jsNjDM8AV94qpgq9CkKMbpJeKggh4UdHwfl8c75QRYtZMzNoZZu6Zan6H1Srpi4nOSMF1yGaMt4N5qbJCISSxc97iHQ1Nww1x8Rtrx3EE0VGhJ1T_o-tUYvXFZRAgVo8Ir3OTueBDG04ScLKNFPTwTI8i3hlPvXw2wEypIh3PYWIgD_jVCN5459KqLE1rGfLMdlQ2TaSgrQn3thN5WpFEaREhRU1cC0auFPojAPAb_qWtufx7XNNI0SVq5qatMsSJgWoBVIGxqJcSER8BYcHCNYlxtIGIYlkqKOBWUVTQufQqE0O3YzBi9P4Qafis8Brg-KkqXulphmZL-Md0J-7tISVe4OsILc7qnC6Nd82_tOK8rBU_2UlI0JL1M3nae3iRYSN4PR5MACPkgSUIvtzPQ_PYsIY3YXmqnT1z6dXRhSY4QnlpaeBzzScLOokMTaXNVDW3oG1ziuHkvCy4pcXdMOu_GQR0mS68j5fXXdWr70B31UuPnsYRA`;
        const tokenUser = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJuYW1lIjoiTWFyY29zIEludGVncmF0ZSIsInVzZXJuYW1lIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIiwiaGFzaCI6ImRiUldFWHZUTEtxa3FGNjlNaHcxSXhjYVNTSFVHbXVxQnJFcVFlVTgiLCJpZFVzZXIiOjEzOTc5NTcxLCJpZENvdW50cnkiOjMyLCJpZExhbmd1YWdlIjoyLCJsYW5ndWFnZUNvZGUiOiJwdCIsImlkVGltZXpvbmUiOjE5NywiaWRDdXN0b21lciI6MTc3NywibW9kZSI6InByb2QiLCJpYXQiOjE3MTk0NTE0NTIsImV4cCI6MTcxOTg4MzQ1MiwiaXNzIjoiaHR0cHM6Ly9hcHBzLmdlbm5lcmEuY29tLmJyIiwic3ViIjoicHJvamV0b0BpbnRlZ3JhdGUuYXBwLmJyIn0.zgsLQUslHoxIHEr5oDkuW3w9w8_qQhkFz5Zh_xrsPmajOIzl2punDliXKRD-h80Iuk2rFkBDo2X_pBBM7SqzvK7rc0HymlPcUg1UjlerB63AtEz_SbcSqx-C-db3wfLemWwJPao__OLlFH47H8CFtvQra8tPmw4WnEulMYYp1FG-eGkqqSJi1K6JnVaOeZgQMb7F72rAQRVADbTyi7ZmOhlxzhoQy2zGZ4VYqXzJuLz2QAXiCijnlUgG-xSYGbSu8WQXqcp1aiLNRvG8JxnnbT4-FIdlX-ep8xhvz8JRtM1YQICyeaTNjmmYrLH_AL0573D34efOaORpuFQGLrzKolvsmhNIb8LgfmN-KT9bE9SirW98UObPT21ikWWWy19D2miUIqoxBlH8aQPLw7dpGNhwqVfSFtbbJpHttyfNLWjTPx7QST4ytUqCON1LQ9Q45PY9JLStvfb7h0lVGnWiQHpuzFMn4jCjX3BgNBZB5T3IhtTwDqM5QsB9Jr5LvYxjVV3posE-hMAl7WxDbefvhX46wa8xGhIQDwhPhf9XUvhNDTA9lOcg2uSYabIIHvN6CvjT8-EXd0rCd4BpXnKZCTACHz_ynuMiv7kqhkuZ2VX9oGnOolJV430j1UALx-gmeQJyabOSw6G09YOCdaLdoB8osCkxrf1PFVXXyZ35CRs`;

        const httpGenneraAPI = axios.create({
            baseURL: 'https://api2.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenAPI
            }
        });

        const httpGenneraUsuario = axios.create({
            baseURL: 'https://enrollment.gennera.com.br/institutions/930',
            timeout: 150000,
            headers:{
                'x-access-token': tokenUser
            }
        });

        let respCursos = await httpGenneraAPI.get('/courses');
        let CursosGennera = respCursos.data || [];
        // CursosGennera = CursosGennera.filter(c => c.name == 'ODONTOLOGIA');
        let i = 0;
        let allDisciplinasCursos = [];
        for(let curso of CursosGennera){
            console.log(`Processando Curso ${i} de ${CursosGennera.length}`);
            i++;
            curso['curriculums'] = [];
            let respCurriculo = [];
            let curriculo = true;
            let curriculoCount = 0;
            while(curriculo){
                try {
                    respCurriculo = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums`);
                    curriculo = false;
                    curso.curriculums = respCurriculo.data || [];
                    let x =1;
                    for(let curriculo of curso.curriculums){
                        console.log(`Processando Curso ${i}. Currículo ${x} de ${curso.curriculums.length}`);
                        x++;
                        curriculo['modules'] = [];
                        curriculo['subjects'] = [];

                        let modulos = true;
                        let modulosCount = 0;
                        while(modulos){
                            try {
                                let respModules = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums/${curriculo.idCurriculum}/modules`);
                                curriculo.modules = respModules.data || [];
                                modulos = false;
                                let y=1;
                                for(let module of curriculo.modules){
                                    console.log(`Processando Curso ${i}. Currículo ${x}. Múdulo ${y} de ${curriculo.modules.length}`);
                                    y++;
                                    // module['subjects'] = [];
                                    let disciplinas = true;
                                    let disciplinasCount = 0;
                                    while(disciplinas){
                                        try {
                                            let respSubjects = await httpGenneraAPI.get(`/courses/${curso.idCourse}/curriculums/${curriculo.idCurriculum}/modules/${module.idModule}/subjects`);
                                            let arr = respSubjects.data || [];
                                            curriculo.subjects = curriculo.subjects.concat(arr);
                                            allDisciplinasCursos = allDisciplinasCursos.concat(arr);
                                            disciplinas = false
                                        } catch (err) {
                                            disciplinasCount++;
                                            if(err.message == 'read ECONNRESET'){
                                                console.log(`Nova Tentativa ${disciplinasCount}.`);
                                            }
                                            if(disciplinasCount >= 5){
                                                disciplinas = false;
                                                throw err;
                                            }
                                        }
                                    }

                                }
                            } catch (err) {
                                modulosCount++;
                                if(err.message == 'read ECONNRESET'){
                                    console.log(`Nova Tentativa ${modulosCount}.`);
                                }
                                if(modulosCount >= 5){
                                    modulos = false;
                                    throw err;
                                }
                            }
                        }
                    }
                } catch (error) {
                    curriculoCount++;
                    if(error.message == 'read ECONNRESET'){
                        console.log(`Nova Tentativa ${curriculoCount}.`);
                    }
                    if(curriculoCount >= 5){
                        curriculo = false;
                        throw error;
                    }
                }
            }
        }

        for(let dis of allDisciplinasCursos){
            dis.name = this.#removeAcento(dis.name);
            dis.name = dis.name.replaceAll(' ', '');
            dis.name = dis.name.toUpperCase();
        }

        let objCsv = [];
        // let TodasPessoasDoGennera = resp.data;
        const personService = new PersonService();
        let TodasPessoasMigradas = await personService.BuscaTodasPessoasMigradas();
        //let TodasPessoasMigradas = await personService.BuscarTodasPessoasMigradasPorQuery();

        //TodasPessoasMigradas = TodasPessoasMigradas.filter(h => h.name == 'KAROLAYNE CAVALCANTI FERREIRA');

        let PessoasVerificarHistorico = TodasPessoasMigradas;

        //PessoasVerificarHistorico = PessoasVerificarHistorico.filter(h => h.idPerson == 2529930);
        const enrollmentRecordService = new EnrollmentRecordService();
        let count = 1;
        let textError = '';
        for(let person of PessoasVerificarHistorico){
            try {
                console.log(`Processando ${count} de ${PessoasVerificarHistorico.length} Equivalencias | Nome: ${person.name}`);
                log(`Processando ${count} de ${PessoasVerificarHistorico.length} Equivalencias | Nome: ${person.name}`);
                count++;
                // if(count < 4565) continue;
                //log(person);
                let historicosModel = []
                let buscaHistorico = true;
                let buscaHistoricoTentativas = 0;
                while(buscaHistorico){
                    try {
                        historicosModel = await enrollmentRecordService.BuscarPeloIdStudent(person.id_student);
                        buscaHistorico = false;
                    } catch (err) {
                        buscaHistoricoTentativas++;
                        if(err.message == 'read ECONNRESET'){
                            console.log(`Nova Tentativa ${buscaHistoricoTentativas}.`);
                        }
                        if(buscaHistoricoTentativas >= 5){
                            buscaHistorico = false;
                            throw err;
                        }
                    }
                }
                if(!historicosModel.length) continue;
                
    
                let respHist = [];


                let historicosNoGennera = respHist.data || [];
                if(!historicosNoGennera.length) {
                    let buscaHistoricoGennbyName = true;
                    let buscaHistoricoGennbyNameTentativas = 0;
                    while(buscaHistoricoGennbyName){
                        try {
                            historicosNoGennera = await this.VerificaDemaisCadastroDePessoas(httpGenneraUsuario, person.name);
                            buscaHistoricoGennbyName = false;
                        } catch (err) {
                            buscaHistoricoGennbyNameTentativas++;
                            if(err.message == 'read ECONNRESET'){
                                console.log(`Nova Tentativa ${buscaHistoricoGennbyNameTentativas}.`);
                            }
                            if(buscaHistoricoGennbyNameTentativas >= 5){
                                buscaHistoricoGennbyName = false;
                                throw err;
                            }
                        }
                    }
                }
                // historicosNoGennera = historicosNoGennera.filter(h => h.institutionName == 'FIS');
                historicosNoGennera = historicosNoGennera.filter(h => !h.idEnrollment);
    
                
                for(let historico of historicosNoGennera){
                    try {
                        //Aqui pode ser um possível ponto de falha, estudar colocar expressão regular pra pegar somente números e testar com includes dentro do find
                        let numeroModulo = this.#PegarSomenteNumeros(historico.moduleName);
                        let historicoEncontrado = historicosModel.find(h => h.module.includes(numeroModulo));
                        if(!historicoEncontrado ) continue;
                        let idEnrollmentRecords = [];
                        historicosModel.forEach(e =>{
                            idEnrollmentRecords.push(e.id_enrollment_record);
                        });
                        const enrollmentRecordSubjectService = new EnrollmentRecordSubjectService();
                        let disciplinasHistoricoModel = await enrollmentRecordSubjectService.BuscarPeloIdsEnrollmentRecord(idEnrollmentRecords);
                        //disciplinasHistoricoModel = disciplinasHistoricoModel.filter(s=> s.dismissed);
                        for(let hist of disciplinasHistoricoModel){
                            hist.dataValues.subject = hist.dataValues.subject.toUpperCase();
                        }

                        if(!historico.idEnrollment){
                            let respDisciplinasHist = [];

                            let buscaHistoricoGennDispciplinas = true;
                            let buscaHistoricoGennDispciplinasTentativas = 0;
                            while(buscaHistoricoGennDispciplinas){
                                try {
                                    respDisciplinasHist = await httpGenneraUsuario.get(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects`);
                                    buscaHistoricoGennDispciplinas = false;
                                } catch (err) {
                                    buscaHistoricoGennDispciplinasTentativas++;
                                    if(err.message == 'read ECONNRESET'){
                                        console.log(`Nova Tentativa ${buscaHistoricoGennDispciplinasTentativas}.`);
                                    }
                                    if(buscaHistoricoGennDispciplinasTentativas >= 5){
                                        buscaHistoricoGennDispciplinas = false;
                                        throw err;
                                    }
                                }
                            }




                            let disciplinasNoHistorico = respDisciplinasHist.data || [];
                            //disciplinasNoHistorico = disciplinasNoHistorico.filter( d => d.dismissed);
                            let somatorioCargaHoraria = 0;
                            let isUpdateRegistro = false;
                            for(let disciplinaHist of disciplinasNoHistorico){
                                //somatorioCargaHoraria += disciplinaHist.workload;
                                try {
                                    let isUpdate = false;
                                    // Aqui vai buscar o curso e etc pra fazer a equivalencia;
                                    if(!disciplinaHist.idSubject){
                                        let obj = {};
                                        obj['Aluno'] = person.name;
                                        obj['Curso'] = historico.courseName;
                                        obj['Curriculo'] = historico.curriculumName;
                                        obj['Ano'] = historico.calendarName;
                                        obj['Periodo'] = historico.moduleName;
                                        obj['Disciplina'] = disciplinaHist.subjectName;
                                        obj['Link'] = `https://enrollment.gennera.com.br/admin/#!/institutions/930/enrollmentRecords/${historico.idEnrollmentRecord}`;
                                        objCsv.push(obj);
                                        //     // idSubject
                                        /*let cursoEncontrado = CursosGennera.find(c => c.name == historico.courseName);
                                        if(cursoEncontrado){
                                            let curriculoEncontrado = cursoEncontrado.curriculums.find( c => c.name == historico.curriculumName);
                                            if(curriculoEncontrado){
                                                let disciplinaAux = disciplinaHist.subjectName + ' I';
                                                disciplinaAux = this.#removeAcento(disciplinaAux);
                                                disciplinaAux = disciplinaAux.replaceAll(' ', '');
                                                disciplinaAux = disciplinaAux.toUpperCase();
                                                let disciplinasCurriculoEncontrado = [];
                                                for(let dis of curriculoEncontrado.subjects){
                                                    let disAux = {...dis}
                                                    disAux.name = this.#removeAcento(disAux.name);
                                                    disAux.name = disAux.name.replaceAll(' ', '');
                                                    disAux.name = disAux.name.toUpperCase();
                                                    disciplinasCurriculoEncontrado.push(disAux);
                                                }
                                                let nomeAuxDisciplina = `${disciplinaHist.subjectName}`;
                                                nomeAuxDisciplina = this.#removeAcento(nomeAuxDisciplina);
                                                nomeAuxDisciplina = nomeAuxDisciplina.replaceAll(' ', '');
                                                nomeAuxDisciplina = nomeAuxDisciplina.toUpperCase();
                                                let nomeAuxDisciplina2 = nomeAuxDisciplina.substring(0, nomeAuxDisciplina.length -1)

                                                let disciplinaEncontrada = disciplinasCurriculoEncontrado.find(s => s.name == nomeAuxDisciplina);
                                                if(!disciplinaEncontrada) disciplinaEncontrada = disciplinasCurriculoEncontrado.find(s => s.name == nomeAuxDisciplina2);
                                                if(!disciplinaEncontrada) disciplinaEncontrada = disciplinasCurriculoEncontrado.find(s => s.name == disciplinaAux);
                                                if(!disciplinaEncontrada){
                                                    disciplinaEncontrada = allDisciplinasCursos.find(s => s.name == nomeAuxDisciplina);
                                                    if(!disciplinaEncontrada) allDisciplinasCursos.find(s => s.name == nomeAuxDisciplina2);
                                                    if(!disciplinaEncontrada) allDisciplinasCursos.find(s => s.name == disciplinaAux);
                                                }
                                                if(disciplinaEncontrada){
                                                    disciplinaHist.idSubject = disciplinaEncontrada.idSubject;
                                                    isUpdate = true;
                                                }
                                                // let numeroPeriodo = historico.moduleName.replace(/[^0-9]/g,'');
                                                // if(numeroPeriodo){
                                                    //     let moduloEncontrado = curriculoEncontrado.modules.find(m => m.name.includes(`${numeroPeriodo}º`) || m.name.includes(`${numeroPeriodo}°`) || m.name.includes(`${numeroPeriodo}º`))
                                                //     if(moduloEncontrado){
                                                        
                                                //     }
                                                // }
                                            }
                                        }*/
                                    }
                                    //também vai verificar se a disciplina é status cursando pra marcar como cancelada
                                    /*if(disciplinaHist.status == 'IN PROGRESS'){
                                        disciplinaHist.status = 'CANCELLED';
                                        disciplinaHist.idCancellationReason = 2738;
                                        isUpdate = true;
                                    }
                                    // disciplinaHist.attendance
                                    if(!disciplinaHist.attendance){
                                        disciplinaHist.attendance = 100;
                                        isUpdate = true;
                                    }
                                    
                                    /*if(disciplinasHistoricoModel.length){
                                        let disciplinaAux = disciplinaHist.subjectName + ' I';
                                        disciplinaAux = disciplinaAux.toUpperCase();
                                        if(disciplinaHist.subjectName == 'HISTOLOGIA'){
                                            console.log("achei debug")
                                        }
                                        
                                        //let disciplinasHistoricoModelEncontrada = disciplinasHistoricoModel.find(dm => dm.dataValues.subject == disciplinaHist.subjectName || dm.dataValues.name.toUpperCase() == disciplinaAux.toUpperCase());
                                        let disciplinasHistoricoModelEncontrada = disciplinasHistoricoModel.find(dm => dm.dataValues.subject == disciplinaHist.subjectName || dm.dataValues.name == disciplinaAux);

                                        if(disciplinasHistoricoModelEncontrada){
                                            const enrollmentRecordSubjectProfessorService = new EnrollmentRecordSubjectProfessorService();
                                            let disciplinasModel = await enrollmentRecordSubjectProfessorService.BuscarPeloIdRPA(disciplinasHistoricoModelEncontrada.id_enrollment_subject_record);
                                            if(disciplinasModel){
                                                let professor = {
                                                    "name": disciplinasModel.professor_name,
                                                    "academicTitle": disciplinasModel.academic_title || ''
                                                }
                                                if(disciplinaHist.professors){
                                                    if(disciplinaHist.professors.professors){
                                                        if(!disciplinaHist.professors.professors.length){
                                                            if(!professor.name){
                                                                disciplinaHist.professors.professors.push(professor);
                                                                isUpdate = true;
                                                            }
                                                            
                                                        } else if(disciplinaHist.professors.professors.length == 1){
                                                            let professorAux = disciplinaHist.professors.professors[0];
                                                            if(!professorAux.name){
                                                                disciplinaHist.professors['professors'] = [];
                                                                isUpdate = true;
                                                            } else{
                                                                if(!professor.name){
                                                                    disciplinaHist.professors['professors'] = [];
                                                                    isUpdate = true;
                                                                }
                                                            }
                                                        }
                                                    }
                                                } else{
                                                    disciplinaHist['professors'] = {};
                                                    disciplinaHist.professors['professors'] = [];
                                                    disciplinaHist.professors.professors.push(professor);
                                                    isUpdate = true;
                                                }
                                            } else{
                                                console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [0]`);
                                                log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [0]`);
                                            }
                                        } else{
                                            console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [1]`);
                                            log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [1]`);
                                        }
                                    } else{
                                        console.log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [2]`);
                                        log(`NÃO ENCONTRADO DISCIPLINA NO HISTÓRICO PARA ESTE ALUNO [2]`);
                                    }
                                    if(isUpdate){
                                        let AtualizaHistoricoGennDispciplinas = true;
                                        let AtualizaHistoricoGennDispciplinasTentativas = 0;
                                        while(AtualizaHistoricoGennDispciplinas){
                                            try {
                                                await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}/subjects/${disciplinaHist.idEnrollmentSubjectRecord}`, disciplinaHist);
                                                AtualizaHistoricoGennDispciplinas = false;
                                            } catch (err) {
                                                AtualizaHistoricoGennDispciplinasTentativas++;
                                                if(err.message == 'read ECONNRESET'){
                                                    console.log(`Nova Tentativa ${AtualizaHistoricoGennDispciplinasTentativas}.`);
                                                }
                                                if(AtualizaHistoricoGennDispciplinasTentativas >= 5){
                                                    AtualizaHistoricoGennDispciplinas = false;
                                                    throw err;
                                                }
                                            }
                                        }
                                    }*/
                                } catch (err) {
                                    textError += `Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.id_student}) ${person.name}.\n`;
                                    console.log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.id_student}) ${person.name}.\n`);
                                    log(`Erro ao processar atualização do Status da disciplina ${disciplinaHist.subjectName} no módulo ${historico.moduleName} (${historico.idEnrollmentRecord}) da Pessoa (${person.id_student}) ${person.name}.\n`);
                                }
                            }
                            // if(historico.workload != somatorioCargaHoraria){
                            //     historico.workload = somatorioCargaHoraria;
                            //     isUpdateRegistro = true;
                            // }
                            // if(historico.status == 'IN PROGRESS'){
                            //     historico.status = 'APPROVED';
                            //     isUpdateRegistro = true;
                            // }
                            // if(isUpdateRegistro){
                            //     delete historico.subjects;
                            //     let AtualizaHistoricoGenn = true;
                            //     let AtualizaHistoricoGennTentativas = 0;
                            //     while(AtualizaHistoricoGenn){
                            //         try {
                            //             await httpGenneraUsuario.put(`enrollmentRecords/${historico.idEnrollmentRecord}`, historico);
                            //             AtualizaHistoricoGenn = false;
                            //         } catch (err) {
                            //             AtualizaHistoricoGennTentativas++;
                            //             if(err.message == 'read ECONNRESET'){
                            //                 console.log(`Nova Tentativa ${AtualizaHistoricoGennTentativas}.`);
                            //             }
                            //             if(AtualizaHistoricoGennTentativas >= 5){
                            //                 AtualizaHistoricoGenn = false;
                            //                 throw err;
                            //             }
                            //         }
                            //     }
                            // }
                            // historico.metadata.admission = historicoEncontrado.admission;
                        }
                    } catch (err) {
                        let message = err.message || '';
                        if(message == "Cannot read properties of null (reading 'length')"){
                            continue;
                        }
                        textError += `Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.id_student}) ${person.name}.\n`;
                        console.log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.id_student}) ${person.name}.`);
                        log(`Erro ao processar Histórico ${historico.idEnrollmentRecord} da Pessoa (${person.id_student}) ${person.name}.`);
                    }
                }
            } catch (err) {
                textError += `\n\n ####ERRO na Pessoa (${person.id_student}) ${person.name} | ${err.message || err}.\n\n`;
                console.log(`####ERRO na Pessoa (${person.id_student}) ${person.name} | ${err.message || err}.`);
                log(`####ERRO na Pessoa (${person.id_student}) ${person.name} | ${err.message || err}.`);
            }
            
        }
        const layoutService = new LayoutService(`Disciplinas_sem_vinculosSistemicos_`);
        await layoutService.CreateFileManual(objCsv);
        console.log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)
        log(`############ ERRO AO PROCESSAR A RELAÇÃO ABAIXO: \n\n ${textError}`)

    }
}


module.exports = HistoricoService;