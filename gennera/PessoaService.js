require('dotenv').config();
const PersonService = require('../src/services/PersonService');
const FiliationService = require('../src/services/FiliationService');
const origem = require('../database/database-migracao');
const { log } = require('../src/services/LogService');
const N = require('./normalize');

const CAMPOS_PESSOA = [
    'id_person', 'id_student', 'profile', 'type',
    'name', 'social_name', 'legal_name', 'email',
    'zipcode', 'street', 'street_number', 'city',
    'state', 'country', 'complement', 'neighborhood',
    'zone', 'birthdate', 'birthplace', 'birth_state',
    'birth_country', 'nationality', 'gender', 'ethnicity',
    'rg', 'rg_issuing_agency', 'rg_issuing_state', 'rg_issue_date',
    'social_id', 'cpf', 'cnpj', 'civil_status',
    'profession', 'religion', 'telephone_area_code', 'telephone_number',
    'mobile_phone_area_code', 'mobile_phone_number', 'commercial_phone_area_code', 'commercial_phone_number',
    'fax_area_code', 'fax_number', 'foreigner_document_issue_date', 'foreigner_document',
    'foreigner_document_expiry_date', 'military_status', 'military_description', 'military_certificate',
    'military_certificate_description', 'voter_document', 'voter_document_issue_date', 'voter_document_city',
    'voter_document_state', 'voter_document_section', 'voter_document_zone', 'civil_certificate_term',
    'civil_certificate_page', 'civil_certificate_book', 'civil_certificate_issue_date', 'civil_certificate_agency_state',
    'civil_certificate_agency', 'civil_certificate_father', 'civil_certificate_mother', 'marriage_certificate_term',
    'marriage_certificate_page', 'marriage_certificate_book', 'marriage_certificate_issue_date', 'marriage_certificate_agency_state',
    'marriage_certificate_agency', 'identity', 'commercial_name', 'passport',
    'academic_title', 'student_code_inep', 'academic_registration', 'conclusion_date',
    'conclusion_educational_institution', 'conclusion_educational_city', 'conclusion_educational_uf', 'elementary_school_conclusion_date',
    'elementary_school_conclusion_educational_institution', 'elementary_school_conclusion_educational_city', 'elementary_school_conclusion_educational_uf', 'higher_education_conclusion_date',
    'higher_education_conclusion_institution', 'higher_education_conclusion_educational_city', 'higher_education_conclusion_educational_uf', 'higher_education_conclusion_course',
    'higher_education_type_of_school', 'primary_school_conclusion_date', 'primary_school_conclusion_institution', 'primary_school_conclusion_educational_city',
    'primary_school_conclusion_educational_uf', 'photo_person', 'functions', 'codigo_professor_INEP',
    'type_of_school', 'elementary_school_type_of_school', 'hiring_regime', 'curriculum_URL'
];

function paraArgumentos(dados) {
    return CAMPOS_PESSOA.map(campo => {
        const valor = dados[campo];
        if (valor === undefined || valor === null) return campo === 'functions' ? null : '';
        return valor;
    });
}

class PessoaService {

    constructor() {
        this.pessoaServico = new PersonService();
        this.filiacaoServico = new FiliationService();
        this.lookups = null;
        this.emailsUsados = new Set();
        this.cpfsUsados = new Set();
    }

