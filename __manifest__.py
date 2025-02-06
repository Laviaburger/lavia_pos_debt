{
        'name': 'Lavia Pos Dept On Close PopUp',
        'version': '1.0',
        'depends': ['point_of_sale', 'delivery_person'],
        'data': [
            'views/pos_session_views.xml',
        ],
        'assets': {
            'point_of_sale.assets': [
                'lavia_pos_debt/static/src/js/close_pos_popup.js',
                'lavia_pos_debt/static/src/js/header_close_button.js',
                'lavia_pos_debt/static/src/js/opening_cash_popup.js',
                'lavia_pos_debt/static/src/xml/close_pos_popup.xml',
                'lavia_pos_debt/static/src/xml/opening_cash_control.xml',
                'lavia_pos_debt/static/src/css/pos.css',
                'lavia_pos_debt/static/src/css/styles.css',
            ],
        },
        'installable': True,
        'application': True,
}