require('dotenv').config();
const LayoutService = require('../src/services/LayoutService');
const CourseService = require('../src/services/CourseService');
const CurriculoService = require('../src/services/CurriculoService');
const ModuleService = require('../src/services/ModuleService');
const SubjectService = require('../src/services/SubjectService');
const TeachingPlanService = require('../src/services/TeachingPlanService');
const SubjectRepository = require('../src/repository/SubjectRepository');
const jsonDeParaIdCurriculum = require('../src/tipos/de-para-idCurriculum');
const jsonDeParaIdSubject = require('../src/tipos/de-para-idSubject');
const dePara = require('../src/tipos/de-para-curso-modulo');
const connectionSQLServer = require('../database/database-migracao');
const connectionPostgresServer = require('../database/database');

/**
 * Converte a carga horaria do Sponte ("HH:MM") em horas inteiras.
 * Retorna valido=false quando o campo esta nulo/vazio/fora do formato,
 * para que o registro continue subindo e seja apontado no relatorio final.
 */
function ParseCargaHoraria(cargaHoraria){
    if(cargaHoraria === null || cargaHoraria === undefined || `${cargaHoraria}`.trim() === '') return { horas: 0, valido: false };
    let [hora] = `${cargaHoraria}`.split(':');
    hora = parseInt(hora);
    if(isNaN(hora)) return { horas: 0, valido: false };
    return { horas: hora, valido: true };
}

function ImprimirRelatorioCargaHoraria(titulo, arrPendencias){
    if(!arrPendencias.length) return;
    console.log(`\n[ATENCAO] ${titulo}: ${arrPendencias.length} disciplina(s) sem carga horaria valida no Sponte (contabilizadas como 0h):`);
    console.table(arrPendencias);
    console.log('');
}

class CursoService{

    async ProcessarCursos(){
        const courseServico = new CourseService();
        if(process.env.CURSOS == 1){ /// .env
            console.log('INICIO PROCESSANDO CURSOS');
            const cursosModel = await connectionSQLServer.query(`
                SELECT 
                    "Curso"."CursoID"
                    , "Curso"."Nome"
                    , "Funcionarios"."Nome" AS "CoordenadorCurso"
                    , "TiposCurso"."Descricao" AS "TipoCurso"
                    , "Curso"."Etapas"
                    , "Curso"."NumeroVagas"
                    , "Curso"."Sigla" || '-' || "Curso"."CursoID" AS "Sigla"
                    , "Curso"."Requisitos"
                    , "Curso"."EixoCurso"
                    , "Curso"."NomeInstituicao"
                    , "Curso"."MinimoAlunos"
                    , "Curso"."TipoFormacao"
                    , "Curso"."ModalidadeEnsino"
                    , "Curso"."SerieID"
                    , "Curso"."TipoCursoID"
                    , "Curso"."Ativo"
                    , "Curso"."Ato"
                    , "Curso"."ReconhecimentoCurso"
                    , "Series"."Nome" AS "SerieNome"
                    /*, "GradeCursos"."GradeCursoId" AS "CurriculoID"
                    , (CASE
                    WHEN "GradeCursos"."AnoLetivo" = 0 THEN "GradeCursos"."GradeCursoId"
                    ELSE "GradeCursos"."AnoLetivo" END
                    ) AS "NomeCurriculo"*/

                FROM "Cursos" "Curso"
                    --INNER JOIN "GradeCursos" ON "GradeCursos"."CursoID" = "Curso"."CursoID"
                    LEFT JOIN "CoordenadoresCurso" ON "CoordenadoresCurso"."CoordenadoresCursoID" = "Curso"."CoordenadorID"
                    LEFT JOIN "Funcionarios" ON "Funcionarios"."FuncionarioID" = "CoordenadoresCurso"."FuncionarioID"
                    LEFT JOIN "TiposCurso" ON "TiposCurso"."TipoCursoID" = "Curso"."TipoCursoID"
                    LEFT JOIN "Series" ON "Series"."SerieID" = "Curso"."SerieID"
            `);
            const cursos = cursosModel[0];
            let count = 1;
            /**
             * No Sponte deste cliente a serie esta cadastrada como curso, entao os
             * cursos de educacao basica sao AGRUPADOS por segmento antes de gravar
             * (1o ao 5o Ano EF viram um unico "Ensino Fundamental Anos Iniciais").
             * Cursos livres (SerieID = 0) continuam 1:1 como sempre foram.
             */
            const segmentos = new Map();
            const arrCursosPassthrough = [];
            if(true){
                for (let curso of cursos) {
                    console.log(`Processando ${count} de ${cursos.length} Cursos`);
                    count++;
                    const { CoordenadorCurso, ModalidadeEnsino, Ato, ReconhecimentoCurso } = curso;
                    const resolvido = dePara.ResolverCurso(curso);

                    const coordinator = dePara.LimparTexto(CoordenadorCurso);
                    const authorization = dePara.LimparTexto(Ato);
                    const recognition = dePara.LimparTexto(ReconhecimentoCurso);
                    // ModalidadeEnsino e um codigo numerico do Sponte; 0 = nao informado
                    let modality = dePara.LimparTexto(ModalidadeEnsino);
                    if(modality == '0') modality = '';

                    if(resolvido.fluxo != 'segmento'){
                        arrCursosPassthrough.push({ resolvido, coordinator, authorization, recognition, modality });
                        continue;
                    }

                    if(!segmentos.has(resolvido.segmento)) segmentos.set(resolvido.segmento, { resolvido, coordinator: '', authorization: '', recognition: '', modality: '' });

                    /**
                     * Vale o primeiro valor nao-vazio entre os cursos do segmento.
                     * Curso marcado como "ignorar" nao gera modulo, mas o Ato dele
                     * continua contando aqui -- e o caso do CursoID 31, unico
                     * registro da base com Ato/ReconhecimentoCurso preenchidos.
                     */
                    const acumulado = segmentos.get(resolvido.segmento);
                    if(!acumulado.coordinator && coordinator) acumulado.coordinator = coordinator;
                    if(!acumulado.authorization && authorization) acumulado.authorization = authorization;
                    if(!acumulado.recognition && recognition) acumulado.recognition = recognition;
                    if(!acumulado.modality && modality) acumulado.modality = modality;
                }

                for (let curso of [...segmentos.values()].concat(arrCursosPassthrough)) {
                    const { resolvido } = curso;
                    await courseServico.RegistraCurso(resolvido.id_course || '', resolvido.courseName || '', resolvido.code || '', resolvido.level || '', resolvido.type || '', curso.coordinator || '', '', '', '', curso.authorization || '', curso.recognition || '', '', curso.modality || '')
                }
            }
            console.log('FIM PROCESSANDO CURSOS')
        }
        if(process.env.CSVCURSOS == 1){
            console.log('INICIO GERANDO CSV CURSOS');
            const coursesGennera = await courseServico.BuscaTodosCursos();
            const layoutService = new LayoutService('Cursos');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV CURSOS');
        }
    }

