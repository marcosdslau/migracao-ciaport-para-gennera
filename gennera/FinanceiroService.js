require('dotenv').config();
const LayoutService = require('../src/services/LayoutService');
const DiscountService = require('../src/services/DiscountService');
const ItemService = require('../src/services/ItemService');
const ContractService = require('../src/services/ContractService');
const PurchaseService = require('../src/services/PurchaseService');
const PersonService = require('../src/services/PersonService');
const InvoiceService = require('../src/services/InvoiceService');
const InvoiceDiscountService = require('../src/services/InvoiceDiscountService');
const InvoicePenaltyService = require('../src/services/InvoicePenaltyService');
const PaymentService = require('../src/services/PaymentService');



const connectionSQLServer = require('../database/database-migracao');

const connection = require('../database/database');

const {log} = require('../src/services/LogService');

const ultimoDiaDoMes = (data) => {
  // Cria uma nova data para o primeiro dia do próximo mês
  let proximoMes = new Date(data.getFullYear(), data.getMonth() + 1, 1);
  
  // Subtrai um dia do primeiro dia do próximo mês para obter o último dia do mês atual
  proximoMes.setDate(proximoMes.getDate() - 1);
  
  // Retorna a data do último dia do mês
  return proximoMes;
}

class FinanceiroService{

    async ProcessarDescontos(){
        const discountService = new DiscountService();
        if(process.env.DESCONTOSFINANCEIROS == 1){ /// .env
            console.log('INICIO PROCESSANDO DESCONTOS');
            // const descontoModel = await connectionSQLServer.query(`
            // SELECT DISTINCT
            //     DESCONTO.TPBE_ST_Codigo AS "id_type_discount"
            //     , ISNULL(CATEGORIA.TPBEAUX01_ST_Descricao, 'MIGRACAO') AS "category"
            //     , CONCAT(DESCONTO.TPBE_ST_Descricao, ' [AcadWeb]') as "description"
            //     , 'unconditional' AS "type"
            //     , 'commercial' AS "fiscal_type"
            //     , '' AS "condition"
            //     , '' AS "value"
            //     , 'manual' AS "method"
            //     , '' AS "percentage"
            //     , '' AS "amount"
            //     ,'' AS "calculation_base"
            //     , 'inactive' AS "status"
            //     , 'true' AS "search"
            // FROM RECTPBE DESCONTO
            // INNER JOIN (SELECT DISTINCT
            //                 COMPRA.TPCR_ST_Codigo,
            //                 DESCONTOS.TPBE_ST_Codigo
            //             FROM "RECPARC" PARCELAS 
            //             INNER JOIN RECDEBT COMPRA ON COMPRA.PART_IN_Codigo = PARCELAS.PART_IN_Codigo
            //             INNER JOIN RECTPCR ITEM ON ITEM.TPCR_ST_Codigo = COMPRA.TPCR_ST_Codigo
            //             LEFT JOIN RECBENE DESCONTOS ON DESCONTOS.CLIE_ST_Codigo = PARCELAS.CLIE_ST_Codigo
            //                                         AND DESCONTOS.TPCR_ST_Codigo = COMPRA.TPCR_ST_Codigo 
            //                                         AND (DESCONTOS.BENE_DT_Final IS NULL OR DESCONTOS.BENE_DT_Final >= PARCELAS.PARC_DT_Vencimento)
            //             LEFT JOIN RECTPBE CAD_DESCONTO ON CAD_DESCONTO.TPBE_ST_Codigo = DESCONTOS.TPBE_ST_Codigo
            //             WHERE PARCELAS."PARC_ST_Situacao" = 'A'
            //     ) COD ON COD.TPBE_ST_Codigo = DESCONTO.TPBE_ST_Codigo
            // LEFT JOIN RECTPBEAUX01 CATEGORIA ON CATEGORIA.TPBEAUX01_ST_Codigo = DESCONTO.TPBEAUX01_ST_Codigo
            // `);
            // const descontos = descontoModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                // for (let desconto of descontos) {
                //     console.log(`Processando ${count} de ${descontos.length} Descontos`);
                //     const {id_type_discount, category, description, type, fiscal_type, condition, value, method, percentage, amount, calculation_base, status, search} = desconto;

                //     count++;
                //   }
                  await discountService.Registra('73', 'Sponte', 'Desconto Financeiro', 'unconditional', 'financial', '', '10', 'manual', '', '', 'net', 'inactive', true);
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO DESCONTOS')
        }
        if(process.env.CSVDESCONTOSFINANCEIROS == 1){
            console.log('INICIO GERANDO CSV DESCONTOS');
            const data = await discountService.BuscaTodos();
            const layoutService = new LayoutService('Descontos');
            await layoutService.CreateFile(data);
            console.log('FIM GERANDO CSV DESCONTOS');
        }
    }

    async ProcessarItens(){
        const itemService = new ItemService();
        if(process.env.ITEMSFINANCEIROS == 1){ /// .env
            console.log('INICIO PROCESSANDO ITENS');
            const itemModel = await connectionSQLServer.query(`
           SELECT 
"PlanoContaID"
,"Nome" || ' [Sponte]' as "Nome"
, (CASE WHEN "PlanoContaID" = 1 THEN 'Taxas' WHEN "PlanoContaID" = 8 THEN 'Matrícula' ELSE 'Mensalidade' END) AS "category"
FROM "PlanosContas" where "PlanoContaID" in (SELECT DISTINCT "PlanoContaID" FROM "ContasReceberParcelas" where "ContaReceberID" IN (
	SELECT "ContaReceberID" FROM "ContasReceber"  where "AlunoID" IN (
SELECT
                    "TurmaAlunos"."AlunoID"
                FROM "Turmas" 
                INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID"
                INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
                INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
				INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
				INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
                INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
                INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
                --where "Turmas"."Situacao" = '-1' and "Contratos"."Situacao" = 1
	)
)) and "PlanoContaID" in ('146', '137')
            `);
            const itens = itemModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let item of itens) {
                    console.log(`Processando ${count} de ${itens.length} Itens`);
                    const {PlanoContaID, Nome, category } = item;

                    await itemService.Registra(PlanoContaID, Nome, 'service', '48', '100', 'active', '', category, true);
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO ITENS')
        }
        if(process.env.CSVITEMSFINANCEIROS == 1){
            console.log('INICIO GERANDO CSV ITENS');
            const data = await itemService.BuscaTodos();
            const layoutService = new LayoutService('Itens_MatriculasEncerradas');
            await layoutService.CreateFile(data);
            console.log('FIM GERANDO CSV ITENS');
        }
    }

    async ProcessarContratos(){
        const contractService = new ContractService();
        if(process.env.CONTRATOSFINANCEIROS == 1){ /// .env
            console.log('INICIO PROCESSANDO CONTRATOS');
            const contractModel = await connectionSQLServer.query(`
                
              SELECT
                "ContasReceber"."ContaReceberID"
                , "ContasReceber"."AlunoID"
                , "TURMAS"."idEnrollment"
                , "ContasReceber"."ValorOriginal"
                , "ContasReceber"."DiaVencimento"
                , (CASE WHEN "ContasReceber"."Complemento" = NULL THEN '' ELSE "ContasReceber"."Complemento" END)AS "Complemento"
                , "Alunos"."Nome"
                , "Alunos"."CPF"
              FROM "ContasReceber"
              INNER JOIN "Alunos" ON  "Alunos"."AlunoID" =  "ContasReceber"."AlunoID"
              INNER JOIN (
                SELECT
                  "TurmaAlunos"."AlunoID"
                  ,"TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
                FROM "Turmas" 
                INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID"
                INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
                INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
                INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
                INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
                INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
                INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
                INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
                where "Turmas"."Situacao" = '-2'
              ) "TURMAS" ON "TURMAS"."AlunoID" =  "ContasReceber"."AlunoID"


            `);
            const contracts = contractModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let contract of contracts) {
                    console.log(`Processando ${count} de ${contracts.length} Itens`);
                    const {ContaReceberID, ValorOriginal, Complemento, Nome, CPF, idEnrollment, DiaVencimento } = contract;
                    let id_contrato_aux = ContaReceberID;
                    let id_contrato =ContaReceberID;
                    let auxCPF = CPF;
                    let info = `${Nome} ${Complemento ? ' - ' + Complemento : ''}`
                    if(auxCPF){
                      auxCPF = auxCPF.replaceAll('.','');
                      auxCPF = auxCPF.replaceAll(',','');
                      auxCPF = auxCPF.replaceAll('-','');
                    }
                    await contractService.Registra(id_contrato, id_contrato_aux, auxCPF || '', idEnrollment || '', 'Ativo', DiaVencimento, info || '', info || '', '', '','','','',true, '2');
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO CONTRATOS')
        }
        if(process.env.CSVCONTRATOSFINANCEIROS == 1){
            console.log('INICIO GERANDO CSV CONTRATOS');
            let data = await contractService.BuscaTodos('2');
            //let arr = ['1714', '1713', '2786', '2787', '2835', '2946', '3101', '2947', '3171', '3187', '3269', '3271', '3272', '3273', '3279', '3287', '3292', '3293', '3294', '3296', '3308', '3316', '3319', '3320', '3325', '3338', '3342', '3344', '3345', '3346', '3347', '3281', '3351', '3354', '3354', '3362', '3370', '3371', '3372', '3375', '3377', '3378', '3387', '3389', '3394', '3396', '3288', '3399', '3401', '3404', '3405', '3408', '3409', '3418', '3420', '3422', '3430', '3403', '3412', '3424', '3429', '3419', '3421', '3415', '3417', '3350', '3323', '3334', '3326', '3348', '3349', '3339', '3437', '3439', '3433', '3443', '3447', '3431', '3450', '3452', '3455', '3454', '3456', '3458', '3423', '3460', '3442', '3442', '3441', '3441', '3448', '3445', '3306', '3169', '3427', '3462', '3465', '3139', '3147', '3468', '3470', '3472', '3473', '3471', '130', '141', '161', '278', '319', '356', '420', '452', '597', '142', '646', '649', '777', '906', '1134', '978', '1148', '1251', '1272', '1399', '710', '1161', '1377', '1545', '1124', '1591', '1489', '1616', '1647', '1673', '1491', '1717', '1717', '1861', '742', '1942', '2051', '2067', '2069', '2135', '1252', '1640', '2032', '2426', '2432', '2541', '2543', '2559', '2565', '2611', '2624', '2709', '2720', '3119', '3146', '3138', '3166', '3180', '3222', '3231', '3232', '2948', '3242', '3244', '3245', '3270', '3274', '3275', '3276', '3277', '3278', '3280', '3282', '3291', '3301', '3302', '3303', '3304', '3305', '3314', '3313', '3315', '3327', '3328', '3329', '3330', '3333', '3335', '3336', '3340', '3343', '3352', '3353', '3355', '3355', '3359', '3373', '3374', '3376', '3388', '3390', '3391', '3392', '3393', '3395', '3397', '3398', '3400', '3402', '3406', '3410', '3411', '3413', '3416', '3425', '3428', '3432', '3434', '3435', '3436', '3337', '3438', '3440', '3444', '3446', '3453', '3457', '3459', '3461', '3466', '3469'];
            //data = data.filter(c => c.numero_carga == '2');
            const layoutService = new LayoutService('Contratos_MatriculasEncerradas');
            await layoutService.CreateFile(data, true);
            console.log('FIM GERANDO CSV CONTRATOS');
        }
    }
    async ProcessarCompras(){
        const purchaseService = new PurchaseService();
        const personService = new PersonService();
        const contractService = new ContractService();
        if(process.env.COMPRASCONTRATOS == 1){ /// .env
            console.log('INICIO PROCESSANDO COMPRAS');
            const puchaseModel = await connectionSQLServer.query(`
            
             SELECT
	"ContasReceber"."ContaReceberID"
	, "ContasReceber"."AlunoID"
	, "TURMAS"."idEnrollment"
	, "ContasReceber"."ValorOriginal"
	, "ContasReceber"."DiaVencimento"
	, "ContasReceberParcelas"."PlanoContaID"
	, CAST("ContasReceber"."ContaReceberID" AS VARCHAR) || CAST("ContasReceber"."AlunoID" AS VARCHAR) || CAST("TURMAS"."idEnrollment" AS VARCHAR) || CAST("ContasReceberParcelas"."PlanoContaID" AS VARCHAR) AS "PURCHASE_ID"
	, MAX("ContasReceberParcelas"."NumeroParcela") AS "NumeroParcela"
FROM "ContasReceber"
INNER JOIN "Alunos" ON  "Alunos"."AlunoID" =  "ContasReceber"."AlunoID"
INNER JOIN (
	SELECT
	   "TurmaAlunos"."AlunoID"
		,"TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
	FROM "Turmas" 
	INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
	INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID"
	INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
	INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
	INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
	INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
	INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
	INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
	INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
	where "Turmas"."Situacao" = '-2'
) "TURMAS" ON "TURMAS"."AlunoID" =  "ContasReceber"."AlunoID"
INNER JOIN "ContasReceberParcelas" ON "ContasReceberParcelas"."ContaReceberID" = "ContasReceber"."ContaReceberID"
--where "ContasReceber"."AlunoID" = 1258
GROUP BY 
	"ContasReceber"."ContaReceberID"
	, "ContasReceber"."AlunoID"
	, "TURMAS"."idEnrollment"
	, "ContasReceber"."ValorOriginal"
	, "ContasReceber"."DiaVencimento"
	, "ContasReceberParcelas"."PlanoContaID"
ORDER BY "ContasReceber"."AlunoID" ASC

            `);
            const compras = puchaseModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let compra of compras) {
                    console.log(`Processando ${count} de ${compras.length} Compras`);
                    const {ContaReceberID, AlunoID, idEnrollment, ValorOriginal, DiaVencimento, PlanoContaID, PURCHASE_ID, NumeroParcela   } = compra;

                    let id_contrato = ContaReceberID;

                    let id_purchase_aux = PURCHASE_ID;
                    let codigoCompra = PURCHASE_ID;
                    let id_person = parseInt(AlunoID);

                    let id_item = PlanoContaID;

                    let unit_price = ValorOriginal.toString();


                    let date_start = '';
                    let date_end = '';

                    let NumerosParcelasStrings = '';
                    NumerosParcelasStrings = `'1'`;
                    if(NumeroParcela != 1){
                      NumerosParcelasStrings += `, '${NumeroParcela}'`;
                    } 

                    const [resultParcela, metadataP] = await connectionSQLServer.query(`
                      SELECT
                        MIN("ContasReceberParcelas"."NumeroParcela") AS "ParcelaInicio",
                        MAX("ContasReceberParcelas"."NumeroParcela") AS "ParcelaFim"
                      FROM "ContasReceber"
                      INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "ContasReceber"."AlunoID"
                      INNER JOIN (
                        SELECT
                          "TurmaAlunos"."AlunoID",
                          "TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
                        FROM "Turmas" 
                        INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                        INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" = "Turmas"."CursoID"
                        INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
                        INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
                        INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
                        INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
                        INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
                        INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
                        INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
                        WHERE "Turmas"."Situacao" = '-2'
                        
                      ) "TURMAS" ON "TURMAS"."AlunoID" = "ContasReceber"."AlunoID"
                      INNER JOIN "ContasReceberParcelas" ON "ContasReceberParcelas"."ContaReceberID" = "ContasReceber"."ContaReceberID"
                      WHERE 
                        "ContasReceber"."ContaReceberID" = '${ContaReceberID}'
                        AND "ContasReceber"."AlunoID" = '${AlunoID}'  
                        AND "TURMAS"."idEnrollment" = '${idEnrollment}'  
                        AND "ContasReceberParcelas"."PlanoContaID" = '${PlanoContaID}' 
                        AND "ContasReceberParcelas"."NumeroParcela" <= '${NumeroParcela}'
                      GROUP BY "ContasReceber"."AlunoID";
                      
                      `);

                    if(resultParcela.length){
                      let ParcelaInicio = resultParcela[0].ParcelaInicio;
                      let ParcelaFim = resultParcela[0].ParcelaFim;
                      const [result, metadata] = await connectionSQLServer.query(`
                        SELECT
                          MIN(CASE WHEN "ContasReceberParcelas"."NumeroParcela" = '${ParcelaInicio}' THEN "ContasReceberParcelas"."DataVencimento" ELSE NULL END) AS "DATA_INICIO",
                          MAX(CASE WHEN "ContasReceberParcelas"."NumeroParcela" = '${ParcelaFim}' THEN "ContasReceberParcelas"."DataVencimento" ELSE NULL END) AS "DATA_FIM"
                        FROM "ContasReceber"
                        INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "ContasReceber"."AlunoID"
                        INNER JOIN (
                          SELECT
                            "TurmaAlunos"."AlunoID",
                            "TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
                          FROM "Turmas" 
                          INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                          INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" = "Turmas"."CursoID"
                          INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
                          INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
                          INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
                          INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
                          INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
                          INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
                          INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
                          WHERE "Turmas"."Situacao" = '-2'
                          
                        ) "TURMAS" ON "TURMAS"."AlunoID" = "ContasReceber"."AlunoID"
                        INNER JOIN "ContasReceberParcelas" ON "ContasReceberParcelas"."ContaReceberID" = "ContasReceber"."ContaReceberID"
                        WHERE 
                          "ContasReceber"."ContaReceberID" = '${ContaReceberID}'
                          AND "ContasReceber"."AlunoID" = '${AlunoID}'  
                          AND "TURMAS"."idEnrollment" = '${idEnrollment}'  
                          AND "ContasReceberParcelas"."PlanoContaID" = '${PlanoContaID}' 
                          AND "ContasReceberParcelas"."NumeroParcela" <= '${NumeroParcela}'
                        GROUP BY "ContasReceber"."AlunoID";
                        
                        `);
                      if(result.length){
                        let dataInicio = result[0].DATA_INICIO;
                        if(dataInicio){
                          dataInicio = dataInicio.split(' ')[0];
                          let [mesInicio, diaInicio, anoInicio] = dataInicio.split('/');
                          mesInicio = parseInt(mesInicio);
                          diaInicio = parseInt(diaInicio);
                          date_start = `${diaInicio < 10 ? '0'+diaInicio : diaInicio}/${mesInicio < 10 ? '0'+mesInicio : mesInicio}/${anoInicio}`;
                        }
                        let dataFim = result[0].DATA_FIM;
                        if(dataFim){
                          dataFim = dataFim.split(' ')[0];
                          let [mesFim, diaFim, anoFim] = dataFim.split('/');
                          diaFim = parseInt(diaFim);
                          mesFim = parseInt(mesFim);
                          date_end = `${diaFim < 10 ? '0'+diaFim : diaFim}/${mesFim < 10 ? '0'+mesFim : mesFim}/${anoFim}`;
                        }
  
                        if(date_start){
                          if(!date_end){
                            let [dia, mes, ano] = date_start.split('/');
                            let mesAux = parseInt(mes);
                            if(mesAux == 2){
                              dia = '28'
                            } else{
                              dia = '30'
                            }
                            date_end = `${dia}/${mes}/${ano}`;
                          }
                        }
  
                        if(date_end){
                          if(!date_start){
                            let [dia, mes, ano] = date_end.split('/');
  
                            date_start = `01/${mes}/${ano}`;
                          }
                        }
  
                      }
                    }


                    const [resultCount, metadataCount] = await connectionSQLServer.query(`
                      SELECT
                        COUNT(*) AS "Numero_Parcelas"
                      FROM "ContasReceber"
                      INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "ContasReceber"."AlunoID"
                      INNER JOIN (
                        SELECT
                          "TurmaAlunos"."AlunoID",
                          "TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
                        FROM "Turmas" 
                        INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
                        INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" = "Turmas"."CursoID"
                        INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
                        INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
                        INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
                        INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
                        INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
                        INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
                        INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
                        WHERE "Turmas"."Situacao" = '-2'
                        
                      ) "TURMAS" ON "TURMAS"."AlunoID" = "ContasReceber"."AlunoID"
                      INNER JOIN "ContasReceberParcelas" ON "ContasReceberParcelas"."ContaReceberID" = "ContasReceber"."ContaReceberID"
                      WHERE 
                        "ContasReceber"."ContaReceberID" = '${ContaReceberID}' 
                        AND "ContasReceber"."AlunoID" = '${AlunoID}'  
                        AND "TURMAS"."idEnrollment" = '${idEnrollment}'  
                        AND "ContasReceberParcelas"."PlanoContaID" = '${PlanoContaID}' 
                        AND "ContasReceberParcelas"."NumeroParcela" <= '${NumeroParcela}' 
                      
                      `);
                    let Numero_de_Parcelas = 1;
                    if(resultCount.length){
                      let count = resultCount[0].Numero_Parcelas;

                      Numero_de_Parcelas = count || 1
                    }

                    await purchaseService.Registra(id_contrato, codigoCompra, id_purchase_aux, id_person, id_item, Numero_de_Parcelas, 1, unit_price, date_start, date_end, '', '2');
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO COMPRAS')
        }
        if(process.env.CSVCOMPRASCONTRATOS == 1){
            console.log('INICIO GERANDO CSV COMPRAS');
            let data = await purchaseService.BuscaTodos('2');
            //let arr = ['3423','3442','3441','3448','3169','3427','3462','3465','3139','3147','3468','3470','3472','3473','3471','130','3315','141','161','278','356','420','452','3328','597','142','646','3329','649','777','906','1134','978','1148','1251','1272','710','1161','1377','1545','1124','1489','1647','1491','1861','742','2051','2067','1252','3330','3333','3336','1640','2032','2541','2543','2624','3340','2720','3119','3138','3180','3222','3231','3232','3242','3244','3245','3270','3275','3276','3278','1713','2787','3296','3316','3320','3281','3370','3377','3399','3405','3422','3403','3419','3323','3433','3447','3456','3460','3445','319','1399','1717','2069','2611','3146','3274','3277','3304','3335','3395','3434','3337','3469','1714','3280','2786','2835','3171','3187','3269','3271','3272','3273','3279','3287','3292','3293','3294','3308','3319','3325','3338','3282','3291','3342','3344','3303','3345','3346','3347','3351','3354','3362','3371','3372','3375','3314','3378','3387','3389','3394','3396','3288','3401','3404','3408','3409','3418','3420','3430','3412','3424','3429','3421','3415','3417','3350','3334','3348','3349','3339','3437','3439','3443','3431','3450','3452','3455','3454','3458','3313','3343','3352','3353','3355','3359','3373','3374','3376','3388','3390','3391','3392','3393','3397','3398','3400','3402','3406','3410','3411','3413','3416','3425','3428','3432','3435','3436','3438','3440','3444','3446','3453','3457','3459','3461','3466'];
            //data = data.filter(c => c.numero_carga == '2');
            const layoutService = new LayoutService('Compras_MatriculasEncerradas');
            await layoutService.CreateFile(data, true);
            console.log('FIM GERANDO CSV COMPRAS');
        }
    }

