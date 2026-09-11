/**
 * DE-PARA da estrutura academica Sponte -> Gennera.
 *
 * Neste cliente o Sponte foi cadastrado com a SERIE no lugar do CURSO:
 * "1o Ano EF", "9o Ano EF" e "1o Ano EM" sao registros da tabela "Cursos".
 * No Gennera a hierarquia correta e Curso -> Curriculo -> Modulo, onde o
 * curso e o SEGMENTO e a serie e o MODULO.
 *
 *   Sponte                              Gennera
 *   Cursos (serie)                ->    tb_modules
 *   TiposCurso + Series (faixa)   ->    tb_courses     (segmento)
 *   GradeCursos (curso x ano)     ->    tb_curriculums (segmento x ano letivo)
 *   GradeDisciplinas              ->    tb_subjects    (no modulo da serie)
 *
 * Dois fluxos:
 *   - SEGMENTO   : educacao basica regular, agrupada por TiposCurso + Series.
 *   - PASSTHROUGH: cursos livres/extracurriculares (Cursos.SerieID = 0).
 *                  NAO passam pelo de-para, mantem a estrutura do Sponte
 *                  exatamente como e hoje (curso = curso, curriculo =
 *                  GradeCursos, modulo unico "Modulo" com index 1).
 *
 * Por que TiposCurso sozinho nao resolve: os 10 cursos de EF (1o ao 9o) usam
 * todos TipoCursoID = -2 ("Ensino Fundamental"). O tipo -4 ("Ensino
 * Fundamental II") existe na tabela mas nenhum curso o utiliza, entao so o
 * SerieID permite separar Anos Iniciais de Anos Finais.
 */

/** Segmentos de destino. O id_course e fixo para nao depender do Sponte. */
const SEGMENTOS = {
    EI:   { id_course: '9001', sigla: 'EI',   name: 'Educação Infantil',                level: 'Educação Infantil',  type: 'Educação Infantil' },
    EFAI: { id_course: '9002', sigla: 'EFAI', name: 'Ensino Fundamental Anos Iniciais', level: 'Ensino Fundamental', type: 'Ensino Fundamental' },
    EFAF: { id_course: '9003', sigla: 'EFAF', name: 'Ensino Fundamental Anos Finais',   level: 'Ensino Fundamental', type: 'Ensino Fundamental' },
    EM:   { id_course: '9004', sigla: 'EM',   name: 'Ensino Médio',                     level: 'Ensino Médio',       type: 'Ensino Médio' },
};

/**
 * Cursos.SerieID -> segmento + nome/ordem do modulo no Gennera.
 * O "index" e a posicao canonica da serie dentro do segmento, nao uma
 * renumeracao densa por ano: o 2o Ano EM continua com index 2 mesmo num
 * ano letivo em que o 1o Ano EM nao exista.
 */
const SERIES = {
    '-6': { segmento: 'EI',   modulo: 'Berçário I',  index: 1 },
    '-5': { segmento: 'EI',   modulo: 'Berçário II', index: 2 },
    '-4': { segmento: 'EI',   modulo: 'Maternal I',  index: 3 },
    '-3': { segmento: 'EI',   modulo: 'Maternal II', index: 4 },
    '-2': { segmento: 'EI',   modulo: 'Jardim I',    index: 5 },
    '-1': { segmento: 'EI',   modulo: 'Jardim II',   index: 6 },

    '1':  { segmento: 'EFAI', modulo: '1º Ano EF',   index: 1 },
    '2':  { segmento: 'EFAI', modulo: '2º Ano EF',   index: 2 },
    '3':  { segmento: 'EFAI', modulo: '3º Ano EF',   index: 3 },
    '4':  { segmento: 'EFAI', modulo: '4º Ano EF',   index: 4 },
    '5':  { segmento: 'EFAI', modulo: '5º Ano EF',   index: 5 },

    '6':  { segmento: 'EFAF', modulo: '6º Ano EF',   index: 1 },
    '7':  { segmento: 'EFAF', modulo: '7º Ano EF',   index: 2 },
    '8':  { segmento: 'EFAF', modulo: '8º Ano EF',   index: 3 },
    '9':  { segmento: 'EFAF', modulo: '9º Ano EF',   index: 4 },

    '10': { segmento: 'EM',   modulo: '1º Ano EM',   index: 1 },
    '11': { segmento: 'EM',   modulo: '2º Ano EM',   index: 2 },
    '12': { segmento: 'EM',   modulo: '3º Ano EM',   index: 3 },
};

/**
 * Ajustes manuais por CursoID, para quando o cadastro do Sponte estiver
 * inconsistente. Chaves aceitas:
 *   serieId     : forca outro SerieID (corrige serie apontada errada)
 *   passthrough : trata como curso livre, sem de-para
 *   ignorar     : nao gera curriculo/modulo/disciplina para este curso.
 *                 ATENCAO: o Ato/ReconhecimentoCurso dele CONTINUA entrando
 *                 na agregacao do segmento -- e o caso do CursoID 31, unico
 *                 registro da base com esses campos preenchidos.
 */