    async ProcessarCurriculos(){
        const curriculoService = new CurriculoService();
        const arrCargaHorariaInvalidaCurriculos = [];
        if(process.env.CURRICULO == 1){ /// .env
            console.log('INICIO PROCESSANDO CURRICULOS');
            const curriculosModel = await connectionSQLServer.query(`
                SELECT 
                    "Curso"."CursoID"
                    , "Curso"."Nome"
                    , "Funcionarios"."Nome" AS "CoordenadorCurso"
                    , "TiposCurso"."Descricao" AS "TipoCurso"
                    , "Curso"."Etapas"
                    , "Curso"."NumeroVagas"
                    , "Curso"."Sigla" || '-' || "Curso"."CursoID" AS "Sigla"
                    , "Curso"."Requisitos"
                    , "Curso"."EixoCurso"
                    , "Curso"."NomeInstituicao"
                    , "Curso"."MinimoAlunos"
                    , "Curso"."TipoFormacao"
                    , "Curso"."ModalidadeEnsino"
                    , "Curso"."SerieID"
                    , "Curso"."TipoCursoID"
                    , "Curso"."Ativo"
                    --CURRICULO
                    , "CURRICULO"."GradeCursoId" AS "CurriculoID"
                    , "CURRICULO"."AnoLetivo"
                    , (Case
						when "CURRICULO"."AnoLetivo" = 0 then "Grade"."Nome"
						when "CURRICULO"."AnoLetivo" <> 0 then '('||"CURRICULO"."AnoLetivo"||') ' ||"Grade"."Nome"
						else "Grade"."Nome" end
					   ) AS "NomeCurriculo"
                    -- DISCIPLINAS
                    --, "CURRICULO"."DisciplinaNome"
                    --, "CURRICULO"."DisciplinaIndex"

                FROM "Cursos" "Curso"
                    INNER JOIN "GradeCursos" "CURRICULO" ON "CURRICULO"."CursoID" = "Curso"."CursoID"
					INNER JOIN "Grade" ON "Grade"."GradeID" = "CURRICULO"."GradeID"
                    /*INNER JOIN (
                        SELECT 
                            "GradeCursos"."GradeCursoId"
                            , "GradeCursos"."CursoID"
                            , "GradeCursos"."GradeID"
                            , "GradeCursos"."AnoLetivo"
                        
                            ,"Disciplinas"."Nome" AS "DisciplinaNome"
                            ,"GradeDisciplinas"."Ordenacao" AS "DisciplinaIndex"
                            , "GradeDisciplinas"."CargaHorariaTotal" AS "CargaHorariaDisciplina"
                            , ( CASE
                                    WHEN "GradeDisciplinas"."Optativa" = 1 THEN TRUE
                                    ELSE FALSE END
                            ) AS "Optativa"
                        FROM "GradeCursos"
                            INNER JOIN "GradeDisciplinas" ON "GradeDisciplinas"."GradeID" = "GradeCursos"."GradeID"
                            INNER JOIN "Disciplinas" ON "Disciplinas"."DisciplinaID" = "GradeDisciplinas"."DisciplinaID"
                        ORDER BY "GradeCursos"."CursoID", "GradeCursos"."GradeCursoId", "GradeDisciplinas"."Ordenacao" ASC
                    ) AS "CURRICULO" ON "CURRICULO"."CursoID" = "Curso"."CursoID" */
                    LEFT JOIN "CoordenadoresCurso" ON "CoordenadoresCurso"."CoordenadoresCursoID" = "Curso"."CoordenadorID"
                    LEFT JOIN "Funcionarios" ON "Funcionarios"."FuncionarioID" = "CoordenadoresCurso"."FuncionarioID"
                    LEFT JOIN "TiposCurso" ON "TiposCurso"."TipoCursoID" = "Curso"."TipoCursoID"
                `);
            const curriculos = curriculosModel[0];
            let count = 1;
            /**
             * Um curriculo por segmento x ano letivo: 2023, 2024, 2025 e 2026 viram
             * cada um o seu ("Ensino Fundamental Anos Iniciais - 2025"), com os
             * modulos das series repetidos dentro de cada ano. Curso livre continua
             * com um curriculo por linha de GradeCursos.
             */
            const mapCurriculos = new Map();
            if(true){
                for (let curriculo of curriculos) {
                    console.log(`Processando ${count} de ${curriculos.length} Curriculos`);
                    const {CursoID, Nome, CurriculoID, NomeCurriculo, AnoLetivo } = curriculo;
                    const resolvido = dePara.ResolverCurso(curriculo);
                    count++;
                    if(resolvido.ignorar) continue;

                    let idCurriculum = dePara.MontarIdCurriculo(resolvido, AnoLetivo, CurriculoID);
                    let nomeCurriculo = dePara.MontarNomeCurriculo(resolvido, AnoLetivo, NomeCurriculo);
                    let workload = 0;

                    let disciplinaModel = await connectionSQLServer.query(`
                        
                        SELECT 
                            "GradeCursos"."GradeCursoId"
                            , "GradeCursos"."CursoID"
                            , "GradeCursos"."GradeID"
                            , "GradeCursos"."AnoLetivo"

                            ,"Disciplinas"."Nome" AS "DisciplinaNome"
                            ,"GradeDisciplinas"."Ordenacao" AS "DisciplinaIndex"
                            , "GradeDisciplinas"."CargaHorariaTotal"
                        FROM "GradeCursos"
                            INNER JOIN "GradeDisciplinas" ON "GradeDisciplinas"."GradeID" = "GradeCursos"."GradeID"
                            INNER JOIN "Disciplinas" ON "Disciplinas"."DisciplinaID" = "GradeDisciplinas"."DisciplinaID"
                        WHERE "GradeCursos"."CursoID" = '${CursoID}' AND "GradeCursos"."GradeCursoId" = '${CurriculoID}'
                        ORDER BY "GradeCursos"."CursoID", "GradeCursos"."GradeCursoId" ASC

                    `);
                    disciplinaModel = disciplinaModel[0];
                    for(let disciplina of disciplinaModel){
                        let {CargaHorariaTotal, DisciplinaNome} = disciplina;
                        let {horas, valido} = ParseCargaHoraria(CargaHorariaTotal);
                        if(!valido) arrCargaHorariaInvalidaCurriculos.push({ CursoID, Curso: Nome, CurriculoID, Disciplina: DisciplinaNome, CargaHorariaTotal });
                        workload += horas;
                    }

                    if(!mapCurriculos.has(idCurriculum)) mapCurriculos.set(idCurriculum, { resolvido, idCurriculum, nomeCurriculo, workload: 0 });
                    // a carga do curriculo e a soma das series do segmento naquele ano
                    mapCurriculos.get(idCurriculum).workload += workload;
                }

                for (let curriculo of mapCurriculos.values()) {
                    await curriculoService.Registra(curriculo.resolvido.id_course || '',  curriculo.idCurriculum || '', curriculo.nomeCurriculo, '', '', '', '', '', '', curriculo.workload || '', false, '', '', '50', curriculo.resolvido.courseName || '');
                }
            }
            ImprimirRelatorioCargaHoraria('CURRICULOS', arrCargaHorariaInvalidaCurriculos);
            console.log('FIM PROCESSANDO CURRICULOS')
        }
        if(process.env.CSVCURRICULO == 1){
            console.log('INICIO GERANDO CSV CURRICULOS');
            const coursesGennera = await curriculoService.BuscaTodos();
            const layoutService = new LayoutService('Currículos');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV CURRICULOS');
        }
    }

