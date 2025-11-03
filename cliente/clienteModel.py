from config import db
import datetime

class Cliente(db.Model):
    __tablename__ = "clientes"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False) 
    telefone = db.Column(db.String(20))
    endereco = db.Column(db.String(200))
    senha = db.Column(db.String(100), nullable=False)
    data_nasc = db.Column(db.Date, nullable=True, default=datetime.date.today)
    username = db.Column(db.String(50), nullable=False)




