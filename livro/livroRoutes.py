from config import app,db
from flask import jsonify, render_template, request, redirect, url_for
from livro.livroModel import Livro, LivroNaoEncontrado
from autor.autorModel import Autor
from datetime import datetime

@app.route('/')
def index():
    return render_template("index.html")

@app.route("/livros", methods=['GET'])
def listarLivros():
    livros = Livro.query.all()
    return render_template("listaLivros.html", livros=livros)

@app.route('/livros/titulo/<path:titulo>', methods=['GET'])
def buscarLivro_titulo(titulo):
    livros = Livro.query.filter(Livro.titulo.ilike(f'%{titulo}%')).all()
    
    if livros:
        return render_template('listaLivros.html', livros=livros)
    else:
        return f'Erro: Nenhum livro com o título "{titulo}" foi encontrado", 404'
    
@app.route('/livros/genero/<string:genero>',methods=['GET'])
def buscarLivro_genero(genero):
    livros = Livro.query.filter(Livro.genero.ilike(genero)).all()
    
    if livros:
        return render_template('listaLivros.html', livros=livros)
    else:
        return f'Erro: Nenhum livro com genero de {genero} foi encontrado", 404'
     
@app.route('/livros/<int:isbn>',methods=['GET'])
def buscarLivro_isbn(isbn):
    livro = Livro.query.filter_by(isbn=isbn).first()
    if livro:
        return render_template('listaLivros.html', livros=[livro])
    else:
        return f'Erro: O livro com ISBN {isbn} não foi encontrado!', 404

@app.route("/cadastrarLivro", methods=["GET", "POST"])
def cadastrarLivro():
    if request.method == "POST":
        # Pegar dados do form ou JSON
        data = request.form if request.form else request.get_json() or {}
        
        titulo = data.get("titulo")
        autor_id = data.get("autor_id")
        formato = data.get("formato")
        genero = data.get("genero")
        data_lancamento_str = data.get("data_lancamento")
        preco_str = data.get("preco")
        isbn = data.get('isbn')

        if not all([titulo, autor_id, formato, genero, data_lancamento_str, preco_str,isbn]):
            return "Erro: todos os campos são obrigatórios", 400

        try:
            data_lancamento = datetime.strptime(data_lancamento_str, "%Y-%m-%d").date()
        except ValueError:
            return "Erro: data_lancamento deve estar no formato YYYY-MM-DD", 400

        try:
            preco = float(preco_str)
        except ValueError:
            return "Erro: preço deve ser um número válido", 400

        novo_livro = Livro(
            titulo=titulo,
            autor_id=autor_id,
            formato=formato,
            genero=genero,
            data_lancamento=data_lancamento,
            preco=preco,
            isbn=isbn
        )

        db.session.add(novo_livro)
        db.session.commit()

        # Redireciona se vier de form HTML, ou retorna JSON se vier de API
        if request.form:
            return redirect(url_for("listarLivros"))
        else:
            return {"msg": "Livro cadastrado!", "titulo": titulo}, 201

    # GET: exibe o formulário HTML
    autores = Autor.query.all()
    return render_template("cadastrarLivro.html", autores=autores)


@app.route("/livros/<int:id_livro>", methods=["PUT"])
def atualizar_livro(id_livro):
    try:
        livro_encontrado = Livro.query.get(id_livro)
        if not livro_encontrado:
            raise LivroNaoEncontrado("Livro não encontrado")

        data = request.json

        campos_obrigatorios = ["titulo", "autor_id", "formato", "genero", "data_lancamento", "preco","isbn"]
        for campo in campos_obrigatorios:
            if campo not in data or not data[campo]:
                return jsonify({"erro": f"O campo '{campo}' é obrigatório"}), 400

        livro_encontrado.titulo = data["titulo"]
        livro_encontrado.autor_id = data["autor_id"]  
        livro_encontrado.formato = data["formato"]
        livro_encontrado.genero = data["genero"]
        livro_encontrado.isbn = data['isbn']

        try:
            livro_encontrado.data_lancamento = datetime.strptime(data["data_lancamento"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"erro": "data_lancamento deve estar no formato YYYY-MM-DD"}), 400

        try:
            livro_encontrado.preco = float(data["preco"])
        except ValueError:
            return jsonify({"erro": "O preço deve ser um Float: 10.59"}), 400

        db.session.commit()
        return jsonify({"mensagem": "Livro atualizado com sucesso!"}), 200

    except LivroNaoEncontrado as e:
        return jsonify({"erro": str(e)}), 404


@app.route("/livros/<int:id_livro>", methods=['POST', 'DELETE'])
def deletarLivro(id_livro):
    livro = Livro.query.get(id_livro)
    if not livro:
        raise LivroNaoEncontrado("Livro não encontrado")
    
    db.session.delete(livro)
    db.session.commit()
    
    # Se for POST (form HTML), redireciona para a página de livros
    if request.method == 'POST':
        return redirect(url_for("index"))
    
    # Se for DELETE (API), retorna JSON ou mensagem
    return {'mensagem': 'Livro deletado com sucesso'}