    async ProcessarModulos(){
        const moduleService = new ModuleService();
        const arrConflitosModulo = [];
        const arrDivergenciaSerie = [];
        if(process.env.MODULO == 1){ /// .env
            console.log('INICIO PROCESSANDO MODULOS');
            const curriculosModel = await connectionSQLServer.query(`
                SELECT 
                    "Curso"."CursoID"
                    , "Curso"."Nome"
                    , "Funcionarios"."Nome" AS "CoordenadorCurso"
                    , "TiposCurso"."Descricao" AS "TipoCurso"
                    , "Curso"."Etapas"
                    , "Curso"."NumeroVagas"
                    , "Curso"."Sigla" || '-' || "Curso"."CursoID" AS "Sigla"
                    , "Curso"."Requisitos"
                    , "Curso"."EixoCurso"
                    , "Curso"."NomeInstituicao"
                    , "Curso"."MinimoAlunos"
                    , "Curso"."TipoFormacao"
                    , "Curso"."ModalidadeEnsino"
                    , "Curso"."SerieID"
                    , "Curso"."TipoCursoID"
                    , "Curso"."Ativo"
                    , "Series"."Nome" AS "SerieNome"
                    --CURRICULO
                    , "CURRICULO"."GradeCursoId" AS "CurriculoID"
                    , "CURRICULO"."AnoLetivo"
                    , (CASE
                    WHEN "CURRICULO"."AnoLetivo" = 0 THEN "CURRICULO"."GradeCursoId"
                    ELSE "CURRICULO"."AnoLetivo" END
                    ) AS "NomeCurriculo"
                    -- DISCIPLINAS
                    --, "CURRICULO"."DisciplinaNome"
                    --, "CURRICULO"."DisciplinaIndex"

                FROM "Cursos" "Curso"
                    INNER JOIN "GradeCursos" "CURRICULO" ON "CURRICULO"."CursoID" = "Curso"."CursoID"
                    LEFT JOIN "Series" ON "Series"."SerieID" = "Curso"."SerieID"
                    /*INNER JOIN (
                        SELECT 
                            "GradeCursos"."GradeCursoId"
                            , "GradeCursos"."CursoID"
                            , "GradeCursos"."GradeID"
                            , "GradeCursos"."AnoLetivo"
                        
                            ,"Disciplinas"."Nome" AS "DisciplinaNome"
                            ,"GradeDisciplinas"."Ordenacao" AS "DisciplinaIndex"
                            , "GradeDisciplinas"."CargaHorariaTotal" AS "CargaHorariaDisciplina"
                            , ( CASE
                                    WHEN "GradeDisciplinas"."Optativa" = 1 THEN TRUE
                                    ELSE FALSE END
                            ) AS "Optativa"
                        FROM "GradeCursos"
                            INNER JOIN "GradeDisciplinas" ON "GradeDisciplinas"."GradeID" = "GradeCursos"."GradeID"
                            INNER JOIN "Disciplinas" ON "Disciplinas"."DisciplinaID" = "GradeDisciplinas"."DisciplinaID"
                        ORDER BY "GradeCursos"."CursoID", "GradeCursos"."GradeCursoId", "GradeDisciplinas"."Ordenacao" ASC
                    ) AS "CURRICULO" ON "CURRICULO"."CursoID" = "Curso"."CursoID" */
                    LEFT JOIN "CoordenadoresCurso" ON "CoordenadoresCurso"."CoordenadoresCursoID" = "Curso"."CoordenadorID"
                    LEFT JOIN "Funcionarios" ON "Funcionarios"."FuncionarioID" = "CoordenadoresCurso"."FuncionarioID"
                    LEFT JOIN "TiposCurso" ON "TiposCurso"."TipoCursoID" = "Curso"."TipoCursoID"
                `);
            const curriculos = curriculosModel[0];
            let count = 1;
            /**
             * Um modulo por (segmento, ano letivo, serie), com o nome da serie e o
             * index canonico dentro do segmento. Curso livre mantem o modulo unico
             * "Módulo" com index 1, como sempre foi.
             */
            const mapModulos = new Map();
            const cursosConferidos = new Set();
            if(true){
                for (let curriculo of curriculos) {
                    console.log(`Processando ${count} de ${curriculos.length} Modulos`);
                    const {CursoID, Nome, SerieID, SerieNome, CurriculoID, AnoLetivo } = curriculo;
                    const resolvido = dePara.ResolverCurso(curriculo);
                    count++;

                    // o nome do curso no Sponte deveria descrever a mesma serie do de-para
                    if(resolvido.fluxo == 'segmento' && !cursosConferidos.has(`${CursoID}`)){
                        cursosConferidos.add(`${CursoID}`);
                        const normalizar = valor => dePara.LimparTexto(valor).toLowerCase().replace(/[.\s]/g, '');
                        if(normalizar(Nome) != normalizar(resolvido.moduleName)) arrDivergenciaSerie.push({ CursoID, NomeNoSponte: Nome, SerieID, SerieSponte: SerieNome || '', ModuloGennera: resolvido.moduleName, Ignorar: resolvido.ignorar ? 'SIM' : '' });
                    }

                    if(resolvido.ignorar) continue;

                    let idCurriculum = dePara.MontarIdCurriculo(resolvido, AnoLetivo, CurriculoID);
                    let idModule = dePara.MontarIdModulo(resolvido, idCurriculum);

                    if(mapModulos.has(idModule)){
                        const anterior = mapModulos.get(idModule);
                        if(anterior.CursoID != `${CursoID}`) arrConflitosModulo.push({ id_module: idModule, Modulo: resolvido.moduleName, AnoLetivo, CursoID_A: anterior.CursoID, CursoID_B: `${CursoID}`, Curso_B: Nome, CurriculoSponte_A: anterior.CurriculoID, CurriculoSponte_B: `${CurriculoID}` });
                        continue;
                    }
                    mapModulos.set(idModule, { resolvido, idModule, idCurriculum, CursoID: `${CursoID}`, CurriculoID: `${CurriculoID}` });
                }

                for (let modulo of mapModulos.values()) {
                    await moduleService.Registra(modulo.idModule || '', modulo.resolvido.moduleName || '', modulo.resolvido.moduleIndex, false, modulo.idCurriculum);
                }
            }
            dePara.ImprimirRelatorioDePara('COLISOES DE MODULO (mesmo id_module vindo de CursoID diferentes)', arrConflitosModulo);
            dePara.ImprimirRelatorioDePara('DIVERGENCIA entre o nome do curso no Sponte e o modulo do Gennera', arrDivergenciaSerie);
            console.log('FIM PROCESSANDO MODULOS')
        }
        if(process.env.CSVMODULO == 1){
            console.log('INICIO GERANDO CSV MODULOS');
            const coursesGennera = await moduleService.BuscaTodos();
            const layoutService = new LayoutService('Módulos');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV MODULOS');
        }
    }