    async CarregarLookups() {
        if (this.lookups) return this.lookups;
        log('Carregando tabelas de apoio (CADCID, PAISES, CADPROFI, CADETDCV, CARTORIOS, ENDALNS)');

        const [cidades] = await origem.query('SELECT "CODIGO", "CIDADE", "UF" FROM "CADCID"');
        const [paises] = await origem.query('SELECT "CODIGO", "PAIS" FROM "PAISES"');
        const [profissoes] = await origem.query('SELECT "CODIGO", "PROFISSAO" FROM "CADPROFI"');
        const [estadosCivis] = await origem.query('SELECT "CODIGO", "ESTADOCIVIL" FROM "CADETDCV"');
        const [cartorios] = await origem.query('SELECT "CODIGO", "CARTORIO", "CIDADE" FROM "CARTORIOS"');
        const [enderecos] = await origem.query('SELECT "ALUNO", "ENDERECO", "BAIRRO", "CIDADE", "CEP" FROM "ENDALNS"');

        const mapa = (linhas, chave, montar) => {
            const m = new Map();
            for (const l of linhas) {
                const k = N.txt(l[chave]);
                if (k !== '' && !m.has(k)) m.set(k, montar(l));
            }
            return m;
        };

        this.lookups = {
            cidades: mapa(cidades, 'CODIGO', l => ({ cidade: N.txt(l.CIDADE), uf: N.txt(l.UF) })),
            paises: mapa(paises, 'CODIGO', l => N.txt(l.PAIS)),
            profissoes: mapa(profissoes, 'CODIGO', l => N.txt(l.PROFISSAO)),
            estadosCivis: mapa(estadosCivis, 'CODIGO', l => N.txt(l.ESTADOCIVIL)),
            cartorios: mapa(cartorios, 'CODIGO', l => ({ nome: N.txt(l.CARTORIO), cidade: N.codigo(l.CIDADE) })),
            enderecos: mapa(enderecos, 'ALUNO', l => ({
                endereco: N.txt(l.ENDERECO), bairro: N.txt(l.BAIRRO),
                cidade: N.codigo(l.CIDADE), cep: N.txt(l.CEP)
            }))
        };

        const dupEnderecos = enderecos.length - this.lookups.enderecos.size;
        log(`Apoio carregado: ${this.lookups.cidades.size} cidades, ${this.lookups.paises.size} paises, ` +
            `${this.lookups.profissoes.size} profissoes, ${this.lookups.estadosCivis.size} estados civis, ` +
            `${this.lookups.cartorios.size} cartorios, ${this.lookups.enderecos.size} enderecos` +
            (dupEnderecos > 0 ? ` (${dupEnderecos} aluno(s) com mais de um endereco - usado o primeiro)` : ''));

        return this.lookups;
    }

    Cidade(codigoCidade) {
        const cod = N.codigo(codigoCidade);
        if (!cod) return { cidade: '', uf: '' };
        return this.lookups.cidades.get(cod) || { cidade: '', uf: '' };
    }

    Lookup(mapaNome, codigoBruto) {
        const cod = N.codigo(codigoBruto);
        if (!cod) return '';
        return this.lookups[mapaNome].get(cod) || '';
    }

    async CarregarChavesJaUsadas() {
        const [linhas] = await require('../database/database').query(
            "SELECT email, cpf FROM tb_persons WHERE COALESCE(email,'') <> '' OR COALESCE(cpf,'') <> ''"
        );
        for (const l of linhas) {
            if (l.email) this.emailsUsados.add(l.email);
            if (l.cpf) this.cpfsUsados.add(l.cpf);
        }
        if (linhas.length > 0) log(`Ja existiam ${linhas.length} pessoa(s) com email/cpf no data lake`);
    }

    EmailUnico(valor) {
        const e = N.email(valor);
        if (e === '' || this.emailsUsados.has(e)) return '';
        this.emailsUsados.add(e);
        return e;
    }

    CpfUnico(valor) {
        const c = N.cpf(valor);
        if (c === '' || this.cpfsUsados.has(c)) return '';
        this.cpfsUsados.add(c);
        return c;
    }

    async ProcessarPessoas() {
        if (process.env.PESSOAS != 1) return;

        log('=========== INICIO PESSOAS ===========');
        await this.CarregarLookups();
        await this.CarregarChavesJaUsadas();

        if (process.env.PESSOASRESPONSAVEIS == 1) await this.ProcessarResponsaveis();
        if (process.env.PESSOASALUNOS == 1) await this.ProcessarAlunos();
        if (process.env.PESSOASPROFESSOR == 1) await this.ProcessarProfessores();
        if (process.env.PESSOASFUNCIONARIOS == 1) await this.ProcessarFuncionarios();

        log('=========== FIM PESSOAS ===========');
    }

