odoo.define('lavia_pos_debt.HeaderButton', function(require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const { isConnectionError } = require('point_of_sale.utils');

    class HeaderButton extends PosComponent {
        async onClick() {
            try {
                await this.rpc({
                    model: 'pos.session',
                    method: 'force_recompute_unpaid',
                    args: [[this.env.pos.pos_session.id]],
                });
                console.log("Force Recompute Done!");

                const sessionData = await this.rpc({
                    model: 'pos.session',
                    method: 'read',
                    args: [[this.env.pos.pos_session.id], ['unpaid_price']],
                });
                const unpaidPrice = (sessionData[0] && sessionData[0].unpaid_price) || 0;
                console.log("Before Update unpaid price:", this.env.pos.pos_session.unpaid_price);
                
                this.env.pos.pos_session.unpaid_price = unpaidPrice;
                console.log("Updated unpaid price:", this.env.pos.pos_session.unpaid_price);

                const info = await this.env.pos.getClosePosInfo();
                this.showPopup('ClosePosPopup', { info: { ...info, unpaidPrice }, keepBehind: true });
            } catch (e) {
                if (isConnectionError(e)) {
                    this.showPopup('OfflineErrorPopup', {
                        title: this.env._t('Network Error'),
                        body: this.env._t('Please check your internet connection and try again.'),
                    });
                } else {
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('Unknown Error'),
                        body: this.env._t('An unknown error prevents us from getting closing information.'),
                    });
                }
            }
        }
    }
    HeaderButton.template = 'HeaderButton';

    Registries.Component.add(HeaderButton);

    return HeaderButton;
});