    async ProcessarDisciplinas(){
        const subjectService = new SubjectService();
        const arrCargaHorariaInvalidaDisciplinas = [];
        if(process.env.DICIPLINA == 1){ /// .env
            console.log('INICIO PROCESSANDO DISCIPLINAS');
            const disciplinasModel = await connectionSQLServer.query(`
                SELECT 
                    "Curso"."CursoID"
                    , "Curso"."Nome"
                    , "Funcionarios"."Nome" AS "CoordenadorCurso"
                    , "TiposCurso"."Descricao" AS "TipoCurso"
                    , "Curso"."Etapas"
                    , "Curso"."NumeroVagas"
                    , "Curso"."Sigla" || '-' || "Curso"."CursoID" AS "Sigla"
                    , "Curso"."Requisitos"
                    , "Curso"."EixoCurso"
                    , "Curso"."NomeInstituicao"
                    , "Curso"."MinimoAlunos"
                    , "Curso"."TipoFormacao"
                    , "Curso"."ModalidadeEnsino"
                    , "Curso"."SerieID"
                    , "Curso"."TipoCursoID"
                    , "Curso"."Ativo"
                    --CURRICULO
                    , "CURRICULO"."GradeCursoId" AS "CurriculoID"
                    , "CURRICULO"."AnoLetivo"
                    , (CASE
                    WHEN "CURRICULO"."AnoLetivo" = 0 THEN "CURRICULO"."GradeCursoId"
                    ELSE "CURRICULO"."AnoLetivo" END
                    ) AS "NomeCurriculo"
                    -- DISCIPLINAS
                    , "Curso"."CursoID"::text || "CURRICULO"."GradeCursoId"::text || "CURRICULO"."DisciplinaID"::text AS "DisciplinaID"
                    , "CURRICULO"."DisciplinaNome"
                    , "CURRICULO"."DisciplinaIndex"
					, "CURRICULO"."CargaHorariaDisciplina"
					, "CURRICULO"."Optativa"

                FROM "Cursos" "Curso"
                    --INNER JOIN "GradeCursos" "CURRICULO" ON "CURRICULO"."CursoID" = "Curso"."CursoID"
                    INNER JOIN (
                        SELECT 
                            "GradeCursos"."GradeCursoId"
                            , "GradeCursos"."CursoID"
                            , "GradeCursos"."GradeID"
                            , "GradeCursos"."AnoLetivo"
                            ,"Disciplinas"."DisciplinaID" AS "DisciplinaID"
                            ,"Disciplinas"."Nome" AS "DisciplinaNome"
                            ,"GradeDisciplinas"."Ordenacao" AS "DisciplinaIndex"
                            , "GradeDisciplinas"."CargaHorariaTotal" AS "CargaHorariaDisciplina"
                            , ( CASE
                                    WHEN "GradeDisciplinas"."Optativa" = 1 THEN TRUE
                                    ELSE FALSE END
                            ) AS "Optativa"
                        FROM "GradeCursos"
                            INNER JOIN "GradeDisciplinas" ON "GradeDisciplinas"."GradeID" = "GradeCursos"."GradeID"
                            INNER JOIN "Disciplinas" ON "Disciplinas"."DisciplinaID" = "GradeDisciplinas"."DisciplinaID"
                        ORDER BY "GradeCursos"."CursoID", "GradeCursos"."GradeCursoId", "GradeDisciplinas"."Ordenacao" ASC
                    ) AS "CURRICULO" ON "CURRICULO"."CursoID" = "Curso"."CursoID" 
                    LEFT JOIN "CoordenadoresCurso" ON "CoordenadoresCurso"."CoordenadoresCursoID" = "Curso"."CoordenadorID"
                    LEFT JOIN "Funcionarios" ON "Funcionarios"."FuncionarioID" = "CoordenadoresCurso"."FuncionarioID"
                    LEFT JOIN "TiposCurso" ON "TiposCurso"."TipoCursoID" = "Curso"."TipoCursoID"
            `);
            const disciplinas = disciplinasModel[0];
            let count = 1;
            if(true){
                for (let disciplina of disciplinas) {
                    console.log(`Processando ${count} de ${disciplinas.length} Disciplinas`);
                    const {CursoID, Nome, CurriculoID, AnoLetivo,
                         DisciplinaID, DisciplinaNome, DisciplinaIndex, CargaHorariaDisciplina, Optativa } = disciplina;
                    const resolvido = dePara.ResolverCurso(disciplina);
                    count++;
                    if(resolvido.ignorar) continue;

                    // o id_subject nao muda: ja e unico por (curso, grade, disciplina)
                    let idCurriculum = dePara.MontarIdCurriculo(resolvido, AnoLetivo, CurriculoID);
                    let idModule = dePara.MontarIdModulo(resolvido, idCurriculum);
                    let idSubject = `${DisciplinaID}`;

                    let {horas, valido} = ParseCargaHoraria(CargaHorariaDisciplina);
                    let workload = horas;
                    if(!valido) arrCargaHorariaInvalidaDisciplinas.push({ CursoID, Curso: Nome, CurriculoID, Disciplina: DisciplinaNome, CargaHorariaDisciplina });

                    await subjectService.Registra(idSubject, DisciplinaNome, DisciplinaIndex,  0, !Optativa, workload || 0, '', '', false, 0, 0, 0, idModule, '', resolvido.courseName);
                }
            }
            ImprimirRelatorioCargaHoraria('DISCIPLINAS', arrCargaHorariaInvalidaDisciplinas);
            console.log('FIM PROCESSANDO DISCIPLINAS')
        }
        if(process.env.CSVDICIPLINA == 1){
            console.log('INICIO GERANDO CSV DISCIPLINAS');
            const coursesGennera = await subjectService.BuscaTodos();
            const layoutService = new LayoutService('Disciplinas');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV DISCIPLINAS');
        }
    }

