from odoo import fields, models, api

class PosSession(models.Model):
    _inherit = 'pos.session'

    unpaied_price = fields.Float(string='Unpaied Price', compute='_compute_canceled_orders', store=True)

    @api.depends('order_ids')
    def _compute_canceled_orders(self):
        for session in self:
            # Filter POS sessions for the same company as the current session
            sessions_in_company = self.env['pos.session'].search([
                ('company_id', '=', session.company_id.id)
            ])

            # Get current orders for all sessions in the same company (excluding canceled ones)
            current_orders = self.env['pos.order'].search([
                ('session_id', 'in', sessions_in_company.ids),
                ('state', '!=', 'cancel')  # Exclude canceled POS orders
            ])
                
            # Get related delivery orders for the current orders (excluding completed ones)
            delivery_orders = self.env['delivery.order'].search([
                ('order_id', 'in', current_orders.ids),
                ('state', '!=', 'completed')
            ])
                
            # Sum all subtotals of the delivery orders and make it negative
            session.unpaied_price = -sum(delivery_orders.mapped('subtotal'))
