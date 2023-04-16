const express = require('express');
const PagesController = require('./controllers/PagesController');
var database = require('./public/js/database');

const router = express.Router()

router.get('/', PagesController.showIndex)

router.get('/cadastro', PagesController.showCadastro)

router.get('/adm', PagesController.showAdm)

router.get('/get_data', function (request, response, next) {

    var draw = request.query.draw;

    var start = request.query.start;

    var length = request.query.length;

    var order_data = request.query.order;

    if (typeof order_data == 'undefined') {
        var column_name = 'usuarios.id';

        var column_sort_order = 'desc';
    }
    else {
        var column_index = request.query.order[0]['column'];

        var column_name = request.query.columns[column_index]['data'];

        var column_sort_order = request.query.order[0]['dir'];
    }

    //search data

    var search_value = request.query.search['value'];

    var search_query = `
     AND (nome LIKE '%${search_value}%')
    `;

    //Total number of records without filtering

    database.query("SELECT COUNT(*) as total FROM usuarios", function (error, data) {

        var total_records = data[0].total;

        //Total number of records with filtering

        database.query(`SELECT COUNT(*) as total FROM usuarios WHERE nome LIKE '%${search_value}%'`, function (error, data) {

            var total_records_with_filter = data[0].total;

            var query = `
            SELECT usuarios.*, cashback.total_cashback, cashback.total_gasto, cashback.numero_de_compras, cashback.gasto_medio, cashback.saldo_cashback, cashback.avaliacao_loja, cashback.cashback_resgatado FROM usuarios
            LEFT OUTER JOIN cashback ON usuarios.id = cashback.usuarios_id
            WHERE (cashback.lojas_id = 1) AND (nome LIKE '%${search_value}%')
            ORDER BY ${column_name} ${column_sort_order} 
            LIMIT ${start}, ${length}
            `;

            var data_arr = [];

            database.query(query, function (error, data) {
                if (error) {
                    console.error(error);
                    // faça algo para lidar com o erro, como enviar uma resposta de erro
                } else {
                    data.forEach(function (row) {
                        data_arr.push({
                            'nome': row.nome,
                            'telefone': row.telefone,
                            'email': row.email,
                            'total_gasto': row.total_gasto,
                            'numero_de_compras': row.numero_de_compras,
                            'avaliacao_loja': row.avaliacao_loja,
                            'gasto_medio': row.gasto_medio,
                            'saldo_cashback': row.saldo_cashback,
                            'total_cashback': row.total_cashback,
                            'cashback_resgatado': row.cashback_resgatado
                        });
                    });

                    var output = {
                        'draw': draw,
                        'iTotalRecords': total_records,
                        'iTotalDisplayRecords': total_records_with_filter,
                        'aaData': data_arr
                    };

                    response.json(output);
                }
            });

        });

    });

});

router.get('/finalizado', PagesController.showFinalizado)

router.get('/acumular', PagesController.showAcumular)

router.get('/resgatar', PagesController.ShowResgatar)

router.get('/consultar', PagesController.showConsultar)

router.get('/erro', PagesController.showErro)


// -----------------------------------------------------------

router.post('/store-resgatar', PagesController.storeResgatar)

router.post('/store-acumular', PagesController.storeAcumular)

router.post('/store-consultar', PagesController.storeConsultar)

router.post('/createdForm', PagesController.storeForm)

module.exports = router