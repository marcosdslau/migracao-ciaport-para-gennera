require('dotenv').config();
const LayoutService = require('../src/services/LayoutService');
const CurriculumOfferService = require('../src/services/CurriculumOfferService');
const CurriculumOfferClassesService = require('../src/services/CurriculumOfferClassesService');
const CurriculumOfferClassesSubjectService = require('../src/services/CurriculumOfferClassesSubjectService');
const SubjectService = require('../src/services/SubjectService');
const jsonDeParaIdCurriculum = require('../src/tipos/de-para-idCurriculum');
const jsonDeParaStatusMatricula = require('../src/tipos/de-para-status-de-matricula');
const dePara = require('../src/tipos/de-para-curso-modulo');
const connectionSQLServer = require('../database/database-migracao');

/**
 * Curso/curriculo/modulo/disciplina migram a estrutura inteira (2023 a 2026),
 * mas oferta, turma e disciplina-da-turma so interessam do ano corrente.
 * Trocar em .env (ANO_LETIVO_MIGRACAO) para migrar outro ano.
 */
const ANO_LETIVO_MIGRACAO = process.env.ANO_LETIVO_MIGRACAO || '2026';

/**
 * As colunas do curso vem com alias proprio porque as queries fazem "Turmas".*,
 * e "Turmas" tambem tem "Nome", "CursoID" e "AnoLetivo".
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

class OfertaService{

    async ProcessarOfertas(){
        const curriculumOfferService = new CurriculumOfferService();
        if(process.env.OFERTAS == 1){ /// .env
            console.log('INICIO PROCESSANDO CURRICULO_OFFERS');
            const ofertasModel = await connectionSQLServer.query(`
                SELECT
                    "GradeTurmas"."GradeID"
                    , "Turmas"."CursoID"
                    , "GradeCursos"."GradeCursoId"
                    , "GradeCursos"."AnoLetivo" AS "AnoLetivoCurriculo"
                    , "Cursos"."Nome" AS "NomeCurso"
                    , "Cursos"."Sigla" || '-' || "Cursos"."CursoID" AS "SiglaCurso"
                    , "Cursos"."SerieID"
                    , "TiposCurso"."Descricao" AS "TipoCurso"
                    ,"Turmas"."Situacao"
                    , (CASE
                        WHEN "Turmas"."TurmaID" IN (101,111,92) THEN '70'
                        WHEN "Turmas"."TurmaID" IN (109, 110, 112) THEN '71'
                        ELSE '73' END
                    )AS "CalendarID"
                    ,"Turmas".*
                FROM "Turmas"
                INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID" AND "GradeCursos"."AnoLetivo" = "Turmas"."AnoLetivo"
                INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
                LEFT JOIN "TiposCurso" ON "TiposCurso"."TipoCursoID" = "Cursos"."TipoCursoID"
                where "Turmas"."AnoLetivo" = ${ANO_LETIVO_MIGRACAO}
            `);
            const ofertas = ofertasModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let oferta of ofertas) {
                    console.log(`Processando ${count} de ${ofertas.length} `);
                    count++;
                    const {GradeCursoId, CalendarID, AnoLetivoCurriculo} = oferta;
                    const resolvido = ResolverCursoDaTurma(oferta);
                    let idCurriculum = dePara.MontarIdCurriculo(resolvido, AnoLetivoCurriculo, GradeCursoId);
                    if(idCurriculum) await curriculumOfferService.Registra(idCurriculum, CalendarID, idCurriculum);
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO CURRICULO_OFFERS')
        }
        if(process.env.CSVOFERTAS == 1){
            console.log('INICIO GERANDO CSV CURRICULO_OFFERS');
            let coursesGennera = await curriculumOfferService.BuscaTodos();
            const layoutService = new LayoutService('Ofertas-PréMatricula');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV CURRICULO_OFFERS');
        }
    }

    async ProcessarTurmasDaOfertas(){
        const curriculumOfferClassesService = new CurriculumOfferClassesService();
        if(process.env.TURMAS == 1){ /// .env
            console.log('INICIO PROCESSANDO TURMAS_DA_OFERTA');
            const ofertasModel = await connectionSQLServer.query(`
                SELECT
                    "GradeTurmas"."GradeID"
                    , "Turmas"."CursoID"
                    , "GradeCursos"."GradeCursoId"
                    , "GradeCursos"."AnoLetivo" AS "AnoLetivoCurriculo"
                    , "Cursos"."Nome" AS "NomeCurso"
                    , "Cursos"."Sigla" || '-' || "Cursos"."CursoID" AS "SiglaCurso"
                    , "Cursos"."SerieID"
                    , "TiposCurso"."Descricao" AS "TipoCurso"
                    ,"Turmas".*
                FROM "Turmas"
                INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID" AND "GradeCursos"."AnoLetivo" = "Turmas"."AnoLetivo"
                INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
                LEFT JOIN "TiposCurso" ON "TiposCurso"."TipoCursoID" = "Cursos"."TipoCursoID"
                where "Turmas"."AnoLetivo" = ${ANO_LETIVO_MIGRACAO}
                `);
            const ofertas = ofertasModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let oferta of ofertas) {
                    console.log(`Processando ${count} de ${ofertas.length} `);
                    const {GradeCursoId, Nome, TurmaID, AnoLetivoCurriculo } = oferta;
                    count++;
                    const resolvido = ResolverCursoDaTurma(oferta);
                    let idCurriculum = dePara.MontarIdCurriculo(resolvido, AnoLetivoCurriculo, GradeCursoId);
                    let idModule = dePara.MontarIdModulo(resolvido, idCurriculum);
                    // uma linha por turma: o id_class era o proprio curriculo, o que
                    // colapsava todas as turmas de um curriculo numa unica pelo upsert
                    let idClass = `${TurmaID}`;
                    if(idModule) await curriculumOfferClassesService.Registra(idClass, idCurriculum, idModule, Nome, '', '', '', '', '');
                }

            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO TURMAS_DA_OFERTA')
        }

        if(process.env.TURMAS_NTF == 1){ /// .env
            console.log('INICIO PROCESSANDO TURMAS_NTF');
            const turmas = require('./arrTurmasNaoEncontradas')
            const ofertasModel = await connectionSQLServer.query(`
                SELECT --TOP 10000
                    TURMAS.PLT_COD
                    , TURMAS.TURMA
                    , TURMAS.ANOGRADE
                    , '1' +TURMAS.CURSO AS CURSO
                    , CASE WHEN CURSO.NOME IN ('DIREITO', 'CIÊNCIAS CONTÁBEIS') THEN CURSO.NOME + ' ' +CURSO.CURSO ELSE CURSO.NOME END AS NOME
                    , TURMAS.SERIE
                FROM TURMASS AS TURMAS
                INNER JOIN DISCIPL AS CURRICULO ON CURRICULO.ANOLETIVO = TURMAS.ANOGRADE
                INNER JOIN CURSGEN AS CURSO ON CURSO.CURSO = TURMAS.CURSO
                WHERE 
                    TURMAS.PLT_COD = 73
                GROUP BY 
                    TURMAS.PLT_COD
                    , TURMAS.ANOGRADE
                    , TURMAS.CURSO
                    , TURMAS.SERIE
                    , TURMAS.TURMA
                    , (CASE WHEN CURSO.NOME IN ('DIREITO', 'CIÊNCIAS CONTÁBEIS') THEN CURSO.NOME + ' ' +CURSO.CURSO ELSE CURSO.NOME END) 
                ORDER BY 
                    TURMAS.ANOGRADE
                    , TURMAS.TURMA
                ASC
                `);
            const ofertas = ofertasModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                const connection = require('../database/database');
                for (let oferta of turmas) {
                    console.log(`Processando ${count} de ${turmas.length} `);
                    //const {TURMA, ANOGRADE, CURSO, SERIE, NOME } = oferta;
                    count++;
                    let found = ofertas.find(o => o.NOME == oferta.course && o.ANOGRADE == oferta.curriculum);
                    if(found){

                        let idCurriculum = `${found.CURSO}${found.ANOGRADE.replaceAll('.', '')}`;
                        idCurriculum = idCurriculum.replaceAll('-', '');
                        idCurriculum = idCurriculum.replaceAll('/', '');
                        let serie = '';
                        let moduleModels = await connection.query(`
                            SELECT *
	                        FROM public.tb_modules where "id_curriculum" = '${idCurriculum}' and "name" = '${oferta.module}'
                        `)
                        let modulo = moduleModels[0];
                        if(modulo.length) modulo = modulo[0];
                        else continue;

                        serie = modulo.index;

                        let idModule = `${idCurriculum}${serie}`;
                        if(idModule) await curriculumOfferClassesService.Registra(`999${idModule}`, idCurriculum, idModule, oferta.class, '', '', '', '', '[turmasx]');
                    }
                }

            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO TURMAS_NTF')
        }

        if(process.env.CSVTURMAS == 1){
            console.log('INICIO GERANDO CSV TURMAS_DA_OFERTA');
            let coursesGennera = await curriculumOfferClassesService.BuscaTodos();
            const layoutService = new LayoutService('Ofertas_Turma_Pré-matricula');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV TURMAS_DA_OFERTA');
        }

        if(process.env.CSVTURMASBYSELECT == 1){
            console.log('INICIO GERANDO CSV TURMAS_DA_OFERTA_BY_SELECT');
            const connection = require('../database/database');
            let turmasOfertasModel = await connection.query(`
                SELECT "id", "id_class", "id_curriculum_offer", "id_module", "name", "start_date", "end_date", "shift", "inep_code", "physical_location"
	FROM public.tb_curriculum_offers_classes where "physical_location" = '[turmasx]'
                `)
                const turmasOfertas = turmasOfertasModel[0];

            const layoutService = new LayoutService('Ofertas_Turma_Fix');
            await layoutService.CreateFileManual(turmasOfertas);
            console.log('FIM GERANDO CSV TURMAS_DA_OFERTA_BY_SELECT');
        }
    }

    async ProcessarDisciplinasDasTurmasOfertadas(){
        const curriculumOfferClassesService = new CurriculumOfferClassesSubjectService();
        const subjectService = new SubjectService();
        if(process.env.OFFER_DISCIPLINAS == 1){ /// .env
            console.log('INICIO PROCESSANDO TURMAS_DA_OFERTA');
            const ofertasModel = await connectionSQLServer.query(`
                SELECT
                    "GradeTurmas"."GradeID"
                    , "Turmas"."CursoID"::text || "GradeCursos"."GradeCursoId"::text || "GradeDisciplinas"."DisciplinaID"::text AS "DisciplinaID"
                    , "Turmas"."CursoID"
                    , "GradeCursos"."GradeCursoId"
                    , "GradeCursos"."AnoLetivo" AS "AnoLetivoCurriculo"
                    , "Cursos"."Nome" AS "NomeCurso"
                    , "Cursos"."Sigla" || '-' || "Cursos"."CursoID" AS "SiglaCurso"
                    , "Cursos"."SerieID"
                    , "TiposCurso"."Descricao" AS "TipoCurso"
                    ,"Turmas".*
                FROM "Turmas"
                INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID" AND "GradeCursos"."AnoLetivo" = "Turmas"."AnoLetivo"
                INNER JOIN "GradeDisciplinas" ON "GradeDisciplinas"."GradeID" = "GradeTurmas"."GradeID"
                INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
                LEFT JOIN "TiposCurso" ON "TiposCurso"."TipoCursoID" = "Cursos"."TipoCursoID"
                where "Turmas"."AnoLetivo" = ${ANO_LETIVO_MIGRACAO}
                `);
            const ofertas = ofertasModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let oferta of ofertas) {
                    console.log(`Processando ${count} de ${ofertas.length} `);
                    const {DisciplinaID, TurmaID } = oferta;
                    count++;
                    let idClass = `${TurmaID}`;
                    let idSubject = DisciplinaID || null;
                    /**
                     * O upsert de CurriculumOfferClassesSubjectService usa o
                     * id_subject_offer como chave. Como o id_class agora e a turma,
                     * a mesma disciplina aparece em varias turmas do mesmo modulo --
                     * a chave precisa ser turma + disciplina para nao sobrescrever.
                     */
                    let idSubjectOffer = `${idClass}${idSubject}`;
                    if(idSubject) await curriculumOfferClassesService.Registra(idSubjectOffer, idClass, idSubject, '', '', '');

                }

            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO TURMAS_DA_OFERTA')
        }
        if(process.env.CSVOFFER_DISCIPLINAS == 1){
            console.log('INICIO GERANDO CSV TURMAS_DA_OFERTA');
            let coursesGennera = await curriculumOfferClassesService.BuscaTodos();
            const layoutService = new LayoutService('Ofertas_Turmas_Disciplinas_Pré-matricula');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV TURMAS_DA_OFERTA');
        }

    }
}


module.exports = OfertaService;