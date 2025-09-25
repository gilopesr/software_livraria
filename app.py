import os
import time
from config import app, db
from livro import livroRoutes
from autor import autorRoutes
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
from autor.autorModel import Autor
from livro.livroModel import Livro



def wait_for_db(retries=5, delay=3):
    """Tenta se conectar ao DB antes de criar as tabelas"""
    for i in range(retries):
        try:
            with app.app_context():
                db.session.execute(text('SELECT 1'))
            print("Banco de dados conectado!")
            return
        except OperationalError:
            print(f"Tentativa {i+1} falhou. Esperando {delay} segundos...")
            time.sleep(delay)
    raise Exception("Não foi possível conectar ao banco de dados.")

if __name__ == '__main__':
    wait_for_db(retries=10, delay=5)  # espera o MySQL ficar pronto
    with app.app_context():
        db.create_all()
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])
