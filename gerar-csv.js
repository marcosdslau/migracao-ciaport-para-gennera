require('dotenv').config();

const destino = require('./database/database');
const PersonService = require('./src/services/PersonService');
const FiliationService = require('./src/services/FiliationService');
const LayoutService = require('./src/services/LayoutService');
const { log } = require('./src/services/LogService');

const fs = require('fs');
const path = require('path');

process.on('unhandledRejection', (err) => {
    const msg = err && err.message ? err.message : String(err);
    if (msg.includes('connection manager was closed')) return;
    throw err;
});

const MAX_FILIACOES_POR_ARQUIVO = 11000;

const PERFIS = [
    { profile: 5, nome: 'Responsavel' },
    { profile: 2, nome: 'Aluno' },
    { profile: 1, nome: 'Professor' },
    { profile: 4, nome: 'Funcionario' }
];

function arquivosGerados(antes) {
    const agora = fs.readdirSync('./csv').filter(f => f.toLowerCase().endsWith('.csv'));
    return agora.filter(f => !antes.includes(f));
}

function tamanho(arquivo) {
    const bytes = fs.statSync(path.join('./csv', arquivo)).size;
    if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
}

async function gerarPessoas() {
    const pessoaServico = new PersonService();

    console.log('');
    console.log('  --- CSV de PESSOAS ---');

    const [, meta] = await destino.query(`
        UPDATE tb_persons a SET cpf = ''
         WHERE a.profile = 2 AND COALESCE(a.cpf,'') <> ''
           AND EXISTS (SELECT 1 FROM tb_persons r WHERE r.profile = 5 AND r.cpf = a.cpf)
    `);
    const limpos = meta && meta.rowCount ? meta.rowCount : 0;
    console.log(`  CPF de aluno que pertence ao responsavel, limpo: ${limpos}`);

    const comEmail = await pessoaServico.BuscaTodasPessoasQueEmailNaoEVazio();
    const comCPF = await pessoaServico.BuscaTodasPessoasQueCPFNaoEVazio();
    const semNenhum = await pessoaServico.BuscaTodasPessoasQueCPFeEMAILeEVazio();

    const semEmailDup = pessoaServico.RemovePessoasDuplicadasPeloEmail(comEmail);
    const semCPFDup = pessoaServico.RemovePessoasDuplicadasPeloCPF(comCPF);
    const juntos = pessoaServico.RemovePessoasDuplicadasPeloEmail(semEmailDup.concat(semCPFDup));
    const semDuplicados = pessoaServico.RemovePessoasDuplicadasPeloCPF(juntos);
    const pessoas = pessoaServico.RemovePessoasDuplicadasPelo_id_Person(semDuplicados.concat(semNenhum));

    console.log(`  Com e-mail ......... ${comEmail.length}`);
    console.log(`  Com CPF ............ ${comCPF.length}`);
    console.log(`  Sem e-mail nem CPF . ${semNenhum.length}`);
    console.log(`  No arquivo ......... ${pessoas.length}`);

    const antes = fs.readdirSync('./csv').filter(f => f.toLowerCase().endsWith('.csv'));

    if (process.env.CSVPESSOAS_SEPARADO == 1) {
        console.log('');
        console.log('  Arquivos por perfil (na ordem de importacao):');
        let somados = 0;
        for (const p of PERFIS) {
            const doPerfil = pessoas.filter(x => x.dataValues.profile === p.profile);
            somados += doPerfil.length;
            if (doPerfil.length === 0) {
                console.log(`    ${p.nome.padEnd(12)} nenhum registro - arquivo nao gerado`);
                continue;
            }
            await new LayoutService(`Pessoas_${p.nome}`).CreateFile(doPerfil);
            console.log(`    ${p.nome.padEnd(12)} ${String(doPerfil.length).padStart(6)} linhas`);
        }

        const foraDosPerfis = pessoas.length - somados;
        if (foraDosPerfis > 0) {
            console.log(`    ATENCAO: ${foraDosPerfis} pessoa(s) com profile fora de 1/2/4/5 nao entraram em nenhum arquivo`);
            log(`CSV por perfil: ${foraDosPerfis} pessoa(s) com profile inesperado ficaram de fora`);
        }
    }

    if (process.env.CSVPESSOAS_UNICO == 1) {
        await new LayoutService('Pessoas').CreateFile(pessoas);
        console.log('');
        console.log(`  Arquivo unico com todos os perfis: ${pessoas.length} linhas`);
    }

    console.log('');
    for (const f of arquivosGerados(antes)) console.log(`  >> csv/${f}  (${tamanho(f)})`);
    log(`CSV de pessoas gerado: ${pessoas.length} linhas`);
    return pessoas.length;
}