const OVERRIDES = {
    // "Maternal II" aponta para SerieID -4, que em "Series" e "Maternal I".
    '166': { serieId: '-3' },
    // "Producao de texto" esta tipado como Ensino Medio / 1a serie, mas e
    // extracurricular -- colidiria com o CursoID 212 "1o Ano EM".
    '273': { passthrough: true },
    // "9o Ano EF." (Ativo = 0) e duplicata do CursoID 177 "9o Ano EF".
    '31':  { ignorar: true },
};

/**
 * O CSV gerado pelo LayoutService e separado por TAB e nao tem escaping.
 * Ato e ReconhecimentoCurso sao texto livre, entao qualquer TAB ou quebra
 * de linha corromperia o arquivo em silencio.
 */
function LimparTexto(valor){
    if(valor === null || valor === undefined) return '';
    return `${valor}`.replaceAll('\r', ' ').replaceAll('\n', ' ').replaceAll('\t', ' ').trim();
}

function MontarPassthrough(curso, motivo){
    const sigla = LimparTexto(curso.Sigla);
    return {
        fluxo: 'passthrough',
        motivo,
        segmento: null,
        ignorar: false,
        id_course: `${curso.CursoID}`,
        courseName: LimparTexto(curso.Nome),
        level: LimparTexto(curso.TipoCurso),
        type: LimparTexto(curso.TipoCurso),
        code: sigla.replaceAll(' ', ''),
        moduleName: 'Módulo',
        moduleIndex: 1,
    };
}

/**
 * Resolve uma linha de "Cursos" para o destino no Gennera.
 * Ordem de decisao: override -> SerieID = 0 -> SERIES -> sem mapeamento.
 */
function ResolverCurso(curso){
    const override = OVERRIDES[`${curso.CursoID}`] || {};

    if(override.passthrough) return MontarPassthrough(curso, 'override');

    const temOverrideSerie = override.serieId !== undefined && override.serieId !== null;
    const serieId = LimparTexto(temOverrideSerie ? override.serieId : curso.SerieID);

    if(serieId === '' || serieId === '0') return MontarPassthrough(curso, 'serie-outra');

    const serie = SERIES[serieId];
    if(!serie) return MontarPassthrough(curso, 'serie-sem-mapeamento');

    const segmento = SEGMENTOS[serie.segmento];
    return {
        fluxo: 'segmento',
        motivo: temOverrideSerie ? 'override' : 'series',
        segmento: serie.segmento,
        ignorar: !!override.ignorar,
        id_course: segmento.id_course,
        courseName: segmento.name,
        level: segmento.level,
        type: segmento.type,
        code: `${segmento.sigla}-${segmento.id_course}`,
        moduleName: serie.modulo,
        moduleIndex: serie.index,
    };
}

/** Um curriculo por segmento x ano letivo. Passthrough mantem o GradeCursoId. */
function MontarIdCurriculo(resolvido, anoLetivo, gradeCursoId){
    if(resolvido.fluxo !== 'segmento') return `${gradeCursoId}`;
    const ano = LimparTexto(anoLetivo);
    // AnoLetivo zerado nao pode colapsar o segmento inteiro num curriculo so.
    if(ano === '' || ano === '0') return `${resolvido.id_course}X${gradeCursoId}`;
    return `${resolvido.id_course}${ano}`;
}

/** Ex.: "Ensino Fundamental Anos Iniciais - 2025". */
function MontarNomeCurriculo(resolvido, anoLetivo, nomeCurriculoSponte){
    if(resolvido.fluxo !== 'segmento') return LimparTexto(nomeCurriculoSponte);
    const ano = LimparTexto(anoLetivo);
    if(ano === '' || ano === '0') return resolvido.courseName;
    return `${resolvido.courseName} - ${ano}`;
}

function MontarIdModulo(resolvido, idCurriculum){
    if(resolvido.fluxo !== 'segmento') return `${idCurriculum}`;
    return `${idCurriculum}${resolvido.moduleIndex}`;
}

function ImprimirRelatorioDePara(titulo, arrPendencias){
    if(!arrPendencias || !arrPendencias.length) return;
    console.log(`\n[ATENCAO] ${titulo}: ${arrPendencias.length} ocorrencia(s):`);
    console.table(arrPendencias);
    console.log('');
}

module.exports = {
    SEGMENTOS,
    SERIES,
    OVERRIDES,
    LimparTexto,
    ResolverCurso,
    MontarIdCurriculo,
    MontarNomeCurriculo,
    MontarIdModulo,
    ImprimirRelatorioDePara,
};
