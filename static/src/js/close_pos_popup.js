odoo.define('lavia_pos_debt.ClosePosPopup', function(require) {
    'use strict';

    const ClosePosPopup = require('point_of_sale.ClosePosPopup');
    const Registries = require('point_of_sale.Registries');

    const CanceledOrdersClosePosPopup = ClosePosPopup => class extends ClosePosPopup {
        setup() {
            super.setup();
            this.getCanceledOrders();
        }

        async confirm() {
            if (this.env.pos.useBlackBoxBe && this.env.pos.useBlackBoxBe()) {
                let status = await this.getUserSessionStatus(this.env.pos.pos_session.id, this.env.pos.pos_session.user_id[0]);

                console.log(`Status is: ${status}`);

                if (status) {
                    await this.showPopup('ErrorPopup', {
                        title: this.env._t("POS error"),
                        body: this.env._t("You need to clock out before closing the POS."),
                    });
                    return;
                }
            }

            let allCompleted = await this.removeOnClose();
            if (allCompleted && allCompleted.length > 0) {
                console.warn(`Order with this number is not completed: ${allCompleted} and they type is: ${typeof allCompleted}`);
                return;
            }
            
            return super.confirm();
        }

        async removeOnClose() {
            try {
                const currentSession = this.env.pos.pos_session;
                const result = await this.rpc({
                    model: 'pos.session',
                    method: 'write',
                    args: [[currentSession.id], { 'unpaied_price': 0 }], 
                    context: {
                        'active_session_id': currentSession.id
                    },
                });
                
                console.log(`Successfully set unpaied_price to 0 for session ${currentSession.id}`);
                return [];
                
            } catch (error) {
                console.error('Failed to reset unpaied_price:', error);
                return ['Error'];
            }
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
                }
            } catch (error) {
                console.error('Failed to fetch canceled orders amount:', error);
            }
            console.log(`Current unpaid price: ${currentSession.unpaied_price}`);
        }
    };

    Registries.Component.extend(ClosePosPopup, CanceledOrdersClosePosPopup);

    return CanceledOrdersClosePosPopup;
});
