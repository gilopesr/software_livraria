from config import create_app, db
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
import time

app = create_app()

def wait_for_db(retries=5, delay=3):
    """Espera o banco de dados ficar disponível."""
    for i in range(retries):
        try:
            with app.app_context():
                db.session.execute(text('SELECT 1'))
            print("Banco de dados conectado!")
            return
        except OperationalError:
            print(f"Tentativa {i+1} falhou. Aguardando {delay}s...")
            time.sleep(delay)
    raise Exception("❌ Não foi possível conectar ao banco de dados.")

if __name__ == "__main__":
    
    wait_for_db(retries=6, delay=5)
    
    with app.app_context():
        
        print("\n--- VERIFICAÇÃO DE TABELAS ---")
        try:
            from cliente import clienteModel
            from livro import livroModel
            from autor import autorModel
            print("Importação de modelos tentada com sucesso.")
            
        except ImportError as e:
            print(f"❌ ERRO FATAL DE IMPORTAÇÃO: O SQLAlchemy não conseguiu carregar um ou mais modelos.")
            raise e
  
        tables_to_be_created = db.metadata.tables.keys()
        
        if len(tables_to_be_created) < 3:
            print(f"\n AVISO: Apenas {len(tables_to_be_created)} modelos registrados.")
            print(f"Tabelas registradas: {list(tables_to_be_created)}")
        else:
            print(f" {len(tables_to_be_created)} modelos registrados com sucesso.")
            print(f"Tabelas registradas: {list(tables_to_be_created)}")

        db.create_all()
        print("\n Tentativa de criação de tabelas concluída!")

    app.run(host=app.config["HOST"], port=app.config["PORT"], debug=app.config["DEBUG"])
