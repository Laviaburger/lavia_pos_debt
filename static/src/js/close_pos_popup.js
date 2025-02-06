odoo.define('lavia_pos_debt.ClosePosPopup', function(require) {
    'use strict';

    const ClosePosPopup = require('point_of_sale.ClosePosPopup');
    const Registries = require('point_of_sale.Registries');

    const CanceledOrdersClosePosPopup = ClosePosPopup => class extends ClosePosPopup {
        setup() {
            super.setup();
            console.log("Start of close button!");
        }
        async confirm() {
            let allCompleted = await this.removeOnClose();
            if (allCompleted && allCompleted.length > 0) {
                console.warn(`Order with this number is not completed: ${allCompleted} and they type is: ${typeof allCompleted}`);
                return;
            }

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
            return super.confirm();
        }

        async removeOnClose() {
            try {
                const currentSession = this.env.pos.pos_session;
                const result = await this.rpc({
                    model: 'pos.session',
                    method: 'write',
                    args: [[currentSession.id], { 'unpaid_price': 0 }], 
                    context: {
                        'active_session_id': currentSession.id
                    },
                });
                console.log(`Item removed from Subtract: ${result}`);
                
                console.log(`Successfully set unpaid_price to 0 for session ${currentSession.id}`);
                return [];
                
            } catch (error) {
                console.error('Failed to reset unpaid_price:', error);
                return ['Error'];
            }
        }

    };

    Registries.Component.extend(ClosePosPopup, CanceledOrdersClosePosPopup);

    return CanceledOrdersClosePosPopup;
});
