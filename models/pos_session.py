from odoo import models, fields, api

class PosSession(models.Model):
    _inherit = 'pos.session'

    unpaid_price = fields.Float(string='Unpaied Price', compute='_compute_canceled_orders', store=True)

    @api.model
    def force_recompute_unpaid(self, session_id):
        """
        This RPC method forces the recomputation of the unpaid price.
        It receives the session_id from the client.
        """
        session = self.browse(session_id)
        session._compute_canceled_orders()
        return True

    @api.depends('order_ids', 'order_ids.state')
    def _compute_canceled_orders(self):
        for session in self:
            sessions_in_company = self.env['pos.session'].search([
                ('company_id', '=', session.company_id.id)
            ])

            current_orders = self.env['pos.order'].search([
                ('session_id', 'in', sessions_in_company.ids),
                ('state', '!=', 'cancel')
            ])

            delivery_orders = self.env['delivery.order'].search([
                ('order_id', 'in', current_orders.ids),
                ('state', '!=', 'completed')
            ])
            session.unpaid_price = -sum(delivery_orders.mapped('subtotal'))