    async ProcessarResponsaveis() {
        log('--- RESPONSAVEIS (ALUNOSRESP) ---');
        const [linhas] = await origem.query(`
            SELECT "CODIGO", "NOME", "PESSOAFJ", "SEXO", "ESTADOCIVIL", "CIC_CPF",
                   "RG", "RG_UF", "RG_OE", "RG_DE",
                   "FONERES", "FONECOM", "FONECEL",
                   "NASCIMENTO", "CIDADENASCIMENTO", "NACIONALIDADE", "PROFISSAO",
                   "EMAIL", "RELIGIAO",
                   "CEP", "ENDERECO", "BAIRRO", "CIDADE"
              FROM "ALUNOSRESP"
             ORDER BY "CODIGO"
        `);

        let n = 0;
        for (const r of linhas) {
            n++;
            const nome = N.txt(r.NOME);
            if (nome === '') { log(`Responsavel ${r.CODIGO} sem nome - ignorado`); continue; }

            const end = N.endereco(r.ENDERECO);
            const cidade = this.Cidade(r.CIDADE);
            const nasc = this.Cidade(r.CIDADENASCIMENTO);
            const fone = N.telefone(r.FONERES);
            const cel = N.telefone(r.FONECEL);
            const com = N.telefone(r.FONECOM);

            await this.pessoaServico.RegistraPessoa(...paraArgumentos({
                id_person: N.idResponsavel(r.CODIGO),
                id_student: '',
                profile: 5,
                type: N.txt(r.PESSOAFJ).toUpperCase() === 'J' ? 2 : 1,

                name: N.nomePessoa(r.NOME),
                email: this.EmailUnico(r.EMAIL),
                country: 'Brasil',
                birth_country: 'Brasil',

                zipcode: N.cep(r.CEP),
                street: end.street,
                street_number: N.limparNumeroEndereco(end.street_number),
                complement: N.limparComplemento(end.complement),
                neighborhood: N.txt(r.BAIRRO),
                city: cidade.cidade,
                state: cidade.uf,

                birthdate: N.data(r.NASCIMENTO),
                birthplace: nasc.cidade,
                birth_state: nasc.uf,
                nationality: this.Lookup('paises', r.NACIONALIDADE),

                gender: N.sexo(r.SEXO),
                civil_status: N.estadoCivil(this.Lookup('estadosCivis', r.ESTADOCIVIL)),
                profession: this.Lookup('profissoes', r.PROFISSAO),
                religion: N.txt(r.RELIGIAO),

                cpf: this.CpfUnico(r.CIC_CPF),
                rg: N.txt(r.RG).replace(/[.\-/\s]/g, ''),
                rg_issuing_agency: N.txt(r.RG_OE),
                rg_issuing_state: N.txt(r.RG_UF),
                rg_issue_date: N.data(r.RG_DE),

                telephone_area_code: fone.ddd,
                telephone_number: fone.numero,
                mobile_phone_area_code: cel.ddd,
                mobile_phone_number: cel.numero,
                commercial_phone_area_code: com.ddd,
                commercial_phone_number: com.numero
            }));

            if (n % 500 === 0) log(`Responsaveis: ${n}/${linhas.length}`);
        }
        log(`--- RESPONSAVEIS concluido: ${n} de ${linhas.length} ---`);
    }

