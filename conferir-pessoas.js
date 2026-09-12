require('dotenv').config();

const origem = require('./database/database-migracao');
const N = require('./gennera/normalize');

const AMOSTRA = parseInt(process.env.CONFERIR_AMOSTRA || '5', 10);

function titulo(texto) {
    console.log('');
    console.log('=' .repeat(78));
    console.log('  ' + texto);
    console.log('='.repeat(78));
}

function subtitulo(texto) {
    console.log('');
    console.log('  --- ' + texto + ' ---');
}

function pct(parte, total) {
    if (!total) return '0%';
    return ((parte / total) * 100).toFixed(1) + '%';
}

async function conferirChaves() {
    titulo('1. CHAVES DE PESSOA (id_person) - colisao entre origens');

    const [alunos] = await origem.query('SELECT "CODIGO" FROM "ALUNOS"');
    const [resps] = await origem.query('SELECT "CODIGO" FROM "ALUNOSRESP"');
    const [profs] = await origem.query('SELECT "CODIGO" FROM "CADPROFE"');
    const [funcs] = await origem.query('SELECT "CODIGO" FROM "CADFUNC"');

    const grupos = [
        { nome: 'Aluno       ', regra: 'CODIGO direto     ', ids: alunos.map(r => N.idAluno(r.CODIGO)) },
        { nome: 'Responsavel ', regra: "777 + CODIGO + 777", ids: resps.map(r => N.idResponsavel(r.CODIGO)) },
        { nome: 'Professor   ', regra: "999 + CODIGO + 999", ids: profs.map(r => N.idProfessor(r.CODIGO)) },
        { nome: 'Funcionario ', regra: "666 + CODIGO + 666", ids: funcs.map(r => N.idFuncionario(r.CODIGO)) }
    ];

    const todos = new Map();
    const colisoes = [];
    let duplicadosInternos = 0;

    for (const g of grupos) {
        const vistos = new Set();
        let exemplo = g.ids[0];
        for (const id of g.ids) {
            if (vistos.has(id)) { duplicadosInternos++; continue; }
            vistos.add(id);
            if (todos.has(id)) colisoes.push({ id, a: todos.get(id), b: g.nome.trim() });
            else todos.set(id, g.nome.trim());
        }
        console.log(`  ${g.nome} ${g.regra}  ${String(g.ids.length).padStart(6)} registros   exemplo: ${exemplo}`);
    }

    console.log('');
    console.log(`  Total de pessoas previstas .......... ${todos.size}`);
    console.log(`  Duplicados dentro da mesma origem .. ${duplicadosInternos}`);
    if (colisoes.length === 0) {
        console.log('  Colisoes entre origens ............. 0   >>> OK');
    } else {
        console.log(`  Colisoes entre origens ............. ${colisoes.length}   >>> PROBLEMA`);
        for (const c of colisoes.slice(0, 10)) console.log(`      ${c.id}: ${c.a} x ${c.b}`);
    }

    const maior = [...todos.keys()].reduce((a, b) => (b.length > a.length ? b : a), '');
    console.log(`  Maior chave gerada ................. ${maior} (${maior.length} caracteres)`);
    const acimaDeInt = [...todos.keys()].filter(id => /^\d+$/.test(id) && Number(id) > 2147483647).length;
    console.log(`  Chaves acima do limite de INTEGER .. ${acimaDeInt}` +
        (acimaDeInt > 0 ? '   >>> exige a migration 20260912160000 (id_person como texto)' : ''));
}

