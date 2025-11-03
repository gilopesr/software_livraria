import json
from datetime import datetime
from config import db, app
from autor.autorModel import Autor
from livro.livroModel import Livro

# Caminhos dos arquivos JSON
AUTORES_PATH = "dataJson/autores.json"
LIVROS_PATH = "dataJson/livros.json"

def importar_autores():
    with open(AUTORES_PATH, "r", encoding="utf-8") as f:
        autores_data = json.load(f)

    for item in autores_data:
        # Verifica se o autor já existe no banco
        if not Autor.query.filter_by(nome=item["nome"]).first():
            data_nasc = None
            if item.get("dataNasc"):
                data_nasc = datetime.strptime(item["dataNasc"], "%Y-%m-%d").date()

            novo_autor = Autor(
                nome=item["nome"],
                dataNasc=data_nasc
            )
            db.session.add(novo_autor)
    db.session.commit()
    print("✅ Autores importados com sucesso!")


def importar_livros():
    with open(LIVROS_PATH, "r", encoding="utf-8") as f:
        livros_data = json.load(f)

    for item in livros_data:
        autor = Autor.query.filter_by(nome=item["autor"]).first()
        if not autor:
            print(f"⚠️ Autor '{item['autor']}' não encontrado. Pulando livro '{item['titulo']}'.")
            continue

        # Verifica se o livro já existe
        if Livro.query.filter_by(titulo=item["titulo"]).first():
            continue

        novo_livro = Livro(
            titulo=item["titulo"],
            autor_id=autor.id,
            formato=item.get("formato", "Desconhecido"),
            url_img=item.get("url_img"),
            genero=item.get("genero", "Desconhecido"),
            data_lancamento=datetime.strptime(item["data_lancamento"], "%Y-%m-%d").date(),
            preco=float(item["preco"]),
            isbn=str(item["isbn"]),
            destaque=item.get("destaque", False)
        )
        db.session.add(novo_livro)
    db.session.commit()
    print("✅ Livros importados com sucesso!")


if __name__ == "__main__":
    with app.app_context():
        importar_autores()
        importar_livros()
