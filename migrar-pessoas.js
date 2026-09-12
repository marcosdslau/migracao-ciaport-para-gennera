require('dotenv').config();

const destino = require('./database/database');
const origem = require('./database/database-migracao');
const PessoaService = require('./gennera/PessoaService');
const { log } = require('./src/services/LogService');

function resumoConfiguracao() {
    const flag = nome => (process.env[nome] == 1 ? 'SIM' : 'nao');
    console.log('');
    console.log('  Origem  : ' + process.env.DB_MIG_NAME + ' @ ' + process.env.DB_MIG_HOST);
    console.log('  Destino : ' + process.env.DB_NAME + ' @ ' + process.env.DB_HOST);
    console.log('');
    console.log('  Etapas ligadas no .env:');
    console.log('    PESSOAS ................ ' + flag('PESSOAS') + '   (chave geral)');
    console.log('    PESSOASRESPONSAVEIS .... ' + flag('PESSOASRESPONSAVEIS'));
    console.log('    PESSOASALUNOS .......... ' + flag('PESSOASALUNOS'));
    console.log('    PESSOASPROFESSOR ....... ' + flag('PESSOASPROFESSOR'));
    console.log('    PESSOASFUNCIONARIOS .... ' + flag('PESSOASFUNCIONARIOS'));
    console.log('    FILIACAO ............... ' + flag('FILIACAO'));
    console.log('');
}

async function conferirResultado() {
    const [pessoas] = await destino.query(`
        SELECT profile, type, COUNT(*)::int AS quantidade
          FROM tb_persons
         GROUP BY profile, type
         ORDER BY profile NULLS LAST, type
    `);
    const [filiacoes] = await destino.query(`
        SELECT relationship, is_financial_responsible, COUNT(*)::int AS quantidade
          FROM tb_filiations
         GROUP BY relationship, is_financial_responsible
         ORDER BY quantidade DESC
    `);

    const nomePerfil = { 1: 'Professor', 2: 'Aluno', 4: 'Funcionario', 5: 'Responsavel' };

    console.log('');
    console.log('  ===== tb_persons =====');
    let total = 0;
    for (const p of pessoas) {
        total += p.quantidade;
        const rotulo = nomePerfil[p.profile] || 'Sem perfil';
        console.log(`    profile ${String(p.profile ?? 'null').padEnd(4)} type ${p.type}  ${rotulo.padEnd(12)} ${String(p.quantidade).padStart(6)}`);
    }
    console.log(`    ${''.padEnd(28)} TOTAL ${String(total).padStart(6)}`);

    console.log('');
    console.log('  ===== tb_filiations =====');
    let totalFil = 0;
    for (const f of filiacoes) {
        totalFil += f.quantidade;
        const fin = f.is_financial_responsible ? 'financeiro' : '          ';
        console.log(`    ${String(f.relationship).padEnd(14)} ${fin} ${String(f.quantidade).padStart(6)}`);
    }
    console.log(`    ${''.padEnd(26)} TOTAL ${String(totalFil).padStart(6)}`);
    console.log('');
}

(async () => {
    const inicio = Date.now();
    try {
        resumoConfiguracao();

        await origem.authenticate();
        console.log('  Conectado a origem.');
        await destino.authenticate();
        console.log('  Conectado ao destino.');

        const pessoaService = new PessoaService();
        await pessoaService.ProcessarPessoas();
        await pessoaService.ProcessarFiliacao();

        await conferirResultado();

        const minutos = ((Date.now() - inicio) / 60000).toFixed(1);
        console.log(`  Concluido em ${minutos} min.`);
        log(`Migracao de pessoas concluida em ${minutos} min`);
        process.exitCode = 0;
    } catch (err) {
        const mensagem = err && err.message ? err.message : err;
        console.error('');
        console.error('  FALHOU: ' + mensagem);
        if (err && err.stack) console.error(err.stack);
        log('FALHA na migracao de pessoas: ' + mensagem);
        process.exitCode = 1;
    } finally {
        await origem.close().catch(() => {});
        await destino.close().catch(() => {});
    }
})();
