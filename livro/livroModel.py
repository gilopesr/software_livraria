from config import db

class Livro(db.Model):
    __tablename__ = "livros"

    id = db.Column(db.Integer, primary_key = True)
    titulo = db.Column(db.String(100))
    autor_id = db.Column(db.Integer, db.ForeignKey("autores.id"), nullable=False)
    autor = db.relationship("Autor", back_populates="livros")
    formato = db.Column(db.String(50), nullable=False)
    url_img = db.Column(db.String(500))
    genero = db.Column(db.String(50), nullable=False)
    data_lancamento = db.Column(db.Date, nullable=False)
    preco = db.Column(db.Float, nullable=False)
    isbn = db.Column(db.Integer,nullable=False)
    destaque = db.Column(db.Boolean, default=False)
    estoque = db.Column(db.Integer, nullable=False, default=0)

class LivroNaoEncontrado(Exception):
    pass

