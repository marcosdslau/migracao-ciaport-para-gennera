module.exports = async (err, req, res, next) => {
    let status = 500;

    /**
     * 
     * Erros Operação;
     * 
     */
    if (err.parent) {
        if (err.parent.code == 23505) {
            status = 409;
            err.message = 'Value already exists!';
            err.idError = 10000;
        }
        if (err.parent.code == 23503) {
            status = 409;
            err.message = `${err.CustomMessage}: value does not exist in reference table`;
            err.idError = 10001;
        }
        if (err.parent.code == '22P02') {
            status = 409;
            err.idError = 10002;
            if (err.parent.routine == 'boolin') {
                err.message = 'Invalid boolean data type!';
            }
            if (err.parent.routine == 'pg_strtoint32') {
                err.message = 'Invalid Integer data type!';
            }
            // err.message = 'Foreign key not informed';
        }
        if (err.parent.code == 22001) {
            status = 409;
            err.message = `Number of characters exceeds field limit`;
            err.idError = 10003;
        }
    }
    console.log(err.parent)
    res.status(status);
    res.json({
        message: err.message,
        idError: err.idError,
        err: err
    });

}

