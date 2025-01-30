odoo.define('lavia_pos_debt.ClosePosPopup', function(require) {
    'use strict';

    const ClosePosPopup = require('point_of_sale.ClosePosPopup');
    const Registries = require('point_of_sale.Registries');

    const CanceledOrdersClosePosPopup = ClosePosPopup => class extends ClosePosPopup {
        setup() {
            super.setup();
            this.getCanceledOrders();
        }

        async getCanceledOrders() {
            const currentSession = this.env.pos.pos_session;
            try {
                const result = await this.rpc({
                    model: 'pos.session',
                    method: 'read',
                    args: [[currentSession.id], ['canceled_orders_amount']],
                    context: {
                        'active_session_id': currentSession.id
                    },
                });
                if (result && result.length) {
                    this.env.pos.pos_session.canceled_orders_amount = result[0].canceled_orders_amount;
                }
            } catch (error) {
                console.error('Failed to fetch canceled orders amount:', error);
            }
        }
    };

    Registries.Component.extend(ClosePosPopup, CanceledOrdersClosePosPopup);

    return CanceledOrdersClosePosPopup;

});
