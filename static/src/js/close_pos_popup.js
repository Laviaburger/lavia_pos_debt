odoo.define('pos_dept_customization.ClosePosPopup', function(require) {
    "use strict";

    // Load the original ClosePosPopup component
    const ClosePosPopupOriginal = require('point_of_sale.ClosePosPopup');
    const Registries = require('point_of_sale.Registries');
    const { useState } = owl;

    // Extend the original ClosePosPopup
    class ClosePosPopup extends ClosePosPopupOriginal {
        setup() {
            super.setup(); // Call the original setup method
            this.state = useState({
                dept: 0, // Initialize the department field
            });
            this.fetchDeliverySubtotal();
        }

        // Fetch the subtotal from delivery.order model for the current POS session
        async fetchDeliverySubtotal() {
            try {
                const currentSessionName = this.env.pos.pos_session.name; // Get current POS session name
                const subtotal = await this.rpc({
                    model: 'delivery.order',
                    method: 'search_read',
                    args: [
                        [['state', '!=', 'completed'], ['pos_session_id.name', '=', currentSessionName]],
                        ['subtotal'],
                    ],
                    kwargs: { context: this.env.session.user_context },
                });
                if (subtotal.length > 0) {
                    this.state.dept = -subtotal[0].subtotal; // Set the negative subtotal
                }
            } catch (error) {
                console.error('Error fetching delivery subtotal:', error);
                await this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Failed to fetch delivery subtotal.'),
                });
            }
        }
    }

    // Extend the original ClosePosPopup in the registry
    Registries.Component.extend(ClosePosPopupOriginal, ClosePosPopup);

    return ClosePosPopup;
});