odoo.define('lavia_pos_debt.OpeningCashPopup', function(require) {
    'use strict';

    const CashOpeningPopup = require('point_of_sale.CashOpeningPopup');
    const Registries = require('point_of_sale.Registries');
    const rpc = require('web.rpc');

    const BootstrapNotificationPopup = CashOpeningPopup => class extends CashOpeningPopup {
        async setup() {
            await super.setup();
            await this.getCanceledOrders();
        }

        async getCanceledOrders() {
            const currentSession = this.env.pos.pos_session;
            try {
                const result = await this.rpc({
                    model: 'pos.session',
                    method: 'read',
                    args: [[currentSession.id], ['unpaid_price']],
                    context: { active_session_id: currentSession.id },
                });
                if (result && result.length) {
                    this.env.pos.pos_session.unpaid_price = result[0].unpaid_price;

                    if (result[0].unpaid_price && result[0].unpaid_price !== 0) {
                        const unpaidOrders = await this.rpc({
                            model: 'delivery.order',
                            method: 'search_read',
                            domain: [['state', 'not in', ['completed', 'canceled']]],
                            fields: ['order_number', 'subtotal'],
                        });

                        await this._triggerMultipleNotifications(unpaidOrders);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch canceled orders amount:', error);
            }
        }

        async _triggerMultipleNotifications(orders) {
            await this._triggerToastNotification(orders);
            
            let count = 0;
            const intervalId = setInterval(async () => {
                const result = this.env.pos.pos_session.unpaid_price
                console.log(`[${count}] Unpaid price in interval: ${result}`);

                if (result === 0){
                    console.log(`[${count}] The price has fully Paid ,price: ${result}`);
                    clearInterval(intervalId);
                    return;
                }

                if (count > 3) {
                    console.log(`[${count}] Unpaid price in interval: ${result}`);
                    clearInterval(intervalId);
                    return;
                }
                await this._triggerToastNotification(orders);
                count++;
            }, 30000);
        }

        async _triggerToastNotification(orders) {
            if (!document.getElementById('toastNotification')) {
                const ordersList = orders.map(order => 
                    `<li>شماره سفارش: ${order.order_number} به مبلغ: ${order.subtotal}</li>`
                ).join('');
                
                const toastHtml = `
                <div class="toast-notification" id="toastNotification">
                    سفارش های ارسالی تسویه نشده:
                    <ul>${ordersList}</ul>
                    <button class="close-toast" onclick="document.getElementById('toastNotification').style.display = 'none';">&times;</button>
                </div>`;
                
        
                const wrapper = document.createElement('div');
                wrapper.innerHTML = toastHtml;
                document.body.appendChild(wrapper.firstElementChild);
            }
            
            const toast = document.getElementById('toastNotification');
            toast.style.display = 'block';
            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
                toast.style.display = 'none';
            }, 20000);
        }
    };

    Registries.Component.extend(CashOpeningPopup, BootstrapNotificationPopup);

    return BootstrapNotificationPopup;
});
