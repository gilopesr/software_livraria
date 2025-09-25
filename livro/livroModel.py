from config import db

class Livro(db.Model):
    __tablename__ = "livros"

    id = db.Column(db.Integer, primary_key = True)
    titulo = db.Column(db.String(100))
    autor_id = db.Column(db.Integer, db.ForeignKey("autores.id"), nullable=False)
    autor = db.relationship("Autor", back_populates="livros")
    formato = db.Column(db.String(50))
    genero = db.Column(db.String(50))
    data_lancamento = db.Column(db.Date, nullable=False)
    preco = db.Column(db.Float, nullable=False)


class LivroNaoEncontrado(Exception):
    pass