async function conferirRegras() {
    titulo('2. REGRAS DE CONVERSAO - taxa de aproveitamento na base inteira');

    const [alunos] = await origem.query(`
        SELECT "CODIGO", "NOME", "NASCIMENTO", "CIC_CPF", "EMAIL",
               "FONE", "CELULAR", "SEXO", "RG"
          FROM "ALUNOS"
    `);

    let nascOk = 0, nascPreenchido = 0;
    let cpfOk = 0, cpfPreenchido = 0;
    let emailOk = 0, emailPreenchido = 0;
    let foneComDdd = 0, foneSemDdd = 0, fonePreenchido = 0;
    let sexoOk = 0;
    const cpfsVistos = new Set(); let cpfDuplicado = 0;
    const emailsVistos = new Set(); let emailDuplicado = 0;

    for (const a of alunos) {
        if (N.txt(a.NASCIMENTO).replace(/^'/, '') !== '') { nascPreenchido++; if (N.data(a.NASCIMENTO)) nascOk++; }
        if (N.txt(a.CIC_CPF) !== '') {
            cpfPreenchido++;
            const c = N.cpf(a.CIC_CPF);
            if (c) { cpfOk++; if (cpfsVistos.has(c)) cpfDuplicado++; else cpfsVistos.add(c); }
        }
        if (N.txt(a.EMAIL) !== '') {
            emailPreenchido++;
            const e = N.email(a.EMAIL);
            if (e) { emailOk++; if (emailsVistos.has(e)) emailDuplicado++; else emailsVistos.add(e); }
        }
        for (const bruto of [a.FONE, a.CELULAR]) {
            if (N.txt(bruto) === '') continue;
            fonePreenchido++;
            const t = N.telefone(bruto);
            if (t.numero === '') continue;
            if (t.ddd) foneComDdd++; else foneSemDdd++;
        }
        if (N.sexo(a.SEXO)) sexoOk++;
    }

    subtitulo('ALUNOS (' + alunos.length + ' registros)');
    console.log(`  Data de nascimento  : ${nascOk}/${nascPreenchido} convertidas (${pct(nascOk, nascPreenchido)} do que vinha preenchido)`);
    console.log(`  CPF                 : ${cpfOk}/${cpfPreenchido} validos (${pct(cpfOk, cpfPreenchido)}) - ${cpfPreenchido - cpfOk} reprovados no digito verificador`);
    console.log(`  CPF duplicado       : ${cpfDuplicado} (o segundo entra em branco)`);
    console.log(`  E-mail              : ${emailOk}/${emailPreenchido} aproveitados (${pct(emailOk, emailPreenchido)})`);
    console.log(`  E-mail duplicado    : ${emailDuplicado} (o segundo entra em branco)`);
    console.log(`  Sexo                : ${sexoOk}/${alunos.length} reconhecidos`);
    console.log(`  Telefone com DDD    : ${foneComDdd}`);
    console.log(`  Telefone sem DDD    : ${foneSemDdd}  >>> decisao D3: DDD fica em branco`);
}

async function conferirEnderecos() {
    titulo('3. PARSER DE ENDERECO (ENDALNS)');

    const [linhas] = await origem.query('SELECT "ALUNO", "ENDERECO" FROM "ENDALNS"');
    let comNumero = 0, semNumero = 0, sn = 0, numeroLongo = 0, complementoLongo = 0;
    const exemplosSemNumero = [];

    for (const l of linhas) {
        const bruto = N.txt(l.ENDERECO);
        if (bruto === '') continue;
        const p = N.endereco(bruto);
        if (p.street_number === 'S/N') sn++;
        else if (p.street_number === '') { semNumero++; if (exemplosSemNumero.length < 8) exemplosSemNumero.push(bruto); }
        else comNumero++;
        if (N.limparNumeroEndereco(p.street_number) === '' && p.street_number !== '') numeroLongo++;
        if (N.limparComplemento(p.complement) === '' && p.complement !== '') complementoLongo++;
    }

    const total = comNumero + semNumero + sn;
    console.log(`  Enderecos analisados ............. ${total}`);
    console.log(`  Numero separado com sucesso ...... ${comNumero} (${pct(comNumero, total)})`);
    console.log(`  Marcados como S/N ................ ${sn}`);
    console.log(`  Sem numero identificavel ......... ${semNumero} (${pct(semNumero, total)}) - texto inteiro vai para street`);
    console.log(`  Numero descartado por >5 chars ... ${numeroLongo} (limite da Gennera)`);
    console.log(`  Complemento descartado >11 chars . ${complementoLongo} (limite da Gennera)`);

    if (exemplosSemNumero.length) {
        subtitulo('Exemplos em que o numero nao foi identificado');
        for (const e of exemplosSemNumero) console.log('    ' + e);
    }

    subtitulo('Amostra antes -> depois');
    const [amostra] = await origem.query(`SELECT "ENDERECO" FROM "ENDALNS" WHERE trim(COALESCE("ENDERECO",'')) <> '' LIMIT ${AMOSTRA * 2}`);
    for (const l of amostra) {
        const p = N.endereco(l.ENDERECO);
        console.log(`    "${N.txt(l.ENDERECO)}"`);
        console.log(`       street="${p.street}"  numero="${N.limparNumeroEndereco(p.street_number)}"  compl="${N.limparComplemento(p.complement)}"`);
    }
}

async function amostraPessoas() {
    titulo('4. AMOSTRA DE ALUNOS - origem bruta -> valor que sera gravado');

    const [linhas] = await origem.query(`
        SELECT "CODIGO", "NOME", "SEXO", "NASCIMENTO", "CIC_CPF", "RG",
               "EMAIL", "CELULAR", "NACIONALIDADE", "CIDADENASCIMENTO", "ESTADOCIVIL"
          FROM "ALUNOS"
         WHERE trim(COALESCE("CIC_CPF",'')) <> ''
         LIMIT ${AMOSTRA}
    `);

    const [cid] = await origem.query('SELECT "CODIGO","CIDADE","UF" FROM "CADCID"');
    const [pai] = await origem.query('SELECT "CODIGO","PAIS" FROM "PAISES"');
    const [ecv] = await origem.query('SELECT "CODIGO","ESTADOCIVIL" FROM "CADETDCV"');
    const mCid = new Map(cid.map(r => [N.txt(r.CODIGO), { c: N.txt(r.CIDADE), uf: N.txt(r.UF) }]));
    const mPai = new Map(pai.map(r => [N.txt(r.CODIGO), N.txt(r.PAIS)]));
    const mEcv = new Map(ecv.map(r => [N.txt(r.CODIGO), N.txt(r.ESTADOCIVIL)]));

    for (const a of linhas) {
        const cel = N.telefone(a.CELULAR);
        const nasc = mCid.get(N.codigo(a.CIDADENASCIMENTO) || '') || { c: '', uf: '' };
        console.log('');
        console.log(`  ALUNOS.CODIGO = ${a.CODIGO}  ->  id_person = ${N.idAluno(a.CODIGO)}`);
        const linha = (campo, bruto, tratado) =>
            console.log(`    ${campo.padEnd(22)} ${JSON.stringify(bruto).padEnd(28)} -> ${JSON.stringify(tratado)}`);
        linha('name', a.NOME, N.txt(a.NOME));
        linha('gender', a.SEXO, N.sexo(a.SEXO));
        linha('birthdate', a.NASCIMENTO, N.data(a.NASCIMENTO));
        linha('cpf', a.CIC_CPF, N.cpf(a.CIC_CPF));
        linha('rg', a.RG, N.txt(a.RG).replace(/[.\-/\s]/g, ''));
        linha('email', a.EMAIL, N.email(a.EMAIL));
        linha('mobile_phone', a.CELULAR, cel.ddd + '|' + cel.numero);
        linha('nationality', a.NACIONALIDADE, mPai.get(N.codigo(a.NACIONALIDADE) || '') || '');
        linha('birthplace', a.CIDADENASCIMENTO, nasc.c + (nasc.uf ? '/' + nasc.uf : ''));
        linha('civil_status', a.ESTADOCIVIL, mEcv.get(N.codigo(a.ESTADOCIVIL) || '') || '');
    }
}

async function conferirFiliacoes() {
    titulo('5. FILIACOES previstas');

    const [linhas] = await origem.query(`
        SELECT "CODIGO","MAE","PAI","RESP","PED",
               "GRAUPARENTESCOMAE","GRAUPARENTESCOPAI","GRAUPARENTESCORESP","GRAUPARENTESCOPED"
          FROM "ALUNOS"
    `);
    const [resps] = await origem.query('SELECT "CODIGO" FROM "ALUNOSRESP"');
    const existentes = new Set(resps.map(r => N.txt(r.CODIGO)));

    let total = 0, semNenhum = 0, orfas = 0, financeiras = 0;
    const porRelacao = new Map();

    for (const a of linhas) {
        const codMae = N.codigo(a.MAE);
        const codPai = N.codigo(a.PAI);
        const codResp = N.codigo(a.RESP);
        const codPed = N.codigo(a.PED);

        const porPessoa = new Map();
        const juntar = (cod, relationship, financeiro, grauBruto) => {
            if (!cod) return;
            if (!existentes.has(cod)) { orfas++; return; }
            const grauTexto = N.txt(grauBruto);
            const rel = grauTexto !== '' ? N.parentesco(grauTexto) : relationship;
            const atual = porPessoa.get(cod);
            if (!atual) { porPessoa.set(cod, { relationship: rel, financeiro }); return; }
            if (atual.relationship === 'responsável' && rel !== 'responsável') atual.relationship = rel;
            atual.financeiro = atual.financeiro || financeiro;
        };

        juntar(codMae, 'mãe', codMae === codResp, a.GRAUPARENTESCOMAE);
        juntar(codPai, 'pai', codPai === codResp, a.GRAUPARENTESCOPAI);
        juntar(codResp, 'responsável', true, a.GRAUPARENTESCORESP);
        juntar(codPed, 'responsável', codPed === codResp, a.GRAUPARENTESCOPED);

        for (const [, v] of porPessoa) {
            porRelacao.set(v.relationship, (porRelacao.get(v.relationship) || 0) + 1);
            if (v.financeiro) financeiras++;
            total++;
        }
        if (porPessoa.size === 0) semNenhum++;
    }

    console.log(`  Vinculos que serao gravados ........ ${total}`);
    console.log(`  Alunos sem nenhum responsavel ...... ${semNenhum}`);
    console.log(`  Responsavel financeiro (ALUNOS.RESP) ${financeiras}   >>> decisao D2`);
    console.log(`  FKs apontando para responsavel      `);
    console.log(`     inexistente em ALUNOSRESP ....... ${orfas}` + (orfas ? '   >>> serao ignoradas' : ''));
    subtitulo('Distribuicao por relationship');
    for (const [rel, q] of [...porRelacao.entries()].sort((a, b) => b[1] - a[1])) {
        console.log(`    ${rel.padEnd(16)} ${String(q).padStart(6)}`);
    }
}

(async () => {
    try {
        await origem.authenticate();
        console.log('');
        console.log(`  SIMULACAO - nenhuma linha sera gravada.`);
        console.log(`  Origem: ${process.env.DB_MIG_NAME} @ ${process.env.DB_MIG_HOST}`);

        await conferirChaves();
        await conferirRegras();
        await conferirEnderecos();
        await amostraPessoas();
        await conferirFiliacoes();

        console.log('');
        console.log('='.repeat(78));
        console.log('  Simulacao concluida. Nada foi gravado.');
        console.log('='.repeat(78));
        console.log('');
    } catch (err) {
        console.error('  FALHOU: ' + (err && err.message ? err.message : err));
        if (err && err.stack) console.error(err.stack);
        process.exitCode = 1;
    } finally {
        await origem.close().catch(() => {});
    }
})();
