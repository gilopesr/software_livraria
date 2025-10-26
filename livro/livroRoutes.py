from config import app,db
from flask import jsonify, render_template, request, redirect, url_for
from livro.livroModel import Livro, LivroNaoEncontrado
from autor.autorModel import Autor
from datetime import datetime

@app.route('/')
def index():
    livros_destaque = Livro.query.filter_by(destaque=True).limit(3).all()
    return render_template('index.html', livros_destaque=livros_destaque)
    

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/cadastroClientes')
def cadastroClientes():
    return render_template('cadastroClientes.html')


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
    
@app.route('/livros/formato/<string:formato>',methods=['GET'])
def buscarLivro_formato(formato):
    livros = Livro.query.filter(Livro.formato.ilike(formato)).all()
    
    if livros:
        return render_template('listaLivros.html', livros=livros)
    else:
        return f'Erro: Nenhum livro no formato {formato} foi encontrado", 404'
     
@app.route('/livros/<int:isbn>',methods=['GET'])
def buscarLivro_isbn(isbn):
    livro = Livro.query.filter_by(isbn=isbn).first()
    if livro:
        return render_template('listaLivros.html', livros=[livro])
    else:
        return f'Erro: O livro com ISBN {isbn} não foi encontrado!', 404

@app.route("/cadastrarLivro", defaults={'livro_id': None}, methods=["GET", "POST"])
@app.route("/cadastrarLivro/<int:livro_id>", methods=["GET", "POST"])
def gerenciarLivro(livro_id):



    lista_formato = ["Capa Comum", "Capa Dura", "Ebook", "Audiobook"]
    lista_genero = ["Romance", "Ficção Científica", "Fantasia", "Biografia", "Geek", "Drama"]
    
    livro = None
    if livro_id:
        #buscar o livro para EDIÇÃO/EXCLUSÃO
        livro = Livro.query.get(livro_id)
        if not livro:
            return "Livro não encontrado", 404


    if request.method == "POST":
        action = request.form.get('action') 
        data = request.form

        if action == 'excluir' and livro:
            db.session.delete(livro)
            db.session.commit()
            return redirect(url_for("listarLivros"))

        target_livro = livro if livro else Livro() 
        
        titulo = data.get("titulo")
        autor_id = data.get("autor_id")
        formato_selecionado = data.get("formato")
        genero_selecionado = data.get("genero")
        data_lancamento_str = data.get("data_lancamento")
        preco_str = data.get("preco")
        isbn = data.get('isbn')
        url_img = data.get('url_img')
        
        if not all([titulo, autor_id, formato_selecionado, genero_selecionado, data_lancamento_str, preco_str, isbn, url_img]):
            return "Erro: todos os campos são obrigatórios", 400

        target_livro.titulo = titulo
        target_livro.autor_id = autor_id
        target_livro.formato = formato_selecionado
        target_livro.genero = genero_selecionado
        target_livro.isbn = isbn
        target_livro.url_img = url_img

        try:
            target_livro.data_lancamento = datetime.strptime(data_lancamento_str, "%Y-%m-%d").date()
        except ValueError:
            return "Erro: data_lancamento deve estar no formato YYYY-MM-DD", 400

        try:
            target_livro.preco = float(preco_str)
        except ValueError:
            return "Erro: preço deve ser um número válido", 400
        
        if not livro:
            db.session.add(target_livro) 
            
        db.session.commit()
        return redirect(url_for("listarLivros"))


    autores = Autor.query.all()
    return render_template(
        "cadastrarLivro.html", 
        autores=autores, 
        formatos=lista_formato, 
        generos=lista_genero,
        livro=livro
    )