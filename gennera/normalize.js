function txt(valor) {
    if (valor === null || valor === undefined) return '';
    return `${valor}`.replace(/\s+/g, ' ').trim();
}

function codigo(valor) {
    const t = txt(valor);
    if (t === '' || t === '0') return null;
    return t;
}

const ANO_MINIMO = 1900;
const ANO_MAXIMO = new Date().getFullYear();

function data(valor) {
    let t = txt(valor).replace(/^'/, '').trim();
    if (t === '') return '';

    const partes = t.split('/');
    if (partes.length !== 3) return '';

    let [dia, mes, ano] = partes.map(p => p.trim());
    if (!/^\d{1,2}$/.test(dia) || !/^\d{1,2}$/.test(mes) || !/^\d{2,4}$/.test(ano)) return '';

    const d = parseInt(dia, 10);
    const m = parseInt(mes, 10);
    if (d < 1 || d > 31 || m < 1 || m > 12) return '';
    if (ano.length === 2) ano = (parseInt(ano, 10) > 30 ? '19' : '20') + ano;
    if (ano.length !== 4) return '';

    const a = parseInt(ano, 10);
    if (a < ANO_MINIMO || a > ANO_MAXIMO) return '';

    return `${d < 10 ? '0' + d : d}/${m < 10 ? '0' + m : m}/${ano}`;
}

function semAcento(valor) {
    return txt(valor).toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

const ESTADO_CIVIL = {
    solteiro: 'Solteiro', solteira: 'Solteiro',
    casado: 'Casado', casada: 'Casado',
    divorciado: 'Divorciado', divorciada: 'Divorciado',
    viuvo: 'Viúvo', viuva: 'Viúvo',
    separado: 'Separado', separada: 'Separado'
};

function estadoCivil(valor) {
    return ESTADO_CIVIL[semAcento(valor)] || '';
}

function etnia(valor) {
    const t = semAcento(valor);
    if (t === '') return '';
    if (t.startsWith('branc')) return 'Branca';
    if (t.startsWith('pard')) return 'Parda';
    if (t.startsWith('negr') || t.startsWith('pret')) return 'Preta';
    if (t.startsWith('amarel')) return 'Amarela';
    if (t.startsWith('indig')) return 'Indígena';
    if (t.startsWith('nao declarad') || t.startsWith('nao informad')) return 'Não Declarada';
    return '';
}

const MARCADOR_NOME = '- VALIDAR';

function nomePessoa(valor) {
    const t = txt(valor);
    if (t === '') return '';
    if (!/\p{L}/u.test(t)) return `SEM NOME ${MARCADOR_NOME}`;
    return t.includes(' ') ? t : `${t} ${MARCADOR_NOME}`;
}

function digitos(valor) {
    return txt(valor).replace(/\D/g, '');
}

function validarCPF(valor) {
    const cpf = digitos(valor);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i), 10) * (10 - i);
    let dv = 11 - (soma % 11);
    if (dv >= 10) dv = 0;
    if (dv !== parseInt(cpf.charAt(9), 10)) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i), 10) * (11 - i);
    dv = 11 - (soma % 11);
    if (dv >= 10) dv = 0;
    return dv === parseInt(cpf.charAt(10), 10);
}

function cpf(valor) {
    return validarCPF(valor) ? digitos(valor) : '';
}

function cep(valor) {
    const d = digitos(valor);
    return d.length === 8 ? d : '';
}

function telefone(valor) {
    const d = digitos(valor);
    if (d.length === 10 || d.length === 11) return { ddd: d.slice(0, 2), numero: d.slice(2) };
    if (d.length === 8 || d.length === 9) return { ddd: '', numero: d };
    return { ddd: '', numero: '' };
}

function sexo(valor) {
    const t = txt(valor).toUpperCase();
    if (t === 'M') return 'Masculino';
    if (t === 'F') return 'Feminino';
    return '';
}

function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

function email(valor) {
    let e = txt(valor);
    if (e === '') return '';
    let aux = e.normalize('NFD').replace(/\p{M}/gu, '');
    aux = aux.split(/[\s,;/]+/)[0];
    if (!validateEmail(aux)) return '';
    aux = aux.replace(/[^a-zA-Z0-9@._-]/g, '');
    aux = aux.replace(/\.$/, '');
    aux = aux.replace(/\.c$/, '.com');
    aux = aux.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})(.*)/, '$1');
    aux = aux.replaceAll('.@.', '@').replaceAll('.@', '@').replaceAll('@.', '@');
    return validateEmail(aux) ? aux.toLowerCase() : '';
}

function endereco(valor) {
    const t = txt(valor);
    if (t === '') return { street: '', street_number: '', complement: '' };

    if (/\bs\/?\s*n[ºo°.]?\b/i.test(t) || /\bsem\s+n[uú]mero\b/i.test(t)) {
        return {
            street: t.replace(/[,\s]*\bs\/?\s*n[ºo°.]?\b.*$/i, '').replace(/[,\s]+$/, '').trim(),
            street_number: 'S/N',
            complement: ''
        };
    }

    let m = t.match(/^(.*?)\s*(?:,\s*)?(?:n[ºo°]\.?\s*)(\d+)\s*(.*)$/i)
         || t.match(/^(.*?)\s*,\s*(\d+)\s*(.*)$/);
    if (m) {
        return {
            street: m[1].replace(/[,\s]+$/, '').trim(),
            street_number: m[2].trim(),
            complement: m[3].trim()
        };
    }

    m = t.match(/^(.*?[^\d\s])\s+(\d+)$/);
    if (m) {
        return { street: m[1].trim(), street_number: m[2].trim(), complement: '' };
    }

    return { street: t, street_number: '', complement: '' };
}

function limparNumeroEndereco(numero) {
    const t = txt(numero);
    return t.length > 5 ? '' : t;
}

function limparComplemento(complemento) {
    const t = txt(complemento);
    return t.length > 11 ? '' : t;
}

function parentesco(descricao) {
    const tipo = txt(descricao).toLowerCase().split('-')[0].trim();
    if (tipo === '') return 'responsável';
    if (tipo === 'pai') return 'pai';
    if (tipo === 'mãe' || tipo === 'mae') return 'mãe';
    if (tipo === 'irmão' || tipo === 'irmao') return 'irmão';
    if (tipo === 'irmã' || tipo === 'irma') return 'irmã';
    if (tipo === 'avô' || tipo === 'avo') return 'avô';
    if (tipo === 'avó') return 'avó';
    return 'responsável';
}

const idAluno       = cod => `${txt(cod)}`;
const idResponsavel = cod => `777${txt(cod)}777`;
const idProfessor   = cod => `999${txt(cod)}999`;
const idFuncionario = cod => `666${txt(cod)}666`;
const idEmpresa     = cod => `888${txt(cod)}888`;

module.exports = {
    txt, codigo, data, digitos, cpf, cep, telefone, sexo, email, endereco,
    estadoCivil, etnia, nomePessoa, semAcento,
    validarCPF, validateEmail, limparNumeroEndereco, limparComplemento, parentesco,
    idAluno, idResponsavel, idProfessor, idFuncionario, idEmpresa
};
