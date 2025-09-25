from config import db

class Autor(db.Model):
    __tablename__ = "autores"

    id = db.Column(db.Integer, primary_key = True)
    nome = db.Column(db.String(100))
    dataNasc = db.Column(db.Date, nullable=False)
    livros = db.relationship("Livro", back_populates="autor")



class AutorNaoEncontrado(Exception):
    pass

