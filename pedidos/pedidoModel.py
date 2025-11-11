from config import db
import datetime

class Pedido(db.Model):
    __tablename__ = "pedidos"

    id = db.Column(db.Integer, primary_key=True)
    cep = db.Column(db.Integer, nullable = False)
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id"), nullable=False)
    cliente = db.relationship("Cliente", back_populates="pedidos")
    data = data_nasc = db.Column(db.Date, nullable=True, default=datetime.date.today)