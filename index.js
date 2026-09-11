const express = require('express');
const app = express();
require('dotenv').config();
const connection = require('./database/database');
const connectionSQLServer = require('./database/database-sql-server');
const bodyParser = require('body-parser'); ///Pegar dados de formulário
const indexErrors = require('./errors/indexErrors');

const cors = require('cors');
const options = {
    'exposedHeaders': 'download, nameFile, typeFile, Content-disposition'
}
app.use(cors(options));
//BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

/**
 * **************************************************
 *     Classe Customizada para Tratamento de 
 *                   Erros
 * **************************************************
 */

app.use(indexErrors);

const PORT = process.env.PORT || "8081";

// const LayoutService = require('./src/services/LayoutService');
// const PersonService = require('./src/services/PersonService');



// IMPORTAÇÃO DE ROTAS
// const LoginRoutes = require('./src/routers/LoginRoutes');
// app.use('/', LoginRoutes);

// const UserRoutes = require('./src/routers/UserRoutes');
// app.use('/', UserRoutes);

// const IntegrateConfigsRoutes = require('./src/routers/IntegrateConfigsRoutes');
// app.use('/', IntegrateConfigsRoutes);

// const PersonRoutes = require('./src/routers/PersonRoutes');
// app.use('/', PersonRoutes);


const PessoaService = require('./gennera/PessoaService');
const CursoService = require('./gennera/CursoService');
const MatriculaService = require('./gennera/MatriculaService');
const HistoricoService = require('./gennera/HistoricoService');
const OfertaService = require('./gennera/OfertaService');
const FinanceiroService = require('./gennera/FinanceiroService');

async function setSchedule() {

    console.log(`${new Date().toISOString()}: ==========> Task Iniciado`);
    try {
        //await GerarIds();
        const pessoaService = new PessoaService();
        await pessoaService.ProcessarPessoas();
        await pessoaService.ProcessarFiliacao();
        await pessoaService.SetPessoasImportadas();

        ///////////////// CURSOS /////////////
        const cursoService = new CursoService();
        await cursoService.ProcessarCursos();
        await cursoService.ProcessarCurriculos();
        await cursoService.ProcessarModulos();
        await cursoService.ProcessarDisciplinas();
        //await cursoService.ProcessarDisciplinasPreRequisito();
        //await cursoService.ProcessarDisciplinasEquivalencia();
        await cursoService.ProcessarDisciplinasEmentas();
        
        ///////////////// OFERTAS ////////
        const ofertaService = new OfertaService();
        await ofertaService.ProcessarOfertas();
        await ofertaService.ProcessarTurmasDaOfertas();
        await ofertaService.ProcessarDisciplinasDasTurmasOfertadas();
        ///////////////// MATRICULAS ////////
        const matriculaService = new MatriculaService();
        await matriculaService.Campanha();
        await matriculaService.ProcessarMatriculas();
        await matriculaService.ProcessarMatriculas_Disciplinas();
        await matriculaService.ProcessarMatriculasByQuery();
        await matriculaService.ProcessarMatriculasPos();
        
        //Históricos
        const historicoService = new HistoricoService();
        await historicoService.ProcessarRegistrosAcademicos();
        await historicoService.ProcessarHistorico_Disciplinas();
        await historicoService.ProcessarHistorico_Disciplinas_Equivalencias();
        await historicoService.ProcessarHistorico_DisciplinasProfessor();
        await historicoService.ProcessarHistorico_AtividadesComplementares();
        await historicoService.ProcessarHistorico_Disciplinas_Dispensadas();

        if(process.env.UPDATE_API_ENROLLMENT_RECORDS == 1){
            await historicoService.UpdateViaApiEnrollmentRecords();
        }
        if(process.env.RPA_HotFixHistorico == 1){
            await historicoService.RPA_HotFixHistorico();
        }
        if(process.env.RPA_HotFixHistoricoCargaHoraria == 1){
            await historicoService.RPA_HotFixHistoricoCargaHoraria();
        }
        
        if(process.env.RPA_HotFixHistoricoDisciplinaDispensa == 1){
            await historicoService.RPA_HotFixHistoricoDisciplinaDispensa();
        }

        if(process.env.RPA_HotFixHistoricoDisciplinaDispensaCleanProfessorNull == 1){
            await historicoService.RPA_HotFixHistoricoDisciplinaDispensaCleanProfessorNull();
        }

        if(process.env.RPA_HotFixHistoricoDisciplinaDispensa_CursadasEmOutroCurso == 1){
            await historicoService.RPA_HotFixHistoricoDisciplinaDispensa_CursadasEmOutroCurso();
        }
        if(process.env.RPA_HotFixHistoricoDisciplinaDispensa_professor == 1){
            await historicoService.RPA_HotFixHistoricoDisciplinaDispensa_professor();
        }
        if(process.env.RPA_HotFixHistoricoDisciplina_EquivalenciaDisciplina == 1){
            await historicoService.RPA_HotFixHistoricoDisciplina_EquivalenciaDisciplina();
        }
        
        

        //FINANCEIRO
        const financeiroService = new FinanceiroService();
        await financeiroService.ProcessarDescontos();
        await financeiroService.ProcessarItens();
        await financeiroService.ProcessarContratos();
        await financeiroService.ProcessarCompras();
        await financeiroService.ProcessarFaturas();
        await financeiroService.ProcessarFaturasManual();
        await financeiroService.ProcessarFaturasCorrecao();
        await financeiroService.ProcessarFaturas_Descontos();
        await financeiroService.ProcessarFaturas_Multas();
        await financeiroService.ProcessarFaturas_Pagamentos();

    } catch (err) {
        const message = err.message ? err.message : err;
        console.log(`${new Date().toISOString()}: ` + message);
    } finally {
        console.log(`${new Date().toISOString()}: ==========> Task Finalizada`);
    }
}


app.listen(PORT, async () => {
    try {
        console.log("Servidor em execução! Porta: "+PORT);
        //Conexão com o Banco de Dados
        await connection.authenticate();
        console.log(`Conectado ao Banco: ${process.env.DB_NAME}`);

        //await connectionSQLServer.authenticate();
        console.log(`Conectado ao Banco: ${process.env.DB_SQL_NAME}`);
        //const pessoas = await connectionSQLServer.query(`SELECT top 10 * FROM [GEN_PESSOA]`);
        // console.log(pessoas)
        await setSchedule();
    } catch (err) {
        const message = err.message ? err.message : err;
        const code = err.code ? err.code : err;
        console.log(message);
        console.log(code);
    }
});