async function gerarFiliacoes() {
    const filiacaoServico = new FiliationService();

    console.log('');
    console.log('  --- CSV de FILIACOES ---');

    const filiacoes = await filiacaoServico.BuscaTodasFiliations();
    console.log(`  Vinculos no data lake ... ${filiacoes.length}`);

    const lotes = [];
    for (let i = 0; i < filiacoes.length; i += MAX_FILIACOES_POR_ARQUIVO) {
        lotes.push(filiacoes.slice(i, i + MAX_FILIACOES_POR_ARQUIVO));
    }
    console.log(`  Arquivos a gerar ........ ${lotes.length} (maximo de ${MAX_FILIACOES_POR_ARQUIVO} por arquivo)`);

    const antes = fs.readdirSync('./csv').filter(f => f.toLowerCase().endsWith('.csv'));
    for (let i = 0; i < lotes.length; i++) {
        const nome = lotes.length === 1 ? 'Filiação' : `Filiação_Part_${i + 1}`;
        await new LayoutService(nome).CreateFile(lotes[i]);
    }

    for (const f of arquivosGerados(antes)) console.log(`  >> csv/${f}  (${tamanho(f)})`);
    log(`CSV de filiacoes gerado: ${filiacoes.length} linhas em ${lotes.length} arquivo(s)`);
    return filiacoes.length;
}

(async () => {
    try {
        if (!fs.existsSync('./csv')) fs.mkdirSync('./csv');

        await destino.authenticate();
        console.log('');
        console.log(`  Data lake: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);
        console.log(`  Saida    : ${path.resolve('./csv')}`);
        console.log('');
        console.log('  Etapas ligadas no .env:');
        console.log('    CSVPESSOAS ............ ' + (process.env.CSVPESSOAS == 1 ? 'SIM' : 'nao'));
        console.log('      CSVPESSOAS_SEPARADO . ' + (process.env.CSVPESSOAS_SEPARADO == 1 ? 'SIM (um arquivo por perfil)' : 'nao'));
        console.log('      CSVPESSOAS_UNICO .... ' + (process.env.CSVPESSOAS_UNICO == 1 ? 'SIM (todos num arquivo so)' : 'nao'));
        console.log('    CSVFILIACAO ........... ' + (process.env.CSVFILIACAO == 1 ? 'SIM' : 'nao'));

        if (process.env.CSVPESSOAS == 1 &&
            process.env.CSVPESSOAS_SEPARADO != 1 && process.env.CSVPESSOAS_UNICO != 1) {
            throw new Error('CSVPESSOAS esta ligado mas nem CSVPESSOAS_SEPARADO nem CSVPESSOAS_UNICO estao. Ligue ao menos um no .env.');
        }

        let gerou = false;
        if (process.env.CSVPESSOAS == 1) { await gerarPessoas(); gerou = true; }
        if (process.env.CSVFILIACAO == 1) { await gerarFiliacoes(); gerou = true; }

        console.log('');
        if (!gerou) {
            console.log('  Nenhuma etapa ligada. Coloque CSVPESSOAS=1 e/ou CSVFILIACAO=1 no .env.');
        } else {
            console.log('  Concluido. Os arquivos estao em ' + path.resolve('./csv'));
        }
        console.log('');
        process.exitCode = 0;
    } catch (err) {
        const mensagem = err && err.message ? err.message : err;
        console.error('');
        console.error('  FALHOU: ' + mensagem);
        if (err && err.stack) console.error(err.stack);
        log('FALHA ao gerar CSV: ' + mensagem);
        process.exitCode = 1;
    } finally {
        await new Promise(r => setTimeout(r, 1500));
        await destino.close().catch(() => {});
    }
})();
