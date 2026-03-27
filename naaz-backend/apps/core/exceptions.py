class InsufficientStockError(Exception):
    def __init__(self, product_name, available, requested):
        self.product_name = product_name
        self.available = available
        self.requested = requested
        super().__init__(f"Insufficient stock for {product_name}. Requested: {requested}, Available: {available}")
