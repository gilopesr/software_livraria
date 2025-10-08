from config import app,db
from flask import jsonify, render_template, request, redirect, url_for
from autor.autorModel import Autor, AutorNaoEncontrado
from datetime import datetime

@app.route("/autor", methods=['GET'])
def listarAutores():
    autores = Autor.query.all()
    return render_template("listarAutores.html", autores=autores)


@app.route("/autor/<path:nome>/livros", methods=['GET'])
def listarAutorLivros(nome):
    autor = Autor.query.filter(Autor.nome.ilike(f'%{nome}%')).first()
    
    if not autor:
        return f'Erro: Autor(a) não encontrado(a)', 404
    
    return render_template('livrosAutor.html', autor=autor, livros=autor.livros)


@app.route("/cadastrarAutor", defaults={'autor_id': None}, methods=["GET", "POST"])
@app.route("/cadastrarAutor/<int:autor_id>", methods=["GET", "POST"])
def gerenciarAutor(autor_id):
    autor = None
    if autor_id:
        autor = Autor.query.get(autor_id)
        if not autor:
            raise AutorNaoEncontrado("Autor(a) não encontrado(a)")

    if request.method == "POST":
        action = request.form.get('action')
        data = request.form 
        
        if action == 'excluir' and autor:
            db.session.delete(autor)
            db.session.commit()
            return redirect(url_for("listarAutores")) 

        target_autor = autor if autor else Autor() 
        
        nome = data.get("nome")
        dataNasc_str = data.get("dataNasc")
        
        if not all([nome, dataNasc_str]):
            return "Erro: todos os campos são obrigatórios", 400

        try:
            dataNasc = datetime.strptime(dataNasc_str, "%Y-%m-%d").date()
        except ValueError:
            return "Erro: dataNasc deve estar no formato YYYY-MM-DD", 400

        target_autor.nome = nome
        target_autor.dataNasc = dataNasc
        
        if not autor:
            db.session.add(target_autor) 
            
        db.session.commit()
        
        return redirect(url_for("listarAutores"))

    return render_template("cadastrarAutor.html", autor=autor)