require('dotenv').config();
const LayoutService = require('../src/services/LayoutService');
const PersonService = require('../src/services/PersonService');
const FiliationService = require('../src/services/FiliationService');
const connectionSQLServer = require('../database/database-migracao');
const pessoasImportadas = require('../src/tipos/idPerson-pessoas-importadas');
const {log} = require('../src/services/LogService');

function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function validarCPF(cpf) {	
	if(cpf){
        cpf = cpf.replace(/[^\d]+/g,'');	
        if(cpf == '') return false;	
        // Elimina CPFs invalidos conhecidos	
        if (cpf.length != 11 || 
            cpf == "00000000000" || 
            cpf == "11111111111" || 
            cpf == "22222222222" || 
            cpf == "33333333333" || 
            cpf == "44444444444" || 
            cpf == "55555555555" || 
            cpf == "66666666666" || 
            cpf == "77777777777" || 
            cpf == "88888888888" || 
            cpf == "99999999999")
                return false;		
        // Valida 1o digito	
        add = 0;	
        for (i=0; i < 9; i ++)		
            add += parseInt(cpf.charAt(i)) * (10 - i);	
            rev = 11 - (add % 11);	
            if (rev == 10 || rev == 11)		
                rev = 0;	
            if (rev != parseInt(cpf.charAt(9)))		
                return false;		
        // Valida 2o digito	
        add = 0;	
        for (i = 0; i < 10; i ++)		
            add += parseInt(cpf.charAt(i)) * (11 - i);	
        rev = 11 - (add % 11);	
        if (rev == 10 || rev == 11)	
            rev = 0;	
        if (rev != parseInt(cpf.charAt(10)))
            return false;		
        return true;   
    } else{
        return false;
    }
}

function limparComplemento(complemento) {
    if(!complemento) return '';
    const texto = `${complemento}`.trim();
    // Gennera aceita no máximo 11 caracteres em "complement"
    return texto.length > 11 ? '' : texto;
}

function normalizaParentesco(descricao) {
    if (!descricao) return 'responsável';
    // Sponte traz "Pai", "Mãe", "Responsável", "Pai - Falecido" e "Mãe - Falecida";
    // a Gennera so aceita pai, mãe, irmão, irmã, avô, avó, adotador, responsável, outros
    const tipo = `${descricao}`.toLowerCase().split('-')[0].trim();
    if (tipo === 'pai') return 'pai';
    if (tipo === 'mãe' || tipo === 'mae') return 'mãe';
    return 'responsável';
}

function limparNumeroEndereco(numero) {
    if(!numero) return '';
    const texto = `${numero}`.trim();
    // Gennera aceita no máximo 5 caracteres em "street_number"
    return texto.length > 5 ? '' : texto;
}

class PessoaService{