    /*async ProcessarDisciplinasPreRequisito(){
        const subjectService = new SubjectService();
        if(process.env.DICIPLINA_PREREQUISITO == 1){ /// .env
            console.log('INICIO PROCESSANDO DISCIPLINAS PRE-REQUISITOS');
            const disciplinasModel = await connectionSQLServer.query(`
            SELECT
                G.[CURS_Codigo],
                Curso.[CURS_Descricao],
                G.[CURR_Codigo],
                G.[GRAD_Periodo],
                G.[DISC_Codigo],
				G.[GRAD_PreRequisito1],
				G.[GRAD_PreRequisito2],
				G.[GRAD_PreRequisito3],
				G.[GRAD_PreRequisito4],
				G.[GRAD_PreRequisito5],
				G.[GRAD_CoRequisito]
                
            FROM [FACGRAD] G
                INNER JOIN [FACDISC] C on C.[DISC_Codigo] = G.[DISC_Codigo]
                INNER JOIN [FACCURS] Curso on Curso.[CURS_Codigo] = G.[CURS_Codigo]
            `);
            const disciplinas = disciplinasModel[0];
            let count = 1;
            if(true){
                for (let disciplina of disciplinas) {
                    console.log(`Processando ${count} de ${disciplinas.length} Disciplinas`);
                    const {CURS_Codigo, CURS_Descricao, CURR_Codigo, GRAD_Periodo, DISC_Codigo, GRAD_PreRequisito1, GRAD_PreRequisito2, GRAD_PreRequisito3, GRAD_PreRequisito4, GRAD_PreRequisito5, GRAD_CoRequisito } = disciplina;
                    
                    let codigoCurriculum = '';
                    let idModule = '';
                    let idSubject = '';
                    let idSubjectPrerequisite1 = '';
                    let idSubjectPrerequisite2 = '';
                    let idSubjectPrerequisite3 = '';
                    let idSubjectPrerequisite4 = '';
                    let idSubjectPrerequisite5 = '';

                    if(CURR_Codigo){
                        let idAux = jsonDeParaIdCurriculum[CURR_Codigo];
                        codigoCurriculum = `${CURS_Codigo}${idAux}`;
                        idModule = `${codigoCurriculum}${GRAD_Periodo}`
                    }
                    if(DISC_Codigo){
                        let idConvertNumber = jsonDeParaIdSubject[`${DISC_Codigo}`];
                        idSubject = `${idModule}${idConvertNumber}`;
                    }

                    if(GRAD_PreRequisito1){
                        let idConvertNumber = jsonDeParaIdSubject[`${GRAD_PreRequisito1}`];
                        let prerequistomodel1 = await connectionSQLServer.query(`SELECT * FROM FACGRAD WHERE CURS_Codigo = '${CURS_Codigo}' AND CURR_Codigo = '${CURR_Codigo}' AND DISC_Codigo = '${GRAD_PreRequisito1}'`);
                        let prerequisto1 = prerequistomodel1[0];
                        prerequisto1 = prerequisto1[0];
                        if(prerequisto1){
                            let idAux = jsonDeParaIdCurriculum[CURR_Codigo];
                            let codigoCurriculum = `${CURS_Codigo}${idAux}`;
                            let idModule = `${codigoCurriculum}${prerequisto1.GRAD_Periodo}`
                            idSubjectPrerequisite1 = `${idModule}${idConvertNumber}`;
                            await subjectService.RegistraPreRequisite(idSubject, idSubjectPrerequisite1);
                        }
                    }
                    if(GRAD_PreRequisito2){
                        let idConvertNumber = jsonDeParaIdSubject[`${GRAD_PreRequisito2}`];
                        let prerequistomodel = await connectionSQLServer.query(`SELECT * FROM FACGRAD WHERE CURS_Codigo = '${CURS_Codigo}' AND CURR_Codigo = '${CURR_Codigo}' AND DISC_Codigo = '${GRAD_PreRequisito2}'`);
                        let prerequisto = prerequistomodel[0];
                        prerequisto = prerequisto[0];
                        if(prerequisto){
                            let idAux = jsonDeParaIdCurriculum[CURR_Codigo];
                            let codigoCurriculum = `${CURS_Codigo}${idAux}`;
                            let idModule = `${codigoCurriculum}${prerequisto.GRAD_Periodo}`
                            idSubjectPrerequisite2 = `${idModule}${idConvertNumber}`;
                            await subjectService.RegistraPreRequisite(idSubject, idSubjectPrerequisite2);
                        }
                    }
                    if(GRAD_PreRequisito3){
                        let idConvertNumber = jsonDeParaIdSubject[`${GRAD_PreRequisito3}`];
                        let prerequistomodel = await connectionSQLServer.query(`SELECT * FROM FACGRAD WHERE CURS_Codigo = '${CURS_Codigo}' AND CURR_Codigo = '${CURR_Codigo}' AND DISC_Codigo = '${GRAD_PreRequisito3}'`);
                        let prerequisto = prerequistomodel[0];
                        prerequisto = prerequisto[0];
                        if(prerequisto){
                            let idAux = jsonDeParaIdCurriculum[CURR_Codigo];
                            let codigoCurriculum = `${CURS_Codigo}${idAux}`;
                            let idModule = `${codigoCurriculum}${prerequisto.GRAD_Periodo}`
                            idSubjectPrerequisite3 = `${idModule}${idConvertNumber}`;
                            await subjectService.RegistraPreRequisite(idSubject, idSubjectPrerequisite3);
                        }
                    }
                    if(GRAD_PreRequisito4){
                        let idConvertNumber = jsonDeParaIdSubject[`${GRAD_PreRequisito4}`];
                        let prerequistomodel = await connectionSQLServer.query(`SELECT * FROM FACGRAD WHERE CURS_Codigo = '${CURS_Codigo}' AND CURR_Codigo = '${CURR_Codigo}' AND DISC_Codigo = '${GRAD_PreRequisito4}'`);
                        let prerequisto = prerequistomodel[0];
                        prerequisto = prerequisto[0];
                        if(prerequisto){
                            let idAux = jsonDeParaIdCurriculum[CURR_Codigo];
                            let codigoCurriculum = `${CURS_Codigo}${idAux}`;
                            let idModule = `${codigoCurriculum}${prerequisto.GRAD_Periodo}`
                            idSubjectPrerequisite4 = `${idModule}${idConvertNumber}`;
                            await subjectService.RegistraPreRequisite(idSubject, idSubjectPrerequisite4);
                        }
                    }
                    if(GRAD_PreRequisito5){
                        let idConvertNumber = jsonDeParaIdSubject[`${GRAD_PreRequisito5}`];
                        let prerequistomodel = await connectionSQLServer.query(`SELECT * FROM FACGRAD WHERE CURS_Codigo = '${CURS_Codigo}' AND CURR_Codigo = '${CURR_Codigo}' AND DISC_Codigo = '${GRAD_PreRequisito5}'`);
                        let prerequisto = prerequistomodel[0];
                        prerequisto = prerequisto[0];
                        if(prerequisto){
                            let idAux = jsonDeParaIdCurriculum[CURR_Codigo];
                            let codigoCurriculum = `${CURS_Codigo}${idAux}`;
                            let idModule = `${codigoCurriculum}${prerequisto.GRAD_Periodo}`
                            idSubjectPrerequisite5 = `${idModule}${idConvertNumber}`;
                            await subjectService.RegistraPreRequisite(idSubject, idSubjectPrerequisite5);
                        }
                    }
                    count++;
                }
            }
            console.log('FIM PROCESSANDO PRE-REQUISITOS')
        }
        if(process.env.CSVDICIPLINA_PREREQUISITO == 1){
            console.log('INICIO GERANDO CSV PRE-REQUISITOS');
            const coursesGennera = await subjectService.BuscaTodosPreRequisitos();
            const layoutService = new LayoutService('Disciplinas_Prerequisitos');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV PRE-REQUISITOS');
        }

        if(process.env.CSVDICIPLINA_PREREQUISITO_MANUAL == 1){
            let rows = [];
            const listaDeDisciplinasDEPARA = require('../src/tipos/novoIdDisciplina');
            const subjectRepository = new SubjectRepository();
            console.log('INICIO GERANDO CSV PRE-REQUISITOS');
            let query = `
            SELECT 
                pr.id_subject,
                tdp.name,
                tdp.id_module,
                pr.id_subject_prerequisite
            FROM tb_pre_requisites pr
            JOIN tb_subjects tdp on tdp.id_subject = pr.id_subject`;
            let prerequisitesModel = await connectionPostgresServer.query(query);
            const prerequisites = prerequisitesModel[0];
            for(let prerequisite of prerequisites){
                let line = {};
                let {name, id_module, id_subject_prerequisite} = prerequisite;
                let prerequisiteModel = await connectionPostgresServer.query(`select name as nome, id_module as idModulo from tb_subjects where "id_subject" = '${id_subject_prerequisite}'`);
                let prerequisiteSearh = prerequisiteModel[0];
                prerequisiteSearh = prerequisiteSearh[0];
                if(prerequisiteSearh){
                    let {nome, idmodulo} = prerequisiteSearh;
                    let disciplina = await subjectRepository.BuscarPeloIdModuleEName(id_module, name);
                    if(disciplina){
                        let disciplinaEncontrada = listaDeDisciplinasDEPARA.find(d => d.idModule == disciplina.id_module && d.name.toUpperCase() == disciplina.name.toUpperCase())
                        if(disciplinaEncontrada){
                            line.id_subject = disciplinaEncontrada.idSubject;
                            let disciplinaPreRequisito = await subjectRepository.BuscarPeloIdModuleEName(idmodulo, nome);
                            if(disciplinaPreRequisito){
                                let disciplinaEncontradaPreRequisito = listaDeDisciplinasDEPARA.find(d => d.idModule == disciplinaPreRequisito.id_module && d.name.toUpperCase() == disciplinaPreRequisito.name.toUpperCase())
                                if(disciplinaEncontradaPreRequisito){
                                    line.id_subject_prerequisite = disciplinaEncontradaPreRequisito.idSubject;
                                    rows.push(line);
                                }
                            } else {
                                console.log(`Não achou a disciplina ${disciplinaPreRequisito.name} | ${disciplinaPreRequisito.id_module}`);
                            }

                        } else {
                            console.log(`Não achou a disciplina ${disciplina.name} | ${disciplina.id_module}`);
                        }
                    } else {
                        console.log(`Não achou disciplina para o módulo: ${turma.id_module}`);
                    }


                }
            }
            const layoutService = new LayoutService('Disciplinas_Prerequisitos');
            await layoutService.CreateFileManual(rows);
            console.log('FIM GERANDO CSV PRE-REQUISITOS');
        }
    }

    async ProcessarDisciplinasEquivalencia(){
        const subjectService = new SubjectService();
        if(process.env.DICIPLINA_EQUIVALENCIA == 1){ /// .env
            console.log('INICIO PROCESSANDO DISCIPLINAS EQUIVALENCIAS');
            const disciplinasModel = await connectionSQLServer.query(`
                SELECT * FROM FACDIEQ
            `);
            const disciplinas = disciplinasModel[0];
            let count = 1;
            if(true){
                for (let disciplina of disciplinas) {
                    console.log(`Processando ${count} de ${disciplinas.length} Disciplinas`);
                    const {DISC_Codigo, DIEQ_Codigo} = disciplina;
                    const disciplinasComparacaoModel = await connectionSQLServer.query(`
                    SELECT
                        G.[CURS_Codigo],
                        Curso.[CURS_Descricao],
                        G.[CURR_Codigo],
                        G.[GRAD_Periodo],
                        G.[DISC_Codigo]
                        
                    FROM [FACGRAD] G
                        INNER JOIN [FACDISC] C on C.[DISC_Codigo] = G.[DISC_Codigo]
                        INNER JOIN [FACCURS] Curso on Curso.[CURS_Codigo] = G.[CURS_Codigo]
                    WHERE G.DISC_Codigo = '${DISC_Codigo}'
                        `);
                        const disciplinasComparacao = disciplinasComparacaoModel[0];
                        for(let disciplinaComparada of disciplinasComparacao){
                            let {CURS_Codigo, CURR_Codigo, GRAD_Periodo} = disciplinaComparada;

                            let idModule = '';
                            let idSubject = '';
                            let codigoCurriculum = '';
                            if(CURR_Codigo){
                                let idAux = jsonDeParaIdCurriculum[CURR_Codigo];
                                codigoCurriculum = `${CURS_Codigo}${idAux}`;
                                idModule = `${codigoCurriculum}${GRAD_Periodo}`
                            }
                            if(DISC_Codigo){
                                let idConvertNumber = jsonDeParaIdSubject[`${DISC_Codigo}`];
                                idSubject = `${idModule}${idConvertNumber}`;
                            }


                            const disciplinasEquivalentesModel = await connectionSQLServer.query(`
                                SELECT
                                    G.[CURS_Codigo],
                                    Curso.[CURS_Descricao],
                                    G.[CURR_Codigo],
                                    G.[GRAD_Periodo],
                                    G.[DISC_Codigo]
                                    
                                FROM [FACGRAD] G
                                    INNER JOIN [FACDISC] C on C.[DISC_Codigo] = G.[DISC_Codigo]
                                    INNER JOIN [FACCURS] Curso on Curso.[CURS_Codigo] = G.[CURS_Codigo]
                                WHERE G.DISC_Codigo = '${DIEQ_Codigo}'
                                    `);
                            const disciplinasEquivalentes = disciplinasEquivalentesModel[0];
                            for(let disciplinaEquivalente of disciplinasEquivalentes){
                                let {CURS_Codigo, CURR_Codigo, GRAD_Periodo} = disciplinaEquivalente;
    
                                let idModuleEquivalente = '';
                                let idSubjectEquivalente = '';
                                if(CURR_Codigo){
                                    let idAux = jsonDeParaIdCurriculum[CURR_Codigo];
                                    let codigoCurriculum = `${CURS_Codigo}${idAux}`;
                                    idModuleEquivalente = `${codigoCurriculum}${GRAD_Periodo}`
                                }
                                if(DIEQ_Codigo){
                                    let idConvertNumber = jsonDeParaIdSubject[`${DIEQ_Codigo}`];
                                    idSubjectEquivalente = `${idModuleEquivalente}${idConvertNumber}`;
                                }

                                if(idSubject && idSubjectEquivalente){
                                    //Chama aqui a classe que salva no banco
                                    await subjectService.RegistraEquivalencia(idSubject, idSubjectEquivalente)
                                }
                            }
                        }

                    count++;
                }
            }
            console.log('FIM PROCESSANDO EQUIVALENCIAS')
        }
        if(process.env.CSVDICIPLINA_EQUIVALENCIA == 1){
            console.log('INICIO GERANDO CSV EQUIVALENCIAS');
            const coursesGennera = await subjectService.BuscaTodosEquivalencias();
            const layoutService = new LayoutService('Disciplinas_Equivalencias');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV EQUIVALENCIAS');
        }
        if(process.env.CSVDICIPLINA_EQUIVALENCIA_MANUAL == 1){
            let rows = [];
            const listaDeDisciplinasDEPARA = require('../src/tipos/novoIdDisciplina');
            const subjectRepository = new SubjectRepository();
            console.log('INICIO GERANDO CSV EQUIVALENCIAS');
            let query = `
            SELECT 
                pr.id_subject,
                tdp.name,
                tdp.id_module,
                pr.id_subject_equivalence
            FROM tb_equivalences pr
            JOIN tb_subjects tdp on tdp.id_subject = pr.id_subject`;
            let equivalenciasModel = await connectionPostgresServer.query(query);
            const equivalencias = equivalenciasModel[0];
            for(let equivalencia of equivalencias){
                let line = {};
                let {name, id_module, id_subject_equivalence} = equivalencia;
                let equivalenceModel = await connectionPostgresServer.query(`select name as nome, id_module as idModulo from tb_subjects where "id_subject" = '${id_subject_equivalence}'`);
                let equivalenceSearh = equivalenceModel[0];
                equivalenceSearh = equivalenceSearh[0];
                if(equivalenceSearh){
                    let {nome, idmodulo} = equivalenceSearh;
                    let disciplina = await subjectRepository.BuscarPeloIdModuleEName(id_module, name);
                    if(disciplina){
                        let disciplinaEncontrada = listaDeDisciplinasDEPARA.find(d => d.idModule == disciplina.id_module && d.name.toUpperCase() == disciplina.name.toUpperCase())
                        if(disciplinaEncontrada){
                            line.id_subject = disciplinaEncontrada.idSubject;
                            let disciplinaEquivalencia = await subjectRepository.BuscarPeloIdModuleEName(idmodulo, nome);
                            if(disciplinaEquivalencia){
                                let disciplinaEncontradaPreRequisito = listaDeDisciplinasDEPARA.find(d => d.idModule == disciplinaEquivalencia.id_module && d.name.toUpperCase() == disciplinaEquivalencia.name.toUpperCase())
                                if(disciplinaEncontradaPreRequisito){
                                    line.id_subject_equivalence = disciplinaEncontradaPreRequisito.idSubject;
                                    rows.push(line);
                                }
                            } else {
                                console.log(`Não achou a disciplina ${disciplinaEquivalencia.name} | ${disciplinaEquivalencia.id_module}`);
                            }

                        } else {
                            console.log(`Não achou a disciplina ${disciplina.name} | ${disciplina.id_module}`);
                        }
                    } else {
                        console.log(`Não achou disciplina para o módulo: ${id_module}`);
                    }


                }
            }
            const layoutService = new LayoutService('Disciplinas_Equivalencias');
            await layoutService.CreateFileManual(rows);
            console.log('FIM GERANDO CSV EQUIVALENCIAS');
        }
    }*/

