from config import db

class Livro(db.Model):
    __tablename__ = "livros"

    id = db.Column(db.Integer, primary_key = True)
    titulo = db.Column(db.String(100))
    autor = db.Column(db.String(100))
    formato = db.Column(db.String(50))
    genero = db.Column(db.String(50))
    data_lancamento = db.Column(db.Date, nullable=False)
    preco = db.Column(db.Float, nullable=False)
