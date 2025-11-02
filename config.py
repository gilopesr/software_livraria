from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    app.secret_key = "uma_chave_super_secreta"
    app.config['HOST'] = '0.0.0.0'
    app.config['PORT'] = 5000
    app.config['DEBUG'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:27052005@mysql_livraria:3306/livraria"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = "chave_secreta"

    db.init_app(app)

    # Registra os blueprints **uma única vez**
    from cliente.clienteRoutes import cliente_bp
    from livro.livroRoutes import livro_bp
    from autor.autorRoutes import autor_bp
    from auth.authRoutes import auth_bp

    app.register_blueprint(cliente_bp)
    app.register_blueprint(livro_bp)
    app.register_blueprint(autor_bp)
    app.register_blueprint(auth_bp)  # login agora é totalmente controlado pelo auth_bp

    # Rota raiz apenas para teste
    @app.route("/")
    def home():
        return "Sistema Livraria está funcionando! 🚀"

    return app