    async ProcessarDisciplinasEmentas(){
        const teachingPlanService = new TeachingPlanService();
        if(process.env.DICIPLINA_EMENTAS == 1){ /// .env
            console.log('INICIO PROCESSANDO DISCIPLINAS Ementas');
            const disciplinasModel = await connectionSQLServer.query(`
                SELECT 
                    '1' + CURSO.CURSO AS CURSO
                    ,CASE WHEN CURSO.NOME IN ('DIREITO', 'CIÊNCIAS CONTÁBEIS') THEN CURSO.NOME + ' ' +CURSO.CURSO ELSE CURSO.NOME END AS NOME
					,CURRICULO.ANOLETIVO
					, CURRICULO.SERIE
					, DISCIPLINAS.COD_DISC
					--, DISCIPLINAS.ABREV
					--, DISCIPLINAS.NOME as NOMEDISCIPLINA
					, ISNULL(CURRICULO.CARHOR, '') AS CARHOR
					, ISNULL(CURRICULO.CREDITOS, '') AS CREDITOS
					, ISNULL(DISCIPLINAS.EMENTA, '') AS EMENTA
                FROM 
                    CURSGEN AS CURSO
				INNER JOIN DISCIPL AS CURRICULO ON CURRICULO.CURSO = CURSO.CURSO
				INNER JOIN DISCHIS AS DISCIPLINAS ON DISCIPLINAS.COD_DISC = CURRICULO.COD_DISC AND CURRICULO.ANOLETIVO = DISCIPLINAS.CTL_ANO_LETIVO
                WHERE CURSO.CURSO <> '' AND DISCIPLINAS.EMENTA IS NOT NULL --AND CURSO.CURSO IN ('003') --and CURRICULO.ANOLETIVO ='2004'
				ORDER BY 
					CURSO.NOME
					, CURRICULO.ANOLETIVO
					, CURRICULO.SERIE
				ASC
            `);
            const disciplinas = disciplinasModel[0];
            let count = 1;
            if(true){
                for (let disciplina of disciplinas) {
                    console.log(`Processando ${count} de ${disciplinas.length} Disciplinas Ementas`);
                    const {CURSO, COD_DISC, ANOLETIVO, SERIE, EMENTA } = disciplina;
                    
                    let idCurriculum = `${CURSO}${ANOLETIVO.replaceAll('.', '')}`;
                    idCurriculum = idCurriculum.replaceAll('-', '')
                    idCurriculum = idCurriculum.replaceAll('/', '')
                    let idModule = `${idCurriculum}${SERIE}`;
                    let idSubject = `${idModule}${COD_DISC}`;
                    let id_syllabus = `${idSubject}01`;

                    let syllabus = `${EMENTA}`;
                    
                    syllabus = syllabus.replace(` 
`, '');
                    //syllabus = syllabus.replace(` `, '');
                    syllabus = syllabus.replaceAll('Ementa:', '');
                    syllabus = syllabus.replaceAll('EMENTA', '');
                    syllabus = syllabus.replaceAll('\n', ' ');
                    syllabus = syllabus.replaceAll('\t', ' ');
                    syllabus = syllabus.replaceAll('	', ' ');

                    if(syllabus != '' && syllabus  != ' ' && syllabus.length > 5){
                        await teachingPlanService.Registra(idSubject, id_syllabus, syllabus, '', '', '', '', '', '', '');
                    }
                    count++;
                }
            }
            console.log('FIM PROCESSANDO Ementas')
        }
        if(process.env.CSVDICIPLINA_EMENTAS == 1){
            console.log('INICIO GERANDO CSV Ementas');
            const coursesGennera = await teachingPlanService.BuscaTodos();
            const layoutService = new LayoutService('Disciplinas_Ementas');
            await layoutService.CreateFile(coursesGennera);
            console.log('FIM GERANDO CSV Ementas');
        }

    }
}


module.exports = CursoService;