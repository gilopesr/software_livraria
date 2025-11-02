from config import create_app, db
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
import time

app = create_app()

def wait_for_db(retries=5, delay=3):
    for i in range(retries):
        try:
            with app.app_context():
                db.session.execute(text('SELECT 1'))
            print("✅ Banco de dados conectado!")
            return
        except OperationalError:
            print(f"⚠ Tentativa {i+1} falhou. Aguardando {delay}s...")
            time.sleep(delay)
    raise Exception("❌ Não foi possível conectar ao banco de dados.")

if __name__ == "__main__":
    wait_for_db(retries=10, delay=5)
    with app.app_context():
        db.create_all()
        print("✅ Tabelas criadas!")

    app.run(host=app.config["HOST"], port=app.config["PORT"], debug=app.config["DEBUG"])
