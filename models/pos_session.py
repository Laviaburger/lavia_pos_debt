from odoo import fields, models, api

class PosSession(models.Model):
    _inherit = 'pos.session'

    canceled_orders_amount = fields.Float(string='Canceled Orders', compute='_compute_canceled_orders', store=True)

    @api.depends('order_ids')
    def _compute_canceled_orders(self):
        for session in self:
            # Get delivery orders only for the current session
            current_orders = self.env['pos.order'].search([
                ('session_id', '=', session.id),
                ('state', '!=', 'cancel')  # Exclude canceled POS orders
            ])
                
            delivery_orders = self.env['delivery.order'].search([
                ('order_id', 'in', current_orders.ids),  # Changed from pos_order_id to order_id
                ('state', '!=', 'completed')
            ])
                
            # Sum all subtotals and make it negative
            session.canceled_orders_amount = -sum(delivery_orders.mapped('subtotal'))
