odoo.define('lavia_pos_debt.OpeningCashPopup', function(require) {
    'use strict';

    const CashOpeningPopup = require('point_of_sale.CashOpeningPopup');
    const Registries = require('point_of_sale.Registries');

    const CanceledOrdersOpeningPopup = CashOpeningPopup => class extends CashOpeningPopup {
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
                    args: [[currentSession.id], ['unpaied_price']],
                    context: {
                        'active_session_id': currentSession.id
                    },
                });
                if (result && result.length) {
                    this.env.pos.pos_session.unpaied_price = result[0].unpaied_price;
                    // Force component to re-render
                    this.render();
                }
            } catch (error) {
                console.error('Failed to fetch canceled orders amount:', error);
            }
        }
    };

    Registries.Component.extend(CashOpeningPopup, CanceledOrdersOpeningPopup);

    return CanceledOrdersOpeningPopup;
});