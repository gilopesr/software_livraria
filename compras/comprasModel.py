from config import db
import datetime


class Pedido(db.Model):
    __tablename__ = "pedidos"

    id_pedido = db.Column(db.Integer, primary_key=True)
    id_endereco_entrega = db.Column(db.Integer, db.ForeignKey('enderecos.id'), nullable=False)
    id_cliente = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    data_pedido = db.Column(db.Date, nullable=True, default=datetime.date.today)
    status = db.Column(db.String(50), nullable=False, default='pedido realizado')
    valor_total = db.Column(db.Float, nullable=False)

    endereco = db.relationship("Endereco", backref="pedidos")
    cliente = db.relationship("Cliente", backref="pedidos")


class Endereco(db.Model):
    __tablename__ = "enderecos"

    id = db.Column(db.Integer, primary_key=True)
    id_cliente = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    cep = db.Column(db.String(8), nullable=False)
    rua = db.Column(db.String(100), nullable=False)
    numero = db.Column(db.String(10), nullable=False)
    complemento = db.Column(db.String(100), nullable=True)
    bairro = db.Column(db.String(100), nullable=False)
    cidade = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(2), nullable=False)


class ItensPedido(db.Model):
    __tablename__ = "itens_pedido"

    id = db.Column(db.Integer, primary_key=True)
    id_pedido = db.Column(db.Integer, db.ForeignKey('pedidos.id_pedido'), nullable=False)
    id_livro = db.Column(db.Integer, db.ForeignKey('livros.id'), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    preco_unit = db.Column(db.Float, nullable=False)

    pedido = db.relationship("Pedido", backref="itens")
    livro = db.relationship("Livro", backref="itens_pedido")