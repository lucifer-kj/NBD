from django.db import models

class PaymentRecord(models.Model):
    """
    Log of all attempted Instamojo payments.
    Provides an audit trail for webhooks and payment attempts.
    """
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='payment_records')
    instamojo_payment_id = models.CharField(max_length=200, db_index=True)
    instamojo_payment_request_id = models.CharField(max_length=200, db_index=True)
    status = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    webhook_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_records'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.instamojo_payment_id} for Order {self.order_id} ({self.status})"