    async ProcessarAlunos() {
        log('--- ALUNOS ---');
        const [linhas] = await origem.query(`
            SELECT "CODIGO", "NOME", "APELIDO", "SEXO", "ESTADOCIVIL", "COR",
                   "CIC_CPF", "RG", "RG_OE", "RG_DE", "RG_UF",
                   "NASCIMENTO", "CIDADENASCIMENTO", "NACIONALIDADE", "PROFISSAO", "RELIGIAO",
                   "FONE", "FONECOM", "CELULAR", "EMAIL",
                   "CERTNASCIMENTO", "CERTNASCIMENTOFOLHA", "CERTNASCIMENTOLIVRO",
                   "CERTNASCIMENTODE", "CERTNASCIMENTOCODCARTORIO",
                   "CERTRESERVISTA", "CERTRESERVISTA_SERIE", "CERTRESERVISTA_EMISSOR",
                   "TITULOELEITOR", "TITULOELEITOR_ZONA", "TITULOELEITOR_SECAO",
                   "TITULOELEITOR_EMISSAO", "TITULOELEITOR_UF",
                   "NOMEPAI", "NOMEMAE"
              FROM "ALUNOS"
             ORDER BY "CODIGO"
        `);

        let n = 0, semEndereco = 0;
        for (const a of linhas) {
            n++;
            const nome = N.txt(a.NOME);
            if (nome === '') { log(`Aluno ${a.CODIGO} sem nome - ignorado`); continue; }

            const end = this.lookups.enderecos.get(N.txt(a.CODIGO));
            if (!end) semEndereco++;
            const partes = end ? N.endereco(end.endereco) : { street: '', street_number: '', complement: '' };
            const cidade = end ? this.Cidade(end.cidade) : { cidade: '', uf: '' };

            const nasc = this.Cidade(a.CIDADENASCIMENTO);
            const cartorio = this.lookups.cartorios.get(N.codigo(a.CERTNASCIMENTOCODCARTORIO) || '');
            const cartorioUF = cartorio ? this.Cidade(cartorio.cidade).uf : '';

            const fone = N.telefone(a.FONE);
            const cel = N.telefone(a.CELULAR);
            const com = N.telefone(a.FONECOM);

            await this.pessoaServico.RegistraPessoa(...paraArgumentos({
                id_person: N.idAluno(a.CODIGO),
                id_student: N.idAluno(a.CODIGO),
                profile: 2,
                type: 1,

                name: N.nomePessoa(a.NOME),
                social_name: N.txt(a.APELIDO),
                email: this.EmailUnico(a.EMAIL),
                country: 'Brasil',
                birth_country: 'Brasil',
                academic_registration: N.txt(a.CODIGO),

                zipcode: end ? N.cep(end.cep) : '',
                street: partes.street,
                street_number: N.limparNumeroEndereco(partes.street_number),
                complement: N.limparComplemento(partes.complement),
                neighborhood: end ? N.txt(end.bairro) : '',
                city: cidade.cidade,
                state: cidade.uf,

                birthdate: N.data(a.NASCIMENTO),
                birthplace: nasc.cidade,
                birth_state: nasc.uf,
                nationality: this.Lookup('paises', a.NACIONALIDADE),

                gender: N.sexo(a.SEXO),
                ethnicity: N.etnia(a.COR),
                civil_status: N.estadoCivil(this.Lookup('estadosCivis', a.ESTADOCIVIL)),
                profession: this.Lookup('profissoes', a.PROFISSAO),
                religion: N.txt(a.RELIGIAO),

                cpf: this.CpfUnico(a.CIC_CPF),
                rg: N.txt(a.RG).replace(/[.\-/\s]/g, ''),
                rg_issuing_agency: N.txt(a.RG_OE),
                rg_issuing_state: N.txt(a.RG_UF),
                rg_issue_date: N.data(a.RG_DE),

                telephone_area_code: fone.ddd,
                telephone_number: fone.numero,
                mobile_phone_area_code: cel.ddd,
                mobile_phone_number: cel.numero,
                commercial_phone_area_code: com.ddd,
                commercial_phone_number: com.numero,

                military_certificate: N.txt(a.CERTRESERVISTA),
                military_certificate_description: N.txt(a.CERTRESERVISTA_SERIE),
                military_description: N.txt(a.CERTRESERVISTA_EMISSOR),

                voter_document: N.txt(a.TITULOELEITOR),
                voter_document_zone: N.txt(a.TITULOELEITOR_ZONA),
                voter_document_section: N.txt(a.TITULOELEITOR_SECAO),
                voter_document_state: N.txt(a.TITULOELEITOR_UF),
                voter_document_issue_date: N.data(a.TITULOELEITOR_EMISSAO),

                civil_certificate_term: N.txt(a.CERTNASCIMENTO),
                civil_certificate_page: N.txt(a.CERTNASCIMENTOFOLHA),
                civil_certificate_book: N.txt(a.CERTNASCIMENTOLIVRO),
                civil_certificate_issue_date: N.data(a.CERTNASCIMENTODE),
                civil_certificate_agency: cartorio ? cartorio.nome : '',
                civil_certificate_agency_state: cartorioUF,
                civil_certificate_father: N.txt(a.NOMEPAI),
                civil_certificate_mother: N.txt(a.NOMEMAE)
            }));

            if (n % 500 === 0) log(`Alunos: ${n}/${linhas.length}`);
        }
        log(`--- ALUNOS concluido: ${n} de ${linhas.length} (${semEndereco} sem endereco em ENDALNS) ---`);
    }

