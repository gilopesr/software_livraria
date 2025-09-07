import os
from config import app,db
from models.livros import Livro 
from flask import render_template, request, redirect, url_for
from datetime import datetime



@app.route("/")
def index():
    livros = Livro.query.all()
    return render_template("index.html", livros=livros)

@app.route("/cadastrar", methods=["GET", "POST"])
def cadastrar():
    if request.method == "POST":
        titulo = request.form["titulo"]
        autor = request.form["autor"]
        formato = request.form["formato"]
        genero = request.form["genero"]
        data_lancamento = datetime.strptime(request.form["data_lancamento"], "%Y-%m-%d").date()
        preco = float(request.form["preco"])

        novo_livro = Livro(
            titulo=titulo,
            autor=autor,
            formato=formato,
            genero=genero,
            data_lancamento=data_lancamento,
            preco=preco
        )

        db.session.add(novo_livro)
        db.session.commit()
        return redirect(url_for("index"))

    return render_template("cadastrar.html")

with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])