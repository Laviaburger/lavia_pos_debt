{
        'name': 'lavia_pos_debt',
        'version': '1.0',
        'depends': ['point_of_sale'],
        'assets': {
        'point_of_sale.assets': [
            'lavia_pos_debt/static/src/js/close_pos_popup.js',
            'lavia_pos_debt/static/src/xml/close_pos_popup.xml',
            ],
        },
        'installable': True,
        'application': True,
    }