    async ProcessarProfessores() {
        log('--- PROFESSORES (CADPROFE) ---');
        const [linhas] = await origem.query(`
            SELECT "CODIGO", "NOME", "APELIDO", "NASCIMENTO",
                   "NACIONALIDADE", "NATURALIDADE", "ESTADOCIVIL",
                   "NOMEPAI", "NOMEMAE",
                   "ENDERECO", "BAIRRO", "CIDADE", "CEP",
                   "TELEFONE", "TELEFONERES", "CELULAR",
                   "CODIGOMEC", "TITULACAO", "FORMACAO"
              FROM "CADPROFE"
             ORDER BY "CODIGO"
        `);

        let n = 0;
        for (const p of linhas) {
            n++;
            const nome = N.txt(p.NOME);
            if (nome === '') { log(`Professor ${p.CODIGO} sem nome - ignorado`); continue; }

            const end = N.endereco(p.ENDERECO);
            const cidade = this.Cidade(p.CIDADE);
            const nasc = this.Cidade(p.NATURALIDADE);
            const fone = N.telefone(p.TELEFONERES);
            const cel = N.telefone(p.CELULAR);
            const com = N.telefone(p.TELEFONE);

            await this.pessoaServico.RegistraPessoa(...paraArgumentos({
                id_person: N.idProfessor(p.CODIGO),
                id_student: '',
                profile: 1,
                type: 1,

                name: N.nomePessoa(p.NOME),
                social_name: N.txt(p.APELIDO),
                country: 'Brasil',
                birth_country: 'Brasil',

                zipcode: N.cep(p.CEP),
                street: end.street,
                street_number: N.limparNumeroEndereco(end.street_number),
                complement: N.limparComplemento(end.complement),
                neighborhood: N.txt(p.BAIRRO),
                city: cidade.cidade,
                state: cidade.uf,

                birthdate: N.data(p.NASCIMENTO),
                birthplace: nasc.cidade,
                birth_state: nasc.uf,
                nationality: this.Lookup('paises', p.NACIONALIDADE),
                civil_status: N.estadoCivil(this.Lookup('estadosCivis', p.ESTADOCIVIL)),

                telephone_area_code: fone.ddd,
                telephone_number: fone.numero,
                mobile_phone_area_code: cel.ddd,
                mobile_phone_number: cel.numero,
                commercial_phone_area_code: com.ddd,
                commercial_phone_number: com.numero,

                civil_certificate_father: N.txt(p.NOMEPAI),
                civil_certificate_mother: N.txt(p.NOMEMAE),

                academic_title: N.txt(p.TITULACAO) || N.txt(p.FORMACAO),
                codigo_professor_INEP: N.txt(p.CODIGOMEC)
            }));
        }
        log(`--- PROFESSORES concluido: ${n} de ${linhas.length} ---`);
    }

