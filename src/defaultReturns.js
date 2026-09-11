const verify = function (op, data){
    /**
     *                        GET
     * Obs: Respostas padrão de sucesso
     */
    if(op === 'get'){
        if(typeof data == 'object'){
            if(data === null){
                return 'No data found!';
            } else{
                return 'Consultation performed successfully!';
            }
        } else {
            if(data.length){
                return 'Consultation performed successfully!';
            } else{
                return 'No data found!';
            }
        }
    }
    /**
     *                        POST
     * Obs: Respostas padrão de sucesso
     */
    else if(op === 'post'){
        return 'Registration successfull!';
    }

    /**
     *                        UPDATE
     * Obs: Respostas padrão de sucesso
     */

    else if(op === 'update'){
        return 'Registration updated successfully!';
    } 

    /**
     *                        DELETE
     * Obs: Respostas padrão de sucesso
     */

    else if(op === 'delete'){
        return 'successfully deleted!';
    } 

}

module.exports = verify;