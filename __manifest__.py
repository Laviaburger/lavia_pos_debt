{
        'name': 'Lavia Pos Dept On Close PopUp',
        'version': '1.0',
        'depends': ['point_of_sale'],
        'data': [
        'views/pos_session_views.xml',
        ],
        'assets': {
            'web.assets_backend': [
                'lavia_pos_bebt/static/src/js/close_pos_popup.js',
            ],
            'point_of_sale.assets': [
                'lavia_pos_debt/static/src/xml/close_pos_popup.xml',
                'lavia_pos_debt/static/src/css/pos.css',
            ],
        },
        'installable': True,
        'application': True,
}