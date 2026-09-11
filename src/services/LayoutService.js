const fs = require('fs');
const { readFile } = require('fs');

function getHeader(json, layout) {
    let firstLine = '';
    for (field in json) {
        if( layout == 'Pessoas' || layout == 'Filiação' || layout == 'Cursos' || layout == 'Currículos' || layout == 'Módulos' || layout == 'Disciplinas' || layout == 'Matriculas' || layout == 'Ofertas' || layout == 'Ofertas_Turma' || layout == 'Disciplinas_Prerequisitos' || layout == 'Disciplinas_Equivalencias' || layout == 'Matriculas_Pos' || layout == 'Histórico' || layout == 'Histórico_Disciplinas_Parte-1_' || layout == 'Histórico_Disciplinas_Parte-2_' || layout == 'Histórico_Disciplinas_Parte-3_' || layout == 'Histórico_Disciplinas_Parte-4_' || layout == 'Histórico_Disciplinas_Parte-5_' || layout == 'Histórico_Disciplinas_Parte-6_' || layout == 'Histórico_Disciplinas_Parte-7_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-1_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-2_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-3_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-4_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-5_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-6_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-7_' || layout == 'id_enrollment_complementary_activity_record_aux') if(field == 'id') continue;
        if( field == 'createdAt') continue;
        if( field == 'updatedAt') continue;
        if( field == 'id_enrollment_record_aux') continue;
        if( field == 'id_enrollment_subject_record_aux') continue;
        if( field == 'id_enrollment_subject_record_professor_aux') continue;
        if( field == 'id_enrollment_complementary_activity_record_aux') continue;
        if( field == 'segunda_carga') continue;
        if( field == 'id_purchase_aux') continue;
        if( field == 'id_invoice_aux') continue;
        if( field == 'id') continue;
        if( field == 'isManual') continue;
        firstLine += firstLine ? '	' + `${field}` : `${field}`;
    }
    return firstLine + "\n";
}
function getKeys(json, layout) {
    let keys = [];
    for (field in json) {
        if( layout == 'Pessoas' || layout == 'Filiação' || layout == 'Cursos' || layout == 'Currículos' || layout == 'Módulos' || layout == 'Disciplinas' || layout == 'Matriculas' || layout == 'Ofertas' || layout == 'Ofertas_Turma' || layout == 'Disciplinas_Prerequisitos' || layout == 'Disciplinas_Equivalencias' || layout == 'Matriculas_Pos' || layout == 'Histórico' || layout == 'Histórico_Disciplinas_Parte-1_' || layout == 'Histórico_Disciplinas_Parte-2_' || layout == 'Histórico_Disciplinas_Parte-3_' || layout == 'Histórico_Disciplinas_Parte-4_' || layout == 'Histórico_Disciplinas_Parte-5_' || layout == 'Histórico_Disciplinas_Parte-6_' || layout == 'Histórico_Disciplinas_Parte-7_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-1_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-2_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-3_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-4_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-5_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-6_' || layout == 'Histórico_Disciplinas_x_Professor_Parte-7_' || layout == 'id_enrollment_complementary_activity_record_aux') if(field == 'id') continue;
        if( field == 'createdAt') continue;
        if( field == 'updatedAt') continue;
        if( field == 'id_enrollment_record_aux') continue;
        if( field == 'id_enrollment_subject_record_aux') continue;
        if( field == 'id_enrollment_subject_record_professor_aux') continue;
        if( field == 'id_enrollment_complementary_activity_record_aux') continue;
        if( field == 'segunda_carga') continue;
        if( field == 'id') continue;
        if( field == 'isManual') continue;
        if( field == 'id_purchase_aux') continue;
        if( field == 'id_invoice_aux') continue;
        keys.push(`${field}`)
    }
    return keys;
}

function getLines(arr, keys) {
    let data = '';
    for (const line of arr) {
        let content = '';
        keys.forEach(k => {
            let valor = line.dataValues[k];
            content += content ? ('	' + `${valor == null ? '' : valor}`) :  (valor == null ? '' : valor);
        });
        data += content + "\n";
    }
    return data;
}

function getLinesManual(arr, keys) {
    let data = '';
    for (const line of arr) {
        let content = '';
        keys.forEach(k => {
            let valor = line[k];
            content += content ? ('	' + `${valor == null ? '' : valor}`) :  (valor == null ? '' : valor);
        });
        data += content + "\n";
    }
    return data;
}

class LayoutService {
    constructor(nomeLayout) {
        this._nomeLayout = nomeLayout;
    }

    #Lotes(arr, qtdLode = 10000){
        let obj = {};
        let index = 1;
        let count = 0;
        for(let i of arr){
            if(count == 0) obj[`${index}`] = [];
            if(count < qtdLode){
                obj[`${index}`].push(i);
                count++;
            } else{
                obj[`${index}`].push(i)
                index++;
                count = 0;
            }
        }
        return obj;
    }


    async CreateFile(arr, isLote = false, qtdLode = 15000) {
        const DataAtual = new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo'
          });
        let dataFormatada = DataAtual.substring(0,19).replaceAll('/', '-').replaceAll(',', ' ').replaceAll(':', '-');
        dataFormatada = dataFormatada.substring(0, 10) + ` ${dataFormatada.substring(11, 14)}h${dataFormatada.substring(15, 17)}m${dataFormatada.substring(18, 20)}s`;
        if(isLote){
            let lotes = this.#Lotes(arr, qtdLode);
            for(let lote in lotes){
                let nameFile = `${this._nomeLayout}_${dataFormatada}_LOTE-${lote}.csv`
                
                if (lotes[lote].length) {
                    let data = '';
                    data += getHeader(lotes[lote][0].dataValues, this._nomeLayout);
                    const keys = getKeys(lotes[lote][0].dataValues, this._nomeLayout);
                    data += getLines(lotes[lote], keys)
                    fs.writeFileSync(`./csv/${nameFile}`, data);
                }
            }
        } else {
            let nameFile = `${this._nomeLayout}_${dataFormatada}.csv`
            if (arr.length) {
                let data = '';
                data += getHeader(arr[0].dataValues, this._nomeLayout);
                const keys = getKeys(arr[0].dataValues, this._nomeLayout);
                data += getLines(arr, keys)
                fs.writeFileSync(`./csv/${nameFile}`, data);
                return nameFile;
            }
        }
        return '';
    }

    async CreateFileManual(arr) {
        const DataAtual = new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo'
          });
        let dataFormatada = DataAtual.substring(0,19).replaceAll('/', '-').replaceAll(',', ' ').replaceAll(':', '-');
        dataFormatada = dataFormatada.substring(0, 10) + ` ${dataFormatada.substring(11, 14)}h${dataFormatada.substring(15, 17)}m${dataFormatada.substring(18, 20)}s`;
        let nameFile = `${this._nomeLayout}_${dataFormatada}.csv`
        if (arr.length) {
            let data = '';
            data += getHeader(arr[0], this._nomeLayout);
            const keys = getKeys(arr[0], this._nomeLayout);
            data += getLinesManual(arr, keys)
            fs.writeFileSync(`./csv/${nameFile}`, data);
            return nameFile;
        }
        return '';
    }

}

module.exports = LayoutService;