    async ProcessarFaturas(){
        const purchaseService = new PurchaseService();
        const invoiceService = new InvoiceService();
        const personService = new PersonService();
        let faturasManuais = [];
        if(process.env.FATURASCONTRATOS == 1){ /// .env
            console.log('INICIO PROCESSANDO FATURAS');
            const puchaseModel = await connectionSQLServer.query(`
            
SELECT
	"ContasReceber"."ContaReceberID"
	, "ContasReceber"."AlunoID"
	, "TURMAS"."idEnrollment"
	, "ContasReceber"."ValorOriginal"
	, "ContasReceber"."DiaVencimento"
	, (CASE WHEN "ContasReceber"."Complemento" = NULL THEN '' ELSE "ContasReceber"."Complemento" END)AS "Complemento"
	, "Alunos"."Nome"
	, "Alunos"."CPF"
  , CAST("ContasReceber"."ContaReceberID" AS VARCHAR) || CAST("ContasReceber"."AlunoID" AS VARCHAR) || CAST("TURMAS"."idEnrollment" AS VARCHAR) || CAST("ContasReceberParcelas"."PlanoContaID" AS VARCHAR) AS "PURCHASE_ID"
	, "ContasReceberParcelas"."ID"
	, "ContasReceberParcelas"."NumeroParcela"
	, "ContasReceberParcelas"."PlanoContaID"
	, "ContasReceberParcelas"."Valor"
	, "ContasReceberParcelas"."ValorPago"
	, "ContasReceberParcelas"."DataVencimento"
	, "ContasReceberParcelas"."DataPagamento"
	, "ContasReceberParcelas"."ValorDesconto"
	, "ContasReceberParcelas"."ValorJuro"
	, (CASE WHEN "ContasReceberParcelas"."ValorJuro" > 0 THEN
	TRUNC(CAST(((100 * "ContasReceberParcelas"."ValorJuro")/"ContasReceberParcelas"."Valor") AS NUMERIC),2)
	ELSE 0 END) AS "PercentualMulta"
FROM "ContasReceber"
INNER JOIN "Alunos" ON  "Alunos"."AlunoID" =  "ContasReceber"."AlunoID"
INNER JOIN (
	SELECT
	   "TurmaAlunos"."AlunoID"
		,"TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
	FROM "Turmas" 
	INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
	INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID"
	INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
	INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
	INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
	INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
	INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
	INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
	INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
	where "Turmas"."Situacao" = '-2'
      
) "TURMAS" ON "TURMAS"."AlunoID" =  "ContasReceber"."AlunoID"
INNER JOIN "ContasReceberParcelas" ON "ContasReceberParcelas"."ContaReceberID" = "ContasReceber"."ContaReceberID"

            `);
            const compras = puchaseModel[0];
            let count = 1;
            let textConsole = '';
            if(true){
              
              let arr = ['27181448202098', '1190681698', '1523610796', '32678578', '2802212316', '291236336', '1083236336', '7802449498', '1592376536', '224013386', '1047406436', '19094013386', '10996383298', '479735016', '288012616', '1315801261112', '4291146758', '43011410346', '96911467598', '1458114125698', '16921141034146', '17161146756', '179611411796', '1251158036', '11791157406', '591201756', '341228838', '1791221298', '1235122128', '138412212112', '1417122996', '28941228418', '214912314406', '5413413958', '197913413956', '12613979598', '113113979598', '1281416098', '128141194998', '3671412128', '8141411949112', '129142200398', '2331936486', '1962007198', '30025919158', '75924738', '117424736', '11906107998', '1424119666', '285254466', '530376536', '22407256', '9984013388', '1046407258', '1047407256', '1909407256', '573563136', '542637426', '10996374298', '12056374298', '289656856', '549747786', '5507720526', '18517720526', '27837720528', '27847720526', '18038012616', '5148410186', '5389712936', '18419712936', '1161087578', '1171087576', '7041087578', '8461087576', '951108236', '7511213006', '43011411796', '16921141179146', '171611412566', '179611410346', '179611412566', '1241158038', '1251157406', '107011580398', '11781158038', '11791158036', '22621158036', '58120248', '59120246', '12351228838', '1384122798112', '1384122883112', '14171227986', '28941227988', '28941228838', '34612314996', '21491232026', '2112819308', '12613975398', '1271405998', '12814121298', '12814153798', '19514153798', '3671415378', '814141537112', '2520141523112', '12914292698', '3321466598', '6001483858', '7301483856', '2201497016', '9971497018', '1401516138', '4401516826', '91515168298', '97615168298', '3381565366', '15416212558', '4221627088', '98016232098', '980162125598', '9951627086', '14261626886', '142616212556', '179516212556', '118416580798', '16016773398', '1651705758', '2241709096', '89317068198', '97517057598', '13041709098', '113717299298', '169717311756', '11261745356', '17017672398', '7541767238', '7551767236', '10071767231', '10341767238', '2181893466', '1821905948', '2341905946', '3941905948', '6181905946', '9131905946', '345119059498', '1861936228', '1861936718', '2331936716', '96319362298', '96319378798', '10321936228', '11801936716', '114019776798', '101220071998', '155720010986', '1982016098', '1992016096', '90920166698', '95720165198', '10372016098', '10542016666', '799204121698', '120020482898', '17562045226', '20420510408', '21120510386', '4152052488', '41520510408', '88520510406', '1453205103898', '208207191898', '2132118716', '13032118718', '2192131256', '3112131258', '6752134438', '2232147646', '3122147548', '113221476498', '1139214118498', '17202147646', '2282154696', '3142154698', '6232154698', '7322154698', '7332154696', '2392181516', '23921813026', '26321813298', '26321837798', '263218192998', '264218158798', '18522181516', '18522183776', '22472181326', '26572183776', '1348231120498', '25023741398', '33412374138', '43724210446', '1461242104498', '3862457856', '11632452286', '118624580998', '3452465276', '82924639098', '9992466348', '10852465276', '27425111028', '51625212108', '51625221088', '5762526996', '57625219606', '112125212106', '112125221086', '18012526996', '180125216246', '22862523726', '228625212106', '289625216246', '32725736398', '399258145298', '3002592358', '39825923598', '5672592356', '146026110106', '3182697208', '15152697206', '32127012366', '32227012368', '154427012366', '3332778248', '3342774976', '3342778246', '119627752698', '1196277191398', '1581277526127', '1707277497127', '1707277824127', '4962802058', '9322809976', '93228012676', '18122802056', '181228012676', '28762809976', '287628020996', '3582812068', '35828119398', '55228112266', '17672812066', '176728119396', '40528220798', '3652855866', '78928558698', '8612855868', '2643285586112', '36628819208', '37029012848', '178829012846', '183329012846', '37429421998', '374294111798', '37529412798', '8182941279112', '1587294111798', '18262947866', '43429511866', '919295118698', '37929862798', '40230810758', '41330810756', '43931311656', '1333313946112', '17313139466', '181031512668', '181332012686', '4443216198', '92232161998', '45633019088', '58833019086', '121633085898', '45733113328', '58333113326', '19043318106', '106533311738', '10673337376', '16813337376', '4943546258', '6063563918', '11523587756', '6693594378', '53536620468', '55436610216', '277136620468', '277236620466', '304836620468', '3175372226898', '3152375224598', '172839711336', '7484028138', '74840220858', '7494028136', '174940212116', '24714028136', '247140220856', '284740212116', '85840320186', '64140615268', '229040615266', '85241712836', '65841911348', '65942014478', '75242012586', '179842014476', '187942013206', '6974336726', '9644336728', '10204404496', '68844312528', '2519443453112', '25194432019112', '8594494606', '2523449460112', '3321449138398', '69445112538', '72645110176', '13174511253112', '150845112536', '179345112536', '795455121498', '175445512146', '75645614616', '202246011556', '76946615616', '124046616428', '154246610906', '7754717586', '78147569898', '9894756988', '10744756986', '14684756986', '319447569898', '8634764986', '86347612786', '168047611726', '2140476498127', '19984831411137', '81248450898', '94548665998', '8494925248', '8684925246', '8164981992112', '3236498199298', '82451722568', '10085227168', '10425227166', '197852271698', '83552673898', '95552765098', '87353110198', '87553110196', '155553110196', '87453219378', '111853219376', '155253710616', '895539103098', '943539103098', '897540100898', '104454011056', '141554010086', '157354064698', '90054212868', '91154212866', '183754212856', '90354460498', '91654915856', '91455061498', '99155367098', '99355562498', '98655862998', '11285586296', '94157465698', '94257565798', '10485886878', '98859270998', '10305967038', '10455967036', '11195989196', '337960522196', '106061012548', '11466127398', '13666127396', '136661212956', '107261374198', '1072613205998', '1198613101398', '107761474398', '119961474398', '12186147438', '12646147436', '318861474398', '318861487598', '116561674598', '116561693498', '110661811358', '18206181135127', '11366247598', '113662412658', '115662414826', '13746249166', '18096247596', '18096249166', '212362414826', '114563310968', '155863310966', '122764613138', '187064613136', '117564791798', '12586479178', '12596479176', '119466098798', '1319660987112', '17466728446', '189267213246', '18936728446', '132067814886', '132167812828', '183167815836', '212867814886', '224567812826', '12266798538', '230068616376', '1575815106398', '220481510636', '1563839226598', '3184839226598', '173387112926', '172987911546', '165389014596', '173891318946', '181491812096', '177293119326', '18089462057137', '279294620578', '192395319216', '184895819416', '186296413076', '191799213456', '192499619656', '3094996196598', '1985103013988', '2030103013986', '2012104816308', '2291104816306', '27111048141998', '251610511424112', '2142109714946', '2205109714946', '2155110315028', '2454115916116', '27251188202698', '240261811356', '113662414828', '14296509076', '231567116466', '189267212086', '130872510788', '2751142819776', '941108238', '7411213008', '99516212556', '2241705756', '89317090998', '13041705758', '256184105198', '14821845176', '265721813026', '265721819296', '179922111786', '32422813898', '118624522898', '9992463908', '51625216248', '10792526998', '11212523726', '28962523726', '289625219606', '6652947866', '1587294127998', '106733311736', '4933546256', '92835462598', '224731', '197516580798', '10341764708', '1731806868', '1741806866', '8881806866', '92118068698', '98318068698', '6402374138', '11632458096', '4221626888', '42316212556', '9951626886', '17951627086', '35325111026', '51625219608', '207525814528', '30126110108', '31726676898', '3932697206', '32227010688', '11622767826', '3332775268', '119627749798', '287628012676', '35828112268', '5532812068', '176728112266', '2643285510112', '183329012456', '37629511868', '93129862798', '10653337378', '88744044998', '7283563916', '5063587756', '51836219318', '1215362193198', '304836610218', '60437838998', '70137915198', '224837915196', '63239711338', '74940220856', '284740220856', '25224032018112', '8574434536', '25194431252112', '65942013208', '112125219606', '1311256770127', '6924494608', '19634494606', '69445110178', '207945614616', '86347611726', '18234764986', '812484111298', '91748512038', '201548758498', '2615487584112', '96149066998', '76946610906', '15424668606', '96855061498', '10665267388', '15555319356', '111853211506', '3186535227698', '94353965498', '104354010088', '99155362198', '92955662698', '1573540110598', '3196542128698', '9105476108', '91254812398', '940569642127', '10535886876', '137462414826', '21236247596', '105160720728', '1072613101398', '14336137416', '107561699898', '14086169988', '182261811356', '11566247596', '115662412656', '9665756578', '15996609876', '1203663102298', '129768616378', '13066888668', '13976748496', '13246938736', '212867812826', '189367213246', '224567815836', '130171712918', '130872511098', '1487809121898', '152781917196', '180287911546', '184287112926', '207889014596', '193590113616', '192395313516', '203499213456', '309610511424186', '2294117322606', '63840320188', '78640441898', '65641712838', '173241911346', '75242014476', '11024336726', '165143811316', '69244923878', '196344923876', '25234492387112', '13174511017112', '224342013206', '76246011558', '78848665998', '8484875128', '8794875126', '2615487512112', '213049114836', '25784668608', '257846615618', '107447510506', '3194475105098', '16804764986', '182347611726', '235347611726', '88449819926', '82451718958', '189951713296', '189951722566', '82852271698', '83652765098', '182552912386', '22285371061127', '10435406468', '10445406466', '104454010086', '141554011056', '90054212858', '11105476106', '180454812396', '99155364998', '10365566266', '93455869398', '11165586938', '11285586936', '95056111778', '170356111776', '143666310226', '98158868798', '10245927098', '22495927096', '174667213246', '282060720726', '18836127396', '1198613205998', '27966137418', '27976137416', '116561699898', '14086167458', '182061811356', '13746247596', '137462412656', '1584626111498', '115062919456', '183167812826', '224567814886', '146567985398', '184071712916', '3157733224998', '13256938738', '1578725110998', '144276511166', '3228765111698', '159481510636', '164685911278', '23838791154127', '175588111576', '174791812096', '180794620576', '227495116196', '22699581941127', '186096313066', '187493313166', '3094996220498', '1940100920556', '2788100920558', '2291104814196', '27111048163098', '2318105114246', '318110511424186', '31621123225598', '259911882026112', '2154110315026', '592372226898', '602375224598', '134737915196', '13833868506', '75139711336', '2311116016131', '284740217366', '75041911346', '75242013206', '68343811318', '271744345398', '7694668606', '8664875126', '8804875848', '781475105098', '10135275796', '16655325886', '89754060098', '14155406466', '8995416078', '94454460498', '92455364998', '74940217366', '174940217366', '247140212116', '10355566268', '98655869398', '2827144520156', '11165586298', '109056111776', '12996509078', '106259215476', '12985989198', '142267116466', '18926728446', '14086169348', '115762611146', '128373322498', '1578725107898', '135876511168', '23568791154127', '192499622046', '1984103013986', '2013104816306', '2195112322548', '2196112322556', '2322118820266', '2265110315026', '86937915196', '63740111978', '74940212116', '174940220856', '5183628598', '17752212316', '542638326', '2331937876', '95720166698', '2052066798', '7132131256', '207625814526', '5507713016', '1161084688', '19514152398', '1821902328', '9131902326', '91515161398', '90920165198', '79920482898', '20420510388', '88520510386', '2392181326', '17072771913127', '93228020996', '107011574098', '215168166', '17202147546', '107761487598', '79625677098', '321380126198', '7123594376', '2255109714946', '180962412656', '189367212086', '181694719226', '2789100920556', '65942012588', '2692498199298', '86551713296', '19195227166', '83652766298', '10135276626', '84052912386', '897540110598', '1573540100898', '3196542128598', '131361699898', '212867815836', '183971712918', '161287112928', '2052103013986', '3090109714946', '1112376536', '126139103298', '1861936488', '171611411796', '180188118798', '1200204121698', '224721815876', '43522112596', '180125221086', '199627872198', '357280209998', '55328112268', '66529412796', '158729478698', '44232012686', '190433113326', '5053587758', '813358775112', '48372596', '42911410348', '4301146756', '3461232026', '214912314996', '197214540798', '9941626888', '19720010986', '43522111786', '39622423398', '3392762096', '818294219112', '73840111976', '174840111976', '448247398', '15038410186', '13041706818', '118624578598', '5162526998', '55328119398', '57128819206', '87746011556', '8735319358', '132067812826', '183167814886', '27837713018', '3941902328', '96319367198', '6232154008', '264218130298', '4962809978', '31351585223298', '119961487598', '4401516136', '12084898436', '3018100920551', '3300100920556', '17719311932137', '5083594376', '36714119498', '1861937878', '79920452298', '5812571938', '3332774978', '326710528', '157287836', '969114103498', '35122126', '17912284198', '22961232026', '29071232026', '28962526996', '178657612436', '2013104814196', '7541764708', '10071764701', '10792523728', '33527872198', '3752942198', '182629412796', '53536610218', '74840217368', '6454044188', '183241712836', '76946616426', '798491148398', '185011213006', '23921815876', '12646148756', '279761320596', '279394620576', '195997129398', '2520141537112', '6331454078', '1972145142398', '2261483856', '1401516828', '1471565368', '14815712628', '180615712626', '1541626888', '42216212558', '4231627086', '14261627086', '17951626886', '1651706818', '97517068198', '168417311758', '8101745358', '1114176926', '92118061898', '1593180618127', '25618410798', '14821841076', '148218419426', '1811893468', '92519362298', '10321936718', '11801937876', '15572007196', '1982016518', '1992016516', '10372016518', '10542016516', '2032045226', '17562048286', '41520510388', '8852052486', '1453205104098', '3112134438', '7132134436', '106121344398', '22321411846', '113221475498', '113921475498', '26321815198', '26421813298', '264218192998', '185221813026', '24122111788', '24622813898', '174223112046', '7242374136', '13852421044112', '3862452286', '11632457856', '82924652798', '5162523728', '57625221086', '107925219608', '112125216246', '180125212106', '22862526996', '228625221086', '289625212106', '3522567706', '56725919156', '3312762098', '3392767826', '3342775266', '1581277824127', '1707277526127', '35728020598', '49628012678', '18122809976', '28772801267127', '5522812066', '3592822078', '3642855108', '3652855106', '374294127998', '6652942196', '8182941117112', '18262942196', '182629411176', '4342956176', '91929561798', '17062956176', '154830810756', '13333131165112', '173131311656', '419315126698', '1216330190898', '168133311736', '152368166', '2151610796', '32672598', '483710526', '244840725127', '42911412568', '969114125698', '145811467598', '1458114117998', '341228418', '351227986', '351228836', '331232028', '3312314998', '229612314996', '290712314996', '22912819306', '31512819308', '25201411949112', '142714220036', '270214292698', '63314514238', '1331466598', '99416212558', '256184194298', '148218410516', '92519364898', '92519378798', '224721813026', '224721819296', '26572181516', '265721815876', '24122112598', '179922112596', '228625219606', '289625221086', '3312767828', '35728099798', '357280126798', '49628020998', '36028420898', '4002842088', '3642855868', '66529411176', '818294786112', '13674011197112', '2717443201998', '257846610908', '257846616428', '21404761172127', '86551718956', '189951718956', '166553211506', '88153522768', '88253522766', '92455362198', '102459215478', '10625927096', '224959215476', '10065989198', '143361320596', '279661320598', '131361674598', '131361693498', '119165813948', '198365813946', '122167116468', '137968616376', '1585795111598', '182995116198', '230296413076', '1946101213706', '26771428197798', '15816580798', '1731806188', '1741806186', '8881806186', '98318061898', '18918451798', '26524210448', '3862458096', '3452466346', '10852466346', '57625212106', '180125219606', '228625216246', '3752947868', '158729421998', '3762956178', '378297102698', '298012618', '4453216196', '105816773398', '1651709098', '2241706816', '89317057598', '97517090998', '113717276198', '167173117598', '16817453598', '17017647098', '7551764706', '11141764706', '107925212108', '107925216248', '107925221088', '3452463906', '82924663498', '9992465278', '10852463906', '511563138', '1541627088', '5762523726', '57625216246', '32127010686', '154427010686', '28762802056', '2877280997127', '28772802099127', '78928551098', '8612855108', '37029012458', '178829012456', '37429478698', '37529411178', '170629511866', '181131512666', '44132012688', '191032313396', '4563308588', '5883308586', '4573318108', '5833318106', '6823546256', '5073594378', '58036219316', '277136610218', '277236610216', '247140217366', '28474028136', '85744320196', '3209419113498', '11212526996', '18012523726', '224342014476', '11512567706', '332144946098', '84446011556', '179345110176', '8474764988', '84747612788', '182347612786', '235347612786', '200548314116', '79148758498', '822487584112', '8484875848', '8664875846', '8794875846', '7934895156', '8504898436', '124046615618', '154246616426', '230354915856', '8755319356', '87453211508', '89553965498', '92455367098', '92655462398', '91154212856', '90454587798', '12765689276', '10175606318', '114661212958', '188361212956', '110761811356', '11366249168', '10145746568', '12326748498', '132167815838', '1586765111698', '32991448202098', '31581585223298', '48378576', '1572810956', '1091254466', '1230428368', '540563136', '313770223598', '42911411798', '4061202498', '3312314408', '34612314406', '229612314406', '283244946', '678254468', '290712314406', '5513413956', '14271429266', '2702142200398', '13614712908', '1371483858', '1381497018', '1084149726', '14915712626', '9941627088', '96319364898', '3401977676', '1972007196', '1012200109898', '2032048286', '2042052488', '21120510406', '79720852098', '3102118718', '113921476498', '1004376536', '22406436', '1096656856', '30226110106', '11582667686', '10262697208', '33427719136', '119627782498', '1153747786', '1951416098', '81414160112', '25618451798', '170818811876', '22114712906', '81115653698', '11801936486', '1911977678', '19620010988', '1992016666', '10372016668', '20320412166', '175620412166', '1457205104098', '20720852098', '2232147546', '31221411848', '7332154006', '23921819296', '185221819296', '102927872198', '2877280205127', '55228119396', '14231108236', '22621157406', '27612017598', '40612017598', '12351228418', '18918410798', '107561674598', '179842013206', '212362412656', '2012104814198', '79449066998', '251068616376', '171290113611', '2807144520158', '179842012586', '85643811316', '10194404498', '6884434538', '960236338', '68844320198', '2813819516', '998407258', '10464013388', '1909406436', '2448401338127', '85744312526', '2717443125298', '12056383298', '85944923876', '72645112536', '969114117998', '171611410346', '2761202498', '187942014476', '341227988', '17912279898', '12351227988', '1417122126', '2894122128', '224342012586', '150845110176', '7034551214111', '25284551214112', '163546011556', '12404668608', '124046610908', '113113975398', '19514121298', '3671415238', '2520141212112', '12775689278', '10155746566', '9174856168', '79148751298', '822487512112', '8804875128', '201548751298', '98016268898', '154246615616', '2331936226', '92519367198', '113547175898', '11801936226', '98947510508', '146847510506', '84747611728', '90920160998', '10542016096', '168047612786', '21404761278127', '23534764986', '1457205103898', '4242066796', '784483141198', '87849819928', '6752131258', '106121312598', '1132214118498', '82451713298', '22472181516', '26572181326', '86551722566', '10685267386', '95552766298', '5822573636', '398259191598', '83852912388', '88953710618', '104354011058', '33327719138', '183754212866', '92754812396', '98455462398', '18517713016', '27847713016', '1171084686', '8461084686', '1351405998', '93455862998', '367141608', '2750142819778', '189184194298', '2779144520158', '16115606316', '2341902326', '6181902326', '345119023298', '252014160112', '93756563898', '97615161398', '323366098798', '10321937878', '988592154798', '99259670398', '14285989196', '174667212086', '95720160998', '105260720726', '281960720728', '120020452298', '119861374198', '2112052486', '145320524898', '143361310136', '279661310138', '279761310136', '107561693498', '3142154008', '7322154008', '11566249166', '2392183776', '13326261114112', '26421815198', '18522181326', '132067815836', '15812771913127', '1593180686127', '132167814888', '9322802056', '181228020996', '13826798536', '128473322496', '152881917198', '1241157408', '11781157408', '183095116196', '185996313068', '2018105114246', '2195112322558', '31621123225498', '55436620466', '12103868508', '74840212118', '17494028136', '1692114675146', '16921141256146', '24538191719146', '172021411846', '4393139466', '263218130298', '26421837798', '12186148758', '5803628596', '121536285998', '27141445201598', '998406438', '1046406438', '187942012586', '10474013386', '244840643127', '43011412566', '1458114103498', '113862611148', '581201758', '34122128', '351228416', '17912288398', '1384122841112', '14171228416', '12814152398', '195141194998', '814141212112', '4231626886', '10321936488', '1982016668', '145720524898', '180962414826', '21236249166', '2192134436', '3122147648', '12116738458', '13896738456', '12326748468', '13976748466', '185221815876', '22472183776', '2752573638', '171290113616', '11622762096', '7041084688', '1131139103298', '189184105198', '814141523112', '2282154006', '263218158798', '1581277497127', '17961146756', '5914537998', '248011121515127', '2196112322546', '2716403201898', '3197417128398', '212291812096']
              let index = 1;  
              for (let compra of compras) {
                    console.log(`Processando ${count} de ${compras.length} Faturas`);
                    const {ID, ContaReceberID, AlunoID, idEnrollment, ValorOriginal, Valor, DiaVencimento, PlanoContaID, PURCHASE_ID, NumeroParcela, DataVencimento } = compra;

                    let id_purchase = PURCHASE_ID || '';

                    let id_invoice_aux = ID;

                    let codigoFatura = ID;
                    if(arr.includes(id_purchase)){
                      console.log(`ACHOU ${index}: ${codigoFatura}`);
                        let found = faturasManuais.find(e => e == codigoFatura);
                        if(!found){
                          index++;
                          faturasManuais.push(codigoFatura);
                        }
                      }
                      continue;

                    let dataVencimento = DataVencimento;
                    dataVencimento = dataVencimento.split(' ')[0];
                    let [mes, dia, ano] = dataVencimento.split('/');

                    let month_cycle = `${mes < 10 ? '0'+mes : mes}`;
                    let year_cycle = ano;
                    let due_date =`${dia < 10 ? '0'+dia : dia}/${mes < 10 ? '0'+mes : mes}/${ano}`;



                    let amount = Valor;
                    

                    await invoiceService.Registra(id_purchase, codigoFatura, id_invoice_aux, month_cycle, year_cycle, due_date, amount, false, false, '2');
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO FATURAS')
        }
        if(process.env.CSVFATURASCONTRATOS == 1){
            console.log('INICIO GERANDO CSV FATURAS');
            let data = await invoiceService.BuscaTodos('2');
            data = data.filter(c => ['19608', '19609', '19610', '19611'].includes(c.id_invoice));
            /*let dataAux = [];
            for(let id_purchase of arr){
              for(let f of data){
                if(f.id_purchase == id_purchase){
                  dataAux.push(f);
                }
              }
            }*/
            const layoutService = new LayoutService('Faturas_MatriculasEncerradas_V2');
            await layoutService.CreateFile(data, true);
            console.log('FIM GERANDO CSV FATURAS');
        }
    }

    async ProcessarFaturasManual(){
        const purchaseService = new PurchaseService();
        const invoiceService = new InvoiceService();
        if(process.env.FATURASCONTRATOSMANUAL == 1){ /// .env
            console.log('INICIO PROCESSANDO FATURAS MANUAL');
            
            const compras = [
                {
                  "date": "2019-07-19",
                  "idItem": 91,
                  "dateEnd": "2019-07-31",
                  "idPerson": 2019109390,
                  "quantity": 1,
                  "dateStart": "2019-07-01",
                  "unitPrice": 25.43,
                  "idContract": 201910939000091,
                  "idPurchase": 1712619406060,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-08-27",
                  "idItem": 2,
                  "dateEnd": "2019-10-31",
                  "idPerson": 2018107425,
                  "quantity": 1,
                  "dateStart": "2019-10-01",
                  "unitPrice": 840,
                  "idContract": 201810742500002,
                  "idPurchase": 1712619420314,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-12",
                  "idItem": 2,
                  "dateEnd": "2019-12-31",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-12-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200002,
                  "idPurchase": 1712619449367,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-02-03",
                  "idItem": 2,
                  "dateEnd": "2021-02-28",
                  "idPerson": 2016202259,
                  "quantity": 1,
                  "dateStart": "2021-02-01",
                  "unitPrice": 49.96,
                  "idContract": 201620225900002,
                  "idPurchase": 1712619534492,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-03-26",
                  "idItem": 2,
                  "dateEnd": "2021-06-30",
                  "idPerson": 2020211089,
                  "quantity": 1,
                  "dateStart": "2021-06-01",
                  "unitPrice": 550.2,
                  "idContract": 202021108900002,
                  "idPurchase": 1712619558005,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-10-19",
                  "idItem": 2,
                  "dateEnd": "2021-12-31",
                  "idPerson": 2021207189,
                  "quantity": 1,
                  "dateStart": "2021-12-01",
                  "unitPrice": 849.33,
                  "idContract": 202120718900002,
                  "idPurchase": 1712619593922,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-02-22",
                  "idItem": 2,
                  "dateEnd": "2022-03-31",
                  "idPerson": 2016204033,
                  "quantity": 1,
                  "dateStart": "2022-03-01",
                  "unitPrice": 246.81,
                  "idContract": 201620403300002,
                  "idPurchase": 1712619614267,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-02-22",
                  "idItem": 2,
                  "dateEnd": "2022-03-31",
                  "idPerson": 2017109121,
                  "quantity": 1,
                  "dateStart": "2022-03-01",
                  "unitPrice": 775.26,
                  "idContract": 201710912100002,
                  "idPurchase": 1712619615438,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-02-23",
                  "idItem": 2,
                  "dateEnd": "2022-04-30",
                  "idPerson": 2016204033,
                  "quantity": 1,
                  "dateStart": "2022-04-01",
                  "unitPrice": 246.81,
                  "idContract": 201620403300002,
                  "idPurchase": 1712619618371,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-03",
                  "idItem": 2,
                  "dateEnd": "2022-04-30",
                  "idPerson": 2021109227,
                  "quantity": 1,
                  "dateStart": "2022-04-01",
                  "unitPrice": 813.87,
                  "idContract": 202110922700002,
                  "idPurchase": 1712619621971,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-03",
                  "idItem": 2,
                  "dateEnd": "2022-03-31",
                  "idPerson": 2021109227,
                  "quantity": 1,
                  "dateStart": "2022-03-01",
                  "unitPrice": 813.87,
                  "idContract": 202110922700002,
                  "idPurchase": 1712619621741,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-17",
                  "idItem": 2,
                  "dateEnd": "2022-05-31",
                  "idPerson": 2021109227,
                  "quantity": 1,
                  "dateStart": "2022-05-01",
                  "unitPrice": 813.87,
                  "idContract": 202110922700002,
                  "idPurchase": 1712619629765,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-17",
                  "idItem": 2,
                  "dateEnd": "2022-05-31",
                  "idPerson": 2020209086,
                  "quantity": 1,
                  "dateStart": "2022-05-01",
                  "unitPrice": 808.56,
                  "idContract": 202020908600002,
                  "idPurchase": 1712619628641,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-21",
                  "idItem": 2,
                  "dateEnd": "2022-06-30",
                  "idPerson": 2016204033,
                  "quantity": 1,
                  "dateStart": "2022-06-01",
                  "unitPrice": 246.81,
                  "idContract": 201620403300002,
                  "idPurchase": 1712619633889,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-22",
                  "idItem": 2,
                  "dateEnd": "2022-06-30",
                  "idPerson": 2020209086,
                  "quantity": 1,
                  "dateStart": "2022-06-01",
                  "unitPrice": 808.56,
                  "idContract": 202020908600002,
                  "idPurchase": 1712619635857,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-22",
                  "idItem": 2,
                  "dateEnd": "2022-06-30",
                  "idPerson": 2021109227,
                  "quantity": 1,
                  "dateStart": "2022-06-01",
                  "unitPrice": 813.87,
                  "idContract": 202110922700002,
                  "idPurchase": 1712619636732,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-31",
                  "idItem": 2,
                  "dateEnd": "2022-04-30",
                  "idPerson": 2016204225,
                  "quantity": 1,
                  "dateStart": "2022-04-01",
                  "unitPrice": 60.79,
                  "idContract": 201620422500002,
                  "idPurchase": 1712619639656,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-06-22",
                  "idItem": 178,
                  "dateEnd": "2022-07-31",
                  "idPerson": 2019111336,
                  "quantity": 1,
                  "dateStart": "2022-07-01",
                  "unitPrice": 592.99,
                  "idContract": 201911133600178,
                  "idPurchase": 1712619655793,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-07-01",
                  "idItem": 178,
                  "dateEnd": "2022-07-31",
                  "idPerson": 2017104665,
                  "quantity": 1,
                  "dateStart": "2022-07-01",
                  "unitPrice": 148.5,
                  "idContract": 201710466500178,
                  "idPurchase": 1712619659639,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-07-19",
                  "idItem": 2,
                  "dateEnd": "2022-08-31",
                  "idPerson": 2019111336,
                  "quantity": 1,
                  "dateStart": "2022-08-01",
                  "unitPrice": 592.99,
                  "idContract": 201911133600002,
                  "idPurchase": 1712619664686,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-05",
                  "idItem": 2,
                  "dateEnd": "2022-08-31",
                  "idPerson": 2020213180,
                  "quantity": 1,
                  "dateStart": "2022-08-01",
                  "unitPrice": 519.82,
                  "idContract": 202021318000002,
                  "idPurchase": 1712619670562,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-10-31",
                  "idPerson": 2019111336,
                  "quantity": 1,
                  "dateStart": "2022-10-01",
                  "unitPrice": 592.99,
                  "idContract": 201911133600002,
                  "idPurchase": 1712619680775,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-12-31",
                  "idPerson": 2019209220,
                  "quantity": 1,
                  "dateStart": "2022-12-01",
                  "unitPrice": 800.82,
                  "idContract": 201920922000002,
                  "idPurchase": 1712619692944,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-10-18",
                  "idItem": 2,
                  "dateEnd": "2022-12-31",
                  "idPerson": 2020111017,
                  "quantity": 1,
                  "dateStart": "2022-12-01",
                  "unitPrice": 549.99,
                  "idContract": 202011101700002,
                  "idPurchase": 1712619730579,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2018104323,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 535,
                  "idContract": 201810432300196,
                  "idPurchase": 1712619747656,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2018107386,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 795.98,
                  "idContract": 201810738600196,
                  "idPurchase": 1712619749645,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-06",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2019110420,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 128.32,
                  "idContract": 201911042000196,
                  "idPurchase": 1712619775935,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700002,
                  "idPurchase": 1712619787278,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2022111173,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 499.73,
                  "idContract": 202211117300002,
                  "idPurchase": 1712619788399,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2019112268,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 395.26,
                  "idContract": 201911226800002,
                  "idPurchase": 1712619794758,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2020213180,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 561.4,
                  "idContract": 202021318000002,
                  "idPurchase": 1712619795235,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-02-16",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100002,
                  "idPurchase": 1712619804510,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-02-16",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700002,
                  "idPurchase": 1712619805525,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2022203249,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 822.9,
                  "idContract": 202220324900002,
                  "idPurchase": 1712619812739,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2022207204,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 955.73,
                  "idContract": 202220720400002,
                  "idPurchase": 1712619813882,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2022209122,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 686.85,
                  "idContract": 202220912200002,
                  "idPurchase": 1712619814101,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2019209220,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 816.84,
                  "idContract": 201920922000002,
                  "idPurchase": 1712619814320,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2021110195,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 1787.86,
                  "idContract": 202111019500002,
                  "idPurchase": 1712619814536,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2019211234,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 627.67,
                  "idContract": 201921123400002,
                  "idPurchase": 1712619814786,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2022209177,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 350.77,
                  "idContract": 202220917700196,
                  "idPurchase": 1712619824689,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-19",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2022209177,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 350.77,
                  "idContract": 202220917700002,
                  "idPurchase": 1712619824942,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-19",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2022209177,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 350.77,
                  "idContract": 202220917700002,
                  "idPurchase": 1712619825193,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-19",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2022209177,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 350.77,
                  "idContract": 202220917700002,
                  "idPurchase": 1712619825458,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2020111017,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 593.99,
                  "idContract": 202011101700002,
                  "idPurchase": 1712619865842,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2019211234,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 627.67,
                  "idContract": 201921123400002,
                  "idPurchase": 1712619866064,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2021110211,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 1855.78,
                  "idContract": 202111021100197,
                  "idPurchase": 1712619881574,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2020109390,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 740.73,
                  "idContract": 202010939000197,
                  "idPurchase": 1712619884540,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2021207052,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 535,
                  "idContract": 202120705200197,
                  "idPurchase": 1712619886884,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-07-24",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2023107371,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 885,
                  "idContract": 202310737100002,
                  "idPurchase": 1712619898403,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-07-24",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700002,
                  "idPurchase": 1712619899356,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-07-24",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2020109390,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 740.73,
                  "idContract": 202010939000002,
                  "idPurchase": 1712619899577,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-02",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2022103076,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 534.6,
                  "idContract": 202210307600002,
                  "idPurchase": 1712619908537,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-15",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2015103510,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 85.17,
                  "idContract": 202010532400002,
                  "idPurchase": 1712619928808,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-15",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2021205193,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 802.5,
                  "idContract": 202120519300002,
                  "idPurchase": 1712619929026,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-15",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2021207052,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 535,
                  "idContract": 202120705200002,
                  "idPurchase": 1712619930010,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-15",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2022107406,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 947.38,
                  "idContract": 202210740600002,
                  "idPurchase": 1712619930590,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-16",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2019213079,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 567.82,
                  "idContract": 201921307900002,
                  "idPurchase": 1712619942206,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-16",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2019213079,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 567.82,
                  "idContract": 201921307900002,
                  "idPurchase": 1712619942593,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-28",
                  "idItem": 59,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2021110252,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 39,
                  "idContract": 202111025200059,
                  "idPurchase": 1712619949348,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-04",
                  "idItem": 59,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2021110119,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 24,
                  "idContract": 202111011900059,
                  "idPurchase": 1712619955458,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2023104374,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 845.19,
                  "idContract": 202310437400002,
                  "idPurchase": 1712619962374,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2021205193,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 802.5,
                  "idContract": 202120519300002,
                  "idPurchase": 1712619968217,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2021207052,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 535,
                  "idContract": 202120705200002,
                  "idPurchase": 1712619969534,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2023113357,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 598.87,
                  "idContract": 202311335700002,
                  "idPurchase": 1712619977897,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021103095,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 511.47,
                  "idContract": 202110309500002,
                  "idPurchase": 1712619985138,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019103295,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 574.55,
                  "idContract": 201910329500002,
                  "idPurchase": 1712619983763,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022104490,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 791.05,
                  "idContract": 202210449000002,
                  "idPurchase": 1712619993452,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022104475,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 932.19,
                  "idContract": 202210447500002,
                  "idPurchase": 1712619995680,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022104403,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 758.84,
                  "idContract": 202210440300002,
                  "idPurchase": 1712619998232,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019204280,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 770.4,
                  "idContract": 201920428000002,
                  "idPurchase": 1712619998734,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020104354,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 727.39,
                  "idContract": 202010435400002,
                  "idPurchase": 1712619998952,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022204117,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 942.67,
                  "idContract": 202220411700002,
                  "idPurchase": 1712620001765,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019204247,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 758.74,
                  "idContract": 201920424700002,
                  "idPurchase": 1712620005715,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020104388,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 400.08,
                  "idContract": 202010438800002,
                  "idPurchase": 1712620006085,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019105524,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 969.85,
                  "idContract": 201910552400002,
                  "idPurchase": 1712620009843,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021205193,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 802.5,
                  "idContract": 202120519300002,
                  "idPurchase": 1712620010452,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021107221,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 974.02,
                  "idContract": 202110722100002,
                  "idPurchase": 1712620014989,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021110190,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1876.99,
                  "idContract": 202111019000002,
                  "idPurchase": 1712620026699,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019110529,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1579.57,
                  "idContract": 201911052900002,
                  "idPurchase": 1712620030519,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021110191,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1178.71,
                  "idContract": 202111019100002,
                  "idPurchase": 1712620034903,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022110271,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1020,
                  "idContract": 202211027100002,
                  "idPurchase": 1712620036152,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021110218,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1761.74,
                  "idContract": 202111021800002,
                  "idPurchase": 1712620040709,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020110423,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1864.97,
                  "idContract": 202011042300002,
                  "idPurchase": 1712620047161,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021210072,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1826.83,
                  "idContract": 202121007200002,
                  "idPurchase": 1712620048431,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019210065,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1773.17,
                  "idContract": 201921006500002,
                  "idPurchase": 1712620048653,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019211334,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 461.89,
                  "idContract": 201921133400002,
                  "idPurchase": 1712620051348,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022111063,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 619.65,
                  "idContract": 202211106300002,
                  "idPurchase": 1712620055247,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022111444,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 624.02,
                  "idContract": 202211144400002,
                  "idPurchase": 1712620057261,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022213146,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 523.05,
                  "idContract": 202221314600002,
                  "idPurchase": 1712620057837,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022213102,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 556.22,
                  "idContract": 202221310200002,
                  "idPurchase": 1712620058334,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023113357,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 598.87,
                  "idContract": 202311335700002,
                  "idPurchase": 1712620060218,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019103295,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 574.55,
                  "idContract": 201910329500002,
                  "idPurchase": 1712620071215,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2015205129,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 882.87,
                  "idContract": 202320305400002,
                  "idPurchase": 1712620071559,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021103095,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 511.47,
                  "idContract": 202110309500002,
                  "idPurchase": 1712620072721,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021203088,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 834.27,
                  "idContract": 202120308800002,
                  "idPurchase": 1712620073818,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022203208,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 704.99,
                  "idContract": 202220320800002,
                  "idPurchase": 1712620076956,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019203087,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 810.16,
                  "idContract": 201920308700002,
                  "idPurchase": 1712620077173,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022103494,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 916.89,
                  "idContract": 202210349400002,
                  "idPurchase": 1712620079141,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021204157,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 877.4,
                  "idContract": 202120415700002,
                  "idPurchase": 1712620080829,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022204173,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 417.67,
                  "idContract": 202220417300002,
                  "idPurchase": 1712620081346,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022104490,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 791.05,
                  "idContract": 202210449000002,
                  "idPurchase": 1712620081814,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022104475,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 932.19,
                  "idContract": 202210447500002,
                  "idPurchase": 1712620084485,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2016104312,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 850.4,
                  "idContract": 202110416400002,
                  "idPurchase": 1712620086330,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020104354,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 727.39,
                  "idContract": 202010435400002,
                  "idPurchase": 1712620087829,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021104035,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 887.99,
                  "idContract": 202110403500002,
                  "idPurchase": 1712620089485,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022204211,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 834.17,
                  "idContract": 202220421100002,
                  "idPurchase": 1712620090097,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023104373,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 962.89,
                  "idContract": 202310437300002,
                  "idPurchase": 1712620091986,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022104477,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 778.95,
                  "idContract": 202210447700002,
                  "idPurchase": 1712620093937,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022104399,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 941.71,
                  "idContract": 202210439900002,
                  "idPurchase": 1712620094373,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019204247,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 758.74,
                  "idContract": 201920424700002,
                  "idPurchase": 1712620094748,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020104388,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 400.08,
                  "idContract": 202010438800002,
                  "idPurchase": 1712620095110,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020105327,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 860.6,
                  "idContract": 202010532700002,
                  "idPurchase": 1712620097080,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019205116,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 822.93,
                  "idContract": 201920511600002,
                  "idPurchase": 1712620098235,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100002,
                  "idPurchase": 1712620098784,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019105524,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 969.85,
                  "idContract": 201910552400002,
                  "idPurchase": 1712620099111,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2014104284,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 952.95,
                  "idContract": 202020508500002,
                  "idPurchase": 1712620101685,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023105260,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 886.17,
                  "idContract": 202310526000002,
                  "idPurchase": 1712620102920,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022207228,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 656.34,
                  "idContract": 202220722800002,
                  "idPurchase": 1712620103831,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023107330,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 422.6,
                  "idContract": 202310733000002,
                  "idPurchase": 1712620106908,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019207217,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 855.25,
                  "idContract": 201920721700002,
                  "idPurchase": 1712620107128,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020109394,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 825.19,
                  "idContract": 202010939400002,
                  "idPurchase": 1712620110129,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020109426,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 706.95,
                  "idContract": 202010942600002,
                  "idPurchase": 1712620110564,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023109386,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 817.2,
                  "idContract": 202310938600002,
                  "idPurchase": 1712620113515,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022110125,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1020,
                  "idContract": 202211012500002,
                  "idPurchase": 1712620114833,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023110142,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1446.77,
                  "idContract": 202311014200002,
                  "idPurchase": 1712620116223,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019110502,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1815.4,
                  "idContract": 201911050200002,
                  "idPurchase": 1712620117972,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2017109369,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 772.13,
                  "idContract": 201920918800002,
                  "idPurchase": 1712620113139,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020110015,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1838.23,
                  "idContract": 202011001500002,
                  "idPurchase": 1712620118957,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022110454,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1864.56,
                  "idContract": 202211045400002,
                  "idPurchase": 1712620120041,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021210132,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1884.34,
                  "idContract": 202121013200002,
                  "idPurchase": 1712620120520,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023210049,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1658.72,
                  "idContract": 202321004900002,
                  "idPurchase": 1712620121382,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2007101005,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1895.36,
                  "idContract": 202111014000002,
                  "idPurchase": 1712620118519,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021110191,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1178.71,
                  "idContract": 202111019100002,
                  "idPurchase": 1712620125049,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022110271,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1020,
                  "idContract": 202211027100002,
                  "idPurchase": 1712620126129,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022110082,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1682.19,
                  "idContract": 202211008200002,
                  "idPurchase": 1712620126702,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022210197,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1813.77,
                  "idContract": 202221019700002,
                  "idPurchase": 1712620127658,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019110260,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1849.87,
                  "idContract": 201911026000002,
                  "idPurchase": 1712620127880,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021110218,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1761.74,
                  "idContract": 202111021800002,
                  "idPurchase": 1712620130687,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023210115,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1913.32,
                  "idContract": 202321011500002,
                  "idPurchase": 1712620131017,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020110348,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 806.31,
                  "idContract": 202011034800002,
                  "idPurchase": 1712620132908,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023210100,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1020,
                  "idContract": 202321010000002,
                  "idPurchase": 1712620134797,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021111216,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 647.13,
                  "idContract": 202111121600002,
                  "idPurchase": 1712620140698,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021111138,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 364.5,
                  "idContract": 202111113800002,
                  "idPurchase": 1712620145125,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023211142,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 364.5,
                  "idContract": 202321114200002,
                  "idPurchase": 1712620145375,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022213146,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 523.05,
                  "idContract": 202221314600002,
                  "idPurchase": 1712620147530,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020213189,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 639.7,
                  "idContract": 202021318900002,
                  "idPurchase": 1712620148558,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022213115,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 598,
                  "idContract": 202221311500002,
                  "idPurchase": 1712620149365,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021213140,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 537.42,
                  "idContract": 202121314000002,
                  "idPurchase": 1712620150137,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021213091,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 619.65,
                  "idContract": 202121309100002,
                  "idPurchase": 1712620151531,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022113078,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 602.08,
                  "idContract": 202211307800002,
                  "idPurchase": 1712620151750,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022111444,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 624.02,
                  "idContract": 202211144400002,
                  "idPurchase": 1712620146502,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021113077,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 643.27,
                  "idContract": 202111307700002,
                  "idPurchase": 1712620153171,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023213089,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 577.15,
                  "idContract": 202321308900002,
                  "idPurchase": 1712620155861,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-11-10",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023205161,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 918.27,
                  "idContract": 202320516100002,
                  "idPurchase": 1712620174969,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-11-10",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023210185,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1913.32,
                  "idContract": 202321018500002,
                  "idPurchase": 1712620175196,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-11-10",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022213234,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 364.5,
                  "idContract": 202221323400002,
                  "idPurchase": 1712620175580,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-11-28",
                  "idItem": 59,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023104258,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 9,
                  "idContract": 202310425800059,
                  "idPurchase": 1712620179634,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019203118,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 884.81,
                  "idContract": 201920311800002,
                  "idPurchase": 1712620183652,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021104125,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 422.22,
                  "idContract": 202110412500002,
                  "idPurchase": 1712620184772,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023205161,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 918.27,
                  "idContract": 202320516100002,
                  "idPurchase": 1712620185110,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019107270,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 906.93,
                  "idContract": 201910727000002,
                  "idPurchase": 1712620185631,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019209224,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 554.29,
                  "idContract": 201920922400002,
                  "idPurchase": 1712620186555,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023210185,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1913.32,
                  "idContract": 202321018500002,
                  "idPurchase": 1712620186782,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021111204,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 410.57,
                  "idContract": 202111120400002,
                  "idPurchase": 1712620187350,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2023-05-31",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2023-05-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661187230,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2023-06-30",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2023-06-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661187360,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2023-08-31",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661187642,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2023-10-31",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661187911,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2023-11-30",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661188042,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2024-02-29",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2024-02-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661188424,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2024-04-30",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2024-04-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661188674,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2024-05-31",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2024-05-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661188802,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-11-30",
                  "idPerson": 2017104639,
                  "quantity": 1,
                  "dateStart": "2018-11-01",
                  "unitPrice": 334.94,
                  "idContract": 201710463900002,
                  "idPurchase": 1712619322997,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-02-22",
                  "idItem": 91,
                  "dateEnd": "2019-01-31",
                  "idPerson": 2016207182,
                  "quantity": 1,
                  "dateStart": "2019-01-01",
                  "unitPrice": 94.94,
                  "idContract": 201620718200091,
                  "idPurchase": 1712619365396,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2020-10-05",
                  "idItem": 2,
                  "dateEnd": "2020-11-30",
                  "idPerson": 2015104227,
                  "quantity": 1,
                  "dateStart": "2020-11-01",
                  "unitPrice": 107.02,
                  "idContract": 201510422700002,
                  "idPurchase": 1712619520133,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-07-19",
                  "idItem": 2,
                  "dateEnd": "2022-08-31",
                  "idPerson": 2017207190,
                  "quantity": 1,
                  "dateStart": "2022-08-01",
                  "unitPrice": 91.08,
                  "idContract": 201720719000002,
                  "idPurchase": 1712619663999,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-12-31",
                  "idPerson": 2018209133,
                  "quantity": 1,
                  "dateStart": "2022-12-01",
                  "unitPrice": 310.14,
                  "idContract": 201820913300002,
                  "idPurchase": 1712619692696,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2019112508,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 430.35,
                  "idContract": 201911250800196,
                  "idPurchase": 1712619757881,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-02-16",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2021207134,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 736.8,
                  "idContract": 202120713400002,
                  "idPurchase": 1712619805299,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2019111118,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 364.5,
                  "idContract": 201911111800002,
                  "idPurchase": 1712619815007,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-22",
                  "idItem": 2,
                  "dateEnd": "2023-05-31",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-05-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100002,
                  "idPurchase": 1712619835419,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2022203256,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 486,
                  "idContract": 202220325600002,
                  "idPurchase": 1712619858108,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2022205210,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 965.68,
                  "idContract": 202220521000002,
                  "idPurchase": 1712619861765,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2023104373,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 962.89,
                  "idContract": 202310437300002,
                  "idPurchase": 1712619965796,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2017-08-03",
                  "idItem": 2,
                  "dateEnd": "2017-11-30",
                  "idPerson": 2017201281,
                  "quantity": 1,
                  "dateStart": "2017-11-01",
                  "unitPrice": 50.03,
                  "idContract": 201720128100002,
                  "idPurchase": 1712617361566,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-06-17",
                  "idItem": 25,
                  "dateEnd": "2022-06-30",
                  "idPerson": 2019104125,
                  "quantity": 1,
                  "dateStart": "2022-06-01",
                  "unitPrice": 100,
                  "idContract": 201910412500025,
                  "idPurchase": 1712617362667,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-06-20",
                  "idItem": 25,
                  "dateEnd": "2022-06-30",
                  "idPerson": 2017104234,
                  "quantity": 1,
                  "dateStart": "2022-06-01",
                  "unitPrice": 100,
                  "idContract": 201810226400025,
                  "idPurchase": 1712617363065,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-05-08",
                  "idItem": 61,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2015107027,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 260,
                  "idContract": 2023005200061,
                  "idPurchase": 1712618298584,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-05-21",
                  "idItem": 61,
                  "dateEnd": "2024-03-31",
                  "idPerson": 2017107089,
                  "quantity": 1,
                  "dateStart": "2024-03-01",
                  "unitPrice": 260,
                  "idContract": 2023006200061,
                  "idPurchase": 1712618309907,
                  "installments": 1,
                  "Erro": "Único",
                  "Mensagem": "Existe mais de um valor para idPurchase",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-11-19",
                  "idItem": 25,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2007101005,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 150,
                  "idContract": 202111014000025,
                  "idPurchase": 1712618320642,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2017-03-07",
                  "idItem": 2,
                  "dateEnd": "2017-02-28",
                  "idPerson": 2015108384,
                  "quantity": 1,
                  "dateStart": "2017-02-01",
                  "unitPrice": 52.36,
                  "idContract": 201510838400002,
                  "idPurchase": 1712619109186,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2017-03-27",
                  "idItem": 75,
                  "dateEnd": "2017-01-31",
                  "idPerson": 2016201174,
                  "quantity": 1,
                  "dateStart": "2017-01-01",
                  "unitPrice": 152.1,
                  "idContract": 201620117400075,
                  "idPurchase": 1712619144975,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-07-03",
                  "idItem": 86,
                  "dateEnd": "2018-07-31",
                  "idPerson": 2017110545,
                  "quantity": 1,
                  "dateStart": "2018-07-01",
                  "unitPrice": 213.57,
                  "idContract": 201711054500086,
                  "idPurchase": 1712619275880,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-07-04",
                  "idItem": 86,
                  "dateEnd": "2018-07-31",
                  "idPerson": 2017105634,
                  "quantity": 1,
                  "dateStart": "2018-07-01",
                  "unitPrice": 363.85,
                  "idContract": 201710563400086,
                  "idPurchase": 1712619276112,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-07-19",
                  "idItem": 86,
                  "dateEnd": "2018-07-31",
                  "idPerson": 2017104499,
                  "quantity": 1,
                  "dateStart": "2018-07-01",
                  "unitPrice": 82.64,
                  "idContract": 201710449900086,
                  "idPurchase": 1712619278186,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-07-25",
                  "idItem": 2,
                  "dateEnd": "2018-08-31",
                  "idPerson": 2017104293,
                  "quantity": 1,
                  "dateStart": "2018-08-01",
                  "unitPrice": 334.94,
                  "idContract": 201710429300002,
                  "idPurchase": 1712619280680,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-07-25",
                  "idItem": 2,
                  "dateEnd": "2018-08-31",
                  "idPerson": 2017104639,
                  "quantity": 1,
                  "dateStart": "2018-08-01",
                  "unitPrice": 334.94,
                  "idContract": 201710463900002,
                  "idPurchase": 1712619280900,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-07-30",
                  "idItem": 86,
                  "dateEnd": "2018-07-31",
                  "idPerson": 2016204283,
                  "quantity": 1,
                  "dateStart": "2018-07-01",
                  "unitPrice": 125.91,
                  "idContract": 201620428300086,
                  "idPurchase": 1712619282096,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-07",
                  "idItem": 86,
                  "dateEnd": "2018-07-31",
                  "idPerson": 2018101314,
                  "quantity": 1,
                  "dateStart": "2018-07-01",
                  "unitPrice": 57.94,
                  "idContract": 201810131400086,
                  "idPurchase": 1712619283910,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-14",
                  "idItem": 2,
                  "dateEnd": "2018-09-30",
                  "idPerson": 2017104648,
                  "quantity": 1,
                  "dateStart": "2018-09-01",
                  "unitPrice": 87.69,
                  "idContract": 201710464800002,
                  "idPurchase": 1712619289651,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-21",
                  "idItem": 2,
                  "dateEnd": "2018-08-31",
                  "idPerson": 2016203171,
                  "quantity": 1,
                  "dateStart": "2018-08-01",
                  "unitPrice": 90.31,
                  "idContract": 201620317100002,
                  "idPurchase": 1712619295045,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-21",
                  "idItem": 2,
                  "dateEnd": "2018-09-30",
                  "idPerson": 2016203171,
                  "quantity": 1,
                  "dateStart": "2018-09-01",
                  "unitPrice": 90.31,
                  "idContract": 201620317100002,
                  "idPurchase": 1712619295840,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-14",
                  "idItem": 2,
                  "dateEnd": "2018-09-30",
                  "idPerson": 2017104639,
                  "quantity": 1,
                  "dateStart": "2018-09-01",
                  "unitPrice": 334.94,
                  "idContract": 201710463900002,
                  "idPurchase": 1712619291151,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-12-31",
                  "idPerson": 2017104648,
                  "quantity": 1,
                  "dateStart": "2018-12-01",
                  "unitPrice": 87.69,
                  "idContract": 201710464800002,
                  "idPurchase": 1712619318152,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-12-31",
                  "idPerson": 2017104293,
                  "quantity": 1,
                  "dateStart": "2018-12-01",
                  "unitPrice": 334.94,
                  "idContract": 201710429300002,
                  "idPurchase": 1712619323808,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-09-19",
                  "idItem": 2,
                  "dateEnd": "2018-10-31",
                  "idPerson": 2017103359,
                  "quantity": 1,
                  "dateStart": "2018-10-01",
                  "unitPrice": 173.04,
                  "idContract": 201710335900002,
                  "idPurchase": 1712619329482,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-10-31",
                  "idPerson": 2017104293,
                  "quantity": 1,
                  "dateStart": "2018-10-01",
                  "unitPrice": 334.94,
                  "idContract": 201710429300002,
                  "idPurchase": 1712619321781,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-01-22",
                  "idItem": 91,
                  "dateEnd": "2019-01-31",
                  "idPerson": 2016203254,
                  "quantity": 1,
                  "dateStart": "2019-01-01",
                  "unitPrice": 76.57,
                  "idContract": 201620325400091,
                  "idPurchase": 1712619360517,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-01-29",
                  "idItem": 91,
                  "dateEnd": "2019-01-31",
                  "idPerson": 2016101301,
                  "quantity": 1,
                  "dateStart": "2019-01-01",
                  "unitPrice": 173.15,
                  "idContract": 201610130100091,
                  "idPurchase": 1712619361315,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-02-13",
                  "idItem": 91,
                  "dateEnd": "2019-01-31",
                  "idPerson": 2017103265,
                  "quantity": 1,
                  "dateStart": "2019-01-01",
                  "unitPrice": 267,
                  "idContract": 201820415200091,
                  "idPurchase": 1712619364187,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021207052,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 535,
                  "idContract": 202120705200002,
                  "idPurchase": 1712620016419,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019204280,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 770.4,
                  "idContract": 201920428000002,
                  "idPurchase": 1712620087611,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019211334,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 461.89,
                  "idContract": 201921133400002,
                  "idPurchase": 1712620140930,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-07-04",
                  "idItem": 178,
                  "dateEnd": "2022-07-31",
                  "idPerson": 2017209123,
                  "quantity": 1,
                  "dateStart": "2022-07-01",
                  "unitPrice": 275.04,
                  "idContract": 201720912300178,
                  "idPurchase": 1712619660376,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-23",
                  "idItem": 2,
                  "dateEnd": "2023-06-30",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-06-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700002,
                  "idPurchase": 1712619848826,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-06-04",
                  "idItem": 2,
                  "dateEnd": "2019-04-30",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-04-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200002,
                  "idPurchase": 1712619388808,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-06-04",
                  "idItem": 2,
                  "dateEnd": "2019-05-31",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-05-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200002,
                  "idPurchase": 1712619390153,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-06-28",
                  "idItem": 91,
                  "dateEnd": "2019-07-31",
                  "idPerson": 2016109316,
                  "quantity": 1,
                  "dateStart": "2019-07-01",
                  "unitPrice": 138.08,
                  "idContract": 201610931600091,
                  "idPurchase": 1712619402535,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-08-19",
                  "idItem": 2,
                  "dateEnd": "2019-08-31",
                  "idPerson": 2014207122,
                  "quantity": 1,
                  "dateStart": "2019-08-01",
                  "unitPrice": 96,
                  "idContract": 201420712200002,
                  "idPurchase": 1712619413813,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-08-29",
                  "idItem": 2,
                  "dateEnd": "2019-11-30",
                  "idPerson": 2018107425,
                  "quantity": 1,
                  "dateStart": "2019-11-01",
                  "unitPrice": 840,
                  "idContract": 201810742500002,
                  "idPurchase": 1712619421512,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-10",
                  "idItem": 2,
                  "dateEnd": "2018-08-31",
                  "idPerson": 2016204189,
                  "quantity": 1,
                  "dateStart": "2018-08-01",
                  "unitPrice": 159.08,
                  "idContract": 201810443600002,
                  "idPurchase": 1712619433959,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-18",
                  "idItem": 2,
                  "dateEnd": "2019-12-31",
                  "idPerson": 2017109361,
                  "quantity": 1,
                  "dateStart": "2019-12-01",
                  "unitPrice": 194.13,
                  "idContract": 201710936100002,
                  "idPurchase": 1712619450858,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-18",
                  "idItem": 2,
                  "dateEnd": "2019-11-30",
                  "idPerson": 2017109361,
                  "quantity": 1,
                  "dateStart": "2019-11-01",
                  "unitPrice": 194.13,
                  "idContract": 201710936100002,
                  "idPurchase": 1712619451369,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-10-15",
                  "idItem": 2,
                  "dateEnd": "2019-12-31",
                  "idPerson": 2017107569,
                  "quantity": 1,
                  "dateStart": "2019-12-01",
                  "unitPrice": 57.89,
                  "idContract": 201710756900002,
                  "idPurchase": 1712619463369,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2020-10-06",
                  "idItem": 2,
                  "dateEnd": "2020-12-31",
                  "idPerson": 2015104227,
                  "quantity": 1,
                  "dateStart": "2020-12-01",
                  "unitPrice": 107.02,
                  "idContract": 201510422700002,
                  "idPurchase": 1712619525886,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-01-19",
                  "idItem": 2,
                  "dateEnd": "2021-02-28",
                  "idPerson": 2020211016,
                  "quantity": 1,
                  "dateStart": "2021-02-01",
                  "unitPrice": 337.5,
                  "idContract": 202021101600002,
                  "idPurchase": 1712619533462,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-02-25",
                  "idItem": 2,
                  "dateEnd": "2021-04-30",
                  "idPerson": 2016202259,
                  "quantity": 1,
                  "dateStart": "2021-04-01",
                  "unitPrice": 49.96,
                  "idContract": 201620225900002,
                  "idPurchase": 1712619541066,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-02-25",
                  "idItem": 2,
                  "dateEnd": "2021-04-30",
                  "idPerson": 2016104182,
                  "quantity": 1,
                  "dateStart": "2021-04-01",
                  "unitPrice": 684.29,
                  "idContract": 201610418200002,
                  "idPurchase": 1712619541535,
                  "installments": 1,
                  "Erro": "Contrato não encontrado",
                  "Mensagem": "Não foi possível encontrar o contrato",
                  "Valor": 201610418200002,
                  "": ""
                },
                {
                  "date": "2021-03-05",
                  "idItem": 2,
                  "dateEnd": "2021-05-31",
                  "idPerson": 2016104182,
                  "quantity": 1,
                  "dateStart": "2021-05-01",
                  "unitPrice": 684.29,
                  "idContract": 201610418200002,
                  "idPurchase": 1712619550505,
                  "installments": 1,
                  "Erro": "Contrato não encontrado",
                  "Mensagem": "Não foi possível encontrar o contrato",
                  "Valor": 201610418200002,
                  "": ""
                },
                {
                  "date": "2021-03-17",
                  "idItem": 2,
                  "dateEnd": "2021-06-30",
                  "idPerson": 2021109253,
                  "quantity": 1,
                  "dateStart": "2021-06-01",
                  "unitPrice": 748.71,
                  "idContract": 202110925300002,
                  "idPurchase": 1712619556926,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-03-12",
                  "idItem": 2,
                  "dateEnd": "2021-06-30",
                  "idPerson": 2016202259,
                  "quantity": 1,
                  "dateStart": "2021-06-01",
                  "unitPrice": 49.96,
                  "idContract": 201620225900002,
                  "idPurchase": 1712619554646,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-09-23",
                  "idItem": 2,
                  "dateEnd": "2021-10-31",
                  "idPerson": 2021207189,
                  "quantity": 1,
                  "dateStart": "2021-10-01",
                  "unitPrice": 849.33,
                  "idContract": 202120718900002,
                  "idPurchase": 1712619582552,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-10-18",
                  "idItem": 2,
                  "dateEnd": "2021-11-30",
                  "idPerson": 2021207189,
                  "quantity": 1,
                  "dateStart": "2021-11-01",
                  "unitPrice": 849.33,
                  "idContract": 202120718900002,
                  "idPurchase": 1712619587992,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-02-24",
                  "idItem": 2,
                  "dateEnd": "2022-04-30",
                  "idPerson": 2017109121,
                  "quantity": 1,
                  "dateStart": "2022-04-01",
                  "unitPrice": 775.26,
                  "idContract": 201710912100002,
                  "idPurchase": 1712619619640,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-16",
                  "idItem": 2,
                  "dateEnd": "2022-05-31",
                  "idPerson": 2016204033,
                  "quantity": 1,
                  "dateStart": "2022-05-01",
                  "unitPrice": 246.81,
                  "idContract": 201620403300002,
                  "idPurchase": 1712619627106,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-29",
                  "idItem": 2,
                  "dateEnd": "2022-03-31",
                  "idPerson": 2016204225,
                  "quantity": 1,
                  "dateStart": "2022-03-01",
                  "unitPrice": 60.79,
                  "idContract": 201620422500002,
                  "idPurchase": 1712619638399,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-29",
                  "idItem": 2,
                  "dateEnd": "2022-02-28",
                  "idPerson": 2016204225,
                  "quantity": 1,
                  "dateStart": "2022-02-01",
                  "unitPrice": 60.79,
                  "idContract": 201620422500002,
                  "idPurchase": 1712619638623,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-04-12",
                  "idItem": 2,
                  "dateEnd": "2022-05-31",
                  "idPerson": 2016204225,
                  "quantity": 1,
                  "dateStart": "2022-05-01",
                  "unitPrice": 60.79,
                  "idContract": 201620422500002,
                  "idPurchase": 1712619643392,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-06-22",
                  "idItem": 178,
                  "dateEnd": "2022-07-31",
                  "idPerson": 2019209220,
                  "quantity": 1,
                  "dateStart": "2022-07-01",
                  "unitPrice": 800.82,
                  "idContract": 201920922000178,
                  "idPurchase": 1712619654286,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-06-29",
                  "idItem": 178,
                  "dateEnd": "2022-07-31",
                  "idPerson": 2019210122,
                  "quantity": 1,
                  "dateStart": "2022-07-01",
                  "unitPrice": 96.81,
                  "idContract": 201921012200178,
                  "idPurchase": 1712619659285,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-07-04",
                  "idItem": 178,
                  "dateEnd": "2022-07-31",
                  "idPerson": 2017207190,
                  "quantity": 1,
                  "dateStart": "2022-07-01",
                  "unitPrice": 91.08,
                  "idContract": 201720719000178,
                  "idPurchase": 1712619660145,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-07-06",
                  "idItem": 178,
                  "dateEnd": "2022-07-31",
                  "idPerson": 2017209153,
                  "quantity": 1,
                  "dateStart": "2022-07-01",
                  "unitPrice": 51.93,
                  "idContract": 201720915300178,
                  "idPurchase": 1712619660875,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-03",
                  "idItem": 2,
                  "dateEnd": "2022-08-31",
                  "idPerson": 2018209133,
                  "quantity": 1,
                  "dateStart": "2022-08-01",
                  "unitPrice": 310.14,
                  "idContract": 201820913300002,
                  "idPurchase": 1712619667338,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-10",
                  "idItem": 2,
                  "dateEnd": "2022-10-31",
                  "idPerson": 2018209133,
                  "quantity": 1,
                  "dateStart": "2022-10-01",
                  "unitPrice": 310.14,
                  "idContract": 201820913300002,
                  "idPurchase": 1712619673681,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-10",
                  "idItem": 2,
                  "dateEnd": "2022-10-31",
                  "idPerson": 2019209220,
                  "quantity": 1,
                  "dateStart": "2022-10-01",
                  "unitPrice": 800.82,
                  "idContract": 201920922000002,
                  "idPurchase": 1712619673930,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-10",
                  "idItem": 2,
                  "dateEnd": "2022-09-30",
                  "idPerson": 2018209133,
                  "quantity": 1,
                  "dateStart": "2022-09-01",
                  "unitPrice": 310.14,
                  "idContract": 201820913300002,
                  "idPurchase": 1712619674948,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-10",
                  "idItem": 2,
                  "dateEnd": "2022-09-30",
                  "idPerson": 2019209220,
                  "quantity": 1,
                  "dateStart": "2022-09-01",
                  "unitPrice": 800.82,
                  "idContract": 201920922000002,
                  "idPurchase": 1712619675195,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-10",
                  "idItem": 2,
                  "dateEnd": "2022-09-30",
                  "idPerson": 2019111336,
                  "quantity": 1,
                  "dateStart": "2022-09-01",
                  "unitPrice": 592.99,
                  "idContract": 201911133600002,
                  "idPurchase": 1712619675896,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-09-30",
                  "idPerson": 2017107264,
                  "quantity": 1,
                  "dateStart": "2022-09-01",
                  "unitPrice": 904.17,
                  "idContract": 201710726400002,
                  "idPurchase": 1712619679618,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-09-30",
                  "idPerson": 2020109432,
                  "quantity": 1,
                  "dateStart": "2022-09-01",
                  "unitPrice": 716.58,
                  "idContract": 202010943200002,
                  "idPurchase": 1712619679836,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-09-30",
                  "idPerson": 2010203135,
                  "quantity": 1,
                  "dateStart": "2022-09-01",
                  "unitPrice": 1927.38,
                  "idContract": 201711049300002,
                  "idPurchase": 1712619680219,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-10-31",
                  "idPerson": 2020213180,
                  "quantity": 1,
                  "dateStart": "2022-10-01",
                  "unitPrice": 519.82,
                  "idContract": 202021318000002,
                  "idPurchase": 1712619682271,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-10",
                  "idItem": 2,
                  "dateEnd": "2022-09-30",
                  "idPerson": 2020213180,
                  "quantity": 1,
                  "dateStart": "2022-09-01",
                  "unitPrice": 519.82,
                  "idContract": 202021318000002,
                  "idPurchase": 1712619676833,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-11-30",
                  "idPerson": 2018209133,
                  "quantity": 1,
                  "dateStart": "2022-11-01",
                  "unitPrice": 310.14,
                  "idContract": 201820913300002,
                  "idPurchase": 1712619685648,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-11-30",
                  "idPerson": 2019112268,
                  "quantity": 1,
                  "dateStart": "2022-11-01",
                  "unitPrice": 467.12,
                  "idContract": 201911226800002,
                  "idPurchase": 1712619688056,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-12-31",
                  "idPerson": 2018104350,
                  "quantity": 1,
                  "dateStart": "2022-12-01",
                  "unitPrice": 454.91,
                  "idContract": 201810435000002,
                  "idPurchase": 1712619690617,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-12-31",
                  "idPerson": 2022209122,
                  "quantity": 1,
                  "dateStart": "2022-12-01",
                  "unitPrice": 673.38,
                  "idContract": 202220912200002,
                  "idPurchase": 1712619692475,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-12-31",
                  "idPerson": 2020213180,
                  "quantity": 1,
                  "dateStart": "2022-12-01",
                  "unitPrice": 519.82,
                  "idContract": 202021318000002,
                  "idPurchase": 1712619695816,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-10-18",
                  "idItem": 2,
                  "dateEnd": "2022-10-31",
                  "idPerson": 2020111017,
                  "quantity": 1,
                  "dateStart": "2022-10-01",
                  "unitPrice": 549.99,
                  "idContract": 202011101700002,
                  "idPurchase": 1712619723604,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-10-18",
                  "idItem": 2,
                  "dateEnd": "2022-09-30",
                  "idPerson": 2022113491,
                  "quantity": 1,
                  "dateStart": "2022-09-01",
                  "unitPrice": 442.53,
                  "idContract": 202211349100002,
                  "idPurchase": 1712619722665,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-10-18",
                  "idItem": 2,
                  "dateEnd": "2022-11-30",
                  "idPerson": 2018104424,
                  "quantity": 1,
                  "dateStart": "2022-11-01",
                  "unitPrice": 820.8,
                  "idContract": 201810442400002,
                  "idPurchase": 1712619725411,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-10-18",
                  "idItem": 2,
                  "dateEnd": "2022-11-30",
                  "idPerson": 2020111017,
                  "quantity": 1,
                  "dateStart": "2022-11-01",
                  "unitPrice": 549.99,
                  "idContract": 202011101700002,
                  "idPurchase": 1712619727401,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-10-18",
                  "idItem": 2,
                  "dateEnd": "2022-12-31",
                  "idPerson": 2018104424,
                  "quantity": 1,
                  "dateStart": "2022-12-01",
                  "unitPrice": 820.8,
                  "idContract": 201810442400002,
                  "idPurchase": 1712619729025,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2018104192,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 827.75,
                  "idContract": 201810419200196,
                  "idPurchase": 1712619747317,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100196,
                  "idPurchase": 1712619748960,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700196,
                  "idPurchase": 1712619750222,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2019209220,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 816.84,
                  "idContract": 201920922000196,
                  "idPurchase": 1712619750459,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2018110328,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 970.33,
                  "idContract": 201811032800196,
                  "idPurchase": 1712619752774,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2019112268,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 395.26,
                  "idContract": 201911226800196,
                  "idPurchase": 1712619757633,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2020213180,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 561.4,
                  "idContract": 202021318000196,
                  "idPurchase": 1712619758740,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2022113491,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 477.93,
                  "idContract": 202211349100196,
                  "idPurchase": 1712619759086,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-02",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2017205296,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 122.4,
                  "idContract": 201811031200196,
                  "idPurchase": 1712619762014,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-09",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2019101503,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 298.87,
                  "idContract": 201910150300196,
                  "idPurchase": 1712619776171,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-23",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2022111173,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 499.73,
                  "idContract": 202211117300196,
                  "idPurchase": 1712619785874,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100002,
                  "idPurchase": 1712619788726,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2022203249,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 822.9,
                  "idContract": 202220324900002,
                  "idPurchase": 1712619789711,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2018104323,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 535,
                  "idContract": 201810432300002,
                  "idPurchase": 1712619791317,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2018107056,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 763.87,
                  "idContract": 201810705600002,
                  "idPurchase": 1712619792027,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2022207204,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 955.73,
                  "idContract": 202220720400002,
                  "idPurchase": 1712619792264,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2022209122,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 686.85,
                  "idContract": 202220912200002,
                  "idPurchase": 1712619792709,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2021110195,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 1787.86,
                  "idContract": 202111019500002,
                  "idPurchase": 1712619793428,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2019211234,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 627.67,
                  "idContract": 201921123400002,
                  "idPurchase": 1712619793927,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2019112510,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 440.5,
                  "idContract": 201911251000002,
                  "idPurchase": 1712619794381,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2022113491,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 477.93,
                  "idContract": 202211349100002,
                  "idPurchase": 1712619795587,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2018104350,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 491.67,
                  "idContract": 201810435000002,
                  "idPurchase": 1712619790507,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-02-14",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2021207134,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 736.8,
                  "idContract": 202120713400002,
                  "idPurchase": 1712619800563,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-02-16",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2022103470,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 406.44,
                  "idContract": 202210347000002,
                  "idPurchase": 1712619802195,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-02-16",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2018104323,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 535,
                  "idContract": 201810432300002,
                  "idPurchase": 1712619803926,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-02-23",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2022103470,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 406.44,
                  "idContract": 202210347000002,
                  "idPurchase": 1712619809884,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2018104350,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 491.67,
                  "idContract": 201810435000002,
                  "idPurchase": 1712619813196,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2018104192,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 827.75,
                  "idContract": 201810419200002,
                  "idPurchase": 1712619813539,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2022113491,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 477.93,
                  "idContract": 202211349100002,
                  "idPurchase": 1712619815605,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-23",
                  "idItem": 2,
                  "dateEnd": "2023-05-31",
                  "idPerson": 2021207134,
                  "quantity": 1,
                  "dateStart": "2023-05-01",
                  "unitPrice": 736.8,
                  "idContract": 202120713400002,
                  "idPurchase": 1712619837310,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-23",
                  "idItem": 2,
                  "dateEnd": "2023-06-30",
                  "idPerson": 2021207134,
                  "quantity": 1,
                  "dateStart": "2023-06-01",
                  "unitPrice": 736.8,
                  "idContract": 202120713400002,
                  "idPurchase": 1712619848374,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2022203249,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 822.9,
                  "idContract": 202220324900002,
                  "idPurchase": 1712619857155,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2018104350,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 491.67,
                  "idContract": 201810435000002,
                  "idPurchase": 1712619858449,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2021204206,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 856.53,
                  "idContract": 202120420600002,
                  "idPurchase": 1712619858669,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2015204062,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 491.44,
                  "idContract": 201710427600002,
                  "idPurchase": 1712619859121,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2019204363,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 744.35,
                  "idContract": 201920436300002,
                  "idPurchase": 1712619859951,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2018104192,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 827.75,
                  "idContract": 201810419200002,
                  "idPurchase": 1712619860277,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2019105181,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 562.28,
                  "idContract": 201910518100002,
                  "idPurchase": 1712619860951,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2019205368,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 923.95,
                  "idContract": 201920536800002,
                  "idPurchase": 1712619861322,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2021107223,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 945.45,
                  "idContract": 202110722300002,
                  "idPurchase": 1712619862421,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2022207204,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 955.73,
                  "idContract": 202220720400002,
                  "idPurchase": 1712619862890,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2016109395,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 658.76,
                  "idContract": 202110927500002,
                  "idPurchase": 1712619863108,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2022209122,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 686.85,
                  "idContract": 202220912200002,
                  "idPurchase": 1712619863789,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2019209220,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 816.84,
                  "idContract": 201920922000002,
                  "idPurchase": 1712619864198,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2021110195,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 1787.86,
                  "idContract": 202111019500002,
                  "idPurchase": 1712619865240,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2019111118,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 364.5,
                  "idContract": 201911111800002,
                  "idPurchase": 1712619866653,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2020113246,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 602.08,
                  "idContract": 202011324600002,
                  "idPurchase": 1712619867592,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2020213180,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 561.4,
                  "idContract": 202021318000002,
                  "idPurchase": 1712619867834,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-05-09",
                  "idItem": 61,
                  "dateEnd": "2024-08-31",
                  "idPerson": 2013105124,
                  "quantity": 1,
                  "dateStart": "2024-08-01",
                  "unitPrice": 220,
                  "idContract": 2023007100061,
                  "idPurchase": 1712619871031,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2020110068,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 1813.36,
                  "idContract": 202011006800197,
                  "idPurchase": 1712619882699,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2019109092,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 627.36,
                  "idContract": 201910909200197,
                  "idPurchase": 1712619883935,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700197,
                  "idPurchase": 1712619884153,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2018207179,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 695.39,
                  "idContract": 201820717900197,
                  "idPurchase": 1712619886152,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2023107371,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 885,
                  "idContract": 202310737100197,
                  "idPurchase": 1712619886402,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2019107375,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 929.61,
                  "idContract": 201910737500197,
                  "idPurchase": 1712619887845,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2017105575,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 110.21,
                  "idContract": 201710557500197,
                  "idPurchase": 1712619889084,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100197,
                  "idPurchase": 1712619889338,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2021205193,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 802.5,
                  "idContract": 202120519300197,
                  "idPurchase": 1712619889560,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2023104362,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 535,
                  "idContract": 202310436200197,
                  "idPurchase": 1712619890882,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-07-24",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2023104374,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 845.19,
                  "idContract": 202310437400002,
                  "idPurchase": 1712619895451,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-07-24",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2021205193,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 802.5,
                  "idContract": 202120519300002,
                  "idPurchase": 1712619898059,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-07-30",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2023204121,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 327.74,
                  "idContract": 202320412100002,
                  "idPurchase": 1712619907036,
                  "installments": 1,
                  "Erro": "Contrato não encontrado",
                  "Mensagem": "Não foi possível encontrar o contrato",
                  "Valor": 202320412100002,
                  "": ""
                },
                {
                  "date": "2023-08-02",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2022107406,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 947.38,
                  "idContract": 202210740600002,
                  "idPurchase": 1712619909640,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-15",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2023104373,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 962.89,
                  "idContract": 202310437300002,
                  "idPurchase": 1712619926311,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-15",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100002,
                  "idPurchase": 1712619928484,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-16",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700002,
                  "idPurchase": 1712619931791,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-16",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2020109390,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 740.73,
                  "idContract": 202010939000002,
                  "idPurchase": 1712619932012,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-16",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2020110068,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 1813.36,
                  "idContract": 202011006800002,
                  "idPurchase": 1712619934481,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2022103076,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 534.6,
                  "idContract": 202210307600002,
                  "idPurchase": 1712619959891,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100002,
                  "idPurchase": 1712619967887,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2023107371,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 885,
                  "idContract": 202310737100002,
                  "idPurchase": 1712619969107,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700002,
                  "idPurchase": 1712619971074,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2020109390,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 740.73,
                  "idContract": 202010939000002,
                  "idPurchase": 1712619971398,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2023110142,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 1446.77,
                  "idContract": 202311014200002,
                  "idPurchase": 1712619972553,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2020110015,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 1838.23,
                  "idContract": 202011001500002,
                  "idPurchase": 1712619973219,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020101396,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 287.47,
                  "idContract": 202210224300002,
                  "idPurchase": 1712619980543,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022103076,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 534.6,
                  "idContract": 202210307600002,
                  "idPurchase": 1712619982626,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2016104312,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 850.4,
                  "idContract": 202110416400002,
                  "idPurchase": 1712619997390,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021104035,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 887.99,
                  "idContract": 202110403500002,
                  "idPurchase": 1712620000406,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023104373,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 962.89,
                  "idContract": 202310437300002,
                  "idPurchase": 1712620002857,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2018204018,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 937.64,
                  "idContract": 201820401800002,
                  "idPurchase": 1712620004516,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022104399,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 941.71,
                  "idContract": 202210439900002,
                  "idPurchase": 1712620005332,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021105104,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1033.84,
                  "idContract": 202110510400002,
                  "idPurchase": 1712620008381,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100002,
                  "idPurchase": 1712620009500,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019105395,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 980.66,
                  "idContract": 201910539500002,
                  "idPurchase": 1712620010670,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022205090,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 909.5,
                  "idContract": 202220509000002,
                  "idPurchase": 1712620011503,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020205135,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 332.07,
                  "idContract": 202020513500002,
                  "idPurchase": 1712620012698,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019205062,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 955.51,
                  "idContract": 201920506200002,
                  "idPurchase": 1712620013052,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2018207006,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 726.1,
                  "idContract": 201910723700002,
                  "idPurchase": 1712620015397,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023107371,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 885,
                  "idContract": 202310737100002,
                  "idPurchase": 1712620015653,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022107406,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 947.38,
                  "idContract": 202210740600002,
                  "idPurchase": 1712620018294,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020109394,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 825.19,
                  "idContract": 202010939400002,
                  "idPurchase": 1712620020718,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019109135,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 773.14,
                  "idContract": 201910913500002,
                  "idPurchase": 1712620021451,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700002,
                  "idPurchase": 1712620022182,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023110142,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1446.77,
                  "idContract": 202311014200002,
                  "idPurchase": 1712620026076,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019110502,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1815.4,
                  "idContract": 201911050200002,
                  "idPurchase": 1712620027670,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2007101005,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1895.36,
                  "idContract": 202111014000002,
                  "idPurchase": 1712620028296,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020110015,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1838.23,
                  "idContract": 202011001500002,
                  "idPurchase": 1712620028748,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021210132,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1884.34,
                  "idContract": 202121013200002,
                  "idPurchase": 1712620030266,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023210049,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1658.72,
                  "idContract": 202321004900002,
                  "idPurchase": 1712620031123,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020110068,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1813.36,
                  "idContract": 202011006800002,
                  "idPurchase": 1712620034309,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019110260,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1849.87,
                  "idContract": 201911026000002,
                  "idPurchase": 1712620037809,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023210057,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1715.64,
                  "idContract": 202321005700002,
                  "idPurchase": 1712620039976,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023110222,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1874.96,
                  "idContract": 202311022200002,
                  "idPurchase": 1712620040332,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023210115,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1913.32,
                  "idContract": 202321011500002,
                  "idPurchase": 1712620041060,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023210174,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1865.2,
                  "idContract": 202321017400002,
                  "idPurchase": 1712620041321,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023110351,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1620.89,
                  "idContract": 202311035100002,
                  "idPurchase": 1712620041920,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020110348,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 806.31,
                  "idContract": 202011034800002,
                  "idPurchase": 1712620042904,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020110400,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1816.22,
                  "idContract": 202011040000002,
                  "idPurchase": 1712620047787,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019110525,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1693.4,
                  "idContract": 201911052500002,
                  "idPurchase": 1712620049686,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021111138,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 364.5,
                  "idContract": 202111113800002,
                  "idPurchase": 1712620055747,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020111251,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 364.5,
                  "idContract": 202011125100002,
                  "idPurchase": 1712620056342,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021113077,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 643.27,
                  "idContract": 202111307700002,
                  "idPurchase": 1712620063394,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022213199,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 634.96,
                  "idContract": 202221319900002,
                  "idPurchase": 1712620065123,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020101396,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 287.47,
                  "idContract": 202210224300002,
                  "idPurchase": 1712620068010,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022103495,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 852.35,
                  "idContract": 202210349500002,
                  "idPurchase": 1712620075940,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023103369,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 804.91,
                  "idContract": 202310336900002,
                  "idPurchase": 1712620078143,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021103244,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 864.98,
                  "idContract": 202110324400002,
                  "idPurchase": 1712620078732,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023103366,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 973.56,
                  "idContract": 202310336600002,
                  "idPurchase": 1712620079907,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021104239,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 966.52,
                  "idContract": 202110423900002,
                  "idPurchase": 1712620080610,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019104398,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 908.11,
                  "idContract": 201910439800002,
                  "idPurchase": 1712620086107,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022104403,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 758.84,
                  "idContract": 202210440300002,
                  "idPurchase": 1712620087112,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019104283,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 535,
                  "idContract": 201910428300002,
                  "idPurchase": 1712620088845,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2018204018,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 937.64,
                  "idContract": 201820401800002,
                  "idPurchase": 1712620093592,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022204117,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 942.67,
                  "idContract": 202220411700002,
                  "idPurchase": 1712620090877,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021105104,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1033.84,
                  "idContract": 202110510400002,
                  "idPurchase": 1712620097693,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022205090,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 909.5,
                  "idContract": 202220509000002,
                  "idPurchase": 1712620100753,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019205062,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 955.51,
                  "idContract": 201920506200002,
                  "idPurchase": 1712620102237,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021107251,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 974.01,
                  "idContract": 202110725100002,
                  "idPurchase": 1712620103142,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2018207006,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 726.1,
                  "idContract": 201910723700002,
                  "idPurchase": 1712620104643,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023107371,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 885,
                  "idContract": 202310737100002,
                  "idPurchase": 1712620104892,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020104165,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 945.45,
                  "idContract": 202120714200002,
                  "idPurchase": 1712620105985,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020107299,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 858.03,
                  "idContract": 202010729900002,
                  "idPurchase": 1712620106206,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022107406,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 947.38,
                  "idContract": 202210740600002,
                  "idPurchase": 1712620107815,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019103354,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 898.58,
                  "idContract": 201910738200002,
                  "idPurchase": 1712620108513,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021107237,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 966.96,
                  "idContract": 202110723700002,
                  "idPurchase": 1712620109438,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023209140,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 530.42,
                  "idContract": 202320914000002,
                  "idPurchase": 1712620110907,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019109135,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 773.14,
                  "idContract": 201910913500002,
                  "idPurchase": 1712620111128,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700002,
                  "idPurchase": 1712620111909,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020109390,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 740.73,
                  "idContract": 202010939000002,
                  "idPurchase": 1712620112362,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022209224,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 803.53,
                  "idContract": 202220922400002,
                  "idPurchase": 1712620114064,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021210156,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1737.88,
                  "idContract": 202121015600002,
                  "idPurchase": 1712620116549,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021110234,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1528.78,
                  "idContract": 202111023400002,
                  "idPurchase": 1712620116795,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021110190,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1876.99,
                  "idContract": 202111019000002,
                  "idPurchase": 1712620117046,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023110345,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1841.1,
                  "idContract": 202311034500002,
                  "idPurchase": 1712620117301,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019110529,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1579.57,
                  "idContract": 201911052900002,
                  "idPurchase": 1712620120765,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020210170,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1885.57,
                  "idContract": 202021017000002,
                  "idPurchase": 1712620122799,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020110068,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1813.36,
                  "idContract": 202011006800002,
                  "idPurchase": 1712620124505,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023110222,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1874.96,
                  "idContract": 202311022200002,
                  "idPurchase": 1712620130336,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022110492,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1733.19,
                  "idContract": 202211049200002,
                  "idPurchase": 1712620133310,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019210279,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1727.88,
                  "idContract": 201921027900002,
                  "idPurchase": 1712620133535,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023210057,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1715.64,
                  "idContract": 202321005700002,
                  "idPurchase": 1712620129911,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021210072,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1826.83,
                  "idContract": 202121007200002,
                  "idPurchase": 1712620138469,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019210065,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1773.17,
                  "idContract": 201921006500002,
                  "idPurchase": 1712620138688,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019210064,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1773.17,
                  "idContract": 201921006400002,
                  "idPurchase": 1712620139424,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021211159,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 535.81,
                  "idContract": 202121115900002,
                  "idPurchase": 1712620144199,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020111251,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 364.5,
                  "idContract": 202011125100002,
                  "idPurchase": 1712620145834,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022212241,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 247.5,
                  "idContract": 202221224100002,
                  "idPurchase": 1712620146957,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022213102,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 556.22,
                  "idContract": 202221310200002,
                  "idPurchase": 1712620148001,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021213161,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 503.52,
                  "idContract": 202121316100002,
                  "idPurchase": 1712620149705,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023113357,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 598.87,
                  "idContract": 202311335700002,
                  "idPurchase": 1712620149923,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022113443,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 572.55,
                  "idContract": 202211344300002,
                  "idPurchase": 1712620150943,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022113468,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 623.37,
                  "idContract": 202211346800002,
                  "idPurchase": 1712620151314,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022213046,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 426.47,
                  "idContract": 202221304600002,
                  "idPurchase": 1712620154012,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-10-02",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2023210184,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 1858.44,
                  "idContract": 202321018400002,
                  "idPurchase": 1712620159363,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-11-10",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021104160,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 974.02,
                  "idContract": 202110416000002,
                  "idPurchase": 1712620174745,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-11-29",
                  "idItem": 59,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022213162,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 6,
                  "idContract": 202221316200059,
                  "idPurchase": 1712620179869,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2023-04-30",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661187078,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2023-07-31",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661187487,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2023-09-30",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661187770,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2023-12-31",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661188178,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2024-01-31",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2024-01-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661188298,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2024-03-31",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2024-03-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661188548,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2024-06-30",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2024-06-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661188927,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-13",
                  "idItem": 61,
                  "dateEnd": "2024-07-31",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2024-07-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712661189049,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-06-22",
                  "idItem": 178,
                  "dateEnd": "2022-07-31",
                  "idPerson": 2017204219,
                  "quantity": 1,
                  "dateStart": "2022-07-01",
                  "unitPrice": 29.95,
                  "idContract": 201720421900178,
                  "idPurchase": 1712619657155,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-12",
                  "idItem": 61,
                  "dateEnd": "2023-03-31",
                  "idPerson": 20220090,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 220,
                  "idContract": 2022009000061,
                  "idPurchase": 1712662713471,
                  "installments": 1,
                  "Erro": "Relacionamento entre arquivos",
                  "Mensagem": "Propriedade idPerson não foi encontrada - valor 20220090",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-26",
                  "idItem": 61,
                  "dateEnd": "2024-06-30",
                  "idPerson": 20230063,
                  "quantity": 1,
                  "dateStart": "2024-06-01",
                  "unitPrice": 260,
                  "idContract": 2023006300061,
                  "idPurchase": 1712618294385,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-05-25",
                  "idItem": 25,
                  "dateEnd": "2023-05-31",
                  "idPerson": 2015203175,
                  "quantity": 1,
                  "dateStart": "2023-05-01",
                  "unitPrice": 100,
                  "idContract": 202211047600025,
                  "idPurchase": 1712618313308,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-03",
                  "idItem": 25,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019203357,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 50,
                  "idContract": 201920335700025,
                  "idPurchase": 1712618323344,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2024-01-08",
                  "idItem": 14,
                  "dateEnd": "2024-01-31",
                  "idPerson": 2020104117,
                  "quantity": 1,
                  "dateStart": "2024-01-01",
                  "unitPrice": 10,
                  "idContract": 202010411700014,
                  "idPurchase": 1712618324879,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-08",
                  "idItem": 86,
                  "dateEnd": "2018-07-31",
                  "idPerson": 2017103631,
                  "quantity": 1,
                  "dateStart": "2018-07-01",
                  "unitPrice": 217.5,
                  "idContract": 201710363100086,
                  "idPurchase": 1712619284270,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-10-31",
                  "idPerson": 2016203171,
                  "quantity": 1,
                  "dateStart": "2018-10-01",
                  "unitPrice": 90.31,
                  "idContract": 201620317100002,
                  "idPurchase": 1712619299593,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-10-31",
                  "idPerson": 2017104648,
                  "quantity": 1,
                  "dateStart": "2018-10-01",
                  "unitPrice": 87.69,
                  "idContract": 201710464800002,
                  "idPurchase": 1712619303548,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-11-30",
                  "idPerson": 2016203171,
                  "quantity": 1,
                  "dateStart": "2018-11-01",
                  "unitPrice": 90.31,
                  "idContract": 201620317100002,
                  "idPurchase": 1712619307123,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-11-30",
                  "idPerson": 2017104648,
                  "quantity": 1,
                  "dateStart": "2018-11-01",
                  "unitPrice": 87.69,
                  "idContract": 201710464800002,
                  "idPurchase": 1712619310637,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-10-31",
                  "idPerson": 2017104639,
                  "quantity": 1,
                  "dateStart": "2018-10-01",
                  "unitPrice": 334.94,
                  "idContract": 201710463900002,
                  "idPurchase": 1712619322003,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-12-31",
                  "idPerson": 2017104639,
                  "quantity": 1,
                  "dateStart": "2018-12-01",
                  "unitPrice": 334.94,
                  "idContract": 201710463900002,
                  "idPurchase": 1712619324029,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-01-02",
                  "idItem": 91,
                  "dateEnd": "2019-01-31",
                  "idPerson": 2014103112,
                  "quantity": 1,
                  "dateStart": "2019-01-01",
                  "unitPrice": 95,
                  "idContract": 201410311200091,
                  "idPurchase": 1712619354939,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-02-08",
                  "idItem": 91,
                  "dateEnd": "2019-01-31",
                  "idPerson": 2017210167,
                  "quantity": 1,
                  "dateStart": "2019-01-01",
                  "unitPrice": 125.72,
                  "idContract": 201721016700091,
                  "idPurchase": 1712619363925,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020110400,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1816.22,
                  "idContract": 202011040000002,
                  "idPurchase": 1712620137907,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019104215,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 581.33,
                  "idContract": 201910421500002,
                  "idPurchase": 1712620184297,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020107313,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 535,
                  "idContract": 202010731300002,
                  "idPurchase": 1712620186022,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-06-04",
                  "idItem": 2,
                  "dateEnd": "2019-02-28",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-02-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200002,
                  "idPurchase": 1712619384236,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-07-01",
                  "idItem": 91,
                  "dateEnd": "2019-07-31",
                  "idPerson": 2011104066,
                  "quantity": 1,
                  "dateStart": "2019-07-01",
                  "unitPrice": 490,
                  "idContract": 201420415200091,
                  "idPurchase": 1712619403470,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-07-22",
                  "idItem": 91,
                  "dateEnd": "2019-07-31",
                  "idPerson": 2017104588,
                  "quantity": 1,
                  "dateStart": "2019-07-01",
                  "unitPrice": 56.54,
                  "idContract": 201710458800091,
                  "idPurchase": 1712619406303,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-08-21",
                  "idItem": 2,
                  "dateEnd": "2019-09-30",
                  "idPerson": 2018107425,
                  "quantity": 1,
                  "dateStart": "2019-09-01",
                  "unitPrice": 840,
                  "idContract": 201810742500002,
                  "idPurchase": 1712619414374,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-08-30",
                  "idItem": 2,
                  "dateEnd": "2019-12-31",
                  "idPerson": 2018107425,
                  "quantity": 1,
                  "dateStart": "2019-12-01",
                  "unitPrice": 840,
                  "idContract": 201810742500002,
                  "idPurchase": 1712619427813,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-12",
                  "idItem": 91,
                  "dateEnd": "2019-07-31",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-07-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200091,
                  "idPurchase": 1712619448953,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-12",
                  "idItem": 2,
                  "dateEnd": "2019-11-30",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-11-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200002,
                  "idPurchase": 1712619449608,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-12",
                  "idItem": 2,
                  "dateEnd": "2019-10-31",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-10-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200002,
                  "idPurchase": 1712619449828,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-12",
                  "idItem": 2,
                  "dateEnd": "2019-09-30",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-09-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200002,
                  "idPurchase": 1712619450046,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-12",
                  "idItem": 2,
                  "dateEnd": "2019-08-31",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-08-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200002,
                  "idPurchase": 1712619450267,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2020-12-15",
                  "idItem": 159,
                  "dateEnd": "2021-01-31",
                  "idPerson": 2018204103,
                  "quantity": 1,
                  "dateStart": "2021-01-01",
                  "unitPrice": 381.4,
                  "idContract": 201820410300159,
                  "idPurchase": 1712619530972,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-01-18",
                  "idItem": 2,
                  "dateEnd": "2021-02-28",
                  "idPerson": 2016104182,
                  "quantity": 1,
                  "dateStart": "2021-02-01",
                  "unitPrice": 684.29,
                  "idContract": 201610418200002,
                  "idPurchase": 1712619532639,
                  "installments": 1,
                  "Erro": "Contrato não encontrado",
                  "Mensagem": "Não foi possível encontrar o contrato",
                  "Valor": 201610418200002,
                  "": ""
                },
                {
                  "date": "2021-02-09",
                  "idItem": 2,
                  "dateEnd": "2021-03-31",
                  "idPerson": 2020211089,
                  "quantity": 1,
                  "dateStart": "2021-03-01",
                  "unitPrice": 550.2,
                  "idContract": 202021108900002,
                  "idPurchase": 1712619536364,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-02-26",
                  "idItem": 2,
                  "dateEnd": "2021-05-31",
                  "idPerson": 2016202259,
                  "quantity": 1,
                  "dateStart": "2021-05-01",
                  "unitPrice": 49.96,
                  "idContract": 201620225900002,
                  "idPurchase": 1712619546356,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-03-11",
                  "idItem": 2,
                  "dateEnd": "2021-05-31",
                  "idPerson": 2020211089,
                  "quantity": 1,
                  "dateStart": "2021-05-01",
                  "unitPrice": 550.2,
                  "idContract": 202021108900002,
                  "idPurchase": 1712619552489,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-03-11",
                  "idItem": 2,
                  "dateEnd": "2021-05-31",
                  "idPerson": 2020211016,
                  "quantity": 1,
                  "dateStart": "2021-05-01",
                  "unitPrice": 337.5,
                  "idContract": 202021101600002,
                  "idPurchase": 1712619552710,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-03-16",
                  "idItem": 2,
                  "dateEnd": "2021-06-30",
                  "idPerson": 2018104060,
                  "quantity": 1,
                  "dateStart": "2021-06-01",
                  "unitPrice": 883.18,
                  "idContract": 201810406000002,
                  "idPurchase": 1712619555756,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-03-16",
                  "idItem": 2,
                  "dateEnd": "2021-06-30",
                  "idPerson": 2016104182,
                  "quantity": 1,
                  "dateStart": "2021-06-01",
                  "unitPrice": 684.29,
                  "idContract": 201610418200002,
                  "idPurchase": 1712619555974,
                  "installments": 1,
                  "Erro": "Contrato não encontrado",
                  "Mensagem": "Não foi possível encontrar o contrato",
                  "Valor": 201610418200002,
                  "": ""
                },
                {
                  "date": "2021-08-26",
                  "idItem": 2,
                  "dateEnd": "2021-09-30",
                  "idPerson": 2021207189,
                  "quantity": 1,
                  "dateStart": "2021-09-01",
                  "unitPrice": 140.67,
                  "idContract": 202120718900002,
                  "idPurchase": 1712619575296,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-02-24",
                  "idItem": 2,
                  "dateEnd": "2022-04-30",
                  "idPerson": 2020209086,
                  "quantity": 1,
                  "dateStart": "2022-04-01",
                  "unitPrice": 808.56,
                  "idContract": 202020908600002,
                  "idPurchase": 1712619619982,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-04-12",
                  "idItem": 2,
                  "dateEnd": "2022-06-30",
                  "idPerson": 2016204225,
                  "quantity": 1,
                  "dateStart": "2022-06-01",
                  "unitPrice": 60.79,
                  "idContract": 201620422500002,
                  "idPurchase": 1712619644956,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-06-22",
                  "idItem": 178,
                  "dateEnd": "2022-07-31",
                  "idPerson": 2017104244,
                  "quantity": 1,
                  "dateStart": "2022-07-01",
                  "unitPrice": 817.25,
                  "idContract": 201710424400178,
                  "idPurchase": 1712619657530,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-07-19",
                  "idItem": 2,
                  "dateEnd": "2022-08-31",
                  "idPerson": 2019209220,
                  "quantity": 1,
                  "dateStart": "2022-08-01",
                  "unitPrice": 800.82,
                  "idContract": 201920922000002,
                  "idPurchase": 1712619664227,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-10-31",
                  "idPerson": 2019112268,
                  "quantity": 1,
                  "dateStart": "2022-10-01",
                  "unitPrice": 467.12,
                  "idContract": 201911226800002,
                  "idPurchase": 1712619681899,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-11-30",
                  "idPerson": 2019209220,
                  "quantity": 1,
                  "dateStart": "2022-11-01",
                  "unitPrice": 800.82,
                  "idContract": 201920922000002,
                  "idPurchase": 1712619685897,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-11-30",
                  "idPerson": 2019111336,
                  "quantity": 1,
                  "dateStart": "2022-11-01",
                  "unitPrice": 592.99,
                  "idContract": 201911133600002,
                  "idPurchase": 1712619687022,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-11-30",
                  "idPerson": 2020213180,
                  "quantity": 1,
                  "dateStart": "2022-11-01",
                  "unitPrice": 519.82,
                  "idContract": 202021318000002,
                  "idPurchase": 1712619688426,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-12-31",
                  "idPerson": 2019111336,
                  "quantity": 1,
                  "dateStart": "2022-12-01",
                  "unitPrice": 592.99,
                  "idContract": 201911133600002,
                  "idPurchase": 1712619694007,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-09-21",
                  "idItem": 2,
                  "dateEnd": "2022-09-30",
                  "idPerson": 2018104424,
                  "quantity": 1,
                  "dateStart": "2022-09-01",
                  "unitPrice": 820.8,
                  "idContract": 201810442400002,
                  "idPurchase": 1712619711597,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-09-21",
                  "idItem": 2,
                  "dateEnd": "2022-10-31",
                  "idPerson": 2018104424,
                  "quantity": 1,
                  "dateStart": "2022-10-01",
                  "unitPrice": 820.8,
                  "idContract": 201810442400002,
                  "idPurchase": 1712619712478,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-10-18",
                  "idItem": 2,
                  "dateEnd": "2022-10-31",
                  "idPerson": 2022113491,
                  "quantity": 1,
                  "dateStart": "2022-10-01",
                  "unitPrice": 442.53,
                  "idContract": 202211349100002,
                  "idPurchase": 1712619723834,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-10-18",
                  "idItem": 2,
                  "dateEnd": "2022-08-31",
                  "idPerson": 2022113491,
                  "quantity": 1,
                  "dateStart": "2022-08-01",
                  "unitPrice": 442.53,
                  "idContract": 202211349100002,
                  "idPurchase": 1712619721750,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-10-18",
                  "idItem": 2,
                  "dateEnd": "2022-12-31",
                  "idPerson": 2022113491,
                  "quantity": 1,
                  "dateStart": "2022-12-01",
                  "unitPrice": 442.53,
                  "idContract": 202211349100002,
                  "idPurchase": 1712619731192,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2017107555,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 64.52,
                  "idContract": 201710755500196,
                  "idPurchase": 1712619749424,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2022209122,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 686.85,
                  "idContract": 202220912200196,
                  "idPurchase": 1712619749865,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2017110469,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 544.49,
                  "idContract": 201911144300196,
                  "idPurchase": 1712619756280,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-23",
                  "idItem": 2,
                  "dateEnd": "2023-06-30",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-06-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100002,
                  "idPurchase": 1712619846951,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2018104192,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 827.75,
                  "idContract": 201810419200002,
                  "idPurchase": 1712619790963,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2019112508,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 430.35,
                  "idContract": 201911250800002,
                  "idPurchase": 1712619795003,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2018104323,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 535,
                  "idContract": 201810432300002,
                  "idPurchase": 1712619816383,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2021204152,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 861.35,
                  "idContract": 202120415200002,
                  "idPurchase": 1712619816603,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2021207134,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 736.8,
                  "idContract": 202120713400002,
                  "idPurchase": 1712619817538,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700002,
                  "idPurchase": 1712619817757,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-03-31",
                  "idPerson": 2020213180,
                  "quantity": 1,
                  "dateStart": "2023-03-01",
                  "unitPrice": 561.4,
                  "idContract": 202021318000002,
                  "idPurchase": 1712619815237,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-22",
                  "idItem": 2,
                  "dateEnd": "2023-05-31",
                  "idPerson": 2018104323,
                  "quantity": 1,
                  "dateStart": "2023-05-01",
                  "unitPrice": 535,
                  "idContract": 201810432300002,
                  "idPurchase": 1712619834843,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-23",
                  "idItem": 2,
                  "dateEnd": "2023-05-31",
                  "idPerson": 2022209227,
                  "quantity": 1,
                  "dateStart": "2023-05-01",
                  "unitPrice": 667.12,
                  "idContract": 202220922700002,
                  "idPurchase": 1712619837653,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-23",
                  "idItem": 2,
                  "dateEnd": "2023-05-31",
                  "idPerson": 2022209177,
                  "quantity": 1,
                  "dateStart": "2023-05-01",
                  "unitPrice": 350.77,
                  "idContract": 202220917700002,
                  "idPurchase": 1712619837874,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2022113491,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 477.93,
                  "idContract": 202211349100002,
                  "idPurchase": 1712619868655,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-04-05",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2019213101,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 652.74,
                  "idContract": 201921310100002,
                  "idPurchase": 1712619868092,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-06-16",
                  "idItem": 197,
                  "dateEnd": "2023-07-31",
                  "idPerson": 2022107406,
                  "quantity": 1,
                  "dateStart": "2023-07-01",
                  "unitPrice": 947.38,
                  "idContract": 202210740600197,
                  "idPurchase": 1712619887498,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-07-24",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100002,
                  "idPurchase": 1712619897716,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-07-24",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2021207052,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 535,
                  "idContract": 202120705200002,
                  "idPurchase": 1712619898653,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-15",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2022103076,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 534.6,
                  "idContract": 202210307600002,
                  "idPurchase": 1712619920260,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-08-15",
                  "idItem": 2,
                  "dateEnd": "2023-09-30",
                  "idPerson": 2023107371,
                  "quantity": 1,
                  "dateStart": "2023-09-01",
                  "unitPrice": 885,
                  "idContract": 202310737100002,
                  "idPurchase": 1712619929764,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2022107406,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 947.38,
                  "idContract": 202210740600002,
                  "idPurchase": 1712619970109,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021107237,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 966.96,
                  "idContract": 202110723700002,
                  "idPurchase": 1712620019983,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022110228,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1866,
                  "idContract": 202211022800002,
                  "idPurchase": 1712620043889,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022201098,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 334.64,
                  "idContract": 202220109800002,
                  "idPurchase": 1712620066327,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022103076,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 534.6,
                  "idContract": 202210307600002,
                  "idPurchase": 1712620070178,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021104233,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 966.53,
                  "idContract": 202110423300002,
                  "idPurchase": 1712620088298,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021205193,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 802.5,
                  "idContract": 202120519300002,
                  "idPurchase": 1712620099845,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023210174,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1865.2,
                  "idContract": 202321017400002,
                  "idPurchase": 1712620131263,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022213199,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 634.96,
                  "idContract": 202221319900002,
                  "idPurchase": 1712620155405,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022211145,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 512.13,
                  "idContract": 202221114500002,
                  "idPurchase": 1712620141997,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022111063,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 619.65,
                  "idContract": 202211106300002,
                  "idPurchase": 1712620144688,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020103417,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 867.02,
                  "idContract": 202010341700002,
                  "idPurchase": 1712620183383,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020105435,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 982.69,
                  "idContract": 202010543500002,
                  "idPurchase": 1712620185368,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-19",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022213234,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 364.5,
                  "idContract": 202221323400002,
                  "idPurchase": 1712620187737,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-12-20",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2023210185,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 1913.32,
                  "idContract": 202321018500002,
                  "idPurchase": 1712620188672,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2022203249,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 822.9,
                  "idContract": 202220324900196,
                  "idPurchase": 1712619741486,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2019209220,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 816.84,
                  "idContract": 201920922000002,
                  "idPurchase": 1712619792931,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-14",
                  "idItem": 2,
                  "dateEnd": "2023-10-31",
                  "idPerson": 2020110068,
                  "quantity": 1,
                  "dateStart": "2023-10-01",
                  "unitPrice": 1813.36,
                  "idContract": 202011006800002,
                  "idPurchase": 1712619974077,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2017-08-03",
                  "idItem": 2,
                  "dateEnd": "2017-12-31",
                  "idPerson": 2017201281,
                  "quantity": 1,
                  "dateStart": "2017-12-01",
                  "unitPrice": 50.03,
                  "idContract": 201720128100002,
                  "idPurchase": 1712617361971,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-05-25",
                  "idItem": 25,
                  "dateEnd": "2023-05-31",
                  "idPerson": 2015203175,
                  "quantity": 1,
                  "dateStart": "2023-05-01",
                  "unitPrice": 100,
                  "idContract": 202211047600025,
                  "idPurchase": 1712618313425,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2012-08-07",
                  "idItem": 2,
                  "dateEnd": "2012-08-31",
                  "idPerson": 2012203265,
                  "quantity": 1,
                  "dateStart": "2012-08-01",
                  "unitPrice": 585.96,
                  "idContract": 201220326500002,
                  "idPurchase": 1712618615876,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-06-04",
                  "idItem": 2,
                  "dateEnd": "2019-03-31",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-03-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200002,
                  "idPurchase": 1712619387903,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-09",
                  "idItem": 86,
                  "dateEnd": "2018-07-31",
                  "idPerson": 2017103265,
                  "quantity": 1,
                  "dateStart": "2018-07-01",
                  "unitPrice": 249.78,
                  "idContract": 201710326500086,
                  "idPurchase": 1712619285580,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-14",
                  "idItem": 2,
                  "dateEnd": "2018-09-30",
                  "idPerson": 2017104293,
                  "quantity": 1,
                  "dateStart": "2018-09-01",
                  "unitPrice": 334.94,
                  "idContract": 201710429300002,
                  "idPurchase": 1712619290932,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-06-05",
                  "idItem": 2,
                  "dateEnd": "2019-06-30",
                  "idPerson": 2018101432,
                  "quantity": 1,
                  "dateStart": "2019-06-01",
                  "unitPrice": 387.4,
                  "idContract": 201810143200002,
                  "idPurchase": 1712619391789,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-12-31",
                  "idPerson": 2016203171,
                  "quantity": 1,
                  "dateStart": "2018-12-01",
                  "unitPrice": 90.31,
                  "idContract": 201620317100002,
                  "idPurchase": 1712619313982,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-08-30",
                  "idItem": 2,
                  "dateEnd": "2018-11-30",
                  "idPerson": 2017104293,
                  "quantity": 1,
                  "dateStart": "2018-11-01",
                  "unitPrice": 334.94,
                  "idContract": 201710429300002,
                  "idPurchase": 1712619322777,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-09-19",
                  "idItem": 2,
                  "dateEnd": "2018-12-31",
                  "idPerson": 2017103359,
                  "quantity": 1,
                  "dateStart": "2018-12-01",
                  "unitPrice": 173.04,
                  "idContract": 201710335900002,
                  "idPurchase": 1712619329014,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021104220,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 974.02,
                  "idContract": 202110422000002,
                  "idPurchase": 1712620093234,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020205135,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 332.07,
                  "idContract": 202020513500002,
                  "idPurchase": 1712620101905,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-18",
                  "idItem": 2,
                  "dateEnd": "2019-10-31",
                  "idPerson": 2017109361,
                  "quantity": 1,
                  "dateStart": "2019-10-01",
                  "unitPrice": 194.13,
                  "idContract": 201710936100002,
                  "idPurchase": 1712619451831,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2019-09-18",
                  "idItem": 2,
                  "dateEnd": "2019-09-30",
                  "idPerson": 2017109361,
                  "quantity": 1,
                  "dateStart": "2019-09-01",
                  "unitPrice": 194.13,
                  "idContract": 201710936100002,
                  "idPurchase": 1712619452953,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-10-18",
                  "idItem": 2,
                  "dateEnd": "2022-11-30",
                  "idPerson": 2022113491,
                  "quantity": 1,
                  "dateStart": "2022-11-01",
                  "unitPrice": 442.53,
                  "idContract": 202211349100002,
                  "idPurchase": 1712619727880,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2020-12-16",
                  "idItem": 159,
                  "dateEnd": "2021-01-31",
                  "idPerson": 2020211016,
                  "quantity": 1,
                  "dateStart": "2021-01-01",
                  "unitPrice": 337.5,
                  "idContract": 202021101600159,
                  "idPurchase": 1712619531936,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-02-17",
                  "idItem": 2,
                  "dateEnd": "2021-03-31",
                  "idPerson": 2016104182,
                  "quantity": 1,
                  "dateStart": "2021-03-01",
                  "unitPrice": 684.29,
                  "idContract": 201610418200002,
                  "idPurchase": 1712619537910,
                  "installments": 1,
                  "Erro": "Contrato não encontrado",
                  "Mensagem": "Não foi possível encontrar o contrato",
                  "Valor": 201610418200002,
                  "": ""
                },
                {
                  "date": "2021-02-26",
                  "idItem": 2,
                  "dateEnd": "2021-04-30",
                  "idPerson": 2020211089,
                  "quantity": 1,
                  "dateStart": "2021-04-01",
                  "unitPrice": 550.2,
                  "idContract": 202021108900002,
                  "idPurchase": 1712619544498,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-02-17",
                  "idItem": 2,
                  "dateEnd": "2021-03-31",
                  "idPerson": 2016202259,
                  "quantity": 1,
                  "dateStart": "2021-03-01",
                  "unitPrice": 49.96,
                  "idContract": 201620225900002,
                  "idPurchase": 1712619537693,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2021-06-29",
                  "idItem": 160,
                  "dateEnd": "2021-07-31",
                  "idPerson": 2016204021,
                  "quantity": 1,
                  "dateStart": "2021-07-01",
                  "unitPrice": 1100,
                  "idContract": 201620402100160,
                  "idPurchase": 1712619562281,
                  "installments": 1,
                  "Erro": "Contrato não encontrado",
                  "Mensagem": "Não foi possível encontrar o contrato",
                  "Valor": 201620402100160,
                  "": ""
                },
                {
                  "date": "2021-08-24",
                  "idItem": 2,
                  "dateEnd": "2021-09-30",
                  "idPerson": 2020205192,
                  "quantity": 1,
                  "dateStart": "2021-09-01",
                  "unitPrice": 868.53,
                  "idContract": 202020519200002,
                  "idPurchase": 1712619574284,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2021110195,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 1787.86,
                  "idContract": 202111019500196,
                  "idPurchase": 1712619752414,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-12-19",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2019211234,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 627.67,
                  "idContract": 201921123400196,
                  "idPurchase": 1712619754760,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-02",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2017103627,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 63.28,
                  "idContract": 201710362700196,
                  "idPurchase": 1712619760077,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-17",
                  "idItem": 2,
                  "dateEnd": "2022-05-31",
                  "idPerson": 2017109121,
                  "quantity": 1,
                  "dateStart": "2022-05-01",
                  "unitPrice": 775.26,
                  "idContract": 201710912100002,
                  "idPurchase": 1712619628296,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-03-22",
                  "idItem": 2,
                  "dateEnd": "2022-06-30",
                  "idPerson": 2017109121,
                  "quantity": 1,
                  "dateStart": "2022-06-01",
                  "unitPrice": 775.26,
                  "idContract": 201710912100002,
                  "idPurchase": 1712619635517,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-09",
                  "idItem": 196,
                  "dateEnd": "2023-01-31",
                  "idPerson": 2022103405,
                  "quantity": 1,
                  "dateStart": "2023-01-01",
                  "unitPrice": 811.62,
                  "idContract": 202210340500196,
                  "idPurchase": 1712619778814,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2022-08-11",
                  "idItem": 2,
                  "dateEnd": "2022-11-30",
                  "idPerson": 2022209122,
                  "quantity": 1,
                  "dateStart": "2022-11-01",
                  "unitPrice": 673.38,
                  "idContract": 202220912200002,
                  "idPurchase": 1712619685431,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-23",
                  "idItem": 2,
                  "dateEnd": "2023-06-30",
                  "idPerson": 2022209177,
                  "quantity": 1,
                  "dateStart": "2023-06-01",
                  "unitPrice": 350.77,
                  "idContract": 202220917700002,
                  "idPurchase": 1712619849047,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-23",
                  "idItem": 2,
                  "dateEnd": "2023-06-30",
                  "idPerson": 2018104323,
                  "quantity": 1,
                  "dateStart": "2023-06-01",
                  "unitPrice": 535,
                  "idContract": 201810432300002,
                  "idPurchase": 1712619846294,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-01-25",
                  "idItem": 2,
                  "dateEnd": "2023-02-28",
                  "idPerson": 2018107386,
                  "quantity": 1,
                  "dateStart": "2023-02-01",
                  "unitPrice": 795.98,
                  "idContract": 201810738600002,
                  "idPurchase": 1712619792494,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-03-01",
                  "idItem": 2,
                  "dateEnd": "2023-04-30",
                  "idPerson": 2020205191,
                  "quantity": 1,
                  "dateStart": "2023-04-01",
                  "unitPrice": 937.21,
                  "idContract": 202020519100002,
                  "idPurchase": 1712619817165,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-07-31",
                  "idItem": 2,
                  "dateEnd": "2023-08-31",
                  "idPerson": 2020110068,
                  "quantity": 1,
                  "dateStart": "2023-08-01",
                  "unitPrice": 1813.36,
                  "idContract": 202011006800002,
                  "idPurchase": 1712619906810,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2021203088,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 834.27,
                  "idContract": 202120308800002,
                  "idPurchase": 1712619986171,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022204173,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 417.67,
                  "idContract": 202220417300002,
                  "idPurchase": 1712619993071,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023104374,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 845.19,
                  "idContract": 202310437400002,
                  "idPurchase": 1712619994281,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022104477,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 778.95,
                  "idContract": 202210447700002,
                  "idPurchase": 1712620004871,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2014104284,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 952.95,
                  "idContract": 202020508500002,
                  "idPurchase": 1712620012483,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020107299,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 858.03,
                  "idContract": 202010729900002,
                  "idPurchase": 1712620016888,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2023105260,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 886.17,
                  "idContract": 202310526000002,
                  "idPurchase": 1712620013790,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2020109390,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 740.73,
                  "idContract": 202010939000002,
                  "idPurchase": 1712620022514,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2022211145,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 512.13,
                  "idContract": 202221114500002,
                  "idPurchase": 1712620052619,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023104374,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 845.19,
                  "idContract": 202310437400002,
                  "idPurchase": 1712620083063,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020204062,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 427.58,
                  "idContract": 202020406200002,
                  "idPurchase": 1712620092534,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019105395,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 980.66,
                  "idContract": 201910539500002,
                  "idPurchase": 1712620100065,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2021107221,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 974.02,
                  "idContract": 202110722100002,
                  "idPurchase": 1712620104284,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2023110351,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1620.89,
                  "idContract": 202311035100002,
                  "idPurchase": 1712620131922,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022110228,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1866,
                  "idContract": 202211022800002,
                  "idPurchase": 1712620133970,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019210128,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1833.96,
                  "idContract": 201921012800002,
                  "idPurchase": 1712620136078,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2020110423,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1864.97,
                  "idContract": 202011042300002,
                  "idPurchase": 1712620137254,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2022110020,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 1767.24,
                  "idContract": 202211002000002,
                  "idPurchase": 1712620137689,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-09-19",
                  "idItem": 2,
                  "dateEnd": "2018-11-30",
                  "idPerson": 2017103359,
                  "quantity": 1,
                  "dateStart": "2018-11-01",
                  "unitPrice": 173.04,
                  "idContract": 201710335900002,
                  "idPurchase": 1712619329254,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2018-12-13",
                  "idItem": 91,
                  "dateEnd": "2019-01-31",
                  "idPerson": 2017104490,
                  "quantity": 1,
                  "dateStart": "2019-01-01",
                  "unitPrice": 155.67,
                  "idContract": 201710449000091,
                  "idPurchase": 1712619349112,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-15",
                  "idItem": 2,
                  "dateEnd": "2023-11-30",
                  "idPerson": 2019210064,
                  "quantity": 1,
                  "dateStart": "2023-11-01",
                  "unitPrice": 1773.17,
                  "idContract": 201921006400002,
                  "idPurchase": 1712620049311,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                },
                {
                  "date": "2023-09-18",
                  "idItem": 2,
                  "dateEnd": "2023-12-31",
                  "idPerson": 2019103204,
                  "quantity": 1,
                  "dateStart": "2023-12-01",
                  "unitPrice": 486,
                  "idContract": 201910320400002,
                  "idPurchase": 1712620073454,
                  "installments": 1,
                  "Erro": "Faturas não encontradas",
                  "Mensagem": "Não existe faturas validadas no sistema",
                  "Valor": "",
                  "": ""
                }
              ];
            let count = 1;
            let textConsole = '';
            if(true){
                for (let compra of compras) {
                    console.log(`Processando ${count} de ${compras.length} Itens`);
                    
                    let id_invoice_aux = `${compra.idPurchase}-${count}`;
                    let [ano, mes, dia] = compra.dateEnd.split('-');
                    let month_cycle = mes;
                    let year_cycle = ano;
                    let due_date = `10/${mes}/${ano}`;

                    let codigoFatura = Date.now();
                    await new Promise(resolve => setTimeout(resolve, 10));
                    await invoiceService.Registra(compra.idPurchase, codigoFatura, id_invoice_aux, month_cycle, year_cycle, due_date, compra.unitPrice, false, true);
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO FATURAS')
        }
        if(process.env.CSVFATURASCONTRATOSMANUAL == 1){
            console.log('INICIO GERANDO CSV FATURAS');
            const data = await invoiceService.BuscaTodosManual();
            const layoutService = new LayoutService('Faturas_V2');
            await layoutService.CreateFile(data);
            console.log('FIM GERANDO CSV FATURAS');
        }
    }

    async ProcessarFaturasCorrecao(){
        const purchaseService = new PurchaseService();
        const invoiceService = new InvoiceService();
        const personService = new PersonService();
        if(process.env.FATURASCONTRATOSCORRECAO == 1){ /// .env
            console.log('INICIO PROCESSANDO FATURAS');
            let count = 1;
            let textConsole = '';
            if(true){
                let invoices = await invoiceService.BuscaTodosAutomatico();

                for (let invoice of invoices) {
                    let [dia, mes, ano] = invoice.due_date.split('/');
                    dia = parseInt(dia);
                    dia++;
                    
                    let due_date = `${dia <=9 ? '0'+dia: dia}/${mes}/${ano}`;
                    console.log(`Processando ${count} de ${invoices.length} Itens`);
                    await connection.query(`UPDATE "tb_invoices" SET "due_date" = '${due_date}' where "id_invoice" = '${invoice.id_invoice}'`)
                    // await invoiceService.AtualizaData(invoice.id_invoice, due_date);
                    count++;
                }
            }
            console.log(textConsole)
            console.log('FIM PROCESSANDO FATURAS')
        }
        if(process.env.CSVFATURASCONTRATOSCORRECAO == 1){
            console.log('INICIO GERANDO CSV FATURAS');
            const data = await invoiceService.BuscaTodosAutomatico();
            const layoutService = new LayoutService('Faturas_V3');
            await layoutService.CreateFile(data);
            console.log('FIM GERANDO CSV FATURAS');
        }
    }


    async ProcessarFaturas_Descontos(){
      const purchaseService = new PurchaseService();
      const invoiceService = new InvoiceService();
      const personService = new PersonService();
      const invoiceDiscountService = new InvoiceDiscountService();
      if(process.env.FATURASDESCONTOS == 1){ /// .env
          console.log('INICIO PROCESSANDO FATURAS_DESCONTOS');
          const puchaseModel = await connectionSQLServer.query(`
          
SELECT
	"ContasReceber"."ContaReceberID"
	, "ContasReceber"."AlunoID"
	, "TURMAS"."idEnrollment"
	, "ContasReceber"."ValorOriginal"
	, "ContasReceber"."DiaVencimento"
	, (CASE WHEN "ContasReceber"."Complemento" = NULL THEN '' ELSE "ContasReceber"."Complemento" END)AS "Complemento"
	, "Alunos"."Nome"
	, "Alunos"."CPF"
  , CAST("ContasReceber"."ContaReceberID" AS VARCHAR) || CAST("ContasReceber"."AlunoID" AS VARCHAR) || CAST("TURMAS"."idEnrollment" AS VARCHAR) || CAST("ContasReceberParcelas"."PlanoContaID" AS VARCHAR) AS "PURCHASE_ID"
	, "ContasReceberParcelas"."ID"
	, "ContasReceberParcelas"."NumeroParcela"
	, "ContasReceberParcelas"."PlanoContaID"
	, "ContasReceberParcelas"."Valor"
	, "ContasReceberParcelas"."ValorPago"
	, "ContasReceberParcelas"."DataVencimento"
	, "ContasReceberParcelas"."DataPagamento"
	, "ContasReceberParcelas"."ValorDesconto"
	, "ContasReceberParcelas"."ValorJuro"
	, (CASE WHEN "ContasReceberParcelas"."ValorJuro" > 0 THEN
	TRUNC(CAST(((100 * "ContasReceberParcelas"."ValorJuro")/"ContasReceberParcelas"."Valor") AS NUMERIC),2)
	ELSE 0 END) AS "PercentualMulta"
FROM "ContasReceber"
INNER JOIN "Alunos" ON  "Alunos"."AlunoID" =  "ContasReceber"."AlunoID"
INNER JOIN (
	SELECT
	   "TurmaAlunos"."AlunoID"
		,"TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
	FROM "Turmas" 
	INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
	INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID"
	INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
	INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
	INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
	INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
	INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
	INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
	INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
	where "Turmas"."Situacao" = '-2'
      
) "TURMAS" ON "TURMAS"."AlunoID" =  "ContasReceber"."AlunoID"
INNER JOIN "ContasReceberParcelas" ON "ContasReceberParcelas"."ContaReceberID" = "ContasReceber"."ContaReceberID"
WHERE "ContasReceberParcelas"."DataPagamento" IS NOT NULL AND "ContasReceberParcelas"."ValorDesconto" > 0

          `);
          const compras = puchaseModel[0];
          let count = 1;
          let textConsole = '';
          if(true){
            
              for (let compra of compras) {
                  console.log(`Processando ${count} de ${compras.length} Faturas_DESCONTOS`);
                  const {ID, ContaReceberID, AlunoID, idEnrollment, ValorOriginal, ValorDesconto, Valor, DiaVencimento, PlanoContaID, PURCHASE_ID, NumeroParcela, DataVencimento } = compra;

                  let id_purchase = PURCHASE_ID || '';

                  let id_invoice_aux = ID;

                  let id_invoice = ID;
                  let id_discount = ID;

                  let amount = ValorDesconto;
                  
                  await invoiceDiscountService.Registra(id_discount, id_invoice, '73', 'invoice', 'purchase', amount, '2');
                  count++;
              }
          }
          console.log(textConsole)
          console.log('FIM PROCESSANDO FATURAS_DESCONTOS')
      }
      if(process.env.CSVFATURASDESCONTOS == 1){
          console.log('INICIO GERANDO CSV FATURAS_DESCONTOS');
          let data = await invoiceDiscountService.BuscaTodos('2');
          //let arr = ['24276','24423','24431','24430','24441','24453','24466','24472','24479','24486','24496','24494','24502','24505','24511','24514','24523','24518','24527','24536','24539','24540','24544','24551','24554','24563','24565','24571','24631','24633','24651','24669','24673','24675','24678','24684','24699','24704','24710','24714','24719','24722','24728','24734','24753','24756','24761','24764','24768','24772','24777','24787','24792','24802','24799','24807','24812','24816','24821','24826','24825','24835','24834','24861','24865','24875','24870','24840','24844','24850','24858','24859','24883','24886','24889','24897','24903','24909','24915','24918','24922','24945','24956','24960','24965','24969','24977','24981','24984','25002','25019','25025','25029','25032','25037','25041','25049','25053','25057','25060','25066','25071','25076','25079','25083','25126','25132','25135','25138','25139','25145','25148','25155','25158','6701','4559','25166','25169','25176','25172','25190','25185','25191','25193','25196','25199','25203','25206','22129','22390','22447','22545','22778','22699','22946','23984','24248','24054','24515','24766','24907','25003','25187','25159','1096','1077','2053','2061','2584','2251','2596','2602','3896','3903','3909','4564','6703','4822','4575','6709','6885','6890','7095','7102','8259','8265','8272','8278','9119','9123','9128','11227','10325','11230','10336','11188','11196','11203','11212','13549','18416','17959','22202','22091','22097','22136','22194','22303','22200','22361','22367','22374','22385','22394','22412','22424','22436','22445','22462','22469','22483','22472','22495','22500','22518','22524','22548','22553','22592','22597','22602','22607','22614','22661','22670','22689','22694','22705','22740','22746','22752','22762','22767','24315','24317','24352','24358','24370','22788','22813','22827','22842','22847','22878','22924','22943','22952','22970','22985','23971','23976','24025','24034','24040','24045','24070','24078','24147','24228','24241','24247','24257','24266','24273','24282','24289','24304','24390','24399','24414','24420','24438','24506','24459','24569','24550','24596','24602','24614','24611','24628','24724','24781','24784','24796','24847','24873','24906','24926','24950','25017','25045','11223','25160','25182','25163','5817','1087','1592','22775','22776','22777','22779','22780','22781','22782','22783','22784','22785','22786','22787','22789','22790','22791','22862','22863','22864','22865','22866','22867','22868','22869','22870','22871','22872','22873','22874','22875','22876','22877','22879','22880','22881','22882','22883','22884','22885','22959','22960','22961','22962','22963','22964','22965','22966','22967','22968','22969','22971','22972','22973','22974','22975','22976','22977','22978','22979','22980','22981','22982','22983','22984','22986','22987','22988','23957','23958','23959','23960','23961','23962','23963','23964','23965','23966','23967','23968','23969','23970','7864','22126','1185','24680','2042','2043','2044','2045','2046','2047','2048','2049','2050','2051','2052','2054','2055','2056','2057','2058','2059','2060','2062','2063','2064','2065','2066','2067','2068','2069','2070','2071','3683','10314','10315','10316','10317','10318','10319','10320','10321','10322','10323','10324','10326','10327','10328','10329','10330','10331','10332','10333','10334','10335','10337','10338','10339','18038','22502','22503','22504','22505','22506','22507','22508','22509','22510','22511','22512','22513','22514','22515','22516','22517','22519','22520','22521','22522','22523','22525','23982','23983','23985','23986','23987','23988','23989','23990','23991','23992','23993','23994','23995','23996','23997','23998','23999','24000','24001','24002','24003','24004','24005','23972','23973','23974','22217','23975','23977','22218','22219','22399','22400','22401','22402','22403','22404','22405','22406','22407','22408','22409','22410','22411','22413','22414','22415','22416','22417','22418','22419','22420','22421','22422','22289','25174','25175','25177','25178','25179','25180','25181','25183','25184','22086','22087','22088','22089','22090','22092','22093','7861','7862','7863','22094','22095','22096','23978','24116','24900','22594','22290','22475','22476','22477','22478','22479','22480','22481','22482','22484','22485','22486','22487','22488','22489','22490','22491','22492','22493','22494','22496','22497','22498','22499','22474','22448','24218','24219','24220','24221','24222','24223','24224','24225','24226','24227','24229','24230','24231','24232','24233','24234','24235','24236','24237','24238','24239','24240','22570','22571','22572','22573','22574','22575','22576','22577','22578','22579','22580','22581','22582','22583','22584','22585','22586','22587','22588','22589','22590','22591','22593','22649','22650','22651','22652','22653','22654','22655','22656','22657','22658','22659','22660','22662','22663','22664','22665','22666','22667','22668','22669','22671','22672','22907','22768','22769','22770','22771','22772','22773','22774','23979','23980','24243','24130','24131','24132','24133','24134','24135','24136','24137','24138','24139','24140','24141','24142','24143','24144','24145','24146','24148','24149','24150','24151','24152','24153','7083','24774','22300','18052','11224','11225','11226','11228','11229','11231','11232','11233','11234','11235','11236','11237','11238','11239','11240','11241','11242','11243','24055','24056','24057','24058','24059','24060','24061','24062','24063','24064','24065','24066','24067','24068','24069','24071','24072','24073','24074','24075','24076','24077','24860','24862','24863','24864','24866','24867','24868','24869','24871','24872','11183','11184','11185','11186','11187','11189','11190','11191','11192','11193','11194','24293','11195','11197','11198','11199','11200','11201','11202','18807','11204','11205','11206','11207','11208','11209','11210','11211','11213','24705','24706','24707','24708','24709','24711','24712','24713','24715','24716','24717','24718','24720','24721','24723','24725','24726','24727','22501','17961','24006','22033','22302','24244','24245','24246','24249','24250','24251','24252','24253','24254','24255','24256','24258','24259','24260','24261','24262','24263','24264','24265','24294','24295','24296','24297','24298','24299','24300','24301','24302','24303','24305','24306','24307','24308','24309','24310','24311','24312','24313','24314','24316','24375','24376','24377','24378','24379','24380','24381','24382','24383','24384','24385','24386','24387','24388','24389','24391','24392','24393','24394','24395','24396','24397','24398','24400','24401','24402','24403','24404','24405','24555','24556','24557','24558','24559','24560','24561','24562','24564','24566','24567','24568','24570','24572','24573','24574','24575','24576','24577','24578','24587','24588','24589','24590','24591','24592','24593','24594','24595','24597','24598','24599','24600','24601','24603','24604','24605','24606','24607','24608','24609','24610','24612','24613','24615','24616','24617','24618','24619','24620','24621','24622','24623','24624','24625','24626','24627','24629','24630','24632','24634','24635','24636','24655','24736','24749','24750','24751','24752','24754','24755','24757','24758','24759','24760','24800','24801','24803','24804','24805','24806','24808','24809','24810','24811','24813','24814','24815','24817','24818','24819','24820','24822','24823','24836','24837','24838','24839','24841','24842','24843','24845','24846','24848','24849','24851','24852','24853','24854','24855','24856','24857','24914','24939','24973','24974','24975','24976','24978','24979','24980','24982','24983','24985','24986','24987','24988','24989','24990','24991','24992','24993','24994','24995','24996','24971','25021','25047','9102','9103','9104','9105','9106','9107','9108','9109','9110','9111','9112','9113','9114','10382','24269','24270','24271','24272','24274','24275','24277','24278','24279','24280','24281','24283','24284','24285','24286','24287','24288','24290','24291','24292','22232','22688','22690','22691','22692','22693','22695','22696','22697','22698','22700','22701','22702','22703','22704','22706','22707','22708','22709','22710','22711','24344','24345','24346','24347','24348','24349','24350','24351','24353','24354','24355','24356','24357','24359','24360','24361','24362','24363','24364','24365','24366','24367','24369','24371','24372','24373','24374','25124','25125','25127','25128','25129','25130','25131','25133','25134','25072','25161','3598','6698','6699','6700','6702','6704','6705','6706','6707','6708','22948','22949','22950','22951','22953','22954','22955','22956','22957','1088','1089','1090','1091','1092','1093','1094','1095','1097','1098','1099','1100','1101','1102','1103','1104','1105','2580','2581','2582','2583','2585','2586','2587','2588','2589','2590','2591','2592','2593','2594','2595','2597','2598','2599','2600','2601','24688','3889','3890','3891','3892','3893','3894','3895','3897','3898','3899','3900','3901','3902','3904','3905','3906','3907','3908','3910','3911','3912','22915','4551','4552','4553','4554','4555','4556','4557','4558','4560','4561','4562','4563','4565','4566','4567','4568','4569','4570','4571','4572','4573','4574','4576','4577','4578','4579','4580','12391','6806','6883','6884','6886','6887','6888','6889','6891','6892','24463','24464','24465','24467','24468','24469','24470','24471','24473','24474','24475','24476','24477','24478','24480','24481','24482','24483','24484','24485','24487','22449','24488','24489','24490','24491','24492','6817','8258','8260','8261','8262','8263','8264','8266','8267','8268','8269','8270','8271','8273','8274','8275','8276','8277','8279','8280','8281','8282','8283','25210','19184','22738','22739','22741','22742','22743','22744','22745','22747','22748','22749','22750','22751','22753','22754','22755','22756','22757','22758','22759','22760','22761','22763','22764','22765','22085','22191','22192','22193','22195','22196','22197','22198','22199','22201','22204','22350','22351','22352','22353','22354','22355','22356','22357','22358','22359','22360','22362','22363','22364','22365','22366','22368','22369','22370','22371','22372','22373','24876','24877','24878','24879','24880','24881','24882','24884','24885','24887','24888','24890','24891','24892','24893','24894','24895','24896','24898','24899','22423','22425','22426','22427','22428','22429','22430','22431','22432','22433','22434','22435','22437','22438','22439','22440','22441','22442','22443','22444','22446','22596','22598','22599','22600','22601','22603','22604','22605','22606','22608','22609','22610','22611','22612','22613','22615','22616','22617','22618','22619','24520','24521','24522','24524','24525','24526','24528','24529','24530','24531','24532','24533','24534','24535','24537','24538','24541','24542','24543','22526','22450','22451','22452','22453','22454','22455','22456','22457','22458','22459','22460','22461','22463','22464','22465','22466','22467','22468','22470','22471','22473','22375','22376','22377','22378','22379','22380','22381','22382','22383','22384','22386','22387','22388','22389','22391','22392','22393','22395','22396','22397','22398','22542','22543','22544','22546','22547','22549','22550','22551','22552','22554','24242','22569','24495','24497','24498','24499','24500','24501','24503','24504','24507','24508','24509','24510','24512','24513','24516','24517','24519','22673','22800','22801','22802','22803','22804','22805','22806','22807','22808','22809','22810','22811','22812','22814','22815','22816','22817','22818','22819','22820','22821','22822','22823','22897','22896','22898','22925','22926','22927','22928','22929','22930','22931','22932','22933','22934','22935','22936','22937','22938','22939','22940','22941','22942','22944','22945','22947','22989','23981','24028','24029','24030','24031','24032','24033','24035','24036','24037','24038','24039','24041','24042','24043','24044','24046','24047','24048','24049','24050','24051','24052','24267','24318','24368','24406','24407','24408','24409','24410','24411','24412','24413','24415','24416','24417','24418','24419','24421','24422','24424','24425','24426','24427','24428','24429','24432','24433','24434','24435','24436','24437','24439','24440','24442','24443','24444','24445','24446','24447','24448','24449','24450','24451','24452','24454','24455','24456','24457','24458','24460','24461','24462','24579','24783','24785','24786','24788','24789','24790','24791','24793','24794','24795','24797','24798','24824','24901','24902','24904','24905','24908','24910','24911','24912','24916','24917','24919','24920','24921','24923','24924','24925','24972','24941','24942','24943','24944','24946','24947','24948','24949','24951','24952','24953','24954','24955','24957','24958','24959','24961','24962','24963','24964','24966','24967','24968','24970','24997','24998','24999','25000','25001','25004','25005','25006','25007','25008','25009','25010','25011','25012','25013','25014','25015','25016','25018','25020','25023','25024','25026','25027','25028','25030','25031','25033','25034','25035','25036','25038','25039','25040','25042','25043','25044','25046','7317','22766','22568','22824','22825','22826','22828','22829','22830','22831','22832','22833','22834','22835','22836','22837','22838','22839','22840','22841','22843','22844','22845','22846','22848','22849','22850','22851','24913','25048','25050','25051','25052','25054','25055','25056','25058','25059','25061','25062','25063','25064','25065','25067','25068','25069','25070','25073','25074','25075','25077','25078','25080','25081','25082','25084','25137','25140','25141','25142','25143','25144','25146','25147','25149','25150','25151','25152','25153','25154','25156','25157','25162','25164','25165','25167','25168','25170','25171','25173','24549','24552','24553','22130','5627','22131','22132','22133','22134','22916','22135','22137','22138','24668','24670','24671','24672','24053','22280','24674','24676','24677','24679','24493','25186','25188','25189','25192','25194','25195','25197','25198','25200','25201','25202','25204','25205','25207','25208','25209','24782','1666','13743','9116','9117','9118','9120','9121','9122','7101','9124','9125','7103','9126','9127','24762','24763','7104','24765','7105','7106','7107','7108','24767','24769','24770','24771','24773','7109','24696','13548','7085','7086','7087','24545','7088','7089','7090','7091','7092','7093','7094','7096','24546','7097','24547','24548','7098','13670','13671','13672','7099','13673','13674','13675','3686','13744','13745','13746','7100','13747','13748','13749','7084','24014','24015','24016','24017','24018','24019','24020','22854','22855','22856','22857','22858','22859','22860','24007','24008','24009','24010','24011','24012','24013','24827','24828','24829','24830','24831','24832','24833','22908','22909','22910','22911','22912','22913','22914','9649','9650','9651','9652','9653','9654','22127','22128','22917','22918','22919','22920','22921','22922','22923','24689','24690','24691','24692','24693','24694','24695','24021','24022','24023','24024','24026','24027','24268','18808','18809','18810','18811','18812','18813','18814','24648','24649','24650','24652','24653','24654','24697','24698','24700','24701','24702','24703','24729','24730','24731','24732','24733','24735','24775','24776','24778','24779','24780','24681','24682','24683','24685','24686','24687']
          //data = data.filter(c => cnumero_carga == '2');
          const layoutService = new LayoutService('Faturas-Descontos_MatriculasEncerradas');
          await layoutService.CreateFile(data, true);
          console.log('FIM GERANDO CSV FATURAS_DESCONTOS');
      }
    }


    async ProcessarFaturas_Multas(){
      const purchaseService = new PurchaseService();
      const invoiceService = new InvoiceService();
      const personService = new PersonService();
      const invoicePenaltyService = new InvoicePenaltyService();
      if(process.env.FATURASMULTAS == 1){ /// .env
          console.log('INICIO PROCESSANDO FATURAS_MULTAS');
          const puchaseModel = await connectionSQLServer.query(`
          
SELECT
	"ContasReceber"."ContaReceberID"
	, "ContasReceber"."AlunoID"
	, "TURMAS"."idEnrollment"
	, "ContasReceber"."ValorOriginal"
	, "ContasReceber"."DiaVencimento"
	, (CASE WHEN "ContasReceber"."Complemento" = NULL THEN '' ELSE "ContasReceber"."Complemento" END)AS "Complemento"
	, "Alunos"."Nome"
	, "Alunos"."CPF"
  , CAST("ContasReceber"."ContaReceberID" AS VARCHAR) || CAST("ContasReceber"."AlunoID" AS VARCHAR) || CAST("TURMAS"."idEnrollment" AS VARCHAR) || CAST("ContasReceberParcelas"."PlanoContaID" AS VARCHAR) AS "PURCHASE_ID"
	, "ContasReceberParcelas"."ID"
	, "ContasReceberParcelas"."NumeroParcela"
	, "ContasReceberParcelas"."PlanoContaID"
	, "ContasReceberParcelas"."Valor"
	, "ContasReceberParcelas"."ValorPago"
	, "ContasReceberParcelas"."DataVencimento"
	, "ContasReceberParcelas"."DataPagamento"
	, "ContasReceberParcelas"."ValorDesconto"
	, "ContasReceberParcelas"."ValorJuro"
	, (CASE WHEN "ContasReceberParcelas"."ValorJuro" > 0 THEN
	TRUNC(CAST(((100 * "ContasReceberParcelas"."ValorJuro")/"ContasReceberParcelas"."Valor") AS NUMERIC),2)
	ELSE 0 END) AS "PercentualMulta"
FROM "ContasReceber"
INNER JOIN "Alunos" ON  "Alunos"."AlunoID" =  "ContasReceber"."AlunoID"
INNER JOIN (
	SELECT
	   "TurmaAlunos"."AlunoID"
		,"TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
	FROM "Turmas" 
	INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
	INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID"
	INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
	INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
	INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
	INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
	INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
	INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
	INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
	where "Turmas"."Situacao" = '-2'
    
) "TURMAS" ON "TURMAS"."AlunoID" =  "ContasReceber"."AlunoID"
INNER JOIN "ContasReceberParcelas" ON "ContasReceberParcelas"."ContaReceberID" = "ContasReceber"."ContaReceberID"
WHERE "ContasReceberParcelas"."DataPagamento" IS NOT NULL AND "ContasReceberParcelas"."ValorJuro" > 0

          `);
          const compras = puchaseModel[0];
          let count = 1;
          let textConsole = '';
          if(true){
            
              for (let compra of compras) {
                  console.log(`Processando ${count} de ${compras.length} FATURAS_MULTAS`);
                  const {ID, ContaReceberID, AlunoID, idEnrollment, ValorOriginal, ValorDesconto, ValorJuro, PercentualMulta, Valor, DiaVencimento, PlanoContaID, PURCHASE_ID, NumeroParcela, DataVencimento } = compra;

                  let id_purchase = PURCHASE_ID || '';

                  let percentage = PercentualMulta;

                  let id_invoice = ID;
                  let id_penalty = ID;

                  let amount = ValorJuro;
                  
                  await invoicePenaltyService.Registra(id_penalty, id_invoice, amount, percentage, amount, '2');
                  count++;
              }
          }
          console.log(textConsole)
          console.log('FIM PROCESSANDO FATURAS_MULTAS')
      }
      if(process.env.CSVFATURASMULTAS == 1){
          console.log('INICIO GERANDO CSV FATURAS_MULTAS');
          let data = await invoicePenaltyService.BuscaTodos('2');
          //let arr = ['24276','24423','24431','24430','24441','24453','24466','24472','24479','24486','24496','24494','24502','24505','24511','24514','24523','24518','24527','24536','24539','24540','24544','24551','24554','24563','24565','24571','24631','24633','24651','24669','24673','24675','24678','24684','24699','24704','24710','24714','24719','24722','24728','24734','24753','24756','24761','24764','24768','24772','24777','24787','24792','24802','24799','24807','24812','24816','24821','24826','24825','24835','24834','24861','24865','24875','24870','24840','24844','24850','24858','24859','24883','24886','24889','24897','24903','24909','24915','24918','24922','24945','24956','24960','24965','24969','24977','24981','24984','25002','25019','25025','25029','25032','25037','25041','25049','25053','25057','25060','25066','25071','25076','25079','25083','25126','25132','25135','25138','25139','25145','25148','25155','25158','6701','4559','25166','25169','25176','25172','25190','25185','25191','25193','25196','25199','25203','25206','22129','22390','22447','22545','22778','22699','22946','23984','24248','24054','24515','24766','24907','25003','25187','25159','1096','1077','2053','2061','2584','2251','2596','2602','3896','3903','3909','4564','6703','4822','4575','6709','6885','6890','7095','7102','8259','8265','8272','8278','9119','9123','9128','11227','10325','11230','10336','11188','11196','11203','11212','13549','18416','17959','22202','22091','22097','22136','22194','22303','22200','22361','22367','22374','22385','22394','22412','22424','22436','22445','22462','22469','22483','22472','22495','22500','22518','22524','22548','22553','22592','22597','22602','22607','22614','22661','22670','22689','22694','22705','22740','22746','22752','22762','22767','24315','24317','24352','24358','24370','22788','22813','22827','22842','22847','22878','22924','22943','22952','22970','22985','23971','23976','24025','24034','24040','24045','24070','24078','24147','24228','24241','24247','24257','24266','24273','24282','24289','24304','24390','24399','24414','24420','24438','24506','24459','24569','24550','24596','24602','24614','24611','24628','24724','24781','24784','24796','24847','24873','24906','24926','24950','25017','25045','11223','25160','25182','25163','5817','1087','1592','22775','22776','22777','22779','22780','22781','22782','22783','22784','22785','22786','22787','22789','22790','22791','22862','22863','22864','22865','22866','22867','22868','22869','22870','22871','22872','22873','22874','22875','22876','22877','22879','22880','22881','22882','22883','22884','22885','22959','22960','22961','22962','22963','22964','22965','22966','22967','22968','22969','22971','22972','22973','22974','22975','22976','22977','22978','22979','22980','22981','22982','22983','22984','22986','22987','22988','23957','23958','23959','23960','23961','23962','23963','23964','23965','23966','23967','23968','23969','23970','7864','22126','1185','24680','2042','2043','2044','2045','2046','2047','2048','2049','2050','2051','2052','2054','2055','2056','2057','2058','2059','2060','2062','2063','2064','2065','2066','2067','2068','2069','2070','2071','3683','10314','10315','10316','10317','10318','10319','10320','10321','10322','10323','10324','10326','10327','10328','10329','10330','10331','10332','10333','10334','10335','10337','10338','10339','18038','22502','22503','22504','22505','22506','22507','22508','22509','22510','22511','22512','22513','22514','22515','22516','22517','22519','22520','22521','22522','22523','22525','23982','23983','23985','23986','23987','23988','23989','23990','23991','23992','23993','23994','23995','23996','23997','23998','23999','24000','24001','24002','24003','24004','24005','23972','23973','23974','22217','23975','23977','22218','22219','22399','22400','22401','22402','22403','22404','22405','22406','22407','22408','22409','22410','22411','22413','22414','22415','22416','22417','22418','22419','22420','22421','22422','22289','25174','25175','25177','25178','25179','25180','25181','25183','25184','22086','22087','22088','22089','22090','22092','22093','7861','7862','7863','22094','22095','22096','23978','24116','24900','22594','22290','22475','22476','22477','22478','22479','22480','22481','22482','22484','22485','22486','22487','22488','22489','22490','22491','22492','22493','22494','22496','22497','22498','22499','22474','22448','24218','24219','24220','24221','24222','24223','24224','24225','24226','24227','24229','24230','24231','24232','24233','24234','24235','24236','24237','24238','24239','24240','22570','22571','22572','22573','22574','22575','22576','22577','22578','22579','22580','22581','22582','22583','22584','22585','22586','22587','22588','22589','22590','22591','22593','22649','22650','22651','22652','22653','22654','22655','22656','22657','22658','22659','22660','22662','22663','22664','22665','22666','22667','22668','22669','22671','22672','22907','22768','22769','22770','22771','22772','22773','22774','23979','23980','24243','24130','24131','24132','24133','24134','24135','24136','24137','24138','24139','24140','24141','24142','24143','24144','24145','24146','24148','24149','24150','24151','24152','24153','7083','24774','22300','18052','11224','11225','11226','11228','11229','11231','11232','11233','11234','11235','11236','11237','11238','11239','11240','11241','11242','11243','24055','24056','24057','24058','24059','24060','24061','24062','24063','24064','24065','24066','24067','24068','24069','24071','24072','24073','24074','24075','24076','24077','24860','24862','24863','24864','24866','24867','24868','24869','24871','24872','11183','11184','11185','11186','11187','11189','11190','11191','11192','11193','11194','24293','11195','11197','11198','11199','11200','11201','11202','18807','11204','11205','11206','11207','11208','11209','11210','11211','11213','24705','24706','24707','24708','24709','24711','24712','24713','24715','24716','24717','24718','24720','24721','24723','24725','24726','24727','22501','17961','24006','22033','22302','24244','24245','24246','24249','24250','24251','24252','24253','24254','24255','24256','24258','24259','24260','24261','24262','24263','24264','24265','24294','24295','24296','24297','24298','24299','24300','24301','24302','24303','24305','24306','24307','24308','24309','24310','24311','24312','24313','24314','24316','24375','24376','24377','24378','24379','24380','24381','24382','24383','24384','24385','24386','24387','24388','24389','24391','24392','24393','24394','24395','24396','24397','24398','24400','24401','24402','24403','24404','24405','24555','24556','24557','24558','24559','24560','24561','24562','24564','24566','24567','24568','24570','24572','24573','24574','24575','24576','24577','24578','24587','24588','24589','24590','24591','24592','24593','24594','24595','24597','24598','24599','24600','24601','24603','24604','24605','24606','24607','24608','24609','24610','24612','24613','24615','24616','24617','24618','24619','24620','24621','24622','24623','24624','24625','24626','24627','24629','24630','24632','24634','24635','24636','24655','24736','24749','24750','24751','24752','24754','24755','24757','24758','24759','24760','24800','24801','24803','24804','24805','24806','24808','24809','24810','24811','24813','24814','24815','24817','24818','24819','24820','24822','24823','24836','24837','24838','24839','24841','24842','24843','24845','24846','24848','24849','24851','24852','24853','24854','24855','24856','24857','24914','24939','24973','24974','24975','24976','24978','24979','24980','24982','24983','24985','24986','24987','24988','24989','24990','24991','24992','24993','24994','24995','24996','24971','25021','25047','9102','9103','9104','9105','9106','9107','9108','9109','9110','9111','9112','9113','9114','10382','24269','24270','24271','24272','24274','24275','24277','24278','24279','24280','24281','24283','24284','24285','24286','24287','24288','24290','24291','24292','22232','22688','22690','22691','22692','22693','22695','22696','22697','22698','22700','22701','22702','22703','22704','22706','22707','22708','22709','22710','22711','24344','24345','24346','24347','24348','24349','24350','24351','24353','24354','24355','24356','24357','24359','24360','24361','24362','24363','24364','24365','24366','24367','24369','24371','24372','24373','24374','25124','25125','25127','25128','25129','25130','25131','25133','25134','25072','25161','3598','6698','6699','6700','6702','6704','6705','6706','6707','6708','22948','22949','22950','22951','22953','22954','22955','22956','22957','1088','1089','1090','1091','1092','1093','1094','1095','1097','1098','1099','1100','1101','1102','1103','1104','1105','2580','2581','2582','2583','2585','2586','2587','2588','2589','2590','2591','2592','2593','2594','2595','2597','2598','2599','2600','2601','24688','3889','3890','3891','3892','3893','3894','3895','3897','3898','3899','3900','3901','3902','3904','3905','3906','3907','3908','3910','3911','3912','22915','4551','4552','4553','4554','4555','4556','4557','4558','4560','4561','4562','4563','4565','4566','4567','4568','4569','4570','4571','4572','4573','4574','4576','4577','4578','4579','4580','12391','6806','6883','6884','6886','6887','6888','6889','6891','6892','24463','24464','24465','24467','24468','24469','24470','24471','24473','24474','24475','24476','24477','24478','24480','24481','24482','24483','24484','24485','24487','22449','24488','24489','24490','24491','24492','6817','8258','8260','8261','8262','8263','8264','8266','8267','8268','8269','8270','8271','8273','8274','8275','8276','8277','8279','8280','8281','8282','8283','25210','19184','22738','22739','22741','22742','22743','22744','22745','22747','22748','22749','22750','22751','22753','22754','22755','22756','22757','22758','22759','22760','22761','22763','22764','22765','22085','22191','22192','22193','22195','22196','22197','22198','22199','22201','22204','22350','22351','22352','22353','22354','22355','22356','22357','22358','22359','22360','22362','22363','22364','22365','22366','22368','22369','22370','22371','22372','22373','24876','24877','24878','24879','24880','24881','24882','24884','24885','24887','24888','24890','24891','24892','24893','24894','24895','24896','24898','24899','22423','22425','22426','22427','22428','22429','22430','22431','22432','22433','22434','22435','22437','22438','22439','22440','22441','22442','22443','22444','22446','22596','22598','22599','22600','22601','22603','22604','22605','22606','22608','22609','22610','22611','22612','22613','22615','22616','22617','22618','22619','24520','24521','24522','24524','24525','24526','24528','24529','24530','24531','24532','24533','24534','24535','24537','24538','24541','24542','24543','22526','22450','22451','22452','22453','22454','22455','22456','22457','22458','22459','22460','22461','22463','22464','22465','22466','22467','22468','22470','22471','22473','22375','22376','22377','22378','22379','22380','22381','22382','22383','22384','22386','22387','22388','22389','22391','22392','22393','22395','22396','22397','22398','22542','22543','22544','22546','22547','22549','22550','22551','22552','22554','24242','22569','24495','24497','24498','24499','24500','24501','24503','24504','24507','24508','24509','24510','24512','24513','24516','24517','24519','22673','22800','22801','22802','22803','22804','22805','22806','22807','22808','22809','22810','22811','22812','22814','22815','22816','22817','22818','22819','22820','22821','22822','22823','22897','22896','22898','22925','22926','22927','22928','22929','22930','22931','22932','22933','22934','22935','22936','22937','22938','22939','22940','22941','22942','22944','22945','22947','22989','23981','24028','24029','24030','24031','24032','24033','24035','24036','24037','24038','24039','24041','24042','24043','24044','24046','24047','24048','24049','24050','24051','24052','24267','24318','24368','24406','24407','24408','24409','24410','24411','24412','24413','24415','24416','24417','24418','24419','24421','24422','24424','24425','24426','24427','24428','24429','24432','24433','24434','24435','24436','24437','24439','24440','24442','24443','24444','24445','24446','24447','24448','24449','24450','24451','24452','24454','24455','24456','24457','24458','24460','24461','24462','24579','24783','24785','24786','24788','24789','24790','24791','24793','24794','24795','24797','24798','24824','24901','24902','24904','24905','24908','24910','24911','24912','24916','24917','24919','24920','24921','24923','24924','24925','24972','24941','24942','24943','24944','24946','24947','24948','24949','24951','24952','24953','24954','24955','24957','24958','24959','24961','24962','24963','24964','24966','24967','24968','24970','24997','24998','24999','25000','25001','25004','25005','25006','25007','25008','25009','25010','25011','25012','25013','25014','25015','25016','25018','25020','25023','25024','25026','25027','25028','25030','25031','25033','25034','25035','25036','25038','25039','25040','25042','25043','25044','25046','7317','22766','22568','22824','22825','22826','22828','22829','22830','22831','22832','22833','22834','22835','22836','22837','22838','22839','22840','22841','22843','22844','22845','22846','22848','22849','22850','22851','24913','25048','25050','25051','25052','25054','25055','25056','25058','25059','25061','25062','25063','25064','25065','25067','25068','25069','25070','25073','25074','25075','25077','25078','25080','25081','25082','25084','25137','25140','25141','25142','25143','25144','25146','25147','25149','25150','25151','25152','25153','25154','25156','25157','25162','25164','25165','25167','25168','25170','25171','25173','24549','24552','24553','22130','5627','22131','22132','22133','22134','22916','22135','22137','22138','24668','24670','24671','24672','24053','22280','24674','24676','24677','24679','24493','25186','25188','25189','25192','25194','25195','25197','25198','25200','25201','25202','25204','25205','25207','25208','25209','24782','1666','13743','9116','9117','9118','9120','9121','9122','7101','9124','9125','7103','9126','9127','24762','24763','7104','24765','7105','7106','7107','7108','24767','24769','24770','24771','24773','7109','24696','13548','7085','7086','7087','24545','7088','7089','7090','7091','7092','7093','7094','7096','24546','7097','24547','24548','7098','13670','13671','13672','7099','13673','13674','13675','3686','13744','13745','13746','7100','13747','13748','13749','7084','24014','24015','24016','24017','24018','24019','24020','22854','22855','22856','22857','22858','22859','22860','24007','24008','24009','24010','24011','24012','24013','24827','24828','24829','24830','24831','24832','24833','22908','22909','22910','22911','22912','22913','22914','9649','9650','9651','9652','9653','9654','22127','22128','22917','22918','22919','22920','22921','22922','22923','24689','24690','24691','24692','24693','24694','24695','24021','24022','24023','24024','24026','24027','24268','18808','18809','18810','18811','18812','18813','18814','24648','24649','24650','24652','24653','24654','24697','24698','24700','24701','24702','24703','24729','24730','24731','24732','24733','24735','24775','24776','24778','24779','24780','24681','24682','24683','24685','24686','24687']
          //data = data.filter(c => c.numero_carga == '2');
          const layoutService = new LayoutService('Faturas-Multas_MatriculasEncerradas');
          await layoutService.CreateFile(data, true);
          console.log('FIM GERANDO CSV FATURAS_MULTAS');
      }
    }

    async ProcessarFaturas_Pagamentos(){
      const purchaseService = new PurchaseService();
      const invoiceService = new InvoiceService();
      const personService = new PersonService();
      const paymentService = new PaymentService();
      if(process.env.FATURASPAGAMENTOS == 1){ /// .env
          console.log('INICIO PROCESSANDO FATURAS_PAGAMENTOS');
          const puchaseModel = await connectionSQLServer.query(`
          
SELECT
	"ContasReceber"."ContaReceberID"
	, "ContasReceber"."AlunoID"
	, "TURMAS"."idEnrollment"
	, "ContasReceber"."ValorOriginal"
	, "ContasReceber"."DiaVencimento"
	, (CASE WHEN "ContasReceber"."Complemento" = NULL THEN '' ELSE "ContasReceber"."Complemento" END)AS "Complemento"
	, "Alunos"."Nome"
	, "Alunos"."CPF"
  , CAST("ContasReceber"."ContaReceberID" AS VARCHAR) || CAST("ContasReceber"."AlunoID" AS VARCHAR) || CAST("TURMAS"."idEnrollment" AS VARCHAR) || CAST("ContasReceberParcelas"."PlanoContaID" AS VARCHAR) AS "PURCHASE_ID"
	, "ContasReceberParcelas"."ID"
	, "ContasReceberParcelas"."NumeroParcela"
	, "ContasReceberParcelas"."PlanoContaID"
	, "ContasReceberParcelas"."Valor"
	, "ContasReceberParcelas"."ValorPago"
	, "ContasReceberParcelas"."DataVencimento"
	, "ContasReceberParcelas"."DataPagamento"
	, "ContasReceberParcelas"."ValorDesconto"
	, "ContasReceberParcelas"."ValorJuro"
	, (CASE WHEN "ContasReceberParcelas"."ValorJuro" > 0 THEN
	TRUNC(CAST(((100 * "ContasReceberParcelas"."ValorJuro")/"ContasReceberParcelas"."Valor") AS NUMERIC),2)
	ELSE 0 END) AS "PercentualMulta"
FROM "ContasReceber"
INNER JOIN "Alunos" ON  "Alunos"."AlunoID" =  "ContasReceber"."AlunoID"
INNER JOIN (
	SELECT
	   "TurmaAlunos"."AlunoID"
		,"TurmaAlunos"."TurmaAlunoID" AS "idEnrollment"
	FROM "Turmas" 
	INNER JOIN "GradeTurmas" ON "GradeTurmas"."TurmaID" = "Turmas"."TurmaID"
	INNER JOIN "GradeCursos" ON "GradeCursos"."GradeID" = "GradeTurmas"."GradeID" AND "GradeCursos"."CursoID" =  "Turmas"."CursoID"
	INNER JOIN "TurmaAlunos" ON "TurmaAlunos"."TurmaID" = "Turmas"."TurmaID"
	INNER JOIN "Alunos" ON "Alunos"."AlunoID" = "TurmaAlunos"."AlunoID"
	INNER JOIN "SituacoesDidaticas" ON "SituacoesDidaticas"."SituacaoDidaticaID" = "TurmaAlunos"."SituacaoDidaticaID"
	INNER JOIN "ContratosTurmas" ON "ContratosTurmas"."ContratoTurmaID" = "TurmaAlunos"."ContratoTurmaID"
	INNER JOIN "Contratos" ON "Contratos"."ContratoID" = "ContratosTurmas"."ContratoID"
	INNER JOIN "Cursos" ON "Cursos"."CursoID" = "Turmas"."CursoID"
	INNER JOIN "Grade" ON "Grade"."GradeID" = "GradeTurmas"."GradeID"
	where "Turmas"."Situacao" = '-2'
    
) "TURMAS" ON "TURMAS"."AlunoID" =  "ContasReceber"."AlunoID"
INNER JOIN "ContasReceberParcelas" ON "ContasReceberParcelas"."ContaReceberID" = "ContasReceber"."ContaReceberID"
WHERE "ContasReceberParcelas"."DataPagamento" IS NOT NULL

          `);
          const compras = puchaseModel[0];
          let count = 1;
          let textConsole = '';
          if(true){
            
              for (let compra of compras) {
                  console.log(`Processando ${count} de ${compras.length} FATURAS_PAGAMENTOS`);
                  const {ID, ContaReceberID, AlunoID, idEnrollment, ValorOriginal, DataPagamento, ValorPago, ValorDesconto, ValorJuro, PercentualMulta, Valor, DiaVencimento, PlanoContaID, PURCHASE_ID, NumeroParcela, DataVencimento } = compra;

                  let id_purchase = PURCHASE_ID || '';

                  let percentage = PercentualMulta;

                  let id_invoice = ID;
                  let id_payment = ID;

                  let amount = ValorPago;
                  let id_person = parseInt(AlunoID);
                  let payment_date = '';
                  let dataPagamento = DataPagamento;
                  dataPagamento = dataPagamento.split(' ')[0];
                  let [mes, dia, ano] = dataPagamento.split('/');
                  mes = parseInt(mes);
                  dia = parseInt(dia);
                  payment_date = `${dia < 10 ? '0'+dia : dia}/${mes < 10 ? '0'+mes : mes}/${ano}`;
                  
                  await paymentService.Registra(id_payment, id_invoice, '', id_person, 'boleto', 'in', 'paid', amount, payment_date, '2');
                  count++;
              }
          }
          console.log(textConsole)
          console.log('FIM PROCESSANDO FATURAS_PAGAMENTOS')
      }
      if(process.env.CSVFATURASPAGAMENTOS == 1){
          console.log('INICIO GERANDO CSV FATURAS_PAGAMENTOS');
          let data = await paymentService.BuscaTodos('2');
          //let arr = ['24276','24423','24431','24430','24441','24453','24466','24472','24479','24486','24496','24494','24502','24505','24511','24514','24523','24518','24527','24536','24539','24540','24544','24551','24554','24563','24565','24571','24631','24633','24651','24669','24673','24675','24678','24684','24699','24704','24710','24714','24719','24722','24728','24734','24753','24756','24761','24764','24768','24772','24777','24787','24792','24802','24799','24807','24812','24816','24821','24826','24825','24835','24834','24861','24865','24875','24870','24840','24844','24850','24858','24859','24883','24886','24889','24897','24903','24909','24915','24918','24922','24945','24956','24960','24965','24969','24977','24981','24984','25002','25019','25025','25029','25032','25037','25041','25049','25053','25057','25060','25066','25071','25076','25079','25083','25126','25132','25135','25138','25139','25145','25148','25155','25158','6701','4559','25166','25169','25176','25172','25190','25185','25191','25193','25196','25199','25203','25206','22129','22390','22447','22545','22778','22699','22946','23984','24248','24054','24515','24766','24907','25003','25187','25159','1096','1077','2053','2061','2584','2251','2596','2602','3896','3903','3909','4564','6703','4822','4575','6709','6885','6890','7095','7102','8259','8265','8272','8278','9119','9123','9128','11227','10325','11230','10336','11188','11196','11203','11212','13549','18416','17959','22202','22091','22097','22136','22194','22303','22200','22361','22367','22374','22385','22394','22412','22424','22436','22445','22462','22469','22483','22472','22495','22500','22518','22524','22548','22553','22592','22597','22602','22607','22614','22661','22670','22689','22694','22705','22740','22746','22752','22762','22767','24315','24317','24352','24358','24370','22788','22813','22827','22842','22847','22878','22924','22943','22952','22970','22985','23971','23976','24025','24034','24040','24045','24070','24078','24147','24228','24241','24247','24257','24266','24273','24282','24289','24304','24390','24399','24414','24420','24438','24506','24459','24569','24550','24596','24602','24614','24611','24628','24724','24781','24784','24796','24847','24873','24906','24926','24950','25017','25045','11223','25160','25182','25163','5817','1087','1592','22775','22776','22777','22779','22780','22781','22782','22783','22784','22785','22786','22787','22789','22790','22791','22862','22863','22864','22865','22866','22867','22868','22869','22870','22871','22872','22873','22874','22875','22876','22877','22879','22880','22881','22882','22883','22884','22885','22959','22960','22961','22962','22963','22964','22965','22966','22967','22968','22969','22971','22972','22973','22974','22975','22976','22977','22978','22979','22980','22981','22982','22983','22984','22986','22987','22988','23957','23958','23959','23960','23961','23962','23963','23964','23965','23966','23967','23968','23969','23970','7864','22126','1185','24680','2042','2043','2044','2045','2046','2047','2048','2049','2050','2051','2052','2054','2055','2056','2057','2058','2059','2060','2062','2063','2064','2065','2066','2067','2068','2069','2070','2071','3683','10314','10315','10316','10317','10318','10319','10320','10321','10322','10323','10324','10326','10327','10328','10329','10330','10331','10332','10333','10334','10335','10337','10338','10339','18038','22502','22503','22504','22505','22506','22507','22508','22509','22510','22511','22512','22513','22514','22515','22516','22517','22519','22520','22521','22522','22523','22525','23982','23983','23985','23986','23987','23988','23989','23990','23991','23992','23993','23994','23995','23996','23997','23998','23999','24000','24001','24002','24003','24004','24005','23972','23973','23974','22217','23975','23977','22218','22219','22399','22400','22401','22402','22403','22404','22405','22406','22407','22408','22409','22410','22411','22413','22414','22415','22416','22417','22418','22419','22420','22421','22422','22289','25174','25175','25177','25178','25179','25180','25181','25183','25184','22086','22087','22088','22089','22090','22092','22093','7861','7862','7863','22094','22095','22096','23978','24116','24900','22594','22290','22475','22476','22477','22478','22479','22480','22481','22482','22484','22485','22486','22487','22488','22489','22490','22491','22492','22493','22494','22496','22497','22498','22499','22474','22448','24218','24219','24220','24221','24222','24223','24224','24225','24226','24227','24229','24230','24231','24232','24233','24234','24235','24236','24237','24238','24239','24240','22570','22571','22572','22573','22574','22575','22576','22577','22578','22579','22580','22581','22582','22583','22584','22585','22586','22587','22588','22589','22590','22591','22593','22649','22650','22651','22652','22653','22654','22655','22656','22657','22658','22659','22660','22662','22663','22664','22665','22666','22667','22668','22669','22671','22672','22907','22768','22769','22770','22771','22772','22773','22774','23979','23980','24243','24130','24131','24132','24133','24134','24135','24136','24137','24138','24139','24140','24141','24142','24143','24144','24145','24146','24148','24149','24150','24151','24152','24153','7083','24774','22300','18052','11224','11225','11226','11228','11229','11231','11232','11233','11234','11235','11236','11237','11238','11239','11240','11241','11242','11243','24055','24056','24057','24058','24059','24060','24061','24062','24063','24064','24065','24066','24067','24068','24069','24071','24072','24073','24074','24075','24076','24077','24860','24862','24863','24864','24866','24867','24868','24869','24871','24872','11183','11184','11185','11186','11187','11189','11190','11191','11192','11193','11194','24293','11195','11197','11198','11199','11200','11201','11202','18807','11204','11205','11206','11207','11208','11209','11210','11211','11213','24705','24706','24707','24708','24709','24711','24712','24713','24715','24716','24717','24718','24720','24721','24723','24725','24726','24727','22501','17961','24006','22033','22302','24244','24245','24246','24249','24250','24251','24252','24253','24254','24255','24256','24258','24259','24260','24261','24262','24263','24264','24265','24294','24295','24296','24297','24298','24299','24300','24301','24302','24303','24305','24306','24307','24308','24309','24310','24311','24312','24313','24314','24316','24375','24376','24377','24378','24379','24380','24381','24382','24383','24384','24385','24386','24387','24388','24389','24391','24392','24393','24394','24395','24396','24397','24398','24400','24401','24402','24403','24404','24405','24555','24556','24557','24558','24559','24560','24561','24562','24564','24566','24567','24568','24570','24572','24573','24574','24575','24576','24577','24578','24587','24588','24589','24590','24591','24592','24593','24594','24595','24597','24598','24599','24600','24601','24603','24604','24605','24606','24607','24608','24609','24610','24612','24613','24615','24616','24617','24618','24619','24620','24621','24622','24623','24624','24625','24626','24627','24629','24630','24632','24634','24635','24636','24655','24736','24749','24750','24751','24752','24754','24755','24757','24758','24759','24760','24800','24801','24803','24804','24805','24806','24808','24809','24810','24811','24813','24814','24815','24817','24818','24819','24820','24822','24823','24836','24837','24838','24839','24841','24842','24843','24845','24846','24848','24849','24851','24852','24853','24854','24855','24856','24857','24914','24939','24973','24974','24975','24976','24978','24979','24980','24982','24983','24985','24986','24987','24988','24989','24990','24991','24992','24993','24994','24995','24996','24971','25021','25047','9102','9103','9104','9105','9106','9107','9108','9109','9110','9111','9112','9113','9114','10382','24269','24270','24271','24272','24274','24275','24277','24278','24279','24280','24281','24283','24284','24285','24286','24287','24288','24290','24291','24292','22232','22688','22690','22691','22692','22693','22695','22696','22697','22698','22700','22701','22702','22703','22704','22706','22707','22708','22709','22710','22711','24344','24345','24346','24347','24348','24349','24350','24351','24353','24354','24355','24356','24357','24359','24360','24361','24362','24363','24364','24365','24366','24367','24369','24371','24372','24373','24374','25124','25125','25127','25128','25129','25130','25131','25133','25134','25072','25161','3598','6698','6699','6700','6702','6704','6705','6706','6707','6708','22948','22949','22950','22951','22953','22954','22955','22956','22957','1088','1089','1090','1091','1092','1093','1094','1095','1097','1098','1099','1100','1101','1102','1103','1104','1105','2580','2581','2582','2583','2585','2586','2587','2588','2589','2590','2591','2592','2593','2594','2595','2597','2598','2599','2600','2601','24688','3889','3890','3891','3892','3893','3894','3895','3897','3898','3899','3900','3901','3902','3904','3905','3906','3907','3908','3910','3911','3912','22915','4551','4552','4553','4554','4555','4556','4557','4558','4560','4561','4562','4563','4565','4566','4567','4568','4569','4570','4571','4572','4573','4574','4576','4577','4578','4579','4580','12391','6806','6883','6884','6886','6887','6888','6889','6891','6892','24463','24464','24465','24467','24468','24469','24470','24471','24473','24474','24475','24476','24477','24478','24480','24481','24482','24483','24484','24485','24487','22449','24488','24489','24490','24491','24492','6817','8258','8260','8261','8262','8263','8264','8266','8267','8268','8269','8270','8271','8273','8274','8275','8276','8277','8279','8280','8281','8282','8283','25210','19184','22738','22739','22741','22742','22743','22744','22745','22747','22748','22749','22750','22751','22753','22754','22755','22756','22757','22758','22759','22760','22761','22763','22764','22765','22085','22191','22192','22193','22195','22196','22197','22198','22199','22201','22204','22350','22351','22352','22353','22354','22355','22356','22357','22358','22359','22360','22362','22363','22364','22365','22366','22368','22369','22370','22371','22372','22373','24876','24877','24878','24879','24880','24881','24882','24884','24885','24887','24888','24890','24891','24892','24893','24894','24895','24896','24898','24899','22423','22425','22426','22427','22428','22429','22430','22431','22432','22433','22434','22435','22437','22438','22439','22440','22441','22442','22443','22444','22446','22596','22598','22599','22600','22601','22603','22604','22605','22606','22608','22609','22610','22611','22612','22613','22615','22616','22617','22618','22619','24520','24521','24522','24524','24525','24526','24528','24529','24530','24531','24532','24533','24534','24535','24537','24538','24541','24542','24543','22526','22450','22451','22452','22453','22454','22455','22456','22457','22458','22459','22460','22461','22463','22464','22465','22466','22467','22468','22470','22471','22473','22375','22376','22377','22378','22379','22380','22381','22382','22383','22384','22386','22387','22388','22389','22391','22392','22393','22395','22396','22397','22398','22542','22543','22544','22546','22547','22549','22550','22551','22552','22554','24242','22569','24495','24497','24498','24499','24500','24501','24503','24504','24507','24508','24509','24510','24512','24513','24516','24517','24519','22673','22800','22801','22802','22803','22804','22805','22806','22807','22808','22809','22810','22811','22812','22814','22815','22816','22817','22818','22819','22820','22821','22822','22823','22897','22896','22898','22925','22926','22927','22928','22929','22930','22931','22932','22933','22934','22935','22936','22937','22938','22939','22940','22941','22942','22944','22945','22947','22989','23981','24028','24029','24030','24031','24032','24033','24035','24036','24037','24038','24039','24041','24042','24043','24044','24046','24047','24048','24049','24050','24051','24052','24267','24318','24368','24406','24407','24408','24409','24410','24411','24412','24413','24415','24416','24417','24418','24419','24421','24422','24424','24425','24426','24427','24428','24429','24432','24433','24434','24435','24436','24437','24439','24440','24442','24443','24444','24445','24446','24447','24448','24449','24450','24451','24452','24454','24455','24456','24457','24458','24460','24461','24462','24579','24783','24785','24786','24788','24789','24790','24791','24793','24794','24795','24797','24798','24824','24901','24902','24904','24905','24908','24910','24911','24912','24916','24917','24919','24920','24921','24923','24924','24925','24972','24941','24942','24943','24944','24946','24947','24948','24949','24951','24952','24953','24954','24955','24957','24958','24959','24961','24962','24963','24964','24966','24967','24968','24970','24997','24998','24999','25000','25001','25004','25005','25006','25007','25008','25009','25010','25011','25012','25013','25014','25015','25016','25018','25020','25023','25024','25026','25027','25028','25030','25031','25033','25034','25035','25036','25038','25039','25040','25042','25043','25044','25046','7317','22766','22568','22824','22825','22826','22828','22829','22830','22831','22832','22833','22834','22835','22836','22837','22838','22839','22840','22841','22843','22844','22845','22846','22848','22849','22850','22851','24913','25048','25050','25051','25052','25054','25055','25056','25058','25059','25061','25062','25063','25064','25065','25067','25068','25069','25070','25073','25074','25075','25077','25078','25080','25081','25082','25084','25137','25140','25141','25142','25143','25144','25146','25147','25149','25150','25151','25152','25153','25154','25156','25157','25162','25164','25165','25167','25168','25170','25171','25173','24549','24552','24553','22130','5627','22131','22132','22133','22134','22916','22135','22137','22138','24668','24670','24671','24672','24053','22280','24674','24676','24677','24679','24493','25186','25188','25189','25192','25194','25195','25197','25198','25200','25201','25202','25204','25205','25207','25208','25209','24782','1666','13743','9116','9117','9118','9120','9121','9122','7101','9124','9125','7103','9126','9127','24762','24763','7104','24765','7105','7106','7107','7108','24767','24769','24770','24771','24773','7109','24696','13548','7085','7086','7087','24545','7088','7089','7090','7091','7092','7093','7094','7096','24546','7097','24547','24548','7098','13670','13671','13672','7099','13673','13674','13675','3686','13744','13745','13746','7100','13747','13748','13749','7084','24014','24015','24016','24017','24018','24019','24020','22854','22855','22856','22857','22858','22859','22860','24007','24008','24009','24010','24011','24012','24013','24827','24828','24829','24830','24831','24832','24833','22908','22909','22910','22911','22912','22913','22914','9649','9650','9651','9652','9653','9654','22127','22128','22917','22918','22919','22920','22921','22922','22923','24689','24690','24691','24692','24693','24694','24695','24021','24022','24023','24024','24026','24027','24268','18808','18809','18810','18811','18812','18813','18814','24648','24649','24650','24652','24653','24654','24697','24698','24700','24701','24702','24703','24729','24730','24731','24732','24733','24735','24775','24776','24778','24779','24780','24681','24682','24683','24685','24686','24687']
          //data = data.filter(c =>c.numero_carga == '2');
          const layoutService = new LayoutService('Faturas-Pagamentos_MatriculasEncerradas');
          await layoutService.CreateFile(data, true);
          console.log('FIM GERANDO CSV FATURAS_PAGAMENTOS');
      }
    }

}


module.exports = FinanceiroService;