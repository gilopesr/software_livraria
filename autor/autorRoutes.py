from config import app,db
from flask import jsonify, render_template, request, redirect, url_for
from autor.autorModel import Autor, AutorNaoEncontrado
from datetime import datetime

@app.route("/autor", methods=['GET'])
def listarAutores():
    autores = Autor.query.all()
    return render_template("listarAutores.html", autores=autores)


@app.route("/cadastrarAutor", methods=["GET", "POST"])
def cadastrarAutor():
    if request.method == "POST":
        data = request.form if request.form else request.get_json() or {}
        
        nome = data.get("nome")
        dataNasc_str = data.get("dataNasc")

        if not all([nome, dataNasc_str]):
            return "Erro: todos os campos são obrigatórios", 400

        try:
            dataNasc = datetime.strptime(dataNasc_str, "%Y-%m-%d").date()
        except ValueError:
            return "Erro: dataNasc deve estar no formato YYYY-MM-DD", 400

        novo_autor = Autor(
            nome = nome,
            dataNasc = dataNasc
        )

        db.session.add(novo_autor)
        db.session.commit()

        if request.form:
            return redirect(url_for("listarAutores"))
        else:
            return {"msg": "Autor(a) cadastrado(a)!"}, 201

    return render_template("cadastrarAutor.html")

@app.route("/autor/<path:nome>/livros", methods=['GET'])
def listarAutorLivros(nome):
    autor = Autor.query.filter(Autor.nome.ilike(f'%{nome}%')).first()
    
    if not autor:
        return f'Erro: Autor(a) não encontrado(a)', 404
    
    return render_template('livrosAutor.html', autor=autor, livros=autor.livros)



@app.route("/autor/<int:id_autor>", methods=["PUT"])
def atualizar_autor(id_autor):
    try:
        autor_encontrado = Autor.query.get(id_autor)
        if not autor_encontrado:
            raise AutorNaoEncontrado("Autor(a) não encontrado(a)")

        data = request.json

        campos_obrigatorios = ["nome", "dataNasc"]
        for campo in campos_obrigatorios:
            if campo not in data or not data[campo]:
                return jsonify({"erro": f"O campo '{campo}' é obrigatório"}), 400

        autor_encontrado.nome = data["nome"]
        autor_encontrado.dataNasc = data["dataNasc"]  

        try:
            autor_encontrado.dataNasc = datetime.strptime(data["dataNasc"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"erro": "dataNasc deve estar no formato YYYY-MM-DD"}), 400
        
        db.session.commit()
        return jsonify({"mensagem": "Autor(a) atualizado(a) com sucesso!"}), 200

    except AutorNaoEncontrado as e:
        return jsonify({"erro": str(e)}), 404


@app.route("/autor/<int:id_autor>", methods=['POST', 'DELETE'])
def deletarAutor(id_autor):
    autor = Autor.query.get(id_autor)
    if not autor:
        raise AutorNaoEncontrado("Autor(a) não encontrado(a)")
    
    db.session.delete(autor)
    db.session.commit()
    
    if request.method == 'POST':
        return redirect(url_for("index"))
    
    return jsonify({'mensagem': 'Autor(a) deletado(a) com sucesso'})