    async ProcessarFuncionarios() {
        log('--- FUNCIONARIOS (CADFUNC) ---');
        const [linhas] = await origem.query(`
            SELECT "CODIGO", "NOME", "DATANASCIMENTO", "COR",
                   "NACIONALIDADE", "NATURALIDADE", "ESTADOCIVIL",
                   "RG", "RG_OE", "RG_DE", "RG_UF", "CPF",
                   "ENDERECO", "BAIRRO", "CIDADE", "CEP",
                   "TELEFONE", "CELULAR",
                   "TITULOELEITOR", "TITULOELEITORZONA", "TITULOELEITORSECAO", "TITULOELEITORMUNICIPIO",
                   "CARTRESERVISTA"
              FROM "CADFUNC"
             ORDER BY "CODIGO"
        `);

        let n = 0;
        for (const f of linhas) {
            n++;
            const nome = N.txt(f.NOME);
            if (nome === '') { log(`Funcionario ${f.CODIGO} sem nome - ignorado`); continue; }

            const end = N.endereco(f.ENDERECO);
            const cidade = this.Cidade(f.CIDADE);
            const nasc = this.Cidade(f.NATURALIDADE);
            const fone = N.telefone(f.TELEFONE);
            const cel = N.telefone(f.CELULAR);

            await this.pessoaServico.RegistraPessoa(...paraArgumentos({
                id_person: N.idFuncionario(f.CODIGO),
                id_student: '',
                profile: 4,
                type: 1,

                name: N.nomePessoa(f.NOME),
                country: 'Brasil',
                birth_country: 'Brasil',

                zipcode: N.cep(f.CEP),
                street: end.street,
                street_number: N.limparNumeroEndereco(end.street_number),
                complement: N.limparComplemento(end.complement),
                neighborhood: N.txt(f.BAIRRO),
                city: cidade.cidade,
                state: cidade.uf,

                birthdate: N.data(f.DATANASCIMENTO),
                birthplace: nasc.cidade,
                birth_state: nasc.uf,
                nationality: this.Lookup('paises', f.NACIONALIDADE),
                civil_status: N.estadoCivil(this.Lookup('estadosCivis', f.ESTADOCIVIL)),
                ethnicity: N.etnia(f.COR),

                cpf: this.CpfUnico(f.CPF),
                rg: N.txt(f.RG).replace(/[.\-/\s]/g, ''),
                rg_issuing_agency: N.txt(f.RG_OE),
                rg_issuing_state: N.txt(f.RG_UF),
                rg_issue_date: N.data(f.RG_DE),

                telephone_area_code: fone.ddd,
                telephone_number: fone.numero,
                mobile_phone_area_code: cel.ddd,
                mobile_phone_number: cel.numero,

                voter_document: N.txt(f.TITULOELEITOR),
                voter_document_zone: N.txt(f.TITULOELEITORZONA),
                voter_document_section: N.txt(f.TITULOELEITORSECAO),
                voter_document_city: this.Cidade(f.TITULOELEITORMUNICIPIO).cidade,
                voter_document_state: this.Cidade(f.TITULOELEITORMUNICIPIO).uf,

                military_certificate: N.txt(f.CARTRESERVISTA)
            }));
        }
        log(`--- FUNCIONARIOS concluido: ${n} de ${linhas.length} ---`);
    }

    async ProcessarFiliacao() {
        if (process.env.FILIACAO != 1) return;

        log('=========== INICIO FILIACOES ===========');
        const [linhas] = await origem.query(`
            SELECT "CODIGO", "MAE", "PAI", "RESP", "PED",
                   "GRAUPARENTESCOMAE", "GRAUPARENTESCOPAI",
                   "GRAUPARENTESCORESP", "GRAUPARENTESCOPED"
              FROM "ALUNOS"
             ORDER BY "CODIGO"
        `);

        let gravadas = 0, semVinculo = 0;
        for (const a of linhas) {
            const idAluno = N.idAluno(a.CODIGO);

            const codMae = N.codigo(a.MAE);
            const codPai = N.codigo(a.PAI);
            const codResp = N.codigo(a.RESP);
            const codPed = N.codigo(a.PED);

            const porPessoa = new Map();
            const juntar = (cod, relationship, financeiro, grauBruto) => {
                if (!cod) return;
                const grauTexto = N.txt(grauBruto);
                const rel = grauTexto !== '' ? N.parentesco(grauTexto) : relationship;
                const atual = porPessoa.get(cod);
                if (!atual) {
                    porPessoa.set(cod, { relationship: rel, financeiro });
                    return;
                }
                if (atual.relationship === 'responsável' && rel !== 'responsável') atual.relationship = rel;
                atual.financeiro = atual.financeiro || financeiro;
            };

            juntar(codMae, 'mãe', codMae === codResp, a.GRAUPARENTESCOMAE);
            juntar(codPai, 'pai', codPai === codResp, a.GRAUPARENTESCOPAI);
            juntar(codResp, 'responsável', true, a.GRAUPARENTESCORESP);
            juntar(codPed, 'responsável', codPed === codResp, a.GRAUPARENTESCOPED);

            for (const [cod, v] of porPessoa) {
                await this.filiacaoServico.RegistraFiliation(
                    N.idResponsavel(cod), idAluno, v.relationship, v.financeiro
                );
                gravadas++;
            }
            if (porPessoa.size === 0) semVinculo++;
        }
        log(`=========== FIM FILIACOES: ${gravadas} vinculos, ${semVinculo} aluno(s) sem nenhum responsavel ===========`);
    }
}

module.exports = PessoaService;