    async ProcessarPessoas(){
        const pessoaServico = new PersonService();
        if (process.env.PESSOAS == 1) {
            console.log('INICIO PROCESSANDO PESSOAS')
            log('INICIO PROCESSANDO PESSOAS')
            //////////////////////////////// INICIO ALUNOS ////////////////////////////////

            const pessoasModel = await connectionSQLServer.query(`

                SELECT
	"Alunos"."AlunoID"
	, "Alunos"."ResponsavelFinanceiroID"
	, "Alunos"."EstadoCivilID"
	, "EstadosCivis"."Descricao" as "EstadoCivil"
	, "Alunos"."Nome"
	, COALESCE(CAST("Alunos"."DataNascimento" AS text), '') AS "DataNascimento"
	, (CASE 
		WHEN "Alunos"."Sexo" = 'F' THEN 'Feminino'
		WHEN "Alunos"."Sexo" = 'M' THEN 'Masculino'
		ELSE '' END
	)AS "Sexo"
	, COALESCE(CAST("Alunos"."CPF" AS text), '') AS "CPF"
	, COALESCE(CAST("Alunos"."RG" AS text), '') AS "RG"
	, COALESCE(CAST("Alunos"."Endereco" AS text), '') AS "Endereco"
	, COALESCE(CAST("Alunos"."CEP" AS text), '') AS "CEP"
	, COALESCE(CAST("Alunos"."ComplementoEndereco" AS text), '') AS "ComplementoEndereco"
	, COALESCE(CAST("Cidades"."Nome" AS text), '') AS "Cidade"
	, COALESCE(CAST("Cidades"."Estado" AS text), '') AS "Estado"
	, COALESCE(CAST("Bairros"."Nome" AS text), '') AS "Bairro"
	, COALESCE(CAST("Alunos"."FoneResidencial" AS text), '') "FoneResidencial"
	, COALESCE(CAST("Alunos"."FoneCelular" AS text), '') AS"FoneCelular"
	, COALESCE(CAST("Alunos"."Profissao" AS text), '') AS "Profissao"
	, COALESCE(CAST("EmailsPessoas"."Email" AS text) ,'') AS "Email"
	, COALESCE(CAST("Alunos"."FoneComercial" AS text), '') AS "FoneComercial"
	, CAST("Alunos"."TituloEleitor" AS text) AS "TituloEleitor"
	, CAST("Alunos"."DocumentoMilitar" AS text) AS "DocumentoMilitar"
	, "Alunos"."CertidaoNascimento"
	,CAST("Alunos"."CertidaoFolha" AS text) AS "CertidaoFolha"
	, CAST("Alunos"."CertidaoLivro" AS text) AS "CertidaoLivro"
	, CAST("Alunos"."CertidaoTermo" AS text) AS "CertidaoTermo"
	, "Alunos"."CertidaoDataEmissao"
	, "Alunos"."CertidaoCartorio"
	, "Alunos"."CertidaoUF"
	, "Alunos"."DataExpedicaoRG"
	, COALESCE(CAST("Alunos"."OrgaoExpedidorRG" AS text), '') AS"OrgaoExpedidorRG"
	, (CASE 
		WHEN "Alunos"."Cor" = 1 THEN 'Branca'
		WHEN "Alunos"."Cor" = 2 THEN 'Preta'
		WHEN "Alunos"."Cor" = 0 THEN 'Não Declarada'
		WHEN "Alunos"."Cor" = 3 THEN 'Parda'
		WHEN "Alunos"."Cor" = 4 THEN 'Amarela'
		WHEN "Alunos"."Cor" = 5 THEN 'Indígena'
		ELSE 'Não Declarada' END
	  ) as "Etinia"
	, "Alunos"."TipoCertidao"
	, "Alunos"."NumeroMatriculaCertidao"
	, COALESCE(CAST("Alunos"."TituloEleitorZona" AS text),'') AS "TituloEleitorZona"
	, CAST("Alunos"."TituloEleitorSessao" AS text) AS "TituloEleitorSessao"
	, CAST("Alunos"."TituloEleitorDataEmissao" AS text) AS "TituloEleitorDataEmissao"
	, CAST("Alunos"."NroDocMilitar" AS text) AS "NroDocMilitar"
	, CAST("Alunos"."NroPassaporte" AS text) AS "NroPassaporte"
	, COALESCE(CAST("Alunos"."NumeroEndereco" AS text),'') AS "NumeroEndereco"
	, CAST("Alunos"."NomeSocial" AS text) AS "NomeSocial"
	,'Brasileira' AS "Nacionalidade"
	,'Brasil' AS "Pais"
	
FROM "Alunos" 
	LEFT JOIN "EstadosCivis" ON "EstadosCivis"."EstadoCivilID" = "Alunos"."EstadoCivilID"
	LEFT JOIN "Cidades" ON "Cidades"."CidadeID" = "Alunos"."CidadeID"
	LEFT JOIN "Bairros" ON "Bairros"."BairroID" = "Alunos"."BairroID"
	LEFT JOIN "EmailsPessoas" ON "EmailsPessoas"."AlunoID" = "Alunos"."AlunoID"
/* FILTRO DO CLIENTE ANTERIOR (FAAR) - DESATIVADO PARA sponte_fato_cpa
where "Alunos"."AlunoID" in (
'122', '143', '153', '168', '192', '237', '268', '366', '383', '410', '413', '498', '535', '623', '632', '712', '721', '728', '752', '768', '851', '860', '867', '872', '902', '904', '967', '1133', '1231', '1264', '1269', '1280', '1290', '1293', '1294', '1301', '1323', '1327', '1359', '1428', '1429', '1430', '1431', '1432', '1434', '1435', '1436', '1437', '1438', '1439', '1440', '1442', '1444', '1445', '1454', '1455', '1471', '1517', '1575', '1582', '1587', '1593', '1602', '1606', '1611', '1614', '1620', '1636', '1645', '1647', '1665', '1667', '1668', '1669', '1671', '1672', '1675', '1677', '1680', '1683', '1684', '1687', '1688', '1689', '1690', '1691', '1693', '1696', '1697', '1699', '1700', '1704', '1705', '1706', '1707', '1710', '1713', '1714', '1716', '1718', '1720', '1721', '1722', '1723', '1724', '1725', '1726', '1727', '1728', '1729', '1730', '1731', '1732', '1733', '1734', '1735', '1736', '1738', '1739'
)

LIMIT 50
*/


            `);
            const pessoas = pessoasModel[0];
            let count = 1;
            if(process.env.PESSOASALUNOS == 1){
                for (let pessoa of pessoas) {
                    console.log(`Processando ${count} de ${pessoas.length} ALUNOS`);
                    log(`Processando ${count} de ${pessoas.length} ALUNOS`);
                    const { AlunoID, EstadoCivil, Nome, DataNascimento, Sexo, CPF, RG, DataExpedicaoRG, OrgaoExpedidorRG,  Endereco, NumeroEndereco, Cidade, Estado, Bairro, CEP, ComplementoEndereco, FoneResidencial,
                        FoneCelular, Profissao, Email, FoneComercial, TituloEleitor, DocumentoMilitar, CertidaoNascimento, CertidaoFolha,
                        CertidaoLivro, CertidaoTermo, CertidaoDataEmissao, CertidaoCartorio, CertidaoUF, NumeroMatriculaCertidao,  Etinia, 
                        TituloEleitorZona, TituloEleitorSessao, TituloEleitorDataEmissao, NroDocMilitar, NroPassaporte, NomeSocial, Nacionalidade, Pais  } = pessoa;
                    let idPerson = parseInt(AlunoID);
                    let idStudent = idPerson;

                    let profile = 2;
                    let dtNascimento = DataNascimento ? DataNascimento.split(' ')[0] : '';
                    let dtTituloEleitor = TituloEleitorDataEmissao ? TituloEleitorDataEmissao.split(' ')[0] : '';

                    if (dtNascimento) {
                        let [mes, dia, ano] = dtNascimento.split('/');
                        dia = parseInt(dia);
                        mes = parseInt(mes);
                        if(mes == 9) {
                            console.log('achei')
                        }
                        dtNascimento = `${dia < 10 ? '0'+dia : dia}/${mes < 10 ? '0'+mes : mes}/${ano}`;
                    }
                    if (dtTituloEleitor) {
                        let [mes, dia, ano] = dtTituloEleitor.split('/');
                        dia = parseInt(dia);
                        mes = parseInt(mes);
                        dtTituloEleitor = `${dia < 10 ? '0'+dia : dia}/${mes < 10 ? '0'+mes : mes}/${ano}`;
                    }

                    let rg_issue_date = DataExpedicaoRG ? DataExpedicaoRG.split(' ')[0] : '';
                    if (rg_issue_date){
                        let [mes, dia, ano] = rg_issue_date.split('/');
                        dia = parseInt(dia);
                        mes = parseInt(mes);
                        rg_issue_date = `${dia < 10 ? '0'+dia : dia}/${mes < 10 ? '0'+mes : mes}/${ano}`;
                    }

                    let sexo = Sexo || '';
                    let etinia = Etinia || '';
                    let estadoCivil = EstadoCivil || '';

                    let nacionalidade = Nacionalidade || '';
                    let birth_country = Pais || '';

                    let email = Email|| "";
                    if(email){
                        let emailAux = email.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                        if(validateEmail(emailAux)){
                            //emailAux = emailAux.split(/(?<=[a-z0-9])(?=[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i)[0];
                            emailAux = emailAux.replaceAll(/[^a-zA-Z0-9@._]/g, '');
                            emailAux = emailAux.replace(/\.$/, '');
                            emailAux = emailAux.replace(/\.c$/, '.com');
                            emailAux = emailAux.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})(.*)/, '$1');
                            emailAux = emailAux.replaceAll('.@.', '@');
                            emailAux = emailAux.replaceAll('.@', '@');
                            emailAux = emailAux.replaceAll('@.', '@');
                            emailAux = emailAux.replaceAll(' ', '');
                            email = emailAux;
                        }
                    }
                    let ensinoMedioRegime = '';

                    let cep_clean = CEP;
                    if(cep_clean){
                        cep_clean = cep_clean.replaceAll('.', '');
                        cep_clean = cep_clean.replaceAll('-', '');
                        cep_clean = cep_clean.replaceAll(' ', '');
                    }

                    if(Nome) {
                        let nome = Nome;
                        let auxname = `${nome}`;
                        let arr = auxname.split(' ');
                        if(arr.length == 1) nome += ' ajustar sponte';

                        let foundedEmail = await pessoaServico.BuscarPessoaPeloEmail(email);
                        if(foundedEmail != null) email = '';

                        let rg_clean = RG;
                        if(rg_clean){
                            rg_clean = rg_clean.replaceAll(' ', '');
                            rg_clean = rg_clean.replaceAll('.', '');
                            rg_clean = rg_clean.replaceAll('/', '');
                            rg_clean = rg_clean.replaceAll('-', '');
                        }

                        let cpf_clean = CPF;
                        if(cpf_clean){
                            cpf_clean = cpf_clean.replaceAll(' ', '');
                            cpf_clean = cpf_clean.replaceAll('.', '');
                            cpf_clean = cpf_clean.replaceAll('/', '');
                            cpf_clean = cpf_clean.replaceAll('-', '');
                        }

                        let foundedCnpj = await pessoaServico.BuscarPessoaPeloEmail(cpf_clean);
                        if(foundedCnpj != null) cpf_clean = '';

                        await pessoaServico.RegistraPessoa(idPerson, idStudent, profile, 1, nome || '', NomeSocial || '', '', email || '', cep_clean || '', Endereco || '', limparNumeroEndereco(NumeroEndereco), Cidade || '', Estado || '', '', limparComplemento(ComplementoEndereco), Bairro || '', '', dtNascimento,  '',  '', birth_country || '', nacionalidade || '', sexo, etinia, rg_clean || '', OrgaoExpedidorRG || '', '', rg_issue_date || '', '', validarCPF(CPF) ? cpf_clean : '', '', estadoCivil, '', '', '', FoneResidencial || '', '', FoneCelular || '', '', FoneComercial || '', '', '', '', '', '', '', DocumentoMilitar || '', NroDocMilitar || '', '', TituloEleitor || '', dtTituloEleitor || '', '', '', TituloEleitorSessao || '', TituloEleitorZona || '', '', '', '', '', '', '',  '',  '', '', '', '', '', '', '', '', '', '',  '', '', '', '', '', '', '', '', '', '', '',   '',  '',  '',  '', '',  '', '', '', '', '', '', null, '', '', '', '', '');
                    }
                    count++;
                }
            }
            ////////////////////////////////// FIM ALUNOS //////////////////////////////////

            //////////////////////////////// INICIO PROFESSORES ////////////////////////////////
            if(process.env.PESSOASPROFESSOR == 1){
                const professorFACModel = await connectionSQLServer.query(`
                    SELECT --"Funcionarios".*,
                        "Funcionarios"."FuncionarioID" AS "AlunoID"
                        , "EstadosCivis"."Descricao" as "EstadoCivil"
                        , "Funcionarios"."Nome"
                        , "Funcionarios"."NomeCompleto"
                        , (CASE 
                            WHEN "Funcionarios"."Sexo" = 'F' THEN 'Feminino'
                            WHEN "Funcionarios"."Sexo" = 'M' THEN 'Masculino'
                            ELSE '' END
                        )AS "Sexo"
                        , "Funcionarios"."DataNascimento"
                        , "Funcionarios"."CPF"
                        , "Funcionarios"."RG"
                        , "Funcionarios"."Endereco"
                        , COALESCE(CAST("Cidades"."Nome" AS text), '') AS "Cidade"
                        , COALESCE(CAST("Cidades"."Estado" AS text), '') AS "Estado"
                        , COALESCE(CAST("Bairros"."Nome" AS text), '') AS "Bairro"
                        , "Funcionarios"."ComplementoEndereco"
                        , "Funcionarios"."CEP"
                        , "Funcionarios"."FoneResidencial"
                        , "Funcionarios"."FoneCelular"
                        , (
                            CASE WHEN "Funcionarios"."Professor" = 1 THEN 'SIM'
                            ELSE 'NAO' END
                        ) as "Professor"
                        , COALESCE(CAST("EmailsPessoas"."Email" AS text) ,'') AS "Email"
                        , "Funcionarios"."Curriculo"
                        , "Funcionarios"."NumeroMatricula"
                        , "Funcionarios"."NumeroEndereco"
                        , "Funcionarios"."Titulacao"
                        ,'Brasileira' AS "Nacionalidade"
                        ,'Brasil' AS "Pais"

                    FROM "Funcionarios"
                        LEFT JOIN "EstadosCivis" ON "EstadosCivis"."EstadoCivilID" = "Funcionarios"."EstadoCivilID"
                        LEFT JOIN "Cidades" ON "Cidades"."CidadeID" = "Funcionarios"."CidadeID"
                        LEFT JOIN "Bairros" ON "Bairros"."BairroID" = "Funcionarios"."BairroID"
                        LEFT JOIN "EmailsPessoas" ON "EmailsPessoas"."FuncionarioID" = "Funcionarios"."FuncionarioID"    
                `);
                const listaDeProfessorFAC = professorFACModel[0];
                count = 1;
                for(let nomeProfessorFAC of listaDeProfessorFAC){
                    console.log(`Processando ${count} de ${listaDeProfessorFAC.length} PROFESSORES ${nomeProfessorFAC.NomeCompleto}`);
                    const {

                        AlunoID, EstadoCivil, NomeCompleto, Sexo, DataNascimento, CPF, RG, Endereco, Cidade, Estado, Bairro, ComplementoEndereco, CEP, FoneResidencial,
                        FoneCelular, Professor, Email, NumeroEndereco, Nacionalidade, Pais

                    } = nomeProfessorFAC;
                    let idPerson = parseInt('999' + AlunoID + '999');
                    let idStudent = idPerson;

                    let profile = Professor == 'SIM' ? 1 : 4;
                    let dtNascimento = DataNascimento ? DataNascimento.split(' ')[0] : '';
                    let dtTituloEleitor =  '';

                    if (dtNascimento) {
                        let [mes, dia, ano] = dtNascimento.split('/');
                        dia = parseInt(dia);
                        mes = parseInt(mes);
                        dtNascimento = `${dia < 10 ? '0'+dia : dia}/${mes < 10 ? '0'+mes : mes}/${ano}`;
                    }

                    let rg_issue_date = '';

                    let sexo = Sexo || '';
                    let etinia = '';
                    let estadoCivil = EstadoCivil || '';

                    let nacionalidade = Nacionalidade || '';
                    let birth_country = Pais || '';

                    let email = Email|| "";
                    if(email){
                        let emailAux = email.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                        if(validateEmail(emailAux)){
                            //emailAux = emailAux.split(/(?<=[a-z0-9])(?=[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i)[0];
                            emailAux = emailAux.replaceAll(/[^a-zA-Z0-9@._]/g, '');
                            emailAux = emailAux.replace(/\.$/, '');
                            emailAux = emailAux.replace(/\.c$/, '.com');
                            emailAux = emailAux.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})(.*)/, '$1');
                            emailAux = emailAux.replaceAll('.@.', '@');
                            emailAux = emailAux.replaceAll('.@', '@');
                            emailAux = emailAux.replaceAll('@.', '@');
                            emailAux = emailAux.replaceAll(' ', '');
                            email = emailAux;
                        }
                    }
                    let ensinoMedioRegime = '';

                    let rg_clean = RG;
                    if(rg_clean){
                        rg_clean = rg_clean.replaceAll(' ', '');
                        rg_clean = rg_clean.replaceAll('.', '');
                        rg_clean = rg_clean.replaceAll('/', '');
                        rg_clean = rg_clean.replaceAll('-', '');
                    }

                    let cep_clean = CEP;
                    if(cep_clean){
                        cep_clean = cep_clean.replaceAll('.', '');
                        cep_clean = cep_clean.replaceAll('-', '');
                        cep_clean = cep_clean.replaceAll(' ', '');
                    }

                    if(NomeCompleto) {
                        let nome = NomeCompleto;
                        let auxname = `${nome}`;
                        let arr = auxname.split(' ');
                        if(arr.length == 1) nome += ' ajustar sponte';
                        
                        let foundedEmail = await pessoaServico.BuscarPessoaPeloEmail(email);
                        if(foundedEmail != null) email = '';

                        let cpf_clean = CPF;
                        if(cpf_clean){
                            cpf_clean = cpf_clean.replaceAll(' ', '');
                            cpf_clean = cpf_clean.replaceAll('.', '');
                            cpf_clean = cpf_clean.replaceAll('/', '');
                            cpf_clean = cpf_clean.replaceAll('-', '');
                        }

                        let foundedCnpj = await pessoaServico.BuscarPessoaPeloEmail(cpf_clean);
                        if(foundedCnpj != null) cpf_clean = '';

                        await pessoaServico.RegistraPessoa(idPerson, idStudent, profile, 1, nome || '', '', '', email || '', cep_clean || '', Endereco || '', limparNumeroEndereco(NumeroEndereco), Cidade || '', Estado || '', '', limparComplemento(ComplementoEndereco), Bairro || '', '', dtNascimento,  '',  '', birth_country || '', nacionalidade || '', sexo, etinia, rg_clean || '',  '', '', rg_issue_date || '', '', validarCPF(CPF) ? cpf_clean : '', '', estadoCivil, '', '', '', FoneResidencial || '', '', FoneCelular || '', '', '', '', '', '', '', '', '',  '','', '',  '', dtTituloEleitor || '', '', '',  '',  '', '', '', '', '', '', '',  '',  '', '', '', '', '', '', '', '', '', '',  '', '', '', '', '', '', '', '', '', '', '',   '',  '',  '',  '', '',  '', '', '', '', '', '', null, '', '', '', '', '');
                    }
                    count++
                    
                }
            }
            ////////////////////////////////// FIM PROFESSORES //////////////////////////////////
            /// NÃO MIGRADOS: '1164', '762', '827', '1125', '99918999', '999114999', '99987999'
            ///EMPRESAS
            if(process.env.PESSOASEMPRESAS == 1){
                const EmpresasModel = await connectionSQLServer.query(`
                    SELECT 
                        "Empresas"."EmpresaID" AS "AlunoID"
                        , "Empresas"."Nome"
                        , "Empresas"."RazaoSocial"
                        , "Empresas"."Endereco"
                        , COALESCE(CAST("Cidades"."Nome" AS text), '') AS "Cidade"
                        , COALESCE(CAST("Cidades"."Estado" AS text), '') AS "Estado"
                        , COALESCE(CAST("Bairros"."Nome" AS text), '') AS "Bairro"
                        , "Empresas"."CEP"
                        , "Empresas"."CNPJ"
                        , "Empresas"."ComplementoEndereco"
                        , "Empresas"."Inscricao"
                        , COALESCE(CAST("EmailsPessoas"."Email" AS text) ,'') AS "Email"
                        , "Empresas"."Fone"
                        , "Empresas"."NumeroEndereco"
                        ,'Brasil' AS "Pais"
                    FROM "Empresas"
                        LEFT JOIN "Cidades" ON "Cidades"."CidadeID" = "Empresas"."CidadeID"
                        LEFT JOIN "Bairros" ON "Bairros"."BairroID" = "Empresas"."BairroID"
                        LEFT JOIN "EmailsPessoas" ON "EmailsPessoas"."FuncionarioID" = "Empresas"."EmpresaID"    
                `);
                const listaDeProfessorFAC = EmpresasModel[0];
                count = 1;
                for(let empresa of listaDeProfessorFAC){
                    console.log(`Processando ${count} de ${listaDeProfessorFAC.length} EMPRESAS ${empresa.Nome}`);
                    const {

                        AlunoID, Nome, RazaoSocial, Endereco, Cidade, Estado, Bairro, CEP, CNPJ, ComplementoEndereco, Inscricao, 
                        Email, Fone, NumeroEndereco, Pais

                    } = empresa;
                    let idPerson = parseInt('888' + AlunoID + '888');
                    let idStudent = idPerson;

                    let profile = null;
                    let dtNascimento =  '';
                    let dtTituloEleitor =  '';

                    let rg_issue_date = '';

                    let sexo =  '';
                    let etinia = '';
                    let estadoCivil =  '';

                    let nacionalidade = '';
                    let birth_country = Pais || '';

                    let email = Email|| "";
                    if(email){
                        let emailAux = email.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                        if(validateEmail(emailAux)){
                            //emailAux = emailAux.split(/(?<=[a-z0-9])(?=[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i)[0];
                            emailAux = emailAux.replaceAll(/[^a-zA-Z0-9@._]/g, '');
                            emailAux = emailAux.replace(/\.$/, '');
                            emailAux = emailAux.replace(/\.c$/, '.com');
                            emailAux = emailAux.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})(.*)/, '$1');
                            emailAux = emailAux.replaceAll('.@.', '@');
                            emailAux = emailAux.replaceAll('.@', '@');
                            emailAux = emailAux.replaceAll('@.', '@');
                            emailAux = emailAux.replaceAll(' ', '');
                            email = emailAux;
                        }
                    }
                    let ensinoMedioRegime = '';

                    let cep_clean = CEP;
                    if(cep_clean){
                        cep_clean = cep_clean.replaceAll('.', '');
                        cep_clean = cep_clean.replaceAll('-', '');
                        cep_clean = cep_clean.replaceAll(' ', '');
                    }

                    if(Nome) {
                        let nome = Nome;
                        let auxname = `${nome}`;
                        let arr = auxname.split(' ');
                        if(arr.length == 1) nome += ' ajustar sponte';
                        let razao_social = RazaoSocial;

                        auxname = `${razao_social}`;
                        arr = auxname.split(' ');
                        if(arr.length == 1) razao_social += ' ajustar sponte';

                        let cpnj_clean = CNPJ;
                        if(cpnj_clean){
                            cpnj_clean = cpnj_clean.replaceAll(' ', '');
                            cpnj_clean = cpnj_clean.replaceAll('.', '');
                            cpnj_clean = cpnj_clean.replaceAll('/', '');
                            cpnj_clean = cpnj_clean.replaceAll('-', '');
                        }

                        let foundedEmail = await pessoaServico.BuscarPessoaPeloEmail(email);
                        if(foundedEmail != null) email = '';

                        let foundedCnpj = await pessoaServico.BuscarPessoaPeloEmail(cpnj_clean);
                        if(foundedCnpj != null) cpnj_clean = '';


                        await pessoaServico.RegistraPessoa(idPerson, idStudent, profile, 2, nome || '', '', razao_social || '', email || '', cep_clean || '', Endereco || '', limparNumeroEndereco(NumeroEndereco), Cidade || '', Estado || '', '', limparComplemento(ComplementoEndereco), Bairro || '', '', dtNascimento,  '',  '', birth_country || '', nacionalidade || '', sexo, etinia,  '',  '', '', rg_issue_date || '', '', '', cpnj_clean || '', estadoCivil, '', '', '', Fone || '', '', '', '', '', '', '', '', '', '', '',  '','', '',  '', dtTituloEleitor || '', '', '',  '',  '', '', '', '', '', '', '',  '',  '', '', '', '', '', '', '', '', '', '',  '', '', '', '', '', '', '', '', '', '', '',   '',  '',  '',  '', '',  '', '', '', '', '', '', null, '', '', '', '', '');
                    }
                    count++
                    
                }
            }
            console.log('FIM PROCESSANDO PESSOAS')
        }
        //////////////////////////// INICIO RESPONSAVEIS (SPONTE) ////////////////////////////
        if (process.env.PESSOASRESPONSAVEIS == 1) {
            console.log('INICIO PROCESSANDO RESPONSAVEIS')
            log('INICIO PROCESSANDO RESPONSAVEIS')

            const responsaveisModel = await connectionSQLServer.query(`
                SELECT
                    "Responsaveis"."ResponsavelID"
                    , "Responsaveis"."Nome"
                    , COALESCE(CAST("Responsaveis"."CPF" AS text), '') AS "CPF"
                    , COALESCE(CAST("Responsaveis"."RG" AS text), '') AS "RG"
                    , COALESCE(CAST("Responsaveis"."OrgaoExpedidorRG" AS text), '') AS "OrgaoExpedidorRG"
                    , COALESCE(CAST("Responsaveis"."DataExpedicaoRG" AS text), '') AS "DataExpedicaoRG"
                    , COALESCE(CAST("Responsaveis"."DataNascimento" AS text), '') AS "DataNascimento"
                    , (CASE
                        WHEN "Responsaveis"."Sexo" = 'F' THEN 'Feminino'
                        WHEN "Responsaveis"."Sexo" = 'M' THEN 'Masculino'
                        ELSE '' END
                    ) AS "Sexo"
                    , COALESCE(CAST("Responsaveis"."Endereco" AS text), '') AS "Endereco"
                    , COALESCE(CAST("Responsaveis"."NumeroEndereco" AS text), '') AS "NumeroEndereco"
                    , COALESCE(CAST("Responsaveis"."ComplementoEndereco" AS text), '') AS "ComplementoEndereco"
                    , COALESCE(CAST("Responsaveis"."CEP" AS text), '') AS "CEP"
                    , COALESCE(CAST("Cidades"."Nome" AS text), '') AS "Cidade"
                    , COALESCE(CAST("Cidades"."Estado" AS text), '') AS "Estado"
                    , COALESCE(CAST("Bairros"."Nome" AS text), '') AS "Bairro"
                    , COALESCE(CAST("EstadosCivis"."Descricao" AS text), '') AS "EstadoCivil"
                    , COALESCE(CAST("Responsaveis"."FoneResidencial" AS text), '') AS "FoneResidencial"
                    , COALESCE(CAST("Responsaveis"."FoneCelular" AS text), '') AS "FoneCelular"
                    , COALESCE(CAST("Responsaveis"."FoneComercial" AS text), '') AS "FoneComercial"
                    , COALESCE(CAST("Responsaveis"."Profissao" AS text), '') AS "Profissao"
                    , COALESCE(CAST(email."Email" AS text), '') AS "Email"
                    , 'Brasileira' AS "Nacionalidade"
                    , 'Brasil' AS "Pais"
                FROM "Responsaveis"
                    -- traz TODOS os responsaveis do Sponte, inclusive os sem vinculo com aluno.
                    -- LEFT JOIN (nao INNER) so para saber quem tem vinculo, sem filtrar ninguem.
                    LEFT JOIN (SELECT DISTINCT "ResponsavelID" FROM "AlunosResponsaveis") vinculados
                           ON vinculados."ResponsavelID" = "Responsaveis"."ResponsavelID"
                    -- CidadeID e BairroID sao codigos: a Gennera espera o nome em texto
                    LEFT JOIN "Cidades" ON "Cidades"."CidadeID" = "Responsaveis"."CidadeID"
                    LEFT JOIN "Bairros" ON "Bairros"."BairroID" = "Responsaveis"."BairroID"
                    LEFT JOIN "EstadosCivis" ON "EstadosCivis"."EstadoCivilID" = "Responsaveis"."EstadoCivilID"
                    -- Responsaveis."Email" esta vazia; o e-mail real vive em EmailsPessoas.
                    -- LATERAL com LIMIT 1 evita duplicar a linha de quem tem mais de um e-mail
                    LEFT JOIN LATERAL (
                        SELECT ep."Email"
                        FROM "EmailsPessoas" ep
                        WHERE ep."ResponsavelID" = "Responsaveis"."ResponsavelID"
                          AND NULLIF(TRIM(ep."Email"), '') IS NOT NULL
                        ORDER BY ep."Padrao" DESC NULLS LAST, ep."EmailPessoaID"
                        LIMIT 1
                    ) email ON TRUE
                -- ordem fixa: quem tem e-mail repetido perde o e-mail para quem vem antes,
                -- entao a carga precisa ser reproduzivel entre execucoes
                ORDER BY "Responsaveis"."ResponsavelID"
            `);
            const responsaveis = responsaveisModel[0];
            let count = 1;
            for (let responsavel of responsaveis) {
                console.log(`Processando ${count} de ${responsaveis.length} RESPONSAVEIS`);
                log(`Processando ${count} de ${responsaveis.length} RESPONSAVEIS`);
                const { ResponsavelID, Nome, CPF, RG, OrgaoExpedidorRG, DataExpedicaoRG, DataNascimento, Sexo,
                    Endereco, NumeroEndereco, ComplementoEndereco, CEP, Cidade, Estado, Bairro, EstadoCivil,
                    FoneResidencial, FoneCelular, FoneComercial, Profissao, Email, Nacionalidade, Pais } = responsavel;

                // prefixo obrigatorio: ResponsavelID colide com AlunoID na mesma faixa numerica
                let idPerson = parseInt('777' + ResponsavelID + '777');
                // responsavel nao e aluno: id_student fica em branco
                let idStudent = '';
                let profile = 5;

                let dtNascimento = DataNascimento ? DataNascimento.split(' ')[0] : '';
                if (dtNascimento) {
                    let [mes, dia, ano] = dtNascimento.split('/');
                    dia = parseInt(dia);
                    mes = parseInt(mes);
                    dtNascimento = `${dia < 10 ? '0'+dia : dia}/${mes < 10 ? '0'+mes : mes}/${ano}`;
                }

                let rg_issue_date = DataExpedicaoRG ? DataExpedicaoRG.split(' ')[0] : '';
                if (rg_issue_date) {
                    let [mes, dia, ano] = rg_issue_date.split('/');
                    dia = parseInt(dia);
                    mes = parseInt(mes);
                    rg_issue_date = `${dia < 10 ? '0'+dia : dia}/${mes < 10 ? '0'+mes : mes}/${ano}`;
                }

                let sexo = Sexo || '';
                let etinia = ''; // Responsaveis nao tem coluna Cor
                let estadoCivil = EstadoCivil || '';
                let nacionalidade = Nacionalidade || '';
                let birth_country = Pais || '';

                // 59 dos 99 valores de Profissao contem apenas pontuacao
                let profissao = Profissao && /[a-zA-Z0-9]/.test(Profissao) ? Profissao.trim() : '';

                let email = Email || "";
                if (email) {
                    let emailAux = email.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                    if (validateEmail(emailAux)) {
                        emailAux = emailAux.replaceAll(/[^a-zA-Z0-9@._]/g, '');
                        emailAux = emailAux.replace(/\.$/, '');
                        emailAux = emailAux.replace(/\.c$/, '.com');
                        emailAux = emailAux.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})(.*)/, '$1');
                        emailAux = emailAux.replaceAll('.@.', '@');
                        emailAux = emailAux.replaceAll('.@', '@');
                        emailAux = emailAux.replaceAll('@.', '@');
                        emailAux = emailAux.replaceAll(' ', '');
                        email = emailAux;
                    }
                }

                let cep_clean = CEP;
                if (cep_clean) {
                    cep_clean = cep_clean.replaceAll('.', '');
                    cep_clean = cep_clean.replaceAll('-', '');
                    cep_clean = cep_clean.replaceAll(' ', '');
                }

                if (Nome) {
                    let nome = Nome;
                    let auxname = `${nome}`;
                    let arr = auxname.split(' ');
                    if (arr.length == 1) nome += ' ajustar sponte';

                    let foundedEmail = await pessoaServico.BuscarPessoaPeloEmail(email);
                    if (foundedEmail != null) email = '';

                    let rg_clean = RG;
                    if (rg_clean) {
                        rg_clean = rg_clean.replaceAll(' ', '');
                        rg_clean = rg_clean.replaceAll('.', '');
                        rg_clean = rg_clean.replaceAll('/', '');
                        rg_clean = rg_clean.replaceAll('-', '');
                    }

                    let cpf_clean = CPF;
                    if (cpf_clean) {
                        cpf_clean = cpf_clean.replaceAll(' ', '');
                        cpf_clean = cpf_clean.replaceAll('.', '');
                        cpf_clean = cpf_clean.replaceAll('/', '');
                        cpf_clean = cpf_clean.replaceAll('-', '');
                    }

                    await pessoaServico.RegistraPessoa(idPerson, idStudent, profile, 1, nome || '', '', '', email || '', cep_clean || '', Endereco || '', limparNumeroEndereco(NumeroEndereco), Cidade || '', Estado || '', '', limparComplemento(ComplementoEndereco), Bairro || '', '', dtNascimento, '', '', birth_country || '', nacionalidade || '', sexo, etinia, rg_clean || '', OrgaoExpedidorRG || '', '', rg_issue_date || '', '', validarCPF(CPF) ? cpf_clean : '', '', estadoCivil, profissao, '', '', FoneResidencial || '', '', FoneCelular || '', '', FoneComercial || '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', null, null, '', '', '', '', '');
                }
                count++;
            }

            // o CPF pertence ao responsavel: limpa o que foi digitado no cadastro do aluno.
            // sem isso a deduplicacao do CSVPESSOAS descartaria 25 pessoas do arquivo.
            const connectionDl = require('../database/database');
            await connectionDl.query(`
                UPDATE tb_persons a SET cpf = ''
                WHERE a.profile = 2 AND a.cpf <> ''
                  AND EXISTS (SELECT 1 FROM tb_persons r WHERE r.profile = 5 AND r.cpf = a.cpf)
            `);

            console.log('FIM PROCESSANDO RESPONSAVEIS')
        }
        //////////////////////////// FIM RESPONSAVEIS (SPONTE) ////////////////////////////


        if (process.env.CSVPESSOAS == 1) {
            console.log('INICIO GERANDO CSV PESSOAS');
            const pessoasEmailGennera = await pessoaServico.BuscaTodasPessoasQueEmailNaoEVazio();
            const pessoasCPFGennera = await pessoaServico.BuscaTodasPessoasQueCPFNaoEVazio();
            const pessoasGennera = await pessoaServico.BuscaTodasPessoasQueCPFeEMAILeEVazio();

            const listaSemDuplicacaoDeEmailAux = pessoaServico.RemovePessoasDuplicadasPeloEmail(pessoasEmailGennera);
            const listaSemDuplicacaoDeCPFAux = pessoaServico.RemovePessoasDuplicadasPeloCPF(pessoasCPFGennera);
            const listaSemDuplicacaoDeEmail = pessoaServico.RemovePessoasDuplicadasPeloEmail(listaSemDuplicacaoDeEmailAux.concat(listaSemDuplicacaoDeCPFAux));
            const listaSemDuplicacaoDeCPF = pessoaServico.RemovePessoasDuplicadasPeloCPF(listaSemDuplicacaoDeEmail);
            const listaDePessoas = listaSemDuplicacaoDeCPF.concat(pessoasGennera);
            const pessoas = pessoaServico.RemovePessoasDuplicadasPelo_id_Person(listaDePessoas);
            const layoutService = new LayoutService('Pessoas');
            await layoutService.CreateFile(pessoas);
            console.log('FIM GERANDO CSV PESSOAS');
        }
        
        /* BLOCO DO EXTRATOR GIZ - DESATIVADO PARA O SPONTE.
           Le a tabela RESPONS (inexistente no Sponte) com sintaxe T-SQL (ISNULL, concatenacao com +).
           Substituido pelo bloco PESSOASRESPONSAVEIS acima. Preservado para consulta.
        if (process.env.PESSOASCONTRATOS == 1) {
            console.log('INICIO PROCESSANDO PESSOAS')
            log('INICIO PROCESSANDO PESSOAS')
            //////////////////////////////// INICIO ALUNOS ////////////////////////////////

            const pessoasModel = await connectionSQLServer.query(`
                select 
    --*,
    '9999' + RESPONS.COD_RESP AS "COD_RESP",
    ISNULL(RESPONS.CEP, '') AS CEP,
    ISNULL(RESPONS.ENDERECO,'') AS ENDERECO,
    ISNULL(RESPONS.RPS_NUMEROEND, '') AS "NUMERO",
    ISNULL(RESPONS.BAIRRO,'') AS BAIRRO,
    ISNULL(RESPONS.CIDADE,'') AS CIDADE,
    ISNULL(RESPONS.ESTADO,'') AS ESTADO,
    RESPONS.NOME, --01701
    RESPONS.CPF,
    ISNULL(RESPONS.IDENTIDADE, '') AS "RG",
    ISNULL(RESPONS.ORGAOEXPEDIDOR, '') AS "RG_ORGAO_EXPEDIDOR",
    ISNULL(RESPONS.DATA_NASC,'') AS DATA_NASC,
    ISNULL(RESPONS.PAI,'') AS PAI,
    ISNULL(RESPONS.MAE,'') AS MAE,
    ISNULL(RESPONS.EMAIL, '') AS EMAIL,
    ISNULL(RESPONS.TELEFONE, '') AS TELEFONE
from Responsaveis as RESPONS
--WHERE CPF in ('08198337000167', '04857758000100', '0242894267', '0357571240', '0318883210', '0394585000171', '075101602272', '0811415210', '0194152227', '02785853000101')
            `);
            const pessoas = pessoasModel[0];
            let count = 1;
            if(process.env.PESSOASCONTRATOS == 1){
                for (let pessoa of pessoas) {
                    console.log(`Processando ${count} de ${pessoas.length} ALUNOS`);
                    log(`Processando ${count} de ${pessoas.length} ALUNOS`);
                    const { COD_RESP, CEP, ENDERECO, NUMERO, BAIRRO, CIDADE, ESTADO, NOME, CPF, RG, RG_ORGAO_EXPEDIDOR, DATA_NASC, PAI, MAE, EMAIL, TELEFONE  } = pessoa;
                    let idPerson = COD_RESP;
                    let idStudent = COD_RESP;
                    let profile =  null;

                    let dataNascimento = DATA_NASC ? DATA_NASC.toISOString() : '';
                    if (dataNascimento) dataNascimento = `${dataNascimento.substring(8, 10)}/${dataNascimento.substring(5, 7)}/${dataNascimento.substring(0, 4)}`;
                    let rg_issue_date = '';


                    let sexo = '';
                    let etinia = '';
                    let estadoCivil = '';
                    let nacionalidade = '';
                    let birth_country = '';
                    let email = "";
                    if(EMAIL){
                        let emailAux = EMAIL.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                        if(validateEmail(emailAux)){
                            //emailAux = emailAux.split(/(?<=[a-z0-9])(?=[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i)[0];
                            emailAux = emailAux.replaceAll(/[^a-zA-Z0-9@._]/g, '');
                            emailAux = emailAux.replace(/\.$/, '');
                            emailAux = emailAux.replace(/\.c$/, '.com');
                            emailAux = emailAux.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})(.*)/, '$1');
                            emailAux = emailAux.replaceAll('.@.', '@');
                            emailAux = emailAux.replaceAll('.@', '@');
                            emailAux = emailAux.replaceAll('@.', '@');
                            emailAux = emailAux.replaceAll(' ', '');
                            email = emailAux;
                        }
                    }
                    let ensinoMedioRegime = '';

                    if(NOME) {
                        let nome = NOME;
                        let auxname = `${nome}`;
                        let arr = auxname.split(' ');
                        if(arr.length == 1) nome += ' ajustar sponte';
                        await pessoaServico.RegistraPessoa(idPerson, idStudent, profile, 1, nome || '', '', '', email || '', CEP || '', ENDERECO || '', NUMERO || '', CIDADE || '', ESTADO || '', '', '', BAIRRO || '', '', dataNascimento, '', '', birth_country || '', nacionalidade || '', sexo, etinia, RG || '', RG_ORGAO_EXPEDIDOR || '', '', rg_issue_date || '', '', '', CPF || '', estadoCivil, '', '', '', TELEFONE || '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',  '', '', '', '', '', '', '', PAI || '', MAE || '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',  '',  '',  '',  '', '',  '', '', '', '', '', '', null, '', ensinoMedioRegime, '', '', '');
                    }
                    count++;
                }
            }
            ////////////////////////////////// FIM ALUNOS //////////////////////////////////

            console.log('FIM PROCESSANDO PESSOAS')
        }
        */

        if (process.env.CSVPESSOASBYSELECT == 1) {
            console.log('INICIO GERANDO CSV PESSOAS by select');
            const connection = require('../database/database');

            let pessoas = await connection.query(`
            
                SELECT * FROM public.tb_persons where "id_student" IN (
                '122', '143', '153', '168', '192', '237', '268', '366', '383', '410', '413', '498', '535', '623', '632', '712', '721', '728', '752', '768', '851', '860', '867', '872', '902', '904', '967', '1133', '1231', '1264', '1269', '1280', '1290', '1293', '1294', '1301', '1323', '1327', '1359', '1428', '1429', '1430', '1431', '1432', '1434', '1435', '1436', '1437', '1438', '1439', '1440', '1442', '1444', '1445', '1454', '1455', '1471', '1517', '1575', '1582', '1587', '1593', '1602', '1606', '1611', '1614', '1620', '1636', '1645', '1647', '1665', '1667', '1668', '1669', '1671', '1672', '1675', '1677', '1680', '1683', '1684', '1687', '1688', '1689', '1690', '1691', '1693', '1696', '1697', '1699', '1700', '1704', '1705', '1706', '1707', '1710', '1713', '1714', '1716', '1718', '1720', '1721', '1722', '1723', '1724', '1725', '1726', '1727', '1728', '1729', '1730', '1731', '1732', '1733', '1734', '1735', '1736', '1738', '1739'
                )


            `);

            if(pessoas[0].length) pessoas =pessoas[0];

            const layoutService = new LayoutService(`Pessoas_PreMatricula`);
            await layoutService.CreateFileManual(pessoas);
            console.log('FIM GERANDO CSV PESSOAS by select');
        }
        
        

        if (process.env.CSVPESSOASPROFBYSELECT == 1) {
            console.log('INICIO GERANDO CSV PESSOAS PROFESSOR by select');
            const connection = require('../database/database');
            let pessoas = await connection.query(`
            SELECT * FROM public.tb_persons WHERE "profile" = 1
            `);

            if(pessoas[0].length) pessoas =pessoas[0];
            else pessoas = null;

            if(pessoas != null){
                const layoutService = new LayoutService('Pessoas_Professor_By_Select');
                await layoutService.CreateFileManual(pessoas);
            }
            console.log('FIM GERANDO CSV PESSOAS PROFESSOR by select');
        }

    }

    async ProcessarFiliacao(){
        const filiacaoServico = new FiliationService();
        const pessoaServico = new PersonService();
        //////////////////////////// INICIO FILIACAO (SPONTE) ////////////////////////////
        if (process.env.FILIACAO == 1) { /// .env
            console.log('INICIO PROCESSANDO FILIACAO')
            log('INICIO PROCESSANDO FILIACAO')

            const filiacoesModel = await connectionSQLServer.query(`
                SELECT
                    ar."AlunoID"
                    , ar."ResponsavelID"
                    -- grau de parentesco do proprio Sponte; sem tipo, cai em "Responsável"
                    , COALESCE(t."Descricao", 'Responsável') AS "Parentesco"
                    , (a."ResponsavelFinanceiroID" = ar."ResponsavelID") AS "EhFinanceiro"
                FROM "AlunosResponsaveis" ar
                    -- INNER: nao gera vinculo apontando para aluno inexistente
                    INNER JOIN "Alunos" a ON a."AlunoID" = ar."AlunoID"
                    LEFT JOIN "TiposResponsaveis" t
                           ON t."TipoResponsavelID" = ar."TipoResponsavelID"
                ORDER BY ar."AlunoID", ar."AlunoResponsavelID"
            `);
            const filiacoes = filiacoesModel[0];
            let count = 1;
            for (let filiacao of filiacoes) {
                console.log(`Processando ${count} de ${filiacoes.length} FILIACOES`);
                log(`Processando ${count} de ${filiacoes.length} FILIACOES`);
                const { AlunoID, ResponsavelID, Parentesco, EhFinanceiro } = filiacao;

                // mesmo esquema da carga de pessoas: responsavel leva prefixo, aluno vai cru
                let idPerson = parseInt('777' + ResponsavelID + '777');
                let idStudent = AlunoID;

                await filiacaoServico.RegistraFiliation(
                    idPerson, idStudent, normalizaParentesco(Parentesco), !!EhFinanceiro
                );
                count++;
            }
            console.log('FIM PROCESSANDO FILIACAO')
        }
        //////////////////////////// FIM FILIACAO (SPONTE) ////////////////////////////

        /* BLOCO DO EXTRATOR GIZ - DESATIVADO PARA O SPONTE.
           Le GEN_PESSOA, ALUNOSS, ALUNOGER e PROFESS (inexistentes no Sponte) e monta o
           id_student concatenando prefixos 99/88, esquema que nao corresponde ao id_student
           gravado hoje em tb_persons. Eram tres blocos (pai, mae, responsavel financeiro)
           porque o GIZ guardava o parentesco em colunas separadas; no Sponte ele vem de
           AlunosResponsaveis.TipoResponsavelID e o bloco acima resolve os tres de uma vez.
           Preservado para consulta.

        if(process.env.FILIACAO == 1){ /// .env
            let count = 1;
            /////////////////////////////INICIO PAIS /////////////////////////////////////////////
            if(true){
                const paisModel = await connectionSQLServer.query(`
                    SELECT 
                        DISTINCT 
                        GEN_PESSOA.PES_COD
                        ,GEN_PESSOA.PES_IDALUNO
                        ,COALESCE(NULLIF(ALUNOS.PAI, ''), DADOS.PAI) AS PAI
                    FROM GEN_PESSOA
                        LEFT JOIN (
                            SELECT
                                MATRICULA,
                                MAX(TIPODOCMILITAR) AS TIPODOCMILITAR,
                                MAX(DOC_MILIT) AS DOC_MILIT,
                                MAX(TIT_ELEIT) AS TIT_ELEIT,
                                MAX(SECAO) AS SECAO,
                                MAX(ZONA) AS ZONA,
                                MAX(PAI) AS PAI,
                                MAX(MAE) AS MAE,
                                MAX(
                                CASE WHEN NACIONALI IN ('BRASILEIRA', 'BRASILEIRA', 'BRASILEIRP', 'BRASIL', 'BRASIEIRA', 'BRASILEIRO', 'BRASILEIR0') THEN 'Brasileiro' ELSE NACIONALI END
                                ) AS NACIONALI,
                                MAX(ALU_TIPOENSINOMEDIO) AS ALU_TIPOENSINOMEDIO
                            FROM ALUNOSS
                                GROUP BY MATRICULA
                        ) ALUNOS ON ALUNOS.MATRICULA = GEN_PESSOA.PES_IDALUNO
                        LEFT JOIN PROFESS AS DADOS ON DADOS.PES_COD = GEN_PESSOA.PES_COD
                    WHERE
                    -- GEN_PESSOA.PES_COD LIKE '10211' AND
                        COALESCE(NULLIF(ALUNOS.PAI, ''), DADOS.PAI) IS NOT NULL AND
                        GEN_PESSOA.PES_NOME <> '01701'
                    
                    `);
                let listaDePais = paisModel[0];
                listaDePais = listaDePais.filter(p => !p.PAI.includes('XXXX'));
                for(let pai of listaDePais){
                    console.log(`Processando ${count} de ${listaDePais.length} PAIS ${pai.PAI}`);
                    const {PES_COD, PES_IDALUNO} = pai;
                    let idPerson = parseInt(PES_COD);
                    let idStudent = PES_IDALUNO ? parseInt(PES_IDALUNO) : idPerson;
                    if (typeof idStudent === 'number' && Number.isNaN(idStudent)) {
                        idStudent = idPerson;
                    } else {
                        idStudent = `${idPerson}${idStudent}`;
                        idStudent = parseInt(idStudent)
                    }
                    let id = parseInt(`99${idPerson}`);
                    await filiacaoServico.RegistraFiliation(id, idStudent, 'pai', false);
                    
                    count++;
                }
            }
            /////////////////////////////FIM PAIS /////////////////////////////////////////////
            count = 1;
            /////////////////////////////INICIO MAES /////////////////////////////////////////////
            if(true){
                const maesModel = await connectionSQLServer.query(`
                    SELECT 
	DISTINCT 
	GEN_PESSOA.PES_COD
	,GEN_PESSOA.PES_IDALUNO
	,COALESCE(NULLIF(ALUNOS.MAE, ''), DADOS.MAE) AS MAE
FROM GEN_PESSOA
    LEFT JOIN (
        SELECT
            MATRICULA,
            MAX(TIPODOCMILITAR) AS TIPODOCMILITAR,
            MAX(DOC_MILIT) AS DOC_MILIT,
            MAX(TIT_ELEIT) AS TIT_ELEIT,
            MAX(SECAO) AS SECAO,
            MAX(ZONA) AS ZONA,
            MAX(PAI) AS PAI,
            MAX(MAE) AS MAE,
            MAX(
            CASE WHEN NACIONALI IN ('BRASILEIRA', 'BRASILEIRA', 'BRASILEIRP', 'BRASIL', 'BRASIEIRA', 'BRASILEIRO', 'BRASILEIR0') THEN 'Brasileiro' ELSE NACIONALI END
            ) AS NACIONALI,
            MAX(ALU_TIPOENSINOMEDIO) AS ALU_TIPOENSINOMEDIO
        FROM ALUNOSS
            GROUP BY MATRICULA
    ) ALUNOS ON ALUNOS.MATRICULA = GEN_PESSOA.PES_IDALUNO
	LEFT JOIN PROFESS AS DADOS ON DADOS.PES_COD = GEN_PESSOA.PES_COD
WHERE
   -- GEN_PESSOA.PES_COD LIKE '10211' AND
    COALESCE(NULLIF(ALUNOS.MAE, ''), DADOS.MAE) IS NOT NULL AND
    GEN_PESSOA.PES_NOME <> '01701'
                    `);
                let listaDeMaes = maesModel[0];
                listaDeMaes = listaDeMaes.filter(p => !p.MAE.includes('XXXX'));
                for(let mae of listaDeMaes){
                    console.log(`Processando ${count} de ${listaDeMaes.length} MAES ${mae.ALUN_NomeMae}`);
                    const {PES_COD, PES_IDALUNO} = mae;
                    let idPerson = parseInt(PES_COD);
                    let idStudent = PES_IDALUNO ? parseInt(PES_IDALUNO) : idPerson;
                    if (typeof idStudent === 'number' && Number.isNaN(idStudent)) {
                        idStudent = idPerson;
                    } else {
                        idStudent = `${idPerson}${idStudent}`;
                        idStudent = parseInt(idStudent)
                    }
                    let id = parseInt(`88${idPerson}`);

                    await filiacaoServico.RegistraFiliation(id, idStudent, 'mãe', false);

                    count++;
                }
            }
            /////////////////////////////FIM MAES /////////////////////////////////////////////
            count = 1;
            //////////////////////// INICIO RESPONSAVEL FINANCEIRO //////////////////////
            if(true){
                const PESModel = await connectionSQLServer.query(`
                    SELECT
                        ALUNOGER.PES_COD AS COD_ALUNO
                        ,ALUNOGER.MATRICULA
                        --,ALUNOGER.COD_RESP
                        --, GEN_PESSOA.PES_NOME
                        , GEN_PESSOA.PES_COD AS COD_RESP_FINANCEIRO
                    FROM ALUNOGER
                    INNER JOIN GEN_PESSOA ON GEN_PESSOA.PES_IDRESPONSAVEL = ALUNOGER.COD_RESP AND ALUNOGER.COD_RESP <> GEN_PESSOA.PES_COD
                    WHERE 
                        --ALUNOGER."COD_RESP" = '03989' AND
                        ALUNOGER."MATRICULA" IS NOT NULL
                    `);
                let listaDePessoas = PESModel[0];
                //listaDePessoas = listaDePessoas.filter(p => !p.MAE.includes('XXXX'));
                for(let resp of listaDePessoas){
                    console.log(`Processando ${count} de ${listaDePessoas.length} Responsáveis`);
                    const {COD_ALUNO, MATRICULA, COD_RESP_FINANCEIRO} = resp;
                    let idPerson = parseInt(COD_ALUNO);
                    let idStudent = MATRICULA ? parseInt(MATRICULA) : idPerson;
                    if (typeof idStudent === 'number' && Number.isNaN(idStudent)) {
                        idStudent = idPerson;
                    } else {
                        idStudent = `${idPerson}${idStudent}`;
                        idStudent = parseInt(idStudent)
                    }
                    let id = parseInt(`${COD_RESP_FINANCEIRO}`);

                    await filiacaoServico.RegistraFiliation(id, idStudent, 'responsável', false);

                    count++;
                }
            }
            //////////////////////// FIM RESPONSAVEL FINANCEIRO ////////////////////////
        }
        */
        if(process.env.CSVFILIACAO == 1){
            console.log('INICIO GERANDO CSV FILIACAO');
            const filiationGennera = await filiacaoServico.BuscaTodasFiliations();

            const maxByFile = 11000
            let lote = 1;
            let count = 0;
            let objArr = {};
            filiationGennera.forEach(p => {
                if(count < maxByFile){
                    if(objArr.hasOwnProperty(`${lote}`)){
                        objArr[`${lote}`].push(p);
                        count++
                    } else {
                        objArr[`${lote}`] = [];
                        objArr[`${lote}`].push(p);
                        count++
                    }
                } else {
                    count = 0;
                    lote++;
                    if(objArr.hasOwnProperty(`${lote}`)){
                        objArr[`${lote}`].push(p);
                        count++
                    } else {
                        objArr[`${lote}`] = [];
                        objArr[`${lote}`].push(p);
                        count++
                    }
                }
            });
            for(let numeroLote in objArr){
                const layoutService = new LayoutService(`Filiação_Part_${numeroLote}`);
                await layoutService.CreateFile(objArr[`${numeroLote}`]);
            }
            console.log('FIM GERANDO CSV FILIACAO');
        }
    }

    async SetPessoasImportadas(){
        if(process.env.PESSOASIMPORTADAS == 1){
            let texto = '';
            const pessoaServico = new PersonService();
            let count = 1;
            for(let idPerson of pessoasImportadas){
                console.log(`Marcando Como Importado: Processando ${count} de ${pessoasImportadas.length}`);
                const existePessoa = await pessoaServico.BuscarPessoaPeloIdPerson(idPerson);
                if(existePessoa) await pessoaServico.MarcarComoImportada(idPerson);
                else texto += `${idPerson}\n`;
                count++;
            }
            console.log(texto);
        }
    }
}


module.exports = PessoaService;